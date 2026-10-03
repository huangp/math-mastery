/* ============================================================
 * 学员档案体检：迁移、隔离、删除、自愈
 *   用法：NODE_PATH=<装了 jsdom 的目录> node tools/profile_check.js
 * ============================================================ */
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const FILES = [...fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  .matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

// 用同一个 localStorage 反复"重启"应用，模拟刷新页面
function boot(store) {
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"),
    { url: "http://localhost/#/path", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  for (const k of Object.keys(store)) w.localStorage.setItem(k, store[k]);
  for (const f of FILES) w.eval(fs.readFileSync(path.join(ROOT, f), "utf8"));
  return w;
}
function dump(w) {
  const o = {};
  for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); o[k] = w.localStorage.getItem(k); }
  return o;
}
const sel = w => w.document.getElementById("profileSel");
const names = w => [...sel(w).options].map(o => o.textContent);
const pick = (w, i) => { sel(w).value = sel(w).options[i].value; sel(w).dispatchEvent(new w.Event("change", { bubbles: true })); };
const profiles = w => JSON.parse(w.localStorage.getItem("mathMastery.profiles"));

let failed = 0;
const ok = (label, cond, extra) => { console.log((cond ? "  PASS  " : "  FAIL  ") + label + (cond ? "" : "  → " + extra)); if (!cond) failed++; };

/* 1. 旧的单人进度必须原样迁移进第一个档案，且旧键保留 */
console.log("1. migration from the legacy single-user key");
const legacy = JSON.stringify({ chicken: { mastered: true, weak: {} }, plant: { mastered: false, weak: { "1": { fails: 2, cleared: false } } } });
let w = boot({ "mathMastery.v1": legacy });
let p = profiles(w);
ok("one profile is created", p.list.length === 1, JSON.stringify(p));
ok("legacy progress is carried over intact",
  w.localStorage.getItem("mathMastery.v1." + p.active) === legacy,
  w.localStorage.getItem("mathMastery.v1." + p.active));
ok("legacy key is left in place for rollback", w.localStorage.getItem("mathMastery.v1") === legacy);
ok("the switcher lists the learner + a New entry", names(w).length === 2, JSON.stringify(names(w)));

/* 2. 两个学员的进度互不干扰，且能跨"刷新"保留 */
console.log("\n2. two learners stay independent");
let store = dump(w);
w = boot(store);
const firstId = profiles(w).active;
sel(w).value = "__new"; w.prompt = () => "Bob";
sel(w).dispatchEvent(new w.Event("change", { bubbles: true }));
p = profiles(w);
const bobId = p.active;
ok("a second profile is created and becomes active", p.list.length === 2 && bobId !== firstId, JSON.stringify(p));
ok("the new learner starts with no progress",
  !w.localStorage.getItem("mathMastery.v1." + bobId) || w.localStorage.getItem("mathMastery.v1." + bobId) === "{}",
  w.localStorage.getItem("mathMastery.v1." + bobId));
// Bob 做一题：进入练习页答对第一题
w.location.hash = "#/practice/count"; w.dispatchEvent(new w.Event("hashchange"));
const opt = w.document.querySelector(".q .opt");
if (opt) opt.dispatchEvent(new w.Event("click", { bubbles: true }));
store = dump(w);
ok("learner 1's record is untouched by learner 2's answers",
  store["mathMastery.v1." + firstId] === legacy, store["mathMastery.v1." + firstId]);
const bobAfter = store["mathMastery.v1." + bobId];
ok("learner 2 has their own record", !!bobAfter && bobAfter !== legacy, bobAfter);
// 切回第一个学员，再切回来，两边数据都还在
w = boot(store);
pick(w, [...sel(w).options].findIndex(o => o.value === firstId));
ok("switching back restores learner 1", dump(w)["mathMastery.v1." + firstId] === legacy);
ok("learner 2's record survives the switch", dump(w)["mathMastery.v1." + bobId] === bobAfter);

/* 3. 删除档案要连数据一起删掉 */
console.log("\n3. deleting a learner removes their data");
store = dump(w);
w = boot(store);
w.confirm = () => true;
w.location.hash = "#/progress"; w.dispatchEvent(new w.Event("hashchange"));
w.document.getElementById("delBtn").dispatchEvent(new w.Event("click", { bubbles: true }));
const afterDel = dump(w);
ok("the deleted learner's progress key is gone", !(("mathMastery.v1." + firstId) in afterDel), Object.keys(afterDel).join(","));
ok("the other learner remains", profiles(w).list.length === 1 && profiles(w).active === bobId, JSON.stringify(profiles(w)));

/* 4. 删掉最后一个档案后仍要有一个可用档案 */
console.log("\n4. deleting the last learner leaves a usable one");
w = boot(dump(w));
w.confirm = () => true;
w.location.hash = "#/progress"; w.dispatchEvent(new w.Event("hashchange"));
w.document.getElementById("delBtn").dispatchEvent(new w.Event("click", { bubbles: true }));
p = profiles(w);
ok("exactly one fresh profile remains", p.list.length === 1 && !!p.active, JSON.stringify(p));
ok("the app still renders", w.document.getElementById("view").textContent.length > 0);

/* 5. 档案表损坏时自愈，而不是白屏 */
console.log("\n5. a corrupt profiles record self-heals");
let threw = "";
try { w = boot({ "mathMastery.profiles": "{not json at all", "mathMastery.v1": legacy }); }
catch (e) { threw = e.message; }
ok("boots without throwing", !threw, threw);
if (!threw) {
  p = profiles(w);
  ok("a valid profile is rebuilt", p && Array.isArray(p.list) && p.list.length === 1, JSON.stringify(p));
  ok("the app still renders", w.document.getElementById("view").textContent.length > 0);
}

console.log(failed ? `\n${failed} check(s) FAILED` : "\nall profile checks passed");
process.exit(failed ? 1 : 0);
