/* ============================================================
 * 中文出题快照：译文改造必须保证中文模式输出逐字不变
 *   - 每个 qgen 用固定种子在中文模式下出 20 题，存成 JSON
 *   用法：node tools/zh_snapshot.js > base.json
 *         node tools/zh_snapshot.js --diff base.json [id1,id2]
 *   需要 jsdom（见 NODE_PATH）
 * ============================================================ */
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");

const dom = new JSDOM("<!doctype html><body>", { url: "http://localhost/", runScripts: "outside-only" });
const w = dom.window;
[...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="([^"]+)"/g)]
  .map(m => m[1]).filter(f => !/app\.js$/.test(f))
  .forEach(f => w.eval(fs.readFileSync(path.join(ROOT, f), "utf8")));
w.I18N.setLang("zh");

// 与 gen_check 同一个 xorshift，保证每次跑出同一串题
function seedRandom(seed) {
  let x = seed >>> 0;
  w.Math.random = function () {
    x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0;
    return x / 4294967296;
  };
}

const snap = {};
for (const t of w.TECHNIQUES.filter(t => typeof t.qgen === "function")) {
  seedRandom(12345);
  try { snap[t.id] = JSON.parse(JSON.stringify(t.qgen(20))); }
  catch (e) { snap[t.id] = { threw: e.message }; }
}

const di = process.argv.indexOf("--diff");
if (di < 0) { process.stdout.write(JSON.stringify(snap)); process.exit(0); }

const base = JSON.parse(fs.readFileSync(process.argv[di + 1], "utf8"));
const only = process.argv[di + 2] ? process.argv[di + 2].split(",") : Object.keys(base);
const changed = only.filter(id => JSON.stringify(base[id]) !== JSON.stringify(snap[id]));
console.log(`zh snapshot: ${only.length - changed.length}/${only.length} identical`);
for (const id of changed) {
  const a = base[id] || [], b = snap[id] || [];
  const i = Array.isArray(a) && Array.isArray(b) ? a.findIndex((q, k) => JSON.stringify(q) !== JSON.stringify(b[k])) : 0;
  console.log(`  ! ${id} — first difference at question ${i}`);
  console.log(`      before: ${JSON.stringify(a[i])}`);
  console.log(`      after:  ${JSON.stringify(b[i])}`);
}
process.exit(changed.length ? 1 : 0);
