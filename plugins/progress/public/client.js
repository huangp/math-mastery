/* ============================================================
 * 进度同步插件（前端）：服务器上的学员名单就是各设备的档案列表，进度跟着孩子走。
 * 由 server/host.js 注入到 app.js 之前（merge.js 之后），钩子经 MathMastery.queue 预注册。
 *
 * 只碰两个已文档化的键：mathMastery.profiles、mathMastery.v1.<id>（见 CLAUDE.md「学员档案」）。
 *   拉取：加载时、标签页回到前台时、每 2 分钟——先推后拉，与服务器合并后写回本地
 *   推送：progress:save / profiles:change 后防抖 1 秒
 * 合并满足交换律与幂等，所以离线、失败重试、应用把内存里的旧状态写回，都不会丢进度。
 * ============================================================ */
(function () {
  const MM = window.MathMastery = window.MathMastery || { queue: [], on(evt, fn) { this.queue.push([evt, fn]); } };
  const M = window.MMProgressMerge;
  if (!M) return;
  const API = "api/progress/";
  const PKEY = "mathMastery.profiles";
  const SKEY = "mathMastery.progressSync"; // { joined, resets:{ id: 最后见过的 resetAt } }，按设备存
  const key = id => "mathMastery.v1." + id;
  const TECH = () => window.TECHNIQUES;
  const QUIZ_ROUTE = /^#\/(practice|gate|review|ai)\b/;

  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const drop = k => { try { localStorage.removeItem(k); } catch (e) { } };

  // 「学员 3」「Learner 3」这类默认名：没进度又是默认名的档案不上传，免得每台新设备都往名单里塞一个
  const DEFAULT_NAME = new RegExp("^(" + [window.I18N_ZH, window.I18N_EN]
    .map(c => c && c["profile.default"]).filter(v => typeof v === "string")
    .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("\\{n\\}", "\\d+")).join("|") + ")$");
  const shouldUpload = row => M.hasProgress(read(key(row.id))) || !DEFAULT_NAME.test(row.name);

  const dirty = new Set(), toReset = new Set(), toDelete = new Set();
  let onServer = {};                       // id → true：服务器已有此学员
  let known = names(read(PKEY));           // 上次见到的档案名单，用来分辨新建 / 改名 / 删除
  let busy = false, timer = null, refreshQueued = false;

  function names(p) { const o = {}; ((p && p.list) || []).forEach(x => { o[x.id] = x.name; }); return o; }

  function api(method, path, body) {
    return fetch(API + path, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined })
      .then(r => r.json().then(j => { if (!r.ok) { const e = new Error(j.error || r.status); e.status = r.status; throw e; } return j; }));
  }

  // 测验进行中不重画（会打断作答、滚动跳动），等下一次换路由再刷新
  function refresh() {
    if (!MM.refresh) return;
    if (!QUIZ_ROUTE.test(location.hash)) { MM.refresh(); return; }
    if (refreshQueued) return;
    refreshQueued = true;
    window.addEventListener("hashchange", function once() {
      window.removeEventListener("hashchange", once); refreshQueued = false; MM.refresh();
    });
  }

  /* ---- 推送：删除 → 重置 → 上传 ---- */
  async function flush() {
    const st = read(SKEY) || { resets: {} };
    for (const id of [...toDelete]) { await api("DELETE", "learners/" + id); toDelete.delete(id); delete onServer[id]; }
    for (const id of [...toReset]) {
      if (onServer[id]) { const r = await api("POST", "learners/" + id + "/reset"); st.resets[id] = r.resetAt; write(SKEY, st); }
      toReset.delete(id);
    }
    const p = read(PKEY), active = p && p.active;
    let touched = false;
    for (const id of [...dirty]) {
      const row = p && p.list.find(x => x.id === id);
      if (!row || (!onServer[id] && !shouldUpload(row))) { dirty.delete(id); continue; }
      let r;
      try { r = await api("PUT", "learners/" + id, { name: row.name, progress: read(key(id)) || {} }); }
      catch (e) { if (e.status === 410) { dirty.delete(id); continue; } throw e; } // 别的设备已删除：下次拉取时移除
      dirty.delete(id); onServer[id] = true;
      const local = read(key(id)) || {};
      if (!M.same(M.sanitize(local, TECH()), r.progress)) { write(key(id), r.progress); if (id === active) touched = true; }
    }
    if (touched) refresh();
  }

  function schedule() { clearTimeout(timer); timer = setTimeout(run, 1000); }
  async function run() { if (busy) return schedule(); busy = true; try { await flush(); } catch (e) { } finally { busy = false; } }

  /* ---- 拉取 + 对账 ---- */
  async function sync() {
    if (busy) return;
    busy = true;
    try {
      await flush();
      const r = await api("GET", "learners");
      const st = read(SKEY) || { resets: {} };
      st.resets = st.resets || {};
      const p = read(PKEY) || { active: null, list: [] };
      const before = JSON.stringify(p), activeBefore = localStorage.getItem(key(p.active));
      const gone = new Set(r.deleted), srv = {};
      r.learners.forEach(l => { srv[l.id] = l; });
      onServer = {}; r.learners.forEach(l => { onServer[l.id] = true; });

      // 别的设备删掉的学员：本地档案连同进度一起删
      p.list.filter(x => gone.has(x.id)).forEach(x => drop(key(x.id)));
      const local = p.list.filter(x => !gone.has(x.id));

      // 服务器上的学员：合并进度；别的设备重置过（resetAt 更新）则整份采用服务器的
      for (const l of r.learners) {
        const mine = read(key(l.id)) || {};
        let merged;
        if ((l.resetAt || 0) > (st.resets[l.id] || 0)) { merged = l.progress; st.resets[l.id] = l.resetAt; }
        else merged = M.merge(mine, l.progress, TECH());
        if (!M.same(merged, M.sanitize(mine, TECH()))) write(key(l.id), merged);
        if (!M.same(merged, l.progress)) dirty.add(l.id);
      }

      // 本机独有的档案：有进度或起了名字的上传；首次加入且名单非空时，丢掉空白默认档案
      const keep = local.filter(x => !srv[x.id]).filter(x => {
        if (shouldUpload(x)) { dirty.add(x.id); return true; }
        if (st.joined || !r.learners.length) return true;
        drop(key(x.id)); return false;
      });

      const created = {}; p.list.forEach(x => { created[x.id] = x.created; });
      p.list = r.learners.map(l => ({ id: l.id, name: l.name, created: created[l.id] || 0 })).concat(keep);
      // 本机的学员全被别处删光：与应用自己的 deleteProfile 一样补一个空白档案（不走旧单人键迁移）
      if (!p.list.length) p.list.push({ id: "p" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36),
        name: window.I18N.t("profile.default", { n: 1 }), created: Date.now() });
      if (!p.list.some(x => x.id === p.active)) p.active = p.list[0].id;
      write(PKEY, p);
      known = names(p);
      st.joined = true; write(SKEY, st);
      if (JSON.stringify(p) !== before || localStorage.getItem(key(p.active)) !== activeBefore) refresh();
      if (dirty.size) await flush();
    } catch (e) { /* 离线：本地照常用，下次再同步 */ }
    finally { busy = false; }
  }

  MM.on("progress:save", ({ profileId, progress }) => {
    // 应用的「重置进度」写的是空对象；平时的保存至少有技巧条目
    if (progress && Object.keys(progress).length === 0) toReset.add(profileId);
    else dirty.add(profileId);
    schedule();
  });

  MM.on("profiles:change", ({ profiles }) => {
    const now = names(profiles);
    Object.keys(now).forEach(id => { if (known[id] !== now[id]) dirty.add(id); });         // 新建或改名
    Object.keys(known).forEach(id => { if (!(id in now)) { toDelete.add(id); dirty.delete(id); } });
    known = now;
    schedule();
  });

  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") sync(); });
  setInterval(sync, 120000);
  setTimeout(sync, 0); // app.js 同步启动完再开始
})();
