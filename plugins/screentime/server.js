/* ============================================================
 * 屏幕时间插件（服务端）：通关测试后按「难度 × 正确率 × 用时」发放屏幕时间兑换码。
 *
 * 浏览器什么都不决定：start 记下服务器时间，submit 时用出题引擎按种子/题号重放判分，
 * 再用 CODE_SECRET 签出 screentime 兑换码（vendor/screentimeCode.js，与 home-network-ctrl 同源）。
 * 密钥只在本进程环境变量里，绝不下发到前端。
 *
 * env: CODE_SECRET（= /etc/screentime/web.yaml 的 code_secret，必填）
 *      KIDS=amelia,jayden（screentime 的 pool 名，必填）  DAILY_CAP=45  TZ=按本地日切换「今天」
 * ============================================================ */
const fs = require("fs"), path = require("path"), crypto = require("crypto");

/* ---- 计分（混合制）----
 * minutes = round(BASE[学段] × max(SCORE_FLOOR, 正确率) × 用时系数) + 首次通关奖励（= BASE）
 * 用时系数 = min(1, 秒数 / (题数 × FULL_EFFORT_S))；低于 题数 × MIN_S_PER_Q 视为乱点，记 0 */
const BASE = { "小学": 6, "中学": 8, "高中": 10 };
const SCORE_FLOOR = 0.3;          // 没通过也有分：认真做完至少拿三成
const FULL_EFFORT_S = 30;         // 每题 30 秒算用满力
const MIN_S_PER_Q = 8;            // 每题不到 8 秒 = 乱点
const MAX_ATTEMPTS_PER_DAY = 3;   // 同一技巧每天最多计 3 次
const GEN_ROUND = 8;              // 生成题一组 8 道（app.js genRound）
const ATTEMPT_TTL_MS = 2 * 3600 * 1000;
const MAX_OPEN_ATTEMPTS = 500;

