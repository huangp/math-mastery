/* 小学拓展方法参数化出题（28 法，独立文件，避免改动 qgen.js） */
(function () {
  const K = { ink: "#334155", sub: "#64748b", line: "#cbd5e1", pri: "#2f6fed", ok: "#16a34a", warn: "#d97706", red: "#dc2626", soft: "#eef3ff", blue: "#2563eb", purple: "#7c3aed" };
  function S(w, h, inner, maxw) { return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${maxw || w}px;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`; }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[rnd(0, a.length - 1)]; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // opts(正确答案, 干扰项生成函数, 选项数=4)
  function opts(ans, make, n) { n = n || 4; const set = new Set([ans]); let g = 0; while (set.size < n && g++ < 400) { const d = make(); if (d !== ans) set.add(d); } let k = 1; while (set.size < n) { set.add(ans + k); if (set.size < n) set.add(ans - k); k++; } const arr = shuffle([...set]).map(String); return { opts: arr, ans: arr.indexOf(String(ans)) }; }
  // Q(题干, opts对象, 难度, 解析, 要点, 配图=null)
  const G = window.G;

  function Q(q, optsObj, level, explain, point, fig) { return Object.assign({ q, level: level || "基础", explain, point: point || "" }, optsObj, { fig: fig || null }); }

  /* ---------- 额外工具 ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function r2(x) { return Math.round(x * 100) / 100; }
  function r3(x) { return Math.round(x * 1000) / 1000; }
  function fs(a, b) { return a + "/" + b; }
  function divs(n) { const a = []; for (let i = 1; i <= n; i++) if (n % i === 0) a.push(i); return a; }
  function isPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  function ceilDiv(a, b) { return Math.ceil(a / b); }
  // 文字/分数类答案：给定候选干扰池，取前若干个互异项凑满 n 个
  function cats(ans, pool, n) {
    n = n || 4; const set = new Set([String(ans)]);
    for (let i = 0; i < pool.length && set.size < n; i++) set.add(String(pool[i]));
    let k = 1; while (set.size < n) { set.add(String(ans) + "（" + k + "）"); k++; }
    const arr = shuffle([...set]); return { opts: arr, ans: arr.indexOf(String(ans)) };
  }

  /* ============ 1. count 数数与数位（一年级） ============ */
  function qCount() {
    const type = rnd(0, 11);
    if (type === 0) {
      const a = rnd(1, 9), b = rnd(0, 9), c = rnd(0, 9), N = a * 100 + b * 10 + c;
      const names = ["个位", "十位", "百位"], digs = [c, b, a], w = rnd(0, 2), ans = digs[w];
      return Q(G("gen.count.uq0", { v1: N, v2: names[w] }, `数 ${N} 的${names[w]}上的数字是几？`), opts(ans, () => rnd(0, 9)), "基础",
        G("gen.count.ue0", { v1: N, v2: c, v3: b, v4: a, v5: names[w], v6: ans }, `${N} 从右边起：个位是 ${c}，十位是 ${b}，百位是 ${a}。所以${names[w]}上的数字是 ${ans}。`), G("gen.count.upt0", null, "认数位"), null);
    }
    if (type === 1) {
      const a = rnd(1, 9), b = rnd(0, 9), c = rnd(0, 9), ans = a * 100 + b * 10 + c;
      return Q(G("gen.count.uq1", { v1: a, v2: b, v3: c }, `${a} 个百、${b} 个十、${c} 个一 合起来是多少？`), opts(ans, () => rnd(1, 9) * 100 + rnd(0, 9) * 10 + rnd(0, 9)), "基础",
        G("gen.count.ue1", { v1: a, v2: a * 100, v3: b, v4: b * 10, v5: c, v6: c, v7: a * 100, v8: b * 10, v9: c, v10: ans }, `${a} 个百是 ${a * 100}，${b} 个十是 ${b * 10}，${c} 个一是 ${c}；${a * 100}+${b * 10}+${c}=${ans}。`), G("gen.count.upt1", null, "数的组成"), null);
    }
    if (type === 2) {
      const N = rnd(21, 998), back = rnd(0, 1), ans = back ? N + 1 : N - 1;
      return Q(G("gen.count.uq2", { v1: N, v2: back ? "后" : "前" }, `${N} 的${back ? "后" : "前"}一个数是多少？`), opts(ans, () => N + rnd(-6, 6)), "基础",
        G("gen.count.ue2", { v1: back ? `后一个数就是再多 1：${N}+1=${ans}` : `前一个数就是少 1：${N}−1=${ans}` }, `${back ? `后一个数就是再多 1：${N}+1=${ans}` : `前一个数就是少 1：${N}−1=${ans}`}。`), G("gen.count.upt2", null, "相邻数"), null);
    }
    if (type === 3) {
      let A = rnd(10, 999), B = rnd(10, 999); while (A === B) B = rnd(10, 999);
      const big = rnd(0, 1), ans = big ? Math.max(A, B) : Math.min(A, B);
      return Q(G("gen.count.uq3", { v1: A, v2: B, v3: big ? "较大" : "较小" }, `${A} 和 ${B} 这两个数中，${big ? "较大" : "较小"}的是多少？`), opts(ans, () => rnd(10, 999)), "基础",
        G("gen.count.ue3", { v1: Math.max(A, B), v2: Math.min(A, B), v3: big ? "较大" : "较小", v4: ans }, `比较数的大小：先看位数，位数多的大；位数相同就从高位比起。${Math.max(A, B)} > ${Math.min(A, B)}，所以${big ? "较大" : "较小"}的是 ${ans}。`), G("gen.count.upt3", null, "比大小"), null);
    }
    if (type === 4) {
      const d = pick([2, 3, 5, 10]), a = rnd(1, 100 - 4 * d), ans = a + 4 * d;
      return Q(G("gen.count.uq4", { v1: a, v2: a + d, v3: a + 2 * d, v4: a + 3 * d }, `按规律接着数：${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ( )。括号里应填多少？`), opts(ans, () => ans + rnd(-8, 8)), "基础",
        G("gen.count.ue4", { v1: d, v2: a + d, v3: a, v4: d, v5: a + 3 * d, v6: d, v7: ans }, `每次都多 ${d}（${a + d}−${a}=${d}），所以括号里是 ${a + 3 * d}+${d}=${ans}。`), G("gen.count.upt4", null, "找规律"), null);
    }
    if (type === 5) {
      const t = rnd(1, 9), o = rnd(0, 9), N = t * 10 + o, ans = t + o;
      return Q(G("gen.count.uq5", { v1: N }, `两位数 ${N} 的十位数字与个位数字相加，和是多少？`), opts(ans, () => rnd(1, 18)), "基础",
        G("gen.count.ue5", { v1: N, v2: t, v3: o, v4: t, v5: o, v6: ans }, `${N} 的十位数字是 ${t}，个位数字是 ${o}，${t}+${o}=${ans}。`), G("gen.count.upt5", null, "数位相加"), null);
    }
    if (type === 6) {
      const a = rnd(1, 9), b = rnd(0, 9), c = rnd(0, 9), ans = a * 100 + b * 10 + c;
      return Q(G("gen.count.uq6", { v1: a, v2: b, v3: c }, `一个三位数，百位上是 ${a}，十位上是 ${b}，个位上是 ${c}。这个数是多少？`), opts(ans, () => rnd(1, 9) * 100 + rnd(0, 9) * 10 + rnd(0, 9)), "基础",
        G("gen.count.ue6", { v1: a, v2: b, v3: c, v4: ans }, `按“百位—十位—个位”的顺序写出来：${a}${b}${c}，即 ${ans}。`), G("gen.count.upt6", null, "写数"), null);
    }
    if (type === 7) {
      const a = rnd(2, 9), b = rnd(2, 9), ans = a * b;
      return Q(G("gen.count.uq7", { v1: b, v2: a }, `小方摆了 ${b} 排小棒，每排 ${a} 根。一共有多少根小棒？`), opts(ans, () => rnd(2, 9) * rnd(2, 9)), "基础",
        G("gen.count.ue7", { v1: b, v2: a, v3: a, v4: b, v5: ans }, `${b} 排，每排 ${a} 根，一共 ${a}×${b}=${ans}（根）。`), G("gen.count.upt7", null, "数个数"), null);
    }
    if (type === 8) {
      const a = rnd(1, 50), b = a + rnd(5, 45), ans = b - a + 1;
      return Q(G("gen.count.uq8", { v1: a, v2: b }, `从 ${a} 数到 ${b}（两头都数），一共数了多少个数？`), opts(ans, () => rnd(3, 60)), "提升",
        G("gen.count.ue8", { v1: b, v2: a, v3: ans }, `个数=末数−首数+1=${b}−${a}+1=${ans}（个）。`), G("gen.count.upt8", null, "数数个数"), null);
    }
    if (type === 9) {
      let N = rnd(11, 99); while (N % 10 === 5 || N % 10 === 0) N = rnd(11, 99);
      const ans = Math.round(N / 10) * 10;
      return Q(G("gen.count.uq9", { v1: N }, `${N} 最接近哪个整十数？`), opts(ans, () => rnd(1, 10) * 10), "基础",
        G("gen.count.ue9", { v1: N, v2: N % 10, v3: N % 10 < 5 ? `比 5 小，往下取到 ${ans}` : `比 5 大，往上取到 ${ans}` }, `${N} 的个位是 ${N % 10}，${N % 10 < 5 ? `比 5 小，往下取到 ${ans}` : `比 5 大，往上取到 ${ans}`}。`), G("gen.count.upt9", null, "接近整十"), null);
    }
    if (type === 10) {
      const a = rnd(1, 9), b = rnd(1, 9), c = rnd(0, 9), N = a * 100 + b * 10 + c, ans = b * 10;
      return Q(G("gen.count.uq10", { v1: N, v2: b }, `在 ${N} 中，十位上的数字 ${b} 表示多少？`), opts(ans, () => rnd(1, 9) * pick([1, 10, 100])), "提升",
        G("gen.count.ue10", { v1: b, v2: b, v3: b, v4: ans }, `十位上的 ${b} 表示 ${b} 个十，就是 ${b}×10=${ans}。`), G("gen.count.upt10", null, "数位的值"), null);
    }
    const N = rnd(20, 880), k = pick([1, 2, 5, 10, 20, 100]), more = rnd(0, 1), ans = more ? N + k : N - k;
    return Q(G("gen.count.uq11", { v1: N, v2: more ? "多" : "少", v3: k }, `比 ${N} ${more ? "多" : "少"} ${k} 的数是多少？`), opts(ans, () => N + pick([-k, k, 2 * k, -2 * k, k + 1, 1 - k])), "基础",
      G("gen.count.ue11", { v1: N, v2: more ? "多" : "少", v3: k, v4: N, v5: more ? "+" : "−", v6: k, v7: ans }, `比 ${N} ${more ? "多" : "少"} ${k}，就是 ${N}${more ? "+" : "−"}${k}=${ans}。`), G("gen.count.upt11", null, "多几少几"), null);
  }

  /* ============ 2. addsub 100 以内加减法（一年级） ============ */
  function qAddSub() {
    const type = rnd(0, 11);
    if (type === 0) {
      const a = rnd(11, 78), b = rnd(11, 99 - a), ans = a + b;
      return Q(G("gen.addsub.uq0", { v1: a, v2: b }, `计算：${a} + ${b} = ?`), opts(ans, () => ans + rnd(-11, 11)), "基础",
        G("gen.addsub.ue0", { v1: a % 10, v2: b % 10, v3: a % 10 + b % 10, v4: (a % 10 + b % 10) >= 10 ? "，满十要向十位进 1" : "", v5: Math.floor(a / 10), v6: Math.floor(b / 10), v7: (a % 10 + b % 10) >= 10 ? "+1" : "", v8: Math.floor(ans / 10), v9: ans }, `个位 ${a % 10}+${b % 10}=${a % 10 + b % 10}${(a % 10 + b % 10) >= 10 ? "，满十要向十位进 1" : ""}；十位 ${Math.floor(a / 10)}+${Math.floor(b / 10)}${(a % 10 + b % 10) >= 10 ? "+1" : ""}=${Math.floor(ans / 10)}。所以结果是 ${ans}。`), G("gen.addsub.upt0", null, "两位数加法"), null);
    }
    if (type === 1) {
      const a = rnd(35, 99), b = rnd(11, a - 5), ans = a - b;
      return Q(G("gen.addsub.uq1", { v1: a, v2: b }, `计算：${a} − ${b} = ?`), opts(ans, () => ans + rnd(-11, 11)), "基础",
        G("gen.addsub.ue1", { v1: a % 10 < b % 10 ? `个位 ${a % 10} 不够减 ${b % 10}，向十位借 1 当 10：${a % 10 + 10}−${b % 10}=${a % 10 + 10 - b % 10}` : `个位 ${a % 10}−${b % 10}=${a % 10 - b % 10}`, v2: a, v3: b, v4: ans }, `${a % 10 < b % 10 ? `个位 ${a % 10} 不够减 ${b % 10}，向十位借 1 当 10：${a % 10 + 10}−${b % 10}=${a % 10 + 10 - b % 10}` : `个位 ${a % 10}−${b % 10}=${a % 10 - b % 10}`}，最后得 ${a}−${b}=${ans}。`), G("gen.addsub.upt1", null, "两位数减法"), null);
    }
    if (type === 2) {
      const a = rnd(10, 40), b = rnd(10, 30), c = rnd(5, 100 - a - b), ans = a + b + c;
      return Q(G("gen.addsub.uq2", { v1: a, v2: b, v3: c }, `计算：${a} + ${b} + ${c} = ?`), opts(ans, () => ans + rnd(-12, 12)), "基础",
        G("gen.addsub.ue2", { v1: a, v2: b, v3: a + b, v4: a + b, v5: c, v6: ans }, `从左往右算：${a}+${b}=${a + b}，${a + b}+${c}=${ans}。`), G("gen.addsub.upt2", null, "连加"), null);
    }
    if (type === 3) {
      const a = rnd(60, 99), b = rnd(10, 30), c = rnd(5, a - b - 1), ans = a - b - c;
      return Q(G("gen.addsub.uq3", { v1: a, v2: b, v3: c }, `计算：${a} − ${b} − ${c} = ?`), opts(ans, () => ans + rnd(-12, 12)), "基础",
        G("gen.addsub.ue3", { v1: a, v2: b, v3: a - b, v4: a - b, v5: c, v6: ans, v7: b, v8: c, v9: b + c, v10: a, v11: b + c, v12: ans }, `从左往右算：${a}−${b}=${a - b}，${a - b}−${c}=${ans}。也可以先算 ${b}+${c}=${b + c}，再 ${a}−${b + c}=${ans}。`), G("gen.addsub.upt3", null, "连减"), null);
    }
    if (type === 4) {
      const a = rnd(20, 55), b = rnd(10, 99 - a), c = rnd(5, a + b - 1), ans = a + b - c;
      return Q(G("gen.addsub.uq4", { v1: a, v2: b, v3: c }, `计算：${a} + ${b} − ${c} = ?`), opts(ans, () => ans + rnd(-12, 12)), "基础",
        G("gen.addsub.ue4", { v1: a, v2: b, v3: a + b, v4: a + b, v5: c, v6: ans }, `按从左到右的顺序：${a}+${b}=${a + b}，${a + b}−${c}=${ans}。`), G("gen.addsub.upt4", null, "加减混合"), null);
    }
    if (type === 5) {
      const a = rnd(10, 60), ans = rnd(8, 39), c = a + ans;
      return Q(G("gen.addsub.uq5", { v1: a, v2: c }, `在括号里填数：${a} + ( ) = ${c}`), opts(ans, () => ans + rnd(-10, 10)), "基础",
        G("gen.addsub.ue5", { v1: c, v2: a, v3: ans }, `求加数用减法：( )=${c}−${a}=${ans}。`), G("gen.addsub.upt5", null, "填加数"), null);
    }
    if (type === 6) {
      const b = rnd(10, 40), c = rnd(10, 50), sub = rnd(0, 1);
      if (sub) { const ans = c + b; return Q(G("gen.addsub.uq6", { v1: b, v2: c }, `在括号里填数：( ) − ${b} = ${c}`), opts(ans, () => ans + rnd(-10, 10)), "提升", G("gen.addsub.ue6", { v1: c, v2: b, v3: ans }, `被减数=差+减数=${c}+${b}=${ans}。`), G("gen.addsub.upt6", null, "填被减数"), null); }
      const a = b + c, ans = b; return Q(G("gen.addsub.uq7", { v1: a, v2: c }, `在括号里填数：${a} − ( ) = ${c}`), opts(ans, () => ans + rnd(-9, 9)), "提升", G("gen.addsub.ue7", { v1: a, v2: c, v3: ans }, `减数=被减数−差=${a}−${c}=${ans}。`), G("gen.addsub.upt7", null, "填减数"), null);
    }
    if (type === 7) {
      const a = rnd(15, 50), b = rnd(10, 99 - a), ans = a + b;
      const th = pick([["本", "故事书"], ["颗", "糖"], ["张", "卡片"], ["支", "铅笔"], ["个", "气球"]]);
      return Q(G("gen.addsub.uq8", { v1: a, v2: th[0], v3: th[1], v4: b, v5: th[0], v6: th[0] }, `小明原来有 ${a} ${th[0]}${th[1]}，妈妈又买回 ${b} ${th[0]}。现在一共有多少${th[0]}？`), opts(ans, () => ans + rnd(-11, 11)), "基础",
        G("gen.addsub.ue8", { v1: a, v2: b, v3: ans, v4: th[0] }, `求一共多少用加法：${a}+${b}=${ans}（${th[0]}）。`), G("gen.addsub.upt8", null, "求和"), null);
    }
    if (type === 8) {
      const a = rnd(40, 99), b = rnd(12, a - 8), ans = a - b;
      return Q(G("gen.addsub.uq9", { v1: a, v2: b }, `果园里有 ${a} 筐苹果，运走了 ${b} 筐。还剩多少筐？`), opts(ans, () => ans + rnd(-11, 11)), "基础",
        G("gen.addsub.ue9", { v1: a, v2: b, v3: ans }, `求还剩多少用减法：${a}−${b}=${ans}（筐）。`), G("gen.addsub.upt9", null, "求剩余"), null);
    }
    if (type === 9) {
      let A = rnd(20, 99), B = rnd(10, 90); while (A === B) B = rnd(10, 90);
      const ans = Math.abs(A - B);
      return Q(G("gen.addsub.uq10", { v1: A, v2: B, v3: A > B ? "多" : "少" }, `一班有 ${A} 人，二班有 ${B} 人。一班比二班${A > B ? "多" : "少"}多少人？`), opts(ans, () => ans + rnd(-10, 10)), "基础",
        G("gen.addsub.ue10", { v1: Math.max(A, B), v2: Math.min(A, B), v3: ans }, `求相差多少用大数减小数：${Math.max(A, B)}−${Math.min(A, B)}=${ans}（人）。`), G("gen.addsub.upt10", null, "求相差"), null);
    }
    if (type === 10) {
      const d = pick([3, 4, 6, 7, 8, 9]), a = rnd(2, 100 - 4 * d), ans = a + 4 * d;
      return Q(G("gen.addsub.uq11", { v1: a, v2: a + d, v3: a + 2 * d, v4: a + 3 * d }, `找规律填数：${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, ( )`), opts(ans, () => ans + rnd(-9, 9)), "提升",
        G("gen.addsub.ue11", { v1: d, v2: a + 3 * d, v3: d, v4: ans }, `相邻两数都相差 ${d}，所以括号里填 ${a + 3 * d}+${d}=${ans}。`), G("gen.addsub.upt11", null, "找规律"), null);
    }
    const a = rnd(21, 48), b = rnd(21, 48), s = a + b, ans = Math.round(s / 10) * 10;
    return Q(G("gen.addsub.uq12", { v1: a, v2: b }, `估算：${a} + ${b} 的和最接近哪个整十数？`), opts(ans, () => rnd(2, 12) * 10), "提升",
      G("gen.addsub.ue12", { v1: a, v2: b, v3: s, v4: s % 10, v5: s % 10 < 5 ? "舍去" : "向前进一", v6: ans }, `${a}+${b}=${s}，个位是 ${s % 10}，${s % 10 < 5 ? "舍去" : "向前进一"}，最接近 ${ans}。`), G("gen.addsub.upt12", null, "估算"), null);
  }

  /* ============ 3. multi 乘法口诀（二年级） ============ */
  function qMulti() {
    const type = rnd(0, 11);
    if (type === 0) {
      const a = rnd(2, 9), b = rnd(2, 9), ans = a * b;
      return Q(G("gen.multi.uq0", { v1: a, v2: b }, `计算：${a} × ${b} = ?`), opts(ans, () => rnd(2, 9) * rnd(2, 9)), "基础",
        G("gen.multi.ue0", { v1: a < b ? a : b, v2: a < b ? b : a, v3: ans, v4: a, v5: b, v6: ans }, `用口诀“${a < b ? a : b}${a < b ? b : a}${ans}”：${a}×${b}=${ans}。`), G("gen.multi.upt0", null, "乘法口诀"), null);
    }
    if (type === 1) {
      const a = rnd(2, 9), b = rnd(3, 9), ans = a * b;
      return Q(G("gen.multi.uq1", { v1: b, v2: a }, `${b} 个 ${a} 相加，和是多少？`), opts(ans, () => rnd(2, 9) * rnd(2, 9)), "基础",
        G("gen.multi.ue1", { v1: b, v2: a, v3: a, v4: b, v5: ans }, `${b} 个 ${a} 相加就是 ${a}×${b}=${ans}。`), G("gen.multi.upt1", null, "乘法意义"), null);
    }
    if (type === 2) {
      const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 20), ans = a * b + c;
      return Q(G("gen.multi.uq2", { v1: a, v2: b, v3: c }, `计算：${a} × ${b} + ${c} = ?`), opts(ans, () => ans + rnd(-9, 9)), "基础",
        G("gen.multi.ue2", { v1: a, v2: b, v3: a * b, v4: a * b, v5: c, v6: ans }, `先乘后加：${a}×${b}=${a * b}，${a * b}+${c}=${ans}。`), G("gen.multi.upt2", null, "乘加"), null);
    }
    if (type === 3) {
      const a = rnd(3, 9), b = rnd(3, 9), c = rnd(2, a * b - 1), ans = a * b - c;
      return Q(G("gen.multi.uq3", { v1: a, v2: b, v3: c }, `计算：${a} × ${b} − ${c} = ?`), opts(ans, () => ans + rnd(-9, 9)), "基础",
        G("gen.multi.ue3", { v1: a, v2: b, v3: a * b, v4: a * b, v5: c, v6: ans }, `先乘后减：${a}×${b}=${a * b}，${a * b}−${c}=${ans}。`), G("gen.multi.upt3", null, "乘减"), null);
    }
    if (type === 4) {
      const a = rnd(3, 20), b = rnd(2, 9), ans = a * b;
      return Q(G("gen.multi.uq4", { v1: a, v2: b }, `${a} 的 ${b} 倍是多少？`), opts(ans, () => rnd(3, 20) * rnd(2, 9)), "基础",
        G("gen.multi.ue4", { v1: a, v2: b, v3: ans }, `求一个数的几倍用乘法：${a}×${b}=${ans}。`), G("gen.multi.upt4", null, "求几倍"), null);
    }
    if (type === 5) {
      const b = rnd(2, 9), k = rnd(2, 9), T = b * k, ans = b;
      return Q(G("gen.multi.uq5", { v1: T, v2: k }, `把 ${T} 个桃子平均分成 ${k} 份，每份有多少个？`), opts(ans, () => rnd(2, 12)), "基础",
        G("gen.multi.ue5", { v1: T, v2: k, v3: ans, v4: Math.min(k, b), v5: Math.max(k, b), v6: T }, `平均分用除法：${T}÷${k}=${ans}（个）。想口诀“${Math.min(k, b)}${Math.max(k, b)}${T}”。`), G("gen.multi.upt5", null, "平均分"), null);
    }
    if (type === 6) {
      const a = rnd(2, 9), b = rnd(2, 9), ans = a * b;
      const th = pick(["盒", "袋", "排", "组", "箱"]), it = pick([["个", "乒乓球"], ["块", "饼干"], ["支", "彩笔"], ["本", "练习本"]]);
      return Q(G("gen.multi.uq6", { v1: th, v2: a, v3: it[0], v4: it[1], v5: b, v6: th, v7: it[0], v8: it[1] }, `每${th}装 ${a} ${it[0]}${it[1]}，${b} ${th}一共有多少${it[0]}${it[1]}？`), opts(ans, () => rnd(2, 9) * rnd(2, 9)), "基础",
        G("gen.multi.ue6", { v1: th, v2: a, v3: it[0], v4: b, v5: th, v6: a, v7: b, v8: ans, v9: it[0] }, `每${th} ${a} ${it[0]}，共 ${b} ${th}：${a}×${b}=${ans}（${it[0]}）。`), G("gen.multi.upt6", null, "图文应用"), null);
    }
    if (type === 7) {
      const a = rnd(2, 9), ans = rnd(2, 9), P = a * ans;
      return Q(G("gen.multi.uq7", { v1: a, v2: P }, `在括号里填数：( ) × ${a} = ${P}`), opts(ans, () => rnd(2, 12)), "提升",
        G("gen.multi.ue7", { v1: a, v2: P, v3: P, v4: a, v5: ans, v6: ans }, `想“几${a}${P}”：${P}÷${a}=${ans}，所以括号里填 ${ans}。`), G("gen.multi.upt7", null, "口诀求因数"), null);
    }
    if (type === 8) {
      const a = rnd(2, 5), b = rnd(2, 5), c = rnd(2, 6), ans = a * b * c;
      return Q(G("gen.multi.uq8", { v1: a, v2: b, v3: c }, `计算：${a} × ${b} × ${c} = ?`), opts(ans, () => rnd(2, 5) * rnd(2, 5) * rnd(2, 6)), "提升",
        G("gen.multi.ue8", { v1: a, v2: b, v3: a * b, v4: a * b, v5: c, v6: ans }, `连乘从左往右：${a}×${b}=${a * b}，${a * b}×${c}=${ans}。`), G("gen.multi.upt8", null, "连乘"), null);
    }
    if (type === 9) {
      let a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9), d = rnd(2, 9), g = 0;
      while (a * b === c * d && g++ < 50) { c = rnd(2, 9); d = rnd(2, 9); }
      const ans = Math.max(a * b, c * d);
      return Q(G("gen.multi.uq9", { v1: a, v2: b, v3: c, v4: d }, `${a}×${b} 和 ${c}×${d} 相比，较大的积是多少？`), opts(ans, () => rnd(2, 9) * rnd(2, 9)), "提升",
        G("gen.multi.ue9", { v1: a, v2: b, v3: a * b, v4: c, v5: d, v6: c * d, v7: ans }, `${a}×${b}=${a * b}，${c}×${d}=${c * d}，较大的是 ${ans}。`), G("gen.multi.upt9", null, "比较积"), null);
    }
    if (type === 10) {
      const b = rnd(2, 9), ans = rnd(2, 9), A = b * ans;
      return Q(G("gen.multi.uq10", { v1: A, v2: b }, `${A} 是 ${b} 的多少倍？`), opts(ans, () => rnd(2, 12)), "提升",
        G("gen.multi.ue10", { v1: A, v2: b, v3: ans }, `求一个数是另一个数的几倍用除法：${A}÷${b}=${ans}（倍）。`), G("gen.multi.upt10", null, "求倍数"), null);
    }
    const a = rnd(2, 9), b = rnd(2, 5), c = rnd(2, 5), ans = a * (b + c);
    return Q(G("gen.multi.uq11", { v1: a, v2: b, v3: c }, `计算：${a} × (${b} + ${c}) = ?`), opts(ans, () => rnd(2, 9) * rnd(4, 10)), "提升",
      G("gen.multi.ue11", { v1: b, v2: c, v3: b + c, v4: a, v5: b + c, v6: ans, v7: a, v8: b, v9: a, v10: c, v11: a * b, v12: a * c, v13: ans }, `先算括号：${b}+${c}=${b + c}，再 ${a}×${b + c}=${ans}。也可以 ${a}×${b}+${a}×${c}=${a * b}+${a * c}=${ans}。`), G("gen.multi.upt11", null, "乘法分配"), null);
  }

  /* ============ 4. divide 除法与余数（二年级） ============ */
  function qDivide() {
    const type = rnd(0, 11);
    if (type === 0) {
      const d = rnd(3, 9), q = rnd(2, 12), r = rnd(1, d - 1), N = d * q + r;
      return Q(G("gen.divide.uq0", { v1: N, v2: d }, `${N} ÷ ${d} = ? 商是多少？`), opts(q, () => rnd(1, 15)), "基础",
        G("gen.divide.ue0", { v1: d, v2: q, v3: d * q, v4: N, v5: d * q, v6: r, v7: r, v8: d, v9: q, v10: r }, `${d}×${q}=${d * q}，${N}−${d * q}=${r}，且 ${r}<${d}，所以商是 ${q}，余 ${r}。`), G("gen.divide.upt0", null, "求商"), null);
    }
    if (type === 1) {
      const d = rnd(3, 9), q = rnd(2, 12), r = rnd(1, d - 1), N = d * q + r;
      return Q(G("gen.divide.uq1", { v1: N, v2: d }, `${N} ÷ ${d} 的余数是多少？`), opts(r, () => rnd(0, 9)), "基础",
        G("gen.divide.ue1", { v1: N, v2: d, v3: q, v4: r, v5: d, v6: q, v7: d * q, v8: N, v9: d * q, v10: r, v11: r }, `${N}÷${d}=${q}……${r}（因为 ${d}×${q}=${d * q}，${N}−${d * q}=${r}），余数是 ${r}。`), G("gen.divide.upt1", null, "求余数"), null);
    }
    if (type === 2) {
      const d = rnd(3, 9), ans = d - 1;
      return Q(G("gen.divide.uq2", { v1: d }, `一道除法算式中，除数是 ${d}，余数最大可能是多少？`), opts(ans, () => rnd(1, 12)), "基础",
        G("gen.divide.ue2", { v1: d, v2: d, v3: ans }, `余数一定比除数小，除数是 ${d}，所以余数最大是 ${d}−1=${ans}。`), G("gen.divide.upt2", null, "余数范围"), null);
    }
    if (type === 3) {
      const d = rnd(4, 12), q = rnd(3, 15), r = rnd(1, d - 1), ans = d * q + r;
      return Q(G("gen.divide.uq3", { v1: d, v2: q, v3: r }, `一个除法算式中，除数是 ${d}，商是 ${q}，余数是 ${r}。被除数是多少？`), opts(ans, () => ans + rnd(-12, 12)), "提升",
        G("gen.divide.ue3", { v1: q, v2: d, v3: r, v4: q * d, v5: r, v6: ans }, `被除数=商×除数+余数=${q}×${d}+${r}=${q * d}+${r}=${ans}。`), G("gen.divide.upt3", null, "还原被除数"), null);
    }
    if (type === 4) {
      const k = rnd(3, 8), q = rnd(3, 12), r = rnd(1, k - 1), N = k * q + r, askR = rnd(0, 1), ans = askR ? r : q;
      return Q(G("gen.divide.uq4", { v1: N, v2: k, v3: askR ? "最后还剩几本" : "每组分得多少本" }, `把 ${N} 本书平均分给 ${k} 个小组，每组分得同样多。${askR ? "最后还剩几本" : "每组分得多少本"}？`), opts(ans, () => rnd(1, 15)), "基础",
        G("gen.divide.ue4", { v1: N, v2: k, v3: q, v4: r, v5: q, v6: r, v7: ans }, `${N}÷${k}=${q}……${r}，每组 ${q} 本，还剩 ${r} 本。所以答案是 ${ans}。`), G("gen.divide.upt4", null, "平均分"), null);
    }
    if (type === 5) {
      const d = rnd(4, 9), r = rnd(1, d - 1), ans = d - r;
      return Q(G("gen.divide.uq5", { v1: d, v2: r, v3: d }, `一个数除以 ${d} 余 ${r}，这个数至少再加上几就能被 ${d} 整除？`), opts(ans, () => rnd(1, 10)), "拔高",
        G("gen.divide.ue5", { v1: r, v2: d, v3: r, v4: ans, v5: d, v6: ans }, `余 ${r} 说明还差 ${d}−${r}=${ans} 就又满一个 ${d}，所以至少加 ${ans}。`), G("gen.divide.upt5", null, "补足整除"), null);
    }
    if (type === 6) {
      const d = rnd(3, 9), q = rnd(3, 12), ans = d * q;
      return Q(G("gen.divide.uq6", { v1: d, v2: q }, `在括号里填数：( ) ÷ ${d} = ${q}`), opts(ans, () => ans + rnd(-10, 10)), "基础",
        G("gen.divide.ue6", { v1: q, v2: d, v3: ans }, `被除数=商×除数=${q}×${d}=${ans}。`), G("gen.divide.upt6", null, "填被除数"), null);
    }
    if (type === 7) {
      const d = rnd(3, 9), q = rnd(4, 15), N = d * q;
      return Q(`${N} ÷ ${d} = ?`, opts(q, () => rnd(2, 18)), "基础",
        G("gen.divide.ue7", { v1: d, v2: q, v3: N, v4: N, v5: d, v6: q }, `${d}×${q}=${N}，所以 ${N}÷${d}=${q}，正好整除没有余数。`), G("gen.divide.upt7", null, "整除"), null);
    }
    if (type === 8) {
      const b = rnd(4, 9), q = rnd(3, 11), r = rnd(1, b - 1), N = b * q + r;
      return Q(G("gen.divide.uq7", { v1: N, v2: b }, `有 ${N} 个鸡蛋，每盒装 ${b} 个，能装满多少盒？`), opts(q, () => rnd(2, 15)), "基础",
        G("gen.divide.ue8", { v1: N, v2: b, v3: q, v4: r, v5: q, v6: r }, `${N}÷${b}=${q}……${r}，装满 ${q} 盒，还剩 ${r} 个装不满一盒。`), G("gen.divide.upt8", null, "装满几盒"), null);
    }
    if (type === 9) {
      const b = rnd(4, 9), q = rnd(3, 11), r = rnd(1, b - 1), N = b * q + r, ans = q + 1;
      return Q(G("gen.divide.uq8", { v1: N, v2: b }, `有 ${N} 人要过河，每条船最多坐 ${b} 人。至少需要多少条船？`), opts(ans, () => rnd(2, 16)), "提升",
        G("gen.divide.ue9", { v1: N, v2: b, v3: q, v4: r, v5: r, v6: q, v7: ans }, `${N}÷${b}=${q}……${r}，剩下的 ${r} 人也要一条船，所以至少 ${q}+1=${ans} 条。`), G("gen.divide.upt9", null, "进一法"), null);
    }
    if (type === 10) {
      const d = rnd(4, 9), q = rnd(2, 12), r = rnd(1, d - 1), N = d * q + r, ans = q + r;
      return Q(G("gen.divide.uq9", { v1: N, v2: d }, `${N} ÷ ${d} 的商与余数的和是多少？`), opts(ans, () => rnd(2, 20)), "提升",
        G("gen.divide.ue10", { v1: N, v2: d, v3: q, v4: r, v5: q, v6: r, v7: ans }, `${N}÷${d}=${q}……${r}，商 ${q} 加余数 ${r} 得 ${ans}。`), G("gen.divide.upt10", null, "商与余数"), null);
    }
    const d = rnd(3, 9), r = rnd(1, d - 1), start = rnd(2, 6), N = d * start + r, ans = r;
    return Q(G("gen.divide.uq10", { v1: N, v2: d }, `${N} 除以 ${d}，如果余数不为 0，那么余数是几？`), opts(ans, () => rnd(0, d)), "基础",
      G("gen.divide.ue11", { v1: N, v2: d, v3: start + 0, v4: N - d * start, v5: N, v6: d, v7: Math.floor(N / d), v8: N % d, v9: ans }, `${N}=${d}×${start + 0}+${N - d * start}，即 ${N}÷${d}=${Math.floor(N / d)}……${N % d}，余数是 ${ans}。`), G("gen.divide.upt11", null, "带余除法"), null);
  }

  /* ============ 5. fourops 四则混合运算与括号（三年级） ============ */
  function qFourOps() {
    const type = rnd(0, 11);
    if (type === 0) {
      const a = rnd(10, 90), b = rnd(3, 15), c = rnd(3, 12), ans = a + b * c;
      return Q(G("gen.fourops.uq0", { v1: a, v2: b, v3: c }, `计算：${a} + ${b} × ${c} = ?`), opts(ans, () => (a + b) * c), "基础",
        G("gen.fourops.ue0", { v1: b, v2: c, v3: b * c, v4: a, v5: b * c, v6: ans }, `先算乘法：${b}×${c}=${b * c}，再加：${a}+${b * c}=${ans}。`), G("gen.fourops.upt0", null, "先乘后加"), null);
    }
    if (type === 1) {
      const b = rnd(3, 12), c = rnd(3, 9), a = b * c + rnd(5, 60), ans = a - b * c;
      return Q(G("gen.fourops.uq1", { v1: a, v2: b, v3: c }, `计算：${a} − ${b} × ${c} = ?`), opts(ans, () => (a - b) * c), "基础",
        G("gen.fourops.ue1", { v1: b, v2: c, v3: b * c, v4: a, v5: b * c, v6: ans }, `先算乘法：${b}×${c}=${b * c}，再减：${a}−${b * c}=${ans}。`), G("gen.fourops.upt1", null, "先乘后减"), null);
    }
    if (type === 2) {
      const a = rnd(8, 40), b = rnd(5, 40), c = rnd(3, 9), ans = (a + b) * c;
      return Q(G("gen.fourops.uq2", { v1: a, v2: b, v3: c }, `计算：(${a} + ${b}) × ${c} = ?`), opts(ans, () => a + b * c), "基础",
        G("gen.fourops.ue2", { v1: a, v2: b, v3: a + b, v4: a + b, v5: c, v6: ans }, `先算小括号：${a}+${b}=${a + b}，再乘：${a + b}×${c}=${ans}。`), G("gen.fourops.upt2", null, "小括号优先"), null);
    }
    if (type === 3) {
      const b = rnd(20, 80), c = rnd(3, b - 2), a = rnd(3, 12), ans = a * (b - c);
      return Q(G("gen.fourops.uq3", { v1: a, v2: b, v3: c }, `计算：${a} × (${b} − ${c}) = ?`), opts(ans, () => a * b - c), "基础",
        G("gen.fourops.ue3", { v1: b, v2: c, v3: b - c, v4: a, v5: b - c, v6: ans }, `先算括号：${b}−${c}=${b - c}，再乘：${a}×${b - c}=${ans}。`), G("gen.fourops.upt3", null, "小括号优先"), null);
    }
    if (type === 4) {
      const a = rnd(5, 30), b = rnd(5, 30), c = rnd(2, 9), P = (a + b) * c;
      const ds = divs(P).filter(x => x > 1 && x < P);
      const d = ds.length ? pick(ds) : 1, ans = P / d;
      return Q(G("gen.fourops.uq4", { v1: a, v2: b, v3: c, v4: d }, `计算：[ (${a} + ${b}) × ${c} ] ÷ ${d} = ?`), opts(ans, () => ans + rnd(-15, 15)), "提升",
        G("gen.fourops.ue4", { v1: a, v2: b, v3: a + b, v4: a + b, v5: c, v6: P, v7: P, v8: d, v9: ans }, `先小括号：${a}+${b}=${a + b}；再中括号内乘：${a + b}×${c}=${P}；最后 ${P}÷${d}=${ans}。`), G("gen.fourops.upt4", null, "中括号"), null);
    }
    if (type === 5) {
      const a = rnd(3, 15), b = rnd(3, 12), c = rnd(3, 15), d = rnd(3, 12), ans = a * b + c * d;
      return Q(G("gen.fourops.uq5", { v1: a, v2: b, v3: c, v4: d }, `计算：${a} × ${b} + ${c} × ${d} = ?`), opts(ans, () => ans + rnd(-20, 20)), "基础",
        G("gen.fourops.ue5", { v1: a, v2: b, v3: a * b, v4: c, v5: d, v6: c * d, v7: a * b, v8: c * d, v9: ans }, `两个乘法分别算：${a}×${b}=${a * b}，${c}×${d}=${c * d}，再相加 ${a * b}+${c * d}=${ans}。`), G("gen.fourops.upt5", null, "递等式"), null);
    }
    if (type === 6) {
      const b = rnd(3, 12), q = rnd(3, 15), a = b * q, c = rnd(3, 12), d = rnd(3, 9), ans = q + c * d;
      return Q(G("gen.fourops.uq6", { v1: a, v2: b, v3: c, v4: d }, `计算：${a} ÷ ${b} + ${c} × ${d} = ?`), opts(ans, () => ans + rnd(-18, 18)), "提升",
        G("gen.fourops.ue6", { v1: a, v2: b, v3: q, v4: c, v5: d, v6: c * d, v7: q, v8: c * d, v9: ans }, `同级先算乘除：${a}÷${b}=${q}，${c}×${d}=${c * d}，再相加：${q}+${c * d}=${ans}。`), G("gen.fourops.upt6", null, "乘除优先"), null);
    }
    if (type === 7) {
      const a = rnd(50, 200), b = rnd(11, 60); let c = rnd(11, 60); while (c === b) c = rnd(11, 60);
      const W = a + c, ans = a + b;
      return Q(G("gen.fourops.uq7", { v1: a, v2: b, v3: b, v4: c, v5: W }, `小明计算 ${a} + ${b} 时，把 ${b} 看成了 ${c}，得到的结果是 ${W}。正确的结果应是多少？`), opts(ans, () => W + rnd(-20, 20)), "拔高",
        G("gen.fourops.ue7", { v1: Math.abs(c - b), v2: a, v3: b, v4: ans, v5: W, v6: c > b ? "减去" : "加上", v7: Math.abs(c - b), v8: ans }, `他把加数看错，多算/少算了 ${Math.abs(c - b)}。正确结果=${a}+${b}=${ans}（错误结果 ${W} ${c > b ? "减去" : "加上"} ${Math.abs(c - b)} 也得 ${ans}）。`), G("gen.fourops.upt7", null, "错中求解"), null);
    }
    if (type === 8) {
      const a = rnd(6, 40), b = rnd(4, 30), c = rnd(3, 9), ans = (a + b) * c;
      return Q(G("gen.fourops.uq8", { v1: a, v2: b, v3: c }, `在 ${a} + ${b} × ${c} 中添上小括号，使得先算加法，结果是多少？`), opts(ans, () => a + b * c), "提升",
        G("gen.fourops.ue8", { v1: a, v2: b, v3: c, v4: a + b, v5: c, v6: ans }, `添括号后是 (${a}+${b})×${c}=${a + b}×${c}=${ans}。`), G("gen.fourops.upt8", null, "添括号"), null);
    }
    if (type === 9) {
      const a = rnd(5, 30), b = rnd(5, 30), c = rnd(2, 9), ans = (a + b) * c;
      return Q(G("gen.fourops.uq9", { v1: a, v2: b, v3: c, v4: a, v5: b, v6: c }, `比较 (${a}+${b})×${c} 与 ${a}+${b}×${c} 的大小，较大算式的结果是多少？`), opts(ans, () => a + b * c), "提升",
        G("gen.fourops.ue9", { v1: a, v2: b, v3: c, v4: (a + b) * c, v5: a, v6: b, v7: c, v8: a + b * c, v9: (a + b) * c, v10: ans }, `(${a}+${b})×${c}=${(a + b) * c}，${a}+${b}×${c}=${a + b * c}，${(a + b) * c} 更大，是 ${ans}。`), G("gen.fourops.upt9", null, "比较大小"), null);
    }
    if (type === 10) {
      const a = rnd(4, 15), b = rnd(4, 12), d = rnd(2, 9), q = rnd(2, 12), c = d * q, ans = a * b - q;
      return Q(G("gen.fourops.uq10", { v1: a, v2: b, v3: c, v4: d }, `计算：${a} × ${b} − ${c} ÷ ${d} = ?`), opts(ans, () => ans + rnd(-15, 15)), "提升",
        G("gen.fourops.ue10", { v1: a, v2: b, v3: a * b, v4: c, v5: d, v6: q, v7: a * b, v8: q, v9: ans }, `先算乘除：${a}×${b}=${a * b}，${c}÷${d}=${q}，再相减：${a * b}−${q}=${ans}。`), G("gen.fourops.upt10", null, "递等式"), null);
    }
    const b = rnd(5, 30), a = b + rnd(3, 40), c = rnd(3, 9), d = rnd(5, 50), ans = (a - b) * c + d;
    return Q(G("gen.fourops.uq11", { v1: a, v2: b, v3: c, v4: d }, `计算：(${a} − ${b}) × ${c} + ${d} = ?`), opts(ans, () => ans + rnd(-20, 20)), "提升",
      G("gen.fourops.ue11", { v1: a, v2: b, v3: a - b, v4: a - b, v5: c, v6: (a - b) * c, v7: (a - b) * c, v8: d, v9: ans }, `先括号：${a}−${b}=${a - b}；再乘：${a - b}×${c}=${(a - b) * c}；最后加：${(a - b) * c}+${d}=${ans}。`), G("gen.fourops.upt11", null, "混合运算"), null);
  }

  /* ============ 6. fraction 分数的意义与通分（五年级） ============ */
  function qFraction() {
    const type = rnd(0, 11);
    if (type === 0) {
      const n = rnd(4, 16), m = rnd(1, n - 1), ans = fs(m, n);
      const pool = [fs(m, n + 1), fs(m + 1, n), fs(n, m), fs(m - 1 < 1 ? m + 2 : m - 1, n)];
      return Q(G("gen.fraction.uq0", { v1: n, v2: m }, `把一根绳子平均分成 ${n} 段，取出其中的 ${m} 段。取出的部分占全长的几分之几？`), cats(ans, pool), "基础",
        G("gen.fraction.ue0", { v1: n, v2: n, v3: m, v4: m, v5: n }, `平均分成 ${n} 份，每份是 1/${n}，取 ${m} 份就是 ${m}/${n}。`), G("gen.fraction.upt0", null, "分数意义"), null);
    }
    if (type === 1) {
      const b = rnd(3, 12), q = rnd(2, 9), r = rnd(1, b - 1), a = b * q + r;
      return Q(G("gen.fraction.uq1", { v1: a, v2: b }, `把假分数 ${a}/${b} 化成带分数，整数部分是多少？`), opts(q, () => rnd(1, 12)), "基础",
        G("gen.fraction.ue1", { v1: a, v2: b, v3: q, v4: r, v5: a, v6: b, v7: q, v8: r, v9: b, v10: q }, `${a}÷${b}=${q}……${r}，所以 ${a}/${b} = ${q} 又 ${r}/${b}，整数部分是 ${q}。`), G("gen.fraction.upt1", null, "假分数化带"), null);
    }
    if (type === 2) {
      const c = rnd(3, 12), b = rnd(1, c - 1), q = rnd(2, 9), ans = q * c + b;
      return Q(G("gen.fraction.uq2", { v1: q, v2: b, v3: c }, `把带分数 ${q} 又 ${b}/${c} 化成假分数，分子是多少？`), opts(ans, () => ans + rnd(-9, 9)), "基础",
        G("gen.fraction.ue2", { v1: q, v2: c, v3: b, v4: q * c, v5: b, v6: ans, v7: ans, v8: c }, `分子=整数部分×分母+原分子=${q}×${c}+${b}=${q * c}+${b}=${ans}，即 ${ans}/${c}。`), G("gen.fraction.upt2", null, "带化假分数"), null);
    }
    if (type === 3) {
      const b = rnd(2, 12); let d = rnd(2, 15); while (d === b) d = rnd(2, 15);
      const a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1), ans = lcm(b, d);
      return Q(G("gen.fraction.uq3", { v1: fs(a, b), v2: fs(c, d) }, `把 ${fs(a, b)} 和 ${fs(c, d)} 通分，最小公分母是多少？`), opts(ans, () => b * d + rnd(-3, 3)), "提升",
        G("gen.fraction.ue3", { v1: b, v2: d, v3: b, v4: d, v5: ans }, `最小公分母就是 ${b} 和 ${d} 的最小公倍数：[${b},${d}]=${ans}。`), G("gen.fraction.upt3", null, "最小公分母"), null);
    }
    if (type === 4) {
      let b = rnd(3, 12), d = rnd(3, 12), a = rnd(1, b - 1), c = rnd(1, d - 1), g = 0;
      while (a * d === c * b && g++ < 50) { c = rnd(1, d - 1); }
      const f1 = fs(a, b), f2 = fs(c, d), ans = a * d > c * b ? f1 : f2;
      return Q(G("gen.fraction.uq4", { v1: f1, v2: f2 }, `比较大小：${f1} 和 ${f2}，较大的是哪一个？`), cats(ans, [ans === f1 ? f2 : f1, "两个相等", "无法比较"]), "提升",
        G("gen.fraction.ue4", { v1: f1, v2: a * d, v3: b * d, v4: f2, v5: c * b, v6: b * d, v7: a * d, v8: a * d > c * b ? ">" : "<", v9: c * b, v10: ans }, `通分比较：${f1}=${a * d}/${b * d}，${f2}=${c * b}/${b * d}，${a * d}${a * d > c * b ? ">" : "<"}${c * b}，所以 ${ans} 大。`), G("gen.fraction.upt4", null, "比较分数"), null);
    }
    if (type === 5) {
      const n = rnd(5, 20), a = rnd(1, n - 2), b = rnd(1, n - a - 1), ans = a + b;
      return Q(G("gen.fraction.uq5", { v1: fs(a, n), v2: fs(b, n) }, `计算 ${fs(a, n)} + ${fs(b, n)}，结果（不约分）的分子是多少？`), opts(ans, () => rnd(2, 24)), "基础",
        G("gen.fraction.ue5", { v1: a, v2: b, v3: ans, v4: ans, v5: n }, `同分母分数相加，分母不变、分子相加：${a}+${b}=${ans}，得 ${ans}/${n}。`), G("gen.fraction.upt5", null, "同分母加法"), null);
    }
    if (type === 6) {
      const g = pick([2, 3, 4, 5, 6, 7, 8, 9]), p = rnd(1, 9), q = rnd(p + 1, 14);
      const a = p * g, b = q * g, gg = gcd(a, b), ans = b / gg;
      return Q(G("gen.fraction.uq6", { v1: fs(a, b) }, `把 ${fs(a, b)} 约成最简分数，分母是多少？`), opts(ans, () => rnd(2, 30)), "提升",
        G("gen.fraction.ue6", { v1: a, v2: b, v3: gg, v4: a, v5: gg, v6: a / gg, v7: b, v8: gg, v9: ans, v10: fs(a / gg, ans) }, `${a} 和 ${b} 的最大公因数是 ${gg}，${a}÷${gg}=${a / gg}，${b}÷${gg}=${ans}，最简分数是 ${fs(a / gg, ans)}。`), G("gen.fraction.upt6", null, "约分"), null);
    }
    if (type === 7) {
      const n = pick([2, 3, 4, 5, 6, 8, 10, 12]), L = n * rnd(2, 12), ans = L / n;
      return Q(G("gen.fraction.uq7", { v1: L, v2: n }, `一根 ${L} 米长的钢管，平均截成 ${n} 段，每段长多少米？`), opts(ans, () => rnd(1, 20)), "基础",
        G("gen.fraction.ue7", { v1: L, v2: n, v3: ans, v4: n }, `每段长=总长÷段数=${L}÷${n}=${ans}（米）；每段占全长的 1/${n}。`), G("gen.fraction.upt7", null, "单位1"), null);
    }
    if (type === 8) {
      const b = pick([2, 4, 5, 8, 10, 20, 25, 50]), a = rnd(1, b - 1), ans = r3(a / b);
      return Q(G("gen.fraction.uq8", { v1: fs(a, b) }, `把分数 ${fs(a, b)} 化成小数是多少？`), opts(ans, () => r3(rnd(1, 99) / 100)), "提升",
        G("gen.fraction.ue8", { v1: fs(a, b), v2: a, v3: b, v4: ans }, `${fs(a, b)} 就是 ${a}÷${b}=${ans}。`), G("gen.fraction.upt8", null, "分数化小数"), null);
    }
    if (type === 9) {
      const k = rnd(1, 99), g = gcd(k, 100), ans = 100 / g;
      return Q(G("gen.fraction.uq9", { v1: k < 10 ? "0" + k : k }, `把小数 0.${k < 10 ? "0" + k : k} 化成最简分数，分母是多少？`), opts(ans, () => pick([2, 4, 5, 8, 10, 20, 25, 50, 100]) + rnd(0, 3)), "提升",
        G("gen.fraction.ue9", { v1: k < 10 ? "0" + k : k, v2: k, v3: k, v4: g, v5: fs(k / g, ans), v6: ans }, `0.${k < 10 ? "0" + k : k}=${k}/100，${k} 与 100 的最大公因数是 ${g}，约分后是 ${fs(k / g, ans)}，分母是 ${ans}。`), G("gen.fraction.upt9", null, "小数化分数"), null);
    }
    if (type === 10) {
      const b = rnd(4, 30), ans = b - 1;
      return Q(G("gen.fraction.uq10", { v1: b }, `分母是 ${b} 的所有真分数中，最大的那个分数的分子是多少？`), opts(ans, () => rnd(1, 32)), "提升",
        G("gen.fraction.ue10", { v1: b, v2: ans, v3: fs(ans, b) }, `真分数的分子要比分母小，分子最大取 ${b}−1=${ans}，即 ${fs(ans, b)}。`), G("gen.fraction.upt10", null, "真分数"), null);
    }
    const b = rnd(5, 20), a = rnd(1, b - 1), ans = b - a;
    return Q(G("gen.fraction.uq11", { v1: fs(a, b), v2: b }, `${fs(a, b)} 的分数单位是 1/${b}，再添上几个这样的分数单位就等于 1？`), opts(ans, () => rnd(1, 20)), "提升",
      G("gen.fraction.ue11", { v1: fs(b, b), v2: fs(b, b), v3: fs(a, b), v4: fs(ans, b), v5: ans, v6: b }, `1=${fs(b, b)}，${fs(b, b)}−${fs(a, b)}=${fs(ans, b)}，也就是再添 ${ans} 个 1/${b}。`), G("gen.fraction.upt11", null, "分数单位"), null);
  }

  /* ============ 7. decimal 小数运算（五年级） ============ */
  function qDecimal() {
    const type = rnd(0, 11);
    if (type === 0) {
      const a = r2(rnd(101, 990) / 10), b = r2(rnd(101, 990) / 10), ans = r2(a + b);
      return Q(G("gen.decimal.uq0", { v1: a, v2: b }, `计算：${a} + ${b} = ?`), opts(ans, () => r2(ans + rnd(-90, 90) / 10)), "基础",
        G("gen.decimal.ue0", { v1: a, v2: b, v3: ans }, `小数加法把小数点对齐：${a}+${b}=${ans}。`), G("gen.decimal.upt0", null, "小数加法"), null);
    }
    if (type === 1) {
      const a = r2(rnd(300, 990) / 10), b = r2(rnd(11, 290) / 10), ans = r2(a - b);
      return Q(G("gen.decimal.uq1", { v1: a, v2: b }, `计算：${a} − ${b} = ?`), opts(ans, () => r2(ans + rnd(-90, 90) / 10)), "基础",
        G("gen.decimal.ue1", { v1: a, v2: b, v3: ans }, `小数减法小数点对齐，按整数法则相减：${a}−${b}=${ans}。`), G("gen.decimal.upt1", null, "小数减法"), null);
    }
    if (type === 2) {
      const a = r2(rnd(11, 99) / 10), b = rnd(2, 12), ans = r2(a * b), A10 = Math.round(a * 10);
      return Q(G("gen.decimal.uq2", { v1: a, v2: b }, `计算：${a} × ${b} = ?`), opts(ans, () => r2(a * rnd(2, 14))), "基础",
        G("gen.decimal.ue2", { v1: A10, v2: b, v3: A10 * b, v4: ans }, `先按整数算 ${A10}×${b}=${A10 * b}，再把积缩小到原来的 1/10：${ans}。`), G("gen.decimal.upt2", null, "小数乘整数"), null);
    }
    if (type === 3) {
      const b = rnd(2, 9), q = r2(rnd(11, 99) / 10), a = r2(q * b), ans = q;
      return Q(G("gen.decimal.uq3", { v1: a, v2: b }, `计算：${a} ÷ ${b} = ?`), opts(ans, () => r2(rnd(11, 120) / 10)), "基础",
        G("gen.decimal.ue3", { v1: a, v2: b, v3: ans, v4: ans, v5: b, v6: a }, `按整数除法算，商的小数点与被除数对齐：${a}÷${b}=${ans}（验算 ${ans}×${b}=${a}）。`), G("gen.decimal.upt3", null, "小数除法"), null);
    }
    if (type === 4) {
      const x = r2(rnd(101, 999) / 100), k = pick([10, 100, 1000]), ans = r2(x * k);
      return Q(G("gen.decimal.uq4", { v1: x, v2: k }, `把 ${x} 扩大到原来的 ${k} 倍，结果是多少？`), opts(ans, () => r2(x * pick([10, 100, 1000, 5]) + rnd(-2, 2))), "基础",
        G("gen.decimal.ue4", { v1: k, v2: String(k).length - 1, v3: x, v4: ans }, `扩大 ${k} 倍就是小数点向右移动 ${String(k).length - 1} 位：${x} → ${ans}。`), G("gen.decimal.upt4", null, "小数点移动"), null);
    }
    if (type === 5) {
      const conf = pick([{ k: 100, a: "米", b: "厘米" }, { k: 1000, a: "千克", b: "克" }, { k: 10, a: "元", b: "角" }, { k: 10, a: "分米", b: "厘米" }]);
      const v = r2(rnd(101, 999) / 100), ans = Math.round(v * conf.k);
      return Q(G("gen.decimal.uq5", { v1: v, v2: conf.a, v3: conf.b }, `单位换算：${v} ${conf.a} = ? ${conf.b}`), opts(ans, () => Math.round(v * conf.k) + rnd(-30, 30)), "提升",
        G("gen.decimal.ue5", { v1: conf.a, v2: conf.k, v3: conf.b, v4: v, v5: conf.k, v6: ans, v7: conf.b }, `1 ${conf.a}=${conf.k} ${conf.b}，所以 ${v}×${conf.k}=${ans}（${conf.b}）。`), G("gen.decimal.upt5", null, "单位换算"), null);
    }
    if (type === 6) {
      let a = r2(rnd(100, 999) / 100), b = r2(rnd(100, 999) / 100); while (a === b) b = r2(rnd(100, 999) / 100);
      const ans = Math.max(a, b);
      return Q(G("gen.decimal.uq6", { v1: a, v2: b }, `比较大小：${a} 和 ${b}，较大的数是多少？`), opts(ans, () => r2(rnd(100, 999) / 100)), "基础",
        G("gen.decimal.ue6", { v1: Math.max(a, b), v2: Math.min(a, b), v3: ans }, `先比整数部分，再依次比十分位、百分位：${Math.max(a, b)} > ${Math.min(a, b)}，较大的是 ${ans}。`), G("gen.decimal.upt6", null, "小数比大小"), null);
    }
    if (type === 7) {
      const x = r2(rnd(100, 9999) / 100), ans = r1(x);
      return Q(G("gen.decimal.uq7", { v1: x }, `把 ${x} 保留一位小数，近似数是多少？`), opts(ans, () => r1(x + rnd(-8, 8) / 10)), "提升",
        G("gen.decimal.ue7", { v1: x, v2: Math.round(x * 100) % 10, v3: Math.round(x * 100) % 10 >= 5 ? "满 5 向前进一" : "小于 5 直接舍去", v4: ans }, `看百分位上的数字：${x} 的百分位是 ${Math.round(x * 100) % 10}，${Math.round(x * 100) % 10 >= 5 ? "满 5 向前进一" : "小于 5 直接舍去"}，得 ${ans}。`), G("gen.decimal.upt7", null, "四舍五入"), null);
    }
    if (type === 8) {
      const p = r2(rnd(15, 99) / 10), n = rnd(2, 12), ans = r2(p * n);
      return Q(G("gen.decimal.uq8", { v1: p, v2: n }, `每支笔 ${p} 元，买 ${n} 支一共要多少元？`), opts(ans, () => r2(p * rnd(2, 15))), "基础",
        G("gen.decimal.ue8", { v1: p, v2: n, v3: ans }, `总价=单价×数量=${p}×${n}=${ans}（元）。`), G("gen.decimal.upt8", null, "小数应用"), null);
    }
    if (type === 9) {
      const a = r2(rnd(11, 99) / 10), b = r2(rnd(11, 99) / 10), ans = r2(a * b);
      const A = Math.round(a * 10), B = Math.round(b * 10);
      return Q(G("gen.decimal.uq9", { v1: a, v2: b }, `计算：${a} × ${b} = ?`), opts(ans, () => r2(a * r2(rnd(11, 99) / 10))), "提升",
        G("gen.decimal.ue9", { v1: A, v2: B, v3: A * B, v4: ans }, `先算 ${A}×${B}=${A * B}，两个因数共有 2 位小数，积也点 2 位：${ans}。`), G("gen.decimal.upt9", null, "小数乘小数"), null);
    }
    if (type === 10) {
      const b = pick([3, 6, 7, 9, 11, 12]), a = rnd(1, 20), ans = Math.floor(a * 10 / b) % 10;
      return Q(G("gen.decimal.uq10", { v1: a, v2: b }, `${a} ÷ ${b} 的商，小数点后第一位数字是几？`), opts(ans, () => rnd(0, 9)), "拔高",
        G("gen.decimal.ue10", { v1: a, v2: b, v3: r3(a / b), v4: a % b, v5: b, v6: Math.floor((a % b) * 10 / b), v7: ans }, `${a}÷${b}=${r3(a / b)}…，把余数补 0 继续除：${a % b}0÷${b} 的整数部分是 ${Math.floor((a % b) * 10 / b)}，所以第一位是 ${ans}。`), G("gen.decimal.upt10", null, "循环小数"), null);
    }
    const x = r2(rnd(150, 9950) / 100), ans = Math.round(x);
    return Q(G("gen.decimal.uq11", { v1: x }, `把 ${x} 保留整数，近似数是多少？`), opts(ans, () => ans + rnd(-5, 5)), "提升",
      G("gen.decimal.ue11", { v1: x, v2: Math.floor(x * 10) % 10, v3: Math.floor(x * 10) % 10 >= 5 ? "满 5 进 1" : "小于 5 舍去", v4: ans }, `看十分位：${x} 的十分位是 ${Math.floor(x * 10) % 10}，${Math.floor(x * 10) % 10 >= 5 ? "满 5 进 1" : "小于 5 舍去"}，得 ${ans}。`), G("gen.decimal.upt11", null, "求近似数"), null);
  }

  /* ============ 8. percent 百分数与折扣（六年级） ============ */
  function qPercent() {
    const type = rnd(0, 11);
    if (type === 0) {
      const b = rnd(1, 9) * 100, p = rnd(5, 95), a = b * p / 100;
      return Q(G("gen.percent.uq0", { v1: a, v2: b }, `${a} 是 ${b} 的百分之几？（填百分号前的数）`), opts(p, () => rnd(1, 99)), "基础",
        G("gen.percent.ue0", { v1: a, v2: b, v3: r3(a / b), v4: p, v5: p }, `${a}÷${b}=${r3(a / b)}=${p}%，所以是 ${p}%。`), G("gen.percent.upt0", null, "求百分率"), null);
    }
    if (type === 1) {
      const d = rnd(3, 9), ans = d * 10;
      return Q(G("gen.percent.uq1", { v1: d }, `商店“打 ${d} 折”出售，售价是原价的百分之几？（填百分号前的数）`), opts(ans, () => rnd(1, 9) * 10 + pick([0, 5])), "基础",
        G("gen.percent.ue1", { v1: d, v2: d, v3: ans }, `打 ${d} 折就是按原价的 ${d}/10 卖，即 ${ans}%。`), G("gen.percent.upt1", null, "折扣含义"), null);
    }
    if (type === 2) {
      const P = rnd(4, 90) * 10, d = pick([5, 6, 7, 8, 9]), ans = P * d / 10;
      return Q(G("gen.percent.uq2", { v1: P, v2: d }, `一件衣服原价 ${P} 元，现在打 ${d} 折出售，现价是多少元？`), opts(ans, () => P * pick([5, 6, 7, 8, 9]) / 10), "基础",
        G("gen.percent.ue2", { v1: d, v2: P, v3: d / 10, v4: ans }, `现价=原价×${d}0%=${P}×${d / 10}=${ans}（元）。`), G("gen.percent.upt2", null, "求折后价"), null);
    }
    if (type === 3) {
      const P = rnd(4, 90) * 10, d = pick([5, 6, 8]), C = P * d / 10;
      return Q(G("gen.percent.uq3", { v1: d, v2: C }, `一本书打 ${d} 折后卖 ${C} 元，原价是多少元？`), opts(P, () => C + rnd(1, 40) * 10), "提升",
        G("gen.percent.ue3", { v1: d, v2: C, v3: d / 10, v4: P }, `原价=现价÷${d}0%=${C}÷${d / 10}=${P}（元）。`), G("gen.percent.upt3", null, "求原价"), null);
    }
    if (type === 4) {
      const A = rnd(5, 60) * 10, n = rnd(1, 5), ans = A + A * n / 10;
      return Q(G("gen.percent.uq4", { v1: A, v2: n }, `去年产粮 ${A} 吨，今年比去年增产 ${n} 成。今年产粮多少吨？`), opts(ans, () => A + A * rnd(1, 6) / 10), "提升",
        G("gen.percent.ue4", { v1: n, v2: n * 10, v3: A, v4: n * 10, v5: A * n / 10, v6: A, v7: A * n / 10, v8: ans }, `${n} 成就是 ${n * 10}%，增产 ${A}×${n * 10}%=${A * n / 10}（吨），今年 ${A}+${A * n / 10}=${ans}（吨）。`), G("gen.percent.upt4", null, "成数"), null);
    }
    if (type === 5) {
      const A = rnd(5, 90) * 100, r = pick([3, 4, 5, 6, 8, 10]), ans = A * r / 100;
      return Q(G("gen.percent.uq5", { v1: A, v2: r }, `某饭店营业额是 ${A} 元，按 ${r}% 的税率缴纳营业税，应缴税款多少元？`), opts(ans, () => A * pick([3, 4, 5, 6, 8, 10]) / 100 + rnd(0, 1)), "基础",
        G("gen.percent.ue5", { v1: A, v2: r, v3: ans }, `税款=营业额×税率=${A}×${r}%=${ans}（元）。`), G("gen.percent.upt5", null, "税率"), null);
    }
    if (type === 6) {
      const P = rnd(5, 90) * 100, r = pick([2, 3, 4, 5]), t = rnd(1, 5), ans = P * r * t / 100;
      return Q(G("gen.percent.uq6", { v1: P, v2: r, v3: t }, `把 ${P} 元存入银行，年利率 ${r}%，存 ${t} 年到期的利息是多少元？`), opts(ans, () => P * pick([2, 3, 4, 5]) * rnd(1, 5) / 100), "提升",
        G("gen.percent.ue6", { v1: P, v2: r, v3: t, v4: ans }, `利息=本金×年利率×年数=${P}×${r}%×${t}=${ans}（元）。`), G("gen.percent.upt6", null, "利率"), null);
    }
    if (type === 7) {
      const b = rnd(1, 9) * 100, p = rnd(85, 99), a = b * p / 100;
      return Q(G("gen.percent.uq7", { v1: b, v2: a }, `学校应到 ${b} 人，实到 ${a} 人，出勤率是百分之几？（填百分号前的数）`), opts(p, () => rnd(80, 100)), "基础",
        G("gen.percent.ue7", { v1: a, v2: b, v3: p }, `出勤率=实到÷应到=${a}÷${b}=${p}%。`), G("gen.percent.upt7", null, "出勤率"), null);
    }
    if (type === 8) {
      const P = rnd(5, 60) * 20, r = pick([5, 10, 20, 25, 50]), ans = P + P * r / 100;
      return Q(G("gen.percent.uq8", { v1: P, v2: r }, `某商品原价 ${P} 元，提价 ${r}% 后的价格是多少元？`), opts(ans, () => P + P * pick([5, 10, 20, 25, 50]) / 100), "提升",
        G("gen.percent.ue8", { v1: P, v2: r, v3: P * r / 100, v4: P, v5: P * r / 100, v6: ans }, `提价部分=${P}×${r}%=${P * r / 100}（元），现价=${P}+${P * r / 100}=${ans}（元）。`), G("gen.percent.upt8", null, "百分数增加"), null);
    }
    if (type === 9) {
      const P = rnd(5, 60) * 20, r = pick([5, 10, 20, 25, 50]), ans = P - P * r / 100;
      return Q(G("gen.percent.uq9", { v1: P, v2: r }, `某商品原价 ${P} 元，降价 ${r}% 后的价格是多少元？`), opts(ans, () => P - P * pick([5, 10, 20, 25, 50]) / 100), "提升",
        G("gen.percent.ue9", { v1: P, v2: r, v3: P * r / 100, v4: P, v5: P * r / 100, v6: ans }, `降价部分=${P}×${r}%=${P * r / 100}（元），现价=${P}−${P * r / 100}=${ans}（元）。`), G("gen.percent.upt9", null, "百分数减少"), null);
    }
    if (type === 10) {
      const T = rnd(2, 60) * 100, r = pick([10, 20, 25, 40, 50, 80]), A = T * r / 100;
      return Q(G("gen.percent.uq10", { v1: r, v2: A }, `一个数的 ${r}% 是 ${A}，这个数是多少？`), opts(T, () => A * pick([2, 3, 4, 5, 8, 10]) + rnd(0, 2)), "提升",
        G("gen.percent.ue10", { v1: A, v2: r, v3: A, v4: r / 100, v5: T }, `这个数=${A}÷${r}%=${A}÷${r / 100}=${T}。`), G("gen.percent.upt10", null, "已知部分求整体"), null);
    }
    const N = rnd(1, 9) * 100, p = rnd(85, 98), M = N * p / 100, ans = 100 - p;
    return Q(G("gen.percent.uq11", { v1: N, v2: M }, `工厂生产 ${N} 个零件，其中合格的有 ${M} 个。不合格率是百分之几？（填百分号前的数）`), opts(ans, () => rnd(1, 20)), "提升",
      G("gen.percent.ue11", { v1: N, v2: M, v3: N - M, v4: N - M, v5: N, v6: ans }, `不合格 ${N}−${M}=${N - M}（个），不合格率=${N - M}÷${N}=${ans}%。`), G("gen.percent.upt11", null, "合格率"), null);
  }

  /* ============ 9. ratio 比和比例（五年级） ============ */
  function qRatio() {
    const type = rnd(0, 11);
    if (type === 0) {
      const pairs = [[2, 3], [3, 4], [4, 5], [5, 6], [2, 5], [3, 7], [5, 8], [7, 9], [3, 8], [4, 9], [5, 7], [2, 7]];
      const pr = pick(pairs), g = pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const a = pr[0] * g, b = pr[1] * g;
      return Q(G("gen.ratio.uq0", { v1: a, v2: b }, `把比 ${a} : ${b} 化成最简整数比，前项是多少？`), opts(pr[0], () => rnd(1, 15)), "基础",
        G("gen.ratio.ue0", { v1: a, v2: b, v3: g, v4: g, v5: a, v6: g, v7: pr[0], v8: b, v9: g, v10: pr[1], v11: pr[0], v12: pr[1] }, `${a} 与 ${b} 的最大公因数是 ${g}，前后项都除以 ${g}：${a}÷${g}=${pr[0]}，${b}÷${g}=${pr[1]}，最简比是 ${pr[0]} : ${pr[1]}。`), G("gen.ratio.upt0", null, "化简比"), null);
    }
    if (type === 1) {
      const b = rnd(2, 15), q = rnd(2, 12), a = b * q;
      return Q(G("gen.ratio.uq1", { v1: a, v2: b }, `求比值：${a} : ${b} = ?`), opts(q, () => rnd(2, 18)), "基础",
        G("gen.ratio.ue1", { v1: a, v2: b, v3: q }, `比值=前项÷后项=${a}÷${b}=${q}。`), G("gen.ratio.upt1", null, "求比值"), null);
    }
    if (type === 2) {
      const pr = pick([[2, 3], [3, 4], [1, 4], [2, 5], [3, 5], [4, 5], [5, 7], [3, 7]]), k = rnd(3, 30);
      const S = (pr[0] + pr[1]) * k, big = rnd(0, 1), ans = big ? pr[1] * k : pr[0] * k;
      return Q(G("gen.ratio.uq2", { v1: S, v2: pr[0], v3: pr[1], v4: big ? "乙" : "甲" }, `把 ${S} 个苹果按 ${pr[0]} : ${pr[1]} 分给甲、乙两班，${big ? "乙" : "甲"}班分得多少个？`), opts(ans, () => rnd(1, S - 1)), "提升",
        G("gen.ratio.ue2", { v1: pr[0], v2: pr[1], v3: pr[0] + pr[1], v4: S, v5: pr[0] + pr[1], v6: k, v7: big ? "乙" : "甲", v8: k, v9: big ? pr[1] : pr[0], v10: ans }, `总份数=${pr[0]}+${pr[1]}=${pr[0] + pr[1]}（份），每份 ${S}÷${pr[0] + pr[1]}=${k}（个），${big ? "乙" : "甲"}班 ${k}×${big ? pr[1] : pr[0]}=${ans}（个）。`), G("gen.ratio.upt2", null, "按比分配"), null);
    }
    if (type === 3) {
      const k = pick([100, 200, 500, 1000, 2000, 5000]), x = rnd(2, 30), ans = x * k / 100;
      return Q(G("gen.ratio.uq3", { v1: k, v2: x }, `在比例尺是 1 : ${k} 的图上，量得两地相距 ${x} 厘米，实际相距多少米？`), opts(ans, () => x * pick([100, 200, 500, 1000, 2000, 5000]) / 100), "提升",
        G("gen.ratio.ue3", { v1: x, v2: k, v3: x * k, v4: ans }, `实际距离=${x}×${k}=${x * k}（厘米）=${ans}（米）。`), G("gen.ratio.upt3", null, "比例尺"), null);
    }
    if (type === 4) {
      const a = rnd(2, 12), b = rnd(2, 15), m = rnd(2, 9), c = a * m, x = b * m;
      return Q(G("gen.ratio.uq4", { v1: a, v2: b, v3: c }, `解比例：${a} : ${b} = ${c} : ( )，括号里是多少？`), opts(x, () => rnd(2, 60)), "提升",
        G("gen.ratio.ue4", { v1: c, v2: a, v3: m, v4: m, v5: m, v6: b, v7: m, v8: x }, `${c}÷${a}=${m}，前项扩大 ${m} 倍，后项也扩大 ${m} 倍：${b}×${m}=${x}。`), G("gen.ratio.upt4", null, "解比例"), null);
    }
    if (type === 5) {
      const a = rnd(2, 6), b = rnd(2, 8), c = rnd(2, 9), k = rnd(2, 12), N = c * k, ans = a * k;
      return Q(G("gen.ratio.uq5", { v1: a, v2: b, v3: b, v4: c, v5: N }, `甲 : 乙 = ${a} : ${b}，乙 : 丙 = ${b} : ${c}。若丙是 ${N}，那么甲是多少？`), opts(ans, () => rnd(2, 90)), "拔高",
        G("gen.ratio.ue5", { v1: a, v2: c, v3: N, v4: c, v5: k, v6: a, v7: k, v8: ans }, `甲 : 丙 = ${a} : ${c}，丙=${N} 是 ${c} 的 ${k} 倍，所以甲=${a}×${k}=${ans}。`), G("gen.ratio.upt5", null, "连比"), null);
    }
    if (type === 6) {
      const b = rnd(3, 20), q = rnd(2, 6), a = b * q;
      return Q(G("gen.ratio.uq6", { v1: a, v2: b }, `六年级有男生 ${a} 人，女生 ${b} 人。男生人数是女生人数的多少倍？`), opts(q, () => rnd(2, 10)), "基础",
        G("gen.ratio.ue6", { v1: a, v2: b, v3: q, v4: q, v5: q }, `${a}÷${b}=${q}，所以男生是女生的 ${q} 倍，男女人数比是 ${q} : 1。`), G("gen.ratio.upt6", null, "比的意义"), null);
    }
    if (type === 7) {
      const d = rnd(2, 12), c = rnd(2, 12), m = rnd(2, 9), b = d * m, x = c * m;
      return Q(G("gen.ratio.uq7", { v1: b, v2: c, v3: d }, `解比例：( ) : ${b} = ${c} : ${d}，括号里是多少？`), opts(x, () => rnd(2, 60)), "提升",
        G("gen.ratio.ue7", { v1: b, v2: d, v3: m, v4: c, v5: m, v6: x, v7: x, v8: d, v9: b, v10: c }, `${b}÷${d}=${m}，所以括号=${c}×${m}=${x}（可验算 ${x}×${d}=${b}×${c}）。`), G("gen.ratio.upt7", null, "解比例"), null);
    }
    if (type === 8) {
      const a = rnd(2, 12), b = rnd(2, 12), Kv = a * b, cs = divs(Kv).filter(v => v !== a && v > 1);
      const c = cs.length ? pick(cs) : a, ans = Kv / c;
      return Q(G("gen.ratio.uq8", { v1: a, v2: b, v3: c }, `已知 x 与 y 成反比例，x=${a} 时 y=${b}。当 x=${c} 时，y 是多少？`), opts(ans, () => rnd(1, 60)), "拔高",
        G("gen.ratio.ue8", { v1: a, v2: b, v3: Kv, v4: Kv, v5: c, v6: ans }, `成反比例说明 x×y 的积不变：${a}×${b}=${Kv}，所以 y=${Kv}÷${c}=${ans}。`), G("gen.ratio.upt8", null, "反比例"), null);
    }
    if (type === 9) {
      const t3 = pick([[1, 2, 3], [2, 3, 4], [1, 3, 5], [2, 3, 5], [3, 4, 5], [1, 2, 6], [2, 4, 5]]), k = rnd(3, 25);
      const S = (t3[0] + t3[1] + t3[2]) * k, ans = t3[2] * k;
      return Q(G("gen.ratio.uq9", { v1: S, v2: t3[0], v3: t3[1], v4: t3[2] }, `把 ${S} 元按 ${t3[0]} : ${t3[1]} : ${t3[2]} 分给三人，分得最多的人得多少元？`), opts(ans, () => rnd(1, S - 1)), "提升",
        G("gen.ratio.ue9", { v1: t3[0], v2: t3[1], v3: t3[2], v4: t3[0] + t3[1] + t3[2], v5: S, v6: t3[0] + t3[1] + t3[2], v7: k, v8: k, v9: t3[2], v10: ans }, `总份数 ${t3[0]}+${t3[1]}+${t3[2]}=${t3[0] + t3[1] + t3[2]}，每份 ${S}÷${t3[0] + t3[1] + t3[2]}=${k}（元），最多的人 ${k}×${t3[2]}=${ans}（元）。`), G("gen.ratio.upt9", null, "三项分配"), null);
    }
    if (type === 10) {
      const v = rnd(2, 12), b = rnd(2, 15), ans = v * b;
      return Q(G("gen.ratio.uq10", { v1: v, v2: b }, `一个比的比值是 ${v}，后项是 ${b}，前项是多少？`), opts(ans, () => rnd(2, 80)), "提升",
        G("gen.ratio.ue10", { v1: v, v2: b, v3: ans }, `前项=比值×后项=${v}×${b}=${ans}。`), G("gen.ratio.upt10", null, "比值与前项"), null);
    }
    const k = pick([100, 200, 500, 1000, 2000]), ans = rnd(2, 30), x = ans * k / 100;
    return Q(G("gen.ratio.uq11", { v1: x, v2: k }, `实际距离 ${x} 米，画在比例尺 1 : ${k} 的图上，图上距离是多少厘米？`), opts(ans, () => rnd(2, 60)), "拔高",
      G("gen.ratio.ue11", { v1: x, v2: x * 100, v3: x * 100, v4: k, v5: ans }, `${x} 米=${x * 100} 厘米，图上距离=${x * 100}÷${k}=${ans}（厘米）。`), G("gen.ratio.upt11", null, "比例尺应用"), null);
  }

  /* ============ 10. trip 行程问题（六年级） ============ */
  function qTrip() {
    const type = rnd(0, 11);
    if (type === 0) {
      const v1 = rnd(30, 70), v2 = rnd(30, 70), t = rnd(2, 9), S = (v1 + v2) * t;
      return Q(G("gen.trip.uq0", { v1: S, v2: v1, v3: v2 }, `甲、乙两地相距 ${S} 千米，两车同时从两地相对开出，速度分别是每小时 ${v1} 千米和 ${v2} 千米。几小时后相遇？`), opts(t, () => rnd(1, 14)), "基础",
        G("gen.trip.ue0", { v1: v1, v2: v2, v3: v1 + v2, v4: S, v5: v1 + v2, v6: t }, `速度和=${v1}+${v2}=${v1 + v2}（千米/时），相遇时间=路程和÷速度和=${S}÷${v1 + v2}=${t}（小时）。`), G("gen.trip.upt0", null, "相遇求时间"), null);
    }
    if (type === 1) {
      const v1 = rnd(30, 80), v2 = rnd(30, 80), t = rnd(2, 8), ans = (v1 + v2) * t;
      return Q(G("gen.trip.uq1", { v1: v1, v2: v2, v3: t }, `两人分别以每小时 ${v1} 千米、${v2} 千米的速度相向而行，${t} 小时后相遇。两地相距多少千米？`), opts(ans, () => (v1 + v2) * rnd(2, 10)), "基础",
        G("gen.trip.ue1", { v1: v1, v2: v2, v3: t, v4: v1 + v2, v5: t, v6: ans }, `路程和=速度和×时间=(${v1}+${v2})×${t}=${v1 + v2}×${t}=${ans}（千米）。`), G("gen.trip.upt1", null, "相遇求路程"), null);
    }
    if (type === 2) {
      const v1 = rnd(20, 60), v2 = rnd(20, 60), t = rnd(2, 8), S = (v1 + v2) * t;
      return Q(G("gen.trip.uq2", { v1: S, v2: v1, v3: t }, `两地相距 ${S} 千米，甲以每小时 ${v1} 千米的速度出发，同时乙从另一地出发，${t} 小时后两人相遇。乙每小时行多少千米？`), opts(v2, () => rnd(15, 75)), "提升",
        G("gen.trip.ue2", { v1: S, v2: t, v3: v1 + v2, v4: v1 + v2, v5: v1, v6: v2 }, `速度和=${S}÷${t}=${v1 + v2}（千米/时），乙的速度=${v1 + v2}−${v1}=${v2}（千米/时）。`), G("gen.trip.upt2", null, "相遇求速度"), null);
    }
    if (type === 3) {
      const v2 = rnd(20, 50), dv = rnd(5, 25), v1 = v2 + dv, t = rnd(2, 9), d = dv * t;
      return Q(G("gen.trip.uq3", { v1: d, v2: v1, v3: v2 }, `乙先走了 ${d} 千米后，甲开始追。甲每小时行 ${v1} 千米，乙每小时行 ${v2} 千米。甲几小时能追上乙？`), opts(t, () => rnd(1, 14)), "提升",
        G("gen.trip.ue3", { v1: v1, v2: v2, v3: dv, v4: d, v5: dv, v6: t }, `速度差=${v1}−${v2}=${dv}（千米/时），追及时间=路程差÷速度差=${d}÷${dv}=${t}（小时）。`), G("gen.trip.upt3", null, "追及求时间"), null);
    }
    if (type === 4) {
      const v2 = rnd(20, 50), dv = rnd(4, 20), v1 = v2 + dv, t = rnd(2, 9), ans = dv * t;
      return Q(G("gen.trip.uq4", { v1: v1, v2: v2, v3: t }, `甲每小时行 ${v1} 千米，乙每小时行 ${v2} 千米，同向而行 ${t} 小时后甲比乙多行多少千米？`), opts(ans, () => dv * rnd(2, 12)), "基础",
        G("gen.trip.ue4", { v1: v1, v2: v2, v3: dv, v4: t, v5: dv, v6: t, v7: ans }, `每小时甲比乙多行 ${v1}−${v2}=${dv}（千米），${t} 小时多行 ${dv}×${t}=${ans}（千米）。`), G("gen.trip.upt4", null, "追及求路程差"), null);
    }
    if (type === 5) {
      const v2 = rnd(20, 50), dv = rnd(5, 20), v1 = v2 + dv, t = rnd(2, 8), d = dv * t;
      return Q(G("gen.trip.uq5", { v1: v2, v2: d, v3: t }, `乙以每小时 ${v2} 千米先行 ${d} 千米，甲出发后 ${t} 小时追上乙。甲每小时行多少千米？`), opts(v1, () => rnd(20, 80)), "拔高",
        G("gen.trip.ue5", { v1: d, v2: t, v3: dv, v4: v2, v5: dv, v6: v1 }, `速度差=${d}÷${t}=${dv}（千米/时），甲的速度=${v2}+${dv}=${v1}（千米/时）。`), G("gen.trip.upt5", null, "追及求速度"), null);
    }
    if (type === 6) {
      const v = rnd(15, 90), t = rnd(2, 12), ans = v * t;
      return Q(G("gen.trip.uq6", { v1: v, v2: t }, `一辆汽车每小时行 ${v} 千米，行了 ${t} 小时，一共行了多少千米？`), opts(ans, () => v * rnd(2, 14)), "基础",
        G("gen.trip.ue6", { v1: v, v2: t, v3: ans }, `路程=速度×时间=${v}×${t}=${ans}（千米）。`), G("gen.trip.upt6", null, "求路程"), null);
    }
    if (type === 7) {
      const v = rnd(15, 90), t = rnd(2, 12), S = v * t;
      return Q(G("gen.trip.uq7", { v1: t, v2: S }, `一辆车 ${t} 小时行了 ${S} 千米，平均每小时行多少千米？`), opts(v, () => rnd(15, 99)), "基础",
        G("gen.trip.ue7", { v1: S, v2: t, v3: v }, `速度=路程÷时间=${S}÷${t}=${v}（千米/时）。`), G("gen.trip.upt7", null, "求速度"), null);
    }
    if (type === 8) {
      const v = rnd(15, 90), t = rnd(2, 12), S = v * t;
      return Q(G("gen.trip.uq8", { v1: v, v2: S }, `一辆车每小时行 ${v} 千米，行 ${S} 千米需要多少小时？`), opts(t, () => rnd(2, 16)), "基础",
        G("gen.trip.ue8", { v1: S, v2: v, v3: t }, `时间=路程÷速度=${S}÷${v}=${t}（小时）。`), G("gen.trip.upt8", null, "求时间"), null);
    }
    if (type === 9) {
      const cf = pick([[30, 60, 40], [20, 30, 24], [40, 60, 48], [10, 15, 12], [12, 24, 16], [20, 80, 32], [15, 30, 20], [6, 12, 8], [24, 8, 12], [50, 30, 37.5]]);
      const d = rnd(2, 30) * 6, ans = cf[2];
      return Q(G("gen.trip.uq9", { v1: d, v2: cf[0], v3: cf[1] }, `小明从家到学校 ${d} 千米，去时每小时 ${cf[0]} 千米，回来每小时 ${cf[1]} 千米。往返的平均速度是每小时多少千米？`), opts(ans, () => r2((cf[0] + cf[1]) / 2) + rnd(0, 6)), "拔高",
        G("gen.trip.ue9", { v1: r3(d / cf[0]), v2: r3(d / cf[1]), v3: 2 * d, v4: 2 * d, v5: r3(d / cf[0] + d / cf[1]), v6: ans }, `去用 ${r3(d / cf[0])} 小时，回用 ${r3(d / cf[1])} 小时，总路程 ${2 * d} 千米；平均速度=总路程÷总时间=${2 * d}÷${r3(d / cf[0] + d / cf[1])}=${ans}（千米/时）。`), G("gen.trip.upt9", null, "平均速度"), null);
    }
    if (type === 10) {
      const v1 = rnd(30, 60), v2 = rnd(30, 60), t1 = rnd(2, 6), S = (v1 + v2) * t1, n = rnd(2, 4), ans = (2 * n - 1) * t1;
      return Q(G("gen.trip.uq10", { v1: S, v2: v1, v3: v2, v4: n }, `两车在相距 ${S} 千米的两地同时相对开出，速度分别是每小时 ${v1} 千米和 ${v2} 千米，到站后立即返回。第 ${n} 次相遇时共用了多少小时？`), opts(ans, () => rnd(2, 40)), "拔高",
        G("gen.trip.ue10", { v1: S, v2: v1 + v2, v3: t1, v4: n, v5: 2 * n - 1, v6: 2 * n - 1, v7: t1, v8: ans }, `第 1 次相遇合走 1 个全程用 ${S}÷${v1 + v2}=${t1}（小时）；第 ${n} 次相遇合走 ${2 * n - 1} 个全程，用 ${2 * n - 1}×${t1}=${ans}（小时）。`), G("gen.trip.upt10", null, "多次相遇"), null);
    }
    const v1 = rnd(30, 70), v2 = rnd(30, 70), t = rnd(2, 8), S = (v1 + v2) * t, ans = v1 * t;
    return Q(G("gen.trip.uq11", { v1: S, v2: v1, v3: v2 }, `两地相距 ${S} 千米，甲、乙两车同时相对开出，速度分别是每小时 ${v1} 千米、${v2} 千米。相遇时甲车行了多少千米？`), opts(ans, () => v1 * rnd(2, 10)), "提升",
      G("gen.trip.ue11", { v1: S, v2: v1, v3: v2, v4: t, v5: v1, v6: t, v7: ans }, `相遇时间=${S}÷(${v1}+${v2})=${t}（小时），甲行 ${v1}×${t}=${ans}（千米）。`), G("gen.trip.upt11", null, "相遇分路程"), null);
  }

  /* ============ 11. profit 利润与税率（六年级） ============ */
  function qProfitTax() {
    const type = rnd(0, 11);
    if (type === 0) {
      const C = rnd(10, 300) * 5, P = rnd(2, 60) * 5, Sp = C + P;
      return Q(G("gen.profit.uq0", { v1: C, v2: Sp }, `一件商品成本 ${C} 元，售价 ${Sp} 元，每件的利润是多少元？`), opts(P, () => rnd(2, 80) * 5), "基础",
        G("gen.profit.ue0", { v1: Sp, v2: C, v3: P }, `利润=售价−成本=${Sp}−${C}=${P}（元）。`), G("gen.profit.upt0", null, "求利润"), null);
    }
    if (type === 1) {
      const C = rnd(2, 60) * 100, r = pick([10, 20, 25, 30, 40, 50]), P = C * r / 100, Sp = C + P;
      return Q(G("gen.profit.uq1", { v1: C, v2: Sp }, `成本 ${C} 元的商品卖 ${Sp} 元，利润率是百分之几？（填百分号前的数）`), opts(r, () => rnd(5, 60)), "提升",
        G("gen.profit.ue1", { v1: Sp, v2: C, v3: P, v4: P, v5: C, v6: r }, `利润=${Sp}−${C}=${P}（元），利润率=利润÷成本=${P}÷${C}=${r}%。`), G("gen.profit.upt1", null, "利润率"), null);
    }
    if (type === 2) {
      const C = rnd(2, 60) * 100, r = pick([10, 20, 25, 30, 40, 50]), ans = C + C * r / 100;
      return Q(G("gen.profit.uq2", { v1: C, v2: r }, `某商品成本 ${C} 元，要获得 ${r}% 的利润，售价应定为多少元？`), opts(ans, () => C + C * pick([10, 20, 25, 30, 40, 50]) / 100), "提升",
        G("gen.profit.ue2", { v1: C, v2: r, v3: C * r / 100, v4: C, v5: C * r / 100, v6: ans }, `利润=${C}×${r}%=${C * r / 100}（元），售价=${C}+${C * r / 100}=${ans}（元）。`), G("gen.profit.upt2", null, "求售价"), null);
    }
    if (type === 3) {
      const C = rnd(2, 60) * 100, r = pick([10, 20, 25, 50]), Sp = C + C * r / 100;
      return Q(G("gen.profit.uq3", { v1: r, v2: Sp }, `一件商品按 ${r}% 的利润率定价，售价是 ${Sp} 元，成本是多少元？`), opts(C, () => rnd(2, 70) * 100), "拔高",
        G("gen.profit.ue3", { v1: r, v2: 100 + r, v3: Sp, v4: (100 + r) / 100, v5: C }, `售价是成本的 (100%+${r}%)=${100 + r}%，成本=${Sp}÷${(100 + r) / 100}=${C}（元）。`), G("gen.profit.upt3", null, "求成本"), null);
    }
    if (type === 4) {
      const M = rnd(4, 90) * 10, d = pick([5, 6, 7, 8, 9]), ans = M * d / 10;
      return Q(G("gen.profit.uq4", { v1: M, v2: d }, `标价 ${M} 元的商品打 ${d} 折出售，售价是多少元？`), opts(ans, () => M * pick([5, 6, 7, 8, 9]) / 10), "基础",
        G("gen.profit.ue4", { v1: d, v2: M, v3: d / 10, v4: ans }, `售价=标价×${d}0%=${M}×${d / 10}=${ans}（元）。`), G("gen.profit.upt4", null, "折后售价"), null);
    }
    if (type === 5) {
      const M = rnd(10, 60) * 10, d = pick([6, 7, 8, 9]), Sp = M * d / 10, C = Math.round(Sp * pick([0.5, 0.6]) / 10) * 10, ans = Sp - C;
      return Q(G("gen.profit.uq5", { v1: M, v2: d, v3: C }, `标价 ${M} 元的商品打 ${d} 折卖出，成本是 ${C} 元，每件赚多少元？`), opts(ans, () => ans + rnd(1, 12) * 5), "提升",
        G("gen.profit.ue5", { v1: M, v2: d / 10, v3: Sp, v4: Sp, v5: C, v6: ans }, `售价=${M}×${d / 10}=${Sp}（元），利润=${Sp}−${C}=${ans}（元）。`), G("gen.profit.upt5", null, "折后利润"), null);
    }
    if (type === 6) {
      const A = rnd(5, 90) * 100, r = pick([3, 5, 6, 8, 10, 12]), ans = A * r / 100;
      return Q(G("gen.profit.uq6", { v1: A, v2: r }, `某公司营业额 ${A} 元，按 ${r}% 缴纳营业税，应缴多少元税款？`), opts(ans, () => A * pick([3, 5, 6, 8, 10, 12]) / 100 + rnd(0, 1)), "基础",
        G("gen.profit.ue6", { v1: A, v2: r, v3: ans }, `税款=营业额×税率=${A}×${r}%=${ans}（元）。`), G("gen.profit.upt6", null, "税款"), null);
    }
    if (type === 7) {
      const A = rnd(5, 90) * 100, r = pick([5, 10, 20, 25]), ans = A - A * r / 100;
      return Q(G("gen.profit.uq7", { v1: A, v2: r }, `收入 ${A} 元，按 ${r}% 缴税后，实际得到多少元？`), opts(ans, () => A - A * pick([5, 10, 20, 25]) / 100), "提升",
        G("gen.profit.ue7", { v1: A, v2: r, v3: A * r / 100, v4: A, v5: A * r / 100, v6: ans }, `税款=${A}×${r}%=${A * r / 100}（元），实得=${A}−${A * r / 100}=${ans}（元）。`), G("gen.profit.upt7", null, "税后所得"), null);
    }
    if (type === 8) {
      const C = rnd(10, 200) * 10, loss = rnd(2, 30) * 5, Sp = C - loss;
      return Q(G("gen.profit.uq8", { v1: C, v2: Sp }, `一件商品成本 ${C} 元，只卖了 ${Sp} 元，亏了多少元？`), opts(loss, () => rnd(2, 40) * 5), "基础",
        G("gen.profit.ue8", { v1: C, v2: Sp, v3: loss }, `售价低于成本就是亏损：${C}−${Sp}=${loss}（元）。`), G("gen.profit.upt8", null, "亏损"), null);
    }
    if (type === 9) {
      const C = rnd(2, 60) * 100, r = pick([10, 15, 20, 25, 30, 40]), ans = C * r / 100;
      return Q(G("gen.profit.uq9", { v1: C, v2: r }, `成本 ${C} 元的商品，利润率是 ${r}%，每件利润是多少元？`), opts(ans, () => C * pick([10, 15, 20, 25, 30, 40]) / 100), "基础",
        G("gen.profit.ue9", { v1: C, v2: r, v3: ans }, `利润=成本×利润率=${C}×${r}%=${ans}（元）。`), G("gen.profit.upt9", null, "利润率求利润"), null);
    }
    if (type === 10) {
      const p = rnd(2, 30) * 5, n = rnd(4, 60), ans = p * n;
      return Q(G("gen.profit.uq10", { v1: p, v2: n }, `每件商品利润 ${p} 元，卖出 ${n} 件，一共赚了多少元？`), opts(ans, () => p * rnd(4, 70)), "基础",
        G("gen.profit.ue10", { v1: p, v2: n, v3: ans }, `总利润=每件利润×件数=${p}×${n}=${ans}（元）。`), G("gen.profit.upt10", null, "总利润"), null);
    }
    const C = rnd(1, 15) * 400, d = pick([8, 5, 4]), r = pick([20, 25, 50]), Sp = C * (100 + r) / 100, ans = Sp * 10 / d;
    return Q(G("gen.profit.uq11", { v1: C, v2: d, v3: r }, `一件成本 ${C} 元的商品，打 ${d} 折出售后仍能获利 ${r}%。它的标价是多少元？`), opts(ans, () => C * pick([1.5, 2, 2.5, 3])), "拔高",
      G("gen.profit.ue11", { v1: C, v2: r, v3: Sp, v4: d, v5: Sp, v6: d / 10, v7: ans }, `打折后的售价=${C}×(1+${r}%)=${Sp}（元），标价=售价÷${d}0%=${Sp}÷${d / 10}=${ans}（元）。`), G("gen.profit.upt11", null, "标价与折扣"), null);
  }

  /* ============ 12. circle 圆的认识与周长面积（六年级） ============ */
  function qCircle() {
    const type = rnd(0, 11);
    if (type === 0) {
      const r = rnd(1, 30), ans = r2(2 * 3.14 * r);
      return Q(G("gen.circle.uq0", { v1: r }, `一个圆的半径是 ${r} 厘米，它的周长是多少厘米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(1, 60))), "基础",
        G("gen.circle.ue0", { v1: r, v2: ans }, `C=2πr=2×3.14×${r}=${ans}（厘米）。`), G("gen.circle.upt0", null, "圆的周长"), null);
    }
    if (type === 1) {
      const r = rnd(1, 25), ans = r2(3.14 * r * r);
      return Q(G("gen.circle.uq1", { v1: r }, `一个圆的半径是 ${r} 厘米，它的面积是多少平方厘米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(1, 30) * rnd(1, 30))), "基础",
        G("gen.circle.ue1", { v1: r, v2: r * r, v3: ans }, `S=πr²=3.14×${r}²=3.14×${r * r}=${ans}（平方厘米）。`), G("gen.circle.upt1", null, "圆的面积"), null);
    }
    if (type === 2) {
      const d = rnd(2, 40), ans = r2(3.14 * d);
      return Q(G("gen.circle.uq2", { v1: d }, `一个圆的直径是 ${d} 米，它的周长是多少米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(2, 80))), "基础",
        G("gen.circle.ue2", { v1: d, v2: ans }, `C=πd=3.14×${d}=${ans}（米）。`), G("gen.circle.upt2", null, "直径求周长"), null);
    }
    if (type === 3) {
      const r = rnd(1, 20), d = 2 * r, ans = r2(3.14 * r * r);
      return Q(G("gen.circle.uq3", { v1: d }, `一个圆的直径是 ${d} 分米，它的面积是多少平方分米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(1, 25) * rnd(1, 25))), "提升",
        G("gen.circle.ue3", { v1: d, v2: r, v3: r * r, v4: ans }, `半径 r=${d}÷2=${r}（分米），S=πr²=3.14×${r * r}=${ans}（平方分米）。`), G("gen.circle.upt3", null, "直径求面积"), null);
    }
    if (type === 4) {
      const r = rnd(2, 30), C = r2(2 * 3.14 * r);
      return Q(G("gen.circle.uq4", { v1: C }, `一个圆的周长是 ${C} 厘米，半径是多少厘米？（π 取 3.14）`), opts(r, () => rnd(1, 60)), "提升",
        G("gen.circle.ue4", { v1: C, v2: r }, `r=C÷(2π)=${C}÷6.28=${r}（厘米）。`), G("gen.circle.upt4", null, "周长求半径"), null);
    }
    if (type === 5) {
      const r = rnd(2, 30), ans = r2(3.14 * r + 2 * r);
      return Q(G("gen.circle.uq5", { v1: r }, `一个半圆的半径是 ${r} 厘米，这个半圆的周长是多少厘米？（π 取 3.14）`), opts(ans, () => r2(3.14 * r + rnd(1, 40))), "拔高",
        G("gen.circle.ue5", { v1: r, v2: r, v3: r2(3.14 * r), v4: 2 * r, v5: ans }, `半圆周长=半个圆周+一条直径=3.14×${r}+2×${r}=${r2(3.14 * r)}+${2 * r}=${ans}（厘米）。`), G("gen.circle.upt5", null, "半圆周长"), null);
    }
    if (type === 6) {
      const r = rnd(2, 24), ans = r2(3.14 * r * r / 2);
      return Q(G("gen.circle.uq6", { v1: r }, `一个半圆的半径是 ${r} 分米，它的面积是多少平方分米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(2, 26) * rnd(2, 26) / 2)), "提升",
        G("gen.circle.ue6", { v1: r * r, v2: r2(3.14 * r * r), v3: ans }, `半圆面积=πr²÷2=3.14×${r * r}÷2=${r2(3.14 * r * r)}÷2=${ans}（平方分米）。`), G("gen.circle.upt6", null, "半圆面积"), null);
    }
    if (type === 7) {
      const r = rnd(1, 15), R = r + rnd(1, 12), ans = r2(3.14 * (R * R - r * r));
      return Q(G("gen.circle.uq7", { v1: R, v2: r }, `一个圆环，外圆半径 ${R} 厘米，内圆半径 ${r} 厘米，圆环的面积是多少平方厘米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(2, 40) * rnd(1, 12))), "拔高",
        G("gen.circle.ue7", { v1: R * R, v2: r * r, v3: R * R - r * r, v4: ans }, `S环=π(R²−r²)=3.14×(${R * R}−${r * r})=3.14×${R * R - r * r}=${ans}（平方厘米）。`), G("gen.circle.upt7", null, "圆环面积"), null);
    }
    if (type === 8) {
      const r = rnd(3, 60), askD = rnd(0, 1), ans = askD ? 2 * r : r;
      return Q(askD ? `一个圆的半径是 ${r} 厘米，直径是多少厘米？` : `一个圆的直径是 ${2 * r} 厘米，半径是多少厘米？`, opts(ans, () => rnd(2, 130)), "基础",
        askD ? `直径=半径×2=${r}×2=${ans}（厘米）。` : `半径=直径÷2=${2 * r}÷2=${ans}（厘米）。`, "半径与直径", null);
    }
    if (type === 9) {
      const n = pick([30, 45, 60, 90, 120, 180, 270]), r = rnd(2, 24), ans = r2(3.14 * r * r * n / 360);
      return Q(G("gen.circle.uq8", { v1: n, v2: r }, `一个圆心角是 ${n}° 的扇形，所在圆的半径是 ${r} 厘米，扇形面积是多少平方厘米？（π 取 3.14）`), opts(ans, () => r2(3.14 * r * r * pick([30, 45, 60, 90, 120, 180, 270]) / 360)), "拔高",
        G("gen.circle.ue8", { v1: n, v2: r * r, v3: r3(n / 360), v4: ans }, `扇形面积=πr²×${n}/360=3.14×${r * r}×${r3(n / 360)}=${ans}（平方厘米）。`), G("gen.circle.upt8", null, "扇形面积"), null);
    }
    if (type === 10) {
      const n = pick([45, 60, 90, 120, 180, 270]), r = rnd(2, 30), ans = r2(2 * 3.14 * r * n / 360);
      return Q(G("gen.circle.uq9", { v1: n, v2: r }, `圆心角 ${n}°、半径 ${r} 厘米的扇形，弧长是多少厘米？（π 取 3.14）`), opts(ans, () => r2(2 * 3.14 * r * pick([45, 60, 90, 120, 180, 270]) / 360)), "拔高",
        G("gen.circle.ue9", { v1: n, v2: r, v3: r3(n / 360), v4: ans }, `弧长=2πr×${n}/360=6.28×${r}×${r3(n / 360)}=${ans}（厘米）。`), G("gen.circle.upt9", null, "弧长"), null);
    }
    const k = rnd(2, 9), r = rnd(1, 20), ans = k * k;
    return Q(G("gen.circle.uq10", { v1: r, v2: k }, `一个圆的半径是 ${r} 厘米，如果把半径扩大到原来的 ${k} 倍，面积扩大到原来的多少倍？`), opts(ans, () => rnd(2, 100)), "拔高",
      G("gen.circle.ue10", { v1: r * r, v2: r * k, v3: r * k * r * k, v4: r * k * r * k, v5: r * r, v6: ans, v7: k, v8: ans }, `原面积 πr²=3.14×${r * r}，新半径 ${r * k}，新面积 3.14×${r * k * r * k}；${r * k * r * k}÷${r * r}=${ans}，面积扩大 ${k}²=${ans} 倍。`), G("gen.circle.upt10", null, "面积倍数"), null);
  }

  /* ============ 13. cylinder 圆柱与圆锥（六年级） ============ */
  function qCylinder() {
    const type = rnd(0, 11);
    if (type === 0) {
      const r = rnd(1, 15), h = rnd(2, 30), ans = r2(2 * 3.14 * r * h);
      return Q(G("gen.cylinder.uq0", { v1: r, v2: h }, `一个圆柱底面半径 ${r} 厘米，高 ${h} 厘米，它的侧面积是多少平方厘米？（π 取 3.14）`), opts(ans, () => r2(2 * 3.14 * rnd(1, 16) * rnd(2, 32))), "基础",
        G("gen.cylinder.ue0", { v1: r, v2: h, v3: r2(2 * 3.14 * r), v4: h, v5: ans }, `侧面积=底面周长×高=2×3.14×${r}×${h}=${r2(2 * 3.14 * r)}×${h}=${ans}（平方厘米）。`), G("gen.cylinder.upt0", null, "圆柱侧面积"), null);
    }
    if (type === 1) {
      const r = rnd(1, 12), h = rnd(2, 25), ans = r2(2 * 3.14 * r * h + 2 * 3.14 * r * r);
      return Q(G("gen.cylinder.uq1", { v1: r, v2: h }, `一个圆柱底面半径 ${r} 分米，高 ${h} 分米，它的表面积是多少平方分米？（π 取 3.14）`), opts(ans, () => r2(2 * 3.14 * rnd(1, 13) * rnd(2, 26))), "提升",
        G("gen.cylinder.ue1", { v1: r, v2: h, v3: r2(2 * 3.14 * r * h), v4: r * r, v5: r2(2 * 3.14 * r * r), v6: r2(2 * 3.14 * r * h), v7: r2(2 * 3.14 * r * r), v8: ans }, `侧面积=6.28×${r}×${h}=${r2(2 * 3.14 * r * h)}，两个底面=2×3.14×${r * r}=${r2(2 * 3.14 * r * r)}，表面积=${r2(2 * 3.14 * r * h)}+${r2(2 * 3.14 * r * r)}=${ans}（平方分米）。`), G("gen.cylinder.upt1", null, "圆柱表面积"), null);
    }
    if (type === 2) {
      const r = rnd(1, 12), h = rnd(2, 25), ans = r2(3.14 * r * r * h);
      return Q(G("gen.cylinder.uq2", { v1: r, v2: h }, `一个圆柱底面半径 ${r} 厘米，高 ${h} 厘米，体积是多少立方厘米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(1, 13) * rnd(1, 13) * rnd(2, 26))), "基础",
        G("gen.cylinder.ue2", { v1: r * r, v2: h, v3: r2(3.14 * r * r), v4: h, v5: ans }, `V=πr²h=3.14×${r * r}×${h}=${r2(3.14 * r * r)}×${h}=${ans}（立方厘米）。`), G("gen.cylinder.upt2", null, "圆柱体积"), null);
    }
    if (type === 3) {
      const r = rnd(1, 12), h = pick([3, 6, 9, 12, 15, 18, 21, 24]), ans = r2(3.14 * r * r * h / 3);
      return Q(G("gen.cylinder.uq3", { v1: r, v2: h }, `一个圆锥底面半径 ${r} 厘米，高 ${h} 厘米，体积是多少立方厘米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(1, 13) * rnd(1, 13) * pick([3, 6, 9, 12]) / 3)), "提升",
        G("gen.cylinder.ue3", { v1: r * r, v2: h, v3: ans }, `V锥=1/3×πr²h=1/3×3.14×${r * r}×${h}=${ans}（立方厘米）。`), G("gen.cylinder.upt3", null, "圆锥体积"), null);
    }
    if (type === 4) {
      const V = rnd(2, 60) * 3, ans = V / 3;
      return Q(G("gen.cylinder.uq4", { v1: V }, `一个圆柱和一个圆锥等底等高，圆柱的体积是 ${V} 立方分米，圆锥的体积是多少立方分米？`), opts(ans, () => rnd(2, 70)), "提升",
        G("gen.cylinder.ue4", { v1: V, v2: ans }, `等底等高时圆锥体积是圆柱的 1/3：${V}÷3=${ans}（立方分米）。`), G("gen.cylinder.upt4", null, "等底等高"), null);
    }
    if (type === 5) {
      const Vc = rnd(2, 80), ans = Vc * 3;
      return Q(G("gen.cylinder.uq5", { v1: Vc }, `一个圆锥与一个圆柱等底等高，圆锥体积是 ${Vc} 立方厘米，圆柱体积是多少立方厘米？`), opts(ans, () => rnd(3, 250)), "提升",
        G("gen.cylinder.ue5", { v1: Vc, v2: ans }, `圆柱体积是等底等高圆锥的 3 倍：${Vc}×3=${ans}（立方厘米）。`), G("gen.cylinder.upt5", null, "等底等高"), null);
    }
    if (type === 6) {
      const r = rnd(1, 10), d = 2 * r, h = rnd(2, 20), ans = r2(3.14 * r * r * h);
      return Q(G("gen.cylinder.uq6", { v1: d, v2: h }, `一个圆柱形水桶，底面直径 ${d} 分米，高 ${h} 分米，它的容积是多少立方分米？（π 取 3.14，桶壁厚度不计）`), opts(ans, () => r2(3.14 * rnd(1, 11) * rnd(1, 11) * rnd(2, 21))), "提升",
        G("gen.cylinder.ue6", { v1: d, v2: r, v3: r * r, v4: h, v5: ans }, `半径=${d}÷2=${r}（分米），V=πr²h=3.14×${r * r}×${h}=${ans}（立方分米）。`), G("gen.cylinder.upt6", null, "容积"), null);
    }
    if (type === 7) {
      const d = rnd(2, 30), ans = r2(3.14 * d);
      return Q(G("gen.cylinder.uq7", { v1: d }, `把一个圆柱的侧面展开得到一个长方形，圆柱底面直径是 ${d} 厘米，这个长方形的长是多少厘米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(2, 60))), "拔高",
        G("gen.cylinder.ue7", { v1: d, v2: ans }, `侧面展开后长方形的长等于底面周长：C=πd=3.14×${d}=${ans}（厘米）。`), G("gen.cylinder.upt7", null, "侧面展开"), null);
    }
    if (type === 8) {
      const r = rnd(1, 10), h = pick([3, 6, 9, 12, 15]), ans = r2(3.14 * r * r * h / 3);
      return Q(G("gen.cylinder.uq8", { v1: r, v2: h }, `一个圆锥形沙堆，底面半径 ${r} 米，高 ${h} 米，沙堆的体积是多少立方米？（π 取 3.14）`), opts(ans, () => r2(3.14 * rnd(1, 11) * rnd(1, 11) * pick([3, 6, 9]) / 3)), "提升",
        G("gen.cylinder.ue8", { v1: r * r, v2: h, v3: ans }, `V=1/3πr²h=1/3×3.14×${r * r}×${h}=${ans}（立方米）。`), G("gen.cylinder.upt8", null, "沙堆问题"), null);
    }
    if (type === 9) {
      const Sb = rnd(5, 60), h = rnd(2, 20), ans = Sb * h;
      return Q(G("gen.cylinder.uq9", { v1: Sb, v2: h }, `一个圆柱的底面积是 ${Sb} 平方厘米，高 ${h} 厘米，体积是多少立方厘米？`), opts(ans, () => rnd(5, 65) * rnd(2, 21)), "基础",
        G("gen.cylinder.ue9", { v1: Sb, v2: h, v3: ans }, `V=Sh=${Sb}×${h}=${ans}（立方厘米）。`), G("gen.cylinder.upt9", null, "底面积求体积"), null);
    }
    if (type === 10) {
      const Sb = rnd(5, 40), h = rnd(2, 20), V = Sb * h;
      return Q(G("gen.cylinder.uq10", { v1: V, v2: Sb }, `一个圆柱的体积是 ${V} 立方分米，底面积是 ${Sb} 平方分米，它的高是多少分米？`), opts(h, () => rnd(2, 30)), "提升",
        G("gen.cylinder.ue10", { v1: V, v2: Sb, v3: h }, `h=V÷S=${V}÷${Sb}=${h}（分米）。`), G("gen.cylinder.upt10", null, "求圆柱高"), null);
    }
    const Sb = rnd(4, 40), h = rnd(2, 18), V = Sb * h, ans = 3 * h;
    return Q(G("gen.cylinder.uq11", { v1: V, v2: Sb }, `一个圆锥的体积是 ${V} 立方厘米，底面积是 ${Sb} 平方厘米，它的高是多少厘米？`), opts(ans, () => rnd(2, 60)), "拔高",
      G("gen.cylinder.ue11", { v1: V, v2: Sb, v3: 3 * V, v4: Sb, v5: ans }, `圆锥 V=1/3Sh，所以 h=3V÷S=3×${V}÷${Sb}=${3 * V}÷${Sb}=${ans}（厘米）。`), G("gen.cylinder.upt11", null, "求圆锥高"), null);
  }

  /* ============ 14. equation 列方程解应用题（六年级） ============ */
  function qEquation() {
    const type = rnd(0, 11);
    if (type === 0) {
      const k = rnd(2, 6), x = rnd(5, 60), S = x * (k + 1), askB = rnd(0, 1), ans = askB ? k * x : x;
      return Q(G("gen.equation.uq0", { v1: S, v2: k, v3: askB ? "甲" : "乙" }, `甲、乙两数的和是 ${S}，甲是乙的 ${k} 倍。${askB ? "甲" : "乙"}是多少？`), opts(ans, () => rnd(2, S - 1)), "基础",
        G("gen.equation.ue0", { v1: k, v2: k, v3: S, v4: k + 1, v5: S, v6: x, v7: k * x, v8: askB ? "甲" : "乙", v9: ans }, `设乙为 x，则甲为 ${k}x，${k}x+x=${S}，${k + 1}x=${S}，x=${x}；甲=${k * x}。所以${askB ? "甲" : "乙"}是 ${ans}。`), G("gen.equation.upt0", null, "和倍问题"), null);
    }
    if (type === 1) {
      const k = rnd(2, 6), x = rnd(5, 50), D = x * (k - 1), askB = rnd(0, 1), ans = askB ? k * x : x;
      return Q(G("gen.equation.uq1", { v1: D, v2: k, v3: askB ? "甲" : "乙" }, `甲比乙多 ${D}，甲是乙的 ${k} 倍。${askB ? "甲" : "乙"}是多少？`), opts(ans, () => rnd(2, 120)), "提升",
        G("gen.equation.ue1", { v1: k, v2: k, v3: D, v4: k - 1, v5: D, v6: x, v7: k * x, v8: askB ? "甲" : "乙", v9: ans }, `设乙为 x，则甲为 ${k}x，${k}x−x=${D}，${k - 1}x=${D}，x=${x}；甲=${k * x}。所以${askB ? "甲" : "乙"}是 ${ans}。`), G("gen.equation.upt1", null, "差倍问题"), null);
    }
    if (type === 2) {
      const k = rnd(2, 4), b = rnd(6, 14), x = rnd(2, 12), a = k * (b + x) - x;
      return Q(G("gen.equation.uq2", { v1: a, v2: b, v3: k }, `今年爸爸 ${a} 岁，儿子 ${b} 岁。几年后爸爸的年龄是儿子的 ${k} 倍？`), opts(x, () => rnd(1, 30)), "拔高",
        G("gen.equation.ue2", { v1: a, v2: k, v3: b, v4: a, v5: k * b, v6: k, v7: k - 1, v8: a - k * b, v9: x }, `设 x 年后，${a}+x=${k}(${b}+x)，${a}+x=${k * b}+${k}x，${k - 1}x=${a - k * b}，x=${x}（年）。`), G("gen.equation.upt2", null, "年龄问题"), null);
    }
    if (type === 3) {
      const a = rnd(2, 12), x = rnd(3, 40), b = rnd(3, 60), c = a * x + b;
      return Q(G("gen.equation.uq3", { v1: a, v2: b, v3: c }, `一个数的 ${a} 倍加上 ${b} 等于 ${c}，这个数是多少？`), opts(x, () => rnd(2, 60)), "基础",
        G("gen.equation.ue3", { v1: a, v2: b, v3: c, v4: a, v5: c - b, v6: (c - b), v7: a, v8: x }, `设这个数为 x：${a}x+${b}=${c}，${a}x=${c - b}，x=${(c - b)}÷${a}=${x}。`), G("gen.equation.upt3", null, "数字问题"), null);
    }
    if (type === 4) {
      const p = rnd(4, 20), a = rnd(2, 8), m = rnd(1, 3 * a), diff = rnd(1, 4), b = a + diff, n = p * diff - m;
      if (n >= 1) {
        return Q(G("gen.equation.uq4", { v1: a, v2: m, v3: b, v4: n }, `把一些糖分给同学：每人 ${a} 块多 ${m} 块，每人 ${b} 块少 ${n} 块。一共有多少个同学？`), opts(p, () => rnd(2, 30)), "拔高",
          G("gen.equation.ue4", { v1: m, v2: n, v3: m + n, v4: b, v5: a, v6: diff, v7: m + n, v8: diff, v9: p }, `两次分配相差 ${m}+${n}=${m + n}（块），每人相差 ${b}−${a}=${diff}（块），人数=${m + n}÷${diff}=${p}（人）。`), G("gen.equation.upt4", null, "盈亏问题"), null);
      }
      const S2 = p * a + m;
      return Q(G("gen.equation.uq5", { v1: p, v2: a, v3: m }, `把一些糖分给 ${p} 个同学，每人 ${a} 块还多 ${m} 块。一共有多少块糖？`), opts(S2, () => rnd(10, 200)), "基础",
        G("gen.equation.ue5", { v1: a, v2: p, v3: m, v4: S2 }, `总数=每人块数×人数+多余=${a}×${p}+${m}=${S2}（块）。`), G("gen.equation.upt5", null, "盈亏问题"), null);
    }
    if (type === 5) {
      const v1 = rnd(30, 70), v2 = rnd(30, 70), t = rnd(2, 8), S = (v1 + v2) * t;
      return Q(G("gen.equation.uq6", { v1: S, v2: v1, v3: v2 }, `两地相距 ${S} 千米，甲车每小时 ${v1} 千米，乙车每小时 ${v2} 千米，两车相对开出，几小时相遇？（列方程解）`), opts(t, () => rnd(1, 14)), "提升",
        G("gen.equation.ue6", { v1: v1, v2: v2, v3: S, v4: v1 + v2, v5: S, v6: t }, `设 x 小时相遇：(${v1}+${v2})x=${S}，${v1 + v2}x=${S}，x=${t}（小时）。`), G("gen.equation.upt6", null, "行程列方程"), null);
    }
    if (type === 6) {
      const a = rnd(3, 40), b = rnd(2, 9), q = rnd(2, 20), c = q * b, x = q + a;
      return Q(G("gen.equation.uq7", { v1: a, v2: b, v3: c }, `一个数减去 ${a} 后，再乘 ${b}，结果是 ${c}。这个数是多少？`), opts(x, () => rnd(3, 70)), "提升",
        G("gen.equation.ue7", { v1: a, v2: b, v3: c, v4: a, v5: c, v6: b, v7: q, v8: q, v9: a, v10: x }, `设这个数为 x：(x−${a})×${b}=${c}，x−${a}=${c}÷${b}=${q}，x=${q}+${a}=${x}。`), G("gen.equation.upt7", null, "逆推列方程"), null);
    }
    if (type === 7) {
      const y = rnd(10, 80), D = rnd(2, 40) * 2, x = y + D, S = x + y;
      return Q(G("gen.equation.uq8", { v1: S, v2: D }, `甲、乙两人共有 ${S} 元，甲比乙多 ${D} 元。甲有多少元？`), opts(x, () => rnd(5, S - 1)), "提升",
        G("gen.equation.ue8", { v1: D, v2: D, v3: S, v4: S - D, v5: y, v6: y, v7: D, v8: x }, `设乙为 x 元，甲为 x+${D}：x+x+${D}=${S}，2x=${S - D}，x=${y}，甲=${y}+${D}=${x}（元）。`), G("gen.equation.upt8", null, "和差问题"), null);
    }
    if (type === 8) {
      const H = rnd(10, 30), R = rnd(2, H - 2), C = H - R, F = 2 * C + 4 * R, askR = rnd(0, 1), ans = askR ? R : C;
      return Q(G("gen.equation.uq9", { v1: H, v2: F, v3: askR ? "兔" : "鸡" }, `笼子里有鸡和兔共 ${H} 只，共有 ${F} 条腿。${askR ? "兔" : "鸡"}有多少只？（列方程解）`), opts(ans, () => rnd(1, H - 1)), "提升",
        G("gen.equation.ue9", { v1: H, v2: H, v3: F, v4: F - 2 * H, v5: R, v6: H, v7: R, v8: C, v9: ans }, `设兔 x 只，鸡 (${H}−x) 只：4x+2(${H}−x)=${F}，2x=${F - 2 * H}，x=${R}（兔），鸡=${H}−${R}=${C}。答案是 ${ans}。`), G("gen.equation.upt9", null, "鸡兔同笼"), null);
    }
    if (type === 9) {
      const cf = pick([[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12], [5, 20, 4], [6, 30, 5], [8, 24, 6], [9, 18, 6], [15, 30, 10], [14, 35, 10], [21, 28, 12]]);
      return Q(G("gen.equation.uq10", { v1: cf[0], v2: cf[1] }, `一项工程，甲队单独做 ${cf[0]} 天完成，乙队单独做 ${cf[1]} 天完成。两队合做多少天完成？`), opts(cf[2], () => rnd(1, 20)), "拔高",
        G("gen.equation.ue10", { v1: cf[0], v2: cf[1], v3: cf[0], v4: cf[1], v5: r3(1 / cf[0] + 1 / cf[1]), v6: cf[2] }, `设合做 x 天：x(1/${cf[0]}+1/${cf[1]})=1，1/${cf[0]}+1/${cf[1]}=${r3(1 / cf[0] + 1 / cf[1])}，x=${cf[2]}（天）。`), G("gen.equation.upt10", null, "工程列方程"), null);
    }
    if (type === 10) {
      const mid = rnd(3, 60), S = 3 * mid, ask = rnd(0, 2), ans = mid - 1 + ask;
      const names = ["最小", "中间", "最大"];
      return Q(G("gen.equation.uq11", { v1: S, v2: names[ask] }, `三个连续自然数的和是 ${S}，其中${names[ask]}的一个数是多少？`), opts(ans, () => rnd(2, 70)), "提升",
        G("gen.equation.ue11", { v1: S, v2: S, v3: mid, v4: mid - 1, v5: mid, v6: mid + 1, v7: names[ask], v8: ans }, `设中间数为 x：(x−1)+x+(x+1)=${S}，3x=${S}，x=${mid}，三个数是 ${mid - 1}、${mid}、${mid + 1}，${names[ask]}的是 ${ans}。`), G("gen.equation.upt11", null, "连续数问题"), null);
    }
    const x = rnd(4, 80) * 5, d = pick([5, 6, 8]), P = x * d / 10;
    return Q(G("gen.equation.uq12", { v1: d, v2: P }, `一件衣服打 ${d} 折后卖 ${P} 元，原价是多少元？（列方程解）`), opts(x, () => rnd(4, 90) * 5), "提升",
      G("gen.equation.ue12", { v1: d / 10, v2: P, v3: P, v4: d / 10, v5: x }, `设原价 x 元：${d / 10}x=${P}，x=${P}÷${d / 10}=${x}（元）。`), G("gen.equation.upt12", null, "打折列方程"), null);
  }

  /* ============ 15. speedcalc 速算与巧算（三年级） ============ */
  function qSpeedCalc() {
    const type = rnd(0, 11);
    if (type === 0) {
      const k = rnd(1, 4), a = rnd(2, 9) * 100 - k, b = rnd(20, 99), ans = a + b;
      return Q(G("gen.speedcalc.uq0", { v1: a, v2: b }, `用简便方法计算：${a} + ${b} = ?`), opts(ans, () => ans + pick([-k, k, 10, -10, 1, -1, 2])), "基础",
        G("gen.speedcalc.ue0", { v1: a, v2: a + k, v3: k, v4: a + k, v5: b, v6: k, v7: a + k + b, v8: k, v9: ans }, `把 ${a} 看成 ${a + k} 先加，再减去多加的 ${k}：${a + k}+${b}−${k}=${a + k + b}−${k}=${ans}。`), G("gen.speedcalc.upt0", null, "凑整法"), null);
    }
    if (type === 1) {
      const a = rnd(11, 99), b = rnd(11, 89), c = 100 - b, ans = a + 100;
      return Q(G("gen.speedcalc.uq1", { v1: a, v2: b, v3: c }, `用简便方法计算：${a} + ${b} + ${c} = ?`), opts(ans, () => ans + rnd(-9, 9)), "基础",
        G("gen.speedcalc.ue1", { v1: b, v2: c, v3: a, v4: ans }, `先算能凑整的：${b}+${c}=100，再 ${a}+100=${ans}。这是加法交换律和结合律。`), G("gen.speedcalc.upt1", null, "交换结合"), null);
    }
    if (type === 2) {
      const a = rnd(11, 89), b = 100 - a, c = rnd(3, 25), ans = 100 * c;
      return Q(G("gen.speedcalc.uq2", { v1: a, v2: c, v3: b, v4: c }, `用简便方法计算：${a} × ${c} + ${b} × ${c} = ?`), opts(ans, () => 100 * rnd(3, 30)), "提升",
        G("gen.speedcalc.ue2", { v1: c, v2: a, v3: b, v4: c, v5: c, v6: ans }, `提取公因数 ${c}：(${a}+${b})×${c}=100×${c}=${ans}。`), G("gen.speedcalc.upt2", null, "提公因数"), null);
    }
    if (type === 3) {
      const a = rnd(3, 25), k = rnd(1, 9), ans = a * (100 + k);
      return Q(G("gen.speedcalc.uq3", { v1: a, v2: 100 + k }, `用简便方法计算：${a} × ${100 + k} = ?`), opts(ans, () => a * (100 + rnd(1, 9))), "提升",
        G("gen.speedcalc.ue3", { v1: a, v2: 100 + k, v3: a, v4: a, v5: k, v6: a * 100, v7: a * k, v8: ans }, `${a}×${100 + k}=${a}×100+${a}×${k}=${a * 100}+${a * k}=${ans}（乘法分配律）。`), G("gen.speedcalc.upt3", null, "乘法分配律"), null);
    }
    if (type === 4) {
      const n = rnd(10, 100), ans = n * (n + 1) / 2;
      return Q(G("gen.speedcalc.uq4", { v1: n }, `计算：1 + 2 + 3 + … + ${n} = ?`), opts(ans, () => n * (n + 1) / 2 + rnd(-30, 30)), "提升",
        G("gen.speedcalc.ue4", { v1: n, v2: n, v3: (1 + n) * n, v4: ans }, `高斯求和：(首+末)×项数÷2=(1+${n})×${n}÷2=${(1 + n) * n}÷2=${ans}。`), G("gen.speedcalc.upt4", null, "等差求和"), null);
    }
    if (type === 5) {
      const base = rnd(20, 95), ds = [rnd(-3, 3), rnd(-3, 3), rnd(-3, 3), rnd(-3, 3), rnd(-3, 3)];
      const nums = ds.map(d => base + d), sd = ds.reduce((x, y) => x + y, 0), ans = 5 * base + sd;
      return Q(G("gen.speedcalc.uq5", { v1: nums.join(" + ") }, `用基准数法计算：${nums.join(" + ")} = ?`), opts(ans, () => ans + rnd(-12, 12)), "提升",
        G("gen.speedcalc.ue5", { v1: base, v2: base, v3: 5 * base, v4: sd, v5: 5 * base, v6: sd >= 0 ? "+" : "−", v7: Math.abs(sd), v8: ans }, `以 ${base} 为基准：${base}×5=${5 * base}，各数与基准的差之和是 ${sd}，所以和=${5 * base}${sd >= 0 ? "+" : "−"}${Math.abs(sd)}=${ans}。`), G("gen.speedcalc.upt5", null, "基准数法"), null);
    }
    if (type === 6) {
      const b = rnd(21, 89), c = 100 - b, a = rnd(200, 900), ans = a - 100;
      return Q(G("gen.speedcalc.uq6", { v1: a, v2: b, v3: c }, `用简便方法计算：${a} − ${b} − ${c} = ?`), opts(ans, () => ans + rnd(-9, 9)), "提升",
        G("gen.speedcalc.ue6", { v1: b, v2: c, v3: a, v4: ans }, `连减可以减去两个数的和：${b}+${c}=100，${a}−100=${ans}。`), G("gen.speedcalc.upt6", null, "减法性质"), null);
    }
    if (type === 7) {
      const a = pick([2, 3, 4, 7, 8, 9]), n = rnd(5, 40);
      let u = 1; for (let i = 0; i < n; i++) u = (u * a) % 10;
      return Q(G("gen.speedcalc.uq7", { v1: a, v2: a, v3: a, v4: n, v5: a, v6: a, v7: a, v8: n, v9: a }, `${a} 个 ${a} 连乘…… 即 ${a} 的 ${n} 次方（${a}×${a}×…×${a}，共 ${n} 个 ${a}）的个位数字是几？`), opts(u, () => rnd(0, 9)), "拔高",
        G("gen.speedcalc.ue7", { v1: a, v2: n, v3: u }, `${a} 的乘方个位有周期性，逐次取个位可得周期；${n} 次方时个位是 ${u}。`), G("gen.speedcalc.upt7", null, "个位规律"), null);
    }
    if (type === 8) {
      const N = rnd(11, 89), ans = N * 11;
      return Q(G("gen.speedcalc.uq8", { v1: N }, `用简便方法计算：${N} × 11 = ?`), opts(ans, () => N * 11 + pick([10, -10, 100, -100, 1, -1])), "提升",
        G("gen.speedcalc.ue8", { v1: N, v2: N, v3: N, v4: N * 10, v5: N, v6: ans }, `${N}×11=${N}×10+${N}=${N * 10}+${N}=${ans}（“两头一拉，中间相加”）。`), G("gen.speedcalc.upt8", null, "乘11速算"), null);
    }
    if (type === 9) {
      const a = rnd(3, 50) * 4, ans = a * 25;
      return Q(G("gen.speedcalc.uq9", { v1: a }, `用简便方法计算：${a} × 25 = ?`), opts(ans, () => a * 25 + pick([100, -100, 25, -25, 10])), "提升",
        G("gen.speedcalc.ue9", { v1: a, v2: a / 4, v3: a, v4: a / 4, v5: ans }, `25×4=100，${a}÷4=${a / 4}，所以 ${a}×25=${a / 4}×100=${ans}。`), G("gen.speedcalc.upt9", null, "乘25速算"), null);
    }
    if (type === 10) {
      const t = rnd(1, 9), b = rnd(1, 9), c = 10 - b, N1 = 10 * t + b, N2 = 10 * t + c, ans = t * (t + 1) * 100 + b * c;
      return Q(G("gen.speedcalc.uq10", { v1: N1, v2: N2 }, `用简便方法计算：${N1} × ${N2} = ?`), opts(ans, () => ans + pick([100, -100, 10, -10, 1])), "拔高",
        G("gen.speedcalc.ue10", { v1: t, v2: t + 1, v3: b, v4: c, v5: t * (t + 1) * 100, v6: b * c, v7: ans }, `十位相同、个位和为 10：积=十位×(十位+1)×100+个位之积=${t}×${t + 1}×100+${b}×${c}=${t * (t + 1) * 100}+${b * c}=${ans}。`), G("gen.speedcalc.upt10", null, "头同尾合十"), null);
    }
    const n = rnd(5, 30), ans = n * n;
    return Q(G("gen.speedcalc.uq11", { v1: 2 * n - 1 }, `计算：1 + 3 + 5 + … + ${2 * n - 1} = ?`), opts(ans, () => n * n + rnd(-20, 20)), "提升",
      G("gen.speedcalc.ue11", { v1: n, v2: n, v3: n, v4: ans }, `从 1 开始的连续奇数和等于个数的平方：共 ${n} 个数，和=${n}×${n}=${ans}。`), G("gen.speedcalc.upt11", null, "奇数和"), null);
  }

  /* ============ 16. arithseq 等差数列求和（三年级） ============ */
  function qArithSeq() {
    const type = rnd(0, 11);
    if (type === 0) {
      const a1 = rnd(1, 30), d = rnd(2, 9), n = rnd(5, 30), ans = a1 + (n - 1) * d;
      return Q(G("gen.arithseq.uq0", { v1: a1, v2: d, v3: n }, `一个等差数列首项是 ${a1}，公差是 ${d}，第 ${n} 项是多少？`), opts(ans, () => ans + rnd(-2, 2) * d), "基础",
        G("gen.arithseq.ue0", { v1: a1, v2: n, v3: d, v4: a1, v5: (n - 1) * d, v6: ans }, `末项=首项+(项数−1)×公差=${a1}+(${n}−1)×${d}=${a1}+${(n - 1) * d}=${ans}。`), G("gen.arithseq.upt0", null, "求第n项"), null);
    }
    if (type === 1) {
      const a1 = rnd(1, 20), d = rnd(2, 9), n = rnd(5, 30), an = a1 + (n - 1) * d;
      return Q(G("gen.arithseq.uq1", { v1: a1, v2: a1 + d, v3: a1 + 2 * d, v4: an }, `等差数列 ${a1}, ${a1 + d}, ${a1 + 2 * d}, …, ${an}，一共有多少项？`), opts(n, () => n + rnd(-4, 4)), "提升",
        G("gen.arithseq.ue1", { v1: an, v2: a1, v3: d, v4: an - a1, v5: d, v6: n }, `项数=(末项−首项)÷公差+1=(${an}−${a1})÷${d}+1=${an - a1}÷${d}+1=${n}（项）。`), G("gen.arithseq.upt1", null, "求项数"), null);
    }
    if (type === 2) {
      const a1 = rnd(1, 20), d = rnd(2, 8), n = rnd(5, 25), an = a1 + (n - 1) * d, ans = (a1 + an) * n / 2;
      return Q(G("gen.arithseq.uq2", { v1: a1, v2: a1 + d, v3: a1 + 2 * d, v4: an, v5: n }, `求和：${a1} + ${a1 + d} + ${a1 + 2 * d} + … + ${an}（共 ${n} 项）= ?`), opts(ans, () => ans + rnd(-40, 40)), "提升",
        G("gen.arithseq.ue2", { v1: a1, v2: an, v3: n, v4: a1 + an, v5: n, v6: ans }, `和=(首项+末项)×项数÷2=(${a1}+${an})×${n}÷2=${a1 + an}×${n}÷2=${ans}。`), G("gen.arithseq.upt2", null, "等差求和"), null);
    }
    if (type === 3) {
      const a1 = rnd(1, 20), d = rnd(2, 12), n = rnd(4, 20), an = a1 + (n - 1) * d;
      return Q(G("gen.arithseq.uq3", { v1: n, v2: a1, v3: an }, `一个等差数列共 ${n} 项，首项是 ${a1}，末项是 ${an}，公差是多少？`), opts(d, () => rnd(1, 15)), "提升",
        G("gen.arithseq.ue3", { v1: an, v2: a1, v3: n - 1, v4: an - a1, v5: n - 1, v6: d }, `公差=(末项−首项)÷(项数−1)=(${an}−${a1})÷${n - 1}=${an - a1}÷${n - 1}=${d}。`), G("gen.arithseq.upt3", null, "求公差"), null);
    }
    if (type === 4) {
      const n = rnd(2, 10) * 2 + 1, mid = rnd(10, 60), S = n * mid;
      return Q(G("gen.arithseq.uq4", { v1: n, v2: S }, `一个等差数列有 ${n} 项（项数是奇数），所有项的和是 ${S}，中间那一项是多少？`), opts(mid, () => rnd(5, 80)), "拔高",
        G("gen.arithseq.ue4", { v1: S, v2: n, v3: mid }, `项数是奇数时，和=中间项×项数，所以中间项=${S}÷${n}=${mid}。`), G("gen.arithseq.upt4", null, "中项定理"), null);
    }
    if (type === 5) {
      const n = rnd(6, 40), ans = n * n;
      return Q(G("gen.arithseq.uq5", { v1: 2 * n - 1 }, `1 + 3 + 5 + 7 + … + ${2 * n - 1} 的和是多少？`), opts(ans, () => n * n + rnd(-25, 25)), "提升",
        G("gen.arithseq.ue5", { v1: 2 * n - 1, v2: n, v3: n, v4: ans }, `共有 (${2 * n - 1}+1)÷2=${n} 个数，连续奇数和=项数的平方=${n}²=${ans}。`), G("gen.arithseq.upt5", null, "奇数列求和"), null);
    }
    if (type === 6) {
      const d = rnd(2, 9), n = rnd(5, 25), a1 = rnd(1, 30), an = a1 + (n - 1) * d;
      return Q(G("gen.arithseq.uq6", { v1: d, v2: n, v3: an }, `一个等差数列公差是 ${d}，第 ${n} 项是 ${an}，首项是多少？`), opts(a1, () => rnd(1, 40)), "提升",
        G("gen.arithseq.ue6", { v1: an, v2: n - 1, v3: d, v4: an, v5: (n - 1) * d, v6: a1 }, `首项=末项−(项数−1)×公差=${an}−${n - 1}×${d}=${an}−${(n - 1) * d}=${a1}。`), G("gen.arithseq.upt6", null, "求首项"), null);
    }
    if (type === 7) {
      const a1 = rnd(15, 40), d = rnd(1, 4), n = rnd(6, 25), ans = a1 + (n - 1) * d;
      return Q(G("gen.arithseq.uq7", { v1: a1, v2: d, v3: n }, `剧院第一排有 ${a1} 个座位，后面每排都比前一排多 ${d} 个座位。第 ${n} 排有多少个座位？`), opts(ans, () => ans + rnd(-6, 6)), "提升",
        G("gen.arithseq.ue7", { v1: n, v2: a1, v3: n, v4: d, v5: a1, v6: (n - 1) * d, v7: ans }, `第 ${n} 排=${a1}+(${n}−1)×${d}=${a1}+${(n - 1) * d}=${ans}（个）。`), G("gen.arithseq.upt7", null, "座位问题"), null);
    }
    if (type === 8) {
      const a1 = rnd(12, 30), d = rnd(1, 3), n = rnd(6, 20), an = a1 + (n - 1) * d, ans = (a1 + an) * n / 2;
      return Q(G("gen.arithseq.uq8", { v1: n, v2: a1, v3: d }, `电影院共 ${n} 排，第一排 ${a1} 个座位，每排比前一排多 ${d} 个。这个电影院一共有多少个座位？`), opts(ans, () => ans + rnd(-50, 50)), "拔高",
        G("gen.arithseq.ue8", { v1: a1, v2: n - 1, v3: d, v4: an, v5: a1, v6: an, v7: n, v8: ans }, `末排=${a1}+${n - 1}×${d}=${an}（个），总数=(${a1}+${an})×${n}÷2=${ans}（个）。`), G("gen.arithseq.upt8", null, "总座位数"), null);
    }
    if (type === 9) {
      const n = rnd(5, 35), ans = n * (n + 1);
      return Q(G("gen.arithseq.uq9", { v1: 2 * n }, `2 + 4 + 6 + 8 + … + ${2 * n} 的和是多少？`), opts(ans, () => n * (n + 1) + rnd(-30, 30)), "提升",
        G("gen.arithseq.ue9", { v1: n, v2: 2 * n, v3: n, v4: 2 + 2 * n, v5: n, v6: ans }, `共 ${n} 个数，和=(2+${2 * n})×${n}÷2=${2 + 2 * n}×${n}÷2=${ans}。`), G("gen.arithseq.upt9", null, "偶数列求和"), null);
    }
    if (type === 10) {
      const a1 = rnd(2, 25), d = rnd(3, 11), k = rnd(6, 30), ans = a1 + (k - 1) * d;
      return Q(G("gen.arithseq.uq10", { v1: a1, v2: a1 + d, v3: a1 + 2 * d, v4: a1 + 3 * d, v5: k }, `数列 ${a1}, ${a1 + d}, ${a1 + 2 * d}, ${a1 + 3 * d}, … 的第 ${k} 项是多少？`), opts(ans, () => ans + rnd(-3, 3) * d), "基础",
        G("gen.arithseq.ue10", { v1: d, v2: k, v3: a1, v4: k, v5: d, v6: ans }, `公差是 ${d}，第 ${k} 项=${a1}+(${k}−1)×${d}=${ans}。`), G("gen.arithseq.upt10", null, "通项"), null);
    }
    const d = pick([2, 3, 4, 5, 6]), a = rnd(1, 20), n = rnd(8, 30), b = a + (n - 1) * d;
    return Q(G("gen.arithseq.uq11", { v1: a, v2: b, v3: d, v4: a, v5: b }, `从 ${a} 到 ${b}，每隔 ${d} 取一个数（包括 ${a} 和 ${b}），一共能取多少个数？`), opts(n, () => n + rnd(-5, 5)), "提升",
      G("gen.arithseq.ue11", { v1: b, v2: a, v3: d, v4: b - a, v5: d, v6: n }, `个数=(${b}−${a})÷${d}+1=${b - a}÷${d}+1=${n}（个）。`), G("gen.arithseq.upt11", null, "求项数"), null);
  }

  /* ============ 17. parity 奇偶分析（四年级） ============ */
  function qParity() {
    const type = rnd(0, 11);
    const P = ["奇数", "偶数"];
    const pool = a => [a === "奇数" ? "偶数" : "奇数", "既可能是奇数也可能是偶数", "无法判断"];
    if (type === 0) {
      const N = rnd(20, 500), ans = Math.ceil(N / 2);
      return Q(G("gen.parity.uq0", { v1: N }, `在 1 ~ ${N} 这些自然数中，奇数一共有多少个？`), opts(ans, () => ans + rnd(-5, 5)), "基础",
        G("gen.parity.ue0", { v1: N, v2: N % 2 === 0 ? `${N}÷2=${ans}` : `(${N}+1)÷2=${ans}` }, `1~${N} 中奇数是 1,3,5,…，共 ${N % 2 === 0 ? `${N}÷2=${ans}` : `(${N}+1)÷2=${ans}`} 个。`), G("gen.parity.upt0", null, "数奇数"), null);
    }
    if (type === 1) {
      const N = rnd(20, 500), ans = Math.floor(N / 2);
      return Q(G("gen.parity.uq1", { v1: N }, `在 1 ~ ${N} 这些自然数中，偶数一共有多少个？`), opts(ans, () => ans + rnd(-5, 5)), "基础",
        G("gen.parity.ue1", { v1: N, v2: N, v3: ans }, `偶数是 2,4,6,…，最大不超过 ${N}，共 ${N}÷2 取整=${ans} 个。`), G("gen.parity.upt1", null, "数偶数"), null);
    }
    if (type === 2) {
      const a = rnd(10, 999), b = rnd(10, 999), ans = (a + b) % 2 === 0 ? P[1] : P[0];
      return Q(G("gen.parity.uq2", { v1: a, v2: b }, `${a} + ${b} 的和是奇数还是偶数？`), cats(ans, pool(ans)), "基础",
        G("gen.parity.ue2", { v1: a, v2: a % 2 ? "奇" : "偶", v3: b, v4: b % 2 ? "奇" : "偶", v5: a % 2 === b % 2 ? "同奇同偶相加得偶数" : "一奇一偶相加得奇数", v6: a, v7: b, v8: a + b, v9: ans }, `${a} 是${a % 2 ? "奇" : "偶"}数，${b} 是${b % 2 ? "奇" : "偶"}数；${a % 2 === b % 2 ? "同奇同偶相加得偶数" : "一奇一偶相加得奇数"}，${a}+${b}=${a + b} 是${ans}。`), G("gen.parity.upt2", null, "加法奇偶"), null);
    }
    if (type === 3) {
      const a = rnd(2, 99), b = rnd(2, 99), ans = (a * b) % 2 === 0 ? P[1] : P[0];
      return Q(G("gen.parity.uq3", { v1: a, v2: b }, `${a} × ${b} 的积是奇数还是偶数？`), cats(ans, pool(ans)), "基础",
        G("gen.parity.ue3", { v1: a, v2: b, v3: a * b, v4: ans }, `只要有一个因数是偶数，积就是偶数；只有两个都是奇数时积才是奇数。${a}×${b}=${a * b}，是${ans}。`), G("gen.parity.upt3", null, "乘法奇偶"), null);
    }
    if (type === 4) {
      const a = rnd(3, 60), n = rnd(3, 9), S = n * a + n * (n - 1) / 2, ans = S % 2 === 0 ? P[1] : P[0];
      return Q(G("gen.parity.uq4", { v1: a, v2: n, v3: a, v4: a + 1, v5: a + n - 1 }, `从 ${a} 开始的 ${n} 个连续自然数（${a}, ${a + 1}, …, ${a + n - 1}）的和是奇数还是偶数？`), cats(ans, pool(ans)), "提升",
        G("gen.parity.ue4", { v1: n, v2: a, v3: a + n - 1, v4: n, v5: S, v6: ans }, `这 ${n} 个数的和=(${a}+${a + n - 1})×${n}÷2=${S}，是${ans}。`), G("gen.parity.upt4", null, "连续数奇偶"), null);
    }
    if (type === 5) {
      const N = rnd(10, 60), od = Math.ceil(N / 2), ev = Math.floor(N / 2), ans = od * ev;
      return Q(G("gen.parity.uq5", { v1: N }, `从 1 ~ ${N} 中任取两个数，要使它们的和是奇数，一共有多少种不同的取法？`), opts(ans, () => ans + rnd(-20, 20)), "拔高",
        G("gen.parity.ue5", { v1: od, v2: ev, v3: od, v4: ev, v5: ans }, `和是奇数必须一奇一偶：奇数 ${od} 个，偶数 ${ev} 个，取法 ${od}×${ev}=${ans}（种）。`), G("gen.parity.upt5", null, "奇偶配对"), null);
    }
    if (type === 6) {
      const k = rnd(2, 12), tot = k + rnd(1, 8), ans = k % 2 === 0 ? P[1] : P[0];
      return Q(G("gen.parity.uq6", { v1: tot, v2: k, v3: tot }, `有 ${tot} 个数，其中有 ${k} 个奇数，其余都是偶数。这 ${tot} 个数的和是奇数还是偶数？`), cats(ans, pool(ans)), "提升",
        G("gen.parity.ue6", { v1: k, v2: k % 2 === 0 ? "个数是偶数个，和为偶数" : "个数是奇数个，和为奇数", v3: ans }, `偶数不影响和的奇偶；${k} 个奇数相加，${k % 2 === 0 ? "个数是偶数个，和为偶数" : "个数是奇数个，和为奇数"}，所以总和是${ans}。`), G("gen.parity.upt6", null, "奇数个数定奇偶"), null);
    }
    if (type === 7) {
      const d = pick([28, 29, 30, 31]), ans = Math.ceil(d / 2), m = d === 28 || d === 29 ? "二月" : pick(["四月", "六月", "一月", "三月"]);
      return Q(G("gen.parity.uq7", { v1: m, v2: d }, `某年${m}有 ${d} 天，这个月中日期是奇数的一共有多少天？`), opts(ans, () => rnd(12, 18)), "提升",
        G("gen.parity.ue7", { v1: d % 2 === 0 ? `${d}÷2=${ans}` : `(${d}+1)÷2=${ans}` }, `1、3、5…是奇数日，共 ${d % 2 === 0 ? `${d}÷2=${ans}` : `(${d}+1)÷2=${ans}`} 天。`), G("gen.parity.upt7", null, "日期奇偶"), null);
    }
    if (type === 8) {
      const N = rnd(5, 60), S = N * (N + 1) / 2, ans = S % 2 === 0 ? P[1] : P[0];
      return Q(G("gen.parity.uq8", { v1: N }, `1 + 2 + 3 + … + ${N} 的和是奇数还是偶数？`), cats(ans, pool(ans)), "提升",
        G("gen.parity.ue8", { v1: N, v2: N + 1, v3: S, v4: S, v5: ans }, `和=${N}×${N + 1}÷2=${S}，${S} 是${ans}。`), G("gen.parity.upt8", null, "求和奇偶"), null);
    }
    if (type === 9) {
      const a = rnd(10, 400), ans = P[0];
      return Q(G("gen.parity.uq9", { v1: a, v2: a + 1 }, `两个连续自然数 ${a} 和 ${a + 1} 的和是奇数还是偶数？`), cats(ans, pool(ans)), "基础",
        G("gen.parity.ue9", { v1: a, v2: a + 1, v3: 2 * a + 1 }, `连续两个自然数一定是一奇一偶，和 ${a}+${a + 1}=${2 * a + 1} 一定是奇数。`), G("gen.parity.upt9", null, "连续数"), null);
    }
    if (type === 10) {
      const a = rnd(100, 999), b = rnd(10, 99), ans = (a - b) % 2 === 0 ? P[1] : P[0];
      return Q(G("gen.parity.uq10", { v1: a, v2: b }, `${a} − ${b} 的差是奇数还是偶数？`), cats(ans, pool(ans)), "基础",
        G("gen.parity.ue10", { v1: a, v2: a % 2 ? "奇" : "偶", v3: b, v4: b % 2 ? "奇" : "偶", v5: a, v6: b, v7: a - b, v8: ans }, `${a} 是${a % 2 ? "奇" : "偶"}数，${b} 是${b % 2 ? "奇" : "偶"}数，差 ${a}−${b}=${a - b}，是${ans}。`), G("gen.parity.upt10", null, "减法奇偶"), null);
    }
    const N = rnd(11, 401), ans = Math.ceil(N / 2) - Math.floor(N / 2);
    return Q(G("gen.parity.uq11", { v1: N }, `在 1 ~ ${N} 中，奇数的个数比偶数的个数多多少个？`), opts(ans, () => rnd(0, 6)), "提升",
      G("gen.parity.ue11", { v1: Math.ceil(N / 2), v2: Math.floor(N / 2), v3: ans }, `奇数 ${Math.ceil(N / 2)} 个，偶数 ${Math.floor(N / 2)} 个，相差 ${ans} 个。`), G("gen.parity.upt11", null, "奇偶个数"), null);
  }

  /* ============ 18. divisibility 整除特征（四年级） ============ */
  function qDivisibility() {
    const type = rnd(0, 11);
    if (type === 0) {
      const N = rnd(100, 999), ans = Math.floor(N / 100) + Math.floor(N / 10) % 10 + N % 10;
      return Q(G("gen.divisibility.uq0", { v1: N }, `${N} 的各个数位上的数字之和是多少？`), opts(ans, () => rnd(1, 27)), "基础",
        G("gen.divisibility.ue0", { v1: Math.floor(N / 100), v2: Math.floor(N / 10) % 10, v3: N % 10, v4: ans }, `${Math.floor(N / 100)}+${Math.floor(N / 10) % 10}+${N % 10}=${ans}。判断能否被 3 或 9 整除，就看这个数字和。`), G("gen.divisibility.upt0", null, "数字和"), null);
    }
    if (type === 1) {
      const k = pick([2, 3, 5, 9, 4, 6]);
      const ans = k * rnd(12, 90);
      const mk = () => { let x = 0; do { x = rnd(100, 999); } while (x % k === 0); return x; };
      return Q(G("gen.divisibility.uq1", { v1: k }, `下面哪个数能被 ${k} 整除？`), opts(ans, mk), "提升",
        G("gen.divisibility.ue1", { v1: ans, v2: k, v3: ans / k, v4: k === 2 ? "被 2 整除看个位是否为偶数" : k === 5 ? "被 5 整除看个位是 0 或 5" : k === 3 || k === 9 ? `被 ${k} 整除看各位数字和是否是 ${k} 的倍数` : k === 4 ? "被 4 整除看末两位是否是 4 的倍数" : "被 6 整除要同时被 2 和 3 整除" }, `${ans}÷${k}=${ans / k}，能整除；${k === 2 ? "被 2 整除看个位是否为偶数" : k === 5 ? "被 5 整除看个位是 0 或 5" : k === 3 || k === 9 ? `被 ${k} 整除看各位数字和是否是 ${k} 的倍数` : k === 4 ? "被 4 整除看末两位是否是 4 的倍数" : "被 6 整除要同时被 2 和 3 整除"}。`), G("gen.divisibility.upt1", null, "整除判断"), null);
    }
    if (type === 2) {
      const N = rnd(1000, 9999), ans = N % 100;
      return Q(G("gen.divisibility.uq2", { v1: N }, `判断一个数能否被 4 整除，只要看它的末两位。四位数 ${N} 的末两位组成的数是多少？`), opts(ans, () => rnd(0, 99)), "提升",
        G("gen.divisibility.ue2", { v1: N, v2: ans, v3: ans % 4 === 0 ? `${ans}÷4=${ans / 4}，所以 ${N} 能被 4 整除` : `${ans} 不是 4 的倍数，所以 ${N} 不能被 4 整除` }, `${N} 的末两位是 ${ans}；${ans % 4 === 0 ? `${ans}÷4=${ans / 4}，所以 ${N} 能被 4 整除` : `${ans} 不是 4 的倍数，所以 ${N} 不能被 4 整除`}。`), G("gen.divisibility.upt2", null, "末两位特征"), null);
    }
    if (type === 3) {
      const a = rnd(1, 9), c = rnd(0, 9);
      let ans = -1; for (let x = 0; x <= 9; x++) if ((a + x + c) % 3 === 0) { ans = x; break; }
      return Q(G("gen.divisibility.uq3", { v1: a, v2: c }, `在 ${a}□${c} 的 □ 里填一个数字，使这个三位数能被 3 整除，□ 里最小填几？`), opts(ans, () => rnd(0, 9)), "提升",
        G("gen.divisibility.ue3", { v1: a, v2: c, v3: a + c, v4: ans, v5: a + c + ans }, `数字和=${a}+□+${c}=${a + c}+□，要是 3 的倍数；□ 最小取 ${ans}（此时和为 ${a + c + ans}）。`), G("gen.divisibility.upt3", null, "能被3整除"), null);
    }
    if (type === 4) {
      const a = rnd(1, 9), c = rnd(0, 9);
      let ans = -1; for (let x = 0; x <= 9; x++) if ((a + x + c) % 9 === 0) { ans = x; break; }
      if (ans < 0) ans = 0;
      return Q(G("gen.divisibility.uq4", { v1: a, v2: c }, `在 ${a}□${c} 的 □ 里填一个数字，使这个三位数能被 9 整除，□ 里填几？`), opts(ans, () => rnd(0, 9)), "拔高",
        G("gen.divisibility.ue4", { v1: a + c, v2: ans, v3: a + c + ans }, `数字和=${a + c}+□ 必须是 9 的倍数，所以 □=${ans}（和为 ${a + c + ans}）。`), G("gen.divisibility.upt4", null, "能被9整除"), null);
    }
    if (type === 5) {
      const N = rnd(1000, 9999), ans = String(N).split("").reduce((s, x) => s + Number(x), 0);
      return Q(G("gen.divisibility.uq5", { v1: N }, `四位数 ${N} 的各位数字之和是多少？`), opts(ans, () => rnd(1, 36)), "基础",
        G("gen.divisibility.ue5", { v1: String(N).split("").join("+"), v2: ans }, `${String(N).split("").join("+")}=${ans}。`), G("gen.divisibility.upt5", null, "数字和"), null);
    }
    if (type === 6) {
      const N = rnd(100, 980), ans = Math.ceil((N + 1) / 10) * 10;
      return Q(G("gen.divisibility.uq6", { v1: N }, `比 ${N} 大的、既能被 2 整除又能被 5 整除的最小整数是多少？`), opts(ans, () => Math.ceil((N + 1) / 10) * 10 + pick([10, -10, 5, -5, 2])), "提升",
        G("gen.divisibility.ue6", { v1: N, v2: ans }, `同时能被 2 和 5 整除，就是能被 10 整除，个位必须是 0；比 ${N} 大的最小的整十数是 ${ans}。`), G("gen.divisibility.upt6", null, "末位特征"), null);
    }
    if (type === 7) {
      const k = pick([3, 4, 6, 7, 8, 9, 11]), N = rnd(100, 999), ans = N % k;
      return Q(G("gen.divisibility.uq7", { v1: N, v2: k }, `${N} 除以 ${k} 的余数是多少？`), opts(ans, () => rnd(0, k)), "基础",
        G("gen.divisibility.ue7", { v1: N, v2: k, v3: Math.floor(N / k), v4: ans, v5: k, v6: Math.floor(N / k), v7: k * Math.floor(N / k), v8: N, v9: k * Math.floor(N / k), v10: ans }, `${N}÷${k}=${Math.floor(N / k)}……${ans}（因为 ${k}×${Math.floor(N / k)}=${k * Math.floor(N / k)}，${N}−${k * Math.floor(N / k)}=${ans}）。`), G("gen.divisibility.upt7", null, "求余数"), null);
    }
    if (type === 8) {
      const k = pick([3, 4, 5, 6, 7, 8, 9]), N = rnd(50, 600), ans = Math.floor(N / k);
      return Q(G("gen.divisibility.uq8", { v1: N, v2: k }, `在 1 ~ ${N} 中，能被 ${k} 整除的数一共有多少个？`), opts(ans, () => ans + rnd(-6, 6)), "提升",
        G("gen.divisibility.ue8", { v1: k, v2: ans, v3: k * ans, v4: N, v5: k, v6: ans }, `最大的倍数是 ${k}×${ans}=${k * ans}，所以共有 ${N}÷${k} 取整=${ans} 个。`), G("gen.divisibility.upt8", null, "倍数个数"), null);
    }
    if (type === 9) {
      const k = pick([3, 4, 6, 7, 8, 9]), N = rnd(100, 999), r = N % k, ans = r === 0 ? 0 : k - r;
      return Q(G("gen.divisibility.uq9", { v1: N, v2: k }, `${N} 至少加上多少才能被 ${k} 整除？`), opts(ans, () => rnd(0, k)), "提升",
        G("gen.divisibility.ue9", { v1: N, v2: k, v3: r, v4: r === 0 ? 0 : `${k}−${r}=${ans}`, v5: k, v6: ans }, `${N}÷${k} 余 ${r}，还差 ${r === 0 ? 0 : `${k}−${r}=${ans}`} 就满一个 ${k}，所以至少加 ${ans}。`), G("gen.divisibility.upt9", null, "补足整除"), null);
    }
    if (type === 10) {
      const k = pick([3, 4, 6, 7, 8, 9]), N = rnd(100, 999), ans = N % k;
      return Q(G("gen.divisibility.uq10", { v1: N, v2: k }, `${N} 至少减去多少才能被 ${k} 整除？`), opts(ans, () => rnd(0, k)), "提升",
        G("gen.divisibility.ue10", { v1: N, v2: k, v3: Math.floor(N / k), v4: ans, v5: ans, v6: N - ans, v7: k, v8: Math.floor(N / k) }, `${N}÷${k}=${Math.floor(N / k)}……${ans}，减去余数 ${ans} 后是 ${N - ans}=${k}×${Math.floor(N / k)}，正好整除。`), G("gen.divisibility.upt10", null, "去余整除"), null);
    }
    const a = rnd(2, 12), b = rnd(2, 15), ans = lcm(a, b);
    return Q(G("gen.divisibility.uq11", { v1: a, v2: b }, `一个数既是 ${a} 的倍数，又是 ${b} 的倍数，这个数最小是多少？（不为 0）`), opts(ans, () => a * b + rnd(-6, 6)), "提升",
      G("gen.divisibility.ue11", { v1: a, v2: b, v3: a, v4: b, v5: ans }, `就是求 ${a} 和 ${b} 的最小公倍数：[${a},${b}]=${ans}。`), G("gen.divisibility.upt11", null, "最小公倍数"), null);
  }

  /* ============ 19. remainder 余数与周期（四年级） ============ */
  function qRemainder() {
    const type = rnd(0, 11);
    const COLORS = ["红", "黄", "蓝", "绿", "紫", "橙"];
    const WEEK = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const col = i => G("gen.remainder.x" + i, null, COLORS[i]);
    const wk = i => G("gen.remainder.x" + (6 + i), null, WEEK[i]);
    if (type === 0) {
      const d = rnd(3, 12), q = rnd(5, 40), r = rnd(1, d - 1), N = d * q + r;
      return Q(G("gen.remainder.uq0", { v1: N, v2: d }, `${N} ÷ ${d} 的余数是多少？`), opts(r, () => rnd(0, d)), "基础",
        G("gen.remainder.ue0", { v1: d, v2: q, v3: d * q, v4: N, v5: d * q, v6: r, v7: r, v8: d, v9: r }, `${d}×${q}=${d * q}，${N}−${d * q}=${r}，且 ${r}<${d}，所以余数是 ${r}。`), G("gen.remainder.upt0", null, "带余除法"), null);
    }
    if (type === 1) {
      const L = rnd(3, 5), cyc = COLORS.slice(0, L), n = rnd(20, 300), idx = (n - 1) % L, ans = col(idx);
      const seqText = Array.from({ length: L }, (_, i) => col(i)).join(G("gen.listSep", null, "、"));
      const tailNote = n % L === 0
        ? G("gen.remainder.x13", { v1: col(L - 1) }, `余 0 说明是一个周期的最后一个，即${cyc[L - 1]}`)
        : G("gen.remainder.x14", { v1: n % L, v2: col(n % L - 1) }, `余 ${n % L} 说明是第 ${n % L} 个，即${cyc[n % L - 1]}`);
      return Q(G("gen.remainder.uq1", { v1: seqText, v2: n }, `一串彩珠按“${cyc.join("、")}”的顺序不断重复排列，第 ${n} 颗珠子是什么颜色？`), cats(ans, shuffle([0, 1, 2, 3, 4, 5].filter(i => i !== idx)).slice(0, 3).map(col)), "提升",
        G("gen.remainder.ue1", { v1: L, v2: n, v3: L, v4: Math.floor(n / L), v5: n % L, v6: tailNote }, `周期是 ${L}：${n}÷${L}=${Math.floor(n / L)}……${n % L}，${tailNote}。`), G("gen.remainder.upt1", null, "周期问题"), null);
    }
    if (type === 2) {
      const w = rnd(0, 6), n = rnd(10, 200), ai = (w + n) % 7, ans = wk(ai);
      return Q(G("gen.remainder.uq2", { v1: wk(w), v2: n }, `今天是${WEEK[w]}，再过 ${n} 天是星期几？`), cats(ans, shuffle([0, 1, 2, 3, 4, 5, 6].filter(i => i !== ai)).slice(0, 3).map(wk)), "提升",
        G("gen.remainder.ue2", { v1: n, v2: Math.floor(n / 7), v3: n % 7, v4: wk(w), v5: n % 7, v6: ans }, `一周 7 天一个周期：${n}÷7=${Math.floor(n / 7)}……${n % 7}，从${WEEK[w]}往后数 ${n % 7} 天，是${ans}。`), G("gen.remainder.upt2", null, "日期周期"), null);
    }
    if (type === 3) {
      const a = pick([2, 3, 7, 8, 4, 9]), n = rnd(6, 50);
      let u = 1; for (let i = 0; i < n; i++) u = (u * a) % 10;
      return Q(G("gen.remainder.uq3", { v1: n, v2: a, v3: a, v4: n }, `${n} 个 ${a} 相乘（即 ${a} 的 ${n} 次方），积的个位数字是几？`), opts(u, () => rnd(0, 9)), "拔高",
        G("gen.remainder.ue3", { v1: a, v2: n, v3: u }, `个位数字按周期循环，${a} 的乘方个位周期最长 4 位；${n} 次方时个位是 ${u}。`), G("gen.remainder.upt3", null, "个位周期"), null);
    }
    if (type === 4) {
      const k = pick([7, 9, 11, 13, 6]), a = rnd(2, 9), n = rnd(3, 12);
      let m = 1; for (let i = 0; i < n; i++) m = (m * a) % k;
      return Q(G("gen.remainder.uq4", { v1: a, v2: n, v3: k }, `${a} 的 ${n} 次方除以 ${k}，余数是多少？`), opts(m, () => rnd(0, k - 1)), "拔高",
        G("gen.remainder.ue4", { v1: a, v2: k, v3: n, v4: m }, `边乘边取余：每乘一次 ${a} 就对 ${k} 取一次余数，${n} 次后余数是 ${m}。`), G("gen.remainder.upt4", null, "同余取余"), null);
    }
    if (type === 5) {
      const pairs = [[5, 3], [4, 3], [5, 4], [7, 3], [5, 7], [3, 7], [8, 3], [9, 4]];
      const pr = pick(pairs), m1 = pr[0], m2 = pr[1], r1v = rnd(1, m1 - 1), r2v = rnd(1, m2 - 1);
      let ans = -1; for (let x = 1; x <= m1 * m2; x++) if (x % m1 === r1v && x % m2 === r2v) { ans = x; break; }
      if (ans < 0) ans = r1v;
      return Q(G("gen.remainder.uq5", { v1: m1, v2: r1v, v3: m2, v4: r2v }, `一个数除以 ${m1} 余 ${r1v}，除以 ${m2} 余 ${r2v}。这个数最小是多少？`), opts(ans, () => rnd(1, m1 * m2)), "拔高",
        G("gen.remainder.ue5", { v1: ans, v2: m1, v3: Math.floor(ans / m1), v4: r1v, v5: ans, v6: m2, v7: Math.floor(ans / m2), v8: r2v, v9: ans }, `从小到大逐个检验：${ans}÷${m1}=${Math.floor(ans / m1)}……${r1v}，${ans}÷${m2}=${Math.floor(ans / m2)}……${r2v}，都符合，所以最小是 ${ans}。`), G("gen.remainder.upt5", null, "同余问题"), null);
    }
    if (type === 6) {
      const k = rnd(4, 12), r = rnd(1, k - 1), M = rnd(30, 300);
      let ans = M + 1; while (ans % k !== r) ans++;
      return Q(G("gen.remainder.uq6", { v1: M, v2: k, v3: r }, `比 ${M} 大的整数中，除以 ${k} 余 ${r} 的最小的数是多少？`), opts(ans, () => ans + rnd(-k, k)), "提升",
        G("gen.remainder.ue6", { v1: ans, v2: k, v3: Math.floor(ans / k), v4: r, v5: ans, v6: M }, `${ans}÷${k}=${Math.floor(ans / k)}……${r}，且 ${ans}>${M}，再小的就不满足了。`), G("gen.remainder.upt6", null, "余数应用"), null);
    }
    if (type === 7) {
      const L = rnd(3, 5), digs = []; for (let i = 0; i < L; i++) digs.push(rnd(1, 9));
      const n = rnd(15, 60), cs = digs.reduce((a, b) => a + b, 0);
      const full = Math.floor(n / L), rest = n % L;
      let ans = full * cs; for (let i = 0; i < rest; i++) ans += digs[i];
      return Q(G("gen.remainder.uq7", { v1: digs.join(", "), v2: digs.join(", "), v3: L, v4: n }, `数列 ${digs.join(", ")}, ${digs.join(", ")}, … 按这 ${L} 个数不断重复。前 ${n} 项的和是多少？`), opts(ans, () => ans + rnd(-15, 15)), "拔高",
        G("gen.remainder.ue7", { v1: cs, v2: n, v3: L, v4: full, v5: rest, v6: n, v7: cs, v8: full, v9: rest ? `+${digs.slice(0, rest).join("+")}` : "", v10: ans }, `一个周期的和是 ${cs}，${n}÷${L}=${full}……${rest}，前 ${n} 项和=${cs}×${full}${rest ? `+${digs.slice(0, rest).join("+")}` : ""}=${ans}。`), G("gen.remainder.upt7", null, "周期求和"), null);
    }
    if (type === 8) {
      const k = rnd(4, 12), r = rnd(1, k - 1);
      let ans = 10; while (ans % k !== r) ans++;
      return Q(G("gen.remainder.uq8", { v1: k, v2: r }, `除以 ${k} 余 ${r} 的最小两位数是多少？`), opts(ans, () => ans + rnd(-k, k)), "提升",
        G("gen.remainder.ue8", { v1: ans, v2: k, v3: Math.floor(ans / k), v4: r, v5: ans }, `从 10 开始找：${ans}÷${k}=${Math.floor(ans / k)}……${r}，所以最小两位数是 ${ans}。`), G("gen.remainder.upt8", null, "最小两位数"), null);
    }
    if (type === 9) {
      const d = rnd(4, 15), q = rnd(5, 30), r = rnd(1, d - 1), ans = d * q + r;
      return Q(G("gen.remainder.uq9", { v1: d, v2: q, v3: r }, `一个数除以 ${d}，商是 ${q}，余数是 ${r}，这个数是多少？`), opts(ans, () => ans + rnd(-d, d)), "基础",
        G("gen.remainder.ue9", { v1: d, v2: q, v3: r, v4: d * q, v5: r, v6: ans }, `被除数=除数×商+余数=${d}×${q}+${r}=${d * q}+${r}=${ans}。`), G("gen.remainder.upt9", null, "还原被除数"), null);
    }
    if (type === 10) {
      const k = pick([7, 9, 11, 13, 6, 8]), a = rnd(20, 99), b = rnd(20, 99), ans = (a * b) % k;
      return Q(G("gen.remainder.uq10", { v1: a, v2: b, v3: k }, `${a} × ${b} 的积除以 ${k}，余数是多少？`), opts(ans, () => rnd(0, k - 1)), "拔高",
        G("gen.remainder.ue10", { v1: a, v2: b, v3: a * b, v4: a * b, v5: k, v6: Math.floor(a * b / k), v7: ans, v8: a % k, v9: b % k, v10: (a % k) * (b % k), v11: k, v12: ans }, `${a}×${b}=${a * b}，${a * b}÷${k}=${Math.floor(a * b / k)}……${ans}。也可以先分别取余再相乘取余：${a % k}×${b % k}=${(a % k) * (b % k)}，再对 ${k} 取余得 ${ans}。`), G("gen.remainder.upt10", null, "积的余数"), null);
    }
    const b = pick([7, 11, 13, 3, 9, 6]), a = rnd(1, b - 1), n = rnd(2, 12);
    let rem = a % b, dig = 0;
    for (let i = 0; i < n; i++) { dig = Math.floor(rem * 10 / b); rem = (rem * 10) % b; }
    return Q(G("gen.remainder.uq11", { v1: a, v2: b, v3: n }, `把 ${a} ÷ ${b} 化成小数，小数点后第 ${n} 位数字是几？`), opts(dig, () => rnd(0, 9)), "拔高",
      G("gen.remainder.ue11", { v1: a, v2: b, v3: r3(a / b), v4: n, v5: dig }, `${a}÷${b}=${r3(a / b)}…，是循环小数；按竖式一位一位除下去，第 ${n} 位是 ${dig}。`), G("gen.remainder.upt11", null, "循环小数"), null);
  }

  /* ============ 20. prime 质数与合数（四年级） ============ */
  function qPrime() {
    const type = rnd(0, 11);
    const PR = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    if (type === 0) {
      const ans = pick(PR.filter(p => p > 10));
      const mk = () => { let x = 0; do { x = rnd(10, 99); } while (isPrime(x)); return x; };
      return Q(G("gen.prime.uq0", null, `下面哪个数是质数？`), opts(ans, mk), "基础",
        G("gen.prime.ue0", { v1: ans }, `${ans} 除了 1 和它本身以外没有别的因数，所以是质数；其余各数都能分解成两个比 1 大的数相乘，是合数。`), G("gen.prime.upt0", null, "质数判断"), null);
    }
    if (type === 1) {
      const p = pick([2, 3, 5, 7]), q = pick(PR.slice(0, 12)), N = p * q * pick([1, 2, 3]);
      let ans = 2; for (let i = 2; i <= N; i++) if (N % i === 0 && isPrime(i)) { ans = i; break; }
      return Q(G("gen.prime.uq1", { v1: N }, `${N} 的最小质因数是多少？`), opts(ans, () => pick(PR.slice(0, 10))), "提升",
        G("gen.prime.ue1", { v1: N, v2: ans, v3: N / ans, v4: ans }, `从最小的质数开始试除：${N}÷${ans}=${N / ans}，所以最小质因数是 ${ans}。`), G("gen.prime.upt1", null, "最小质因数"), null);
    }
    if (type === 2) {
      const q = pick(PR.slice(3, 15)), N = q * pick([2, 3, 4, 6, 8, 9]);
      let ans = 2; for (let i = 2; i <= N; i++) if (N % i === 0 && isPrime(i)) ans = i;
      return Q(G("gen.prime.uq2", { v1: N }, `${N} 的最大质因数是多少？`), opts(ans, () => pick(PR.slice(0, 14))), "提升",
        G("gen.prime.ue2", { v1: N, v2: ans, v3: N, v4: ans, v5: N / ans }, `把 ${N} 分解质因数后，最大的那个质因数是 ${ans}（${N}÷${ans}=${N / ans}）。`), G("gen.prime.upt2", null, "最大质因数"), null);
    }
    if (type === 3) {
      const ps = shuffle([2, 3, 5, 7, 11, 13]).slice(0, rnd(2, 3));
      const N = ps.reduce((a, b) => a * b, 1) * pick([1, 2, 3]);
      const fac = []; const set = new Set(); let m = N;
      for (let i = 2; i <= m; i++) while (m % i === 0) { fac.push(i); set.add(i); m /= i; }
      const ans = set.size;
      return Q(G("gen.prime.uq3", { v1: N }, `把 ${N} 分解质因数，它一共有多少个不同的质因数？`), opts(ans, () => rnd(1, 5)), "提升",
        G("gen.prime.ue3", { v1: N, v2: fac.join("×"), v3: [...set].join("、"), v4: ans }, `${N}=${fac.join("×")}，不同的质因数是 ${[...set].join("、")}，共 ${ans} 个。`), G("gen.prime.upt3", null, "分解质因数"), null);
    }
    if (type === 4) {
      const N = rnd(20, 100), ans = PR.filter(p => p <= N).length;
      return Q(G("gen.prime.uq4", { v1: N }, `在 1 ~ ${N} 中，一共有多少个质数？`), opts(ans, () => ans + rnd(-4, 4)), "拔高",
        G("gen.prime.ue4", { v1: N, v2: PR.filter(p => p <= N).join("、"), v3: ans }, `${N} 以内的质数是 ${PR.filter(p => p <= N).join("、")}，共 ${ans} 个。`), G("gen.prime.upt4", null, "质数个数"), null);
    }
    if (type === 5) {
      const N = rnd(10, 90); let ans = N + 1; while (!isPrime(ans)) ans++;
      return Q(G("gen.prime.uq5", { v1: N }, `比 ${N} 大的最小质数是多少？`), opts(ans, () => rnd(N, N + 12)), "提升",
        G("gen.prime.ue5", { v1: N + 1, v2: ans }, `从 ${N + 1} 开始逐个检验，${ans} 只有 1 和它本身两个因数，是质数。`), G("gen.prime.upt5", null, "找质数"), null);
    }
    if (type === 6) {
      const N = rnd(15, 80), ans = PR.filter(p => p <= N && p % 2 === 1).length;
      return Q(G("gen.prime.uq6", { v1: N }, `在 1 ~ ${N} 中，既是奇数又是质数的数有多少个？`), opts(ans, () => ans + rnd(-3, 3)), "拔高",
        G("gen.prime.ue6", { v1: N, v2: PR.filter(p => p <= N).length, v3: ans }, `${N} 以内的质数中只有 2 是偶数，其余都是奇数，所以是 ${PR.filter(p => p <= N).length}−1=${ans} 个。`), G("gen.prime.upt6", null, "奇质数"), null);
    }
    if (type === 7) {
      const a = rnd(4, 40), b = rnd(4, 40), ans = gcd(a, b);
      const coprimeNote = ans === 1 ? G("gen.prime.x6", null, "，它们互质") : "";
      return Q(G("gen.prime.uq7", { v1: a, v2: b }, `${a} 和 ${b} 的最大公因数是多少？（如果是 1，说明它们互质）`), opts(ans, () => rnd(1, 12)), "提升",
        G("gen.prime.ue7", { v1: a, v2: b, v3: a, v4: b, v5: ans, v6: coprimeNote }, `${a} 与 ${b} 的公有质因数相乘得最大公因数：(${a},${b})=${ans}${coprimeNote}。`), G("gen.prime.upt7", null, "互质与公因数"), null);
    }
    if (type === 8) {
      const p = pick(PR.slice(0, 8)), q = pick(PR.slice(2, 14)), N = p * q;
      return Q(G("gen.prime.uq8", { v1: N, v2: p }, `两个质数相乘的积是 ${N}，其中一个质数是 ${p}，另一个质数是多少？`), opts(q, () => pick(PR)), "提升",
        G("gen.prime.ue8", { v1: N, v2: p, v3: q, v4: q, v5: q }, `${N}÷${p}=${q}，${q} 是质数，所以另一个质数是 ${q}。`), G("gen.prime.upt8", null, "质因数还原"), null);
    }
    if (type === 9) {
      const N = rnd(11, 99), isP = isPrime(N);
      const wPrime = G("gen.prime.x0", null, "质数"), wComposite = G("gen.prime.x1", null, "合数");
      const ans = isP ? wPrime : wComposite;
      const factorStr = (() => { for (let i = 2; i * i <= N; i++) if (N % i === 0) return `${i}×${N / i}`; return ""; })();
      return Q(G("gen.prime.uq9", { v1: N }, `${N} 是质数还是合数？`), cats(ans, [isP ? wComposite : wPrime, G("gen.prime.x2", null, "既不是质数也不是合数"), G("gen.prime.x3", null, "无法判断")]), "基础",
        isP ? G("gen.prime.x4", { v1: N, v2: N }, `${N} 只有 1 和 ${N} 两个因数，是质数。`) : G("gen.prime.x5", { v1: N, v2: factorStr }, `${N}=${factorStr}，除 1 和本身外还有别的因数，是合数。`), G("gen.prime.upt9", null, "质合判断"), null);
    }
    if (type === 10) {
      const N = pick([12, 16, 18, 20, 24, 28, 30, 36, 40, 45, 48, 50, 60, 72, 96, 100]), ans = divs(N).length;
      return Q(G("gen.prime.uq10", { v1: N }, `${N} 一共有多少个因数？`), opts(ans, () => rnd(2, 14)), "拔高",
        G("gen.prime.ue9", { v1: N, v2: divs(N).join("、"), v3: ans }, `${N} 的因数有 ${divs(N).join("、")}，共 ${ans} 个。`), G("gen.prime.upt10", null, "因数个数"), null);
    }
    const N = rnd(12, 100); let ans = N - 1; while (!isPrime(ans)) ans--;
    return Q(G("gen.prime.uq11", { v1: N }, `小于 ${N} 的最大质数是多少？`), opts(ans, () => rnd(Math.max(2, N - 12), N - 1)), "提升",
      G("gen.prime.ue10", { v1: N - 1, v2: ans, v3: N, v4: ans }, `从 ${N - 1} 往下找，${ans} 是质数，所以小于 ${N} 的最大质数是 ${ans}。`), G("gen.prime.upt11", null, "找质数"), null);
  }

  /* ============ 21. boat 流水行船（六年级） ============ */
  function qBoat() {
    const type = rnd(0, 11);
    if (type === 0) {
      const v = rnd(10, 40), w = rnd(2, 8), ans = v + w;
      return Q(G("gen.boat.uq0", { v1: v, v2: w }, `一条船在静水中的速度是每小时 ${v} 千米，水流速度是每小时 ${w} 千米。顺水航行的速度是每小时多少千米？`), opts(ans, () => rnd(10, 50)), "基础",
        G("gen.boat.ue0", { v1: v, v2: w, v3: ans }, `顺水速度=船速+水速=${v}+${w}=${ans}（千米/时）。`), G("gen.boat.upt0", null, "顺水速度"), null);
    }
    if (type === 1) {
      const v = rnd(12, 40), w = rnd(2, 8), ans = v - w;
      return Q(G("gen.boat.uq1", { v1: v, v2: w }, `船在静水中每小时行 ${v} 千米，水速每小时 ${w} 千米。逆水航行的速度是每小时多少千米？`), opts(ans, () => rnd(5, 45)), "基础",
        G("gen.boat.ue1", { v1: v, v2: w, v3: ans }, `逆水速度=船速−水速=${v}−${w}=${ans}（千米/时）。`), G("gen.boat.upt1", null, "逆水速度"), null);
    }
    if (type === 2) {
      const v = rnd(12, 35), w = rnd(2, 8), t = rnd(2, 9), ans = (v + w) * t;
      return Q(G("gen.boat.uq2", { v1: v, v2: w, v3: t }, `船速每小时 ${v} 千米，水速每小时 ${w} 千米，顺水航行 ${t} 小时，行了多少千米？`), opts(ans, () => (v + w) * rnd(2, 11)), "基础",
        G("gen.boat.ue2", { v1: v, v2: w, v3: v + w, v4: v + w, v5: t, v6: ans }, `顺水速度=${v}+${w}=${v + w}（千米/时），路程=${v + w}×${t}=${ans}（千米）。`), G("gen.boat.upt2", null, "顺水路程"), null);
    }
    if (type === 3) {
      const w = rnd(2, 8), v = w + rnd(8, 30), t = rnd(2, 9), s = (v - w) * t;
      return Q(G("gen.boat.uq3", { v1: v, v2: w, v3: s }, `船速每小时 ${v} 千米，水速每小时 ${w} 千米，逆水行 ${s} 千米需要多少小时？`), opts(t, () => rnd(2, 14)), "提升",
        G("gen.boat.ue3", { v1: v, v2: w, v3: v - w, v4: s, v5: v - w, v6: t }, `逆水速度=${v}−${w}=${v - w}（千米/时），时间=${s}÷${v - w}=${t}（小时）。`), G("gen.boat.upt3", null, "逆水时间"), null);
    }
    if (type === 4) {
      const v = rnd(10, 40), w = rnd(2, 9), a = v + w;
      return Q(G("gen.boat.uq4", { v1: a, v2: w }, `一条船顺水速度是每小时 ${a} 千米，水流速度是每小时 ${w} 千米。这条船在静水中的速度是每小时多少千米？`), opts(v, () => rnd(8, 45)), "提升",
        G("gen.boat.ue4", { v1: a, v2: w, v3: v }, `船速=顺水速度−水速=${a}−${w}=${v}（千米/时）。`), G("gen.boat.upt4", null, "求船速"), null);
    }
    if (type === 5) {
      const v = rnd(12, 40), w = rnd(2, 8), a = v + w, b = v - w;
      return Q(G("gen.boat.uq5", { v1: a, v2: b }, `一条船顺水每小时行 ${a} 千米，逆水每小时行 ${b} 千米。这条船在静水中的速度是每小时多少千米？`), opts(v, () => rnd(8, 45)), "提升",
        G("gen.boat.ue5", { v1: a, v2: b, v3: a + b, v4: v }, `船速=(顺水+逆水)÷2=(${a}+${b})÷2=${a + b}÷2=${v}（千米/时）。`), G("gen.boat.upt5", null, "和差求船速"), null);
    }
    if (type === 6) {
      const v = rnd(12, 40), w = rnd(2, 9), a = v + w, b = v - w;
      return Q(G("gen.boat.uq6", { v1: a, v2: b }, `一条船顺水每小时行 ${a} 千米，逆水每小时行 ${b} 千米。水流速度是每小时多少千米？`), opts(w, () => rnd(1, 15)), "提升",
        G("gen.boat.ue6", { v1: a, v2: b, v3: a - b, v4: w }, `水速=(顺水−逆水)÷2=(${a}−${b})÷2=${a - b}÷2=${w}（千米/时）。`), G("gen.boat.upt6", null, "和差求水速"), null);
    }
    if (type === 7) {
      const w = rnd(2, 6), v = w + rnd(6, 20), up = v - w, dn = v + w, s = lcm(up, dn) * rnd(1, 3), ans = s / dn + s / up;
      return Q(G("gen.boat.uq7", { v1: v, v2: w, v3: s }, `一条船在静水中每小时行 ${v} 千米，水速每小时 ${w} 千米。从甲港到乙港（相距 ${s} 千米）顺水去、逆水返回，往返共需多少小时？`), opts(ans, () => rnd(2, 40)), "拔高",
        G("gen.boat.ue7", { v1: dn, v2: s, v3: dn, v4: s / dn, v5: up, v6: s, v7: up, v8: s / up, v9: s / dn, v10: s / up, v11: ans }, `顺水 ${dn} 千米/时，用 ${s}÷${dn}=${s / dn}（小时）；逆水 ${up} 千米/时，用 ${s}÷${up}=${s / up}（小时）；共 ${s / dn}+${s / up}=${ans}（小时）。`), G("gen.boat.upt7", null, "往返时间"), null);
    }
    if (type === 8) {
      const v = rnd(12, 35), w = rnd(2, 8), t = rnd(2, 9), s = (v + w) * t;
      return Q(G("gen.boat.uq8", { v1: v, v2: w, v3: s }, `船速每小时 ${v} 千米，水速每小时 ${w} 千米，顺水行 ${s} 千米需要多少小时？`), opts(t, () => rnd(2, 14)), "基础",
        G("gen.boat.ue8", { v1: v, v2: w, v3: v + w, v4: s, v5: v + w, v6: t }, `顺水速度=${v}+${w}=${v + w}（千米/时），时间=${s}÷${v + w}=${t}（小时）。`), G("gen.boat.upt8", null, "顺水时间"), null);
    }
    if (type === 9) {
      const w = rnd(2, 8), v = w + rnd(8, 30), t = rnd(2, 9), ans = (v - w) * t;
      return Q(G("gen.boat.uq9", { v1: v, v2: w, v3: t }, `船在静水中每小时行 ${v} 千米，水速每小时 ${w} 千米，逆水行 ${t} 小时能行多少千米？`), opts(ans, () => (v - w) * rnd(2, 11)), "基础",
        G("gen.boat.ue9", { v1: v, v2: w, v3: v - w, v4: v - w, v5: t, v6: ans }, `逆水速度=${v}−${w}=${v - w}（千米/时），路程=${v - w}×${t}=${ans}（千米）。`), G("gen.boat.upt9", null, "逆水路程"), null);
    }
    if (type === 10) {
      const v1 = rnd(15, 40), v2 = rnd(15, 40), w = rnd(2, 8), t = rnd(2, 8), s = (v1 + v2) * t;
      return Q(G("gen.boat.uq10", { v1: v1, v2: v2, v3: w, v4: s }, `同一条河上，甲船静水速度每小时 ${v1} 千米，乙船静水速度每小时 ${v2} 千米，水速每小时 ${w} 千米。两船从相距 ${s} 千米的两地相对开出，几小时相遇？`), opts(t, () => rnd(2, 14)), "拔高",
        G("gen.boat.ue10", { v1: w, v2: w, v3: v1, v4: v2, v5: v1 + v2, v6: s, v7: v1 + v2, v8: t }, `一船顺水加 ${w}、另一船逆水减 ${w}，速度和仍是 ${v1}+${v2}=${v1 + v2}（千米/时），相遇时间=${s}÷${v1 + v2}=${t}（小时）。`), G("gen.boat.upt10", null, "水中相遇"), null);
    }
    const w = rnd(2, 9), t = rnd(3, 20), s = w * t;
    return Q(G("gen.boat.uq11", { v1: s, v2: w }, `一根木头从甲地漂到乙地，两地相距 ${s} 千米，水流速度是每小时 ${w} 千米。木头漂流需要多少小时？`), opts(t, () => rnd(2, 25)), "提升",
      G("gen.boat.ue11", { v1: s, v2: w, v3: t }, `漂流物只随水流走，速度就是水速：${s}÷${w}=${t}（小时）。`), G("gen.boat.upt11", null, "漂流时间"), null);
  }

  /* ============ 22. circle_track 环形跑道（六年级） ============ */
  function qTrack() {
    const type = rnd(0, 11);
    if (type === 0) {
      const v1 = rnd(3, 8), v2 = rnd(3, 8), t = rnd(20, 90), L = (v1 + v2) * t;
      return Q(G("gen.circle_track.uq0", { v1: L, v2: v1, v3: v2 }, `环形跑道一圈 ${L} 米，甲、乙两人从同一点同时反向出发，速度分别是每秒 ${v1} 米、${v2} 米。多少秒后两人第一次相遇？`), opts(t, () => rnd(15, 120)), "提升",
        G("gen.circle_track.ue0", { v1: v1, v2: v2, v3: v1 + v2, v4: L, v5: v1 + v2, v6: t }, `反向而行，两人合跑一圈就相遇：速度和=${v1}+${v2}=${v1 + v2}（米/秒），时间=${L}÷${v1 + v2}=${t}（秒）。`), G("gen.circle_track.upt0", null, "反向相遇"), null);
    }
    if (type === 1) {
      const v2 = rnd(3, 7), dv = rnd(1, 4), v1 = v2 + dv, t = rnd(20, 90), L = dv * t;
      return Q(G("gen.circle_track.uq1", { v1: L, v2: v1, v3: v2 }, `环形跑道一圈 ${L} 米，甲、乙从同一点同时同向出发，速度分别是每秒 ${v1} 米、${v2} 米。多少秒后甲第一次追上乙？`), opts(t, () => rnd(15, 130)), "提升",
        G("gen.circle_track.ue1", { v1: v1, v2: v2, v3: dv, v4: L, v5: dv, v6: t }, `同向追及，快的要比慢的多跑一圈：速度差=${v1}−${v2}=${dv}（米/秒），时间=${L}÷${dv}=${t}（秒）。`), G("gen.circle_track.upt1", null, "同向追及"), null);
    }
    if (type === 2) {
      const v = rnd(4, 9), t = rnd(20, 100), L = v * t;
      return Q(G("gen.circle_track.uq2", { v1: L, v2: v }, `一条环形跑道长 ${L} 米，小明每秒跑 ${v} 米，他跑一圈需要多少秒？`), opts(t, () => rnd(15, 130)), "基础",
        G("gen.circle_track.ue2", { v1: L, v2: v, v3: t }, `一圈时间=跑道长÷速度=${L}÷${v}=${t}（秒）。`), G("gen.circle_track.upt2", null, "每圈时间"), null);
    }
    if (type === 3) {
      const v1 = rnd(3, 8), v2 = rnd(3, 8), t = rnd(15, 60), L = (v1 + v2) * t, n = rnd(2, 6), ans = n * t;
      return Q(G("gen.circle_track.uq3", { v1: L, v2: v1, v3: v2, v4: n }, `环形跑道一圈 ${L} 米，两人从同一点反向出发，速度分别是每秒 ${v1} 米、${v2} 米。第 ${n} 次相遇是在出发后多少秒？`), opts(ans, () => rnd(20, 400)), "拔高",
        G("gen.circle_track.ue3", { v1: L, v2: v1 + v2, v3: t, v4: n, v5: t, v6: n, v7: ans }, `每合跑一圈相遇一次，第一次用 ${L}÷${v1 + v2}=${t}（秒），第 ${n} 次用 ${t}×${n}=${ans}（秒）。`), G("gen.circle_track.upt3", null, "多次相遇"), null);
    }
    if (type === 4) {
      const v2 = rnd(3, 7), dv = rnd(1, 4), v1 = v2 + dv, t = rnd(15, 60), L = dv * t, n = rnd(2, 5), ans = n * t;
      return Q(G("gen.circle_track.uq4", { v1: L, v2: v1, v3: v2, v4: n }, `环形跑道一圈 ${L} 米，两人从同一点同向出发，速度分别是每秒 ${v1} 米、${v2} 米。甲第 ${n} 次追上乙是在出发后多少秒？`), opts(ans, () => rnd(20, 400)), "拔高",
        G("gen.circle_track.ue4", { v1: L, v2: dv, v3: t, v4: n, v5: t, v6: n, v7: ans }, `每多跑一圈追上一次，第一次用 ${L}÷${dv}=${t}（秒），第 ${n} 次追上用 ${t}×${n}=${ans}（秒）。`), G("gen.circle_track.upt4", null, "多次追及"), null);
    }
    if (type === 5) {
      const v1 = rnd(3, 9), v2 = rnd(3, 9), ans = v1 + v2;
      return Q(G("gen.circle_track.uq5", { v1: v1, v2: v2 }, `甲每秒跑 ${v1} 米，乙每秒跑 ${v2} 米，两人在环形跑道上反向跑。两人接近的速度（速度和）是每秒多少米？`), opts(ans, () => rnd(4, 20)), "基础",
        G("gen.circle_track.ue5", { v1: v1, v2: v2, v3: ans }, `反向而行时按速度和计算：${v1}+${v2}=${ans}（米/秒）。`), G("gen.circle_track.upt5", null, "相对速度"), null);
    }
    if (type === 6) {
      const v2 = rnd(3, 8), dv = rnd(1, 5), v1 = v2 + dv;
      return Q(G("gen.circle_track.uq6", { v1: v1, v2: v2 }, `甲每秒跑 ${v1} 米，乙每秒跑 ${v2} 米，两人同向跑。甲每秒比乙多跑多少米？`), opts(dv, () => rnd(1, 10)), "基础",
        G("gen.circle_track.ue6", { v1: v1, v2: v2, v3: dv }, `同向而行时按速度差计算：${v1}−${v2}=${dv}（米/秒）。`), G("gen.circle_track.upt6", null, "速度差"), null);
    }
    if (type === 7) {
      const v2 = rnd(3, 7), dv = rnd(1, 4), v1 = v2 + dv, t = rnd(20, 80), L = dv * t, ans = v1 * t;
      return Q(G("gen.circle_track.uq7", { v1: L, v2: v1, v3: v2 }, `环形跑道一圈 ${L} 米，甲每秒 ${v1} 米、乙每秒 ${v2} 米同向出发，甲追上乙时甲一共跑了多少米？`), opts(ans, () => v1 * rnd(20, 100)), "拔高",
        G("gen.circle_track.ue7", { v1: L, v2: dv, v3: t, v4: v1, v5: t, v6: ans }, `追及时间=${L}÷${dv}=${t}（秒），甲跑 ${v1}×${t}=${ans}（米）。`), G("gen.circle_track.upt7", null, "追上路程"), null);
    }
    if (type === 8) {
      const v1 = rnd(3, 8), v2 = rnd(3, 8), t = rnd(20, 80), ans = (v1 + v2) * t;
      return Q(G("gen.circle_track.uq8", { v1: v1, v2: v2, v3: t }, `甲、乙在环形跑道上从同一点反向出发，速度分别是每秒 ${v1} 米、${v2} 米，${t} 秒后第一次相遇。跑道一圈有多少米？`), opts(ans, () => (v1 + v2) * rnd(20, 100)), "提升",
        G("gen.circle_track.ue8", { v1: v1, v2: v2, v3: t, v4: v1 + v2, v5: t, v6: ans }, `第一次相遇时两人合跑一圈：一圈=(${v1}+${v2})×${t}=${v1 + v2}×${t}=${ans}（米）。`), G("gen.circle_track.upt8", null, "求跑道长"), null);
    }
    if (type === 9) {
      const v2 = rnd(3, 7), dv = rnd(1, 5), v1 = v2 + dv, t = rnd(20, 80), ans = dv * t;
      return Q(G("gen.circle_track.uq9", { v1: v1, v2: v2, v3: t }, `甲、乙在环形跑道上同向出发，速度分别是每秒 ${v1} 米、${v2} 米，${t} 秒后甲第一次追上乙。跑道一圈有多少米？`), opts(ans, () => dv * rnd(20, 100)), "提升",
        G("gen.circle_track.ue9", { v1: v1, v2: v2, v3: t, v4: dv, v5: t, v6: ans }, `第一次追上时甲比乙多跑一圈：一圈=(${v1}−${v2})×${t}=${dv}×${t}=${ans}（米）。`), G("gen.circle_track.upt9", null, "求跑道长"), null);
    }
    if (type === 10) {
      const cf = pick([[2, 3, 6], [3, 6, 6], [4, 6, 12], [5, 10, 10], [6, 12, 12], [10, 15, 30], [12, 18, 36], [20, 30, 60], [25, 50, 50], [24, 36, 72], [30, 45, 90], [40, 60, 120]]);
      const L = rnd(2, 12) * 30;
      return Q(G("gen.circle_track.uq10", { v1: cf[0], v2: cf[1], v3: L }, `甲跑一圈用 ${cf[0]} 分钟，乙跑一圈用 ${cf[1]} 分钟（跑道一圈 ${L} 米）。两人从同一点同向出发，多少分钟后甲第一次追上乙？`), opts(cf[2], () => rnd(3, 150)), "拔高",
        G("gen.circle_track.ue10", { v1: L, v2: cf[0], v3: r3(L / cf[0]), v4: L, v5: cf[1], v6: r3(L / cf[1]), v7: L, v8: r3(L / cf[0]), v9: r3(L / cf[1]), v10: cf[2] }, `甲每分钟跑 ${L}÷${cf[0]}=${r3(L / cf[0])}（米），乙每分钟跑 ${L}÷${cf[1]}=${r3(L / cf[1])}（米）；追上需多跑一圈：${L}÷(${r3(L / cf[0])}−${r3(L / cf[1])})=${cf[2]}（分钟）。`), G("gen.circle_track.upt10", null, "圈时追及"), null);
    }
    const cf = pick([[3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12], [15, 30, 10], [40, 60, 24], [36, 45, 20], [50, 75, 30]]);
    const L = rnd(2, 12) * 60;
    return Q(G("gen.circle_track.uq11", { v1: cf[0], v2: cf[1], v3: L }, `甲跑一圈用 ${cf[0]} 分钟，乙跑一圈用 ${cf[1]} 分钟（一圈 ${L} 米）。两人从同一点同时反向出发，多少分钟后第一次相遇？`), opts(cf[2], () => rnd(2, 60)), "拔高",
      G("gen.circle_track.ue11", { v1: r3(L / cf[0]), v2: r3(L / cf[1]), v3: L, v4: r3(L / cf[0]), v5: r3(L / cf[1]), v6: cf[2] }, `甲每分钟 ${r3(L / cf[0])} 米，乙每分钟 ${r3(L / cf[1])} 米，合跑一圈相遇：${L}÷(${r3(L / cf[0])}+${r3(L / cf[1])})=${cf[2]}（分钟）。`), G("gen.circle_track.upt11", null, "圈时相遇"), null);
  }

  /* ============ 23. perim 巧求周长（五年级） ============ */
  function qPerim() {
    const type = rnd(0, 11);
    if (type === 0) {
      const a = rnd(5, 40), b = rnd(3, 39), ans = 2 * (a + b);
      return Q(G("gen.perim.uq0", { v1: a, v2: b }, `一个长方形长 ${a} 厘米，宽 ${b} 厘米，它的周长是多少厘米？`), opts(ans, () => 2 * (rnd(4, 45) + rnd(3, 40))), "基础",
        G("gen.perim.ue0", { v1: a, v2: b, v3: a + b, v4: ans }, `周长=(长+宽)×2=(${a}+${b})×2=${a + b}×2=${ans}（厘米）。`), G("gen.perim.upt0", null, "长方形周长"), null);
    }
    if (type === 1) {
      const a = rnd(3, 40), ans = 4 * a;
      return Q(G("gen.perim.uq1", { v1: a }, `一个正方形的边长是 ${a} 分米，它的周长是多少分米？`), opts(ans, () => 4 * rnd(3, 45)), "基础",
        G("gen.perim.ue1", { v1: a, v2: ans }, `周长=边长×4=${a}×4=${ans}（分米）。`), G("gen.perim.upt1", null, "正方形周长"), null);
    }
    if (type === 2) {
      const a = rnd(5, 40), b = rnd(3, 39), P = 2 * (a + b);
      return Q(G("gen.perim.uq2", { v1: P, v2: a }, `一个长方形的周长是 ${P} 厘米，长是 ${a} 厘米，宽是多少厘米？`), opts(b, () => rnd(2, 45)), "提升",
        G("gen.perim.ue2", { v1: P, v2: a + b, v3: a + b, v4: a, v5: b }, `长+宽=${P}÷2=${a + b}（厘米），宽=${a + b}−${a}=${b}（厘米）。`), G("gen.perim.upt2", null, "逆求边长"), null);
    }
    if (type === 3) {
      const a = rnd(8, 40), b = rnd(6, 30), ans = 2 * (a + b);
      return Q(G("gen.perim.uq3", { v1: a, v2: b }, `一个台阶形（阶梯形）图形，可以用平移的方法把它的边补成一个长 ${a} 厘米、宽 ${b} 厘米的长方形。这个台阶形的周长是多少厘米？`), opts(ans, () => 2 * (a + b) + rnd(1, 20)), "拔高",
        G("gen.perim.ue3", { v1: a, v2: b, v3: ans }, `用平移法把凹进去的边平移出去，周长与长方形相等：(${a}+${b})×2=${ans}（厘米）。`), G("gen.perim.upt3", null, "平移法"), null);
    }
    if (type === 4) {
      const a = rnd(3, 30), ans = 6 * a;
      return Q(G("gen.perim.uq4", { v1: a }, `把两个边长 ${a} 厘米的正方形拼成一个长方形，这个长方形的周长是多少厘米？`), opts(ans, () => 6 * rnd(3, 35)), "提升",
        G("gen.perim.ue4", { v1: 2 * a, v2: a, v3: 2 * a, v4: a, v5: ans, v6: 8 * a, v7: 2 * a }, `拼成的长方形长 ${2 * a} 厘米、宽 ${a} 厘米，周长=(${2 * a}+${a})×2=${ans}（厘米）；比两个正方形周长和 ${8 * a} 少了拼接的 2 条边 ${2 * a}。`), G("gen.perim.upt4", null, "拼接周长"), null);
    }
    if (type === 5) {
      const a = rnd(2, 15), n = rnd(3, 10), ans = 2 * a * (n + 1);
      return Q(G("gen.perim.uq5", { v1: n, v2: a }, `把 ${n} 个边长 ${a} 厘米的正方形排成一行拼成长方形，周长是多少厘米？`), opts(ans, () => 2 * a * (rnd(3, 12) + 1)), "拔高",
        G("gen.perim.ue5", { v1: a, v2: n, v3: a * n, v4: a, v5: a * n, v6: a, v7: ans }, `长=${a}×${n}=${a * n}（厘米），宽=${a} 厘米，周长=(${a * n}+${a})×2=${ans}（厘米）。`), G("gen.perim.upt5", null, "排列拼接"), null);
    }
    if (type === 6) {
      const a = rnd(10, 40), b = rnd(6, 30), ans = 2 * (a + b);
      return Q(G("gen.perim.uq6", { v1: a, v2: b }, `一个长 ${a} 厘米、宽 ${b} 厘米的长方形，从一个角上剪去一个小正方形后，剩下图形的周长是多少厘米？`), opts(ans, () => 2 * (a + b) + rnd(1, 16)), "拔高",
        G("gen.perim.ue6", { v1: a, v2: b, v3: ans }, `剪去角上的小正方形后，用平移法可知周长不变，仍是 (${a}+${b})×2=${ans}（厘米）。`), G("gen.perim.upt6", null, "割补法"), null);
    }
    if (type === 7) {
      const a = rnd(5, 30), b = rnd(6, 40), ans = 2 * a + b;
      return Q(G("gen.perim.uq7", { v1: b, v2: a }, `用篱笆靠墙围一个长方形羊圈，靠墙的一面不用篱笆。长方形长 ${b} 米（靠墙的一面），宽 ${a} 米，需要篱笆多少米？`), opts(ans, () => 2 * rnd(4, 32) + rnd(5, 42)), "提升",
        G("gen.perim.ue7", { v1: a, v2: b, v3: 2 * a, v4: b, v5: ans }, `只围三面：两条宽加一条长=${a}×2+${b}=${2 * a}+${b}=${ans}（米）。`), G("gen.perim.upt7", null, "少一边"), null);
    }
    if (type === 8) {
      const a = rnd(3, 40), P = 4 * a;
      return Q(G("gen.perim.uq8", { v1: P }, `一个正方形的周长是 ${P} 厘米，它的边长是多少厘米？`), opts(a, () => rnd(2, 45)), "基础",
        G("gen.perim.ue8", { v1: P, v2: a }, `边长=周长÷4=${P}÷4=${a}（厘米）。`), G("gen.perim.upt8", null, "求边长"), null);
    }
    if (type === 9) {
      const k = rnd(2, 5), w = rnd(3, 20), P = 2 * (k * w + w);
      return Q(G("gen.perim.uq9", { v1: k, v2: P }, `一个长方形的长是宽的 ${k} 倍，周长是 ${P} 厘米，宽是多少厘米？`), opts(w, () => rnd(2, 30)), "拔高",
        G("gen.perim.ue9", { v1: P, v2: P / 2, v3: k + 1, v4: P / 2, v5: k + 1, v6: w }, `长+宽=${P}÷2=${P / 2}（厘米），相当于 ${k + 1} 个宽，宽=${P / 2}÷${k + 1}=${w}（厘米）。`), G("gen.perim.upt9", null, "倍数关系"), null);
    }
    if (type === 10) {
      const a = rnd(10, 40), b = rnd(5, 25), ans = 2 * (a + b) + 2 * b;
      return Q(G("gen.perim.uq10", { v1: a, v2: b }, `把一个长 ${a} 厘米、宽 ${b} 厘米的长方形剪成两个小长方形（沿平行于宽的方向剪一刀），两个小长方形的周长之和是多少厘米？`), opts(ans, () => 2 * (a + b) + rnd(1, 30)), "拔高",
        G("gen.perim.ue10", { v1: a, v2: b, v3: 2 * (a + b), v4: 2 * (a + b), v5: b, v6: ans }, `原周长 (${a}+${b})×2=${2 * (a + b)}（厘米），剪一刀多出 2 条宽：${2 * (a + b)}+${b}×2=${ans}（厘米）。`), G("gen.perim.upt10", null, "剪拼周长"), null);
    }
    const a = rnd(4, 20), C = 4 * a, k = rnd(2, 8), ans = C * k;
    return Q(G("gen.perim.uq11", { v1: a, v2: k }, `一根绳子在边长 ${a} 分米的正方形木框上绕 ${k} 圈，正好用完（不计接头）。这根绳子有多长（分米）？`), opts(ans, () => 4 * a * rnd(2, 10)), "提升",
      G("gen.perim.ue11", { v1: a, v2: C, v3: k, v4: C, v5: k, v6: ans }, `绕一圈是正方形周长 ${a}×4=${C}（分米），绕 ${k} 圈：${C}×${k}=${ans}（分米）。`), G("gen.perim.upt11", null, "绳长问题"), null);
  }

  /* ============ 24. area_equal 等积变形（五年级） ============ */
  function qAreaEqual() {
    const type = rnd(0, 11);
    if (type === 0) {
      const a = rnd(4, 30), b = rnd(3, 25), ans = a * b;
      return Q(G("gen.area_equal.uq0", { v1: a, v2: b }, `一个长方形长 ${a} 厘米，宽 ${b} 厘米，面积是多少平方厘米？`), opts(ans, () => rnd(4, 32) * rnd(3, 27)), "基础",
        G("gen.area_equal.ue0", { v1: a, v2: b, v3: ans }, `S=长×宽=${a}×${b}=${ans}（平方厘米）。`), G("gen.area_equal.upt0", null, "长方形面积"), null);
    }
    if (type === 1) {
      const a = rnd(4, 30), h = rnd(3, 25), ans = a * h;
      return Q(G("gen.area_equal.uq1", { v1: a, v2: h }, `一个平行四边形的底是 ${a} 厘米，高是 ${h} 厘米，面积是多少平方厘米？`), opts(ans, () => rnd(4, 32) * rnd(3, 27)), "基础",
        G("gen.area_equal.ue1", { v1: a, v2: h, v3: ans }, `S=底×高=${a}×${h}=${ans}（平方厘米）。`), G("gen.area_equal.upt1", null, "平行四边形"), null);
    }
    if (type === 2) {
      const a = rnd(4, 30), h = pick([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]), ans = a * h / 2;
      return Q(G("gen.area_equal.uq2", { v1: a, v2: h }, `一个三角形的底是 ${a} 分米，高是 ${h} 分米，面积是多少平方分米？`), opts(ans, () => rnd(4, 32) * pick([2, 4, 6, 8, 10]) / 2), "基础",
        G("gen.area_equal.ue2", { v1: a, v2: h, v3: a * h, v4: ans }, `S=底×高÷2=${a}×${h}÷2=${a * h}÷2=${ans}（平方分米）。`), G("gen.area_equal.upt2", null, "三角形面积"), null);
    }
    if (type === 3) {
      const a = rnd(3, 20), b = rnd(4, 30), h = pick([2, 4, 6, 8, 10, 12, 14]), ans = (a + b) * h / 2;
      return Q(G("gen.area_equal.uq3", { v1: a, v2: b, v3: h }, `一个梯形的上底 ${a} 厘米，下底 ${b} 厘米，高 ${h} 厘米，面积是多少平方厘米？`), opts(ans, () => (rnd(3, 22) + rnd(4, 32)) * pick([2, 4, 6, 8]) / 2), "提升",
        G("gen.area_equal.ue3", { v1: a, v2: b, v3: h, v4: a + b, v5: h, v6: ans }, `S=(上底+下底)×高÷2=(${a}+${b})×${h}÷2=${a + b}×${h}÷2=${ans}（平方厘米）。`), G("gen.area_equal.upt3", null, "梯形面积"), null);
    }
    if (type === 4) {
      const S = rnd(6, 60) * 2, ans = S / 2;
      return Q(G("gen.area_equal.uq4", { v1: S }, `一个三角形和一个平行四边形等底等高，平行四边形的面积是 ${S} 平方厘米，三角形的面积是多少平方厘米？`), opts(ans, () => rnd(3, 70)), "提升",
        G("gen.area_equal.ue4", { v1: S, v2: ans }, `等底等高时，三角形面积是平行四边形的一半：${S}÷2=${ans}（平方厘米）。`), G("gen.area_equal.upt4", null, "等底等高"), null);
    }
    if (type === 5) {
      const a = rnd(3, 20), h = rnd(2, 20), S = a * h / 2 * 1, ans = h;
      const Sv = a * h / 2;
      return Q(G("gen.area_equal.uq5", { v1: Sv, v2: a }, `一个三角形的面积是 ${Sv} 平方厘米，底是 ${a} 厘米，它的高是多少厘米？`), opts(ans, () => rnd(2, 30)), "提升",
        G("gen.area_equal.ue5", { v1: Sv, v2: a, v3: 2 * Sv, v4: a, v5: ans }, `h=2S÷底=2×${Sv}÷${a}=${2 * Sv}÷${a}=${ans}（厘米）。`), G("gen.area_equal.upt5", null, "逆求高"), null);
    }
    if (type === 6) {
      const a = rnd(3, 25), h = rnd(2, 20), S = a * h;
      return Q(G("gen.area_equal.uq6", { v1: S, v2: a }, `一个平行四边形的面积是 ${S} 平方分米，底是 ${a} 分米，高是多少分米？`), opts(h, () => rnd(2, 28)), "提升",
        G("gen.area_equal.ue6", { v1: S, v2: a, v3: h }, `h=S÷底=${S}÷${a}=${h}（分米）。`), G("gen.area_equal.upt6", null, "逆求高"), null);
    }
    if (type === 7) {
      const a = rnd(3, 15), b = rnd(4, 25), h = rnd(2, 18), S = (a + b) * h / 2 * 1;
      const Sv = (a + b) * h / 2;
      return Q(G("gen.area_equal.uq7", { v1: Sv, v2: a, v3: b }, `一个梯形的面积是 ${Sv} 平方厘米，上底 ${a} 厘米，下底 ${b} 厘米，高是多少厘米？`), opts(h, () => rnd(2, 26)), "拔高",
        G("gen.area_equal.ue7", { v1: Sv, v2: a + b, v3: 2 * Sv, v4: a + b, v5: h }, `h=2S÷(上底+下底)=2×${Sv}÷${a + b}=${2 * Sv}÷${a + b}=${h}（厘米）。`), G("gen.area_equal.upt7", null, "梯形求高"), null);
    }
    if (type === 8) {
      const a = rnd(4, 20), b = rnd(3, 16), k = rnd(2, 4), ans = a * b;
      return Q(G("gen.area_equal.uq8", { v1: a, v2: b, v3: k, v4: k }, `一个长 ${a} 厘米、宽 ${b} 厘米的长方形，如果长扩大到原来的 ${k} 倍、宽缩小到原来的 1/${k}，那么新图形的面积是多少平方厘米？`), opts(ans, () => a * b * pick([2, 3, 4]) + rnd(0, 3)), "拔高",
        G("gen.area_equal.ue8", { v1: a * k, v2: b / k === Math.floor(b / k) ? b / k : `${b}÷${k}`, v3: a, v4: k, v5: b, v6: k, v7: a, v8: b, v9: ans }, `新长 ${a * k} 厘米，新宽 ${b / k === Math.floor(b / k) ? b / k : `${b}÷${k}`}；面积=${a}×${k}×${b}÷${k}=${a}×${b}=${ans}（平方厘米），面积不变。`), G("gen.area_equal.upt8", null, "等积变形"), null);
    }
    if (type === 9) {
      const g = rnd(6, 40), u = pick([1, 2, 4]), ans = g * u;
      return Q(G("gen.area_equal.uq9", { v1: g, v2: u }, `在方格纸上，一个图形占了 ${g} 个小方格，每个小方格的面积是 ${u} 平方厘米。这个图形的面积是多少平方厘米？`), opts(ans, () => rnd(6, 45) * pick([1, 2, 4])), "基础",
        G("gen.area_equal.ue9", { v1: g, v2: u, v3: ans }, `面积=方格数×每格面积=${g}×${u}=${ans}（平方厘米）。`), G("gen.area_equal.upt9", null, "方格计面积"), null);
    }
    if (type === 10) {
      const a = rnd(2, 12), b = rnd(2, 12), k = rnd(2, 12), S1 = a * k, ans = b * k;
      return Q(G("gen.area_equal.uq10", { v1: a, v2: b, v3: a, v4: S1 }, `两个三角形的高相等，底分别是 ${a} 厘米和 ${b} 厘米。已知底是 ${a} 厘米的三角形面积是 ${S1} 平方厘米，另一个三角形的面积是多少平方厘米？`), opts(ans, () => rnd(2, 150)), "拔高",
        G("gen.area_equal.ue10", { v1: a, v2: b, v3: S1, v4: a, v5: b, v6: k, v7: b, v8: ans }, `等高时面积比等于底之比：${a} : ${b}，所以面积=${S1}÷${a}×${b}=${k}×${b}=${ans}（平方厘米）。`), G("gen.area_equal.upt10", null, "等高模型"), null);
    }
    const a = rnd(3, 20), b = rnd(3, 20), c = pick([2, 4, 5, 8, 10]), ans = 2 * a * b / c;
    return Q(G("gen.area_equal.uq11", { v1: a, v2: b, v3: c }, `一个长 ${a} 厘米、宽 ${b} 厘米的长方形，与一个底是 ${c} 厘米的三角形面积相等。这个三角形的高是多少厘米？`), opts(r2(ans), () => rnd(2, 60)), "拔高",
      G("gen.area_equal.ue11", { v1: a, v2: b, v3: a * b, v4: 2 * a * b, v5: c, v6: r2(ans) }, `长方形面积=${a}×${b}=${a * b}（平方厘米），三角形高=2S÷底=${2 * a * b}÷${c}=${r2(ans)}（厘米）。`), G("gen.area_equal.upt11", null, "等积变形"), null);
  }

  /* ============ 25. pigeon 抽屉原理（五年级） ============ */
  function qPigeon() {
    const type = rnd(0, 11);
    if (type === 0) {
      const n = rnd(3, 20), ans = n + 1;
      return Q(G("gen.pigeon.uq0", { v1: n }, `把一些苹果放进 ${n} 个抽屉里，至少要放多少个苹果，才能保证有一个抽屉里至少有 2 个苹果？`), opts(ans, () => rnd(2, 26)), "基础",
        G("gen.pigeon.ue0", { v1: n, v2: n, v3: ans }, `最不利情况是每个抽屉先放 1 个，共 ${n} 个；再放 1 个必然有抽屉里有 2 个，所以至少 ${n}+1=${ans} 个。`), G("gen.pigeon.upt0", null, "n+1原理"), null);
    }
    if (type === 1) {
      const m = rnd(3, 8), ans = m + 1;
      return Q(G("gen.pigeon.uq1", { v1: m }, `箱子里有 ${m} 种颜色的球（每种都很多），至少摸出多少个球，才能保证有 2 个颜色相同？`), opts(ans, () => rnd(3, 14)), "基础",
        G("gen.pigeon.ue1", { v1: m, v2: m, v3: m, v4: ans }, `把颜色看成 ${m} 个抽屉，最坏情况每种各摸 1 个（${m} 个都不同），再摸 1 个必有同色：${m}+1=${ans}（个）。`), G("gen.pigeon.upt1", null, "抽屉原理"), null);
    }
    if (type === 2) {
      const m = rnd(3, 6), k = rnd(3, 5), ans = m * (k - 1) + 1;
      return Q(G("gen.pigeon.uq2", { v1: m, v2: k }, `箱子里有 ${m} 种颜色的球（每种都足够多），至少摸出多少个，才能保证有 ${k} 个颜色相同？`), opts(ans, () => rnd(4, 30)), "拔高",
        G("gen.pigeon.ue2", { v1: k - 1, v2: m, v3: k - 1, v4: m * (k - 1), v5: k, v6: m * (k - 1), v7: ans }, `最坏情况每种颜色都摸 ${k - 1} 个，共 ${m}×${k - 1}=${m * (k - 1)} 个仍没有 ${k} 个同色；再摸 1 个即可：${m * (k - 1)}+1=${ans}（个）。`), G("gen.pigeon.upt2", null, "最不利原则"), null);
    }
    if (type === 3) {
      const a = rnd(5, 25), b = rnd(5, 25), ans = b + 1;
      return Q(G("gen.pigeon.uq3", { v1: a, v2: b }, `袋子里有 ${a} 个红球和 ${b} 个蓝球，闭眼摸球，至少摸出多少个才能保证一定有红球？`), opts(ans, () => rnd(3, 32)), "提升",
        G("gen.pigeon.ue3", { v1: b, v2: b, v3: ans }, `最坏情况先把 ${b} 个蓝球全摸出来，再摸 1 个必是红球：${b}+1=${ans}（个）。`), G("gen.pigeon.upt3", null, "最不利原则"), null);
    }
    if (type === 4) {
      const a = rnd(6, 25), b = rnd(6, 25), ans = Math.max(a, b) + 1;
      return Q(G("gen.pigeon.uq4", { v1: a, v2: b }, `袋子里有 ${a} 个红球和 ${b} 个白球，至少摸出多少个才能保证摸到两种颜色都有？`), opts(ans, () => rnd(4, 32)), "提升",
        G("gen.pigeon.ue4", { v1: Math.max(a, b), v2: Math.max(a, b), v3: ans }, `最坏情况先摸出较多的那种颜色全部（${Math.max(a, b)} 个），再摸 1 个就是另一种颜色：${Math.max(a, b)}+1=${ans}（个）。`), G("gen.pigeon.upt4", null, "最不利原则"), null);
    }
    if (type === 5) {
      const N = rnd(15, 200), ans = ceilDiv(N, 12);
      return Q(G("gen.pigeon.uq5", { v1: N }, `一个班（或一个团体）共有 ${N} 人，那么至少有多少人的生日在同一个月？`), opts(ans, () => rnd(2, 20)), "提升",
        G("gen.pigeon.ue5", { v1: N, v2: Math.floor(N / 12), v3: N % 12 ? `……${N % 12}` : "", v4: ans }, `一年 12 个月看作 12 个抽屉：${N}÷12=${Math.floor(N / 12)}${N % 12 ? `……${N % 12}` : ""}，所以至少有 ${ans} 人生日在同一个月。`), G("gen.pigeon.upt5", null, "平均分配"), null);
    }
    if (type === 6) {
      const N = rnd(10, 150), ans = ceilDiv(N, 7);
      return Q(G("gen.pigeon.uq6", { v1: N }, `${N} 个人中，至少有多少人是在同一个星期几出生的？`), opts(ans, () => rnd(2, 24)), "提升",
        G("gen.pigeon.ue6", { v1: N, v2: Math.floor(N / 7), v3: N % 7 ? `……${N % 7}` : "", v4: ans }, `一周 7 天是 7 个抽屉：${N}÷7=${Math.floor(N / 7)}${N % 7 ? `……${N % 7}` : ""}，至少有 ${ans} 人在同一个星期几。`), G("gen.pigeon.upt6", null, "平均分配"), null);
    }
    if (type === 7) {
      const k = rnd(3, 12), N = rnd(k + 2, k * 6), ans = ceilDiv(N, k);
      return Q(G("gen.pigeon.uq7", { v1: N, v2: k }, `把 ${N} 本书分给 ${k} 个同学，至少有一个同学分到多少本？`), opts(ans, () => rnd(1, 12)), "提升",
        G("gen.pigeon.ue7", { v1: N, v2: k, v3: Math.floor(N / k), v4: N % k ? `……${N % k}` : "", v5: ans }, `${N}÷${k}=${Math.floor(N / k)}${N % k ? `……${N % k}` : ""}，最平均分也会有人不少于 ${ans} 本。`), G("gen.pigeon.upt7", null, "平均数思想"), null);
    }
    if (type === 8) {
      const a = rnd(5, 15), b = rnd(5, 15), c = rnd(5, 15), tot = a + b + c, mn = Math.min(a, b, c), ans = tot - mn + 1;
      return Q(G("gen.pigeon.uq8", { v1: a, v2: b, v3: c }, `袋子里有红球 ${a} 个、黄球 ${b} 个、蓝球 ${c} 个，至少摸出多少个才能保证三种颜色的球都摸到？`), opts(ans, () => rnd(10, 46)), "拔高",
        G("gen.pigeon.ue8", { v1: mn, v2: tot, v3: mn, v4: tot - mn, v5: tot - mn, v6: ans }, `最坏情况是把数量最少的那种（${mn} 个）留在最后：先摸出其余 ${tot}−${mn}=${tot - mn} 个，再摸 1 个：${tot - mn}+1=${ans}（个）。`), G("gen.pigeon.upt8", null, "最不利原则"), null);
    }
    if (type === 9) {
      const k = rnd(3, 8), a = rnd(k + 2, 20), b = rnd(k + 2, 20), ans = 2 * (k - 1) + 1;
      return Q(G("gen.pigeon.uq9", { v1: a, v2: b, v3: k }, `袋中有 ${a} 个红球和 ${b} 个白球，至少摸出多少个才能保证有 ${k} 个颜色相同的球？`), opts(ans, () => rnd(3, 24)), "拔高",
        G("gen.pigeon.ue9", { v1: k - 1, v2: 2 * (k - 1), v3: k, v4: ans }, `两种颜色是 2 个抽屉，最坏情况每种摸 ${k - 1} 个共 ${2 * (k - 1)} 个，再摸 1 个必有 ${k} 个同色：${ans}（个）。`), G("gen.pigeon.upt9", null, "抽屉原理"), null);
    }
    if (type === 10) {
      const k = rnd(3, 12), ans = k + 1;
      return Q(G("gen.pigeon.uq10", { v1: k }, `至少取多少个自然数，才能保证其中一定有两个数除以 ${k} 的余数相同？`), opts(ans, () => rnd(3, 18)), "拔高",
        G("gen.pigeon.ue10", { v1: k, v2: k - 1, v3: k, v4: k, v5: k, v6: ans }, `除以 ${k} 的余数只有 0,1,…,${k - 1} 共 ${k} 种（${k} 个抽屉），取 ${k}+1=${ans} 个数就一定有两个余数相同。`), G("gen.pigeon.upt10", null, "余数抽屉"), null);
    }
    const k = rnd(2, 6), ans = 4 * (k - 1) + 1;
    return Q(G("gen.pigeon.uq11", { v1: k }, `一副扑克牌去掉大小王后有 52 张，共 4 种花色。至少抽出多少张，才能保证有 ${k} 张花色相同？`), opts(ans, () => rnd(3, 25)), "拔高",
      G("gen.pigeon.ue11", { v1: k - 1, v2: 4 * (k - 1), v3: k, v4: ans }, `4 种花色是 4 个抽屉，最坏情况每种抽 ${k - 1} 张共 ${4 * (k - 1)} 张，再抽 1 张必有 ${k} 张同花色：${ans}（张）。`), G("gen.pigeon.upt11", null, "构造抽屉"), null);
  }

  /* ============ 26. inclusion 容斥原理（五年级） ============ */
  function qInclusion() {
    const type = rnd(0, 11);
    if (type === 0) {
      const both = rnd(2, 15), oa = rnd(3, 25), ob = rnd(3, 25), a = oa + both, b = ob + both, ans = a + b - both;
      return Q(G("gen.inclusion.uq0", { v1: a, v2: b, v3: both }, `参加数学小组的有 ${a} 人，参加英语小组的有 ${b} 人，两个小组都参加的有 ${both} 人。至少参加一个小组的共有多少人？`), opts(ans, () => a + b - rnd(1, 18)), "基础",
        G("gen.inclusion.ue0", { v1: a, v2: b, v3: both, v4: a + b, v5: both, v6: ans }, `容斥原理：${a}+${b}−${both}=${a + b}−${both}=${ans}（人）。`), G("gen.inclusion.upt0", null, "两集合容斥"), null);
    }
    if (type === 1) {
      const both = rnd(2, 15), oa = rnd(3, 25), ob = rnd(3, 25), a = oa + both, b = ob + both, U = a + b - both;
      return Q(G("gen.inclusion.uq1", { v1: a, v2: b, v3: U }, `喜欢足球的有 ${a} 人，喜欢篮球的有 ${b} 人，两种都喜欢的人数未知，至少喜欢一种的共 ${U} 人。两种都喜欢的有多少人？`), opts(both, () => rnd(1, 22)), "提升",
        G("gen.inclusion.ue1", { v1: a, v2: b, v3: U, v4: a + b, v5: U, v6: both }, `两者都喜欢=${a}+${b}−${U}=${a + b}−${U}=${both}（人）。`), G("gen.inclusion.upt1", null, "求交集"), null);
    }
    if (type === 2) {
      const both = rnd(2, 15), oa = rnd(3, 25), a = oa + both, b = both + rnd(3, 25);
      return Q(G("gen.inclusion.uq2", { v1: a, v2: b, v3: both }, `参加书法组的有 ${a} 人，参加绘画组的有 ${b} 人，其中 ${both} 人两个组都参加。只参加书法组的有多少人？`), opts(oa, () => rnd(1, 28)), "基础",
        G("gen.inclusion.ue2", { v1: a, v2: both, v3: oa }, `只参加书法=${a}−${both}=${oa}（人）。`), G("gen.inclusion.upt2", null, "只参加一项"), null);
    }
    if (type === 3) {
      const both = rnd(2, 12), oa = rnd(3, 20), ob = rnd(3, 20), a = oa + both, b = ob + both, U = a + b - both, none = rnd(2, 12), tot = U + none;
      return Q(G("gen.inclusion.uq3", { v1: tot, v2: a, v3: b, v4: both }, `全班 ${tot} 人，参加语文竞赛的 ${a} 人，参加数学竞赛的 ${b} 人，两项都参加的 ${both} 人。两项都没参加的有多少人？`), opts(none, () => rnd(1, 20)), "提升",
        G("gen.inclusion.ue3", { v1: a, v2: b, v3: both, v4: U, v5: tot, v6: U, v7: none }, `至少参加一项=${a}+${b}−${both}=${U}（人），都没参加=${tot}−${U}=${none}（人）。`), G("gen.inclusion.upt3", null, "求都不"), null);
    }
    if (type === 4) {
      const x = []; for (let i = 0; i < 7; i++) x.push(rnd(1, 12));
      const a = x[0] + x[3] + x[4] + x[6], b = x[1] + x[3] + x[5] + x[6], c = x[2] + x[4] + x[5] + x[6];
      const ab = x[3] + x[6], ac = x[4] + x[6], bc = x[5] + x[6], abc = x[6];
      const ans = x.reduce((p, q) => p + q, 0);
      return Q(G("gen.inclusion.uq4", { v1: a, v2: b, v3: c, v4: ab, v5: ac, v6: bc, v7: abc }, `三个兴趣小组：参加甲组 ${a} 人，乙组 ${b} 人，丙组 ${c} 人；甲乙都参加 ${ab} 人，甲丙都参加 ${ac} 人，乙丙都参加 ${bc} 人，三组都参加 ${abc} 人。至少参加一个组的共有多少人？`), opts(ans, () => ans + rnd(-12, 12)), "拔高",
        G("gen.inclusion.ue4", { v1: a, v2: b, v3: c, v4: ab, v5: ac, v6: bc, v7: abc, v8: a + b + c, v9: ab + ac + bc, v10: abc, v11: ans }, `三集合容斥：${a}+${b}+${c}−${ab}−${ac}−${bc}+${abc}=${a + b + c}−${ab + ac + bc}+${abc}=${ans}（人）。`), G("gen.inclusion.upt4", null, "三集合容斥"), null);
    }
    if (type === 5) {
      const oa = rnd(4, 20), ob = rnd(4, 20), both = rnd(2, 12), none = rnd(1, 10), tot = oa + ob + both + none;
      return Q(G("gen.inclusion.uq5", { v1: tot, v2: oa, v3: ob, v4: both }, `全班 ${tot} 人，只参加合唱队的 ${oa} 人，只参加舞蹈队的 ${ob} 人，两队都参加的 ${both} 人。两队都不参加的有多少人？`), opts(none, () => rnd(1, 18)), "提升",
        G("gen.inclusion.ue5", { v1: oa, v2: ob, v3: both, v4: oa + ob + both, v5: tot, v6: oa + ob + both, v7: none }, `参加过的共 ${oa}+${ob}+${both}=${oa + ob + both}（人），都不参加=${tot}−${oa + ob + both}=${none}（人）。`), G("gen.inclusion.upt5", null, "韦恩图"), null);
    }
    if (type === 6) {
      const both = rnd(2, 12), oa = rnd(3, 20), ob = rnd(3, 20), a = oa + both, b = ob + both, ans = oa + ob;
      return Q(G("gen.inclusion.uq6", { v1: a, v2: b, v3: both }, `参加数学组的 ${a} 人，参加科技组的 ${b} 人，两组都参加的 ${both} 人。只参加一个组的一共有多少人？`), opts(ans, () => rnd(4, 45)), "拔高",
        G("gen.inclusion.ue6", { v1: a, v2: both, v3: oa, v4: b, v5: both, v6: ob, v7: oa, v8: ob, v9: ans }, `只参加数学 ${a}−${both}=${oa}（人），只参加科技 ${b}−${both}=${ob}（人），共 ${oa}+${ob}=${ans}（人）。`), G("gen.inclusion.upt6", null, "只参加一项"), null);
    }
    if (type === 7) {
      const U = rnd(20, 60), none = rnd(2, 15), tot = U + none;
      return Q(G("gen.inclusion.uq7", { v1: U, v2: none }, `某班至少参加一项活动的有 ${U} 人，两项都没参加的有 ${none} 人。这个班一共有多少人？`), opts(tot, () => rnd(20, 90)), "基础",
        G("gen.inclusion.ue7", { v1: U, v2: none, v3: tot }, `总人数=至少参加一项的人数+都没参加的人数=${U}+${none}=${tot}（人）。`), G("gen.inclusion.upt7", null, "求总数"), null);
    }
    if (type === 8) {
      const both = rnd(2, 14), oa = rnd(3, 22), ob = rnd(3, 22), a = oa + both, b = ob + both;
      return Q(G("gen.inclusion.uq8", { v1: a, v2: b, v3: both }, `订《少年报》的有 ${a} 人，订《数学报》的有 ${b} 人，两种都订的有 ${both} 人。只订《数学报》的有多少人？`), opts(ob, () => rnd(1, 28)), "基础",
        G("gen.inclusion.ue8", { v1: b, v2: both, v3: ob }, `只订《数学报》=${b}−${both}=${ob}（人）。`), G("gen.inclusion.upt8", null, "韦恩图填空"), null);
    }
    if (type === 9) {
      const x = []; for (let i = 0; i < 7; i++) x.push(rnd(1, 10));
      const a = x[0] + x[3] + x[4] + x[6], b = x[1] + x[3] + x[5] + x[6], c = x[2] + x[4] + x[5] + x[6];
      const ab = x[3] + x[6], ac = x[4] + x[6], bc = x[5] + x[6], U = x.reduce((p, q) => p + q, 0), ans = x[6];
      return Q(G("gen.inclusion.uq9", { v1: a, v2: b, v3: c, v4: ab, v5: ac, v6: bc, v7: U }, `三项调查中：甲 ${a} 人，乙 ${b} 人，丙 ${c} 人；甲乙 ${ab} 人，甲丙 ${ac} 人，乙丙 ${bc} 人，至少参加一项的 ${U} 人。三项都参加的有多少人？`), opts(ans, () => rnd(1, 15)), "拔高",
        G("gen.inclusion.ue9", { v1: U, v2: a, v3: b, v4: c, v5: ab, v6: ac, v7: bc, v8: U, v9: a + b + c, v10: ab + ac + bc, v11: ans }, `由容斥：三项都参加=${U}−(${a}+${b}+${c})+(${ab}+${ac}+${bc})=${U}−${a + b + c}+${ab + ac + bc}=${ans}（人）。`), G("gen.inclusion.upt9", null, "反用容斥"), null);
    }
    if (type === 10) {
      const pr = pick([[2, 3], [2, 5], [3, 4], [3, 5], [2, 7], [4, 5], [3, 7], [5, 6]]), N = rnd(50, 400);
      const A = Math.floor(N / pr[0]), B = Math.floor(N / pr[1]), C = Math.floor(N / lcm(pr[0], pr[1])), ans = A + B - C;
      return Q(G("gen.inclusion.uq10", { v1: N, v2: pr[0], v3: pr[1] }, `在 1 ~ ${N} 中，能被 ${pr[0]} 整除或能被 ${pr[1]} 整除的数一共有多少个？`), opts(ans, () => ans + rnd(-10, 10)), "拔高",
        G("gen.inclusion.ue10", { v1: pr[0], v2: A, v3: pr[1], v4: B, v5: lcm(pr[0], pr[1]), v6: C, v7: A, v8: B, v9: C, v10: ans }, `能被 ${pr[0]} 整除的 ${A} 个，能被 ${pr[1]} 整除的 ${B} 个，都能被整除（即 ${lcm(pr[0], pr[1])} 的倍数）的 ${C} 个；${A}+${B}−${C}=${ans}（个）。`), G("gen.inclusion.upt10", null, "整除容斥"), null);
    }
    const pr = pick([[2, 3], [2, 5], [3, 4], [3, 5], [2, 7], [4, 5], [3, 7]]), N = rnd(50, 400);
    const A = Math.floor(N / pr[0]), B = Math.floor(N / pr[1]), C = Math.floor(N / lcm(pr[0], pr[1])), ans = N - (A + B - C);
    return Q(G("gen.inclusion.uq11", { v1: N, v2: pr[0], v3: pr[1] }, `在 1 ~ ${N} 中，既不能被 ${pr[0]} 整除又不能被 ${pr[1]} 整除的数有多少个？`), opts(ans, () => ans + rnd(-10, 10)), "拔高",
      G("gen.inclusion.ue11", { v1: pr[0], v2: pr[1], v3: A, v4: B, v5: C, v6: A + B - C, v7: N, v8: A + B - C, v9: ans }, `能被 ${pr[0]} 或 ${pr[1]} 整除的有 ${A}+${B}−${C}=${A + B - C}（个），所以都不能整除的有 ${N}−${A + B - C}=${ans}（个）。`), G("gen.inclusion.upt11", null, "容斥求补"), null);
  }

  /* ============ 27. cowgrass 牛吃草问题（六年级） ============ */
  function qCowGrass() {
    const type = rnd(0, 9);
    const g = rnd(1, 8);
    const M = pick([24, 36, 48, 60, 72, 90, 96, 120, 144, 180, 240]);
    const ds = divs(M).filter(x => x >= 2 && x <= 40);
    const three = shuffle(ds).slice(0, 3);
    const d1 = three[0], d2 = three[1] !== undefined ? three[1] : d1 + 1, d3 = three[2] !== undefined ? three[2] : d1;
    const n1 = M / d1 + g, n2 = M / d2 + g, n3 = M / d3 + g;
    const core = G("gen.cowgrass.x0", { v1: n1, v2: d1, v3: n2, v4: d2 }, `${n1} 头牛可以吃 ${d1} 天，${n2} 头牛可以吃 ${d2} 天`);
    const sol = G("gen.cowgrass.x1", { v1: n1, v2: d1, v3: n1 * d1, v4: n2, v5: d2, v6: n2 * d2, v7: d1, v8: d2, v9: g, v10: M }, `设 1 头牛 1 天吃 1 份草。总量：${n1}×${d1}=${n1 * d1}（份），${n2}×${d2}=${n2 * d2}（份）；` +
      `每天新长的草=(${n1 * d1}−${n2 * d2})÷(${d1}−${d2})=${g}（份），原有草量=${n1 * d1}−${g}×${d1}=${M}（份）。`);
    const solPump = G("gen.cowgrass.x2", { v1: n1, v2: d1, v3: n1 * d1, v4: n2, v5: d2, v6: n2 * d2, v7: d1, v8: d2, v9: g, v10: M }, sol.replace(/牛/g, "台抽水机").replace(/草/g, "水"));
    if (d1 === d2) {
      const ans = M / d1 + g;
      return Q(G("gen.cowgrass.uq0", { v1: M, v2: g, v3: d1 }, `一片牧场的草匀速生长。原有草量相当于 ${M} 头牛吃 1 天的量，每天新长的草相当于 ${g} 头牛 1 天吃的量。要在 ${d1} 天吃完，需要多少头牛？`), opts(ans, () => rnd(2, 60)), "拔高",
        G("gen.cowgrass.ue0", { v1: d1, v2: g, v3: d1, v4: g * d1, v5: M, v6: g * d1, v7: M + g * d1, v8: M + g * d1, v9: d1, v10: ans }, `${d1} 天里新长草 ${g}×${d1}=${g * d1}（份），总草量 ${M}+${g * d1}=${M + g * d1}（份），牛数=${M + g * d1}÷${d1}=${ans}（头）。`), G("gen.cowgrass.upt0", null, "牛吃草"), null);
    }
    if (type === 0) {
      return Q(G("gen.cowgrass.uq1", { v1: core, v2: n3 }, `一片牧场上的草匀速生长，${core}。那么 ${n3} 头牛可以吃多少天？`), opts(d3, () => rnd(2, 45)), "拔高",
        G("gen.cowgrass.ue1", { v1: sol, v2: n3, v3: g, v4: n3, v5: g, v6: n3 - g, v7: M, v8: n3 - g, v9: d3 }, `${sol} ${n3} 头牛中有 ${g} 头“吃掉”新长的草，剩下 ${n3}−${g}=${n3 - g} 头吃原有草：${M}÷${n3 - g}=${d3}（天）。`), G("gen.cowgrass.upt1", null, "牛吃草"), null);
    }
    if (type === 1) {
      return Q(G("gen.cowgrass.uq2", { v1: core, v2: d3 }, `一片牧场上的草匀速生长，${core}。如果要在 ${d3} 天里把草吃完，需要多少头牛？`), opts(n3, () => rnd(3, 60)), "拔高",
        G("gen.cowgrass.ue2", { v1: sol, v2: d3, v3: M, v4: g, v5: d3, v6: M + g * d3, v7: M + g * d3, v8: d3, v9: n3 }, `${sol} ${d3} 天共有草 ${M}+${g}×${d3}=${M + g * d3}（份），需要 ${M + g * d3}÷${d3}=${n3}（头）。`), G("gen.cowgrass.upt2", null, "牛吃草"), null);
    }
    if (type === 2) {
      return Q(G("gen.cowgrass.uq3", { v1: core }, `一片牧场上的草匀速生长，${core}。这片牧场每天新长的草相当于多少头牛一天吃的草量？`), opts(g, () => rnd(1, 14)), "拔高",
        G("gen.cowgrass.x3", { v1: sol, v2: g }, sol + ` 所以每天新长的草相当于 ${g} 头牛一天的吃草量。`), G("gen.cowgrass.upt3", null, "求生长量"), null);
    }
    if (type === 3) {
      return Q(G("gen.cowgrass.uq4", { v1: core }, `一片牧场上的草匀速生长，${core}。牧场原有的草相当于多少头牛吃 1 天的草量？`), opts(M, () => pick([24, 36, 48, 60, 72, 90, 96, 120, 144, 180, 240]) + rnd(-2, 2)), "拔高",
        G("gen.cowgrass.x4", { v1: sol, v2: M }, sol + ` 所以原有草量是 ${M} 份，相当于 ${M} 头牛吃 1 天。`), G("gen.cowgrass.upt4", null, "求原有量"), null);
    }
    if (type === 4) {
      return Q(G("gen.cowgrass.uq5", { v1: core }, `一片牧场上的草匀速生长，${core}。最多放多少头牛，才能使草永远吃不完？`), opts(g, () => rnd(1, 14)), "拔高",
        G("gen.cowgrass.x5", { v1: sol, v2: g }, sol + ` 只要牛每天吃的不超过新长的 ${g} 份，草就永远吃不完，所以最多 ${g} 头。`), G("gen.cowgrass.upt5", null, "永远吃不完"), null);
    }
    if (type === 5) {
      return Q(G("gen.cowgrass.uq6", { v1: n1, v2: d1, v3: n2, v4: d2, v5: n3 }, `一个水池有进水管匀速进水（水池原有水量固定）。${n1} 台抽水机 ${d1} 小时可以抽干，${n2} 台抽水机 ${d2} 小时可以抽干。${n3} 台抽水机需要多少小时抽干？`), opts(d3, () => rnd(2, 45)), "拔高",
        G("gen.cowgrass.ue3", { v1: solPump, v2: n3, v3: g, v4: n3 - g, v5: M, v6: n3 - g, v7: d3 }, `与牛吃草同理。${solPump} ${n3}−${g}=${n3 - g} 台用于抽原有水：${M}÷${n3 - g}=${d3}（小时）。`), G("gen.cowgrass.upt6", null, "抽水机模型"), null);
    }
    if (type === 6) {
      return Q(G("gen.cowgrass.uq7", { v1: n1, v2: d1, v3: n2, v4: d2, v5: d3 }, `一个水池不断有水流入。用 ${n1} 台抽水机 ${d1} 小时抽干，用 ${n2} 台抽水机 ${d2} 小时抽干。若要在 ${d3} 小时内抽干，需要多少台抽水机？`), opts(n3, () => rnd(3, 60)), "拔高",
        G("gen.cowgrass.ue4", { v1: g, v2: M, v3: d3, v4: M, v5: g, v6: d3, v7: M + g * d3, v8: M + g * d3, v9: d3, v10: n3 }, `每小时流入的水相当于 ${g} 台抽水机 1 小时的抽水量，原有水量相当于 ${M} 台抽 1 小时；${d3} 小时共 ${M}+${g}×${d3}=${M + g * d3}，需要 ${M + g * d3}÷${d3}=${n3}（台）。`), G("gen.cowgrass.upt7", null, "抽水机模型"), null);
    }
    if (type === 7) {
      return Q(G("gen.cowgrass.uq8", { v1: n1, v2: d1, v3: n2, v4: d2, v5: n3 }, `商场里的顾客不断增加（增加速度不变）。开 ${n1} 个收银台 ${d1} 分钟没有排队顾客，开 ${n2} 个收银台 ${d2} 分钟没有排队顾客。开 ${n3} 个收银台需要多少分钟？`), opts(d3, () => rnd(2, 45)), "拔高",
        G("gen.cowgrass.ue5", { v1: M, v2: g, v3: n3, v4: g, v5: n3 - g, v6: M, v7: n3 - g, v8: d3 }, `原有排队人数相当于 ${M} 份，每分钟新来的相当于 ${g} 份；${n3} 个收银台中 ${g} 个应付新来的，其余 ${n3 - g} 个处理原有的：${M}÷${n3 - g}=${d3}（分钟）。`), G("gen.cowgrass.upt8", null, "收银台模型"), null);
    }
    if (type === 8) {
      const ans = g;
      return Q(G("gen.cowgrass.uq9", { v1: n1, v2: d1, v3: n2, v4: d2 }, `一个水池边不断有水流入。${n1} 台抽水机 ${d1} 小时抽干，${n2} 台抽水机 ${d2} 小时抽干。每小时流入的水相当于多少台抽水机 1 小时的抽水量？`), opts(ans, () => rnd(1, 14)), "拔高",
        G("gen.cowgrass.ue6", { v1: n1, v2: d1, v3: n1 * d1, v4: n2, v5: d2, v6: n2 * d2, v7: n1 * d1, v8: n2 * d2, v9: d1, v10: d2, v11: g }, `总量：${n1}×${d1}=${n1 * d1}，${n2}×${d2}=${n2 * d2}；每小时流入=(${n1 * d1}−${n2 * d2})÷(${d1}−${d2})=${g}。`), G("gen.cowgrass.upt9", null, "求流入速度"), null);
    }
    return Q(G("gen.cowgrass.uq10", { v1: core, v2: n3 }, `一片草地匀速长草，${core}。如果把牛的数量增加到 ${n3} 头，能吃多少天？（草被吃完为止）`), opts(d3, () => rnd(2, 45)), "拔高",
      G("gen.cowgrass.ue7", { v1: sol, v2: n3, v3: g, v4: n3 - g, v5: M, v6: M, v7: n3 - g, v8: d3 }, `${sol} ${n3} 头牛里 ${g} 头正好吃掉每天新长的草，其余 ${n3 - g} 头吃原有的 ${M} 份：${M}÷${n3 - g}=${d3}（天）。`), G("gen.cowgrass.upt10", null, "牛吃草"), null);
  }

  /* ============ 28. concentration 浓度问题（六年级） ============ */
  function qConcentration() {
    const type = rnd(0, 11);
    if (type === 0) {
      const T = rnd(1, 9) * 100, p = rnd(5, 45), s = T * p / 100, w = T - s;
      return Q(G("gen.concentration.uq0", { v1: s, v2: w }, `把 ${s} 克盐溶解在 ${w} 克水中，配成的盐水浓度是百分之几？（填百分号前的数）`), opts(p, () => rnd(2, 60)), "基础",
        G("gen.concentration.ue0", { v1: s, v2: w, v3: T, v4: s, v5: T, v6: p }, `盐水总重=${s}+${w}=${T}（克），浓度=溶质÷溶液=${s}÷${T}=${p}%。`), G("gen.concentration.upt0", null, "浓度公式"), null);
    }
    if (type === 1) {
      const T = rnd(1, 9) * 100, p = rnd(5, 50), ans = T * p / 100;
      return Q(G("gen.concentration.uq1", { v1: T, v2: p }, `${T} 克浓度为 ${p}% 的盐水中，含盐多少克？`), opts(ans, () => rnd(5, 300)), "基础",
        G("gen.concentration.ue1", { v1: T, v2: p, v3: ans }, `溶质=溶液×浓度=${T}×${p}%=${ans}（克）。`), G("gen.concentration.upt1", null, "求溶质"), null);
    }
    if (type === 2) {
      const T = rnd(1, 9) * 100, p = rnd(5, 50), s = T * p / 100;
      return Q(G("gen.concentration.uq2", { v1: s, v2: p }, `一杯盐水中含盐 ${s} 克，浓度是 ${p}%。这杯盐水一共有多少克？`), opts(T, () => rnd(1, 12) * 100), "提升",
        G("gen.concentration.ue2", { v1: s, v2: p, v3: s, v4: r3(p / 100), v5: T }, `溶液=溶质÷浓度=${s}÷${p}%=${s}÷${r3(p / 100)}=${T}（克）。`), G("gen.concentration.upt2", null, "求溶液"), null);
    }
    if (type === 3) {
      const a = rnd(1, 6) * 100, p = pick([20, 30, 40, 50]), s = a * p / 100, q = pick([5, 10, 20, 25]);
      if (q >= p) return Q(G("gen.concentration.uq3", { v1: a, v2: p }, `${a} 克浓度 ${p}% 的糖水中含糖多少克？`), opts(s, () => rnd(5, 300)), "基础", G("gen.concentration.ue3", { v1: a, v2: p, v3: s }, `含糖=${a}×${p}%=${s}（克）。`), G("gen.concentration.upt3", null, "求溶质"), null);
      const T2 = s * 100 / q, w = T2 - a;
      return Q(G("gen.concentration.uq4", { v1: a, v2: p, v3: w }, `${a} 克浓度为 ${p}% 的盐水，加入 ${w} 克水后，浓度变成百分之几？（填百分号前的数）`), opts(q, () => rnd(2, 40)), "提升",
        G("gen.concentration.ue4", { v1: s, v2: a, v3: w, v4: T2, v5: s, v6: T2, v7: q }, `加水盐不变：盐 ${s} 克，新盐水 ${a}+${w}=${T2}（克），浓度=${s}÷${T2}=${q}%。`), G("gen.concentration.upt4", null, "稀释"), null);
    }
    if (type === 4) {
      const a = rnd(1, 6) * 100, p = pick([20, 30, 40, 50, 60]), s = a * p / 100, q = pick([5, 10, 15, 20, 25]);
      if (q >= p) return Q(G("gen.concentration.uq5", { v1: a, v2: p }, `${a} 克浓度 ${p}% 的盐水中，水有多少克？`), opts(a - s, () => rnd(20, 500)), "基础", G("gen.concentration.ue5", { v1: a, v2: p, v3: s, v4: a, v5: s, v6: a - s }, `盐=${a}×${p}%=${s}（克），水=${a}−${s}=${a - s}（克）。`), G("gen.concentration.upt5", null, "求溶剂"), null);
      const T2 = s * 100 / q, ans = T2 - a;
      return Q(G("gen.concentration.uq6", { v1: a, v2: p, v3: q }, `${a} 克浓度为 ${p}% 的盐水，要把浓度稀释到 ${q}%，需要加入多少克水？`), opts(ans, () => rnd(20, 900)), "拔高",
        G("gen.concentration.ue6", { v1: s, v2: q, v3: s, v4: q, v5: T2, v6: T2, v7: a, v8: ans }, `盐不变=${s} 克；要达到 ${q}%，盐水应有 ${s}÷${q}%=${T2}（克），需加水 ${T2}−${a}=${ans}（克）。`), G("gen.concentration.upt6", null, "求加水量"), null);
    }
    if (type === 5) {
      const a = rnd(1, 6) * 100, p = rnd(10, 40), s = a * p / 100, add = rnd(1, 10) * 10, ans = r1((s + add) / (a + add) * 100);
      return Q(G("gen.concentration.uq7", { v1: a, v2: p, v3: add }, `${a} 克浓度为 ${p}% 的盐水中，再加入 ${add} 克盐并全部溶解，新盐水的浓度是百分之几？（填百分号前的数，保留一位小数）`), opts(ans, () => r1(rnd(50, 700) / 10)), "拔高",
        G("gen.concentration.ue7", { v1: s, v2: s, v3: add, v4: s + add, v5: a, v6: add, v7: a + add, v8: s + add, v9: a + add, v10: ans }, `原有盐 ${s} 克，加盐后盐 ${s}+${add}=${s + add}（克），盐水 ${a}+${add}=${a + add}（克），浓度=${s + add}÷${a + add}≈${ans}%。`), G("gen.concentration.upt7", null, "加溶质"), null);
    }
    if (type === 6) {
      const a = rnd(2, 6) * 100, p = pick([10, 15, 20, 25, 30]), s = a * p / 100, q = pick([20, 25, 40, 50]);
      if (q <= p || s * 100 % q !== 0 || s * 100 / q >= a) {
        return Q(G("gen.concentration.uq8", { v1: a, v2: p }, `${a} 克浓度 ${p}% 的盐水与等量的清水混合后，浓度是百分之几？（填百分号前的数）`), opts(r1(p / 2), () => r1(rnd(20, 300) / 10)), "提升",
          G("gen.concentration.ue8", { v1: s, v2: 2 * a, v3: s, v4: 2 * a, v5: r1(p / 2) }, `盐 ${s} 克不变，盐水变成 ${2 * a} 克，浓度=${s}÷${2 * a}=${r1(p / 2)}%。`), G("gen.concentration.upt8", null, "稀释"), null);
      }
      const T2 = s * 100 / q, ans = a - T2;
      return Q(G("gen.concentration.uq9", { v1: a, v2: p, v3: q }, `${a} 克浓度为 ${p}% 的盐水，蒸发掉一些水后浓度变为 ${q}%。蒸发掉多少克水？`), opts(ans, () => rnd(20, 500)), "拔高",
        G("gen.concentration.ue9", { v1: s, v2: q, v3: s, v4: q, v5: T2, v6: a, v7: T2, v8: ans }, `盐不变=${s} 克；浓度 ${q}% 时盐水重 ${s}÷${q}%=${T2}（克），蒸发水 ${a}−${T2}=${ans}（克）。`), G("gen.concentration.upt9", null, "蒸发"), null);
    }
    if (type === 7) {
      const a = rnd(1, 5) * 100, b = rnd(1, 5) * 100, p = rnd(10, 40), q = rnd(5, 35), ans = r1((a * p + b * q) / (a + b));
      return Q(G("gen.concentration.uq10", { v1: a, v2: p, v3: b, v4: q }, `把 ${a} 克浓度 ${p}% 的盐水与 ${b} 克浓度 ${q}% 的盐水混合，混合后浓度是百分之几？（填百分号前的数，保留一位小数）`), opts(ans, () => r1(rnd(50, 450) / 10)), "拔高",
        G("gen.concentration.ue10", { v1: a, v2: p, v3: b, v4: q, v5: r2(a * p / 100), v6: r2(b * q / 100), v7: r2((a * p + b * q) / 100), v8: a + b, v9: ans }, `总盐=${a}×${p}%+${b}×${q}%=${r2(a * p / 100)}+${r2(b * q / 100)}=${r2((a * p + b * q) / 100)}（克），总重 ${a + b} 克，浓度≈${ans}%。`), G("gen.concentration.upt10", null, "混合浓度"), null);
    }
    if (type === 8) {
      const T = rnd(1, 9) * 100, p = rnd(5, 40), s = T * p / 100, askW = rnd(0, 1), ans = askW ? T - s : s;
      const substWord = askW ? G("gen.concentration.x0", null, "水") : G("gen.concentration.x1", null, "盐");
      return Q(G("gen.concentration.uq11", { v1: T, v2: p, v3: substWord }, `要配制 ${T} 克浓度为 ${p}% 的盐水，需要${substWord}多少克？`), opts(ans, () => rnd(10, 900)), "提升",
        G("gen.concentration.ue11", { v1: T, v2: p, v3: s, v4: T, v5: s, v6: T - s, v7: ans }, `需要盐 ${T}×${p}%=${s}（克），需要水 ${T}−${s}=${T - s}（克）。所以答案是 ${ans} 克。`), G("gen.concentration.upt11", null, "配制溶液"), null);
    }
    if (type === 9) {
      const a = rnd(1, 6) * 100, p = rnd(10, 45), s = a * p / 100, ans = a * (50 - p) / 50;
      return Q(G("gen.concentration.uq12", { v1: a, v2: p }, `${a} 克浓度为 ${p}% 的盐水，要使浓度提高到 50%，需要再加入多少克盐？`), opts(ans, () => rnd(10, 600)), "拔高",
        G("gen.concentration.ue12", { v1: s, v2: a, v3: s, v4: a, v5: r2(a / 2 - s), v6: ans }, `设加盐 x 克：(${s}+x)÷(${a}+x)=50%，${s}+x=0.5×(${a}+x)，0.5x=${r2(a / 2 - s)}，x=${ans}（克）。`), G("gen.concentration.upt12", null, "求加盐量"), null);
    }
    if (type === 10) {
      const a = rnd(1, 6) * 100, p = rnd(10, 45), s = a * p / 100, T2 = 2 * s, ans = a - T2;
      return Q(G("gen.concentration.uq13", { v1: a, v2: p }, `${a} 克浓度为 ${p}% 的糖水，要使浓度变成 50%，需要蒸发掉多少克水？`), opts(ans, () => rnd(10, 600)), "拔高",
        G("gen.concentration.ue13", { v1: s, v2: s, v3: T2, v4: a, v5: T2, v6: ans }, `糖 ${s} 克不变，浓度 50% 时糖水重 ${s}÷50%=${T2}（克），需蒸发水 ${a}−${T2}=${ans}（克）。`), G("gen.concentration.upt13", null, "蒸发浓缩"), null);
    }
    const p = rnd(30, 60), q = rnd(5, 20), m = rnd(q + 2, p - 2), k = rnd(2, 20), a = (m - q) * k, b = (p - m) * k;
    return Q(G("gen.concentration.uq14", { v1: m, v2: b, v3: q, v4: p }, `要配制浓度为 ${m}% 的盐水，现有 ${b} 克浓度为 ${q}% 的盐水，需要加入浓度为 ${p}% 的盐水多少克？`), opts(a, () => rnd(10, 800)), "拔高",
      G("gen.concentration.ue14", { v1: p, v2: q, v3: b, v4: m, v5: b, v6: p, v7: m, v8: m, v9: q, v10: b, v11: p - m, v12: (m - q) * b, v13: a }, `设加入 x 克：${p}%x+${q}%×${b}=${m}%(x+${b})，(${p}−${m})x=(${m}−${q})×${b}，${p - m}x=${(m - q) * b}，x=${a}（克）。`), G("gen.concentration.upt14", null, "十字交叉"), null);
  }

  const GEN = {
    count: qCount, addsub: qAddSub, multi: qMulti, divide: qDivide, fourops: qFourOps,
    fraction: qFraction, decimal: qDecimal, percent: qPercent, ratio: qRatio, trip: qTrip,
    profit: qProfitTax, circle: qCircle, cylinder: qCylinder, equation: qEquation,
    speedcalc: qSpeedCalc, arithseq: qArithSeq, parity: qParity, divisibility: qDivisibility,
    remainder: qRemainder, prime: qPrime, boat: qBoat, circle_track: qTrack,
    perim: qPerim, area_equal: qAreaEqual, pigeon: qPigeon, inclusion: qInclusion,
    cowgrass: qCowGrass, concentration: qConcentration
  };
  if (window.TECHNIQUES) {
    window.TECHNIQUES.forEach(t => {
      if (GEN[t.id]) t.qgen = function (n) { const out = []; for (let i = 0; i < (n || 6); i++) out.push(GEN[t.id]()); return out; };
    });
  }
  window.QGEN_ELEM_READY = true;
})();
