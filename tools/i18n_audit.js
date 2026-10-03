/* ============================================================
 * i18n 体检：对比 zh/en 目录，并核对源码里用到的键是否存在
 *   用法：node tools/i18n_audit.js
 * ============================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

global.window = {};
require(path.join(ROOT, "js/i18n/zh.js"));
require(path.join(ROOT, "js/i18n/en.js"));
// 英文目录按 index.html 解析，分文件新增后无需再改这里
[...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="(js\/i18n\/en\.[^"]+)"/g)]
  .map(m => m[1]).forEach(f => {
  try { require(path.join(ROOT, f)); } catch (e) { if (e.code !== "MODULE_NOT_FOUND") throw e; }
});
const ZH = global.window.I18N_ZH, EN = global.window.I18N_EN;

// 源码里出现的字面量键：t("a.b") / T("a.b")
const SRC = ["index.html", "js/i18n.js", "js/app.js", "js/data.js", "js/figures.js", "js/animations.js",
  "js/qgen.js", "js/qgen_junior.js", "js/qgen_high.js", "js/related-projects.js"]
  .filter(f => fs.existsSync(path.join(ROOT, f)));

const used = new Set();      // 静态可确定的键（含 data-i18n 属性与任意字面量命中）
const asked = new Set();     // 明确传给 t()/T() 的字面量键——这些必须存在
const dynamic = [];          // "stage." + s 这类拼接键，只能提示
for (const f of SRC) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")      // 注释里的示例键不算引用
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, "$1");
  // t("a.b") / T("a.b")，且后面不是 + 拼接
  for (const m of src.matchAll(/\b[tT]\(\s*"([^"]+)"\s*(?=[,)])/g)) { asked.add(m[1]); used.add(m[1]); }
  for (const m of src.matchAll(/\b[tT]\(\s*"([^"]*\.)"\s*\+/g)) dynamic.push(f + " → " + m[1] + "*");
  for (const m of src.matchAll(/data-i18n="([^"]+)"/g)) used.add(m[1]);
  // 其余以字面量形式出现的已知键（judgeVocab("ui.judge.yes")、STAGE_DESC 的 sub 等）
  for (const m of src.matchAll(/"([A-Za-z][\w.\u4e00-\u9fff]*\.[\w.\u4e00-\u9fff]+)"/g)) {
    if (m[1] in ZH) used.add(m[1]);
  }
}

const zhKeys = Object.keys(ZH), enKeys = Object.keys(EN);
// tech./q./gen./fig. 等内容键走 tx() 回落中文原文，只需存在于 en
const CONTENT = /^(tech|q|gen|fig|figq|anim|res\.(item|cat))\./;
const missingEn = zhKeys.filter(k => !(k in EN));
const missingZh = enKeys.filter(k => !(k in ZH) && !CONTENT.test(k));
const undefinedKeys = [...asked].filter(k => !(k in ZH) && !(k in EN)).sort();
const unused = zhKeys.filter(k => !used.has(k) && !CONTENT.test(k) &&
  !dynamic.some(d => k.startsWith(d.split("→ ")[1].replace("*", "")))).sort();

const report = (label, arr) => {
  console.log(`${label}: ${arr.length}`);
  arr.slice(0, 40).forEach(k => console.log("  - " + k));
  if (arr.length > 40) console.log(`  … and ${arr.length - 40} more`);
};

console.log(`catalogue: zh=${zhKeys.length} en=${enKeys.length}, literal keys used in source=${used.size}`);
report("missing in en", missingEn);
report("missing in zh", missingZh);
report("used in source but defined nowhere", undefinedKeys);
report("defined but never referenced", unused);
if (dynamic.length) {
  console.log(`dynamic key prefixes (not statically checkable): ${dynamic.length}`);
  [...new Set(dynamic)].forEach(d => console.log("  - " + d));
}

const bad = missingEn.length + missingZh.length + undefinedKeys.length;
console.log(bad ? `\nFAIL: ${bad} problem(s)` : "\nOK: catalogues aligned");
process.exit(bad ? 1 : 0);
