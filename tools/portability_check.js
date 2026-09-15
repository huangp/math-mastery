/* ============================================================
 * 进度导出/导入体检：往返、非破坏性、重名、多学员、拒绝非法文件、净化脏数据
 *   用法：NODE_PATH=<装了 jsdom 的目录> node tools/portability_check.js
 * 说明：jsdom 没有 URL.createObjectURL，所以不驱动真正的下载；
 *       导出走 buildExport 的产物（通过点按钮之外的路径无法拿到，故这里
 *       直接比对导入端行为 + 手工构造文件），下载本身留给浏览器手测。
 * ============================================================ */
const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const FILES = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  .matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

function boot(store) {
  const vc = new VirtualConsole();          // 下载会触发 jsdom 的"未实现导航"告警，忽略即可
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"),
    { url: "http://localhost/#/progress", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  // jsdom 没有 URL.createObjectURL：截住它，把导出的 Blob 存下来供断言
  w.__exported = [];
  w.URL.createObjectURL = blob => { w.__exported.push(blob); return "blob:test"; };
  w.URL.revokeObjectURL = () => { };
  for (const k of Object.keys(store || {})) w.localStorage.setItem(k, store[k]);
  for (const f of FILES) w.eval(fs.readFileSync(path.join(ROOT, f), "utf8"));
  w.location.hash = "#/progress"; w.dispatchEvent(new w.Event("hashchange"));
  return w;
}
const profiles = w => JSON.parse(w.localStorage.getItem("mathMastery.profiles"));
const progressOf = (w, id) => w.localStorage.getItem("mathMastery.v1." + id);
const toastText = w => w.document.getElementById("toast").textContent;

// 通过真实的 file input 走一遍导入（绕开 URL.createObjectURL）
function importFile(w, text) {
  const input = w.document.getElementById("importFile");
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [{ text: () => Promise.resolve(text) }]
  });
  input.dispatchEvent(new w.Event("change", { bubbles: true }));
  return new Promise(r => setTimeout(r, 0));   // 等 f.text() 的 microtask
}
const fileFor = learners => JSON.stringify({
  app: "math-mastery", format: 1, exported: new Date().toISOString(), learners
});

let failed = 0;
const ok = (label, cond, extra) => {
  console.log((cond ? "  PASS  " : "  FAIL  ") + label + (cond ? "" : "  → " + extra));
  if (!cond) failed++;
};

const ANN = { chicken: { mastered: true, weak: {} }, count: { mastered: false, weak: { "2": { fails: 3, cleared: false } } } };
const base = () => ({
  "mathMastery.profiles": JSON.stringify({ active: "a", list: [{ id: "a", name: "Ann", created: 0 }] }),
  "mathMastery.v1.a": JSON.stringify(ANN)
});

