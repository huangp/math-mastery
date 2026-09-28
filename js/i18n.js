/* ============================================================
 * 融会贯通 · i18n 运行时
 *  - 语言目录挂在 window.I18N_ZH / window.I18N_EN（先于本文件加载）
 *  - t(key, vars)：缺键回退到中文，再回退到 key 本身，永不抛错
 *  - 目录值可以是字符串（含 {var} 占位符）或函数（承载语法变化：序数、单复数）
 * ============================================================ */
window.I18N = (function () {
  const KEY = "mathMastery.lang";
  const FALLBACK = "zh";
  const LANGS = ["zh", "en"];
  const listeners = [];
  const missingKeys = {};

  let lang = FALLBACK;
  try { const s = localStorage.getItem(KEY); if (LANGS.indexOf(s) >= 0) lang = s; } catch (e) { }

  function cat(l) { return window["I18N_" + l.toUpperCase()] || {}; }

  // "共 {n} 个技巧" + {n:3} → "共 3 个技巧"；缺变量则原样保留占位符
  function fill(str, vars) {
    return str.replace(/\{(\w+)\}/g, (m, k) => (vars && k in vars) ? String(vars[k]) : m);
  }

  function resolve(key, vars) {
    let v = cat(lang)[key];
    if (v === undefined && lang !== FALLBACK) v = cat(FALLBACK)[key];
    if (v === undefined) { missingKeys[key] = true; return key; }
    if (typeof v === "function") {
      try { return String(v(vars || {})); }
      catch (e) { missingKeys[key] = true; return key; }
    }
    return fill(String(v), vars);
  }

  // t("a.b", {n:1}) 或 t(["a.b", {n:1}])——后者是出题引擎携带的 [key, vars] 规格
  function t(key, vars) {
    if (Array.isArray(key)) return resolve(key[0], key[1]);
    return resolve(key, vars);
  }

  function has(key) { return cat(lang)[key] !== undefined || cat(FALLBACK)[key] !== undefined; }

  // 出题引擎专用：中文直接用生成器里的原始模板字符串（保证中文题面与改造前逐字一致），
  // 其他语言用目录里的模板 + 同一批变量重新组句——语序、量词、单复数由译文自己决定。
  function gen(key, vars, zhText) {
    if (lang === FALLBACK) return zhText;
    return tx(key, zhText, vars);
  }

  // 共享词表：星期、生肖、颜色、数位这类「成组的词」在多个生成器里当数组用，
  // 逐处包 G() 会散成上百个键。这里集中一份，生成器按 V("week") 取当前语言的数组。
  const VOCAB = {
    week:   ["日", "一", "二", "三", "四", "五", "六"],
    weekFull: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    beast:  ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],
    color:  ["红", "黄", "蓝", "绿"],
    color6: ["红", "黄", "蓝", "绿", "紫", "橙"],
    place:  ["个位", "十位", "百位"],
    parity: ["奇数", "偶数"],
    rank:   ["最小", "中间", "最大"]
  };
  // V(name) → 当前语言的词数组；英文缺词时回落中文，保证长度与下标不变
  function V(name) {
    const zh = VOCAB[name] || [];
    if (lang === FALLBACK) return zh.slice();
    return zh.map((w, i) => {
      const v = cat(lang)["vocab." + name + "." + i];
      return v === undefined ? w : String(v);
    });
  }

  // 内容型文案（技巧名/摘要/口诀/步骤/静态题）：中文原文留在 data.js，
  // 目录里只放译文；查不到就用原文兜底，避免把中文再抄一份造成两处漂移。
  function tx(key, fallbackText, vars) {
    const v = cat(lang)[key];
    if (v === undefined) return fallbackText;
    if (typeof v === "function") {
      try { return String(v(vars || {})); } catch (e) { return fallbackText; }
    }
    return fill(String(v), vars);
  }

  // 把 document 层面的语言标记刷成当前语言
  function applyDocument() {
    document.documentElement.lang = t("ui.htmlLang");
    document.title = t("ui.title");
  }

  function setLang(l) {
    if (LANGS.indexOf(l) < 0 || l === lang) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) { }
    applyDocument();
    listeners.forEach(fn => { try { fn(l); } catch (e) { } });
  }

  function onChange(fn) { listeners.push(fn); }

  return {
    get lang() { return lang; },
    langs: LANGS,
    t, tx, gen, V, has, setLang, onChange, applyDocument,
    missing: () => Object.keys(missingKeys).sort()
  };
})();
/* 短别名：data/qgen/figures/animations 里直接用 t("...") */
window.t = window.I18N.t;
window.tx = window.I18N.tx;
/* 出题引擎里用 G(key, vars, 中文原文) */
window.G = window.I18N.gen;
/* 共享词表：生成器里用 V("week")[i] 取当前语言的词 */
window.V = window.I18N.V;
