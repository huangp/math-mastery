/* ============================================================
 * 进度同步插件体检（零依赖）：node plugins/progress/check.js
 * 合并规则单测 + 起一个真 host（临时端口、临时数据目录）走 HTTP 验 API 与落盘。
 * ============================================================ */
const fs = require("fs"), os = require("os"), path = require("path");
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), "mm-pg-"));
Object.assign(process.env, { PLUGINS: "progress", DATA_DIR: DATA });
const { start } = require("../../server/host.js");
const { sanitize, merge, same, hasProgress } = require("./public/merge.js");

let fails = 0;
function ok(cond, msg) { console.log((cond ? "  ok   " : "  FAIL ") + msg); if (!cond) fails++; }
const listen = s => new Promise(r => s.listen(0, "127.0.0.1", () => r("http://127.0.0.1:" + s.address().port)));

async function main() {
  let { server, engine } = await start();
  const T = engine.techniques;
  const [A, B] = T.filter(t => typeof t.qgen === "function");
  const S = T.find(t => typeof t.qgen !== "function");
  const w = (lastTime, extra = {}) => Object.assign({ fails: 1, cleared: false, passes: 0, lastTime, attempts: 1 }, extra);

  console.log("sanitize / merge");
  const junk = JSON.parse(`{"__proto__":{"x":1},"nope":{"mastered":true},"${A.id}":{"mastered":1,"weak":{"${A.id}":{"fails":"2"},"999":{},"abc":{}}}}`);
  const clean = sanitize(junk, T);
  ok(Object.keys(clean).join() === A.id && clean[A.id].mastered === true && Object.keys(clean[A.id].weak).join() === A.id
    && clean[A.id].weak[A.id].fails === 2, "drops __proto__, unknown techniques and bad weak keys; coerces values");
  const x = { [A.id]: { mastered: true, weak: { [A.id]: w(100) } }, [S.id]: { mastered: false, weak: { "0": w(50) } } };
  const y = { [A.id]: { mastered: false, weak: { [A.id]: w(200, { cleared: true }) } }, [B.id]: { mastered: true, weak: {} },
    [S.id]: { mastered: false, weak: { "1": w(10) } } };
  const xy = merge(x, y, T), yx = merge(y, x, T);
  ok(xy[A.id].mastered && xy[B.id].mastered, "mastered is OR'd");
  ok(xy[A.id].weak[A.id].lastTime === 200 && xy[A.id].weak[A.id].cleared, "newer weak entry wins");
  ok(Object.keys(xy[S.id].weak).sort().join() === "0,1", "weak keys are unioned");
  ok(same(xy, yx), "merge is commutative");
  ok(same(merge(xy, y, T), xy) && same(merge(xy, xy, T), xy), "merge is idempotent");
  ok(!hasProgress({ [A.id]: { mastered: false, weak: {} } }) && hasProgress(x), "hasProgress ignores empty shells");

  let base = await listen(server);
  const call = (method, p, body) => fetch(base + "/api/progress/" + p, { method, body: body && JSON.stringify(body) })
    .then(async r => ({ status: r.status, ...(await r.json()) }));

  console.log("API");
  let r = await call("GET", "learners");
  ok(r.learners.length === 0 && r.deleted.length === 0, "empty roster");
  ok((await call("PUT", "learners/BAD-ID", { name: "x" })).status === 400, "bad id → 400");
  ok((await call("PUT", "learners/ann1", {})).status === 400, "new learner needs a name");
  r = await call("PUT", "learners/ann1", { name: "Ann", progress: x });
  ok(r.status === 200 && same(r.progress, sanitize(x, T)), "create Ann with progress");
  r = await call("PUT", "learners/ann1", { progress: { [A.id]: { mastered: false, weak: {} } } });
  ok(r.progress[A.id].mastered === true && r.name === "Ann", "stale push never un-masters; name kept");
  r = await call("PUT", "learners/ann1", { name: "  Annie  ", progress: y });
  ok(r.name === "Annie" && same(r.progress, xy), "rename + merge returns merged progress");
  r = await call("POST", "learners/ann1/reset");
  ok(r.status === 200 && Object.keys(r.progress).length === 0 && r.resetAt > 0, "reset clears and stamps resetAt");
  await call("PUT", "learners/bob1", { name: "Bob", progress: y });
  ok((await call("DELETE", "learners/bob1")).ok, "delete Bob");
  ok((await call("PUT", "learners/bob1", { progress: x })).status === 410, "push to deleted learner → 410");
  ok((await call("DELETE", "learners/never1")).ok, "deleting an unknown id is a no-op");
  r = await call("GET", "learners");
  ok(r.learners.map(l => l.id).join() === "ann1" && r.deleted.join() === "bob1", "GET lists live learners + tombstones");
  ok((await fetch(base + "/plugins/progress/public/merge.js")).status === 200 &&
    (await fetch(base + "/plugins/progress/server.js")).status === 404, "public/ served, server.js not");
  const html = await (await fetch(base + "/")).text();
  ok(html.indexOf("progress/public/merge.js") < html.indexOf("progress/public/client.js") &&
    html.indexOf("progress/public/client.js") < html.indexOf("js/app.js"), "merge.js, client.js injected in order before app.js");

  console.log("persistence");
  await call("PUT", "learners/ann1", { progress: x });
  server.close();
  ({ server } = await start()); base = await listen(server);
  r = await call("GET", "learners");
  ok(r.learners[0].name === "Annie" && same(r.learners[0].progress, sanitize(x, T)) && r.deleted.join() === "bob1", "state survives restart");
  ok(fs.existsSync(path.join(DATA, "progress/learners.json.bak")) && !fs.existsSync(path.join(DATA, "progress/learners.json.tmp")),
    "atomic write keeps .bak, no stray .tmp");
  fs.writeFileSync(path.join(DATA, "progress/learners.json"), "{oops");
  server.close();
  let threw = null; try { await start(); } catch (e) { threw = e; }
  ok(!!threw, "corrupt store refuses to start instead of overwriting");

  fs.rmSync(DATA, { recursive: true, force: true });
  console.log(fails ? `\n${fails} FAILED` : "\nall passed");
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
