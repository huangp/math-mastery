/* ============================================================
 * 融会贯通 · 核心逻辑
 * 学习路径 + 学习页 + 练习 + 薄弱点复习 + 通关门禁 + 进度持久化
 * ============================================================ */
(function () {
  const KEY = "mathMastery.v1";
  const $ = sel => document.querySelector(sel);
  const view = () => document.getElementById("view");
  // 译文取用别名用 T：本文件里 t 已被「技巧对象」占用
  const T = window.I18N.t;

  /* ---------------- 学员档案（同一台设备多人共用） ----------------
   * mathMastery.profiles   {active, list:[{id,name,created}]}
   * mathMastery.v1.<id>    该学员的进度（结构与旧版逐字一致）
   * mathMastery.v1         旧的单人进度键：迁移时读一次，之后原样留着以便回退
   * 语言仍是 mathMastery.lang，按设备存，不随学员切换。
   */
  const PROFILES_KEY = "mathMastery.profiles";
  function progressKey(id) { return KEY + "." + id; }
  function newId() { return "p" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); }
  function defaultName(n) { return T("profile.default", { n }); }
  function writeProfiles(p) { try { localStorage.setItem(PROFILES_KEY, JSON.stringify(p)); } catch (e) { } }

  // 首次运行：把旧的单人进度收进第一个档案。旧键只复制不删除，回退时数据还在。
  function migrateOrCreate() {
    const id = newId();
    let legacy = null;
    try { legacy = localStorage.getItem(KEY); } catch (e) { }
    if (legacy) { try { localStorage.setItem(progressKey(id), legacy); } catch (e) { } }
    const p = { active: id, list: [{ id, name: defaultName(1), created: Date.now() }] };
    writeProfiles(p);
    return p;
  }

  // 读档案表；内容损坏或为空时自愈重建，绝不抛错（与 load() 的容错风格一致）
  function readProfiles() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(PROFILES_KEY)); } catch (e) { p = null; }
    if (!p || !Array.isArray(p.list) || !p.list.length || p.list.some(x => !x || !x.id)) p = migrateOrCreate();
    if (!p.list.some(x => x.id === p.active)) { p.active = p.list[0].id; writeProfiles(p); }
    return p;
  }
  function activeId() { return readProfiles().active; }
  function activeProfile() { const p = readProfiles(); return p.list.find(x => x.id === p.active) || p.list[0]; }

  function addProfile(name) {
    const p = readProfiles();
    const id = newId();
    p.list.push({ id, name: name || defaultName(p.list.length + 1), created: Date.now() });
    p.active = id; writeProfiles(p);
  }
  function renameProfile(id, name) {
    const p = readProfiles();
    const row = p.list.find(x => x.id === id);
    if (row && name) { row.name = name; writeProfiles(p); }
  }
  function deleteProfile(id) {
    const p = readProfiles();
    p.list = p.list.filter(x => x.id !== id);
    try { localStorage.removeItem(progressKey(id)); } catch (e) { }   // 真正把数据删掉
    if (!p.list.length) {                                             // 删到一个不剩就补一个空档案
      const nid = newId();
      p.list.push({ id: nid, name: defaultName(1), created: Date.now() });
      p.active = nid;
    } else if (p.active === id) p.active = p.list[0].id;
    writeProfiles(p);
  }

  function load() { try { return JSON.parse(localStorage.getItem(progressKey(activeId()))) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(progressKey(activeId()), JSON.stringify(s)); } catch (e) { } }

  /* ---------------- 进度导出 / 导入 ----------------
   * localStorage 按 origin 隔离：换域名、换设备都带不走数据。这里给学员一个
   * 自己保管的 JSON 文件当桥梁——是「搬家 + 备份」，不是同步。
   */
  const IO_APP = "math-mastery";
  const IO_FORMAT = 1;
  const IO_MAX = 1024 * 1024;      // 114 个技巧的进度只有几 KB，1MB 已经很宽松

  function readProgress(id) {
    try { return JSON.parse(localStorage.getItem(progressKey(id))) || {}; } catch (e) { return {}; }
  }

  // 重建而不是信任：只照着已知技巧 id 抄一遍。
  // 未知/过期技巧、__proto__ 之类的构造、脏值，都会在这里被丢掉。
  function sanitizeProgress(raw) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    TECHNIQUES.forEach(t => {
      const src = raw[t.id];
      if (!src || typeof src !== "object") return;
      const srcWeak = (src.weak && typeof src.weak === "object") ? src.weak : {};
      const weak = {};
      Object.keys(srcWeak).forEach(k => {
        // 薄弱点键有两制：参数化题用技巧 id，静态题用题号
        const ok = k === t.id || (/^\d+$/.test(k) && +k < t.questions.length);
        const w = srcWeak[k];
        if (!ok || !w || typeof w !== "object") return;
        // 上游把薄弱点改成「连对 2 道才消除」，多了 passes/lastTime/attempts；
        // 这里必须一并保留，否则导入会把复习进度悄悄抹平
        weak[k] = {
          fails: Number(w.fails) || 0,
          cleared: !!w.cleared,
          passes: Number(w.passes) || 0,
          lastTime: Number(w.lastTime) || 0,
          attempts: Number(w.attempts) || 0
        };
      });
      out[t.id] = { mastered: !!src.mastered, weak: weak };
    });
    return out;
  }

  function buildExport(ids) {
    const p = readProfiles();
    const learners = ids.map(id => {
      const row = p.list.find(x => x.id === id);
      return row ? { name: row.name, progress: readProgress(id) } : null;
    }).filter(Boolean);
    return JSON.stringify({ app: IO_APP, format: IO_FORMAT, exported: new Date().toISOString(), learners }, null, 1);
  }

  function uniqueName(name) {
    const taken = readProfiles().list.map(x => x.name);
    if (taken.indexOf(name) < 0) return name;
    const base = T("io.nameSuffix", { name });
    let n = base, k = 2;
    while (taken.indexOf(n) >= 0) n = base + " " + (k++);
    return n;
  }

  // 导入一律「新建学员」，绝不覆盖现有的人——学生的进度不值得用破坏性默认值去赌
  function applyImport(text) {
    if (typeof text !== "string" || text.length > IO_MAX) return { ok: false, error: T("io.tooBig") };
    let doc = null;
    try { doc = JSON.parse(text); } catch (e) { return { ok: false, error: T("io.badFile") }; }
    if (!doc || doc.app !== IO_APP || !Array.isArray(doc.learners)) return { ok: false, error: T("io.badFile") };
    if (doc.format !== IO_FORMAT) return { ok: false, error: T("io.badVersion", { v: doc.format }) };
    const rows = doc.learners.filter(x => x && typeof x === "object");
    if (!rows.length) return { ok: false, error: T("io.badFile") };
    let first = null;
    rows.forEach(row => {
      const raw = String(row.name == null ? "" : row.name).trim();
      addProfile(uniqueName(raw || defaultName(readProfiles().list.length + 1)));
      const id = readProfiles().active;        // addProfile 建完就把它设为当前
      if (!first) first = id;
      try { localStorage.setItem(progressKey(id), JSON.stringify(sanitizeProgress(row.progress))); } catch (e) { }
    });
    if (first) { const p = readProfiles(); p.active = first; writeProfiles(p); }
    return { ok: true, count: rows.length };
  }

  function downloadExport(ids, label) {
    const safe = String(label || "").replace(/[\\/:*?"<>|\s]+/g, "-").replace(/^-+|-+$/g, "") || "progress";
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([buildExport(ids)], { type: "application/json" }));
    a.href = url; a.download = "math-mastery-" + safe + "-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  let state = load(); // { [id]: { mastered:bool, weak:{ [qidx]:{fails,clear} } } }
  let pendingScrollTech = null; // 返回路径时，定位并高亮到此技巧节点
  const STAGES = ["小学", "中学", "高中"];
  // 学段中文串同时是 data.js 的数据键；副标题按 stage.<学段>.sub 取译文
  function stageDesc(s) { return T("stage." + s + ".sub"); }
  let curFilter = { stage: null, grade: null }; // 当前侧边栏筛选（学段/年级）

  /* ---- 解锁规则（按年级动态计算，单一事实来源）----
   * 小学 1–6 年级、初中初一/初二（7、8 年级）：
   *   年级内顺序解锁——第一个技巧为入口，掌握后才会解锁本年级下一个。
   * 初三（9 年级）起：所有技巧均可单独进入（无前置依赖）。
   */
  const ORDER = {}; TECHNIQUES.forEach((t, i) => ORDER[t.id] = i);
  function effPrereq(t) {
    const g = gradeNum(t.grade);
    if (g >= 9) return null;                          // 初三及高中：全部独立入口
    const same = TECHNIQUES.filter(x => x.grade === t.grade)
      .sort((a, b) => ORDER[a.id] - ORDER[b.id]);     // 年级内按编写顺序
    const i = same.findIndex(x => x.id === t.id);
    return i > 0 ? same[i - 1].id : null;             // 首技巧为入口，其余依赖上一技巧
  }
  // 用新规则重写每项 prereq，后续 unlocked / 下一技巧 / 排序 直接复用
  TECHNIQUES.forEach(t => { t.prereq = effPrereq(t); });

  function tech(id) { return TECHNIQUES.find(t => t.id === id); }
  function tstate(id) { if (!state[id]) state[id] = { mastered: false, weak: {} }; return state[id]; }
  function unlocked(id) { const t = tech(id); return !t.prereq || !!(state[t.prereq] && state[t.prereq].mastered); }
  function weakCount() { let n = 0; for (const id in state) for (const k in state[id].weak) if (!state[id].weak[k].cleared) n++; return n; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function gradeNum(g) { const m = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10, "十一": 11, "十二": 12 }; const x = /([一二三四五六七八九十]+)年级/.exec(g || ""); return x ? (m[x[1]] || 99) : 99; }
  function sortGroup(arr) {
    return arr.slice().sort((a, b) => ORDER[a.id] - ORDER[b.id]);
  }

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function updateBadge() {
    const b = $("#weakBadge"); const n = weakCount();
    if (n > 0) { b.textContent = n; b.classList.add("show"); } else b.classList.remove("show");
  }
  function esc(s) { return (s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

  /* ---------------- 题目配图 ---------------- */
  function qfigSpec(t, qidx) {
    const q = t.questions[qidx];
    if (q && q.fig) return q.fig;                       // 题目自带
    const k = t.id + "::" + qidx;
    return (window.QFIG_MAP && window.QFIG_MAP[k]) || null; // 逐题注册表
  }
  function qfigSVG(t, qidx) {
    const spec = qfigSpec(t, qidx);
    if (!spec || !window.Fig) return "";
    let name, params = {};
    if (typeof spec === "string") name = spec;
    else { name = spec.name; params = spec; }
    if (!window.Fig[name]) return "";
    try { return `<div class="qfig">${window.Fig[name](params)}</div>`; }
    catch (e) { return ""; }
  }
  // 渲染单题自带配图（生成题也可用 q.fig 指定图元名或 {name,参数}）
  function renderFigOf(q) {
    if (!q || !q.fig || !window.Fig) return "";
    let name, params = {};
    if (typeof q.fig === "string") name = q.fig;
    else { name = q.fig.name; params = q.fig; }
    if (!window.Fig[name]) return "";
    try { return `<div class="qfig">${window.Fig[name](params)}</div>`; }
    catch (e) { return ""; }
  }

  /* ---------------- 路由 ---------------- */
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const parts = h.split("/");
    document.querySelectorAll(".nav-link").forEach(a => a.classList.toggle("active", a.dataset.route === parts[0]));
    view().className = "view";
    updateBadge();
    if (parts[0] === "" || parts[0] === "path") return renderPath(parts[1] || null, parts[2] || null);
    if (parts[0] === "learn") return renderLearn(parts[1]);
    if (parts[0] === "practice") return renderQuiz(parts[1], "practice");
    if (parts[0] === "gate") return renderQuiz(parts[1], "gate");
    if (parts[0] === "review") return renderReview();
    if (parts[0] === "progress") return renderProgress();
    if (parts[0] === "ai") return renderDiagnose();
    if (parts[0] === "resources") return renderResources();
    renderPath(null, null);
  }
  window.addEventListener("hashchange", route);
  // 已在「薄弱点复习」页内再点该导航：hash 不变不会触发路由，手动重渲染，便于清完后立即看空状态
  document.querySelectorAll(".nav-link").forEach(a => a.addEventListener("click", () => {
    if (a.dataset.route === "review" && location.hash.replace(/^#\/?/, "") === "review") renderReview();
  }));

  // 返回学习路径，并定位/高亮到指定技巧节点（避免回到页面最顶部）
  function goPath(techId) {
    pendingScrollTech = techId || null;
    const target = curFilter.stage ? "#/path/" + curFilter.stage + (curFilter.grade ? "/" + curFilter.grade : "") : "#/path";
    if (location.hash.replace(/^#\/?/, "").indexOf("path") === 0) renderPath(curFilter.stage, curFilter.grade);
    else location.hash = target;
  }

  /* ---------------- 学习路径（侧边栏 + 主区） ---------------- */
  function renderPath(stage, grade) {
    curFilter = { stage: stage || null, grade: grade || null };
    const v = view(); v.className = "view path-view"; v.innerHTML = "";
    const layout = document.createElement("div");
    layout.className = "path-layout";
    layout.innerHTML = buildSidebar()
      + '<div class="sb-mask" id="sbMask"></div>'
      + '<div class="path-main" id="pathMain"></div>'
      + '<button class="sb-fab" id="sbFab">☰ ' + esc(T("sb.menu")) + '</button>';
    v.appendChild(layout);
    const topBtn = document.createElement("button");
    topBtn.className = "sb-top-btn"; topBtn.id = "sbTopBtn";
    topBtn.textContent = "☰ " + T("sb.pick");
    topBtn.addEventListener("click", () => layout.classList.toggle("sb-drawer-open"));
    layout.querySelector("#pathMain").insertBefore(topBtn, layout.querySelector("#pathMain").firstChild);
    renderPathMain(layout.querySelector("#pathMain"));
    bindSidebar(layout);
  }
  const TX = window.I18N.tx;
  // 技巧文案：中文原文在 data.js，英文在目录里；缺译文自动回落中文
  function techName(t) { return TX("tech." + t.id + ".name", t.name); }
  function techSummary(t) { return TX("tech." + t.id + ".summary", t.summary); }
  function techKou(t) { return TX("tech." + t.id + ".kou", t.kou); }
  function techSteps(t) { return t.steps.map((s, i) => TX("tech." + t.id + ".step." + i, s)); }
  // 静态题（无 qgen 的技巧才会用到）：按 技巧id + 题号 取译文，缺则回落中文原题
  function localizeStatic(t, q, qidx) {
    if (window.I18N.lang === "zh" || !q) return q;
    const base = "q." + t.id + "." + qidx;
    return Object.assign({}, q, {
      q: TX(base + ".q", q.q),
      opts: q.opts.map((o, i) => TX(base + ".opt." + i, o)),
      explain: TX(base + ".explain", q.explain),
      point: TX(base + ".point", q.point)
    });
  }
  function stageName(s) { return T("stage." + s); }
  function gradeName(g) { return T("grade." + String(g).replace("+", "")); }

  // 侧边栏：学段 → 年级 两级导航
  function buildSidebar() {
    let html = '<aside class="sidebar" id="sidebar">'
      + '<div class="sb-head"><span class="sb-title">' + esc(T("sb.title")) + '</span>'
      + '<button class="sb-toggle" id="sbToggle" title="' + esc(T("sb.toggle")) + '">«</button></div>';
    html += '<a class="sb-item' + (curFilter.stage ? "" : " active") + '" href="#/path"><span class="sb-ico">☰</span>' + esc(T("sb.all")) + '</a>';
    STAGES.forEach(stage => {
      const grades = [...new Set(TECHNIQUES.filter(t => t.stage === stage).map(t => t.grade))]
        .sort((a, b) => gradeNum(a) - gradeNum(b));
      if (!grades.length) return;
      const open = !curFilter.stage || curFilter.stage === stage;
      html += '<div class="sb-stage' + (open ? " open" : "") + '">';
      html += '<div class="sb-stage-h" data-stage="' + esc(stage) + '"><span class="sb-caret">' + (open ? "▾" : "▸") + '</span>'
        + esc(stageName(stage)) + '<span class="sb-cnt">' + grades.length + '</span></div>';
      html += '<div class="sb-grades">';
      html += '<a class="sb-grade' + (curFilter.stage === stage && !curFilter.grade ? " active" : "") + '" href="#/path/' + enc(stage) + '">' + esc(T("sb.allOf", { stage: stageName(stage) })) + '</a>';
      grades.forEach(g => {
        const cnt = TECHNIQUES.filter(t => t.stage === stage && t.grade === g).length;
        const act = curFilter.stage === stage && curFilter.grade === g ? " active" : "";
        html += '<a class="sb-grade' + act + '" href="#/path/' + enc(stage) + '/' + enc(g) + '">' + esc(gradeName(g))
          + '<span class="sb-cnt">' + cnt + '</span></a>';
      });
      html += '</div></div>';
    });
    html += '</aside>';
    return html;
  }
  function enc(s) { return encodeURIComponent(s); }

  function bindSidebar(layout) {
    const toggle = layout.querySelector("#sbToggle");
    if (toggle) toggle.addEventListener("click", () => layout.classList.toggle("sb-collapsed"));
    const fab = layout.querySelector("#sbFab");
    if (fab) fab.addEventListener("click", () => layout.classList.toggle("sb-drawer-open"));
    const mask = layout.querySelector("#sbMask");
    if (mask) mask.addEventListener("click", () => layout.classList.remove("sb-drawer-open"));
    layout.querySelectorAll(".sb-stage-h").forEach(h => {
      h.addEventListener("click", () => {
        h.parentElement.classList.toggle("open");
        const caret = h.querySelector(".sb-caret");
        if (caret) caret.textContent = h.parentElement.classList.contains("open") ? "▾" : "▸";
      });
    });
    layout.querySelectorAll(".sb-grade, .sb-item").forEach(a => {
      a.addEventListener("click", () => { if (window.innerWidth <= 820) layout.classList.remove("sb-drawer-open"); });
    });
  }

  // 主区域：按当前筛选渲染学段横幅 + 年级分隔 + 方法节点
  function renderPathMain(main) {
    const h = document.createElement("h2"); h.className = "section"; h.textContent = T("ui.nav.path"); main.appendChild(h);
    const hint = document.createElement("div"); hint.className = "hint";
    hint.textContent = T("path.hintSidebar");
    main.appendChild(hint);

    const groups = {};
    TECHNIQUES.forEach(t => { const k = t.stage + "|" + t.grade; (groups[k] = groups[k] || []).push(t); });

    let stepNo = 0;
    STAGES.forEach(stage => {
      if (curFilter.stage && curFilter.stage !== stage) return;
      const grades = [...new Set(TECHNIQUES.filter(t => t.stage === stage).map(t => t.grade))]
        .sort((a, b) => gradeNum(a) - gradeNum(b));
      if (!grades.length) return;
      const sb = document.createElement("div"); sb.className = "stage-banner";
      sb.innerHTML = `<span class="stage-name">${esc(stageName(stage))}</span><span class="stage-desc">${esc(stageDesc(stage))}</span>`;
      main.appendChild(sb);
      grades.forEach(g => {
        if (curFilter.grade && curFilter.grade !== g) return;
        const sub = document.createElement("div"); sub.className = "grade-sep";
        sub.innerHTML = `<span class="grade-tag">${esc(gradeName(g))}</span><span class="grade-count">${esc(T("prog.gradeCount", { n: groups[stage + "|" + g].length }))}</span>`;
        main.appendChild(sub);
        sortGroup(groups[stage + "|" + g]).forEach(t => {
          stepNo++;
          const st = tstate(t.id);
          const open = unlocked(t.id);
          const status = !open ? "lock" : (st.mastered ? "done" : "learn");
          const node = document.createElement("div");
          node.className = "node " + (status === "done" ? "mastered" : status === "lock" ? "locked" : "");
          const weakN = Object.keys(st.weak).filter(k => !st.weak[k].cleared).length;
          node.innerHTML = `
            <div class="step">${status === "done" ? "✓" : stepNo}</div>
            <div class="body">
              <div class="title">${esc(techName(t))}
                ${status === "lock" ? '<span class="lock-ico">🔒</span>' : ""}
                <span class="status-pill ${status === "lock" ? "lock" : status === "done" ? "done" : "learn"}">${esc(T("node.status." + status))}</span>
                ${weakN ? `<span class="tag w">${esc(T("node.weak", { n: weakN }))}</span>` : ""}
              </div>
              <div class="meta">${esc(techSummary(t))}</div>
              <div class="acts">
                ${open ? `<a class="btn sm" href="#/learn/${t.id}">${esc(T("act.learn"))}</a>` : ""}
                ${open ? `<a class="btn sm ghost" href="#/practice/${t.id}">${esc(T("act.practice"))}</a>` : ""}
                ${open && !st.mastered ? `<a class="btn sm soft" href="#/gate/${t.id}">${esc(T("act.gate"))}</a>` : ""}
              </div>
              ${status === "lock" ? `<div class="meta" style="color:var(--lock)">${esc(T("node.needPrereq", { name: techName(tech(t.prereq)) }))}</div>` : ""}
            </div>`;
          node.id = "node-" + t.id;
          main.appendChild(node);
        });
      });
    });
    if (pendingScrollTech) {
      const el = document.getElementById("node-" + pendingScrollTech);
      if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1800); }
      pendingScrollTech = null;
    }
  }

  /* ---------------- 学习页 ---------------- */
  function renderLearn(id) {
    const v = view(); v.innerHTML = "";
    const t = tech(id); if (!t) return renderPath();
    if (!unlocked(id)) { toast(T("toast.locked")); location.hash = "#/path"; return; }
    const st = tstate(id);

    const card = document.createElement("div"); card.className = "card";
    const exHtml = (t.questions || []).map((raw, qi) => {
      const q = localizeStatic(t, raw, qi) || raw;
      return `
      <div class="ex">
        <div class="ex-q"><span class="ex-no">${esc(T("learn.exNo", { n: qi + 1 }))}</span><span>${esc(q.q)}</span></div>
        <div class="ex-opts">
          ${q.opts.map((o, oi) => `<span class="ex-opt${oi === q.ans ? " correct" : ""}">${oi === q.ans ? "✓ " : ""}${esc(o)}</span>`).join("")}
        </div>
        <details class="ex-why"><summary>${esc(T("learn.showWhy"))}</summary>
          <div class="ex-exp">${esc(q.explain)}</div>
          <div class="ex-point">${esc(T("learn.exPoint", { point: q.point || "" }))}</div>
        </details>
      </div>`; }).join("");
    card.innerHTML = `
      <div class="tech-head"><h2 class="section" style="margin:0">${esc(techName(t))}</h2><span class="tag">${esc(gradeName(t.grade))}</span></div>
      <div class="muted">${esc(techSummary(t))}</div>
      <div class="kou"><b>${esc(T("learn.kou"))}</b>${esc(techKou(t))}</div>
      <h3>${esc(T("learn.steps"))}</h3>
      <ol class="steps">${techSteps(t).map(s => `<li>${s}</li>`).join("")}</ol>
      <h3>${esc(T("learn.examples"))} <span class="hint-inline">${esc(T("learn.examplesHint"))}</span></h3>
      <div class="ex-list">${exHtml || `<div class="muted">${esc(T("learn.noExamples"))}</div>`}</div>`;
    v.appendChild(card);

    if (t.anim && window.Anim && window.Anim[t.anim]) {
      const aw = document.createElement("div"); aw.className = "card";
      aw.innerHTML = `<h3>${esc(T("learn.anim"))}</h3><div class="anim-wrap" id="animBox"></div>`;
      v.appendChild(aw);
      window.Anim[t.anim](aw.querySelector("#animBox"));
    }

    const acts = document.createElement("div"); acts.className = "row";
    acts.style.margin = "4px 0 18px";
    acts.innerHTML = `
      <a class="btn" href="#/practice/${t.id}">${esc(typeof t.qgen === "function" ? T("learn.startGen") : T("learn.startStatic", { n: t.questions.length }))}</a>
      ${!st.mastered ? `<a class="btn soft" href="#/gate/${t.id}">${esc(T("act.gate"))}</a>` : `<span class="status-pill done">${esc(T("learn.mastered"))}</span>`}
      <a class="btn ghost" id="backBtnL" href="#/path">${esc(T("learn.backPath"))}</a>`;
    v.appendChild(acts);
    acts.querySelector("#backBtnL").addEventListener("click", (e) => { e.preventDefault(); goPath(t.id); });
  }

  /* ---------------- 练习 / 通关 ---------------- */
  function shuffleOptions(q) {
    const idx = q.opts.map((_, i) => i);
    const sh = shuffle(idx);
    return { opts: sh.map(i => q.opts[i]), ans: sh.indexOf(q.ans) };
  }

  // 判断题识别：仅 2 个选项且语义为「对/错」
  // 词表跨语言合并，否则切到英文后 True/False 认不出来，✓/✗ 样式会悄悄消失
  const JUDGE_YES = judgeVocab("ui.judge.yes", ["对", "正确", "✓", "✔"]);
  const JUDGE_NO = judgeVocab("ui.judge.no", ["错", "错误", "✗", "✘"]);
  function judgeVocab(key, base) {
    const set = new Set(base);
    window.I18N.langs.forEach(l => {
      const v = (window["I18N_" + l.toUpperCase()] || {})[key];
      if (typeof v === "string") v.split("|").forEach(x => set.add(x.trim()));
    });
    return set;
  }
  function isJudge(q) {
    if (!q.opts || q.opts.length !== 2) return false;
    const s = q.opts.map(x => String(x).trim());
    return s.some(x => JUDGE_YES.has(x)) && s.some(x => JUDGE_NO.has(x));
  }
  // 判断题标记：✓ 对 / ✗ 错
  function judgeMark(text) {
    return JUDGE_YES.has(String(text).trim()) ? "✓" : "✗";
  }

  /* ---------------- 跨组去重出题引擎 ----------------
   * 目标：同一方法「再练一组」时，新组与最近 10 组已做过的题不重复；
   *       单组内也不重复。题库足够大时即可做到 10 组(80 题)内互不重复。
   */
  const roundHistory = {}; // { techId: [ Set(本轮指纹), ... 最多保留 10 组 ] }
  function quizFP(q) {
    const ans = q.opts ? String(q.opts[q.ans]) : "";
    return (q.q || "").replace(/\s+/g, "") + " " + ans;
  }
  function genRound(t, count) {
    const arr = roundHistory[t.id] || [];
    const hist = new Set();
    arr.slice(-9).forEach(s => s.forEach(f => hist.add(f))); // 最近 9 组，保证 10 组内不重
    const used = new Set();
    const out = [];
    let tries = 0;
    while (out.length < count && tries < 80) {
      tries++;
      const b = t.qgen(count);
      for (const c of b) {
        const f = quizFP(c);
        if (hist.has(f) || used.has(f)) continue;
        used.add(f); out.push(c);
        if (out.length >= count) break;
      }
    }
    // 题库不足时（如某些基础法题型极少），仅保证本轮内不重复，避免卡死
    let t2 = 0;
    while (out.length < count && t2 < 80) {
      t2++;
      const b = t.qgen(count);
      for (const c of b) {
        const f = quizFP(c);
        if (used.has(f)) continue;
        used.add(f); out.push(c);
        if (out.length >= count) break;
      }
    }
    while (out.length < count) { const b = t.qgen(count); out.push(b[out.length % b.length]); }
    arr.push(used);
    if (arr.length > 10) arr.shift();
    roundHistory[t.id] = arr;
    return out.slice(0, count);
  }

  function renderQuiz(id, mode, planItems) {
    const v = view(); v.innerHTML = "";
    const isPlan = !!planItems;
    let t = id ? tech(id) : null;
    if (!isPlan && !t) return renderPath();
    if (!isPlan && !unlocked(id)) { toast(T("toast.locked")); location.hash = "#/path"; return; }
    const st = isPlan ? null : tstate(id);

    let items; // {q, qidx, gen, t, key}
    if (isPlan) {
      items = planItems;
    } else {
      const genMode = typeof t.qgen === "function";
      if (genMode) {
        // 参数化出题 + 跨组去重：再练一组会与最近 10 组已做过的题去重，做到 10 组内不重复
        items = genRound(t, 8).map((q, idx) => ({ q, qidx: idx, gen: true, t, key: t.id }));
      } else {
        let pool;
        if (mode === "gate") {
          const weakIdx = Object.keys(st.weak).filter(k => !st.weak[k].cleared).map(Number);
          const rest = shuffle(t.questions.map((_, i) => i)).filter(i => !weakIdx.includes(i));
          pool = weakIdx.concat(rest).slice(0, Math.max(5, weakIdx.length));
        } else {
          const n = t.questions.length;
          const k = n <= 6 ? n : Math.max(5, Math.ceil(n * 0.7));
          pool = shuffle(t.questions.map((_, i) => i)).slice(0, k);
        }
        items = pool.map(i => ({ q: t.questions[i], qidx: i, gen: false, t, key: "" + i }));
      }
    }
    const total = items.length;
    let answered = 0, correct = 0;

    const headTitle = isPlan ? esc(T("plan.title"))
      : `${esc(techName(t))} · ${esc(mode === "gate" ? T("quiz.titleGate") : T("quiz.titlePractice"))}`;
    const headSub = isPlan ? T("plan.sub")
      : (mode === "gate" ? T("quiz.descGate") : T("quiz.descPractice"));
    const head = document.createElement("div"); head.className = "card";
    head.innerHTML = `<div class="tech-head"><h2 class="section" style="margin:0">${headTitle}</h2>
      <span class="tag">${esc(isPlan ? T("plan.tag") : (mode === "gate" ? T("quiz.tagGate") : T("quiz.tagPractice")))}</span></div>
      <div class="muted">${esc(headSub)}</div>`;
    v.appendChild(head);

    const list = document.createElement("div"); v.appendChild(list);

    function finish() {
      const weakRemain = isPlan ? weakCount() : Object.keys(st.weak).filter(k => !st.weak[k].cleared).length;
      const banner = document.createElement("div"); banner.className = "card center";
      if (mode === "gate" && !isPlan) {
        // 参数化题 8 道共用一个薄弱点键（技巧 id），按「最后一次答对/答错」决定清零与否，结果取决于答题顺序；
        // 所以这类技巧只看正确率，答错仍照常记入薄弱点供复习
        const genMode = typeof t.qgen === "function";
        const pass = correct >= Math.ceil(total * 0.8) && (genMode || weakRemain === 0);
        if (pass) {
          st.mastered = true; save(state);
          const nxt = TECHNIQUES.find(x => x.prereq === t.id);
          const freeToEnter = gradeNum(t.grade) >= 9;
          banner.innerHTML = `<div class="qres" style="color:var(--ok)">${esc(T("quiz.pass", { name: techName(t) }))}</div>
            ${nxt ? `<div class="muted">${T("quiz.nextUnlocked", { name: `<b>${esc(techName(nxt))}</b>` })}</div>
              <a class="btn" href="#/learn/${nxt.id}" style="margin-top:10px">${esc(T("quiz.goLearn", { name: techName(nxt) }))}</a>`
              : (freeToEnter ? `<div class="muted">${esc(T("quiz.freeToEnter"))}</div>`
                : `<div class="muted">${esc(T("quiz.lastOne"))}</div>`)}`;
        } else {
          banner.innerHTML = `<div class="qres" style="color:var(--warn)">${esc(T("quiz.fail", { correct, total, weak: weakRemain ? T("quiz.failWeak", { n: weakRemain }) : "" }))}</div>
            <div class="muted">${esc(T("quiz.failHint"))}</div>
            <a class="btn soft" href="#/review" style="margin-top:8px">${esc(T("quiz.goReview"))}</a>`;
        }
      } else {
        banner.innerHTML = `<div class="qres">${esc(T("quiz.doneRound", { total, correct }))}</div>
          <a class="btn ghost" id="backBtn2" href="#/ai">${esc(T("plan.back"))}</a>`;
        banner.querySelector("#backBtn2").addEventListener("click", (e) => { e.preventDefault(); location.hash = "#/ai"; });
      }
      list.appendChild(banner);
      updateBadge();
    }

    items.forEach((it, qi) => {
      const q = it.q;
      const judge = isJudge(q);
      const disp = judge ? { opts: q.opts, ans: q.ans } : shuffleOptions(q);
      const card = document.createElement("div"); card.className = "q"; card.dataset.done = "0";
      // 中文难度串既是判别键也是 CSS 类的来源，只在展示时取译文
      const tag = q.level === "易错" ? `<span class="tag w">${esc(T("level.易错"))}</span>`
        : (q.level === "进阶" ? `<span class="tag g">${esc(T("level.进阶"))}</span>`
          : `<span class="tag">${esc(T("level.基础"))}</span>`);
      const fig = renderFigOf(q);
      card.innerHTML = `<div class="qtext">${qi + 1}. ${esc(q.q)} ${tag}</div>
        ${fig}
        <div class="opts${judge ? " judge" : ""}">${disp.opts.map((o, i) => `<div class="opt${judge ? " judge" : ""}" data-i="${i}"><span class="mark${judge ? " judge" : ""}">${judge ? judgeMark(o) : String.fromCharCode(65 + i)}</span><span>${esc(o)}</span></div>`).join("")}</div>`;
      list.appendChild(card);

      const opts = card.querySelectorAll(".opt");
      opts.forEach(op => op.addEventListener("click", () => {
        if (card.dataset.done === "1") return;
        card.dataset.done = "1";
        const chosen = +op.dataset.i;
        const ans = disp.ans;
        opts.forEach((o, i) => { o.style.pointerEvents = "none"; if (i === ans) o.classList.add("correct"); });
        if (chosen === ans) op.classList.add("correct"); else op.classList.add("wrong");
        const ex = document.createElement("div"); ex.className = "explain"; ex.innerHTML = esc(T("quiz.explain")) + esc(q.explain); card.appendChild(ex);

        const itT = it.t, itSt = tstate(itT.id), itKey = it.gen ? itT.id : it.key;
        if (chosen === ans) {
          correct++;
          if (mode === "gate" && !isPlan) {
            // 通关测试（正式测验）：做对一次即清零该薄弱点
            if (it.gen) itSt.weak[itT.id] = { fails: 0, cleared: true, passes: 1, lastTime: Date.now(), attempts: 1 };
            else if (itSt.weak[itKey]) { itSt.weak[itKey].cleared = true; itSt.weak[itKey].passes = 1; itSt.weak[itKey].lastTime = Date.now(); itSt.weak[itKey].attempts = (itSt.weak[itKey].attempts || 0) + 1; }
          } else {
            // 自由练习 / 套餐：需连对 2 次（跨「再练一组」累计）才消除；单次做对只记 1 次通过
            if (it.gen) {
              const w = itSt.weak[itT.id] || { fails: 0, cleared: false, passes: 0, attempts: 0 };
              w.passes = (w.passes || 0) + 1; w.cleared = w.passes >= 2; w.fails = 0; w.lastTime = Date.now(); w.attempts = (w.attempts || 0) + 1; itSt.weak[itT.id] = w;
            } else if (itSt.weak[itKey]) {
              const w = itSt.weak[itKey]; w.passes = (w.passes || 0) + 1; w.cleared = w.passes >= 2; w.fails = 0; w.lastTime = Date.now(); w.attempts = (w.attempts || 0) + 1;
            }
          }
        } else {
          if (it.gen) { const w = itSt.weak[itT.id] || { fails: 0, cleared: false, passes: 0, attempts: 0 }; w.fails++; w.cleared = false; w.passes = 0; w.lastTime = Date.now(); w.attempts = (w.attempts || 0) + 1; itSt.weak[itT.id] = w; }
          else { const w = itSt.weak[itKey] || { fails: 0, cleared: false, passes: 0, attempts: 0 }; w.fails++; w.cleared = false; w.passes = 0; w.lastTime = Date.now(); w.attempts = (w.attempts || 0) + 1; itSt.weak[itKey] = w; }
        }
        save(state); updateBadge();
        answered++;
        if (answered === total) finish();
      }));
    });

    if (mode === "practice" || isPlan) {
      const again = document.createElement("div"); again.className = "row"; again.style.margin = "6px 0 16px";
      if (isPlan) {
        again.innerHTML = `<a class="btn ghost" id="againBtn" href="#/ai">${esc(T("plan.again"))}</a><a class="btn soft" id="backBtn" href="#/ai">${esc(T("plan.back"))}</a>`;
      } else {
        again.innerHTML = `<a class="btn ghost" id="againBtn" href="#/practice/${t.id}">${esc(T("quiz.again"))}</a><a class="btn soft" id="backBtn" href="#/path">${esc(T("learn.backPath"))}</a>`;
      }
      v.appendChild(again);
      again.querySelector("#againBtn").addEventListener("click", (e) => {
        e.preventDefault();
        if (isPlan) startPlan(); else renderQuiz(t.id, "practice"); // 重新进入会重新随机抽题 / 重新生成，做到「再练一组」立即出新题
      });
      again.querySelector("#backBtn").addEventListener("click", (e) => {
        e.preventDefault();
        if (isPlan) location.hash = "#/ai"; else goPath(t.id);
      });
    }
  }

  /* ---------------- 薄弱点复习（连对 2 道同类题才消除） ---------------- */
  function nextWeakQ(it) {
    if (it.gen) return it.t.qgen(1)[0];          // 参数化方法：永远是新生成的同类题
    const qs = it.t.questions, j = Math.floor(Math.random() * qs.length);
    return qs[j];                                 // 静态方法：从本法所有题里抽一道同类题确认
  }
  function renderReview() {
    const v = view(); v.innerHTML = "";
    const h = document.createElement("h2"); h.className = "section"; h.textContent = T("review.title"); v.appendChild(h);
    const items = [];
    TECHNIQUES.forEach(t => {
      const st = tstate(t.id);
      const gen = typeof t.qgen === "function";
      Object.keys(st.weak).forEach(k => {
        if (st.weak[k].cleared) return;
        items.push(gen
          ? { t, gen: true, key: t.id, q: t.qgen(1)[0] }       // 整法为薄弱点
          : { t, gen: false, key: "" + k, q: t.questions[+k] }); // 具体某题
      });
    });
    if (!items.length) {
      v.innerHTML += `<div class="empty">${esc(T("review.empty"))}</div>`;
      return;
    }
    const tip = document.createElement("div"); tip.className = "hint";
    tip.textContent = T("review.hintStreak", { n: items.length });
    v.appendChild(tip);

    let clearedCount = 0; const total = items.length;
    const prog = document.createElement("div"); prog.className = "rev-prog";
    v.appendChild(prog);
    const list = document.createElement("div"); v.appendChild(list);
    function refreshProg() { prog.innerHTML = T("review.prog", { done: `<b>${clearedCount}</b>`, total, left: `<b>${total - clearedCount}</b>` }); }
    refreshProg();

    function paintCard(card, it, passes) {
      card.dataset.done = "0";
      const q = it.q, judge = isJudge(q);
      const disp = judge ? { opts: q.opts, ans: q.ans } : shuffleOptions(q);
      const fig = renderFigOf(q);
      card.innerHTML = `<div class="qtext">${esc(techName(it.t))}${esc(T("review.sep"))}${esc(q.q)}</div>${fig}
        <div class="opts${judge ? " judge" : ""}">${disp.opts.map((o, j) => `<div class="opt${judge ? " judge" : ""}" data-i="${j}"><span class="mark${judge ? " judge" : ""}">${judge ? judgeMark(o) : String.fromCharCode(65 + j)}</span><span>${esc(o)}</span></div>`).join("")}</div>`;
      const opts = card.querySelectorAll(".opt");
      opts.forEach(op => op.addEventListener("click", () => {
        if (card.dataset.done === "1") return; card.dataset.done = "1";
        const chosen = +op.dataset.i, ans = disp.ans;
        opts.forEach((o, j) => { o.style.pointerEvents = "none"; if (j === ans) o.classList.add("correct"); });
        if (chosen === ans) op.classList.add("correct"); else op.classList.add("wrong");
        const ex = document.createElement("div"); ex.className = "explain"; ex.innerHTML = esc(T("quiz.explain")) + esc(q.explain); card.appendChild(ex);
        const w = tstate(it.t.id).weak[it.key] || (tstate(it.t.id).weak[it.key] = { fails: 0, cleared: false, passes: 0, lastTime: 0, attempts: 0 });
        if (chosen === ans) {
          passes++; w.passes = passes; w.fails = 0; w.lastTime = Date.now(); w.attempts = (w.attempts || 0) + 1;
          if (passes >= 2) {
            w.cleared = true; clearedCount++; save(state); updateBadge(); refreshProg();
            card.classList.add("cleared");
            const note = document.createElement("div"); note.className = "rev-note ok"; note.textContent = T("review.cleared"); card.appendChild(note);
            if (clearedCount === total) {
              const b = document.createElement("div"); b.className = "card center";
              b.innerHTML = `<div class="qres" style="color:var(--ok)">${esc(T("review.allClear", { total }))}</div>`;
              list.appendChild(b);
              setTimeout(() => renderReview(), 1100); // 自动重渲染，展示空状态
            }
          } else {
            w.cleared = false; w.lastTime = Date.now(); w.attempts = (w.attempts || 0) + 1; save(state); updateBadge();
            const note = document.createElement("div"); note.className = "rev-note ok"; note.textContent = T("review.firstOk"); card.appendChild(note);
            it.q = nextWeakQ(it);
            setTimeout(() => paintCard(card, it, passes), 650);
          }
        } else {
          passes = 0; w.passes = 0; w.cleared = false; w.fails = (w.fails || 0) + 1; w.lastTime = Date.now(); w.attempts = (w.attempts || 0) + 1; save(state); updateBadge();
          const note = document.createElement("div"); note.className = "rev-note bad"; note.textContent = T("review.wrongReset"); card.appendChild(note);
          it.q = nextWeakQ(it);
          setTimeout(() => paintCard(card, it, passes), 650);
        }
      }));
    }

    items.forEach(it => {
      const card = document.createElement("div"); card.className = "q"; card.dataset.done = "0";
      list.appendChild(card);
      const w = tstate(it.t.id).weak[it.key];
      paintCard(card, it, (w && w.passes) || 0);
    });
  }

  /* ---------------- 进度 ---------------- */
  /* ---------------- AI 知识漏洞诊断 + 个性化出题 ---------------- */
  // 严重程度评分：错得越多、连对越少、越久没练 → 越该优先
  function sevScore(w, now) {
    const fails = w.fails || 0;
    const passes = w.passes || 0;
    const days = w.lastTime ? (now - w.lastTime) / 86400000 : 30;
    let s = fails * 3 + (passes >= 1 ? 0 : 4) + Math.min(days, 30) * 0.15;
    if (passes >= 2) s *= 0.4;
    return Math.round(s * 10) / 10;
  }
  // 收集所有未清零薄弱点，附方法信息，按严重程度降序
  function collectWeak(now) {
    const out = [];
    TECHNIQUES.forEach(t => {
      const st = state[t.id]; if (!st) return;
      Object.keys(st.weak).forEach(k => {
        const w = st.weak[k];
        if (w.cleared) return;
        out.push({
          t, key: k, w,
          gen: !!t.qgen,
          qidx: t.qgen ? -1 : (+k),
          sev: sevScore(w, now),
          grade: t.grade, stage: t.stage
        });
      });
    });
    out.sort((a, b) => b.sev - a.sev);
    return out;
  }
  function analyzeWeakness() {
    const now = Date.now();
    const weak = collectWeak(now);
    const total = TECHNIQUES.length;
    const mastered = TECHNIQUES.filter(t => state[t.id] && state[t.id].mastered).length;
    const byStage = {};
    STAGES.forEach(s => byStage[s] = { total: 0, mastered: 0, weak: 0, learning: 0 });
    TECHNIQUES.forEach(t => {
      const st = state[t.id]; const b = byStage[t.stage];
      b.total++;
      if (st && st.mastered) b.mastered++;
      else if (unlocked(t.id)) b.learning++;
      if (st && Object.keys(st.weak).some(k => !st.weak[k].cleared)) b.weak++;
    });
    const byGrade = {};
    weak.forEach(x => { byGrade[x.grade] = (byGrade[x.grade] || 0) + 1; });
    const top = weak.slice(0, 5);
    const stubborn = weak.filter(x => (x.w.fails || 0) >= 3 && (x.w.passes || 0) < 2);
    const warming = weak.filter(x => (x.w.passes || 0) >= 1 && (x.w.passes || 0) < 2);
    const days = d => d <= 0 ? T("ago.today") : d < 1 ? T("ago.yesterday")
      : d < 7 ? T("ago.days", { n: Math.floor(d) })
      : d < 30 ? T("ago.weeks", { n: Math.floor(d / 7) })
      : T("ago.months", { n: Math.floor(d / 30) });
    return { now, weak, total, mastered, byStage, byGrade, top, stubborn, warming, days };
  }
  // 个性化排程：每个薄弱点按严重程度出 1~3 题
  function genPlan() {
    const r = analyzeWeakness();
    const items = [];
    r.weak.forEach(x => {
      const cnt = x.sev >= 9 ? 3 : (x.sev >= 4 ? 2 : 1);
      if (x.gen) {
        for (let i = 0; i < cnt; i++) items.push({ t: x.t, q: x.t.qgen(1)[0], qidx: -1, gen: true, key: x.key });
      } else {
        const qs = x.t.questions, picks = shuffle(qs.map((_, i) => i)).slice(0, Math.min(cnt, qs.length));
        picks.forEach(pi => items.push({ t: x.t, q: qs[pi], qidx: pi, gen: false, key: x.key }));
      }
    });
    return { items, weakCount: r.weak.length, summary: r };
  }
  function startPlan() {
    const r = genPlan();
    if (!r.items.length) { toast(T("plan.none")); location.hash = "#/ai"; return; }
    renderQuiz(null, "plan", r.items);
  }
  function buildConclusion(r) {
    if (!r.weak.length) return T("diag.noWeak");
    const parts = [];
    const stageRank = STAGES.map(s => ({ s, n: r.byStage[s].weak })).sort((a, b) => b.n - a.n).filter(x => x.n > 0);
    if (stageRank.length) {
      const top = stageRank[0];
      parts.push(T("diag.topStage", { stage: `<b>${esc(stageName(top.s))}</b>`, n: top.n }));
    }
    if (r.stubborn.length) {
      parts.push(T("diag.stubborn", { n: `<b>${r.stubborn.length}</b>` }));
    }
    if (r.warming.length) {
      parts.push(T("diag.warming", { n: `<b>${r.warming.length}</b>` }));
    }
    const hardest = r.top[0];
    if (hardest) {
      const when = hardest.w.lastTime
        ? (() => { const d = Math.floor((r.now - hardest.w.lastTime) / 86400000);
            return d <= 0 ? T("ago.today") : d < 7 ? T("ago.days", { n: d }) : T("ago.longAgo"); })()
        : T("ago.never");
      parts.push(T("diag.hardest", { name: `<b>${esc(techName(hardest.t))}</b>`, grade: esc(gradeName(hardest.grade)), when, fails: hardest.w.fails || 0 }));
    }
    parts.push(T("diag.callToAction"));
    return parts.join("");
  }
  function renderDiagnose() {
    const v = view(); v.innerHTML = "";
    const r = analyzeWeakness();
    const h = document.createElement("h2"); h.className = "section"; h.textContent = T("diag.title"); v.appendChild(h);

    const pct = Math.round(r.mastered / r.total * 100);
    const head = document.createElement("div"); head.className = "card diag-head";
    head.innerHTML = `<div class="diag-top">
        <div class="diag-mastery"><div class="n">${pct}%</div><div class="l">${esc(T("diag.overall"))}</div></div>
        <div class="diag-stats">
          <div><b>${r.mastered}</b> ${esc(T("prog.mastered"))}</div>
          <div><b>${r.weak.length}</b> ${esc(T("prog.weak"))}</div>
          <div><b>${r.stubborn.length}</b> ${esc(T("diag.sevHigh"))}</div>
          <div><b>${r.warming.length}</b> ${esc(T("diag.nearClear"))}</div>
        </div>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>`;
    v.appendChild(head);

    const stageCard = document.createElement("div"); stageCard.className = "card";
    stageCard.innerHTML = `<h3>${esc(T("diag.byStage"))}</h3>` + STAGES.map(s => {
      const b = r.byStage[s]; if (!b.total) return "";
      const wpct = Math.round(b.weak / b.total * 100);
      return `<div class="stage-row"><span class="stage-name">${esc(stageName(s))}</span>
        <div class="bar mini"><i class="warn" style="width:${wpct}%"></i></div>
        <span class="stage-num">${esc(T("diag.weakOf", { weak: b.weak, total: b.total }))}</span></div>`;
    }).join("");
    v.appendChild(stageCard);

    const cb = document.createElement("div"); cb.className = "card diag-concl";
    cb.innerHTML = `<h3>${esc(T("diag.conclusion"))}</h3><div class="muted">${buildConclusion(r)}</div>`;
    v.appendChild(cb);

    const acts = document.createElement("div"); acts.className = "row"; acts.style.margin = "4px 0 12px";
    if (r.weak.length) {
      acts.innerHTML = `<button class="btn" id="planBtn">${esc(T("plan.start", { n: r.weak.length }))}</button>
        <a class="btn soft" href="#/review">${esc(T("diag.goReview"))}</a>`;
      acts.querySelector("#planBtn").addEventListener("click", () => startPlan());
    } else {
      acts.innerHTML = `<div class="qres" style="color:var(--ok)">${esc(T("diag.allClear"))}</div>
        <a class="btn soft" href="#/path">${esc(T("diag.goPractise"))}</a>`;
    }
    v.appendChild(acts);

    if (r.weak.length) {
      const hl = document.createElement("h3"); hl.textContent = T("diag.listTitle"); v.appendChild(hl);
      const list = document.createElement("div"); list.className = "diag-list";
      r.weak.forEach(x => {
        const lvl = x.sev >= 9 ? [T("diag.sevHigh"), "bad"] : (x.sev >= 4 ? [T("diag.sevMid"), "warn"] : [T("diag.sevLow"), "ok"]);
        const status = (x.w.passes || 0) >= 1 ? T("diag.oneToGo")
          : ((x.w.fails || 0) >= 3 ? T("diag.wrongStreak", { n: x.w.fails }) : T("diag.wrongCount", { n: x.w.fails || 0 }));
        const whenTxt = x.w.lastTime ? r.days((r.now - x.w.lastTime) / 86400000) : T("ago.never");
        const row = document.createElement("div"); row.className = "diag-item";
        row.innerHTML = `<div class="di-main"><div class="di-name">${esc(techName(x.t))}</div>
          <div class="di-meta">${esc(gradeName(x.grade))} · ${esc(status)} · ${esc(T("diag.lastPractice", { when: whenTxt }))}</div></div>
          <span class="tag ${lvl[1]}">${esc(lvl[0])}</span>`;
        list.appendChild(row);
      });
      v.appendChild(list);
    }
  }

  function renderProgress() {
    const v = view(); v.innerHTML = "";
    const total = TECHNIQUES.length;
    const mastered = TECHNIQUES.filter(t => state[t.id] && state[t.id].mastered).length;
    const learning = TECHNIQUES.filter(t => unlocked(t.id) && !(state[t.id] && state[t.id].mastered)).length;
    const locked = total - mastered - learning;
    const wn = weakCount();

    const grid = document.createElement("div"); grid.className = "stat-grid";
    grid.innerHTML = `
      <div class="stat"><div class="n">${mastered}</div><div class="l">${esc(T("prog.mastered"))}</div></div>
      <div class="stat"><div class="n">${learning}</div><div class="l">${esc(T("prog.learning"))}</div></div>
      <div class="stat"><div class="n">${locked}</div><div class="l">${esc(T("prog.locked"))}</div></div>
      <div class="stat"><div class="n">${wn}</div><div class="l">${esc(T("prog.weak"))}</div></div>`;
    v.appendChild(grid);

    const pct = Math.round(mastered / total * 100);
    const bar = document.createElement("div"); bar.className = "card";
    bar.innerHTML = `<div class="muted">${esc(T("prog.total", { pct }))}</div><div class="bar"><i style="width:${pct}%"></i></div>`;
    v.appendChild(bar);

    // 学员管理：改名 / 删除；进度重置只影响当前学员
    const cur = activeProfile();
    const prow = document.createElement("div"); prow.className = "row"; prow.style.marginTop = "8px";
    prow.innerHTML = `<span class="muted">${esc(T("profile.current", { name: cur.name }))}</span>
      <button class="btn ghost sm" id="renameBtn">${esc(T("profile.rename"))}</button>
      <button class="btn ghost sm" id="delBtn">${esc(T("profile.delete"))}</button>`;
    v.appendChild(prow);
    $("#renameBtn").addEventListener("click", () => {
      const name = (prompt(T("profile.renamePrompt"), cur.name) || "").trim();
      if (!name) return;
      renameProfile(cur.id, name); paintProfiles(); route();
    });
    $("#delBtn").addEventListener("click", () => {
      if (!confirm(T("profile.deleteConfirm", { name: cur.name }))) return;
      deleteProfile(cur.id); afterProfileChange();
    });

    // 导出 / 导入：跨 origin、跨设备搬家用，同时也是一份备份
    const many = readProfiles().list.length > 1;
    const io = document.createElement("div"); io.className = "row"; io.style.marginTop = "8px";
    io.innerHTML = `<button class="btn ghost sm" id="expBtn">${esc(T("io.export"))}</button>
      ${many ? `<button class="btn ghost sm" id="expAllBtn">${esc(T("io.exportAll"))}</button>` : ""}
      <button class="btn ghost sm" id="impBtn">${esc(T("io.import"))}</button>`;
    v.appendChild(io);
    $("#expBtn").addEventListener("click", () => downloadExport([cur.id], cur.name));
    if (many) $("#expAllBtn").addEventListener("click", () =>
      downloadExport(readProfiles().list.map(x => x.id), T("io.allSuffix")));
    $("#impBtn").addEventListener("click", () => {
      const f = $("#importFile");
      if (f) { f.value = ""; f.click(); }        // 清空 value，同一个文件才能再次触发 change
    });

    const reset = document.createElement("div"); reset.className = "row"; reset.style.marginTop = "8px";
    reset.innerHTML = `<button class="btn ghost sm" id="resetBtn">${esc(T("prog.reset"))}</button>`;
    v.appendChild(reset);
    $("#resetBtn").addEventListener("click", () => {
      if (confirm(T("prog.resetConfirm", { name: cur.name }))) { state = {}; save(state); toast(T("prog.resetDone")); route(); }
    });

    const h = document.createElement("h3"); h.textContent = T("prog.techStatus"); v.appendChild(h);
    const tree = document.createElement("div"); tree.className = "tree";
    const groups = {};
    TECHNIQUES.forEach(t => { const k = t.stage + "|" + t.grade; (groups[k] = groups[k] || []).push(t); });
    STAGES.forEach(stage => {
      const grades = [...new Set(TECHNIQUES.filter(t => t.stage === stage).map(t => t.grade))]
        .sort((a, b) => gradeNum(a) - gradeNum(b));
      if (!grades.length) return;
      const sb = document.createElement("div"); sb.className = "stage-banner sm";
      sb.innerHTML = `<span class="stage-name">${esc(stageName(stage))}</span>`;
      tree.appendChild(sb);
      grades.forEach(g => {
        const sub = document.createElement("div"); sub.className = "grade-sep";
        sub.innerHTML = `<span class="grade-tag">${esc(gradeName(g))}</span><span class="grade-count">${esc(T("prog.gradeCount", { n: groups[stage + "|" + g].length }))}</span>`;
        tree.appendChild(sub);
        sortGroup(groups[stage + "|" + g]).forEach(t => {
          const st = tstate(t.id);
          const open = unlocked(t.id);
          const status = !open ? "lock" : (st.mastered ? "done" : "learn");
          const weakN = Object.keys(st.weak).filter(k => !st.weak[k].cleared).length;
          const node = document.createElement("div");
          node.className = "node " + (status === "done" ? "mastered" : status === "lock" ? "locked" : "");
          node.innerHTML = `<div class="step">${status === "done" ? "✓" : (open ? "●" : "🔒")}</div>
            <div class="body"><div class="title">${esc(techName(t))}
              <span class="status-pill ${status === "lock" ? "lock" : status === "done" ? "done" : "learn"}">${esc(T("node.status." + status))}</span>
              ${weakN ? `<span class="tag w">${esc(T("node.weak", { n: weakN }))}</span>` : ""}</div>
            ${open ? `<div class="acts"><a class="btn sm" href="#/practice/${t.id}">${esc(T("act.practice"))}</a>${!st.mastered ? `<a class="btn sm soft" href="#/gate/${t.id}">${esc(T("prog.gate"))}</a>` : ""}</div>` : ""}</div>`;
          tree.appendChild(node);
        });
      });
    });
    v.appendChild(tree);
  }

  /* ---------------- 相关项目推荐 ---------------- */
  function renderResources() {
    const v = view(); v.innerHTML = "";
    const h = document.createElement("h2"); h.className = "section"; h.textContent = T("res.title"); v.appendChild(h);
    const hint = document.createElement("div"); hint.className = "hint";
    hint.textContent = T("res.hint");
    v.appendChild(hint);

    const cats = window.RELATED_PROJECTS || [];
    cats.forEach((cat, ci) => {
      const wrap = document.createElement("div"); wrap.className = "card";
      wrap.innerHTML = `<h3 class="res-cat">${esc(TX("res.cat." + ci, cat.category))}</h3>
        <div class="res-desc">${esc(TX("res.cat." + ci + ".desc", cat.desc))}</div>`;
      const grid = document.createElement("div"); grid.className = "res-grid";
      (cat.items || []).forEach((it, ii) => {
        const link = it.cnUrl || it.url;
        const card = document.createElement("a");
        card.className = "res-item";
        card.href = link;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        const base = "res.item." + ci + "." + ii;
        const tags = (it.tags || []).map((tg, ti) => `<span class="res-tag">${esc(TX(base + ".tag." + ti, tg))}</span>`).join("");
        card.innerHTML = `
          <div class="res-head">
            <span class="res-name">${esc(TX(base + ".name", it.name))}</span>
            <span class="res-tags">${tags}</span>
          </div>
          <div class="res-summary">${esc(TX(base + ".summary", it.summary))}</div>
          <div class="res-why"><b>${esc(T("res.why"))}</b>${esc(TX(base + ".why", it.why))}</div>
          <div class="res-url">${esc(link)}</div>`;
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
      v.appendChild(wrap);
    });

    if (!cats.length) {
      v.innerHTML += `<div class="empty">${esc(T("res.empty"))}</div>`;
    }
  }

  /* ---------------- 语言切换 ---------------- */
  // 外壳（品牌、导航、按钮）不走路由渲染，语言变化时单独刷一遍
  function paintShell() {
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = T(el.dataset.i18n); });
    const b = $("#langBtn");
    if (b) { b.textContent = T("ui.lang.next"); b.title = T("ui.lang.title"); }
    paintProfiles();
    window.I18N.applyDocument();
  }
  // 学员下拉：现有档案 + 末尾一个「新建」项
  function paintProfiles() {
    const sel = $("#profileSel");
    if (!sel) return;
    const p = readProfiles();
    sel.title = T("profile.label");
    sel.innerHTML = p.list.map(x =>
      `<option value="${esc(x.id)}"${x.id === p.active ? " selected" : ""}>${esc(x.name)}</option>`
    ).join("") + `<option value="__new">${esc(T("profile.new"))}</option>`;
  }
  // 换人/新建之后：重读进度、重画外壳与角标、重走路由
  function afterProfileChange() {
    state = load(); paintProfiles(); updateBadge(); route();
  }
  $("#profileSel").addEventListener("change", e => {
    const v = e.target.value;
    if (v === "__new") {
      const p = readProfiles();
      const name = (prompt(T("profile.newPrompt"), defaultName(p.list.length + 1)) || "").trim();
      if (!name) { paintProfiles(); return; }        // 取消：把选中项还原成当前学员
      addProfile(name);
    } else {
      const p = readProfiles();
      if (v === p.active) return;
      p.active = v; writeProfiles(p);
    }
    afterProfileChange();
  });
  // 文件选择框常驻在 index.html，监听只挂一次（renderProgress 每次都会重建按钮）
  $("#importFile").addEventListener("change", e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    Promise.resolve(f.text()).then(text => {
      const r = applyImport(text);
      if (!r.ok) { toast(r.error); return; }
      toast(T("io.imported", { n: r.count }));
      afterProfileChange();
    }).catch(() => toast(T("io.badFile")));
  });
  $("#langBtn").addEventListener("click", () => {
    window.I18N.setLang(window.I18N.lang === "zh" ? "en" : "zh");
  });
  // 题目每次渲染都重新生成/取译文，故切换语言只需重画外壳 + 重走路由
  window.I18N.onChange(() => { paintShell(); route(); });

  paintShell();
  route();
})();
