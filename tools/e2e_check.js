/* ============================================================
 * 端到端体检：把每个路由在两种语言下渲染一遍
 *   - 英文模式下页面不应再出现中文（含 SVG 配图与动画）
 *   - 中文模式下的输出应与改造前一致（配合 git stash 手工比对）
 * 用法：NODE_PATH=<jsdom> node tools/e2e_check.js
 * ============================================================ */
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const CJK = /[一-鿿]/;

function boot(lang) {
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"),
    { url: "http://localhost/#/path", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  const errors = [];
  w.addEventListener("error", e => errors.push("error: " + e.message));
  const files = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
    .matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
  w.localStorage.setItem("mathMastery.lang", lang);
  for (const f of files) {
    if (f === "js/app.js") {         // app.js 之前先播种进度，让所有技巧都解锁
      const seed = {};
      w.TECHNIQUES.forEach(t => seed[t.id] = { mastered: true, weak: {} });
      w.localStorage.setItem("mathMastery.profiles",
        JSON.stringify({ active: "test", list: [{ id: "test", name: "Test", created: 0 }] }));
      w.localStorage.setItem("mathMastery.v1.test", JSON.stringify(seed));
    }
    try { w.eval(fs.readFileSync(path.join(ROOT, f), "utf8")); }
    catch (e) { errors.push(`${f}: ${e.message}`); }
  }
  return { w, errors };
}

const animIds = ["chicken", "general", "melon", "func1", "moving", "trip", "area_equal",
  "solid_axis", "conic_link", "euler", "taylor", "numshape", "tree", "linearprog",
  "normal_app", "complex_geo", "important_limit", "graph_transform"];

for (const lang of ["zh", "en"]) {
  const { w, errors } = boot(lang);
  const go = h => { w.location.hash = h; w.dispatchEvent(new w.Event("hashchange")); };
  const routes = ["#/path", "#/grade/" + encodeURIComponent("一年级"),
    "#/grade/" + encodeURIComponent("十二年级"), "#/review", "#/progress", "#/resources"];
  w.TECHNIQUES.forEach(t => {
    routes.push("#/learn/" + t.id, "#/practice/" + t.id, "#/gate/" + t.id);
  });

  const cjkPages = [];
  for (const r of routes) {
    try { go(r); } catch (e) { errors.push(`${r}: THREW ${e.message}`); continue; }
    const html = w.document.getElementById("view").innerHTML;
    if (lang === "en" && CJK.test(html)) {
      const hits = [...new Set((html.match(/[^<>"]*[一-鿿][^<>"]*/g) || []))].slice(0, 3);
      cjkPages.push(`${r} → ${hits.join(" | ").slice(0, 160)}`);
    }
  }
  // 动画是点开学习页时挂上去的，单独扫一遍
  for (const id of animIds) {
    try { go("#/learn/" + id); } catch (e) { errors.push(`anim ${id}: ${e.message}`); continue; }
    const box = w.document.getElementById("animBox");
    if (!box) continue;
    if (lang === "en" && CJK.test(box.textContent)) {
      cjkPages.push(`anim ${id} → ${box.textContent.replace(/\s+/g, " ").slice(0, 120)}`);
    }
  }

  console.log(`\n=== ${lang} : ${routes.length} routes + ${animIds.length} animations ===`);
  console.log("load/render errors:", errors.length);
  errors.slice(0, 10).forEach(e => console.log("  ! " + e));
  if (lang === "en") {
    console.log("pages still showing Chinese:", cjkPages.length);
    cjkPages.slice(0, 15).forEach(p => console.log("  - " + p));
  }
  console.log("missing i18n keys:", w.I18N.missing().length, w.I18N.missing().slice(0, 8));
}
