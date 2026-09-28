/* ============================================================
 * 出题引擎体检：每个 qgen 在每种语言下跑 N 轮，检查
 *   - 4 个选项互不相同（译文把两个选项压成同一句时会暴露）
 *   - ans 下标合法
 *   - 题干/解析非空、不残留 {占位符}
 *   - 英文模式下题干/解析不应再出现中文（未接目录的会被点名）
 * 用法：node tools/gen_check.js [轮数]   需要 jsdom（见 NODE_PATH）
 * ============================================================ */
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const ROUNDS = +process.argv[2] || 60;

const dom = new JSDOM("<!doctype html><body>", { url: "http://localhost/", runScripts: "outside-only" });
const w = dom.window;
// 脚本清单直接取自 index.html：写死清单会漏掉新增文件
// （此前就漏了 js/qgen_elementary_extra.js，28 个生成器完全没被检查到）
const INDEX = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
[...INDEX.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1])
  .filter(f => !/app\.js$|related-projects/.test(f))   // app.js 需要 DOM，这里只跑出题引擎
  .forEach(f => {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) w.eval(fs.readFileSync(p, "utf8"));
  });

const CJK = /[一-鿿]/;
const gens = w.TECHNIQUES.filter(t => typeof t.qgen === "function");
const stats = {};   // stats[lang][id] = {dup, badAns, empty, ph, cjk, threw}

// 两种语言必须跑在同一串随机数上，否则 dup 之类的差异只是抽样噪声
function seedRandom(seed) {
  let x = seed >>> 0;
  w.Math.random = function () {
    x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0;
    return x / 4294967296;
  };
}

for (const lang of ["zh", "en"]) {
  w.I18N.setLang(lang);
  stats[lang] = {};
  for (const t of gens) {
    const s = stats[lang][t.id] = { dup: 0, badAns: 0, empty: 0, ph: 0, cjk: 0, threw: 0 };
    seedRandom(12345);
    for (let r = 0; r < ROUNDS; r++) {
      let batch;
      try { batch = t.qgen(4); } catch (e) { s.threw++; s.msg = e.message; break; }
      for (const q of batch || []) {
        if (!q || !q.opts) { s.empty++; continue; }
        if (new Set(q.opts.map(String)).size !== q.opts.length) s.dup++;
        if (!(q.ans >= 0 && q.ans < q.opts.length)) s.badAns++;
        if (!q.q || !q.explain) s.empty++;
        // 花括号：数学记号里本来就有 {a_n}，故只与中文基线比较
        if (/\{\w+\}/.test(String(q.q) + String(q.explain))) s.ph++;
        if (CJK.test(String(q.q || "")) || CJK.test(String(q.explain || ""))) s.cjk++;
      }
    }
  }
}

// 回归 = 英文比中文基线更差；中文自身的问题是改造前就有的
const regressions = [], preexisting = [], notWired = [];
for (const t of gens) {
  const z = stats.zh[t.id], e = stats.en[t.id];
  const worse = ["dup", "badAns", "empty", "ph", "threw"]
    .filter(k => e[k] > z[k]).map(k => `${k} ${z[k]}→${e[k]}`);
  if (worse.length) regressions.push(`${t.id}: ${worse.join(", ")}`);
  const zbad = ["dup", "badAns", "empty", "threw"].filter(k => z[k] > 0).map(k => `${k}=${z[k]}`);
  if (zbad.length) preexisting.push(`${t.id}: ${zbad.join(" ")}${z.msg ? " — " + z.msg : ""}`);
  if (e.cjk > 0) notWired.push(`${t.id} (${e.cjk})`);
}

console.log(`generators: ${gens.length}, ${ROUNDS} rounds each per language\n`);
console.log(`REGRESSIONS caused by translation: ${regressions.length}`);
regressions.forEach(p => console.log("  ! " + p));
console.log(`\npre-existing issues, also present in Chinese: ${preexisting.length}`);
preexisting.forEach(p => console.log("  ~ " + p));
console.log(`\nnot yet wired to the catalogue (still Chinese in English): ${notWired.length}/${gens.length}`);
if (notWired.length) console.log("  " + notWired.join(", "));
process.exit(regressions.length ? 1 : 0);
