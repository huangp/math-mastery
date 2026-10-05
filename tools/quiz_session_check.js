/* ============================================================
 * 测验会话体检：离开再回来 / 切换语言 / 换学员 都不丢进度，通关线按「≥80%，可错 1 题」
 *   用法：NODE_PATH=<装了 jsdom 的目录> node tools/quiz_session_check.js
 * ============================================================ */
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const FILES = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  .matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

// 播种：一个学员、全部技巧已掌握（于是全部解锁），语言中文
function boot() {
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"),
    { url: "http://localhost/#/path", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.localStorage.setItem("mathMastery.lang", "zh");
  w.localStorage.setItem("mathMastery.profiles", JSON.stringify({ active: "a", list: [{ id: "a", name: "Ann", created: 1 }, { id: "b", name: "Bob", created: 2 }] }));
  for (const f of FILES) w.eval(fs.readFileSync(path.join(ROOT, f), "utf8"));
  const all = {}; w.TECHNIQUES.forEach(t => all[t.id] = { mastered: true, weak: {} });
  w.localStorage.setItem("mathMastery.v1.a", JSON.stringify(all));
  w.localStorage.setItem("mathMastery.v1.b", JSON.stringify(all));
  // 进度在启动时读入，写完后切一次学员让应用重读
  pick(w, "b"); pick(w, "a");
  return w;
}
function pick(w, id) { const s = w.document.getElementById("profileSel"); s.value = id; s.dispatchEvent(new w.Event("change", { bubbles: true })); }
function go(w, hash) { w.location.hash = hash; w.dispatchEvent(new w.Event("hashchange")); }
const cards = w => [...w.document.querySelectorAll(".q")];
const stem = c => c.querySelector(".qtext").textContent.replace(/^\d+\.\s*/, "");
const digits = c => (stem(c).match(/\d+(\.\d+)?/g) || []).join(",");
const marks = c => [...c.querySelectorAll(".opt")].map(o => o.classList.contains("correct") ? "C" : o.classList.contains("wrong") ? "W" : "-").join("");
const banner = w => { const b = w.document.querySelector(".card.center .qres"); return b ? b.textContent : ""; };
const progress = w => JSON.parse(w.localStorage.getItem("mathMastery.v1." + JSON.parse(w.localStorage.getItem("mathMastery.profiles")).active));

// 静态题（中文模式）：按题面找回原题，点对或点错
function answerStatic(w, tid, card, right) {
  const t = w.TECHNIQUES.find(x => x.id === tid);
  const q = t.questions.find(x => stem(card).startsWith(x.q));
  const good = String(q.opts[q.ans]);
  const opts = [...card.querySelectorAll(".opt")];
  const target = opts.find(o => (o.querySelectorAll("span")[1].textContent === good) === right);
  target.click();
}

let failed = 0;
const ok = (label, cond, extra) => { console.log((cond ? "  PASS  " : "  FAIL  ") + label + (cond ? "" : "  → " + extra)); if (!cond) failed++; };

/* 1. 生成题通关测试：做一半离开，再回来继续 */
console.log("1. generated gate survives navigation");
let w = boot();
go(w, "#/gate/chicken");
const before = cards(w).map(stem);
ok("8 questions", before.length === 8, before.length);
cards(w).slice(0, 3).forEach(c => c.querySelector(".opt").click());
const marksBefore = cards(w).map(marks);
go(w, "#/review"); go(w, "#/gate/chicken");
ok("same questions after coming back", JSON.stringify(cards(w).map(stem)) === JSON.stringify(before), cards(w).map(stem)[0]);
ok("answered cards stay answered", cards(w).filter(c => c.dataset.done === "1").length === 3, cards(w).filter(c => c.dataset.done === "1").length);
ok("marks / option order identical", JSON.stringify(cards(w).map(marks)) === JSON.stringify(marksBefore), cards(w).map(marks));

/* 2. 切换语言：同一组题换成英文，数字不变，作答保留 */
console.log("\n2. language toggle keeps the same questions");
const zhDigits = cards(w).map(digits);
w.document.getElementById("langBtn").click();
ok("language is now en", w.I18N.lang === "en", w.I18N.lang);
ok("stems are now English", cards(w).every(c => !/[一-鿿]/.test(stem(c))), stem(cards(w)[0]));
const enDigits = cards(w).map(digits);
ok("numbers in every stem unchanged", JSON.stringify(enDigits) === JSON.stringify(zhDigits), JSON.stringify({ zhDigits, enDigits }));
ok("answers and option order kept", JSON.stringify(cards(w).map(marks)) === JSON.stringify(marksBefore), cards(w).map(marks));
w.document.getElementById("langBtn").click();
ok("back to zh: identical Chinese stems", JSON.stringify(cards(w).map(stem)) === JSON.stringify(before), cards(w).map(stem)[0]);
// 做完余下 5 题，结果在离开再回来后仍在
cards(w).slice(3).forEach(c => c.querySelector(".opt").click());
const res = banner(w);
ok("result banner shown on finish", !!res, "none");
go(w, "#/path"); go(w, "#/gate/chicken");
ok("finished result is still shown after coming back", banner(w) === res, banner(w));

/* 3. 换学员：各自的会话互不串 */
console.log("\n3. sessions are per learner");
go(w, "#/gate/chicken"); const annStems = cards(w).map(stem);
pick(w, "b"); go(w, "#/gate/chicken");
ok("Bob gets a fresh, unanswered test", cards(w).every(c => c.dataset.done === "0"), cards(w).map(c => c.dataset.done).join(""));
pick(w, "a"); go(w, "#/gate/chicken");
ok("Ann gets her own test back", JSON.stringify(cards(w).map(stem)) === JSON.stringify(annStems), "different");

/* 4. 通关线：静态题 4 题错 1 题通过，错 2 题不通过；再测一次开新会话 */
console.log("\n4. pass rule on a 4-question static technique");
w = boot();
go(w, "#/gate/stats");
ok("stats gate has 4 questions", cards(w).length === 4, cards(w).length);
cards(w).forEach((c, i) => answerStatic(w, "stats", c, i !== 0));
ok("3/4 passes", w.document.querySelector(".card.center .qres[style*='--ok']") !== null, banner(w));
ok("the miss is still logged as a weak spot", Object.values(progress(w).stats.weak).filter(x => !x.cleared).length === 1, JSON.stringify(progress(w).stats.weak));

w = boot();
go(w, "#/gate/stats");
cards(w).forEach((c, i) => answerStatic(w, "stats", c, i > 1));
ok("2/4 fails", w.document.querySelector(".card.center .qres[style*='--warn']") !== null, banner(w));
const retake = w.document.getElementById("retakeBtn");
ok("fail banner offers a retake", !!retake, "no button");
retake.click();
ok("retake starts a fresh, unanswered test", cards(w).length === 4 && cards(w).every(c => c.dataset.done === "0") && !banner(w), banner(w));

/* 5. 全部生成器：同一种子在两种语言下出的题必须是「同一道」（切换语言靠这一点重放）。
 *    已知个别生成器会因选项去重结果不同而分叉（中文「20个」不补第 4 个选项、英文「20」会补），
 *    分叉之后 app.js 的 sameQuestion 会拒收、保留原语言题面；这里要求：没分叉的批次一道都不被拒收。 */
console.log("\n5. every generator replays identically across languages");
const lite = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"),
  { url: "http://localhost/", runScripts: "outside-only", pretendToBeVisual: true }).window;
