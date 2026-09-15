/* 校验内容型译文键：id 是否存在、step 下标是否越界、哪些技巧还没翻 */
const path = require("path");
const ROOT = path.join(__dirname, "..");
global.window = {};
require(path.join(ROOT, "js/data.js"));
const T = global.window.TECHNIQUES;
["js/i18n/en.js", "js/i18n/en.tech.js", "js/i18n/en.q.js", "js/i18n/en.gen.js", "js/i18n/en.fig.js"].forEach(f => {
  try { require(path.join(ROOT, f)); } catch (e) { if (e.code !== "MODULE_NOT_FOUND") throw e; }
});
const EN = global.window.I18N_EN || {};

const byId = Object.fromEntries(T.map(t => [t.id, t]));
const bad = [], missing = [];
for (const k of Object.keys(EN)) {
  const m = /^tech\.([^.]+)\.(name|summary|kou|step\.(\d+))$/.exec(k);
  if (!m) continue;
  const t = byId[m[1]];
  if (!t) { bad.push(k + "  (no such technique id)"); continue; }
  if (m[3] !== undefined && +m[3] >= t.steps.length) bad.push(k + `  (only ${t.steps.length} steps)`);
}
for (const t of T) {
  const want = ["name", "summary", "kou", ...t.steps.map((_, i) => "step." + i)];
  const gone = want.filter(f => !(("tech." + t.id + "." + f) in EN));
  if (gone.length) missing.push(`${t.id} (${t.grade}) → ${gone.join(", ")}`);
}
// ---- 静态题：只有没有 qgen 的技巧会真正渲染 ----
const fs2 = require("fs");
const gen = new Set();
for (const f of ["qgen", "qgen_junior", "qgen_high"]) {
  const src = fs2.readFileSync(path.join(ROOT, "js/" + f + ".js"), "utf8");
  const m = /const GEN = \{([\s\S]*?)\};/.exec(src);
  for (const x of m[1].matchAll(/(\w+)\s*:/g)) gen.add(x[1]);
}
const CJK = /[\u4e00-\u9fff]/;
const qMissing = [], qDup = [];
for (const k of Object.keys(EN)) {
  const m = /^q\.([^.]+)\.(\d+)\.(q|explain|point|opt\.(\d+))$/.exec(k);
  if (!m) continue;
  const t = byId[m[1]];
  if (!t) { bad.push(k + "  (no such technique id)"); continue; }
  const q = t.questions[+m[2]];
  if (!q) { bad.push(k + `  (only ${t.questions.length} questions)`); continue; }
  if (m[4] !== undefined && +m[4] >= q.opts.length) bad.push(k + `  (only ${q.opts.length} options)`);
}
// 上游 f944354 给学习页加了「典型例题」区块，覆盖全部方法：
// 静态题不再只有无 qgen 的技巧才显示，127 个方法的题都会渲染，全部都要有译文。
for (const t of T) {
  t.questions.forEach((q, i) => {
    const base = "q." + t.id + "." + i;
    const gone = ["q", "explain", "point"].filter(f => !((base + "." + f) in EN));
    // 数字型选项无需翻译；仅带中文的选项必须有译文
    q.opts.forEach((o, j) => { if (CJK.test(String(o)) && !((base + ".opt." + j) in EN)) gone.push("opt." + j); });
    if (gone.length) qMissing.push(`${t.id}#${i} → ${gone.join(", ")}`);
    // 译文若把两个选项压成同一个字符串，页面会出现重复选项
    const shown = q.opts.map((o, j) => EN[base + ".opt." + j] !== undefined ? EN[base + ".opt." + j] : String(o));
    if (new Set(shown).size !== shown.length) qDup.push(`${t.id}#${i} → ${JSON.stringify(shown)}`);
  });
}
const liveQ = T.reduce((s, t) => s + t.questions.length, 0);
console.log(`worked-example questions: ${liveQ - qMissing.length}/${liveQ} translated`);
if (qMissing.length) { console.log("questions missing text:", qMissing.length); qMissing.forEach(x => console.log("  - " + x)); }
if (qDup.length) { console.log("DUPLICATE options after translation:", qDup.length); qDup.forEach(x => console.log("  ! " + x)); }
bad.push(...qDup.map(x => "duplicate options " + x));

console.log("invalid keys:", bad.length); bad.forEach(b => console.log("  ! " + b));
console.log(`techniques fully translated: ${T.length - missing.length}/${T.length}`);
console.log("still missing:", missing.length);
missing.forEach(m => console.log("  - " + m));
process.exit(bad.length ? 1 : 0);
