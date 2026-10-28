/* ============================================================
 * 屏幕时间插件体检（零依赖）：node plugins/screentime/check.js
 * 起一个真 host（临时端口 + 临时数据目录 + 测试密钥），走 HTTP 把计分、防作弊、账本重放、
 * 静态白名单逐条验一遍。时钟用 Date.now 偏移伪造，不用真等。
 * ============================================================ */
const fs = require("fs"), os = require("os"), path = require("path");
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), "mm-st-"));
Object.assign(process.env, { PLUGINS: "screentime", CODE_SECRET: "check-secret", KIDS: "amelia,jayden", DAILY_CAP: "30", DATA_DIR: DATA });
const { start } = require("../../server/host.js");

let skew = 0; const realNow = Date.now; Date.now = () => realNow() + skew;
let fails = 0;
function ok(cond, msg) { console.log((cond ? "  ok   " : "  FAIL ") + msg); if (!cond) fails++; }

async function main() {
  const { sign } = await import("./vendor/screentimeCode.js");
  let { server, engine } = await start();
  let base = await listen(server);

  const get = p => fetch(base + p).then(async r => ({ status: r.status, text: await r.text() }));
  const post = (p, b) => fetch(base + "/api/screentime/" + p, { method: "POST", body: JSON.stringify(b) })
    .then(async r => ({ status: r.status, ...(await r.json()) }));

  // 生成题技巧：凑一组 8 道互不重复的题，返回 items + 正确作答
  const gens = engine.techniques.filter(t => typeof t.qgen === "function" && t.stage === "小学");
  function round(t, seed = 1) {
    for (; ; seed++) {
      const items = [...Array(8)].map((_, i) => ({ techId: t.id, src: { seed, i, n: 8 } }));
      const qs = items.map(it => engine.question(t.id, it, "zh"));
      const fps = new Set(qs.map(q => q.q.replace(/\s+/g, "") + " " + q.opts[q.ans]));
      if (fps.size === 8) return { items, picks: qs.map(q => q.ans), qs };
    }
  }
  async function attempt(t, kid, r, secs, extra = {}) {
    const { attemptId } = await post("start", { techId: t.id });
    skew += secs * 1000;
    return post("submit", { attemptId, kid, lang: "zh", items: r.items, picks: r.picks, ...extra });
  }
  const [A, B, C, D] = gens;

  console.log("static whitelist");
  for (const p of ["/server/host.js", "/plugins/screentime/server.js", "/plugins/screentime/credit.env",
    "/plugins/screentime/vendor/screentimeCode.js", "/data/screentime/ledger.jsonl", "/%2e%2e/package.json", "/CLAUDE.md"])
    ok((await get(p)).status === 404, "404 " + p);
  ok((await get("/plugins/screentime/public/client.js")).status === 200, "200 plugin client.js");
  const idx = await get("/");
  ok(idx.text.includes('src="plugins/screentime/public/client.js"') && idx.text.indexOf("client.js") < idx.text.indexOf("js/app.js") && idx.text.includes('href="plugins/screentime/public/client.css"'),
    "index.html gets client.css + client.js (before app.js) injected");
  ok(!fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8").includes("plugins/"), "index.html on disk untouched");
  ok((await get("/api/screentime/kids")).text === '{"kids":["amelia","jayden"]}', "kids list");

  console.log("grading & formula (DAILY_CAP=30)");
  const rA = round(A);
  let r = await attempt(A, "nobody", rA, 300);
  ok(r.status === 400 && /kid/.test(r.error), "unknown kid → 400");
  r = await attempt(A, "jayden", rA, 10);
  ok(r.minutes === 0 && r.reason === "too_fast" && r.pass, "too fast → 0 (" + r.seconds + "s)");
  const { attemptId } = await post("start", { techId: A.id });
  skew += 300e3;
  r = await post("submit", { attemptId, kid: "jayden", lang: "zh", items: rA.items, picks: rA.picks });
  ok(r.minutes === 12 && r.breakdown.bonus === 6 && r.pass, "honest 8/8 first pass, 小学 → 6 + 6 bonus = 12 (got " + r.minutes + ")");
  const [m, nonce, sig] = r.code.split("-");
  ok(+m === 12 && sig === sign("check-secret", "jayden", 12, nonce), "code signature verifies: " + r.code);
  ok(r.claimUrl === "http://screentime.lan/claim?kid=jayden&code=" + r.code, "claim url");
  r = await post("submit", { attemptId, kid: "jayden", lang: "zh", items: rA.items, picks: rA.picks });
  ok(r.status === 400, "reused attemptId → 400");
  r = await attempt(A, "jayden", { items: rA.items, picks: rA.qs.map(q => (q.ans + 1) % q.opts.length) }, 300);
  ok(r.correct === 0 && !r.pass && r.minutes === 2, "all wrong → graded 0/8, floor credit 2 (got " + r.minutes + ")");
  r = await attempt(A, "jayden", rA, 300);
  ok(r.minutes === 0 && r.reason === "attempts", "4th attempt on same lesson today → 0");

  const dup = round(B); dup.items[1] = dup.items[0]; dup.picks[1] = dup.picks[0];
  r = await attempt(B, "jayden", dup, 300);
  ok(r.status === 400, "duplicated question → 400");
  r = await attempt(B, "jayden", round(C), 300);
  ok(r.status === 400, "questions from another lesson → 400");
  const short = round(B); short.items.pop(); short.picks.pop();
  r = await attempt(B, "jayden", short, 300);
  ok(r.status === 400, "short round → 400");

  r = await attempt(B, "jayden", round(B), 300);
  ok(r.minutes === 12 && r.spentToday === 26, "lesson B first pass → 12, today 26");
  r = await attempt(C, "jayden", round(C), 300);
  ok(r.minutes === 4 && r.breakdown.capped && r.spentToday === 30, "lesson C clipped to daily cap → 4");
  r = await attempt(D, "jayden", round(D), 300);
  ok(r.minutes === 0 && r.reason === "cap" && !r.code, "cap reached → 0, no code");
  r = await attempt(D, "amelia", round(D), 120);
  ok(r.minutes === 9, "cap is per kid; half effort (120s/240s) → round(6×1×0.5)+6 = 9 (got " + r.minutes + ")");

  const S = engine.techniques.find(t => typeof t.qgen !== "function");
  const sq = S.questions.map((_, i) => i).slice(0, Math.max(Math.min(5, S.questions.length), 1));
  r = await attempt(S, "amelia", { items: sq.map(i => ({ techId: S.id, qidx: i })), picks: sq.map(i => S.questions[i].ans) }, 600);
  const sb = { "小学": 6, "中学": 8, "高中": 10 }[S.stage];
  ok(r.minutes === 2 * sb && r.correct === sq.length, `static lesson ${S.id} (${S.stage}) full marks → ${2 * sb} (got ${r.minutes})`);

  console.log("ledger replay after restart (DAILY_CAP=100)");
  server.close();
  process.env.DAILY_CAP = "100";
  ({ server } = await start()); base = await listen(server);
  r = await attempt(B, "jayden", round(B, 50), 300);
  ok(r.minutes === 6 && r.breakdown.bonus === 0 && r.spentToday === 36, "mastery remembered: no 2nd bonus; today's total survives restart (got " + r.minutes + ", " + r.spentToday + ")");
  const rows = fs.readFileSync(path.join(DATA, "screentime/ledger.jsonl"), "utf8").trim().split("\n");
  ok(rows.length === 10, "ledger has one row per graded attempt (" + rows.length + ")");

  server.close();
  fs.rmSync(DATA, { recursive: true, force: true });
  console.log(fails ? `\n${fails} FAILED` : "\nall passed");
  process.exit(fails ? 1 : 0);
}

function listen(server) {
  return new Promise(res => server.listen(0, "127.0.0.1", () => res("http://127.0.0.1:" + server.address().port)));
}
main().catch(e => { console.error(e); process.exit(1); });
