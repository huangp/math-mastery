/* ============================================================
 * 屏幕时间插件（前端）：由 server/host.js 注入到 app.js 之前，钩子先排队、由 app.js 接管。
 * 通关测试开始时向服务器登记（服务器计时），做完后在结果卡下方加「领取屏幕时间」。
 * 判分、计分、签码全在服务器；这里只把题目出处和作答原样交上去。
 * 服务器不可达（纯静态部署）时整段静默，不影响应用本身。
 * ============================================================ */
(function () {
  const MM = window.MathMastery = window.MathMastery || { queue: [], on(evt, fn) { this.queue.push([evt, fn]); } };
  const API = "api/screentime/";
  const STR = {
    zh: {
      title: "领取屏幕时间", who: "我是：", pick: "选择名字", claim: "领取", claiming: "正在计算…",
      got: m => `+${m} 分钟屏幕时间`, open: "去兑换", code: "兑换码：",
      detail: (b, r) => `答对 ${r.correct}/${r.total} · 用时 ${Math.round(r.seconds / 60 * 10) / 10} 分钟${b.bonus ? ` · 含首次通关奖励 ${b.bonus} 分钟` : ""}`,
      today: r => `今天已从数学领取 ${r.spentToday}/${r.dailyCap} 分钟`,
      too_fast: "答得太快了，这次不计时间。下次认真做每一题吧！",
      attempts: "这个方法今天已经领过 3 次了，明天再来。",
      cap: "今天的数学屏幕时间已经领满了，明天继续加油！",
      zero: "这次没有获得时间，再试一次吧。",
      offline: "暂时无法领取（服务器未连接）。", failed: "领取失败：",
      startFailed: "本次测验开始时没连上服务器，无法领取。"
    },
    en: {
      title: "Claim screen time", who: "I am:", pick: "Pick your name", claim: "Claim", claiming: "Working it out…",
      got: m => `+${m} min of screen time`, open: "Redeem", code: "Code: ",
      detail: (b, r) => `${r.correct}/${r.total} correct · ${Math.round(r.seconds / 60 * 10) / 10} min${b.bonus ? ` · includes ${b.bonus} min first-pass bonus` : ""}`,
      today: r => `Earned from math today: ${r.spentToday}/${r.dailyCap} min`,
      too_fast: "That was too fast to count. Take your time on each question next round!",
      attempts: "You've already claimed this lesson 3 times today. Come back tomorrow.",
      cap: "You've reached today's math screen-time limit. Great work!",
      zero: "No time earned this round. Try again!",
      offline: "Can't claim right now (server not reachable).", failed: "Claim failed: ",
      startFailed: "This test started while the server was unreachable, so it can't be claimed."
    }
  };
  const S = () => STR[window.I18N && window.I18N.lang] || STR.zh;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const kidKey = pid => "mathMastery.creditKid." + pid;
  const getKid = pid => { try { return localStorage.getItem(kidKey(pid)) || ""; } catch (e) { return ""; } };
  const setKid = (pid, k) => { try { localStorage.setItem(kidKey(pid), k); } catch (e) { } };

  function post(sub, body) {
    return fetch(API + sub, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(r => r.json().then(j => { if (!r.ok) throw new Error(j.error || r.status); return j; }));
  }
  const kidsReady = fetch(API + "kids").then(r => r.ok ? r.json() : null).then(j => j && j.kids).catch(() => null);

  MM.on("quiz:start", p => {
    if (p.mode !== "gate") return;
    // 记下开考语言：判分要按出题时的语言重放（个别生成器中英文随机序列不同）
    const st = p.session.ext.screentime = { lang: window.I18N.lang, attemptId: null, started: null };
    st.started = kidsReady.then(kids => kids ? post("start", { techId: p.techId }) : null)
      .then(j => { st.attemptId = j && j.attemptId; }).catch(() => { st.attemptId = null; });
  });

  MM.on("quiz:finish", p => {
    if (p.mode !== "gate" || p.isPlan) return;
    const st = p.session.ext.screentime;
    kidsReady.then(kids => {
      if (!kids || !st) return;
      const box = document.createElement("div");
      box.className = "st-claim";
      p.el.appendChild(box);
      draw(box, kids, st, p);
    });
  });

  function draw(box, kids, st, p) {
    const s = S();
    if (st.result) {
      const r = st.result;
      box.innerHTML = r.minutes > 0
        ? `<div class="st-got">${esc(s.got(r.minutes))}</div>
           <div class="muted">${esc(s.detail(r.breakdown, r))}</div>
           <div class="st-code">${esc(s.code)}<b>${esc(r.code)}</b></div>
           <a class="btn" href="${esc(r.claimUrl)}" target="_blank" rel="noopener">${esc(s.open)}</a>
           <div class="muted">${esc(s.today(r))}</div>`
        : `<div class="muted">${esc(s[r.reason] || s.zero)}</div><div class="muted">${esc(s.today(r))}</div>`;
      return;
    }
    if (st.error) { box.innerHTML = `<div class="muted">${esc(s.failed + st.error)}</div>`; return; }
    st.started.then(() => {
      if (!st.attemptId) { box.innerHTML = `<div class="muted">${esc(s.startFailed)}</div>`; return; }
      const cur = getKid(p.profileId);
      box.innerHTML = `<div class="st-title">${esc(s.title)}</div>
        <div class="row" style="justify-content:center">
          <label class="muted">${esc(s.who)}</label>
          <select class="st-kid"><option value="">${esc(s.pick)}</option>${kids.map(k =>
            `<option${k === cur ? " selected" : ""}>${esc(k)}</option>`).join("")}</select>
          <button type="button" class="btn st-go"${cur ? "" : " disabled"}>${esc(s.claim)}</button>
        </div>`;
      const sel = box.querySelector(".st-kid"), go = box.querySelector(".st-go");
      sel.addEventListener("change", () => { go.disabled = !sel.value; });
      go.addEventListener("click", () => {
        if (!sel.value) return;
        setKid(p.profileId, sel.value);
        go.disabled = true; go.textContent = s.claiming;
        post("submit", { attemptId: st.attemptId, kid: sel.value, lang: st.lang, items: p.items, picks: p.picks })
          .then(r => { st.result = r; }).catch(e => { st.error = e.message || String(e); })
          .then(() => draw(box, kids, st, p));
      });
    });
  }
})();