for (const f of FILES.filter(f => !/app\.js$/.test(f))) lite.eval(fs.readFileSync(path.join(ROOT, f), "utf8")); // 不加载 app.js：切语言不触发重绘
const seeded = (t, seed) => { // 与 app.js 的 withSeed 同一算法
  const orig = lite.Math.random; let a = seed >>> 0;
  lite.Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  try { return t.qgen(8); } finally { lite.Math.random = orig; }
};
// 与 app.js 的 sameQuestion 同一判定
const numsOf = s => (String(s).replace(/[₀-₉]/g, c => c.charCodeAt(0) - 0x2080)
  .replace(/[⁰¹²³⁴-⁹]/g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).match(/\d+(\.\d+)?/g) || []).sort().join();
const sameQuestion = (a, b) => a.ans === b.ans && a.opts.length === b.opts.length &&
  (numsOf(a.q) === numsOf(b.q) || a.opts.every((o, i) => numsOf(o) === numsOf(b.opts[i])));
let checked = 0, rejected = 0; const falseAlarms = new Set(), forked = new Set();
lite.TECHNIQUES.filter(t => typeof t.qgen === "function").forEach(t => {
  for (let seed = 1; seed <= 20; seed++) {
    lite.I18N.setLang("zh"); const zh = seeded(t, seed);
    lite.I18N.setLang("en"); const en = seeded(t, seed);
    let fork = false;
    zh.forEach((q, i) => {
      checked++;
      if (q.opts.length !== en[i].opts.length) fork = true;   // 从这里起随机序列分叉
      if (!sameQuestion(q, en[i])) { rejected++; if (fork) forked.add(t.id); else falseAlarms.add(t.id); }
    });
  }
});
console.log("        " + checked + " questions, " + rejected + " replays rejected (forked generators: " + ([...forked].join(" ") || "none") + ")");
ok("no rejected replay outside a forked batch", !falseAlarms.size, [...falseAlarms].join(" "));

console.log("\n" + (failed ? failed + " check(s) FAILED" : "all checks passed"));
process.exit(failed ? 1 : 0);