async function init({ engine, dataDir, env, json, readJson }) {
  const { makeCode, claimUrl } = await import("./vendor/screentimeCode.js");
  const SECRET = env.CODE_SECRET;
  const KIDS = (env.KIDS || "").split(",").map(s => s.trim()).filter(Boolean);
  const DAILY_CAP = env.DAILY_CAP ? +env.DAILY_CAP : 45;
  if (!SECRET || SECRET === "CHANGE_ME") throw new Error("screentime: CODE_SECRET is not set");
  if (!KIDS.length) throw new Error("screentime: KIDS is not set");
  if (!(DAILY_CAP > 0)) throw new Error("screentime: DAILY_CAP must be > 0");
  // 时区写错时 Node 会悄悄退回 UTC，「今天」就和 screentime 的午夜错开了——宁可起不来
  if (env.TZ) { try { new Intl.DateTimeFormat("en", { timeZone: env.TZ }); } catch (e) { throw new Error("screentime: bad TZ " + env.TZ); } }
  // 与 screentime 的 README 测试向量对齐：签名算法一旦漂移，发出去的码全兑不了
  if (makeCode("test-secret", "jayden", 15, "ABCDEF") !== "15-ABCDEF-YB4NJCA4") throw new Error("screentime: code test vector mismatch");

  const LEDGER = path.join(dataDir, "ledger.jsonl");
  const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD，按进程 TZ

  /* ---- 账本：只追加；启动时重放，重建「今日已发 / 今日次数 / 已领过首通奖励」 ---- */
  const spent = {}, tries = {}, mastered = new Set();
  function account(r) {
    if (r.day === today()) {
      spent[r.kid] = (spent[r.kid] || 0) + r.minutes;
      const k = r.kid + "|" + r.techId; tries[k] = (tries[k] || 0) + 1;
    }
    if (r.bonus > 0) mastered.add(r.kid + "|" + r.techId);
  }
  let ledgerDay = today();
  function rollDay() { // 跨过午夜：今日计数清零（首通集合跨天保留）
    if (ledgerDay === today()) return;
    ledgerDay = today();
    for (const k in spent) delete spent[k];
    for (const k in tries) delete tries[k];
  }
  if (fs.existsSync(LEDGER)) {
    for (const line of fs.readFileSync(LEDGER, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try { account(JSON.parse(line)); } catch (e) { console.error("screentime: bad ledger line skipped"); }
    }
  }

  const attempts = new Map(); // attemptId → { techId, started, used }
  function sweep() {
    const now = Date.now();
    for (const [id, a] of attempts) if (a.used || now - a.started > ATTEMPT_TTL_MS) attempts.delete(id);
  }

  // 校验并判分；返回 { correct, total } 或 { error }
  function grade(t, lang, items, picks) {
    if (!Array.isArray(items) || !Array.isArray(picks) || items.length !== picks.length) return { error: "bad round" };
    if (items.some(it => !it || it.techId !== t.id)) return { error: "bad round" };
    const gen = typeof t.qgen === "function";
    if (gen) {
      if (items.length !== GEN_ROUND || items.some(it => !it.src)) return { error: "bad round" };
    } else {
      const idx = items.map(it => it.qidx);
      if (idx.some(i => !Number.isInteger(i)) || new Set(idx).size !== idx.length) return { error: "bad round" };
      if (items.length < Math.min(5, t.questions.length) || items.length > t.questions.length) return { error: "bad round" };
    }
    const seen = new Set();
    let correct = 0;
    for (let k = 0; k < items.length; k++) {
      const q = engine.question(t.id, gen ? { src: items[k].src } : { qidx: items[k].qidx }, lang);
      if (!q || !Array.isArray(q.opts)) return { error: "bad round" };
      // 同一道题不能凑数：指纹与 app.js quizFP 同法（题面去空白 + 正确项文字）
      const fp = String(q.q || "").replace(/\s+/g, "") + " " + String(q.opts[q.ans]);
      if (seen.has(fp)) return { error: "bad round" };
      seen.add(fp);
      if (picks[k] === q.ans) correct++;
    }
    return { correct, total: items.length };
  }

  return async function handler(req, res, sub) {
    rollDay();
    if (sub === "kids" && req.method === "GET") return json(res, 200, { kids: KIDS });
    if (req.method !== "POST") return json(res, 404, { error: "not found" });
    let body;
    try { body = await readJson(req); } catch (e) { return json(res, 400, { error: "bad json" }); }

    if (sub === "start") {
      const t = engine.tech(body.techId);
      if (!t) return json(res, 400, { error: "unknown technique" });
      sweep();
      if (attempts.size >= MAX_OPEN_ATTEMPTS) return json(res, 429, { error: "too many attempts" });
      const attemptId = crypto.randomBytes(16).toString("hex");
      attempts.set(attemptId, { techId: t.id, started: Date.now(), used: false });
      return json(res, 200, { attemptId });
    }

    if (sub === "submit") {
      const a = attempts.get(body.attemptId);
      if (!a || a.used || Date.now() - a.started > ATTEMPT_TTL_MS) return json(res, 400, { error: "attempt expired or already claimed" });
      if (!KIDS.includes(body.kid)) return json(res, 400, { error: "unknown kid" });
      const t = engine.tech(a.techId);
      const lang = body.lang === "en" ? "en" : "zh";
      a.used = true; // 先作废：无论成败，一次测验只能提交一次，防止反复试探
      const g = grade(t, lang, body.items, body.picks);
      if (g.error) return json(res, 400, { error: g.error });

      const seconds = Math.round((Date.now() - a.started) / 1000);
      const { correct, total } = g;
      const need = Math.max(1, Math.min(Math.ceil(total * 0.8), total - 1)); // 与 app.js 通关线一致
      const pass = correct >= need;
      const base = BASE[t.stage] || BASE["小学"];
      const score = Math.max(SCORE_FLOOR, correct / total);
      const effort = seconds < total * MIN_S_PER_Q ? 0 : Math.min(1, seconds / (total * FULL_EFFORT_S));
      const key = body.kid + "|" + t.id;
      let reason = null;
      let earned = Math.round(base * score * effort);
      let bonus = pass && effort > 0 && !mastered.has(key) ? base : 0;
      if (effort === 0) reason = "too_fast";
      if ((tries[key] || 0) >= MAX_ATTEMPTS_PER_DAY) { earned = 0; bonus = 0; reason = "attempts"; }
      let minutes = earned + bonus;
      const room = Math.max(0, DAILY_CAP - (spent[body.kid] || 0));
      const capped = minutes > room;
      if (capped) { minutes = room; if (!minutes) reason = "cap"; }
      if (!minutes) bonus = 0; // 一分没发出去，首通奖励留到下次

      let code = null;
      if (minutes > 0) code = makeCode(SECRET, body.kid, minutes);
      const row = { ts: new Date().toISOString(), day: today(), kid: body.kid, techId: t.id, lang, correct, total, pass,
        seconds, minutes, bonus, nonce: code ? code.split("-")[1] : null };
      fs.appendFileSync(LEDGER, JSON.stringify(row) + "\n");
      account(row);
      return json(res, 200, {
        correct, total, pass, seconds, minutes, reason,
        breakdown: { base, score: +score.toFixed(2), effort: +effort.toFixed(2), bonus, capped },
        spentToday: spent[body.kid] || 0, dailyCap: DAILY_CAP,
        code, claimUrl: code ? claimUrl(body.kid, code) : null
      });
    }
    return json(res, 404, { error: "not found" });
  };
}

module.exports = { init };
