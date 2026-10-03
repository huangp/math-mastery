/* ============================================================
 * English · parameterised question generators, batch 1
 *  Same conventions as en.gen.js: plain strings with {var} placeholders,
 *  or functions (v) => string where grammar needs ordinals or plurals.
 * ============================================================ */
(function () {
  // 1, 2, 3 → 1st, 2nd, 3rd
  const ord = n => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const plural = (n, one, many) => n === 1 ? one : (many || one + "s");

  window.I18N_EN = Object.assign(window.I18N_EN || {}, {
  });
})();