(async () => {
  /* 1. 导入建新学员，且不碰现有的人 */
  console.log("1. import is non-destructive");
  let w = boot(base());
  await importFile(w, fileFor([{ name: "Ben", progress: { plant: { mastered: true, weak: {} } } }]));
  let p = profiles(w);
  ok("a new profile is created", p.list.length === 2, JSON.stringify(p.list));
  ok("the existing learner is byte-identical", progressOf(w, "a") === JSON.stringify(ANN), progressOf(w, "a"));
  const ben = p.list.find(x => x.name === "Ben");
  ok("the imported learner is named from the file", !!ben, JSON.stringify(p.list));
  ok("imported progress lands intact",
    ben && JSON.parse(progressOf(w, ben.id)).plant.mastered === true, ben && progressOf(w, ben.id));
  ok("the app switches to the imported learner", p.active === (ben && ben.id), p.active);
  ok("a toast reports the count", /1/.test(toastText(w)), toastText(w));

  /* 2. 重名不合并，而是加后缀 */
  console.log("\n2. a colliding name gets a suffix");
  w = boot(base());
  await importFile(w, fileFor([{ name: "Ann", progress: { plant: { mastered: true, weak: {} } } }]));
  p = profiles(w);
  const names = p.list.map(x => x.name);
  ok("two distinct profiles exist", p.list.length === 2 && new Set(names).size === 2, JSON.stringify(names));
  ok("the original Ann keeps her data", progressOf(w, "a") === JSON.stringify(ANN));

  /* 3. 一个文件可以搬走整台设备 */
  console.log("\n3. a multi-learner file restores every learner");
  w = boot(base());
  await importFile(w, fileFor([
    { name: "Kid1", progress: { plant: { mastered: true, weak: {} } } },
    { name: "Kid2", progress: { count: { mastered: true, weak: {} } } }
  ]));
  p = profiles(w);
  ok("both learners are created", p.list.length === 3, JSON.stringify(p.list.map(x => x.name)));
  ok("lands on the first imported learner", p.list.find(x => x.id === p.active).name === "Kid1",
    p.list.find(x => x.id === p.active).name);

  /* 4. 非法文件必须被拒绝，且不留半个档案 */
  console.log("\n4. bad files are refused cleanly");
  for (const [label, text] of [
    ["malformed JSON", "{ not json"],
    ["a foreign app", JSON.stringify({ app: "something-else", format: 1, learners: [{ name: "X", progress: {} }] })],
    ["an unknown format", JSON.stringify({ app: "math-mastery", format: 99, learners: [{ name: "X", progress: {} }] })],
    ["an oversized file", JSON.stringify({ app: "math-mastery", format: 1, learners: [{ name: "X".repeat(1100000), progress: {} }] })],
    ["an empty learner list", fileFor([])]
  ]) {
    w = boot(base());
    let threw = "";
    try { await importFile(w, text); } catch (e) { threw = e.message; }
    ok(label + " → refused, no profile added and no throw",
      !threw && profiles(w).list.length === 1 && progressOf(w, "a") === JSON.stringify(ANN),
      threw || JSON.stringify(profiles(w).list));
    ok(label + " → explains why", toastText(w).length > 0, "(empty toast)");
  }

  /* 5. 净化：未知 id、原型污染、脏值 */
  console.log("\n5. imported data is rebuilt, not trusted");
  w = boot(base());
  const hostile = JSON.parse(fileFor([{
    name: "Mallory",
    progress: {
      chicken: { mastered: "yes", weak: { "0": { fails: "9", cleared: 1 }, "99999": { fails: 1 }, evil: { fails: 1 } } },
      no_such_technique: { mastered: true, weak: {} }
    }
  }]));
  hostile.learners[0].progress.__proto__ = { polluted: true };
  await importFile(w, JSON.stringify(hostile));
  const mal = profiles(w).list.find(x => x.name === "Mallory");
  const got = JSON.parse(progressOf(w, mal.id));
  ok("Object.prototype is not polluted", ({}).polluted === undefined, String(({}).polluted));
  ok("unknown technique ids are dropped", !("no_such_technique" in got), Object.keys(got).join(","));
  ok("mastered is coerced to a boolean", got.chicken.mastered === true, JSON.stringify(got.chicken));
  ok("fails is coerced to a number", got.chicken.weak["0"].fails === 9, JSON.stringify(got.chicken.weak));
  ok("cleared is coerced to a boolean", got.chicken.weak["0"].cleared === true, JSON.stringify(got.chicken.weak));
  ok("out-of-range question indices are dropped", !("99999" in got.chicken.weak), Object.keys(got.chicken.weak).join(","));
  ok("junk weak keys are dropped", !("evil" in got.chicken.weak), Object.keys(got.chicken.weak).join(","));

  /* 6. 真正点导出按钮，验证 buildExport 的产物 */
  console.log("\n6. the export button produces a valid, re-importable file");
  w = boot(base());
  w.document.getElementById("expBtn").dispatchEvent(new w.Event("click", { bubbles: true }));
  ok("clicking export produces one file", w.__exported.length === 1, String(w.__exported.length));
  const text = await w.__exported[0].text();
  let doc = null, parseErr = "";
  try { doc = JSON.parse(text); } catch (e) { parseErr = e.message; }
  ok("it is valid JSON", !!doc, parseErr);
  ok("the envelope identifies the app and format", doc && doc.app === "math-mastery" && doc.format === 1, text.slice(0, 80));
  ok("it carries exactly the active learner", doc && doc.learners.length === 1 && doc.learners[0].name === "Ann",
    doc && JSON.stringify(doc.learners.map(x => x.name)));
  ok("progress is carried verbatim", doc && JSON.stringify(doc.learners[0].progress) === JSON.stringify(ANN),
    doc && JSON.stringify(doc.learners[0].progress));

  // 把这份真导出喂回导入端：这才是完整往返
  const w2 = boot({});
  await importFile(w2, text);
  const restored = profiles(w2).list.find(x => x.name === "Ann");
  ok("the real export re-imports on a clean device", !!restored, JSON.stringify(profiles(w2).list));
  ok("progress survives the full round trip",
    restored && JSON.parse(progressOf(w2, restored.id)).count.weak["2"].fails === 3,
    restored && progressOf(w2, restored.id));

  /* 7. 多学员导出按钮 */
  console.log("\n7. export-all covers every learner on the device");
  w = boot({
    "mathMastery.profiles": JSON.stringify({ active: "a", list: [{ id: "a", name: "Ann", created: 0 }, { id: "b", name: "Ben", created: 0 }] }),
    "mathMastery.v1.a": JSON.stringify(ANN),
    "mathMastery.v1.b": JSON.stringify({ plant: { mastered: true, weak: {} } })
  });
  const allBtn = w.document.getElementById("expAllBtn");
  ok("the export-all button appears once there are 2 learners", !!allBtn, "(missing)");
  allBtn.dispatchEvent(new w.Event("click", { bubbles: true }));
  const allDoc = JSON.parse(await w.__exported[0].text());
  ok("the file holds both learners", allDoc.learners.length === 2,
    JSON.stringify(allDoc.learners.map(x => x.name)));

  console.log(failed ? `\n${failed} check(s) FAILED` : "\nall portability checks passed");
  process.exit(failed ? 1 : 0);
})();
