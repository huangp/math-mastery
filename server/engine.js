/* ============================================================
 * 出题引擎（服务端）：把 i18n 目录 + data.js + qgen*.js 装进 node:vm 沙箱，供插件重放判分。
 * 脚本清单照 index.html 解析（顺序即依赖），与 tools/gen_check.js 同法；
 * app.js / animations.js / figures.js 要 DOM 且与判分无关，不加载。零依赖，不需要 jsdom。
 * ============================================================ */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");

function load() {
  const store = {};
  const sandbox = {
    console,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
    document: { documentElement: {}, title: "" },
    Fig: {}, QFIG_MAP: {}, Anim: {} // 配图/动画判分用不到，给空表让 qgen 照常往上挂
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  const scripts = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8").matchAll(/<script src="([^"]+)"/g)]
    .map(m => m[1]).filter(f => !/(app|animations|figures|related-projects)\.js$/.test(f));
  for (const f of scripts) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });

  const W = ctx;
  const M = vm.runInContext("Math", ctx); // 沙箱有自己的 Math，内置对象不挂在 sandbox 上
  const byId = {};
  W.TECHNIQUES.forEach(t => { byId[t.id] = t; });

  // 与 js/app.js 的 withSeed 逐字同算法（mulberry32），否则重放出的题对不上
  function withSeed(seed, fn) {
    const orig = M.random; let a = seed >>> 0;
    M.random = function () {
      a = (a + 0x6D2B79F5) >>> 0; let x = a;
      x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    try { return fn(); } finally { M.random = orig; }
  }

  function setLang(l) { if (W.I18N.langs.indexOf(l) >= 0) W.I18N.setLang(l); }

  /* 按出处取回原题：{ src:{seed,i,n} } 为生成题，{ qidx } 为静态题。lang 决定重放语言——
   * 个别生成器在中英文下随机序列会分叉，必须用作答时的语言重放。取不到返回 null。 */
  function question(techId, item, lang) {
    const t = byId[techId];
    if (!t || !item) return null;
    setLang(lang || "zh");
    if (item.src) {
      if (typeof t.qgen !== "function") return null;
      const { seed, i, n } = item.src;
      if (!Number.isInteger(seed) || !Number.isInteger(i) || !Number.isInteger(n) || n < 1 || n > 20 || i < 0 || i >= n) return null;
      return withSeed(seed, () => t.qgen(n))[i] || null;
    }
    if (Number.isInteger(item.qidx)) return t.questions[item.qidx] || null;
    return null;
  }

  return { techniques: W.TECHNIQUES, tech: id => byId[id] || null, question, withSeed, setLang };
}

module.exports = { load };
