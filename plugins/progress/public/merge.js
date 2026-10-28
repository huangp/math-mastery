/* ============================================================
 * 进度同步插件 · 共用逻辑（浏览器与服务端同一份）
 *   sanitize(raw, techniques)  照着技巧 id 重建进度，规则与 js/app.js 的 sanitizeProgress 一致
 *   merge(a, b, techniques)    合并两份进度：mastered 取或；同一薄弱点取 lastTime 更新的那条
 *   same(a, b)                 两份（已 sanitize 的）进度是否相同；hasProgress(p) 是否有真进度
 * merge 满足交换律与幂等：谁先谁后、重复推送都得到同一结果，所以离线、重试、旧状态回写都不会丢进度。
 * ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MMProgressMerge = factory();
})(this, function () {
  function weakOk(t, k) { return k === t.id || (/^\d+$/.test(k) && +k < t.questions.length); }

  function sanitize(raw, techniques) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    techniques.forEach(t => {
      const src = Object.prototype.hasOwnProperty.call(raw, t.id) ? raw[t.id] : null;
      if (!src || typeof src !== "object") return;
      const srcWeak = (src.weak && typeof src.weak === "object") ? src.weak : {};
      const weak = {};
      Object.keys(srcWeak).forEach(k => {
        const w = srcWeak[k];
        if (!weakOk(t, k) || !w || typeof w !== "object") return;
        weak[k] = {
          fails: Number(w.fails) || 0,
          cleared: !!w.cleared,
          passes: Number(w.passes) || 0,
          lastTime: Number(w.lastTime) || 0,
          attempts: Number(w.attempts) || 0
        };
      });
      out[t.id] = { mastered: !!src.mastered, weak };
    });
    return out;
  }

  // 同一薄弱点两条记录取「更新」的：lastTime 大者胜，平手看 attempts，再平手按内容定序（保证交换律）
  function newer(x, y) {
    if (x.lastTime !== y.lastTime) return x.lastTime > y.lastTime ? x : y;
    if (x.attempts !== y.attempts) return x.attempts > y.attempts ? x : y;
    return JSON.stringify(x) >= JSON.stringify(y) ? x : y;
  }

  function merge(a, b, techniques) {
    a = sanitize(a, techniques); b = sanitize(b, techniques);
    const out = {};
    techniques.forEach(t => {
      const x = a[t.id], y = b[t.id];
      if (!x && !y) return;
      if (!x || !y) { out[t.id] = x || y; return; }
      const weak = {};
      new Set(Object.keys(x.weak).concat(Object.keys(y.weak))).forEach(k => {
        weak[k] = x.weak[k] && y.weak[k] ? newer(x.weak[k], y.weak[k]) : (x.weak[k] || y.weak[k]);
      });
      out[t.id] = { mastered: x.mastered || y.mastered, weak };
    });
    return out;
  }

  // 键序稳定的序列化，用来比较
  function canon(v) {
    if (!v || typeof v !== "object") return JSON.stringify(v);
    return "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
  }
  function same(a, b) { return canon(a) === canon(b); }
  // 有没有「真进度」：学习页会给技巧建空壳 {mastered:false, weak:{}}，那不算
  function hasProgress(p) {
    return !!p && Object.keys(p).some(k => p[k] && (p[k].mastered || Object.keys(p[k].weak || {}).length));
  }

  return { sanitize, merge, same, hasProgress };
});
