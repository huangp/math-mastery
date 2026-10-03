/* ============================================================
 * 融会贯通 · 高中数学方法参数化出题引擎
 * 覆盖：集合、函数、指数对数、三角函数、数列、向量、
 *       立体几何、导数、圆锥曲线、参数方程、概率统计、复数
 * ============================================================ */
(function () {
  const K = { ink: "#334155", sub: "#64748b", line: "#cbd5e1", pri: "#2f6fed", ok: "#16a34a", warn: "#d97706", red: "#dc2626", soft: "#eef3ff", blue: "#2563eb" };
  function S(w, h, inner) { return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;height:auto;display:block" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`; }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[rnd(0, a.length - 1)]; }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // opts(ans, make1, make2, make3) - 由正确答和3个干扰项生成4个互异选项
  // 干扰项可能与答案（或彼此）撞车：先多试几次，仍不足时用互不相同的数值偏移补齐。
  // 旧写法 push(ans + unique.length) 本身也可能撞出重复项，且对文字选项会拼出乱码。
  function opts(ans, make1, make2, make3) {
    const A = String(ans);
    const list = [A];
    const add = v => {
      const s = String(v);
      if (s && s !== "NaN" && s !== "undefined" && list.indexOf(s) < 0) list.push(s);
    };
    for (const mk of [make1, make2, make3]) {
      for (let i = 0; i < 8 && list.length < 4; i++) {
        try { add(mk()); } catch (e) { break; }
      }
    }
    // 数值题可以安全地造偏移量；文字题造不出有意义的干扰项，宁可少给也不编乱码
    if (list.length < 4 && A !== "" && isFinite(Number(A))) {
      const base = Number(A);
      for (let k = 1; k <= 20 && list.length < 4; k++) {
        add(base + k);
        if (list.length < 4) add(base - k);
      }
    }
    return { opts: list, ans: list.indexOf(A) };
  }

  const G = window.G;

  function Q(q, optsObj, level, explain, point, fig) {
    return Object.assign({ q, level: level || "基础", explain, point: point || "" }, optsObj, { fig: fig || null });
  }

  /* ============================================================
   * 1. 集合与逻辑（十年级）
   * ============================================================ */
  function qSet(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const a = rnd(3, 12);
        o = opts(a + G("gen.set.uo0", null, "个"), () => (a + 1) + G("gen.set.uo1", null, "个"), () => (a - 1) + G("gen.set.uo2", null, "个"), () => G("gen.set.uo3", null, "0个"));
        q = G("gen.set.uq0", { v1: a }, `集合 A 有 ${a} 个元素且 A⊆B，则 A∩B 的元素个数是？`);
        exp = G("gen.set.ue0", { v1: a }, `A⊆B 时 A∩B = A，故为 ${a} 个。`);
      } else if (type === 1) {
        const nn = rnd(2, 8);
        const c = Math.pow(2, nn);
        o = opts(c + G("gen.set.uo4", null, "个"), () => (c + nn), () => (c - 1) + G("gen.set.uo5", null, "个"), () => nn + G("gen.set.uo6", null, "个"));
        q = G("gen.set.uq1", { v1: nn }, `含有 ${nn} 个元素的集合，其子集共有？`);
        exp = G("gen.set.ue1", { v1: nn, v2: c }, `n 元集合子集个数为 2ⁿ = 2^${nn} = ${c} 个。`);
      } else if (type === 2) {
        const nn = rnd(2, 8);
        o = opts((Math.pow(2, nn) - 1) + G("gen.set.uo7", null, "个"), () => Math.pow(2, nn) + G("gen.set.uo8", null, "个"), () => (nn - 1) + G("gen.set.uo9", null, "个"), () => nn + G("gen.set.uo10", null, "个"));
        q = G("gen.set.uq2", { v1: nn }, `含有 ${nn} 个元素的集合，其真子集共有？`);
        exp = G("gen.set.ue2", { v1: Math.pow(2, nn) - 1 }, `真子集个数 = 2ⁿ − 1 = ${Math.pow(2, nn) - 1} 个。`);
      } else if (type === 3) {
        const a = rnd(3, 10), b = rnd(3, 10);
        o = opts((a + b) + G("gen.set.uo11", null, "个"), () => (a + b - 1) + G("gen.set.uo12", null, "个"), () => a + G("gen.set.uo13", null, "个"), () => b + G("gen.set.uo14", null, "个"));
        q = G("gen.set.uq3", { v1: a, v2: b }, `集合 A 有 ${a} 个元素，B 有 ${b} 个元素，且 A∩B=∅，则 A∪B 有？`);
        exp = G("gen.set.ue3", { v1: a, v2: b, v3: a + b }, `不相交时 |A∪B| = |A| + |B| = ${a} + ${b} = ${a + b} 个。`);
      } else if (type === 4) {
        const u = rnd(8, 16), a = rnd(2, u - 2);
        o = opts((u - a) + G("gen.set.uo15", null, "个"), () => a + G("gen.set.uo16", null, "个"), () => u + G("gen.set.uo17", null, "个"), () => (u - a - 1) + G("gen.set.uo18", null, "个"));
        q = G("gen.set.uq4", { v1: u, v2: a }, `全集 U 有 ${u} 个元素，A⊆U 且 |A|=${a}，则补集 ∁_U A 有？`);
        exp = G("gen.set.ue4", { v1: u, v2: a, v3: u - a }, `补集元素个数 = |U| − |A| = ${u} − ${a} = ${u - a} 个。`);
      } else if (type === 5) {
        const a = rnd(2, 9), b = rnd(1, a - 1);
        o = opts(G("gen.set.uo19", null, "充分不必要"), () => G("gen.set.uo20", null, "必要不充分"), () => G("gen.set.uo21", null, "充要"), () => G("gen.set.uo22", null, "既不充分也不必要"));
        q = G("gen.set.uq5", { v1: a, v2: b }, `"x > ${a}" 是 "x > ${b}" 的什么条件？`);
        exp = G("gen.set.ue5", { v1: a, v2: b, v3: b, v4: a }, `x>${a} ⇒ x>${b}（充分），但 x>${b} ⇏ x>${a}（不必要），故充分不必要。`);
      } else if (type === 6) {
        const p = rnd(2, 6);
        o = opts(`∀x∈R, x² ≥ ${p}`, () => `∃x∈R, x² ≥ ${p}`, () => `∀x∈R, x² < ${p}`, () => `∃x∈R, x² ≤ ${p}`);
        q = G("gen.set.uq6", { v1: p }, `命题 "∃x∈R, x² < ${p}" 的否定是？`);
        exp = G("gen.set.ue6", { v1: p }, `存在命题的否定是全称命题：∀x∈R, x² ≥ ${p}。`);
      } else if (type === 7) {
        const a = rnd(4, 10), b = rnd(3, 9), c = rnd(1, Math.min(a, b));
        o = opts((a + b - c) + G("gen.set.uo23", null, "个"), () => (a + b) + G("gen.set.uo24", null, "个"), () => c + G("gen.set.uo25", null, "个"), () => (a + b - 2 * c) + G("gen.set.uo26", null, "个"));
        q = G("gen.set.uq7", { v1: a, v2: b, v3: c }, `集合 A 有 ${a} 个、B 有 ${b} 个元素，A∩B 有 ${c} 个，则 A∪B 有？`);
        exp = G("gen.set.ue7", { v1: a, v2: b, v3: c, v4: a + b - c }, `容斥：|A∪B| = ${a} + ${b} − ${c} = ${a + b - c} 个。`);
      } else if (type === 8) {
        const nn = rnd(2, 7);
        o = opts(Math.pow(2, nn) + G("gen.set.uo27", null, "个"), () => Math.pow(2, nn + 1) + G("gen.set.uo28", null, "个"), () => (nn * 2) + G("gen.set.uo29", null, "个"), () => (Math.pow(2, nn) - 1) + G("gen.set.uo30", null, "个"));
        q = G("gen.set.uq8", { v1: nn }, `含 ${nn} 个元素的集合，其幂集 P(A) 的元素个数是？`);
        exp = G("gen.set.ue8", { v1: Math.pow(2, nn) }, `幂集元素个数 = 2ⁿ = ${Math.pow(2, nn)} 个。`);
      } else {
        const a = rnd(3, 10), b = rnd(3, 10);
        o = opts(Math.min(a, b) + G("gen.set.uo31", null, "个"), () => Math.max(a, b) + G("gen.set.uo32", null, "个"), () => (a + b) + G("gen.set.uo33", null, "个"), () => G("gen.set.uo34", null, "0个"));
        q = G("gen.set.uq9", { v1: a, v2: b }, `集合 A 有 ${a} 个、B 有 ${b} 个元素，A∩B 的元素个数最多为？`);
        exp = G("gen.set.ue9", { v1: a, v2: b, v3: Math.min(a, b) }, `交集不超过较小集合，|A∩B| ≤ min(${a},${b}) = ${Math.min(a, b)} 个。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.set.pt0", null, "集合与逻辑")));
    }
    return results;
  }

  /* ============================================================
   * 2. 函数概念与性质（十年级）
   * ============================================================ */
  function qFuncConcept(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const a = rnd(1, 12);
        o = opts(`x ≠ ${a}`, () => `x ≠ ${a + 1}`, () => `x ≥ ${a}`, () => G("gen.funcconcept.uo0", null, `全体实数`));
        q = G("gen.funcconcept.uq0", { v1: a }, `函数 f(x) = 1/(x − ${a}) 的定义域是？`);
        exp = G("gen.funcconcept.ue0", { v1: a, v2: a }, `分母不为 0，x − ${a} ≠ 0，即 x ≠ ${a}。`);
      } else if (type === 1) {
        const k = rnd(1, 12);
        o = opts(`y ≥ ${k}`, () => `y ≤ ${k}`, () => `y > ${k}`, () => G("gen.funcconcept.uo1", null, `全体实数`));
        q = G("gen.funcconcept.uq1", { v1: k }, `函数 f(x) = (x − 1)² + ${k} 的值域是？`);
        exp = G("gen.funcconcept.ue1", { v1: k, v2: k }, `平方项 ≥ 0，故 f(x) ≥ ${k}，值域为 y ≥ ${k}。`);
      } else if (type === 2) {
        const e = 2 * rnd(1, 12) + 1;
        o = opts(G("gen.funcconcept.uo2", null, "奇函数"), () => G("gen.funcconcept.uo3", null, "偶函数"), () => G("gen.funcconcept.uo4", null, "既奇又偶"), () => G("gen.funcconcept.uo5", null, "非奇非偶"));
        q = G("gen.funcconcept.uq2", { v1: e }, `函数 f(x) = x^${e} 是？`);
        exp = G("gen.funcconcept.ue2", { v1: e, v2: e }, `f(−x) = (−x)^${e} = −x^${e} = −f(x)（指数为奇数），为奇函数。`);
      } else if (type === 3) {
        const a = rnd(1, 15);
        o = opts(G("gen.funcconcept.uo6", null, "在 R 上递增"), () => G("gen.funcconcept.uo7", null, "在 R 上递减"), () => G("gen.funcconcept.uo8", null, "先减后增"), () => G("gen.funcconcept.uo9", null, "先增后减"));
        q = G("gen.funcconcept.uq3", { v1: a }, `函数 f(x) = ${a}x + 1 (a > 0) 的单调性是？`);
        exp = G("gen.funcconcept.ue3", { v1: a }, `一次函数斜率 a = ${a} > 0，在 R 上单调递增。`);
      } else if (type === 4) {
        const a = rnd(1, 15);
        o = opts(`x ≥ ${a}`, () => `x > ${a}`, () => `x ≤ ${a}`, () => `x ≠ ${a}`);
        q = G("gen.funcconcept.uq4", { v1: a }, `函数 f(x) = √(x − ${a}) 的定义域是？`);
        exp = G("gen.funcconcept.ue4", { v1: a, v2: a }, `根号内非负：x − ${a} ≥ 0，即 x ≥ ${a}。`);
      } else if (type === 5) {
        const b = rnd(1, 15);
        o = opts(`x > ${b}`, () => `x ≥ ${b}`, () => `x < ${b}`, () => G("gen.funcconcept.uo10", null, `全体实数`));
        q = G("gen.funcconcept.uq5", { v1: b }, `函数 f(x) = log_2(x − ${b}) 的定义域是？`);
        exp = G("gen.funcconcept.ue5", { v1: b, v2: b }, `真数 x − ${b} > 0 ⇒ x > ${b}。`);
      } else if (type === 6) {
        const e = 2 * rnd(1, 12);
        o = opts(G("gen.funcconcept.uo11", null, "偶函数"), () => G("gen.funcconcept.uo12", null, "奇函数"), () => G("gen.funcconcept.uo13", null, "既奇又偶"), () => G("gen.funcconcept.uo14", null, "非奇非偶"));
        q = G("gen.funcconcept.uq6", { v1: e }, `函数 f(x) = x^${e} 是？`);
        exp = G("gen.funcconcept.ue6", { v1: e, v2: e }, `f(−x) = (−x)^${e} = x^${e} = f(x)（指数为偶数），为偶函数。`);
      } else if (type === 7) {
        const e = rnd(1, 15);
        o = opts(`2π/${e}`, () => `π/${e}`, () => `π`, () => `2π`);
        q = G("gen.funcconcept.uq7", { v1: e }, `函数 f(x) = sin(${e}x) 的最小正周期是？`);
        exp = G("gen.funcconcept.ue7", { v1: e }, `正弦最小正周期 T = 2π/|ω| = 2π/${e}。`);
      } else if (type === 8) {
        const a = rnd(2, 6);
        o = opts(`y > 0`, () => `y ≥ 0`, () => `y > 1`, () => G("gen.funcconcept.uo15", null, `全体实数`));
        q = G("gen.funcconcept.uq8", { v1: a }, `指数函数 f(x) = ${a}^x (a > 0, a ≠ 1) 的值域是？`);
        exp = G("gen.funcconcept.ue8", null, `a^x 恒正，值域为 y > 0。`);
      } else {
        const a = rnd(1, 5), b = rnd(1, 5);
        o = opts(`f⁻¹(x) = (x − ${b})/${a}`, () => `(x + ${b})/${a}`, () => `${a}x + ${b}`, () => `(x − ${b})/${a} × ${a}`);
        q = G("gen.funcconcept.uq9", { v1: a, v2: b }, `函数 f(x) = ${a}x + ${b} 的反函数是？`);
        exp = G("gen.funcconcept.ue9", { v1: a, v2: b, v3: b, v4: a, v5: b, v6: a }, `令 y = ${a}x + ${b}，解 x = (y − ${b})/${a}，故 f⁻¹(x) = (x − ${b})/${a}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.funcconcept.pt0", null, "函数概念与性质")));
    }
    return results;
  }

  /* ============================================================
   * 3. 指数与对数（十年级）
   * ============================================================ */
  function qExpLog(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const a = rnd(2, 5), m = rnd(1, 6);
        o = opts(`a^${2 * m}`, () => `a^${2 * m + 1}`, () => `a^${m}`, () => `${a * m}`);
        q = G("gen.explog.uq0", { v1: m, v2: m }, `a^${m} · a^${m} = ？`);
        exp = G("gen.explog.ue0", { v1: m, v2: m, v3: 2 * m }, `同底数幂相乘指数相加：a^${m}·a^${m} = a^${2 * m}。`);
      } else if (type === 1) {
        const base = rnd(2, 5), ans = rnd(2, 6);
        const val = Math.pow(base, ans);
        o = opts(ans, () => ans + 1, () => ans - 1, () => base);
        q = G("gen.explog.uq1", { v1: base, v2: val }, `log_${base}(${val}) = ？`);
        exp = G("gen.explog.ue1", { v1: base, v2: ans, v3: val, v4: base, v5: val, v6: ans }, `由定义 ${base}^${ans} = ${val}，故 log_${base}(${val}) = ${ans}。`);
      } else if (type === 2) {
        const base = rnd(2, 5), ans = rnd(2, 6);
        const val = Math.pow(base, ans);
        o = opts(val, () => val + 1, () => val - 1, () => ans);
        q = G("gen.explog.uq2", { v1: base, v2: ans }, `解方程 log_${base}(x) = ${ans}，则 x = ？`);
        exp = G("gen.explog.ue2", { v1: base, v2: ans, v3: val }, `x = ${base}^${ans} = ${val}。`);
      } else if (type === 3) {
        const base = rnd(2, 4), ans = rnd(1, 5);
        const val = Math.pow(base, ans);
        o = opts(ans, () => ans + 1, () => ans - 1, () => val);
        q = G("gen.explog.uq3", { v1: base, v2: val }, `解方程 ${base}^x = ${val}，则 x = ？`);
        exp = G("gen.explog.ue3", { v1: base, v2: val, v3: ans }, `x = log_${base}(${val}) = ${ans}。`);
      } else if (type === 4) {
        const a = rnd(2, 5), m = rnd(3, 7), nn = rnd(1, m - 1);
        o = opts(`a^${m - nn}`, () => `a^${m + nn}`, () => `a^${m}`, () => `a^${nn}`);
        q = G("gen.explog.uq4", { v1: m, v2: nn }, `a^${m} ÷ a^${nn} = ？`);
        exp = G("gen.explog.ue4", { v1: m, v2: nn, v3: m - nn }, `同底数幂相除指数相减：a^${m} ÷ a^${nn} = a^${m - nn}。`);
      } else if (type === 5) {
        const a = rnd(2, 4), m = rnd(2, 5), nn = rnd(2, 4);
        o = opts(`a^${m * nn}`, () => `a^${m + nn}`, () => `a^${m}^${nn}`, () => `${a}^${m}`);
        q = G("gen.explog.uq5", { v1: m, v2: nn }, `(a^${m})^${nn} = ？`);
        exp = G("gen.explog.ue5", { v1: m, v2: nn, v3: m * nn }, `幂的乘方指数相乘：(a^${m})^${nn} = a^${m * nn}。`);
      } else if (type === 6) {
        const a = rnd(2, 5), x = rnd(2, 9), y = rnd(1, 8);
        o = opts(`log_${a}(${x}) + log_${a}(${y})`, () => `log_${a}(${x}) − log_${a}(${y})`, () => `log_${a}(${x * y})`, () => G("gen.explog.uo0", { v1: a, v2: x, v3: a, v4: y }, `log_${a}(${x})·log_${a}(${y})`));
        q = G("gen.explog.uq6", { v1: a, v2: x, v3: y }, `对数运算：log_${a}(${x}·${y}) = ？`);
        exp = G("gen.explog.ue6", { v1: a, v2: x, v3: a, v4: y, v5: x, v6: y, v7: x * y }, `积的对数 = log_${a}(${x}) + log_${a}(${y})（真数 ${x}·${y} = ${x * y}）。`);
      } else if (type === 7) {
        const a = rnd(2, 5), b = rnd(3, 9);
        o = opts(`(1/2)log_${a}(${b})`, () => `2log_${a}(${b})`, () => `log_${a}(${b})÷2`, () => `log_2(${b})`);
        q = G("gen.explog.uq7", { v1: a * a, v2: b }, `log_${a * a}(${b}) = ？`);
        exp = G("gen.explog.ue7", { v1: b, v2: a, v3: b }, `换底/幂的换元：log_{a²}(${b}) = (1/2)log_${a}(${b})。`);
      } else if (type === 8) {
        const a = rnd(2, 4), b = rnd(2, 9);
        o = opts(`x > ${b}`, () => `x ≥ ${b}`, () => `x < ${b}`, () => `x > 0`);
        q = G("gen.explog.uq8", { v1: b }, `若底数 a > 1，则 a^x > a^${b} 的解集是？`);
        exp = G("gen.explog.ue8", { v1: b, v2: b }, `a>1 时指数函数递增，a^x > a^${b} ⇔ x > ${b}。`);
      } else {
        const a = rnd(2, 4), k = rnd(2, 6);
        o = opts(k, () => k + 1, () => k - 1, () => a);
        q = G("gen.explog.uq9", { v1: a, v2: Math.pow(a, k) }, `log_${a}(${Math.pow(a, k)}) = ？`);
        exp = G("gen.explog.ue9", { v1: k }, `log_a(a^k) = k = ${k}（对数恒等式）。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.explog.pt0", null, "指数与对数")));
    }
    return results;
  }

  /* ============================================================
   * 4. 三角函数（十一年级）
   * ============================================================ */
  function qTrig(n) {
    const results = [];
    const ANG = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    const sinV = { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1", 120: "√3/2", 135: "√2/2", 150: "1/2", 180: "0", 210: "−1/2", 225: "−√2/2", 240: "−√3/2", 270: "−1", 300: "−√3/2", 315: "−√2/2", 330: "−1/2", 360: "0" };
    const cosV = { 0: "1", 30: "√3/2", 45: "√2/2", 60: "1/2", 90: "0", 120: "−1/2", 135: "−√2/2", 150: "−√3/2", 180: "−1", 210: "−√3/2", 225: "−√2/2", 240: "−1/2", 270: "0", 300: "1/2", 315: "√2/2", 330: "√3/2", 360: "1" };
    const tanV = { 0: "0", 30: "√3/3", 45: "1", 60: "√3", 90: G("gen.trig.x0", null, "不存在"), 120: "−√3", 135: "−1", 150: "−√3/3", 180: "0", 210: "√3/3", 225: "1", 240: "√3", 270: G("gen.trig.x0", null, "不存在"), 300: "−√3", 315: "−1", 330: "−√3/3", 360: "0" };
    const norm = a => ((a % 360) + 360) % 360;
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const ang = pick(ANG);
        o = opts(sinV[ang], () => cosV[ang], () => "0", () => "1");
        q = G("gen.trig.uq0", { v1: ang }, `sin ${ang}° = ？`);
        exp = G("gen.trig.ue0", { v1: ang, v2: sinV[ang] }, `sin ${ang}° = ${sinV[ang]}。`);
      } else if (type === 1) {
        const ang = pick(ANG);
        o = opts(cosV[ang], () => sinV[ang], () => "0", () => "1");
        q = G("gen.trig.uq1", { v1: ang }, `cos ${ang}° = ？`);
        exp = G("gen.trig.ue1", { v1: ang, v2: cosV[ang] }, `cos ${ang}° = ${cosV[ang]}。`);
      } else if (type === 2) {
        const ang = pick(ANG);
        o = opts("sin²α + cos²α = 1", () => "sin²α − cos²α = 1", () => "sinα + cosα = 1", () => "tanα = sinα/cosα");
        q = G("gen.trig.uq2", { v1: ang }, `对任意角 α = ${ang}°，恒成立的三角等式是？`);
        exp = G("gen.trig.ue2", { v1: ang }, `基本三角恒等式：sin²α + cos²α = 1（对 ${ang}° 也成立）。`);
      } else if (type === 3) {
        const ang = pick(ANG);
        o = opts(sinV[ang], () => cosV[ang], () => "−" + sinV[ang], () => "1");
        q = G("gen.trig.uq3", { v1: ang }, `sin(180° − ${ang}°) = ？`);
        exp = G("gen.trig.ue3", { v1: ang, v2: sinV[ang] }, `诱导公式：sin(180°−α) = sinα，故 sin(180°−${ang}°) = ${sinV[ang]}。`);
      } else if (type === 4) {
        const ang = pick(ANG);
        const s2 = sinV[norm(2 * ang)];
        o = opts(s2, () => "1", () => "√3/2", () => "−1/2");
        q = G("gen.trig.uq4", { v1: ang }, `sin(2·${ang}°) = ？`);
        exp = G("gen.trig.ue4", { v1: 2 * ang, v2: s2 }, `倍角公式 sin2α = 2sinαcosα；sin ${2 * ang}° = ${s2}。`);
      } else if (type === 5) {
        const ang = pick(ANG);
        const c2 = cosV[norm(2 * ang)];
        o = opts(c2, () => "−1/2", () => "1/2", () => "0");
        q = G("gen.trig.uq5", { v1: ang }, `cos(2·${ang}°) = ？`);
        exp = G("gen.trig.ue5", { v1: 2 * ang, v2: c2 }, `倍角公式 cos2α = cos²α − sin²α；cos ${2 * ang}° = ${c2}。`);
      } else if (type === 6) {
        const ang = pick(ANG);
        o = opts(tanV[ang], () => "√3", () => "1/√3", () => "0");
        q = G("gen.trig.uq6", { v1: ang }, `tan ${ang}° = ？`);
        exp = G("gen.trig.ue6", { v1: ang, v2: tanV[ang] }, `tanα = sinα/cosα；tan ${ang}° = ${tanV[ang]}。`);
      } else if (type === 7) {
        const ang = pick(ANG);
        o = opts(sinV[ang], () => cosV[ang], () => "−" + sinV[ang], () => "0");
        q = G("gen.trig.uq7", { v1: ang }, `cos(90° − ${ang}°) = ？`);
        exp = G("gen.trig.ue7", { v1: ang, v2: sinV[ang] }, `诱导公式 cos(90°−α) = sinα，故 cos(90°−${ang}°) = ${sinV[ang]}。`);
      } else if (type === 8) {
        const w = rnd(1, 9);
        o = opts(`2π/${w}`, () => `π/${w}`, () => `2π`, () => `π`);
        q = G("gen.trig.uq8", { v1: w }, `函数 y = sin(${w}x) 的最小正周期是？`);
        exp = G("gen.trig.ue8", { v1: w }, `T = 2π/|ω| = 2π/${w}。`);
      } else {
        const ang = pick(ANG);
        o = opts(tanV[ang], () => "1", () => "√3", () => "0");
        q = G("gen.trig.uq9", { v1: ang }, `tan ${ang}° 的值是？`);
        exp = G("gen.trig.ue9", { v1: ang, v2: tanV[ang] }, `tan ${ang}° = ${tanV[ang]}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.trig.pt0", null, "三角函数")));
    }
    return results;
  }

  /* ============================================================
   * 5. 三角恒等变换（十一年级）
   * ============================================================ */
  function qTrigId(n) {
    const results = [];
    const trips = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17], [9, 12, 15], [9, 40, 41], [12, 16, 20], [12, 35, 37], [15, 20, 25], [10, 24, 26]];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const [a, r, qv] = pick(trips);
        const v = 2 * a * r / (qv * qv);
        o = opts(v.toFixed(3), () => (a * r / (qv * qv)).toFixed(3), () => (2 * a * a / (qv * qv)).toFixed(3), () => (2 * r * r / (qv * qv)).toFixed(3));
        q = G("gen.trig_id.uq0", { v1: a, v2: qv, v3: r, v4: qv }, `已知 sinα=${a}/${qv}, cosα=${r}/${qv}，则 sin2α = ？`);
        exp = G("gen.trig_id.ue0", { v1: a, v2: qv, v3: r, v4: qv, v5: 2 * a * r, v6: qv * qv, v7: v.toFixed(3) }, `sin2α = 2sinαcosα = 2·(${a}/${qv})·(${r}/${qv}) = ${2 * a * r}/${qv * qv} ≈ ${v.toFixed(3)}。`);
      } else if (type === 1) {
        const [a, r, qv] = pick(trips);
        const v = (r * r - a * a) / (qv * qv);
        o = opts(v.toFixed(3), () => ((a * a - r * r) / (qv * qv)).toFixed(3), () => (2 * r * r / (qv * qv) - 1).toFixed(3), () => (1 - 2 * a * a / (qv * qv)).toFixed(3));
        q = G("gen.trig_id.uq1", { v1: a, v2: qv, v3: r, v4: qv }, `已知 sinα=${a}/${qv}, cosα=${r}/${qv}，则 cos2α = ？`);
        exp = G("gen.trig_id.ue1", { v1: r * r, v2: a * a, v3: qv * qv, v4: v.toFixed(3) }, `cos2α = cos²α − sin²α = (${r * r}−${a * a})/${qv * qv} = ${v.toFixed(3)}。`);
      } else if (type === 2) {
        const p = rnd(1, 5), q2 = rnd(p + 1, p + 5);
        const v = (2 * p / q2) / (1 + (p / q2) * (p / q2));
        o = opts(v.toFixed(3), () => (p / q2).toFixed(3), () => ((p / q2) * (p / q2)).toFixed(3), () => "1");
        q = G("gen.trig_id.uq2", { v1: p, v2: q2 }, `已知 tanα = ${p}/${q2}，则 sin2α = 2tanα/(1+tan²α) 的值约为？`);
        exp = G("gen.trig_id.ue2", { v1: p, v2: q2, v3: p, v4: q2, v5: v.toFixed(3) }, `sin2α = 2·(${p}/${q2})/(1+(${p}/${q2})²) ≈ ${v.toFixed(3)}。`);
      } else if (type === 3) {
        const [a, r, qv] = pick(trips);
        const v = (1 - r / qv) / 2;
        o = opts("±" + Math.sqrt(v).toFixed(3), () => Math.sqrt((1 + r / qv) / 2).toFixed(3), () => (1 - r / qv).toFixed(3), () => (r / qv).toFixed(3));
        q = G("gen.trig_id.uq3", { v1: r, v2: qv }, `已知 cosα = ${r}/${qv} (>0)，则 sin(α/2) = ±√((1−cosα)/2) 的值约为？`);
        exp = G("gen.trig_id.ue3", { v1: r, v2: qv, v3: v.toFixed(3) }, `sin(α/2) = ±√((1−${r}/${qv})/2) = ±√${v.toFixed(3)}。`);
      } else if (type === 4) {
        const [a, r, qv] = pick(trips);
        const v = a * r / (qv * qv);
        o = opts(v.toFixed(3), () => (a * a / (qv * qv)).toFixed(3), () => (r * r / (qv * qv)).toFixed(3), () => (2 * a * r / (qv * qv)).toFixed(3));
        q = G("gen.trig_id.uq4", { v1: a, v2: qv, v3: r, v4: qv }, `已知 sinα=${a}/${qv}, cosα=${r}/${qv}，则 sinα·cosα = ？`);
        exp = G("gen.trig_id.ue4", { v1: a, v2: qv, v3: r, v4: qv, v5: a * r, v6: qv * qv, v7: v.toFixed(3) }, `sinαcosα = (${a}/${qv})·(${r}/${qv}) = ${a * r}/${qv * qv} ≈ ${v.toFixed(3)}。`);
      } else if (type === 5) {
        const p = rnd(1, 4), q2 = rnd(p + 1, p + 4);
        const v = (2 * p / q2) / (1 - (p / q2) * (p / q2));
        o = opts(v.toFixed(3), () => (p / q2).toFixed(3), () => ((p / q2) * (p / q2)).toFixed(3), () => "1");
        q = G("gen.trig_id.uq5", { v1: p, v2: q2 }, `已知 tanα = ${p}/${q2}，则 tan2α = 2tanα/(1−tan²α) 的值约为？`);
        exp = G("gen.trig_id.ue5", { v1: p, v2: q2, v3: p, v4: q2, v5: v.toFixed(3) }, `tan2α = 2·(${p}/${q2})/(1−(${p}/${q2})²) ≈ ${v.toFixed(3)}。`);
      } else if (type === 6) {
        const [a, r, qv] = pick(trips);
        const v = r / qv;
        o = opts(v.toFixed(3), () => (a / qv).toFixed(3), () => Math.sqrt(1 - (r / qv) * (r / qv)).toFixed(3), () => "1");
        q = G("gen.trig_id.uq6", { v1: a, v2: qv }, `已知 sinα = ${a}/${qv}，且 α 为锐角，则 cosα = ？`);
        exp = G("gen.trig_id.ue6", { v1: a * a, v2: qv * qv, v3: r, v4: qv, v5: v.toFixed(3) }, `cosα = √(1−sin²α) = √(1−${a * a}/${qv * qv}) = ${r}/${qv} = ${v.toFixed(3)}。`);
      } else if (type === 7) {
        const [a, r, qv] = pick(trips);
        const v = (2 * (r / qv) * (r / qv) - 1);
        o = opts(v.toFixed(3), () => ((r * r - a * a) / (qv * qv)).toFixed(3), () => (2 * (a / qv) * (a / qv) - 1).toFixed(3), () => "1");
        q = G("gen.trig_id.uq7", { v1: r, v2: qv }, `已知 cosα = ${r}/${qv}，则 cos2α = 2cos²α − 1 的值约为？`);
        exp = G("gen.trig_id.ue7", { v1: r, v2: qv, v3: r * r, v4: qv * qv, v5: v.toFixed(3) }, `cos2α = 2·(${r}/${qv})² − 1 = 2·${r * r}/${qv * qv} − 1 ≈ ${v.toFixed(3)}。`);
      } else if (type === 8) {
        const [a, r, qv] = pick(trips);
        const v = (a * a + r * r) / (qv * qv);
        o = opts(v.toFixed(3), () => ((a * a - r * r) / (qv * qv)).toFixed(3), () => (2 * a * r / (qv * qv)).toFixed(3), () => ((r * r - a * a) / (qv * qv)).toFixed(3));
        q = G("gen.trig_id.uq8", { v1: a, v2: qv, v3: r, v4: qv }, `已知 sinα=${a}/${qv}, cosα=${r}/${qv}，则 sin²α + cos²α = ？`);
        exp = G("gen.trig_id.ue8", { v1: a * a, v2: qv * qv, v3: r * r, v4: qv * qv, v5: a * a + r * r, v6: qv * qv, v7: v.toFixed(3) }, `sin²α+cos²α = ${a * a}/${qv * qv} + ${r * r}/${qv * qv} = ${a * a + r * r}/${qv * qv} = 1（即 ${v.toFixed(3)}）。`);
      } else {
        const p = rnd(1, 6), q2 = rnd(1, 6);
        o = opts(`${(2 * p * q2)}/(${q2 * q2 - p * p})`, () => `${(p * q2)}/(${q2 * q2 - p * p})`, () => `${(2 * p * q2)}/(${q2 * q2 + p * p})`, () => `${(2 * p)}/(${q2})`);
        q = G("gen.trig_id.uq9", { v1: p, v2: q2 }, `已知 tanα = ${p}/${q2}，则 tan2α = ？`);
        exp = G("gen.trig_id.ue9", { v1: p, v2: q2, v3: p, v4: q2, v5: 2 * p * q2, v6: q2 * q2, v7: p * p }, `tan2α = 2tanα/(1−tan²α) = 2(${p}/${q2})/(1−(${p}/${q2})²) = ${2 * p * q2}/(${q2 * q2}−${p * p})。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.trig_id.pt0", null, "三角恒等变换")));
    }
    return results;
  }

  /* ============================================================
   * 6. 数列（十一年级）
   * ============================================================ */
  function qSequence(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, ans, o, exp;
      if (type === 0) {
        // 等差数列通项
        const a1 = rnd(1, 5);
        const d = rnd(1, 3);
        const n = rnd(3, 6);
        const an = a1 + (n - 1) * d;
        // a1 + n·d 恒等于 an + d，和上一个干扰项永远重合，换成「误把首项乘项数」
        o = opts(an, () => an + d, () => an - d, () => a1 * n);
        q = G("gen.sequence.0q", { v1: a1, v2: d, v3: n, v4: n }, `等差数列首项 ${a1}，公差 ${d}，第 ${n} 项 a_${n} = ？`);
        exp = G("gen.sequence.1e", { v1: a1, v2: n, v3: d, v4: an }, `a_n = a₁ + (n−1)d = ${a1} + (${n}−1)×${d} = ${an}。`);
      } else if (type === 1) {
        // 等差数列求和
        const a1 = rnd(1, 5);
        const d = rnd(1, 3);
        const n = rnd(3, 6);
        const sn = n * a1 + n * (n - 1) * d / 2;
        o = opts(sn, () => sn + n, () => sn - n, () => a1 * n);
        q = G("gen.sequence.2q", { v1: a1, v2: d, v3: n, v4: n }, `等差数列首项 ${a1}，公差 ${d}，前 ${n} 项和 S_${n} = ？`);
        exp = G("gen.sequence.3e", { v1: n, v2: a1, v3: n, v4: n - 1, v5: d, v6: sn }, `S_n = na₁ + n(n−1)d/2 = ${n}×${a1} + ${n}×${n - 1}×${d}/2 = ${sn}。`);
      } else if (type === 2) {
        // 等比数列通项
        const a1 = rnd(1, 3);
        const q_val = rnd(2, 3);
        const n = rnd(3, 5);
        const an = a1 * Math.pow(q_val, n - 1);
        o = opts(an, () => an * q_val, () => an / q_val, () => a1 * n);
        q = G("gen.sequence.4q", { v1: a1, v2: q_val, v3: n, v4: n }, `等比数列首项 ${a1}，公比 ${q_val}，第 ${n} 项 a_${n} = ？`);
        exp = G("gen.sequence.5e", { v1: a1, v2: q_val, v3: n - 1, v4: an }, `a_n = a₁ × q^(n−1) = ${a1} × ${q_val}^${n - 1} = ${an}。`);
      } else {
        // 等比数列求和
        const a1 = rnd(1, 3);
        const q_val = rnd(2, 3);
        const n = rnd(2, 4);
        const sn = a1 * (Math.pow(q_val, n) - 1) / (q_val - 1);
        o = opts(sn, () => sn + a1, () => sn - a1, () => a1 * n);
        q = G("gen.sequence.6q", { v1: a1, v2: q_val, v3: n, v4: n }, `等比数列首项 ${a1}，公比 ${q_val}，前 ${n} 项和 S_${n} = ？`);
        exp = G("gen.sequence.7e", { v1: a1, v2: q_val, v3: n, v4: q_val, v5: sn }, `S_n = a₁(q^n − 1)/(q − 1) = ${a1}×(${q_val}^${n} − 1)/(${q_val} − 1) = ${sn}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.sequence.pt0", null, "数列")));
    }
    return results;
  }

  /* ============================================================
   * 7. 数列求和技巧（十一年级）
   * ============================================================ */
  function qSeqSum(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const nn = rnd(3, 20);
        o = opts(`${nn}/${nn + 1}`, () => `${nn + 1}/${nn + 2}`, () => `${nn - 1}/${nn}`, () => `1/${nn + 1}`);
        q = G("gen.seqsum.uq0", { v1: nn, v2: nn }, `求和：1/(1×2) + 1/(2×3) + ... + 1/(${nn}×(${nn}+1)) = ？`);
        exp = G("gen.seqsum.ue0", { v1: nn, v2: nn + 1 }, `裂项：1/(k(k+1)) = 1/k − 1/(k+1)，相消后得 ${nn}/${nn + 1}。`);
      } else if (type === 1) {
        const nn = rnd(3, 10);
        const sn = Math.pow(2, nn) - 1;
        o = opts(sn, () => sn + 1, () => sn - 1, () => Math.pow(2, nn + 1));
        q = G("gen.seqsum.uq1", { v1: nn - 1 }, `求和：1 + 2 + 4 + ... + 2^${nn - 1} = ？`);
        exp = G("gen.seqsum.ue1", { v1: nn, v2: sn }, `等比求和：S = (2^${nn} − 1)/(2 − 1) = ${sn}。`);
      } else if (type === 2) {
        const nn = rnd(2, 12);
        const an = 2 * nn + 1;
        o = opts(an, () => an + 2, () => an - 2, () => 2 * nn);
        q = G("gen.seqsum.uq2", { v1: nn, v2: nn }, `数列 a_n = 2n + 1，第 ${nn} 项 a_${nn} = ？`);
        exp = G("gen.seqsum.ue2", { v1: nn, v2: nn, v3: an }, `a_${nn} = 2×${nn} + 1 = ${an}。`);
      } else if (type === 3) {
        const nn = rnd(2, 10);
        const ans = nn * (nn + 1) / 2;
        o = opts(ans, () => ans + 1, () => ans - 1, () => nn * nn);
        q = G("gen.seqsum.uq3", { v1: 2 * nn }, `求和：1 + 2 − 3 + 4 − 5 + ... + ${2 * nn} = ？`);
        exp = G("gen.seqsum.ue3", { v1: nn, v2: ans }, `分组：(1+2)+(−3+4)+... 共 ${nn} 组，每组 1，和为 ${ans}。`);
      } else if (type === 4) {
        const a1 = rnd(1, 6), d = rnd(1, 5), nn = rnd(3, 10);
        const an = a1 + (nn - 1) * d;
        o = opts(an, () => an + d, () => an - d, () => a1 + nn * d);
        q = G("gen.seqsum.uq4", { v1: a1, v2: d, v3: nn, v4: nn }, `等差数列首项 ${a1}，公差 ${d}，第 ${nn} 项 a_${nn} = ？`);
        exp = G("gen.seqsum.ue4", { v1: a1, v2: nn, v3: d, v4: an }, `a_n = a₁ + (n−1)d = ${a1} + (${nn}−1)×${d} = ${an}。`);
      } else if (type === 5) {
        const a1 = rnd(1, 4), qv = rnd(2, 4), nn = rnd(3, 6);
        const an = a1 * Math.pow(qv, nn - 1);
        o = opts(an, () => an * qv, () => Math.round(an / qv), () => a1 * nn);
        q = G("gen.seqsum.uq5", { v1: a1, v2: qv, v3: nn, v4: nn }, `等比数列首项 ${a1}，公比 ${qv}，第 ${nn} 项 a_${nn} = ？`);
        exp = G("gen.seqsum.ue5", { v1: a1, v2: qv, v3: nn - 1, v4: an }, `a_n = a₁q^(n−1) = ${a1}×${qv}^${nn - 1} = ${an}。`);
      } else if (type === 6) {
        const nn = rnd(2, 12);
        const ans = nn * (nn + 3) / (2 * (nn + 1));
        o = opts(ans.toFixed(3), () => ((nn + 1) / (nn + 2)).toFixed(3), () => ((nn - 1) / nn).toFixed(3), () => "1");
        q = G("gen.seqsum.uq6", { v1: nn, v2: nn }, `求和：1/(1×3) + 1/(2×4) + ... + 1/(${nn}×(${nn}+2)) = ？`);
        exp = G("gen.seqsum.ue6", { v1: ans.toFixed(3) }, `裂项：1/(k(k+2)) = (1/2)(1/k − 1/(k+2))，相消得 ${ans.toFixed(3)}。`);
      } else if (type === 7) {
        const a1 = rnd(1, 6), d = rnd(1, 4), nn = rnd(3, 10);
        const sn = nn * a1 + nn * (nn - 1) * d / 2;
        o = opts(sn, () => sn + nn, () => sn - nn, () => a1 * nn);
        q = G("gen.seqsum.uq7", { v1: a1, v2: d, v3: nn, v4: nn }, `等差数列首项 ${a1}，公差 ${d}，前 ${nn} 项和 S_${nn} = ？`);
        exp = G("gen.seqsum.ue7", { v1: sn }, `S_n = na₁ + n(n−1)d/2 = ${sn}。`);
      } else if (type === 8) {
        const a1 = rnd(1, 3), qv = rnd(2, 4), nn = rnd(2, 6);
        const sn = a1 * (Math.pow(qv, nn) - 1) / (qv - 1);
        o = opts(sn, () => sn + a1, () => sn - a1, () => a1 * nn);
        q = G("gen.seqsum.uq8", { v1: a1, v2: qv, v3: nn, v4: nn }, `等比数列首项 ${a1}，公比 ${qv}，前 ${nn} 项和 S_${nn} = ？`);
        exp = G("gen.seqsum.ue8", { v1: sn }, `S_n = a₁(q^n − 1)/(q − 1) = ${sn}。`);
      } else {
        const nn = rnd(2, 12);
        const v = nn * (nn + 1) * (2 * nn + 1) / 6;
        o = opts(v, () => nn * (nn + 1) / 2, () => v + nn, () => nn * nn * nn);
        q = G("gen.seqsum.uq9", { v1: nn }, `平方和：1² + 2² + ... + ${nn}² = ？`);
        exp = G("gen.seqsum.ue9", { v1: nn, v2: nn + 1, v3: 2 * nn + 1, v4: v }, `平方和公式 n(n+1)(2n+1)/6 = ${nn}×${nn + 1}×${2 * nn + 1}/6 = ${v}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.seqsum.pt0", null, "数列求和技巧")));
    }
    return results;
  }

  /* ============================================================
   * 8. 平面向量（十一年级）
   * ============================================================ */
  function qVector(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, ans, o, exp;
      if (type === 0) {
        // 向量加法
        const ax = rnd(1, 5), ay = rnd(1, 5);
        const bx = rnd(1, 5), by = rnd(1, 5);
        const sx = ax + bx, sy = ay + by;
        o = opts(`(${sx},${sy})`, () => `(${sx + 1},${sy})`, () => `(${ax},${by})`, () => `(${bx},${ay})`);
        q = G("gen.vector.0q", { v1: ax, v2: ay, v3: bx, v4: by }, `向量 a=(${ax},${ay}), b=(${bx},${by})，a+b=？`);
        exp = G("gen.vector.1e", { v1: ax, v2: bx, v3: ay, v4: by, v5: sx, v6: sy }, `向量加法：(a₁+b₁, a₂+b₂) = (${ax}+${bx}, ${ay}+${by}) = (${sx},${sy})。`);
      } else if (type === 1) {
        // 向量减法
        const ax = rnd(2, 6), ay = rnd(2, 6);
        const bx = rnd(1, 4), by = rnd(1, 4);
        const dx = ax - bx, dy = ay - by;
        o = opts(`(${dx},${dy})`, () => `(${dx + 1},${dy})`, () => `(${ax + bx},${ay + by})`, () => `(${bx - ax},${by - ay})`);
        q = G("gen.vector.2q", { v1: ax, v2: ay, v3: bx, v4: by }, `向量 a=(${ax},${ay}), b=(${bx},${by})，a−b=？`);
        exp = G("gen.vector.3e", { v1: ax, v2: bx, v3: ay, v4: by, v5: dx, v6: dy }, `向量减法：(a₁−b₁, a₂−b₂) = (${ax}−${bx}, ${ay}−${by}) = (${dx},${dy})。`);
      } else if (type === 2) {
        // 数量积
        const ax = rnd(1, 5), ay = rnd(1, 5);
        const bx = rnd(1, 5), by = rnd(1, 5);
        const dot = ax * bx + ay * by;
        o = opts(dot, () => dot + 1, () => dot - 1, () => ax * bx);
        q = G("gen.vector.4q", { v1: ax, v2: ay, v3: bx, v4: by }, `向量 a=(${ax},${ay}), b=(${bx},${by})，a·b=？`);
        exp = G("gen.vector.5e", { v1: ax, v2: bx, v3: ay, v4: by, v5: dot }, `数量积：a·b = a₁b₁ + a₂b₂ = ${ax}×${bx} + ${ay}×${by} = ${dot}。`);
      } else {
        // 向量共线
        const k = rnd(2, 4);
        const ax = rnd(1, 3), ay = ax * k;
        const bx = rnd(1, 3);
        const by = bx * k;
        o = opts(G("gen.vector.o0", null, "共线"), () => G("gen.vector.o1", null, "不共线"), () => G("gen.vector.o2", null, "垂直"), () => G("gen.vector.o3", null, "无法判断"));
        q = G("gen.vector.6q", { v1: ax, v2: ay, v3: bx, v4: by }, `向量 a=(${ax},${ay}), b=(${bx},${by})，它们的关系是？`);
        exp = G("gen.vector.7e", { v1: k }, `a = ${k} × b，两向量共线。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.vector.pt0", null, "平面向量")));
    }
    return results;
  }

  /* ============================================================
   * 9. 立体几何（十一年级）
   * ============================================================ */
  function qSolid(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const nn = rnd(3, 8);
        o = opts(2 * nn + G("gen.solid.uo0", null, "个"), () => (2 * nn + 2) + G("gen.solid.uo1", null, "个"), () => (3 * nn) + G("gen.solid.uo2", null, "个"), () => G("gen.solid.uo3", null, "8个"));
        q = G("gen.solid.uq0", { v1: nn, v2: nn }, `${nn} 棱柱（底面为 ${nn} 边形）的顶点个数是？`);
        exp = G("gen.solid.ue0", { v1: nn, v2: nn, v3: 2 * nn }, `棱柱上下底各 ${nn} 个顶点，共 2${nn} = ${2 * nn} 个。`);
      } else if (type === 1) {
        const nn = rnd(3, 8);
        o = opts(nn + G("gen.solid.uo4", null, "个"), () => (nn + 1) + G("gen.solid.uo5", null, "个"), () => (2 * nn) + G("gen.solid.uo6", null, "个"), () => G("gen.solid.uo7", null, "3个"));
        q = G("gen.solid.uq1", { v1: nn, v2: nn }, `${nn} 棱锥（底面为 ${nn} 边形）的侧面个数是？`);
        exp = G("gen.solid.ue1", { v1: nn, v2: nn }, `${nn} 棱锥有 ${nn} 个侧面（每个底边对应一个）。`);
      } else if (type === 2) {
        const nn = rnd(3, 8);
        o = opts(3 * nn + G("gen.solid.uo8", null, "条"), () => (2 * nn) + G("gen.solid.uo9", null, "条"), () => nn + G("gen.solid.uo10", null, "条"), () => G("gen.solid.uo11", null, "12条"));
        q = G("gen.solid.uq2", { v1: nn }, `${nn} 棱柱的棱的条数是？`);
        exp = G("gen.solid.ue2", { v1: nn, v2: nn, v3: nn }, `棱柱有 3${nn} 条棱（侧棱 ${nn} + 上下底各 ${nn}）。`);
      } else if (type === 3) {
        const a = rnd(2, 13);
        o = opts(6 * a * a, () => 4 * a * a, () => a * a * a, () => 12 * a);
        q = G("gen.solid.uq3", { v1: a }, `棱长为 ${a} 的正方体的表面积是？`);
        exp = G("gen.solid.ue3", { v1: a, v2: 6 * a * a }, `正方体 6 个面，表面积 = 6a² = 6×${a}² = ${6 * a * a}。`);
      } else if (type === 4) {
        const a = rnd(2, 13);
        o = opts(a * a * a, () => 6 * a * a, () => 12 * a, () => a * a);
        q = G("gen.solid.uq4", { v1: a }, `棱长为 ${a} 的正方体的体积是？`);
        exp = G("gen.solid.ue4", { v1: a * a * a }, `正方体体积 = a³ = ${a * a * a}。`);
      } else if (type === 5) {
        const r = rnd(2, 13), h = rnd(2, 13);
        const v = Math.PI * r * r * h;
        o = opts(v.toFixed(1), () => (2 * Math.PI * r * h).toFixed(1), () => (Math.PI * r * r).toFixed(1), () => (Math.PI * r * r * h / 3).toFixed(1));
        q = G("gen.solid.uq5", { v1: r, v2: h }, `底面半径 ${r}、高 ${h} 的圆柱体积是？`);
        exp = G("gen.solid.ue5", { v1: r, v2: h, v3: v.toFixed(1) }, `圆柱体积 V = πr²h = π×${r}²×${h} ≈ ${v.toFixed(1)}。`);
      } else if (type === 6) {
        const r = rnd(2, 8);
        o = opts(4 * Math.PI * r * r, () => 2 * Math.PI * r * r, () => Math.PI * r * r, () => 4 * Math.PI * r);
        q = G("gen.solid.uq6", { v1: r }, `半径 r = ${r} 的球的表面积是？`);
        exp = G("gen.solid.ue6", { v1: r, v2: 4 * Math.PI * r * r }, `球表面积 S = 4πr² = 4π·${r}² = ${4 * Math.PI * r * r}。`);
      } else if (type === 7) {
        const r = rnd(2, 7);
        const v = 4 / 3 * Math.PI * r * r * r;
        o = opts(v.toFixed(1), () => (Math.PI * r * r * r).toFixed(1), () => (4 * Math.PI * r).toFixed(1), () => (4 / 3 * Math.PI * r * r).toFixed(1));
        q = G("gen.solid.uq7", { v1: r }, `半径 r = ${r} 的球的体积是？`);
        exp = G("gen.solid.ue7", { v1: v.toFixed(1) }, `球体积 V = 4πr³/3 ≈ ${v.toFixed(1)}。`);
      } else if (type === 8) {
        const r = rnd(2, 7), h = rnd(3, 9);
        const s = 2 * Math.PI * r * h;
        o = opts(s, () => 2 * Math.PI * r * r, () => Math.PI * r * r * h, () => 2 * Math.PI * r);
        q = G("gen.solid.uq8", { v1: r, v2: h }, `底面半径 ${r}、高 ${h} 的圆柱侧面积是？`);
        exp = G("gen.solid.ue8", { v1: r, v2: h, v3: s }, `圆柱侧面积 S_侧 = 2πrh = 2π·${r}·${h} = ${s}。`);
      } else {
        const s = rnd(3, 9), h = rnd(2, 8);
        const v = s * h / 3;
        o = opts(v, () => s * h, () => s * h / 2, () => s + h);
        q = G("gen.solid.uq9", { v1: s, v2: h }, `底面积 ${s}、高 ${h} 的棱锥体积是？`);
        exp = G("gen.solid.ue9", { v1: s, v2: h, v3: v }, `棱锥体积 V = 1/3·Sh = ${s}×${h}/3 = ${v}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.solid.pt0", null, "立体几何")));
    }
    return results;
  }

  /* ============================================================
   * 10. 空间向量建系（十一年级）
   * ============================================================ */
  function qSolidAxis(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 3;
      let q, ans, o, exp;
      if (type === 0) {
        // 坐标计算
        const x = rnd(1, 5), y = rnd(1, 5), z = rnd(1, 5);
        o = opts(`(${x},${y},${z})`, () => `(${x},${z},${y})`, () => `(${y},${x},${z})`, () => `(-${x},-${y},-${z})`);
        q = G("gen.solid_axis.0q", { v1: x, v2: y, v3: z }, `空间点 P 的坐标为 (${x}, ${y}, ${z})，其坐标表示是？`);
        exp = G("gen.solid_axis.1e", null, `空间直角坐标系中，点 P 的坐标为 (x, y, z)。`);
      } else if (type === 1) {
        // 向量坐标
        const ax = rnd(1, 5), ay = rnd(1, 5), az = rnd(1, 5);
        const bx = rnd(1, 5), by = rnd(1, 5), bz = rnd(1, 5);
        const dx = ax - bx, dy = ay - by, dz = az - bz;
        o = opts(`(${dx},${dy},${dz})`, () => `(${dx + 1},${dy},${dz})`, () => `(${ax + bx},${ay + by},${az + bz})`, () => `(${bx - ax},${by - ay},${bz - az})`);
        q = G("gen.solid_axis.2q", { v1: ax, v2: ay, v3: az, v4: bx, v5: by, v6: bz }, `向量 a=(${ax},${ay},${az}), b=(${bx},${by},${bz})，a−b=？`);
        exp = G("gen.solid_axis.3e", { v1: dx, v2: dy, v3: dz }, `向量减法：(a₁−b₁, a₂−b₂, a₃−b₃) = (${dx},${dy},${dz})。`);
      } else {
        // 法向量
        o = opts("(0,0,1)", () => "(1,0,0)", () => "(0,1,0)", () => "(1,1,1)");
        q = G("gen.solid_axis.4q", null, `平面 xOy 的法向量是？`);
        exp = G("gen.solid_axis.5e", null, `xOy 平面的法向量垂直于该平面，可取 (0, 0, 1)。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.solid_axis.pt0", null, "空间向量建系")));
    }
    return results;
  }

  /* ============================================================
   * 11. 空间角与距离（十一年级）
   * ============================================================ */
  function qSolidAngle(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const m = rnd(1, 12);
        o = opts(G("gen.solid_angle.uo0", null, "锐角或直角（(0°,90°]）"), () => G("gen.solid_angle.uo1", null, "钝角"), () => G("gen.solid_angle.uo2", null, "平角"), () => G("gen.solid_angle.uo3", null, "无法确定"));
        q = G("gen.solid_angle.uq0", { v1: m }, `（情形 ${m}）空间中异面直线所成角的范围是？`);
        exp = G("gen.solid_angle.ue0", null, `异面直线所成角范围：(0°, 90°]，即锐角或直角。`);
      } else if (type === 1) {
        const m = rnd(1, 12);
        o = opts(G("gen.solid_angle.uo4", null, "直线与其在平面内投影的夹角"), () => G("gen.solid_angle.uo5", null, "直线与面内任意直线的夹角"), () => G("gen.solid_angle.uo6", null, "两平面的夹角"), () => G("gen.solid_angle.uo7", null, "直线与法向量的夹角"));
        q = G("gen.solid_angle.uq1", { v1: m }, `（情形 ${m}）直线与平面所成角是指？`);
        exp = G("gen.solid_angle.ue1", null, `线面角是直线与其在平面内投影的夹角，范围 [0°, 90°]。`);
      } else if (type === 2) {
        const m = rnd(1, 12);
        o = opts(G("gen.solid_angle.uo8", null, "两平面交线上一点分别在两平面内作交线垂线所成的角"), () => G("gen.solid_angle.uo9", null, "两平面内任意两直线夹角"), () => G("gen.solid_angle.uo10", null, "两平面法向量夹角"), () => G("gen.solid_angle.uo11", null, "两平面平行线夹角"));
        q = G("gen.solid_angle.uq2", { v1: m }, `（情形 ${m}）二面角的平面角是指？`);
        exp = G("gen.solid_angle.ue2", null, `二面角的平面角由交线上一点分别在两平面内作交线的垂线所成的角。`);
      } else if (type === 3) {
        const a = rnd(1, 12), b = rnd(1, 12);
        o = opts("90°", () => "0°", () => "45°", () => "180°");
        q = G("gen.solid_angle.uq3", { v1: a, v2: b }, `空间向量 u=(${a},0,0)、v=(0,${b},0) 的夹角是？`);
        exp = G("gen.solid_angle.ue3", null, `u·v=0 → 夹角 90°。`);
      } else if (type === 4) {
        const a = rnd(1, 12);
        o = opts("45°", () => "90°", () => "0°", () => "60°");
        q = G("gen.solid_angle.uq4", { v1: a, v2: a, v3: a }, `空间向量 u=(${a},${a},0)、v=(${a},0,0) 的夹角是？`);
        exp = G("gen.solid_angle.ue4", { v1: a, v2: 2 * a * a, v3: a }, `cosθ = ${a}²/(√(${2 * a * a})·${a}) = 1/√2 → θ=45°。`);
      } else if (type === 5) {
        const a = rnd(1, 12);
        o = opts("180°", () => "0°", () => "90°", () => "60°");
        q = G("gen.solid_angle.uq5", { v1: a, v2: a }, `空间向量 u=(${a},0,0)、v=(−${a},0,0) 的夹角是？`);
        exp = G("gen.solid_angle.ue5", null, `反向共线，夹角 180°。`);
      } else if (type === 6) {
        const a = rnd(1, 12);
        o = opts("0°", () => "90°", () => "45°", () => "180°");
        q = G("gen.solid_angle.uq6", { v1: a, v2: a, v3: a, v4: a }, `空间向量 u=(${a},${a},0)、v=(${a},${a},0) 的夹角是？`);
        exp = G("gen.solid_angle.ue6", null, `两向量相同，夹角 0°。`);
      } else if (type === 7) {
        const a = rnd(1, 12);
        o = opts(G("gen.solid_angle.uo12", null, "线面角为 90°（垂直）"), () => G("gen.solid_angle.uo13", null, "线面角为 0°（平行或在平面内）"), () => "45°", () => "60°");
        q = G("gen.solid_angle.uq7", { v1: a }, `直线方向向量 s=(0,0,${a})，平面 xOy（法向量 (0,0,1)），则线面角是？`);
        exp = G("gen.solid_angle.ue7", null, `s 与法向量平行，直线垂直于平面，线面角 90°。`);
      } else if (type === 8) {
        const a = rnd(1, 6);
        o = opts(G("gen.solid_angle.uo14", null, "线面角为 0°"), () => G("gen.solid_angle.uo15", null, "线面角 90°"), () => "45°", () => "60°");
        q = G("gen.solid_angle.uq8", { v1: a }, `直线方向向量 s=(${a},0,0)，平面 xOy（法向量 (0,0,1)），则线面角是？`);
        exp = G("gen.solid_angle.ue8", null, `s 平行于平面，线面角 0°（直线平行于平面或在平面内）。`);
      } else {
        const d1 = rnd(1, 6), d2 = rnd(7, 12), a = rnd(1, 5);
        const dist = Math.abs(d1 - d2) / Math.sqrt(3 * a * a);
        o = opts(dist.toFixed(2), () => (Math.abs(d1 - d2)).toFixed(2), () => (d1 + d2).toFixed(2), () => (Math.abs(d1 - d2) / a).toFixed(2));
        q = G("gen.solid_angle.uq9", { v1: a, v2: a, v3: a, v4: d1, v5: a, v6: a, v7: a, v8: d2 }, `平行平面 ${a}x+${a}y+${a}z+${d1}=0 与 ${a}x+${a}y+${a}z+${d2}=0 的距离是？`);
        exp = G("gen.solid_angle.ue9", { v1: d1, v2: d2, v3: a, v4: a, v5: a, v6: Math.abs(d1 - d2), v7: 3 * a * a, v8: dist.toFixed(2) }, `距离 = |${d1}−${d2}|/√(${a}²+${a}²+${a}²) = ${Math.abs(d1 - d2)}/√${3 * a * a} = ${dist.toFixed(2)}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.solid_angle.pt0", null, "空间角与距离")));
    }
    return results;
  }

  /* ============================================================
   * 12. 导数与单调性（十二年级）
   * ============================================================ */
  function qDerivative(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const nv = rnd(2, 12);
        o = opts(`${nv}x^${nv - 1}`, () => `x^${nv}`, () => `${nv}x^${nv}`, () => `x^${nv - 1}`);
        q = G("gen.derivative.uq0", { v1: nv }, `f(x) = x^${nv} 的导数 f'(x) = ？`);
        exp = G("gen.derivative.ue0", { v1: nv, v2: nv - 1 }, `(x^n)' = n x^(n−1)，故 f'(x) = ${nv}x^${nv - 1}。`);
      } else if (type === 1) {
        const a = rnd(1, 9), b = a + rnd(2, 6);
        o = opts("f'(x) ≥ 0", () => "f'(x) ≤ 0", () => "f(x) > 0", () => "f(x) < 0");
        q = G("gen.derivative.uq1", { v1: a, v2: b }, `函数 f(x) 在区间 (${a}, ${b}) 上单调递增的充要条件是？`);
        exp = G("gen.derivative.ue1", { v1: a, v2: b }, `f 在 (${a},${b}) 单调递增 ⇔ f'(x) ≥ 0（在该区间恒成立，且不恒为 0）。`);
      } else if (type === 2) {
        const t = rnd(1, 12);
        o = opts("f'(x₀) = 0", () => "f(x₀) = 0", () => "f''(x₀) = 0", () => G("gen.derivative.uo0", null, "f(x₀) 最大"));
        q = G("gen.derivative.uq2", { v1: t }, `函数 f(x) 在 x=${t} 处取得极值的必要条件是？`);
        exp = G("gen.derivative.ue2", { v1: t }, `极值点必要条件：f'(${t}) = 0（驻点）。`);
      } else if (type === 3) {
        const x0 = rnd(1, 7), slope = rnd(1, 9);
        const y0 = slope * x0;
        o = opts(`y − ${y0} = ${slope}(x − ${x0})`, () => `y − ${x0} = ${slope}(x − ${y0})`, () => `y = ${slope}x + ${x0}`, () => `y = ${slope}x + ${y0}`);
        q = G("gen.derivative.uq3", { v1: slope, v2: x0, v3: y0 }, `曲线 y = ${slope}x 在点 (${x0}, ${y0}) 处的切线方程是？`);
        exp = G("gen.derivative.ue3", { v1: slope, v2: y0, v3: slope, v4: x0 }, `斜率 k = ${slope}，切线：y − ${y0} = ${slope}(x − ${x0})。`);
      } else if (type === 4) {
        const a = rnd(2, 9);
        o = opts(G("gen.derivative.uo1", { v1: a }, `${a}·e^x`), () => `e^x`, () => G("gen.derivative.uo2", { v1: a }, `${a}·x·e^x`), () => `e^${a}x`);
        q = G("gen.derivative.uq4", { v1: a }, `f(x) = ${a}e^x 的导数是？`);
        exp = G("gen.derivative.ue4", null, `(a e^x)' = a e^x。`);
      } else if (type === 5) {
        const a = rnd(2, 9);
        o = opts(G("gen.derivative.uo3", { v1: a, v2: a }, `${a}·cos(${a}x)`), () => G("gen.derivative.uo4", { v1: a, v2: a }, `${a}·sin(${a}x)`), () => `cos(${a}x)`, () => G("gen.derivative.uo5", { v1: a, v2: a }, `−${a}·sin(${a}x)`));
        q = G("gen.derivative.uq5", { v1: a }, `f(x) = sin(${a}x) 的导数是？`);
        exp = G("gen.derivative.ue5", { v1: a, v2: a, v3: a, v4: a }, `链式法则：f'(x) = cos(${a}x)·${a} = ${a}cos(${a}x)。`);
      } else if (type === 6) {
        const a = rnd(2, 9);
        o = opts("1/x", () => "x", () => "ln x", () => "−1/x");
        q = G("gen.derivative.uq6", { v1: a }, `f(x) = ln(${a}x) 的导数是？`);
        exp = G("gen.derivative.ue6", { v1: a, v2: a }, `(ln ${a}x)' = (ln ${a} + ln x)' = 1/x (x>0)。`);
      } else if (type === 7) {
        const a = rnd(2, 9), b = rnd(1, 6);
        o = opts(`${2 * a}`, () => `${2 * a}x`, () => `${2 * a}x + ${b}`, () => `${a}`);
        q = G("gen.derivative.uq7", { v1: a, v2: b }, `f(x) = ${a}x² + ${b}x 的二阶导数 f''(x) = ？`);
        exp = G("gen.derivative.ue7", { v1: 2 * a, v2: b, v3: 2 * a }, `f' = ${2 * a}x + ${b}，再求导 f'' = ${2 * a}（常数）。`);
      } else if (type === 8) {
        o = opts("u'v + uv'", () => "u'v − uv'", () => "u'v'", () => "uv");
        q = G("gen.derivative.uq8", null, `导数的乘积法则：(uv)' = ？`);
        exp = G("gen.derivative.ue8", null, `(uv)' = u'v + uv'。`);
      } else {
        const c = rnd(1, 4), k = rnd(2, 4);
        o = opts(`${k * c}(${c}x+1)^${k - 1}`, () => `${k}(${c}x+1)^${k - 1}`, () => `${c}(${c}x+1)^${k}`, () => `${k * c}(${c}x)^${k - 1}`);
        q = G("gen.derivative.uq9", { v1: c, v2: k }, `f(x) = (${c}x + 1)^${k} 的导数是？`);
        exp = G("gen.derivative.ue9", { v1: k, v2: c, v3: k - 1, v4: c, v5: k * c, v6: c, v7: k - 1 }, `链式法则：f' = ${k}(${c}x+1)^${k - 1}·${c} = ${k * c}(${c}x+1)^${k - 1}。`);
      }
      results.push(Q(q, o, type < 2 ? "基础" : "进阶", exp, G("gen.derivative.pt0", null, "导数与单调性")));
    }
    return results;
  }

  /* ============================================================
   * 13. 导数与单调性极值（十二年级）
   * ============================================================ */
  function qDerivMon(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const a = rnd(2, 6), nv = rnd(2, 5);
        const coeff = a * nv;
        o = opts(`${coeff}x^${nv - 1}`, () => `${a}x^${nv}`, () => `${coeff}x^${nv}`, () => `${a * nv}x^${nv + 1}`);
        q = G("gen.deriv_mon.uq0", { v1: a, v2: nv }, `f(x) = ${a}x^${nv} 的导数 f'(x) = ？`);
        exp = G("gen.deriv_mon.ue0", { v1: a, v2: nv, v3: nv - 1, v4: coeff, v5: nv - 1 }, `f'(x) = ${a}·${nv}·x^${nv - 1} = ${coeff}x^${nv - 1}。`);
      } else if (type === 1) {
        const a = rnd(1, 9);
        o = opts(G("gen.deriv_mon.uo0", null, "(-∞, 0) 递减，(0, +∞) 递增"), () => G("gen.deriv_mon.uo1", null, "(-∞, 0) 递增，(0, +∞) 递减"), () => G("gen.deriv_mon.uo2", null, "R 上递增"), () => G("gen.deriv_mon.uo3", null, "R 上递减"));
        q = G("gen.deriv_mon.uq1", { v1: a }, `函数 f(x) = ${a}x² (a>0) 的单调区间是？`);
        exp = G("gen.deriv_mon.ue1", { v1: a }, `f'(x) = 2${a}x，x<0 递减，x>0 递增。`);
      } else if (type === 2) {
        const a = rnd(1, 9);
        o = opts(G("gen.deriv_mon.uo4", null, `x = 0 处取极小值`), () => G("gen.deriv_mon.uo5", null, `x = 0 处取极大值`), () => G("gen.deriv_mon.uo6", { v1: a }, `x = ${a} 处取极值`), () => G("gen.deriv_mon.uo7", null, "无极值"));
        q = G("gen.deriv_mon.uq2", { v1: a }, `函数 f(x) = ${a}x² 在 x = 0 处的极值是？`);
        exp = G("gen.deriv_mon.ue2", { v1: a, v2: a }, `f'(x) = 2${a}x，x=0 驻点，f''=2${a}>0，取极小值。`);
      } else if (type === 3) {
        const a = rnd(1, 5), b = rnd(1, 5);
        o = opts(`${a}`, () => `${a} − ${b}`, () => `${a} × ${b}`, () => `${a}`);
        q = G("gen.deriv_mon.uq3", { v1: a, v2: b }, `f(x) = ${a}x + ${b} 的导数 f'(x) = ？`);
        exp = G("gen.deriv_mon.ue3", { v1: a }, `线性函数导数 = 斜率 = ${a}。`);
      } else if (type === 4) {
        const a = rnd(2, 9);
        o = opts(G("gen.deriv_mon.uo8", null, `在 R 上递增`), () => G("gen.deriv_mon.uo9", null, `在 R 上递减`), () => G("gen.deriv_mon.uo10", null, `先增后减`), () => G("gen.deriv_mon.uo11", null, `先减后增`));
        q = G("gen.deriv_mon.uq4", { v1: a > 0 ? '+ ' + a : '− ' + a }, `f(x) = x³ ${a > 0 ? '+ ' + a : '− ' + a}x 的整体单调性？`);
        exp = G("gen.deriv_mon.ue4", { v1: a > 0 ? '+' + a : '− ' + a }, `f'(x) = 3x² ${a > 0 ? '+' + a : '− ' + a} > 0 恒成立，在 R 上递增。`);
      } else if (type === 5) {
        const a = rnd(1, 9);
        o = opts(G("gen.deriv_mon.uo12", { v1: a }, `x = ${a} 处取极小值`), () => G("gen.deriv_mon.uo13", { v1: a }, `x = ${a} 处取极大值`), () => G("gen.deriv_mon.uo14", null, `x = 0 处取极值`), () => G("gen.deriv_mon.uo15", null, "无极值"));
        q = G("gen.deriv_mon.uq5", { v1: a, v2: a }, `f(x) = (x − ${a})² 在 x = ${a} 处的极值是？`);
        exp = G("gen.deriv_mon.ue5", { v1: a, v2: a }, `f'(x) = 2(x−${a})，x=${a} 时 f'=0，两侧由负变正，取极小值。`);
      } else if (type === 6) {
        const x0 = rnd(1, 4), slope = rnd(1, 5);
        const y0 = slope * x0 * x0;
        o = opts(`${2 * slope * x0}`, () => `${slope}`, () => `${2 * slope * x0 + 1}`, () => `${slope * x0}`);
        q = G("gen.deriv_mon.uq6", { v1: slope, v2: x0, v3: y0 }, `曲线 y = ${slope}x² 在点 (${x0}, ${y0}) 处的切线斜率是？`);
        exp = G("gen.deriv_mon.ue6", { v1: slope, v2: x0, v3: slope, v4: x0, v5: 2 * slope * x0 }, `y' = 2·${slope}x，在 x=${x0} 处斜率 = 2·${slope}·${x0} = ${2 * slope * x0}。`);
      } else if (type === 7) {
        const a = rnd(1, 9);
        o = opts(G("gen.deriv_mon.uo16", null, "(-∞, 0) 递减，(0, +∞) 递增"), () => G("gen.deriv_mon.uo17", null, "(0, +∞) 递减"), () => G("gen.deriv_mon.uo18", null, "R 上递增"), () => G("gen.deriv_mon.uo19", null, "R 上递减"));
        q = G("gen.deriv_mon.uq7", { v1: a }, `函数 f(x) = ${a}x² (a>0) 的单调递减区间是？`);
        exp = G("gen.deriv_mon.ue7", { v1: a }, `f'(x)=2${a}x，x<0 时 f'<0，递减区间 (-∞,0)。`);
      } else if (type === 8) {
        const a = rnd(2, 5), b = rnd(1, 4);
        o = opts(`${a * b}x^${b - 1}`, () => `${a}x^${b}`, () => `${a}x^${b - 1}`, () => `${a * b}x^${b}`);
        q = G("gen.deriv_mon.uq8", { v1: a, v2: b }, `f(x) = ${a}x^${b} 的导数是？`);
        exp = G("gen.deriv_mon.ue8", { v1: a, v2: b, v3: b - 1 }, `f'(x) = ${a}·${b}·x^${b - 1}。`);
      } else {
        const a = rnd(1, 5);
        o = opts(`${a}`, () => `${a + 1}`, () => `0`, () => `${a - 1}`);
        q = G("gen.deriv_mon.uq9", { v1: a }, `函数 f(x) = x² + ${a} 的最小值是？`);
        exp = G("gen.deriv_mon.ue9", { v1: a, v2: a }, `x² ≥ 0，f(x) ≥ ${a}，最小值 = ${a}（x=0 处）。`);
      }
      results.push(Q(q, o, type < 2 ? "基础" : "进阶", exp, G("gen.deriv_mon.pt0", null, "导数与单调性极值")));
    }
    return results;
  }

  /* ============================================================
   * 14. 导数与不等式恒成立（十二年级）
   * ============================================================ */
  function qDerivIneq(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const k = rnd(1, 12);
        o = opts(G("gen.deriv_ineq.uo0", null, "对定义域内所有 x 都成立"), () => G("gen.deriv_ineq.uo1", null, "存在某个 x 成立"), () => G("gen.deriv_ineq.uo2", null, "仅 x=0 成立"), () => G("gen.deriv_ineq.uo3", null, "仅 x>0 成立"));
        q = G("gen.deriv_ineq.uq0", { v1: k }, `不等式 f(x) ≥ ${k} 在定义域内“恒成立”的含义是？`);
        exp = G("gen.deriv_ineq.ue0", { v1: k }, `恒成立指对定义域内每一个 x 都满足 f(x) ≥ ${k}。`);
      } else if (type === 1) {
        const a = rnd(1, 12);
        o = opts(G("gen.deriv_ineq.uo4", { v1: a }, `最小值 −${a}`), () => G("gen.deriv_ineq.uo5", { v1: a }, `最小值 ${a}`), () => G("gen.deriv_ineq.uo6", { v1: a }, `最大值 −${a}`), () => G("gen.deriv_ineq.uo7", { v1: a }, `最大值 ${a}`));
        q = G("gen.deriv_ineq.uq1", { v1: a }, `函数 f(x) = x² − ${a} 的最值情况是？`);
        exp = G("gen.deriv_ineq.ue1", { v1: a, v2: a }, `x² ≥ 0，f(x) ≥ −${a}，最小值为 −${a}（无最大值）。`);
      } else if (type === 2) {
        const b = rnd(2, 12);
        o = opts("a ≥ 0", () => "a > 0", () => "a ≤ 0", () => "a < 0");
        q = G("gen.deriv_ineq.uq2", { v1: b }, `函数 f(x) = ax² + ${b}x 在 R 上单调递增，则 a 的取值范围是？`);
        exp = G("gen.deriv_ineq.ue2", { v1: b }, `f'(x) = 2ax + ${b} ≥ 0 恒成立，需 a ≥ 0。`);
      } else if (type === 3) {
        const a = rnd(1, 12);
        o = opts(G("gen.deriv_ineq.uo8", { v1: a }, `最大值 ${a}`), () => G("gen.deriv_ineq.uo9", { v1: a }, `最小值 ${a}`), () => G("gen.deriv_ineq.uo10", { v1: a }, `最大值 −${a}`), () => G("gen.deriv_ineq.uo11", { v1: a }, `最小值 −${a}`));
        q = G("gen.deriv_ineq.uq3", { v1: a }, `函数 f(x) = −x² + ${a} 的最值情况是？`);
        exp = G("gen.deriv_ineq.ue3", { v1: a, v2: a }, `−x² ≤ 0，f(x) ≤ ${a}，最大值为 ${a}（无最小值）。`);
      } else if (type === 4) {
        const a = rnd(1, 9);
        o = opts(G("gen.deriv_ineq.uo12", null, `最小值 0`), () => G("gen.deriv_ineq.uo13", null, `最大值 0`), () => G("gen.deriv_ineq.uo14", { v1: a }, `最小值 ${a}`), () => G("gen.deriv_ineq.uo15", null, `无最值`));
        q = G("gen.deriv_ineq.uq4", { v1: a }, `函数 f(x) = ${a}x² (a > 0) 的最小值是？`);
        exp = G("gen.deriv_ineq.ue4", null, `x² ≥ 0 且 a>0，f(x) ≥ 0，最小值 0（x=0 处）。`);
      } else if (type === 5) {
        const c = rnd(2, 12);
        o = opts("a ≥ 0", () => "a > 0", () => "a ≤ 0", () => "a = 0");
        q = G("gen.deriv_ineq.uq5", { v1: c }, `不等式 a x² + ${c} ≥ 0 对一切实数 x 恒成立，则 a 满足？`);
        exp = G("gen.deriv_ineq.ue5", { v1: c }, `a≥0 时 a x² ≥ 0，整体 ≥ ${c} > 0 恒成立；a<0 时取大 x 不成立，故 a ≥ 0。`);
      } else if (type === 6) {
        const c = rnd(2, 15);
        o = opts(G("gen.deriv_ineq.uo16", { v1: c - 1 }, `最小值 ${c - 1}`), () => G("gen.deriv_ineq.uo17", { v1: c - 1 }, `最大值 ${c - 1}`), () => G("gen.deriv_ineq.uo18", { v1: c }, `最小值 ${c}`), () => G("gen.deriv_ineq.uo19", { v1: c + 1 }, `最小值 ${c + 1}`));
        q = G("gen.deriv_ineq.uq6", { v1: c }, `函数 f(x) = x² − 2x + ${c} 的最小值是？`);
        exp = G("gen.deriv_ineq.ue6", { v1: c, v2: c - 1 }, `配方 f = (x−1)² + (${c}−1)，最小值 = ${c - 1}（x=1 处）。`);
      } else if (type === 7) {
        const a = rnd(2, 12);
        const mx = a * a / 8;
        o = opts(G("gen.deriv_ineq.uo20", { v1: mx }, `最大值 ${mx}`), () => G("gen.deriv_ineq.uo21", { v1: mx }, `最小值 ${mx}`), () => G("gen.deriv_ineq.uo22", { v1: a }, `最大值 ${a}`), () => G("gen.deriv_ineq.uo23", { v1: a * a / 4 }, `最大值 ${a * a / 4}`));
        q = G("gen.deriv_ineq.uq7", { v1: a }, `函数 f(x) = −2x² + ${a}x 的最大值是？`);
        exp = G("gen.deriv_ineq.ue7", { v1: a, v2: a, v3: a, v4: a, v5: a * a / 8 }, `顶点 x = ${a}/4，f_max = −2·(${a}/4)² + ${a}·(${a}/4) = ${a * a / 8}。`);
      } else if (type === 8) {
        const b = rnd(1, 10);
        o = opts(`2${b}x`, () => `${b}x`, () => `${b * b}`, () => `x² + ${b * b}`);
        q = G("gen.deriv_ineq.uq8", { v1: b * b }, `由均值不等式，对任意实数 x 有 x² + ${b * b} ≥ ？`);
        exp = G("gen.deriv_ineq.ue8", { v1: b * b, v2: b, v3: b, v4: b }, `x² + ${b * b} ≥ 2·x·${b} = 2${b}x（当且仅当 x=${b} 取等）。`);
      } else {
        const K = rnd(2, 15);
        o = opts(`m ≤ ${K}`, () => `m ≥ ${K}`, () => `m < ${K}`, () => `m > ${K}`);
        q = G("gen.deriv_ineq.uq9", { v1: K }, `若 f(x) = x² + ${K} ≥ m 对一切实数 x 恒成立，则参数 m 满足？`);
        exp = G("gen.deriv_ineq.ue9", { v1: K, v2: K }, `f(x) 最小值为 ${K}，故需 m ≤ ${K} 才能保证恒成立。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.deriv_ineq.pt0", null, "导数与不等式恒成立")));
    }
    return results;
  }

  /* ============================================================
   * 15. 函数零点与极值点偏移（十二年级）
   * ============================================================ */
  function qFuncZero(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        o = opts(G("gen.func_zero.uo0", null, "f(x) = 0 的实数根"), () => G("gen.func_zero.uo1", null, "f'(x) = 0 的根"), () => G("gen.func_zero.uo2", null, "f''(x) = 0 的根"), () => G("gen.func_zero.uo3", null, "f(x) 的极值点"));
        q = G("gen.func_zero.uq0", null, `函数 f(x) 的零点是？`);
        exp = G("gen.func_zero.ue0", null, `零点即方程 f(x) = 0 的实数根，或图像与 x 轴交点横坐标。`);
      } else if (type === 1) {
        o = opts(G("gen.func_zero.uo4", null, "f(a)·f(b) < 0"), () => G("gen.func_zero.uo5", null, "f(a)·f(b) > 0"), () => "f(a) = f(b)", () => "f'(a) = f'(b)");
        q = G("gen.func_zero.uq1", null, `连续函数 f 在 [a,b] 上有零点的一个充分条件是？`);
        exp = G("gen.func_zero.ue1", null, `零点存在定理：若 f(a)·f(b) < 0，则 (a,b) 内至少有一零点。`);
      } else if (type === 2) {
        o = opts(G("gen.func_zero.uo6", null, "f'(x₀) = 0 且 f''(x₀) ≠ 0"), () => "f(x₀) = 0", () => "f'(x₀) ≠ 0", () => "f''(x₀) = 0");
        q = G("gen.func_zero.uq2", null, `函数 f(x) 在 x₀ 处取得极值的充分条件是？`);
        exp = G("gen.func_zero.ue2", null, `极值充分条件：f'(x₀) = 0 且 f''(x₀) ≠ 0。`);
      } else if (type === 3) {
        const sq = rnd(2, 9);
        o = opts(`±${sq}`, () => `${sq}`, () => `±${sq + 1}`, () => G("gen.func_zero.uo7", null, `无实根`));
        q = G("gen.func_zero.uq3", { v1: sq * sq }, `函数 f(x) = x² − ${sq * sq} 的零点是？`);
        exp = G("gen.func_zero.ue3", { v1: sq * sq, v2: sq }, `x² = ${sq * sq} ⇒ x = ±${sq}。`);
      } else if (type === 4) {
        const b = rnd(2, 9), c = -rnd(1, 9);
        const delta = b * b - 4 * c;
        o = opts(G("gen.func_zero.uo8", null, "两个不等实根"), () => G("gen.func_zero.uo9", null, "两个相等实根"), () => G("gen.func_zero.uo10", null, "无实根"), () => G("gen.func_zero.uo11", null, "一个实根"));
        q = G("gen.func_zero.uq4", { v1: b, v2: c, v3: delta }, `方程 x² + ${b}x ${c} = 0（Δ = ${delta} > 0）根的情况是？`);
        exp = G("gen.func_zero.ue4", { v1: b, v2: c, v3: delta }, `Δ = ${b}² − 4·(${c}) = ${delta} > 0，故有两个不等实根。`);
      } else if (type === 5) {
        o = opts(G("gen.func_zero.uo12", null, "与 x 轴交点个数"), () => G("gen.func_zero.uo13", null, "与 y 轴交点个数"), () => G("gen.func_zero.uo14", null, "极值点个数"), () => G("gen.func_zero.uo15", null, "单调区间个数"));
        q = G("gen.func_zero.uq5", null, `函数零点的个数等于其图像？`);
        exp = G("gen.func_zero.ue5", null, `零点个数 = 图像与 x 轴交点的个数（重根按重数或按交点计）。`);
      } else if (type === 6) {
        const a = rnd(2, 9);
        o = opts(`${a}`, () => `−${a}`, () => `${a * a}`, () => "0");
        q = G("gen.func_zero.uq6", { v1: a * a * a }, `函数 f(x) = x³ − ${a * a * a} 的零点是？`);
        exp = G("gen.func_zero.ue6", { v1: a * a * a, v2: a }, `x³ = ${a * a * a} ⇒ x = ${a}（实数根）。`);
      } else if (type === 7) {
        const b = rnd(2, 9), c = rnd(1, 9);
        const disc = b * b - 4 * c;
        o = opts(disc > 0 ? G("gen.func_zero.uo16", null, "两个零点") : disc === 0 ? G("gen.func_zero.uo17", null, "一个零点") : G("gen.func_zero.uo18", null, "无零点"), () => G("gen.func_zero.uo19", null, "一个零点"), () => G("gen.func_zero.uo20", null, "两个零点"), () => G("gen.func_zero.uo21", null, "无数个"));
        q = G("gen.func_zero.uq7", { v1: b, v2: c }, `二次函数 f(x) = x² − ${b}x + ${c} 的零点个数是？`);
        const dtxt7 = disc > 0 ? G("gen.func_zero.x0", null, "Δ>0 两个零点") : disc === 0 ? G("gen.func_zero.x1", null, "Δ=0 一个零点") : G("gen.func_zero.x2", null, "Δ<0 无实零点");
        exp = G("gen.func_zero.ue7", { v1: b, v2: c, v3: disc, v4: dtxt7 }, `判别式 Δ = ${b}² − 4·${c} = ${disc}，${dtxt7}。`);
      } else if (type === 8) {
        o = opts(G("gen.func_zero.uo22", null, "方程 f(x)=0 的根"), () => G("gen.func_zero.uo23", null, "f'(x)=0 的根"), () => G("gen.func_zero.uo24", null, "f 的极值点"), () => G("gen.func_zero.uo25", null, "f 的最大值点"));
        q = G("gen.func_zero.uq8", null, `用二分法求方程 f(x)=0 的近似根，本质上是求 f 的？`);
        exp = G("gen.func_zero.ue8", null, `二分法在符号变化区间内不断缩小含根区间，求解 f(x)=0 的根（即零点）。`);
      } else {
        const a = rnd(1, 6), b = rnd(1, 6);
        o = opts(`x = ${b}`, () => `x = ${a}`, () => `x = ${b + a}`, () => `x = 0`);
        q = G("gen.func_zero.uq9", { v1: b, v2: b }, `若 f(${b}) = 0，则 x = ${b} 是 f(x) 的？`);
        exp = G("gen.func_zero.ue9", { v1: b, v2: b }, `f(${b})=0 表明 x=${b} 是函数的一个零点（根）。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.func_zero.pt0", null, "函数零点与极值点偏移")));
    }
    return results;
  }

  /* ============================================================
   * 16. 圆锥曲线初步（十二年级）
   * ============================================================ */
  function qConic(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const a = rnd(3, 9), b = rnd(2, a - 1);
        const e = (Math.sqrt(a * a - b * b) / a).toFixed(2);
        o = opts(e, () => (Math.sqrt(a * a + b * b) / a).toFixed(2), () => "1.00", () => (b / a).toFixed(2));
        q = G("gen.conic.uq0", { v1: a * a, v2: b * b }, `椭圆 x²/${a * a} + y²/${b * b} = 1 的离心率 e ≈ ？`);
        exp = G("gen.conic.ue0", { v1: a * a, v2: b * b, v3: e }, `c = √(a²−b²) = √(${a * a}−${b * b})，e = c/a ≈ ${e}。`);
      } else if (type === 1) {
        const a = rnd(2, 6), b = rnd(2, 6);
        const e = (Math.sqrt(a * a + b * b) / a).toFixed(2);
        o = opts(e, () => (Math.sqrt(a * a - b * b) / a).toFixed(2), () => "1.00", () => (b / a).toFixed(2));
        q = G("gen.conic.uq1", { v1: a * a, v2: b * b }, `双曲线 x²/${a * a} − y²/${b * b} = 1 的离心率 e ≈ ？`);
        exp = G("gen.conic.ue1", { v1: a * a, v2: b * b, v3: e }, `c = √(a²+b²) = √(${a * a}+${b * b})，e = c/a ≈ ${e}。`);
      } else if (type === 2) {
        const p = rnd(2, 8);
        o = opts(`(${p / 2}, 0)`, () => `(0, ${p / 2})`, () => `(${p}, 0)`, () => `(−${p / 2}, 0)`);
        q = G("gen.conic.uq2", { v1: 2 * p }, `抛物线 y² = ${2 * p}x 的焦点坐标是？`);
        exp = G("gen.conic.ue2", { v1: p / 2 }, `y² = 2px 焦点为 (p/2, 0) = (${p / 2}, 0)。`);
      } else if (type === 3) {
        o = opts("0 < e < 1", () => "e = 1", () => "e > 1", () => "e = 0");
        q = G("gen.conic.uq3", null, `椭圆的离心率 e 的范围是？`);
        exp = G("gen.conic.ue3", null, `椭圆离心率 0 < e < 1。`);
      } else if (type === 4) {
        o = opts("e > 1", () => "0 < e < 1", () => "e = 1", () => "e = 0");
        q = G("gen.conic.uq4", null, `双曲线的离心率 e 的范围是？`);
        exp = G("gen.conic.ue4", null, `双曲线离心率 e > 1。`);
      } else if (type === 5) {
        const p = rnd(2, 8);
        o = opts(`x = −${p / 2}`, () => `x = ${p / 2}`, () => `y = −${p / 2}`, () => `y = ${p / 2}`);
        q = G("gen.conic.uq5", { v1: 2 * p }, `抛物线 y² = ${2 * p}x 的准线方程是？`);
        exp = G("gen.conic.ue5", { v1: p / 2 }, `y² = 2px 准线 x = −p/2 = −${p / 2}。`);
      } else if (type === 6) {
        const a = rnd(3, 9), b = rnd(2, a - 1);
        const c = Math.round(Math.sqrt(a * a - b * b));
        o = opts(`(±${c}, 0)`, () => `(0, ±${c})`, () => `(±${a}, 0)`, () => `(0, ±${b})`);
        q = G("gen.conic.uq6", { v1: a * a, v2: b * b }, `椭圆 x²/${a * a} + y²/${b * b} = 1 的焦点坐标是？`);
        exp = G("gen.conic.ue6", { v1: a * a, v2: b * b, v3: c, v4: c }, `c = √(${a * a}−${b * b}) = ${c}，焦点在 x 轴：(±${c}, 0)。`);
      } else if (type === 7) {
        const a = rnd(2, 6), b = rnd(2, 6);
        o = opts(`y = ±${b / a}x`, () => `y = ±${a / b}x`, () => `y = ±${b}x`, () => `x = ±${a}y`);
        q = G("gen.conic.uq7", { v1: a * a, v2: b * b }, `双曲线 x²/${a * a} − y²/${b * b} = 1 的渐近线方程是？`);
        exp = G("gen.conic.ue7", { v1: b / a }, `渐近线 y = ±(b/a)x = ±${b / a}x。`);
      } else if (type === 8) {
        const a = rnd(3, 9);
        const bsq = rnd(1, a - 1) * rnd(1, a - 1);
        o = opts(2 * a, () => a, () => a * a, () => 2 * a * a);
        q = G("gen.conic.uq8", { v1: a * a, v2: bsq }, `椭圆 x²/${a * a} + y²/${bsq} = 1 的长轴长（2a）是？`);
        exp = G("gen.conic.ue8", { v1: a, v2: 2 * a }, `长半轴 a = ${a}，长轴长 2a = ${2 * a}。`);
      } else {
        o = opts(G("gen.conic.uo0", null, "到两定点距离之和为常数"), () => G("gen.conic.uo1", null, "到两定点距离之差为常数"), () => G("gen.conic.uo2", null, "到定点与定直线距离相等"), () => G("gen.conic.uo3", null, "到两定点距离之比为常数"));
        q = G("gen.conic.uq9", null, `椭圆的定义是？`);
        exp = G("gen.conic.ue9", null, `椭圆：到两定点（焦点）距离之和为常数（大于焦距）的点的轨迹。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.conic.pt0", null, "圆锥曲线初步")));
    }
    return results;
  }

  /* ============================================================
   * 17. 联立与韦达定理（十二年级）
   * ============================================================ */
  function qConicLink(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 3;
      let q, ans, o, exp;
      if (type === 0) {
        // 韦达定理
        const sum = rnd(1, 10);
        const prod = rnd(1, 10);
        o = opts(`x₁+x₂=${-sum}, x₁x₂=${prod}`, () => `x₁+x₂=${sum}, x₁x₂=${prod}`, () => `x₁+x₂=${-sum}, x₁x₂=${-prod}`, () => `x₁+x₂=${sum}, x₁x₂=${-prod}`);
        q = G("gen.conic_link.0q", { v1: sum, v2: prod }, `方程 x² + ${sum}x + ${prod} = 0 的两根 x₁, x₂，由韦达定理得？`);
        exp = G("gen.conic_link.1e", { v1: sum, v2: prod }, `韦达定理：x₁+x₂ = −b/a = −${sum}，x₁x₂ = c/a = ${prod}。`);
      } else if (type === 1) {
        // 判别式
        const a = 1, b = rnd(2, 6), c = rnd(1, 5);
        const delta = b * b - 4 * a * c;
        o = opts(delta > 0 ? G("gen.conic_link.o0", null, "有两个不等实根") : delta === 0 ? G("gen.conic_link.o1", null, "有两个相等实根") : G("gen.conic_link.o2", null, "无实根"), () => G("gen.conic_link.o3", null, "无法判断"), () => G("gen.conic_link.o4", null, "只有一个实根"), () => G("gen.conic_link.o5", null, "有复数根"));
        q = G("gen.conic_link.2q", { v1: b, v2: c, v3: delta }, `方程 x² + ${b}x + ${c} = 0 的判别式 Δ = ${delta}，根的情况是？`);
        exp = G("gen.conic_link.3e", { v1: b, v2: c, v3: delta, v4: delta > 0 ? ">" : delta === 0 ? "=" : "<", v5: delta > 0 ? "有两个不等实根" : delta === 0 ? "有两个相等实根" : "无实根" }, `Δ = ${b}² − 4×1×${c} = ${delta}，Δ ${delta > 0 ? ">" : delta === 0 ? "=" : "<"} 0，故${delta > 0 ? "有两个不等实根" : delta === 0 ? "有两个相等实根" : "无实根"}。`);
      } else {
        // 弦长公式
        o = opts(G("gen.conic_link.o6", null, "√(1+k²)·|x₁−x₂|"), () => G("gen.conic_link.o7", null, "√(1+k²)·(x₁+x₂)"), () => "|x₁−x₂|", () => G("gen.conic_link.o8", null, "√(1+k²)·√((x₁+x₂)²−4x₁x₂)"));
        q = G("gen.conic_link.4q", null, `直线 y = kx + b 与曲线相交，弦长公式是？`);
        exp = G("gen.conic_link.5e", null, `弦长 = √(1+k²)·|x₁−x₂| = √(1+k²)·√Δ/|a|。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.conic_link.pt0", null, "联立与韦达定理")));
    }
    return results;
  }

  /* ============================================================
   * 18. 弦长·中点·定点定值（十二年级）
   * ============================================================ */
  function qConicChord(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const x1 = rnd(1, 10), x2 = rnd(1, 10);
        const mid = (x1 + x2) / 2;
        o = opts(mid, () => mid + 1, () => mid - 1, () => x1 + x2);
        q = G("gen.conic_chord.0q", { v1: x1, v2: x2 }, `线段两端点横坐标为 ${x1} 和 ${x2}，中点横坐标是？`);
        exp = G("gen.conic_chord.1e", { v1: x1, v2: x2, v3: mid }, `中点横坐标 = (${x1} + ${x2}) / 2 = ${mid}。`);
      } else if (type === 1) {
        const a = 1, b = rnd(2, 12), c = rnd(1, 9);
        const delta = b * b - 4 * a * c;
        const dist = Math.sqrt(delta) / a;
        o = opts(dist, () => delta, () => Math.sqrt(delta), () => delta / 2);
        q = G("gen.conic_chord.uq0", { v1: b, v2: c }, `方程 x² + ${b}x + ${c} = 0 的两根距离 |x₁−x₂| = ？`);
        exp = G("gen.conic_chord.ue0", { v1: delta, v2: dist }, `|x₁−x₂| = √Δ/|a| = √${delta} / 1 = ${dist}。`);
      } else if (type === 2) {
        const b = rnd(1, 9);
        o = opts(G("gen.conic_chord.uo0", { v1: b }, `直线过定点 (0, ${b})`), () => G("gen.conic_chord.uo1", { v1: b }, `直线过定点 (${b}, 0)`), () => G("gen.conic_chord.uo2", null, `直线过原点`), () => G("gen.conic_chord.uo3", null, `直线不过定点`));
        q = G("gen.conic_chord.uq1", { v1: b }, `直线 y = kx + ${b} (k 为参数) 恒过定点？`);
        exp = G("gen.conic_chord.ue1", { v1: b, v2: b }, `当 x = 0 时 y = ${b}，故直线恒过定点 (0, ${b})。`);
      } else if (type === 3) {
        const x1 = rnd(1, 10), y1 = rnd(1, 10), x2 = rnd(1, 10), y2 = rnd(1, 10);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        o = opts(`(${mx}, ${my})`, () => `(${x1}, ${y1})`, () => `(${x2}, ${y2})`, () => `(${mx}, ${y1})`);
        q = G("gen.conic_chord.uq2", { v1: x1, v2: y1, v3: x2, v4: y2 }, `线段 AB（A(${x1},${y1})、B(${x2},${y2})）的中点坐标是？`);
        exp = G("gen.conic_chord.ue2", { v1: mx, v2: my }, `中点 = ((x₁+x₂)/2, (y₁+y₂)/2) = (${mx}, ${my})。`);
      } else if (type === 4) {
        const a = 1, b = rnd(2, 12), c = rnd(1, 9);
        const s = -b / a;
        o = opts(s, () => s + 1, () => s - 1, () => b);
        q = G("gen.conic_chord.uq3", { v1: b, v2: c }, `方程 x² + ${b}x + ${c} = 0 的两根之和 x₁+x₂ = ？`);
        exp = G("gen.conic_chord.ue3", { v1: b, v2: s }, `韦达定理：x₁+x₂ = −b/a = −${b} = ${s}。`);
      } else if (type === 5) {
        const a = 1, b = rnd(2, 12), c = rnd(1, 9);
        const p = c / a;
        o = opts(p, () => p + 1, () => p - 1, () => b);
        q = G("gen.conic_chord.uq4", { v1: b, v2: c }, `方程 x² + ${b}x + ${c} = 0 的两根之积 x₁x₂ = ？`);
        exp = G("gen.conic_chord.ue4", { v1: c, v2: p }, `韦达定理：x₁x₂ = c/a = ${c} = ${p}。`);
      } else if (type === 6) {
        const a = rnd(1, 5);
        o = opts(G("gen.conic_chord.uo4", { v1: a, v2: a + 1 }, `直线过定点 (${a}, ${a + 1})`), () => G("gen.conic_chord.uo5", { v1: a }, `直线过定点 (0, ${a})`), () => G("gen.conic_chord.uo6", null, `直线过原点`), () => G("gen.conic_chord.uo7", null, `直线不过定点`));
        q = G("gen.conic_chord.uq5", { v1: a + 1, v2: a }, `直线 y − ${a + 1} = k(x − ${a}) (k 为参数) 恒过定点？`);
        exp = G("gen.conic_chord.ue5", { v1: a, v2: a + 1, v3: a, v4: a + 1, v5: a, v6: a + 1 }, `整理 y = k(x−${a}) + ${a + 1}，当 x=${a} 时 y=${a + 1}，过定点 (${a}, ${a + 1})。`);
      } else if (type === 7) {
        const a = rnd(2, 6), b = rnd(1, 5), c = rnd(1, 5);
        const delta = b * b - 4 * a * c;
        const dist = Math.sqrt(Math.max(delta, 0)) / a;
        o = opts(dist, () => (-b / a), () => (c / a), () => Math.sqrt(Math.max(delta, 0)));
        q = G("gen.conic_chord.uq6", { v1: a, v2: b, v3: c, v4: delta }, `方程 ${a}x² + ${b}x + ${c} = 0（Δ=${delta}）的两根距离 |x₁−x₂| = ？`);
        exp = G("gen.conic_chord.ue6", { v1: Math.max(delta, 0), v2: a, v3: dist }, `|x₁−x₂| = √Δ/|a| = √${Math.max(delta, 0)} / ${a} = ${dist}。`);
      } else if (type === 8) {
        const x1 = rnd(1, 12), x2 = rnd(1, 12);
        o = opts(Math.abs(x1 - x2), () => x1 + x2, () => Math.max(x1, x2), () => Math.min(x1, x2));
        q = G("gen.conic_chord.uq7", { v1: x1, v2: x2 }, `两点横坐标 ${x1} 与 ${x2}，它们在 x 轴上的距离是？`);
        exp = G("gen.conic_chord.ue7", { v1: x1, v2: x2, v3: Math.abs(x1 - x2) }, `距离 = |${x1} − ${x2}| = ${Math.abs(x1 - x2)}。`);
      } else {
        const s = rnd(3, 10), p = rnd(1, 9);
        o = opts(`x² − ${s}x + ${p} = 0`, () => `x² + ${s}x + ${p} = 0`, () => `x² − ${s}x − ${p} = 0`, () => `${s}x² + x + ${p} = 0`);
        q = G("gen.conic_chord.uq8", { v1: s, v2: p }, `以 ${s} 为两根之和、${p} 为两根之积的一元二次方程可写为？`);
        exp = G("gen.conic_chord.ue8", { v1: s, v2: p }, `由韦达：x² − (和)x + 积 = 0，即 x² − ${s}x + ${p} = 0。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.conic_chord.pt0", null, "弦长·中点·定点定值")));
    }
    return results;
  }

  /* ============================================================
   * 19. 圆锥曲线性质（十二年级）
   * ============================================================ */
  function qConicProp(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const a = rnd(3, 10), b = rnd(2, a - 1);
        const e = (Math.sqrt(a * a - b * b) / a).toFixed(2);
        o = opts(e, () => (Math.sqrt(a * a + b * b) / a).toFixed(2), () => (b / a).toFixed(2), () => "1.00");
        q = G("gen.conic_prop.uq0", { v1: a * a, v2: b * b }, `椭圆 x²/${a * a} + y²/${b * b} = 1 的离心率 e ≈ ？`);
        exp = G("gen.conic_prop.ue0", { v1: e }, `c = √(a²−b²)，e = c/a ≈ ${e}。`);
      } else if (type === 1) {
        const a = rnd(2, 7), b = rnd(2, 7);
        const e = (Math.sqrt(a * a + b * b) / a).toFixed(2);
        o = opts(e, () => (Math.sqrt(a * a - b * b) / a).toFixed(2), () => (b / a).toFixed(2), () => "1.00");
        q = G("gen.conic_prop.uq1", { v1: a * a, v2: b * b }, `双曲线 x²/${a * a} − y²/${b * b} = 1 的离心率 e ≈ ？`);
        exp = G("gen.conic_prop.ue1", { v1: e }, `c = √(a²+b²)，e = c/a ≈ ${e}。`);
      } else if (type === 2) {
        const p = rnd(2, 10);
        o = opts(`${p}`, () => `${2 * p}`, () => `${p / 2}`, () => `${p * p}`);
        q = G("gen.conic_prop.uq2", { v1: 2 * p }, `抛物线 y² = ${2 * p}x 的焦点到准线的距离是？`);
        exp = G("gen.conic_prop.ue2", { v1: p }, `焦点 (p/2,0)、准线 x=−p/2，距离 = p = ${p}。`);
      } else if (type === 3) {
        const r = rnd(2, 9);
        o = opts(`xx₀ + yy₀ = ${r * r}`, () => `xx₀ − yy₀ = ${r * r}`, () => `x + y = ${r}`, () => `xy = ${r * r}`);
        q = G("gen.conic_prop.uq3", { v1: r * r }, `圆 x² + y² = ${r * r} 在点 (x₀, y₀) 处的切线方程是？`);
        exp = G("gen.conic_prop.ue3", { v1: r * r }, `圆切线：xx₀ + yy₀ = r² = ${r * r}。`);
      } else if (type === 4) {
        const a = rnd(3, 10), b = rnd(2, a - 1);
        const c = Math.round(Math.sqrt(a * a - b * b));
        o = opts(`(±${c}, 0)`, () => `(0, ±${c})`, () => `(±${a}, 0)`, () => `(0, ±${b})`);
        q = G("gen.conic_prop.uq4", { v1: a * a, v2: b * b }, `椭圆 x²/${a * a} + y²/${b * b} = 1 的焦点坐标是？`);
        exp = G("gen.conic_prop.ue4", { v1: a * a, v2: b * b, v3: c, v4: c }, `c = √(${a * a}−${b * b}) = ${c}，焦点 (±${c}, 0)。`);
      } else if (type === 5) {
        const a = rnd(2, 7), b = rnd(2, 7);
        o = opts(`y = ±${b / a}x`, () => `y = ±${a / b}x`, () => `y = ±${b}x`, () => `x = ±${a}y`);
        q = G("gen.conic_prop.uq5", { v1: a * a, v2: b * b }, `双曲线 x²/${a * a} − y²/${b * b} = 1 的渐近线是？`);
        exp = G("gen.conic_prop.ue5", { v1: b / a }, `渐近线 y = ±(b/a)x = ±${b / a}x。`);
      } else if (type === 6) {
        const a = rnd(3, 10), b = rnd(2, a - 1);
        const c = Math.round(Math.sqrt(a * a - b * b));
        o = opts(2 * c, () => c, () => 2 * a, () => a + b);
        q = G("gen.conic_prop.uq6", { v1: a * a, v2: b * b }, `椭圆 x²/${a * a} + y²/${b * b} = 1 的焦距（两焦点距离）是？`);
        exp = G("gen.conic_prop.ue6", { v1: c, v2: 2 * c }, `焦距 = 2c = 2×${c} = ${2 * c}。`);
      } else if (type === 7) {
        const p = rnd(2, 10);
        o = opts(`(${p / 2}, 0)`, () => `(0, ${p / 2})`, () => `(${p}, 0)`, () => `(−${p / 2}, 0)`);
        q = G("gen.conic_prop.uq7", { v1: 2 * p }, `抛物线 y² = ${2 * p}x 的焦点坐标是？`);
        exp = G("gen.conic_prop.ue7", { v1: p / 2 }, `y² = 2px 焦点 (p/2, 0) = (${p / 2}, 0)。`);
      } else if (type === 8) {
        const a = rnd(3, 10), b = rnd(2, a - 1);
        const c = Math.round(Math.sqrt(a * a - b * b));
        o = opts(`x = ±${a * a / c}`, () => `x = ±${c}`, () => `x = ±${a}`, () => `y = ±${a * a / c}`);
        q = G("gen.conic_prop.uq8", { v1: a * a, v2: b * b }, `椭圆 x²/${a * a} + y²/${b * b} = 1 的准线方程是？`);
        exp = G("gen.conic_prop.ue8", { v1: a * a, v2: c }, `准线 x = ±a²/c = ±${a * a}/${c}。`);
      } else {
        const a = rnd(2, 7), b = rnd(2, 7);
        const c = Math.round(Math.sqrt(a * a + b * b));
        o = opts(2 * c, () => c, () => 2 * a, () => a + b);
        q = G("gen.conic_prop.uq9", { v1: a * a, v2: b * b }, `双曲线 x²/${a * a} − y²/${b * b} = 1 的焦距是？`);
        exp = G("gen.conic_prop.ue9", { v1: c, v2: 2 * c }, `焦距 = 2c = 2×${c} = ${2 * c}。`);
      }
      results.push(Q(q, o, type < 2 ? "进阶" : "基础", exp, G("gen.conic_prop.pt0", null, "圆锥曲线性质")));
    }
    return results;
  }

  /* ============================================================
   * 20. 参数方程与极坐标（十二年级）
   * ============================================================ */
  function qParamEq(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const r = rnd(2, 12);
        o = opts(`x² + y² = ${r * r}`, () => `x² − y² = ${r * r}`, () => `y = ${r}x`, () => `x = ${r}`);
        q = G("gen.param_eq.uq0", { v1: r, v2: r }, `参数方程 x = ${r}cosθ, y = ${r}sinθ 消参后是？`);
        exp = G("gen.param_eq.ue0", { v1: r, v2: r, v3: r * r }, `x² + y² = ${r}²cos²θ + ${r}²sin²θ = ${r * r}。`);
      } else if (type === 1) {
        const r = rnd(2, 12);
        o = opts(`x² + y² = ${r * r}`, () => `x² + y² = ${r}`, () => `y = ${r}x`, () => `x = ${r}`);
        q = G("gen.param_eq.uq1", { v1: r }, `极坐标 ρ = ${r} 化为直角坐标方程是？`);
        exp = G("gen.param_eq.ue1", { v1: r, v2: r, v3: r * r }, `ρ = ${r} → x² + y² = ${r}² = ${r * r}，即圆。`);
      } else if (type === 2) {
        const p = rnd(1, 6), q2 = rnd(1, 6);
        o = opts(G("gen.param_eq.uo0", null, "t（或 θ）"), () => "ρ", () => "φ", () => "x");
        q = G("gen.param_eq.uq2", { v1: p, v2: q2 }, `参数方程 x = ${p}t², y = ${q2}t 中的参数通常记作？`);
        exp = G("gen.param_eq.ue2", null, `参数方程中的变量 t（或 θ）称为参数。`);
      } else if (type === 3) {
        const a = rnd(2, 8), b = rnd(2, 8);
        o = opts(`x²/${a * a} + y²/${b * b} = 1`, () => `x²/${a * a} − y²/${b * b} = 1`, () => `y = ${b / a}x`, () => `x² + y² = 1`);
        q = G("gen.param_eq.uq3", { v1: a, v2: b }, `参数方程 x = ${a}cosθ, y = ${b}sinθ 消参后是？`);
        exp = G("gen.param_eq.ue3", { v1: a, v2: b, v3: a * a, v4: b * b }, `cosθ=x/${a}, sinθ=y/${b}，平方和得 x²/${a * a} + y²/${b * b} = 1（椭圆）。`);
      } else if (type === 4) {
        const c = rnd(2, 12);
        o = opts(`y = x/${c}`, () => `y = ${c}x`, () => `x + y = ${c}`, () => `y = ${c}/x`);
        q = G("gen.param_eq.uq4", { v1: c }, `参数方程 x = ${c}t, y = t (t 为参数) 消参后是？`);
        exp = G("gen.param_eq.ue4", { v1: c, v2: c }, `t = y，代入 x = ${c}y → y = x/${c}（直线）。`);
      } else if (type === 5) {
        const a = rnd(2, 12);
        o = opts(`x = ${a}`, () => `y = ${a}`, () => `x² + y² = ${a}`, () => `x = −${a}`);
        q = G("gen.param_eq.uq5", { v1: a }, `极坐标方程 ρcosθ = ${a} 化为直角坐标是？`);
        exp = G("gen.param_eq.ue5", { v1: a }, `ρcosθ = x，故 x = ${a}（一条竖直线）。`);
      } else if (type === 6) {
        const b = rnd(2, 12);
        o = opts(`y = ${b}`, () => `x = ${b}`, () => `y = ${b * b}`, () => `x² + y² = ${b}`);
        q = G("gen.param_eq.uq6", { v1: b }, `极坐标方程 ρsinθ = ${b} 化为直角坐标是？`);
        exp = G("gen.param_eq.ue6", { v1: b }, `ρsinθ = y，故 y = ${b}（一条水平线）。`);
      } else if (type === 7) {
        const a = rnd(1, 9), b = rnd(1, 9);
        o = opts(G("gen.param_eq.uo1", { v1: a, v2: b }, `方向向量 (${a}, ${b})`), () => G("gen.param_eq.uo2", { v1: b, v2: a }, `方向向量 (${b}, ${a})`), () => G("gen.param_eq.uo3", { v1: a, v2: b }, `法向量 (${a}, ${b})`), () => G("gen.param_eq.uo4", { v1: a }, `斜率 ${a}`));
        q = G("gen.param_eq.uq7", { v1: a, v2: b }, `参数方程 x = 1 + ${a}t, y = 2 + ${b}t (t 为参数) 表示直线，其方向向量是？`);
        exp = G("gen.param_eq.ue7", { v1: a, v2: b, v3: a, v4: b }, `参数增加对应 (${a}, ${b})，方向向量为 (${a}, ${b})。`);
      } else if (type === 8) {
        o = opts(`x² + y² = 1`, () => `x² − y² = 1`, () => `x + y = 1`, () => `y = x²`);
        q = G("gen.param_eq.uq8", null, `参数方程 x = cosθ, y = sinθ（θ 为参数）消参后是？`);
        exp = G("gen.param_eq.ue8", null, `cos²θ + sin²θ = 1 → x² + y² = 1（单位圆）。`);
      } else {
        const r = rnd(2, 8);
        const ang = pick([0, 90, 180, 270]);
        const map = { 0: `(${r}, 0)`, 90: `(0, ${r})`, 180: `(−${r}, 0)`, 270: `(0, −${r})` };
        o = opts(map[ang], () => `(${r}, ${r})`, () => `(0, 0)`, () => `(${r}, 1)`);
        q = G("gen.param_eq.uq9", { v1: r, v2: ang }, `极坐标点 (ρ=${r}, θ=${ang}°) 的直角坐标是？`);
        exp = G("gen.param_eq.ue9", { v1: ang, v2: map[ang] }, `x=ρcosθ, y=ρsinθ；θ=${ang}° 时得 ${map[ang]}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.param_eq.pt0", null, "参数方程与极坐标")));
    }
    return results;
  }

  /* ============================================================
   * 21. 复数运算（十年级）
   * ============================================================ */
  function qComplex(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, ans, o, exp;
      if (type === 0) {
        // 复数加法
        const a = rnd(1, 5), b = rnd(1, 5);
        const c = rnd(1, 5), d = rnd(1, 5);
        const real = a + c, imag = b + d;
        o = opts(`${real}+${imag}i`, () => `${real + 1}+${imag}i`, () => `${real}+${imag + 1}i`, () => `${a + c}+${b - d}i`);
        q = G("gen.complex.0q", { v1: a, v2: b, v3: c, v4: d }, `( ${a}+${b}i ) + ( ${c}+${d}i ) = ？`);
        exp = G("gen.complex.1e", { v1: real, v2: imag }, `复数加法：实部加实部，虚部加虚部 = (${real}) + (${imag})i。`);
      } else if (type === 1) {
        // 复数乘法
        const a = rnd(1, 3), b = rnd(1, 3);
        const c = rnd(1, 3), d = rnd(1, 3);
        const real = a * c - b * d;
        const imag = a * d + b * c;
        o = opts(`${real}+${imag}i`, () => `${real + 1}+${imag}i`, () => `${real}+${imag + 1}i`, () => `${a * c}+${b * d}i`);
        q = G("gen.complex.2q", { v1: a, v2: b, v3: c, v4: d }, `( ${a}+${b}i ) · ( ${c}+${d}i ) = ？`);
        exp = G("gen.complex.3e", { v1: real, v2: imag }, `复数乘法：(a+bi)(c+di) = (ac−bd) + (ad+bc)i = ${real} + ${imag}i。`);
      } else if (type === 2) {
        // 共轭复数
        const a = rnd(1, 5), b = rnd(1, 5);
        o = opts(`${a}-${b}i`, () => `${a}+${b}i`, () => `-${a}+${b}i`, () => `-${a}-${b}i`);
        q = G("gen.complex.4q", { v1: a, v2: b }, `复数 z = ${a}+${b}i 的共轭复数是？`);
        exp = G("gen.complex.5e", { v1: a, v2: b }, `共轭复数实部不变，虚部变号：z̄ = ${a} − ${b}i。`);
      } else {
        // 模长
        const a = rnd(3, 5), b = rnd(3, 5);
        const mod = Math.sqrt(a * a + b * b);
        o = opts(mod.toFixed(1), () => (mod + 1).toFixed(1), () => (mod - 1).toFixed(1), () => (a + b).toFixed(1));
        q = G("gen.complex.6q", { v1: a, v2: b }, `复数 z = ${a}+${b}i 的模 |z| = ？`);
        exp = G("gen.complex.7e", { v1: a*a, v2: b*b, v3: mod.toFixed(1) }, `|z| = √(a²+b²) = √(${a*a}+${b*b}) = ${mod.toFixed(1)}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.complex.pt0", null, "复数运算")));
    }
    return results;
  }

  /* ============================================================
   * 22. 分布列与期望方差（十二年级）
   * ============================================================ */
  function qDistExp(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const E = rnd(2, 12);
        o = opts(E * 2, () => E + 1, () => E - 1, () => E);
        q = G("gen.dist_exp.uq0", { v1: E }, `随机变量 X 的期望 E(X) = ${E}，则 E(2X) = ？`);
        exp = G("gen.dist_exp.ue0", { v1: E, v2: E * 2 }, `E(2X) = 2E(X) = 2 × ${E} = ${E * 2}。`);
      } else if (type === 1) {
        const D = rnd(1, 8);
        o = opts(D * 4, () => D * 2, () => D / 2, () => D + 1);
        q = G("gen.dist_exp.uq1", { v1: D }, `随机变量 X 的方差 D(X) = ${D}，则 D(2X) = ？`);
        exp = G("gen.dist_exp.ue1", { v1: D, v2: D * 4 }, `D(2X) = 4D(X) = 4 × ${D} = ${D * 4}。`);
      } else if (type === 2) {
        o = opts(G("gen.dist_exp.uo0", null, "所有概率之和为 1"), () => G("gen.dist_exp.uo1", null, "所有概率之和为 0"), () => G("gen.dist_exp.uo2", null, "概率可以为负"), () => G("gen.dist_exp.uo3", null, "概率可以大于 1"));
        q = G("gen.dist_exp.uq2", null, `离散型随机变量分布列的基本性质是？`);
        exp = G("gen.dist_exp.ue2", null, `分布列性质：所有 P(X=xᵢ) ≥ 0，且 ΣP(X=xᵢ) = 1。`);
      } else if (type === 3) {
        o = opts("E(aX+b) = aE(X)+b", () => "E(aX+b) = aE(X)", () => "E(aX+b) = aE(X)+b²", () => "E(aX+b) = E(X)+b");
        q = G("gen.dist_exp.uq3", null, `期望的线性性质是？`);
        exp = G("gen.dist_exp.ue3", null, `E(aX + b) = aE(X) + b。`);
      } else if (type === 4) {
        const E = rnd(1, 8), a = rnd(2, 5), b = rnd(1, 6);
        o = opts(a * E + b, () => a * E, () => E + b, () => a * E - b);
        q = G("gen.dist_exp.uq4", { v1: E, v2: a, v3: b }, `若 E(X) = ${E}，则 E(${a}X + ${b}) = ？`);
        exp = G("gen.dist_exp.ue4", { v1: a, v2: b, v3: a, v4: b, v5: a, v6: E, v7: b, v8: a * E + b }, `E(${a}X+${b}) = ${a}E(X)+${b} = ${a}×${E}+${b} = ${a * E + b}。`);
      } else if (type === 5) {
        const D = rnd(1, 6), a = rnd(2, 5);
        o = opts(a * a * D, () => a * D, () => D, () => a * a + D);
        q = G("gen.dist_exp.uq5", { v1: D, v2: a }, `若 D(X) = ${D}，则 D(${a}X) = ？`);
        exp = G("gen.dist_exp.ue5", { v1: a, v2: a, v3: a * a, v4: D, v5: a * a * D }, `D(${a}X) = ${a}²D(X) = ${a * a}×${D} = ${a * a * D}。`);
      } else if (type === 6) {
        const ex = rnd(2, 8), ey = rnd(1, 7);
        o = opts(ex + ey, () => ex - ey, () => ex * ey, () => Math.max(ex, ey));
        q = G("gen.dist_exp.uq6", { v1: ex, v2: ey }, `若 E(X)=${ex}、E(Y)=${ey}，则 E(X+Y) = ？`);
        exp = G("gen.dist_exp.ue6", { v1: ex, v2: ey, v3: ex + ey }, `期望可加：E(X+Y) = E(X)+E(Y) = ${ex}+${ey} = ${ex + ey}。`);
      } else if (type === 7) {
        const D = rnd(1, 8);
        o = opts(D, () => D + 1, () => D * 2, () => 0);
        q = G("gen.dist_exp.uq7", { v1: D }, `若 D(X) = ${D}，则常数平移后 D(X + 5) = ？`);
        exp = G("gen.dist_exp.ue7", { v1: D }, `方差平移不变：D(X+5) = D(X) = ${D}。`);
      } else if (type === 8) {
        const ex = rnd(2, 8), ex2 = rnd(ex * ex + 1, ex * ex + 20);
        const D = ex2 - ex * ex;
        o = opts(D, () => ex2, () => ex * ex, () => ex2 + ex);
        q = G("gen.dist_exp.uq8", { v1: ex, v2: ex2 }, `若 E(X)=${ex}、E(X²)=${ex2}，则 D(X) = ？`);
        exp = G("gen.dist_exp.ue8", { v1: ex2, v2: ex, v3: D }, `D(X) = E(X²) − [E(X)]² = ${ex2} − ${ex}² = ${D}。`);
      } else {
        const c = rnd(3, 12);
        o = opts(c, () => 0, () => 1, () => c * 2);
        q = G("gen.dist_exp.uq9", { v1: c }, `常数随机变量 X ≡ ${c}，则 E(X) = ？`);
        exp = G("gen.dist_exp.ue9", { v1: c }, `常数的期望等于自身：E(X) = ${c}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.dist_exp.pt0", null, "分布列与期望方差")));
    }
    return results;
  }

  /* ============================================================
   * 23. 二项分布与正态分布（十二年级）
   * ============================================================ */
  function qDistBinom(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, ans, o, exp;
      if (type === 0) {
        const nt = rnd(2, 14);
        o = opts(nt * 0.5, () => nt * 0.5 + 1, () => nt * 0.5 - 1, () => 0.5);
        q = G("gen.dist_binom.uq0", { v1: nt }, `X ~ B(${nt}, 0.5)，E(X) = ？`);
        exp = G("gen.dist_binom.ue0", { v1: nt, v2: nt * 0.5 }, `E(X) = np = ${nt} × 0.5 = ${nt * 0.5}。`);
      } else if (type === 1) {
        const nt = rnd(2, 14);
        o = opts(nt * 0.25, () => nt * 0.25 + 1, () => nt * 0.25 - 1, () => 0.5);
        q = G("gen.dist_binom.uq1", { v1: nt }, `X ~ B(${nt}, 0.5)，D(X) = ？`);
        exp = G("gen.dist_binom.ue1", { v1: nt, v2: nt * 0.25 }, `D(X) = np(1−p) = ${nt} × 0.5 × 0.5 = ${nt * 0.25}。`);
      } else if (type === 2) {
        o = opts(G("gen.dist_binom.uo0", null, "关于 μ 对称"), () => G("gen.dist_binom.uo1", null, "关于 σ 对称"), () => G("gen.dist_binom.uo2", null, "关于 0 对称"), () => G("gen.dist_binom.uo3", null, "无对称性"));
        q = G("gen.dist_binom.uq2", null, `正态分布 N(μ, σ²) 的图像关于？对称`);
        exp = G("gen.dist_binom.ue2", null, `正态曲线关于 μ 对称。`);
      } else if (type === 3) {
        o = opts("μ=0, σ=1", () => "μ=0, σ=0", () => "μ=1, σ=0", () => "μ=1, σ=1");
        q = G("gen.dist_binom.uq3", null, `标准正态分布 N(0,1) 的参数是？`);
        exp = G("gen.dist_binom.ue3", null, `标准正态：μ=0，σ=1。`);
      } else if (type === 4) {
        const nt = rnd(2, 14), p = rnd(1, 9) / 10;
        o = opts((nt * p).toFixed(2), () => (nt * (1 - p)).toFixed(2), () => (p).toFixed(2), () => (nt).toFixed(2));
        q = G("gen.dist_binom.uq4", { v1: nt, v2: p }, `X ~ B(${nt}, ${p})，E(X) = ？`);
        exp = G("gen.dist_binom.ue4", { v1: nt, v2: p, v3: (nt * p).toFixed(2) }, `E(X) = np = ${nt} × ${p} = ${(nt * p).toFixed(2)}。`);
      } else if (type === 5) {
        const nt = rnd(2, 14), p = rnd(1, 9) / 10;
        o = opts((nt * p * (1 - p)).toFixed(2), () => (nt * p).toFixed(2), () => (nt * (1 - p)).toFixed(2), () => (p * (1 - p)).toFixed(2));
        q = G("gen.dist_binom.uq5", { v1: nt, v2: p }, `X ~ B(${nt}, ${p})，D(X) = ？`);
        exp = G("gen.dist_binom.ue5", { v1: nt, v2: p, v3: (1 - p).toFixed(1), v4: (nt * p * (1 - p)).toFixed(2) }, `D(X) = np(1−p) = ${nt} × ${p} × ${(1 - p).toFixed(1)} = ${(nt * p * (1 - p)).toFixed(2)}。`);
      } else if (type === 6) {
        o = opts(G("gen.dist_binom.uo4", null, "约 68.27%"), () => G("gen.dist_binom.uo5", null, "约 95.45%"), () => G("gen.dist_binom.uo6", null, "约 99.74%"), () => G("gen.dist_binom.uo7", null, "约 50%"));
        q = G("gen.dist_binom.uq6", null, `正态分布 N(μ,σ²) 中，落入 [μ−σ, μ+σ] 的概率约为？`);
        exp = G("gen.dist_binom.ue6", null, `3σ 原则：约 68.27%。`);
      } else if (type === 7) {
        o = opts(G("gen.dist_binom.uo8", null, "约 95.45%"), () => G("gen.dist_binom.uo9", null, "约 68.27%"), () => G("gen.dist_binom.uo10", null, "约 99.74%"), () => G("gen.dist_binom.uo11", null, "约 34.13%"));
        q = G("gen.dist_binom.uq7", null, `N(μ,σ²) 中，落入 [μ−2σ, μ+2σ] 的概率约为？`);
        exp = G("gen.dist_binom.ue7", null, `约 95.45%。`);
      } else if (type === 8) {
        const nt = rnd(2, 12), p = rnd(1, 8) / 10;
        o = opts(Math.pow(1 - p, nt).toFixed(3), () => (1 - Math.pow(1 - p, nt)).toFixed(3), () => (nt * p).toFixed(3), () => (p).toFixed(3));
        q = G("gen.dist_binom.uq8", { v1: nt, v2: p }, `X ~ B(${nt}, ${p})，则 P(X = 0) = ？`);
        exp = G("gen.dist_binom.ue8", { v1: nt, v2: nt, v3: nt, v4: Math.pow(1 - p, nt).toFixed(3) }, `P(X=0) = C(${nt},0)p⁰(1−p)^${nt} = (1−p)^${nt} = ${Math.pow(1 - p, nt).toFixed(3)}。`);
      } else {
        const mu = rnd(90, 110), sig = rnd(2, 10);
        o = opts(`[${mu - sig}, ${mu + sig}]`, () => `[${mu - 2 * sig}, ${mu + 2 * sig}]`, () => `[${mu}, ${mu + sig}]`, () => `[${mu - sig}, ${mu}]`);
        q = G("gen.dist_binom.uq9", { v1: mu, v2: sig }, `某指标 X~N(${mu}, ${sig}²)，约 68.27% 的数据落在哪个区间？`);
        exp = G("gen.dist_binom.ue9", { v1: mu - sig, v2: mu + sig }, `[μ−σ, μ+σ] = [${mu - sig}, ${mu + sig}]。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.dist_binom.pt0", null, "二项分布与正态分布")));
    }
    return results;
  }

  /* ============================================================
   * 24. 统计案例（十二年级）
   * ============================================================ */
  function qStatCase(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, ans, o, exp;
      if (type === 0) {
        // 平均数
        const vals = [rnd(60, 100), rnd(60, 100), rnd(60, 100), rnd(60, 100)];
        const avg = Math.round(vals.reduce((a, b) => a + b, 0) / 4);
        o = opts(avg, () => avg + 5, () => avg - 5, () => vals[0]);
        q = G("gen.stat_case.0q", { v1: vals[0], v2: vals[1], v3: vals[2], v4: vals[3] }, `数据 ${vals[0]}, ${vals[1]}, ${vals[2]}, ${vals[3]} 的平均数是？`);
        exp = G("gen.stat_case.1e", { v1: vals[0], v2: vals[1], v3: vals[2], v4: vals[3], v5: avg }, `平均数 = (${vals[0]}+${vals[1]}+${vals[2]}+${vals[3]})/4 = ${avg}。`);
      } else if (type === 1) {
        // 中位数
        const vals = [rnd(10, 50), rnd(51, 90), rnd(91, 130), rnd(131, 170), rnd(171, 200)];
        vals.sort((a, b) => a - b);
        const med = vals[2];
        o = opts(med, () => vals[1], () => vals[3], () => vals[0]);
        q = G("gen.stat_case.2q", { v1: vals.join(', ') }, `数据 ${vals.join(', ')} 的中位数是？`);
        exp = G("gen.stat_case.3e", { v1: med }, `排序后中间值为 ${med}。`);
      } else if (type === 2) {
        // 方差
        const mean = rnd(50, 100);
        const vals = [mean - rnd(5, 20), mean, mean + rnd(5, 20), mean];
        const variance = Math.round(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / 4);
        o = opts(variance, () => variance + 10, () => variance - 10, () => mean);
        q = G("gen.stat_case.4q", { v1: vals.join(', '), v2: mean }, `数据 ${vals.join(', ')}（均值 ${mean}）的方差是？`);
        exp = G("gen.stat_case.5e", { v1: variance }, `方差 = [(v₁−μ)²+...+(v₄−μ)²]/4 = ${variance}。`);
      } else {
        // 频率分布
        o = opts(G("gen.stat_case.o0", null, "各组频率之和为 1"), () => G("gen.stat_case.o1", null, "各组频率之和为 0"), () => G("gen.stat_case.o2", null, "各组频数之和为 1"), () => G("gen.stat_case.o3", null, "频率可以大于 1"));
        q = G("gen.stat_case.6q", null, `频率分布直方图的基本性质是？`);
        exp = G("gen.stat_case.7e", null, `频率分布性质：各组频率之和 = 1，各组频数之和 = 样本容量。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.stat_case.pt0", null, "统计案例")));
    }
    return results;
  }

  /* ============================================================
   * 拓展专题（高中/大学先修）：欧拉公式、泰勒级数、数形结合、
   *       数学归纳法、均值不等式、二项式定理、容斥原理、递推数列
   * ============================================================ */
  function qEuler(n) {
    const results = [];
    const D = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      const a = pick(D);
      const r = a * Math.PI / 180;
      const cv = Math.cos(r), sv = Math.sin(r);
      const f = (x) => (Math.round(x * 100) / 100).toString();
      const a2 = pick(D), r2 = a2 * Math.PI / 180, cv2 = Math.cos(r2), sv2 = Math.sin(r2);
      if (type === 0) {
        o = opts(`${f(cv)}`, () => `${f(sv)}`, () => `${f(-cv)}`, () => `${f(-sv)}`);
        q = G("gen.euler.uq0", { v1: a, v2: a }, `欧拉公式 e^(i·${a}°) 的实部（即 cos ${a}°）是？`);
        exp = G("gen.euler.ue0", { v1: a, v2: a, v3: f(cv) }, `e^(iθ)=cosθ+i·sinθ，θ=${a}° 时实部 = cos ${a}° = ${f(cv)}。`);
      } else if (type === 1) {
        o = opts(`${f(sv)}`, () => `${f(cv)}`, () => `${f(-sv)}`, () => `${f(-cv)}`);
        q = G("gen.euler.uq1", { v1: a, v2: a }, `欧拉公式 e^(i·${a}°) 的虚部（即 sin ${a}°）是？`);
        exp = G("gen.euler.ue1", { v1: a, v2: f(sv) }, `虚部 = sin ${a}° = ${f(sv)}。`);
      } else if (type === 2) {
        o = opts("1", () => `${f(cv)}`, () => `${f(sv)}`, () => `${f(Math.abs(cv) + Math.abs(sv))}`);
        q = G("gen.euler.uq2", { v1: a, v2: a }, `复数 e^(i·${a}°) 的模长 |e^(i·${a}°)| 是？`);
        exp = G("gen.euler.ue2", { v1: a }, `|cosθ+i·sinθ| = √(cos²+sin²) = 1，与 ${a}° 无关。`);
      } else if (type === 3) {
        o = opts(G("gen.euler.uo0", { v1: f(cv), v2: f(sv) }, `${f(cv)} + i·${f(sv)}`), () => G("gen.euler.uo1", { v1: f(sv), v2: f(cv) }, `${f(sv)} + i·${f(cv)}`), () => G("gen.euler.uo2", { v1: f(-cv), v2: f(sv) }, `${f(-cv)} + i·${f(sv)}`), () => G("gen.euler.uo3", { v1: f(cv), v2: f(sv) }, `${f(cv)} − i·${f(sv)}`));
        q = G("gen.euler.uq3", { v1: a }, `把 e^(i·${a}°) 写成 a+bi 形式（实部+虚部 i）？`);
        exp = G("gen.euler.ue3", { v1: a, v2: a, v3: a, v4: f(cv), v5: f(sv) }, `e^(i·${a}°) = cos ${a}° + i·sin ${a}° = ${f(cv)} + i·${f(sv)}。`);
      } else if (type === 4) {
        o = opts(G("gen.euler.uo4", { v1: f(cv), v2: f(sv) }, `${f(cv)} − i·${f(sv)}`), () => G("gen.euler.uo5", { v1: f(cv), v2: f(sv) }, `${f(cv)} + i·${f(sv)}`), () => G("gen.euler.uo6", { v1: f(-cv), v2: f(sv) }, `${f(-cv)} + i·${f(sv)}`), () => G("gen.euler.uo7", { v1: f(cv), v2: f(-sv) }, `${f(cv)} + i·${f(-sv)}`));
        q = G("gen.euler.uq4", { v1: a, v2: a, v3: a }, `e^(−i·${a}°) = cos ${a}° − i·sin ${a}° 等于？`);
        exp = G("gen.euler.ue4", { v1: f(cv), v2: f(sv) }, `取共轭：e^(−iθ)=cosθ−i·sinθ = ${f(cv)} − i·${f(sv)}。`);
      } else if (type === 5) {
        const k = rnd(2, 5);
        const ang = (a * k) % 360;
        o = opts(`${ang}`, () => `${a}`, () => `${a + k}`, () => `${(a * k * k) % 360}`);
        q = G("gen.euler.uq5", { v1: a, v2: k }, `若 z = e^(i·${a}°)，则 z^${k} 的辐角（角度，模 360）是？`);
        exp = G("gen.euler.ue5", { v1: a, v2: k, v3: a * k, v4: ang }, `z^k = e^(i·${a}°·${k})，辐角为 ${a * k}° ≡ ${ang}°（模 360）。`);
      } else if (type === 6) {
        const ang = (a + a2) % 360;
        o = opts(`${ang}`, () => `${a}`, () => `${a2}`, () => `${(a + 360 - a2) % 360}`);
        q = G("gen.euler.uq6", { v1: a, v2: a2 }, `e^(i·${a}°) · e^(i·${a2}°) 的辐角（角度，模 360）是？`);
        exp = G("gen.euler.ue6", { v1: a, v2: a2, v3: a + a2, v4: ang }, `相乘辐角相加：${a}° + ${a2}° = ${a + a2}° ≡ ${ang}°（模 360）。`);
      } else if (type === 7) {
        const diff = (a - a2 + 360) % 360;
        o = opts(`${diff}`, () => `${a}`, () => `${a2}`, () => `${(a + a2) % 360}`);
        q = G("gen.euler.uq7", { v1: a, v2: a2 }, `e^(i·${a}°) / e^(i·${a2}°) 的辐角（角度，取 [0,360)）是？`);
        exp = G("gen.euler.ue7", { v1: a, v2: a2, v3: a - a2, v4: diff }, `相除辐角相减：${a}° − ${a2}° = ${a - a2}°，归一到 [0,360) 为 ${diff}°。`);
      } else if (type === 8) {
        o = opts(G("gen.euler.uo8", { v1: f(cv2), v2: f(sv2) }, `${f(cv2)} + i·${f(sv2)}`), () => G("gen.euler.uo9", { v1: f(cv2), v2: f(sv2) }, `${f(cv2)} − i·${f(sv2)}`), () => G("gen.euler.uo10", { v1: f(-cv2), v2: f(sv2) }, `${f(-cv2)} + i·${f(sv2)}`), () => G("gen.euler.uo11", { v1: f(cv), v2: f(sv) }, `${f(cv)} + i·${f(sv)}`));
        q = G("gen.euler.uq8", { v1: a2 }, `e^(i·${a2}°) 的 a+bi 形式是？`);
        exp = G("gen.euler.ue8", { v1: a2, v2: a2, v3: a2, v4: f(cv2), v5: f(sv2) }, `e^(i·${a2}°) = cos ${a2}° + i·sin ${a2}° = ${f(cv2)} + i·${f(sv2)}。`);
      } else {
        o = opts(`${f(Math.cos(2 * r))}`, () => `${f(cv)}`, () => `${f(sv)}`, () => `${f(Math.cos(r / 2))}`);
        q = G("gen.euler.uq9", { v1: a, v2: 2 * a }, `e^(i·${a}°) 的平方 e^(i·${2 * a}°) 的实部是？`);
        exp = G("gen.euler.ue9", { v1: a, v2: f(Math.cos(2 * r)) }, `e^(i·2θ) 实部 = cos(2θ)，θ=${a}° 时为 ${f(Math.cos(2 * r))}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.euler.pt0", null, "欧拉公式"), "euler_circle"));
    }
    return results;
  }

  function qTaylor(n) {
    const results = [];
    const fact = (m) => { let p = 1; for (let j = 2; j <= m; j++) p *= j; return p; };
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const m = rnd(2, 12), c = rnd(1, 5);
        const ans = `${Math.pow(c, m)}/${fact(m)}`;
        o = opts(ans, () => `1/${fact(m)}`, () => `${Math.pow(c, m - 1)}/${fact(m - 1)}`, () => `${Math.pow(c, m)}`);
        q = G("gen.taylor.uq0", { v1: c, v2: m }, `e^(${c}x) 的麦克劳林展开中 x^${m} 项的系数是？`);
        exp = G("gen.taylor.ue0", { v1: c, v2: c, v3: m, v4: c, v5: m, v6: m, v7: ans }, `e^(${c}x)=Σ (${c}ⁿxⁿ)/n!，x^${m} 系数 = ${c}^${m}/${m}! = ${ans}。`);
      } else if (type === 1) {
        const m = rnd(2, 12), c = rnd(1, 5);
        let ans;
        if (m % 2 === 0) ans = "0";
        else { const sign = ((m - 1) / 2) % 2 === 0 ? "" : "−"; ans = `${sign}${Math.pow(c, m)}/${fact(m)}`; }
        o = opts(ans, () => "0", () => `${c}/${fact(m)}`, () => `${((m - 1) / 2) % 2 === 0 ? "−" : ""}${Math.pow(c, m)}/${fact(m)}`);
        q = G("gen.taylor.uq1", { v1: c, v2: m }, `sin(${c}x) 的麦克劳林展开中 x^${m} 项的系数是？`);
        exp = G("gen.taylor.ue1", { v1: c, v2: m, v3: ans }, `sin x 只含奇次幂；sin(${c}x) 中 x^${m} 系数 = ${ans}。`);
      } else if (type === 2) {
        const m = rnd(2, 12), c = rnd(1, 5);
        let ans;
        if (m % 2 === 1) ans = "0";
        else { const sign = (m / 2) % 2 === 0 ? "" : "−"; ans = `${sign}${Math.pow(c, m)}/${fact(m)}`; }
        o = opts(ans, () => "0", () => `${c}/${fact(m)}`, () => `${(m / 2) % 2 === 0 ? "−" : ""}${Math.pow(c, m)}/${fact(m)}`);
        q = G("gen.taylor.uq2", { v1: c, v2: m }, `cos(${c}x) 的麦克劳林展开中 x^${m} 项的系数是？`);
        exp = G("gen.taylor.ue2", { v1: c, v2: m, v3: ans }, `cos x 只含偶次幂；cos(${c}x) 中 x^${m} 系数 = ${ans}。`);
      } else if (type === 3) {
        const m = rnd(2, 12), c = rnd(1, 5);
        const sign = (m - 1) % 2 === 0 ? "" : "−";
        const ans = `${sign}${Math.pow(c, m)}/${m}`;
        o = opts(ans, () => `${Math.pow(c, m)}/${m}`, () => `${sign}${Math.pow(c, m - 1)}/${m - 1}`, () => `${sign}${Math.pow(c, m)}`);
        q = G("gen.taylor.uq3", { v1: c, v2: m }, `ln(1+${c}x) 的麦克劳林展开中 x^${m} 项的系数是？`);
        exp = G("gen.taylor.ue3", { v1: c, v2: c, v3: m, v4: ans }, `ln(1+${c}x) = Σ (−1)^{n−1} (${c}x)ⁿ/n，x^${m} 系数 = ${ans}。`);
      } else if (type === 4) {
        const m = rnd(2, 12), c = rnd(1, 5);
        const ans = `${Math.pow(c, m)}`;
        o = opts(ans, () => `1`, () => `${Math.pow(c, m - 1)}`, () => `${fact(m)}`);
        q = G("gen.taylor.uq4", { v1: c, v2: m }, `把 1/(1−${c}x) 展开成幂级数，x^${m} 项的系数是？`);
        exp = G("gen.taylor.ue4", { v1: c, v2: c, v3: c, v4: m, v5: c, v6: m, v7: ans }, `等比级数 1/(1−${c}x) = 1 + ${c}x + ${c}²x² + …，x^${m} 系数 = ${c}^${m} = ${ans}。`);
      } else if (type === 5) {
        const mm = rnd(3, 9), k = rnd(1, mm - 1), c = rnd(1, 5);
        let C = 1; for (let j = 0; j < k; j++) C = C * (mm - j) / (j + 1);
        const ans = `${C * Math.pow(c, k)}`;
        o = opts(ans, () => `${C}`, () => `${C + 1}`, () => `${mm}`);
        q = G("gen.taylor.uq5", { v1: c, v2: mm, v3: k }, `(1+${c}x)^${mm} 的二项展开中 x^${k} 项的系数是？`);
        exp = G("gen.taylor.ue5", { v1: mm, v2: k, v3: c, v4: k, v5: C, v6: Math.pow(c, k), v7: ans }, `二项式系数 C(${mm},${k}) · ${c}^${k} = ${C}·${Math.pow(c, k)} = ${ans}。`);
      } else if (type === 6) {
        const m = rnd(2, 12), c = rnd(1, 5);
        const ans = `${Math.pow(-c, m)}`;
        o = opts(ans, () => `${Math.pow(c, m)}`, () => `1`, () => `${Math.pow(c, m - 1)}`);
        q = G("gen.taylor.uq6", { v1: c, v2: m }, `把 1/(1+${c}x) 展开成幂级数，x^${m} 项的系数是？`);
        exp = G("gen.taylor.ue6", { v1: c, v2: c, v3: m, v4: c, v5: m, v6: ans }, `1/(1+${c}x) = Σ (−${c})ⁿxⁿ，x^${m} 系数 = (−${c})^${m} = ${ans}。`);
      } else if (type === 7) {
        const mm = rnd(3, 9), k = rnd(1, mm - 1), c = rnd(1, 5);
        let C = 1; for (let j = 0; j < k; j++) C = C * (mm - j) / (j + 1);
        const sign = (k % 2 === 0) ? "" : "−";
        const ans = `${sign}${C * Math.pow(c, k)}`;
        o = opts(ans, () => `${C * Math.pow(c, k)}`, () => `−${C * Math.pow(c, k)}`, () => `${mm}`);
        q = G("gen.taylor.uq7", { v1: c, v2: mm, v3: k }, `(1−${c}x)^${mm} 的二项展开中 x^${k} 项的系数是？`);
        exp = G("gen.taylor.ue7", { v1: c, v2: mm, v3: c, v4: mm, v5: k, v6: ans }, `(1−${c}x)^${mm} = Σ (−${c})^k C(${mm},k) x^k，x^${k} 系数 = ${ans}。`);
      } else if (type === 8) {
        const m = rnd(2, 12);
        o = opts("1", () => "0", () => `${m}`, () => `${fact(m)}`);
        q = G("gen.taylor.uq8", { v1: m, v2: m }, `函数 f(x)=x^${m} 的麦克劳林展开中 x^${m} 项的系数是？`);
        exp = G("gen.taylor.ue8", { v1: m, v2: m }, `单项式 x^${m} 本身就是其自身的展开，x^${m} 系数 = 1。`);
      } else {
        const m = rnd(2, 12), nn = rnd(1, 12);
        const bad = (nn === m);
        o = opts(bad ? "1" : "0", () => "1", () => `${m}`, () => `${nn}`);
        q = G("gen.taylor.uq9", { v1: m, v2: nn, v3: bad ? "n=m" : "n≠m" }, `函数 f(x)=x^${m} 的麦克劳林展开中 x^${nn} 项（${bad ? "n=m" : "n≠m"}）的系数是？`);
        exp = G("gen.taylor.ue9", { v1: m, v2: nn, v3: m, v4: bad ? "1" : "0" }, `x^${m} 只含一项，当 ${nn} = ${m} 时系数为 1，否则为 0，故为 ${bad ? "1" : "0"}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.taylor.pt0", null, "泰勒级数"), "taylor_graph"));
    }
    return results;
  }

  function qNumShape(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const A = rnd(2, 9);
        o = opts(G("gen.numshape.uo0", { v1: A }, `点 ${A}`), () => G("gen.numshape.uo1", null, "原点"), () => G("gen.numshape.uo2", null, "点 0"), () => G("gen.numshape.uo3", null, "点 x"));
        q = G("gen.numshape.uq0", { v1: A }, `|x − ${A}| 的几何意义是数轴上点 x 到哪里的距离？`);
        exp = G("gen.numshape.ue0", { v1: A, v2: A }, `|x − a| 表示点 x 到点 a 的距离，故 |x−${A}| 是到 ${A} 的距离。`);
      } else if (type === 1) {
        const r = rnd(2, 9), A = r * r;
        o = opts(G("gen.numshape.uo4", { v1: r, v2: r }, `x < −${r} 或 x > ${r}`), () => `−${r} < x < ${r}`, () => `x > ${r}`, () => `x < −${r}`);
        q = G("gen.numshape.uq1", { v1: A }, `用数形结合解不等式 x² − ${A} > 0，解集是？`);
        exp = G("gen.numshape.ue1", { v1: A, v2: A, v3: r, v4: r, v5: r }, `抛物线 y = x² − ${A} 在 x 轴上方时 x² > ${A} = ${r}²，即 x < −${r} 或 x > ${r}。`);
      } else if (type === 2) {
        const p = rnd(1, 6), q2 = rnd(1, 6);
        o = opts(G("gen.numshape.uo5", { v1: p, v2: q2 }, `${p} 和 ${q2}`), () => G("gen.numshape.uo6", { v1: p, v2: q2 }, `${p} 和 −${q2}`), () => G("gen.numshape.uo7", { v1: p, v2: q2 }, `−${p} 和 ${q2}`), () => `${p + q2}`);
        q = G("gen.numshape.uq2", { v1: p + q2, v2: p * q2 }, `函数 f(x) = x² − ${p + q2}x + ${p * q2} 的零点（与 x 轴交点横坐标）是？`);
        exp = G("gen.numshape.ue2", { v1: p + q2, v2: p * q2, v3: p, v4: q2, v5: p, v6: q2 }, `x² − ${p + q2}x + ${p * q2} = (x−${p})(x−${q2}) = 0 → x = ${p} 或 x = ${q2}。`);
      } else if (type === 3) {
        const sx = rnd(1, 6) * (Math.random() < 0.5 ? -1 : 1);
        const sy = rnd(1, 6) * (Math.random() < 0.5 ? -1 : 1);
        let quad;
        if (sx > 0 && sy > 0) quad = G("gen.numshape.uo8", null, "第一象限");
        else if (sx < 0 && sy > 0) quad = G("gen.numshape.uo9", null, "第二象限");
        else if (sx < 0 && sy < 0) quad = G("gen.numshape.uo10", null, "第三象限");
        else quad = G("gen.numshape.uo11", null, "第四象限");
        const sign = s => s > 0 ? G("gen.numshape.x0", null, "正") : G("gen.numshape.x1", null, "负");
        o = opts(quad, () => G("gen.numshape.uo8", null, "第一象限"), () => G("gen.numshape.uo9", null, "第二象限"), () => G("gen.numshape.uo10", null, "第三象限"), () => G("gen.numshape.uo11", null, "第四象限"));
        q = G("gen.numshape.uq3", { v1: sx, v2: sy }, `点 (${sx}, ${sy}) 在平面直角坐标系位于？`);
        exp = G("gen.numshape.ue3", { v1: sign(sx), v2: sign(sy), v3: quad }, `x=${sx > 0 ? "正" : "负"}、y=${sy > 0 ? "正" : "负"}，属于${quad}。`);
      } else if (type === 4) {
        const A = rnd(2, 9);
        o = opts("0", () => `${A}`, () => `−${A}`, () => G("gen.numshape.uo12", null, "不存在"));
        q = G("gen.numshape.uq4", { v1: A }, `用数形结合看函数 y = |x − ${A}| 的最小值是？`);
        exp = G("gen.numshape.ue4", { v1: A }, `V 形图像顶点在 x=${A} 处，最小值为 0。`);
      } else if (type === 5) {
        const A = rnd(1, 9), B = rnd(1, 9);
        const d = Math.abs(A - B);
        o = opts(`${d}`, () => `${A + B}`, () => `${Math.min(A, B)}`, () => `${d + 1}`);
        q = G("gen.numshape.uq5", { v1: A, v2: B }, `数轴上点 ${A} 与点 ${B} 之间的距离是？`);
        exp = G("gen.numshape.ue5", { v1: A, v2: B, v3: d }, `两点距离 = |${A} − ${B}| = ${d}。`);
      } else if (type === 6) {
        const A = rnd(2, 9), R = rnd(2, 8);
        o = opts(`${A - R} < x < ${A + R}`, () => G("gen.numshape.uo13", { v1: A - R, v2: A + R }, `x < ${A - R} 或 x > ${A + R}`), () => `x = ${A}`, () => `x > ${A + R}`);
        q = G("gen.numshape.uq6", { v1: A, v2: R }, `用数形结合解不等式 |x − ${A}| < ${R}，解集是？`);
        exp = G("gen.numshape.ue6", { v1: A, v2: R, v3: R, v4: A, v5: R, v6: A - R, v7: A + R }, `|x−${A}| < ${R} ⇔ −${R} < x−${A} < ${R} ⇔ ${A - R} < x < ${A + R}。`);
      } else if (type === 7) {
        const a = rnd(1, 4) * (Math.random() < 0.5 ? -1 : 1);
        const b = rnd(1, 6), c = rnd(1, 6);
        const dir = a > 0 ? G("gen.numshape.uo15", null, "向上") : G("gen.numshape.uo14", null, "向下");
        o = opts(dir, () => a > 0 ? G("gen.numshape.uo14", null, "向下") : G("gen.numshape.uo15", null, "向上"), () => G("gen.numshape.uo16", null, "向左"), () => G("gen.numshape.uo17", null, "向右"));
        q = G("gen.numshape.uq7", { v1: a, v2: b >= 0 ? "+ " + b + "x" : "− " + (-b) + "x", v3: c >= 0 ? "+ " + c : "− " + (-c) }, `抛物线 y = ${a}x² ${b >= 0 ? "+ " + b + "x" : "− " + (-b) + "x"} ${c >= 0 ? "+ " + c : "− " + (-c)} 的开口朝向是？`);
        exp = G("gen.numshape.ue7", { v1: a, v2: a > 0 ? "> 0" : "< 0", v3: dir }, `二次项系数 a = ${a} ${a > 0 ? "> 0" : "< 0"}，抛物线开口${dir}。`);
      } else if (type === 8) {
        const A = rnd(1, 6), B = rnd(1, 6), R = rnd(2, 6);
        o = opts(`(${A}, ${B})`, () => `(${A}, 0)`, () => `(0, ${B})`, () => `(${A + R}, ${B})`);
        q = G("gen.numshape.uq8", { v1: A, v2: B, v3: R * R }, `圆 (x − ${A})² + (y − ${B})² = ${R * R} 的圆心坐标是？`);
        exp = G("gen.numshape.ue8", { v1: A, v2: B }, `标准圆方程 (x−a)²+(y−b)²=r² 的圆心为 (a,b) = (${A}, ${B})。`);
      } else {
        const A = rnd(1, 9), B = rnd(1, 9);
        o = opts(`${B}`, () => `${A}`, () => `0`, () => `${-B}`);
        q = G("gen.numshape.uq9", { v1: A, v2: B }, `直线 y = ${A}x + ${B} 与 y 轴交点的纵坐标是？`);
        exp = G("gen.numshape.ue9", { v1: B, v2: B }, `令 x=0，得 y = ${B}，故与 y 轴交点纵坐标为 ${B}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.numshape.pt0", null, "数形结合"), "numshape_coord"));
    }
    return results;
  }

  function qInduction(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const N = rnd(1, 12);
        o = opts(G("gen.induction.uo0", { v1: N }, `验证 n = ${N} 时命题成立`), () => G("gen.induction.uo1", null, `令 n → ∞`), () => G("gen.induction.uo2", null, `证明 n = k+1`), () => G("gen.induction.uo3", null, "直接写结论"));
        q = G("gen.induction.uq0", { v1: N }, `用数学归纳法证明命题，第一步（奠基）通常先验证 n = ${N} 时命题成立，这步叫？`);
        exp = G("gen.induction.ue0", { v1: N }, `第一步验证起始值（如 n=${N}）时命题成立，称为奠基步骤。`);
      } else if (type === 1) {
        const k = rnd(1, 12);
        o = opts(G("gen.induction.uo4", { v1: k, v2: k + 1 }, `由 n = ${k} 成立推出 n = ${k + 1} 成立`), () => G("gen.induction.uo5", null, `由 n = 1 推出 n = 2`), () => G("gen.induction.uo6", { v1: k }, `证明 n = ${k} 成立`), () => G("gen.induction.uo7", null, "令 n → ∞"));
        q = G("gen.induction.uq1", { v1: k }, `归纳法第二步（递推）：假设 n = ${k} 时成立，要证明的是？`);
        exp = G("gen.induction.ue1", { v1: k, v2: k + 1 }, `假设 n=${k} 成立，推出 n=${k + 1} 也成立，形成递推链条。`);
      } else if (type === 2) {
        const N = rnd(5, 40);
        const s = N * (N + 1) / 2;
        o = opts(`${s}`, () => `${s + 1}`, () => `${s - 1}`, () => `${N * N}`);
        q = G("gen.induction.uq2", { v1: N }, `由归纳法公式 1 + 2 + … + ${N} = ？`);
        exp = G("gen.induction.ue2", { v1: N, v2: N + 1, v3: s }, `公式 n(n+1)/2，${N}×${N + 1}/2 = ${s}。`);
      } else if (type === 3) {
        const N = rnd(1, 12);
        o = opts(`${Math.pow(2, N + 1) - 1}`, () => `${Math.pow(2, N + 1)}`, () => `${Math.pow(2, N)}`, () => `${Math.pow(2, N) - 1}`);
        q = G("gen.induction.uq3", { v1: N }, `等比数列求和：2⁰ + 2¹ + … + 2^${N} = ？`);
        exp = G("gen.induction.ue3", { v1: N + 1 }, `首项 1、公比 2 的等比和 = 2^${N + 1} − 1。`);
      } else if (type === 4) {
        const N = rnd(2, 25);
        o = opts(`${N * N}`, () => `${N * (N + 1)}`, () => `${N * (N + 1) / 2}`, () => `${2 * N - 1}`);
        q = G("gen.induction.uq4", { v1: N, v2: N }, `前 ${N} 个正奇数之和 1 + 3 + 5 + … + (2·${N} − 1) = ？`);
        exp = G("gen.induction.ue4", { v1: N, v2: N * N }, `前 n 个奇数和 = n²，故为 ${N}² = ${N * N}。`);
      } else if (type === 5) {
        const N = rnd(2, 25);
        o = opts(`${N * (N + 1)}`, () => `${N * N}`, () => `${N * (N + 1) / 2}`, () => `${2 * N}`);
        q = G("gen.induction.uq5", { v1: N, v2: N }, `前 ${N} 个正偶数之和 2 + 4 + … + 2·${N} = ？`);
        exp = G("gen.induction.ue5", { v1: N, v2: N, v3: N * (N + 1) }, `前 n 个偶数和 = n(n+1)，故为 ${N}(${N}+1) = ${N * (N + 1)}。`);
      } else if (type === 6) {
        const N = rnd(2, 40);
        const s = N * (N + 1) * (2 * N + 1) / 6;
        o = opts(`${s}`, () => `${s + 1}`, () => `${N * (N + 1) / 2}`, () => `${N * N}`);
        q = G("gen.induction.uq6", { v1: N }, `平方和公式：1² + 2² + … + ${N}² = ？`);
        exp = G("gen.induction.ue6", { v1: s }, `平方和 = n(n+1)(2n+1)/6，代入得 ${s}。`);
      } else if (type === 7) {
        const k = rnd(1, 12);
        o = opts(G("gen.induction.uo8", { v1: k }, `n = ${k} 时的命题（归纳假设）`), () => G("gen.induction.uo9", null, `n = 1 时`), () => G("gen.induction.uo10", { v1: k + 1 }, `n = ${k + 1} 时`), () => G("gen.induction.uo11", null, "结论本身"));
        q = G("gen.induction.uq7", { v1: k }, `归纳递推中「假设 n = ${k} 时命题成立」这一步中的假设称为？`);
        exp = G("gen.induction.ue7", null, `该假设称为归纳假设，是递推的桥梁。`);
      } else if (type === 8) {
        const N = rnd(2, 5);
        o = opts(G("gen.induction.uo12", null, `所有 n ≥ 1 的正整数`), () => G("gen.induction.uo13", null, `仅 n = 1`), () => G("gen.induction.uo14", { v1: N }, `仅 n ≤ ${N}`), () => G("gen.induction.uo15", null, "所有实数"));
        q = G("gen.induction.uq8", null, `若 P(1) 成立，且「P(k) 成立 ⇒ P(k+1) 成立」，则可推出命题对？成立`);
        exp = G("gen.induction.ue8", null, `由奠基与递推，归纳法可推出对一切正整数 n ≥ 1 成立。`);
      } else {
        const N = rnd(3, 7);
        o = opts(`${N * N}`, () => `${N * (N + 1)}`, () => `${2 * N - 1}`, () => `${N}`);
        q = G("gen.induction.uq9", { v1: N }, `用归纳法可证 1 + 3 + … + (2·${N} − 1) = ？`);
        exp = G("gen.induction.ue9", { v1: N, v2: N, v3: N * N }, `前 ${N} 个奇数和 = ${N}² = ${N * N}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.induction.pt0", null, "数学归纳法"), "induction_steps"));
    }
    return results;
  }

  function qAmGm(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const A = rnd(2, 12);
        const m = (2 * Math.sqrt(A)).toFixed(2);
        o = opts(`${m}`, () => `${(Math.sqrt(A)).toFixed(2)}`, () => `${A}`, () => `${(A + 1).toFixed(2)}`);
        q = G("gen.amgm.uq0", { v1: A }, `x > 0 时，x + ${A}/x 的最小值（用均值不等式）是？`);
        exp = G("gen.amgm.ue0", { v1: A, v2: A, v3: A, v4: m, v5: A }, `x + ${A}/x ≥ 2√(x·${A}/x) = 2√${A} ≈ ${m}，当 x = √${A} 时取等。`);
      } else if (type === 1) {
        const A = rnd(2, 6), B = rnd(2, 6);
        const m = (2 * Math.sqrt(A * B)).toFixed(2);
        o = opts(`${m}`, () => `${(Math.sqrt(A * B)).toFixed(2)}`, () => `${A + B}`, () => `${(A * B).toFixed(2)}`);
        q = G("gen.amgm.uq1", { v1: A, v2: B }, `x > 0 时，${A}x + ${B}/x 的最小值是？`);
        exp = G("gen.amgm.ue1", { v1: A, v2: B, v3: A, v4: B, v5: m }, `${A}x + ${B}/x ≥ 2√(${A}·${B}) ≈ ${m}。`);
      } else if (type === 2) {
        const C = rnd(2, 12);
        const m = (C * C / 4).toFixed(2);
        o = opts(`${m}`, () => `${C}`, () => `${(C * C).toFixed(2)}`, () => `${(C / 2).toFixed(2)}`);
        q = G("gen.amgm.uq2", { v1: C, v2: C }, `正数 x 满足 0 < x < ${C} 时，x(${C} − x) 的最大值是？`);
        exp = G("gen.amgm.ue2", { v1: C, v2: C, v3: m, v4: C }, `x(${C}−x) ≤ (${C}/2)² = ${m}，当 x = ${C}/2 时取等。`);
      } else if (type === 3) {
        const a = rnd(2, 9), b = rnd(2, 9);
        const am = ((a + b) / 2).toFixed(2), gm = (Math.sqrt(a * b)).toFixed(2);
        o = opts(G("gen.amgm.uo0", { v1: am, v2: gm }, `算术平均 ≥ 几何平均 (${am} ≥ ${gm})`), () => G("gen.amgm.uo1", null, `算术平均 < 几何平均`), () => G("gen.amgm.uo2", null, `相等`), () => G("gen.amgm.uo3", null, `无法确定`));
        q = G("gen.amgm.uq3", { v1: a, v2: b }, `对正数 a = ${a}, b = ${b}：比较算术平均 (a+b)/2 与几何平均 √(ab)？`);
        exp = G("gen.amgm.ue3", { v1: am, v2: gm }, `均值不等式：算术平均 ≥ 几何平均，此处 ${am} ≥ ${gm}。`);
      } else if (type === 4) {
        const A = rnd(2, 9), B = rnd(2, 9);
        o = opts(`a = b`, () => `a + b = 0`, () => G("gen.amgm.uo4", null, `任意正数`), () => `a = 0`);
        q = G("gen.amgm.uq4", { v1: A + B }, `正数 a、b 满足 a + b = ${A + B}，则 ab 在何时取最大值？`);
        exp = G("gen.amgm.ue4", { v1: (A + B) / 2 }, `和定积最大：当 a = b = ${(A + B) / 2} 时 ab 最大。`);
      } else if (type === 5) {
        const A = rnd(2, 8);
        const m = (2 * A).toFixed(2);
        o = opts(`${m}`, () => `${A}`, () => `${(A * A).toFixed(2)}`, () => `${(2 * Math.sqrt(A)).toFixed(2)}`);
        q = G("gen.amgm.uq5", { v1: A * A }, `x > 0 时，x² + ${A * A}/x² 的最小值是？`);
        exp = G("gen.amgm.ue5", { v1: A * A, v2: A, v3: m, v4: A * A, v5: A }, `x² + ${A * A}/x² ≥ 2·${A} = ${m}（令 t=x²，t + ${A * A}/t ≥ 2${A}）。`);
      } else if (type === 6) {
        const S = rnd(4, 14);
        const m = (S * S / 4).toFixed(2);
        o = opts(`${m}`, () => `${S}`, () => `${(S * S).toFixed(2)}`, () => `${(S / 2).toFixed(2)}`);
        q = G("gen.amgm.uq6", { v1: S }, `a, b > 0 且 a + b = ${S}，则 ab 的最大值是？`);
        exp = G("gen.amgm.ue6", { v1: S, v2: m }, `和定积最大：ab ≤ (${S}/2)² = ${m}。`);
      } else if (type === 7) {
        const P = rnd(2, 12);
        const m = (2 * Math.sqrt(P)).toFixed(2);
        o = opts(`${m}`, () => `${P}`, () => `${(Math.sqrt(P)).toFixed(2)}`, () => `${(P + 1).toFixed(2)}`);
        q = G("gen.amgm.uq7", { v1: P }, `a, b > 0 且 ab = ${P}，则 a + b 的最小值是？`);
        exp = G("gen.amgm.ue7", { v1: P, v2: m }, `积定和最小：a + b ≥ 2√${P} ≈ ${m}。`);
      } else if (type === 8) {
        o = opts("a = b = c", () => "a + b + c = 0", () => G("gen.amgm.uo5", null, "任意正数"), () => "a = 0");
        q = G("gen.amgm.uq8", null, `三元均值不等式 a + b + c ≥ 3·³√(abc) 等号成立的条件是？`);
        exp = G("gen.amgm.ue8", null, `三元均值不等式等号当且仅当 a = b = c 时成立。`);
      } else {
        const B = rnd(2, 8), C = rnd(1, 9);
        const m = (2 * Math.sqrt(B) + C).toFixed(2);
        o = opts(`${m}`, () => `${(Math.sqrt(B) + C).toFixed(2)}`, () => `${(2 * B + C).toFixed(2)}`, () => `${C}`);
        q = G("gen.amgm.uq9", { v1: B, v2: C }, `x > 0 时，x + ${B}/x + ${C} 的最小值是？`);
        exp = G("gen.amgm.ue9", { v1: B, v2: B, v3: B, v4: C, v5: m }, `x + ${B}/x ≥ 2√${B}，故整体最小值 ≈ 2√${B} + ${C} = ${m}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.amgm.pt0", null, "均值不等式"), "amgm_rect"));
    }
    return results;
  }

  function qBinomial(n) {
    const results = [];
    const comb = (N, K) => { let c = 1; for (let j = 0; j < K; j++) c = c * (N - j) / (j + 1); return c; };
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const N = rnd(2, 9);
        o = opts(`${N + 1}`, () => `${N}`, () => `${2 * N}`, () => `${N - 1}`);
        q = G("gen.binomial.uq0", { v1: N }, `(a + b)^${N} 展开后共有多少项？`);
        exp = G("gen.binomial.ue0", { v1: N, v2: N - 1, v3: N, v4: N, v5: N + 1 }, `从 a^${N}, a^${N - 1}b, … 到 b^${N} 共 ${N} + 1 = ${N + 1} 项。`);
      } else if (type === 1) {
        const N = rnd(3, 8), k = rnd(1, N - 1);
        const c = comb(N, k);
        o = opts(`${c}`, () => `${c + 1}`, () => `${c - 1}`, () => `${N}`);
        q = G("gen.binomial.uq1", { v1: N, v2: N - k, v3: k }, `(a + b)^${N} 展开中 a^${N - k}b^${k} 项的系数是？`);
        exp = G("gen.binomial.ue1", { v1: N, v2: k, v3: c }, `该系数为二项式系数 C(${N},${k}) = ${c}。`);
      } else if (type === 2) {
        const N = rnd(4, 9), k = rnd(2, N - 1);
        const c = comb(N, k);
        o = opts(`${c}`, () => `${c + 1}`, () => `${c - 1}`, () => `${N}`);
        q = G("gen.binomial.uq2", { v1: N, v2: k }, `(1 + x)^${N} 展开式中 x^${k} 项的系数是？`);
        exp = G("gen.binomial.ue2", { v1: k, v2: N, v3: k, v4: c }, `x^${k} 系数 = C(${N},${k}) = ${c}。`);
      } else if (type === 3) {
        const N = rnd(3, 8);
        o = opts("1", () => `${N}`, () => `${N + 1}`, () => "0");
        q = G("gen.binomial.uq3", { v1: N }, `(x + 1)^${N} 展开式的常数项（x⁰ 项）是？`);
        exp = G("gen.binomial.ue3", { v1: N, v2: N, v3: N }, `取 x⁰ 项：C(${N},${N})·x⁰·1^${N} = 1，常数项为 1。`);
      } else if (type === 4) {
        const N = rnd(2, 9);
        o = opts(`2^${N}`, () => `${N}`, () => `${N + 1}`, () => `${2 * N}`);
        q = G("gen.binomial.uq4", { v1: N, v2: N }, `(a + b)^${N} 各项二项式系数（即 C(${N},k) 之和）是？`);
        exp = G("gen.binomial.ue4", { v1: N, v2: N }, `令 a = b = 1，得系数和 = (1+1)^${N} = 2^${N}。`);
      } else if (type === 5) {
        const N = rnd(3, 9);
        o = opts(`2^${N - 1}`, () => `2^${N}`, () => `${N}`, () => `2^${N + 1}`);
        q = G("gen.binomial.uq5", { v1: N }, `(a + b)^${N} 展开中奇数项（第 1,3,5,… 项）二项式系数之和是？`);
        exp = G("gen.binomial.ue5", { v1: N, v2: N, v3: N - 1 }, `(1+1)^${N} 与 (1−1)^${N} 相减/相加可得奇偶项和均为 2^${N - 1}。`);
      } else if (type === 6) {
        const N = rnd(4, 10);
        const mid = N >> 1;
        const c = comb(N, mid);
        o = opts(`${c}`, () => `${c - 1}`, () => `${c + 1}`, () => `${N}`);
        q = G("gen.binomial.uq6", { v1: N }, `(a + b)^${N} 展开中二项式系数最大的那一项系数是？`);
        exp = G("gen.binomial.ue6", { v1: N, v2: mid, v3: c }, `中间项系数最大：C(${N},${mid}) = ${c}。`);
      } else if (type === 7) {
        const N = rnd(3, 8), k = rnd(1, N - 1);
        const c = comb(N, k);
        const sign = (k % 2 === 0) ? "" : "−";
        o = opts(`${sign}${c}`, () => `${c}`, () => `−${c}`, () => `${N}`);
        q = G("gen.binomial.uq7", { v1: N, v2: k }, `(1 − x)^${N} 展开中 x^${k} 项的系数是？`);
        exp = G("gen.binomial.ue7", { v1: N, v2: N, v3: k, v4: sign, v5: c }, `(1−x)^${N} = Σ (−1)^k C(${N},k) x^k，x^${k} 系数 = ${sign}${c}。`);
      } else if (type === 8) {
        const N = rnd(3, 7), k = rnd(1, N - 1);
        const c = comb(N, k);
        const val = c * Math.pow(2, N - k);
        o = opts(`${val}`, () => `${c}`, () => `${c * Math.pow(2, k)}`, () => `${N}`);
        q = G("gen.binomial.uq8", { v1: N, v2: k }, `(x + 2)^${N} 展开中 x^${k} 项的系数是？`);
        exp = G("gen.binomial.ue8", { v1: N, v2: k, v3: k, v4: N - k, v5: c, v6: N - k, v7: val }, `项为 C(${N},${k})·x^${k}·2^${N - k}，系数 = ${c}·2^${N - k} = ${val}。`);
      } else {
        const N = rnd(2, 7);
        o = opts(`${Math.pow(3, N)}`, () => `${Math.pow(2, N)}`, () => `${N}`, () => `${Math.pow(3, N) + 1}`);
        q = G("gen.binomial.uq9", { v1: N }, `(2x + 3)^${N} 展开中的常数项（x⁰ 项）是？`);
        exp = G("gen.binomial.ue9", { v1: N, v2: N, v3: N, v4: N, v5: Math.pow(3, N) }, `x⁰ 项 = C(${N},${N})·(2x)⁰·3^${N} = 3^${N} = ${Math.pow(3, N)}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.binomial.pt0", null, "二项式定理"), "binomial_triangle"));
    }
    return results;
  }

  function qInclusion(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const A = rnd(10, 30), B = rnd(10, 30), I = rnd(1, Math.min(A, B));
        o = opts(`${A + B - I}`, () => `${A + B}`, () => `${I}`, () => `${A + B + I}`);
        q = G("gen.inclusion_hs.uq0", { v1: A, v2: B, v3: I }, `班中 ${A} 人会英语、${B} 人会日语，两种都会的 ${I} 人，至少会一种的有几人？`);
        exp = G("gen.inclusion_hs.ue0", { v1: A, v2: B, v3: I, v4: A + B - I }, `${A} + ${B} − ${I} = ${A + B - I}（人）。容斥：会英 + 会日 − 都会。`);
      } else if (type === 1) {
        const A = rnd(5, 20), B = rnd(5, 20);
        o = opts(`|A| + |B| − |A∩B|`, () => `|A| + |B|`, () => G("gen.inclusion_hs.uo0", null, `|A|·|B|`), () => `|A∩B|`);
        q = G("gen.inclusion_hs.uq1", { v1: A, v2: B }, `集合 A 有 ${A} 个元素、B 有 ${B} 个元素，两集合容斥原理 |A∪B| = ？`);
        exp = G("gen.inclusion_hs.ue1", null, `|A∪B| = |A| + |B| − |A∩B|，减去重复计数的交集。`);
      } else if (type === 2) {
        const A = rnd(5, 15), B = rnd(5, 15), C = rnd(5, 15);
        o = opts(`+ |A∩B∩C|`, () => `0`, () => `− |A∩B∩C|`, () => G("gen.inclusion_hs.uo1", null, `|A|·|B|·|C|`));
        q = G("gen.inclusion_hs.uq2", { v1: A, v2: B, v3: C }, `三集合 A(${A}个)、B(${B}个)、C(${C}个)，|A∪B∪C| = |A|+|B|+|C| − (两两交之和) + ？`);
        exp = G("gen.inclusion_hs.ue2", null, `加回被多减一次的三者交集 |A∩B∩C|。`);
      } else if (type === 3) {
        const N = rnd(50, 120), a = rnd(2, 4), b = rnd(4, 7);
        const cnt = Math.floor(N / a) + Math.floor(N / b) - Math.floor(N / (a * b));
        o = opts(`${cnt}`, () => `${Math.floor(N / a) + Math.floor(N / b)}`, () => `${Math.floor(N / a)}`, () => `${cnt + 1}`);
        q = G("gen.inclusion_hs.uq3", { v1: N, v2: a, v3: b }, `1 到 ${N} 中能被 ${a} 或 ${b} 整除的数共有几个？`);
        exp = G("gen.inclusion_hs.ue3", { v1: a, v2: Math.floor(N / a), v3: b, v4: Math.floor(N / b), v5: a * b, v6: Math.floor(N / (a * b)), v7: cnt }, `被${a}整除 ${Math.floor(N / a)} 个、被${b}整除 ${Math.floor(N / b)} 个、被${a * b}整除 ${Math.floor(N / (a * b))} 个 → 容斥得 ${cnt}。`);
      } else if (type === 4) {
        const N = rnd(50, 120), a = rnd(2, 4), b = rnd(4, 7);
        const cnt = Math.floor(N / a) + Math.floor(N / b) - Math.floor(N / (a * b));
        o = opts(`${N - cnt}`, () => `${cnt}`, () => `${N}`, () => `${N - cnt - 1}`);
        q = G("gen.inclusion_hs.uq4", { v1: N, v2: a, v3: b }, `1 到 ${N} 中既不能被 ${a} 整除也不能被 ${b} 整除的数有几个？`);
        exp = G("gen.inclusion_hs.ue4", { v1: N, v2: a, v3: b, v4: cnt, v5: N - cnt }, `总数 ${N} 减去「能被 ${a} 或 ${b} 整除」的 ${cnt} 个，余 ${N - cnt} 个。`);
      } else if (type === 5) {
        const A = rnd(10, 20), B = rnd(10, 20), C = rnd(10, 20);
        const ab = rnd(1, Math.min(A, B)), ac = rnd(1, Math.min(A, C)), bc = rnd(1, Math.min(B, C)), abc = rnd(1, Math.min(ab, bc, ac));
        const u = A + B + C - (ab + ac + bc) + abc;
        o = opts(`${u}`, () => `${A + B + C}`, () => `${A + B + C - (ab + ac + bc)}`, () => `${u - 1}`);
        q = G("gen.inclusion_hs.uq5", { v1: A, v2: B, v3: C, v4: ab, v5: ac, v6: bc, v7: abc }, `|A|=${A},|B|=${B},|C|=${C}，两两交 ${ab},${ac},${bc}，三者交 ${abc}，则 |A∪B∪C| = ？`);
        exp = G("gen.inclusion_hs.ue5", { v1: A, v2: B, v3: C, v4: ab, v5: ac, v6: bc, v7: abc, v8: u }, `三集合容斥：${A}+${B}+${C}−(${ab}+${ac}+${bc})+${abc} = ${u}。`);
      } else if (type === 6) {
        const A = rnd(10, 30), B = rnd(10, 30), I = rnd(1, Math.min(A, B));
        o = opts(`${A - I}`, () => `${A}`, () => `${I}`, () => `${B - I}`);
        q = G("gen.inclusion_hs.uq6", { v1: A, v2: B, v3: I }, `班中 ${A} 人会英语、${B} 人会日语、都会 ${I} 人，则只会英语的有几人？`);
        exp = G("gen.inclusion_hs.ue6", { v1: A, v2: I, v3: A - I }, `会英语中扣除也会日语的：${A} − ${I} = ${A - I} 人。`);
      } else if (type === 7) {
        const A = rnd(10, 30), B = rnd(10, 30), U = rnd(A + B - 10, A + B + 5);
        const inter = A + B - U;
        o = opts(`${inter}`, () => `${A}`, () => `${B}`, () => `${U}`);
        q = G("gen.inclusion_hs.uq7", { v1: A, v2: B, v3: U }, `|A|=${A},|B|=${B},|A∪B|=${U}，则由容斥 |A∩B| = ？`);
        exp = G("gen.inclusion_hs.ue7", { v1: A, v2: B, v3: U, v4: inter }, `|A∩B| = |A|+|B|−|A∪B| = ${A}+${B}−${U} = ${inter}。`);
      } else if (type === 8) {
        const A = rnd(8, 16), B = rnd(8, 16), C = rnd(8, 16);
        const ab = rnd(1, Math.min(A, B)), ac = rnd(1, Math.min(A, C)), bc = rnd(1, Math.min(B, C)), abc = rnd(1, Math.min(ab, ac, bc));
        const u = A + B + C - (ab + ac + bc) + abc;
        o = opts(`${u}`, () => `${A + B + C}`, () => `${u + 1}`, () => `${A + B + C - abc}`);
        q = G("gen.inclusion_hs.uq8", { v1: A, v2: B, v3: C, v4: ab, v5: ac, v6: bc, v7: abc }, `三集合 |A|=${A},|B|=${B},|C|=${C}，两两交 ${ab}/${ac}/${bc}，三者交 ${abc}，并集大小是？`);
        exp = G("gen.inclusion_hs.ue8", { v1: A, v2: B, v3: C, v4: ab, v5: ac, v6: bc, v7: abc, v8: u }, `|A∪B∪C| = ${A}+${B}+${C}−${ab}−${ac}−${bc}+${abc} = ${u}。`);
      } else {
        const A = rnd(10, 30), B = rnd(10, 30), I = rnd(1, Math.min(A, B));
        o = opts(`${A + B - I}`, () => `${A}`, () => `${B}`, () => `${I}`);
        q = G("gen.inclusion_hs.uq9", { v1: A + B, v2: A, v3: B, v4: I }, `总体 ${A + B} 人中，会英语 ${A} 人、会日语 ${B} 人、都会 ${I} 人，则两种都不会的有几人？`);
        exp = G("gen.inclusion_hs.ue9", { v1: A, v2: B, v3: I, v4: A + B - I, v5: A + B, v6: A + B - I, v7: I }, `至少会一种 = ${A}+${B}−${I} = ${A + B - I}，两种都不会 = ${A + B} − ${A + B - I} = ${I} 人。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.inclusion_hs.pt0", null, "容斥原理"), "inclusion_venn"));
    }
    return results;
  }

  function qRecurrence(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const A = rnd(1, 5), r = rnd(2, 4), N = rnd(3, 6);
        const val = A * Math.pow(r, N - 1);
        o = opts(`${val}`, () => `${A * Math.pow(r, N)}`, () => `${val + 1}`, () => `${A + (N - 1) * r}`);
        q = G("gen.recurrence.uq0", { v1: A, v2: r, v3: N }, `等比数列 a₁ = ${A}，a_{n+1} = ${r}a_n，则 a_${N} = ？`);
        exp = G("gen.recurrence.ue0", { v1: A, v2: r, v3: N, v4: A, v5: r, v6: N, v7: val }, `a_n = ${A}·${r}^{n−1}，a_${N} = ${A}·${r}^{${N}−1} = ${val}。`);
      } else if (type === 1) {
        const A = rnd(1, 5), d = rnd(2, 6), N = rnd(3, 7);
        const val = A + (N - 1) * d;
        o = opts(`${val}`, () => `${A + N * d}`, () => `${val - 1}`, () => `${A * N}`);
        q = G("gen.recurrence.uq1", { v1: A, v2: d, v3: N }, `等差数列 a₁ = ${A}，a_{n+1} = a_n + ${d}，则 a_${N} = ？`);
        exp = G("gen.recurrence.ue1", { v1: A, v2: d, v3: N, v4: A, v5: N - 1, v6: d, v7: val }, `a_n = ${A} + (n−1)·${d}，a_${N} = ${A} + ${N - 1}·${d} = ${val}。`);
      } else if (type === 2) {
        const A = rnd(1, 4), r = rnd(2, 3), c = rnd(1, 4), N = rnd(3, 6);
        let v = A; for (let j = 1; j < N; j++) v = v * r + c;
        o = opts(`${v}`, () => `${v + 1}`, () => `${A * Math.pow(r, N - 1)}`, () => `${v - 1}`);
        q = G("gen.recurrence.uq2", { v1: A, v2: r, v3: c, v4: N }, `数列 a₁ = ${A}，a_{n+1} = ${r}a_n + ${c}，则 a_${N} = ？`);
        exp = G("gen.recurrence.ue2", { v1: N - 1, v2: N, v3: v }, `逐项递推 ${N - 1} 次得 a_${N} = ${v}。`);
      } else if (type === 3) {
        const A = rnd(1, 5), B = rnd(6, 12), N = rnd(3, 6);
        const d = B - A, val = A + (N - 1) * d;
        o = opts(`${val}`, () => `${val + 1}`, () => `${A + N * d}`, () => `${B}`);
        q = G("gen.recurrence.uq3", { v1: A, v2: B, v3: d, v4: N }, `等差数列 a₁ = ${A}, a₂ = ${B}（公差 ${d}），则 a_${N} = ？`);
        exp = G("gen.recurrence.ue3", { v1: B, v2: A, v3: d, v4: N, v5: A, v6: N - 1, v7: d, v8: val }, `公差 d = ${B}−${A} = ${d}，a_${N} = ${A} + ${N - 1}·${d} = ${val}。`);
      } else if (type === 4) {
        const A = rnd(1, 5), r = rnd(2, 4), N = rnd(3, 6);
        const val = A * (1 - Math.pow(r, N)) / (1 - r);
        o = opts(`${val}`, () => `${val + 1}`, () => `${A * Math.pow(r, N)}`, () => `${A * N}`);
        q = G("gen.recurrence.uq4", { v1: A, v2: r, v3: N, v4: N }, `等比数列 a₁ = ${A}，公比 ${r}，则前 ${N} 项和 S_${N} = ？`);
        exp = G("gen.recurrence.ue4", { v1: N, v2: A, v3: r, v4: N, v5: r, v6: val }, `S_${N} = ${A}(1−${r}^${N})/(1−${r}) = ${val}。`);
      } else if (type === 5) {
        const A = rnd(1, 4), B = rnd(1, 4), N = rnd(4, 7);
        let x = A, y = B; for (let j = 3; j <= N; j++) { const t = x + y; x = y; y = t; }
        o = opts(`${y}`, () => `${y + 1}`, () => `${x}`, () => `${A + B}`);
        q = G("gen.recurrence.uq5", { v1: A, v2: B, v3: N }, `数列 a₁ = ${A}, a₂ = ${B}，且 a_{n+2} = a_{n+1} + a_n（类斐波那契），则 a_${N} = ？`);
        exp = G("gen.recurrence.ue5", { v1: N, v2: y }, `递推得 a_${N} = ${y}。`);
      } else if (type === 6) {
        const X = rnd(5, 20), d = rnd(2, 6), m = rnd(2, 5), k = rnd(1, 4);
        o = opts(`${X + k * d}`, () => `${X + (k - 1) * d}`, () => `${X}`, () => `${X * 2}`);
        q = G("gen.recurrence.uq6", { v1: m, v2: X, v3: d, v4: m + k }, `等差数列中已知 a_${m} = ${X}，公差 ${d}，则 a_${m + k} = ？`);
        exp = G("gen.recurrence.ue6", { v1: m + k, v2: m, v3: k, v4: d, v5: X, v6: k * d, v7: X + k * d }, `a_${m + k} = a_${m} + ${k}·${d} = ${X} + ${k * d} = ${X + k * d}。`);
      } else if (type === 7) {
        const A = rnd(1, 5), d = rnd(2, 6), N = rnd(3, 7);
        const val = N * (2 * A + (N - 1) * d) / 2;
        o = opts(`${val}`, () => `${val + 1}`, () => `${A * N + d}`, () => `${N * (A + (N - 1) * d)}`);
        q = G("gen.recurrence.uq7", { v1: A, v2: d, v3: N, v4: N }, `等差数列 a₁ = ${A}，公差 ${d}，则前 ${N} 项和 S_${N} = ？`);
        exp = G("gen.recurrence.ue7", { v1: N, v2: N, v3: A, v4: N, v5: d, v6: val }, `S_${N} = ${N}(2·${A} + (${N}−1)·${d})/2 = ${val}。`);
      } else if (type === 8) {
        const r = rnd(2, 4), N = rnd(3, 6), Y = rnd(8, 40);
        const a1 = Y / Math.pow(r, N - 1);
        o = opts(`${a1}`, () => `${a1 + 1}`, () => `${Y}`, () => `${a1 - 1}`);
        q = G("gen.recurrence.uq8", { v1: r, v2: N, v3: Y }, `等比数列公比 ${r}，已知 a_${N} = ${Y}，则首项 a₁ = ？`);
        exp = G("gen.recurrence.ue8", { v1: N, v2: r, v3: N, v4: Y, v5: Y, v6: Math.pow(r, N - 1), v7: a1 }, `a_${N} = a₁·${r}^{${N}−1} = ${Y} ⇒ a₁ = ${Y}/${Math.pow(r, N - 1)} = ${a1}。`);
      } else {
        const A = rnd(1, 3), B = rnd(1, 3), N = rnd(4, 7);
        let x = A, y = B; for (let j = 3; j <= N; j++) { const t = x + y; x = y; y = t; }
        o = opts(`${y}`, () => `${y + 1}`, () => `${x}`, () => `${A + B}`);
        q = G("gen.recurrence.uq9", { v1: A, v2: B, v3: N }, `数列 a₁ = ${A}, a₂ = ${B}，a_{n+2} = a_{n+1} + a_n，求 a_${N} = ？`);
        exp = G("gen.recurrence.ue9", { v1: N, v2: y }, `递推得 a_${N} = ${y}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.recurrence.pt0", null, "递推数列"), "recurrence_tree"));
    }
    return results;
  }

  /* ============================================================
   * 拓展专题（第二批）：树状图法、排列组合、柯西不等式、
   *       线性规划、矩阵与行列式、洛必达法则、中值定理、贝叶斯
   * ============================================================ */
  function qTree(n) {
    const results = [];
    const comb = (N, K) => { let c = 1; for (let j = 0; j < K; j++) c = c * (N - j) / (j + 1); return c; };
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(2, 5), b = rnd(2, 5);
        o = opts(G("gen.tree.uo0", { v1: a * b }, `${a * b} 种`), () => G("gen.tree.uo1", { v1: a + b }, `${a + b} 种`), () => G("gen.tree.uo2", { v1: a }, `${a} 种`), () => G("gen.tree.uo3", { v1: a * b + 1 }, `${a * b + 1} 种`));
        q = G("gen.tree.uq0", { v1: a, v2: b }, `有 ${a} 件上衣、${b} 条裤子，各选一件共有几种搭配（树状图逐层展开）？`);
        exp = G("gen.tree.ue0", { v1: a, v2: b, v3: a * b }, `分步乘法原理：${a} × ${b} = ${a * b} 种。`);
      } else if (type === 1) {
        const k = rnd(2, 5);
        const total = Math.pow(2, k);
        o = opts(G("gen.tree.o4", { v1: total }, `${total} 种`), () => G("gen.tree.o5", { v1: k }, `${k} 种`), () => G("gen.tree.o6", { v1: 2 * k }, `${2 * k} 种`), () => G("gen.tree.o7", { v1: k * k }, `${k * k} 种`));
        q = G("gen.tree.2q", { v1: k }, `一枚硬币连续抛 ${k} 次，所有可能的结果序列有几种？`);
        exp = G("gen.tree.3e", { v1: k, v2: total }, `每步 2 种，逐层翻倍共 2^${k} = ${total} 种（树状图逐层展开）。`);
      } else if (type === 2) {
        const k = rnd(2, 5);
        o = opts(`1 − 1/2^${k}`, () => `1/2^${k}`, () => `1/2`, () => `1`);
        q = G("gen.tree.uq1", { v1: k }, `硬币抛 ${k} 次，至少出现 1 次正面的概率是？`);
        exp = G("gen.tree.ue1", { v1: k, v2: k }, `全反面的概率为 1/2^${k}，故至少 1 次正面 = 1 − 1/2^${k}。`);
      } else if (type === 3) {
        const S = rnd(2, 12);
        const cnt = (S <= 7) ? S - 1 : 13 - S;
        o = opts(`${cnt}/36`, () => `${cnt + 1}/36`, () => `${cnt - 1}/36`, () => `${cnt}/6`);
        q = G("gen.tree.uq2", { v1: S }, `同时掷两枚均匀骰子，点数之和为 ${S} 的概率是？`);
        exp = G("gen.tree.ue2", { v1: S, v2: cnt, v3: cnt }, `36 种等可能，和为 ${S} 有 ${cnt} 种，概率 = ${cnt}/36。`);
      } else if (type === 4) {
        const k = rnd(3, 6), m = rnd(1, k - 1);
        const cnt = comb(k, m);
        o = opts(`${cnt}/2^${k}`, () => `${cnt + 1}/2^${k}`, () => `1/2^${k}`, () => `${cnt}/2^${k - 1}`);
        q = G("gen.tree.uq3", { v1: k, v2: m }, `硬币抛 ${k} 次，恰好出现 ${m} 次正面的概率是（用树状图/二项）？`);
        exp = G("gen.tree.ue3", { v1: k, v2: m, v3: k, v4: m, v5: k, v6: cnt, v7: k }, `C(${k},${m}) 种正面位置，概率 = C(${k},${m})/2^${k} = ${cnt}/2^${k}。`);
      } else if (type === 5) {
        const R = rnd(2, 6), B = rnd(2, 6);
        o = opts(`${R}/${R + B}`, () => `${B}/${R + B}`, () => `${R}/(R + B + 1)`, () => `1/2`);
        q = G("gen.tree.uq4", { v1: R, v2: B }, `盒中有 ${R} 个红球、${B} 个蓝球，随机取 1 个，取到红球的概率是？`);
        exp = G("gen.tree.ue4", { v1: R + B, v2: R, v3: R, v4: R + B }, `共 ${R + B} 个球，红球 ${R} 个，概率 = ${R}/${R + B}。`);
      } else if (type === 6) {
        const R = rnd(2, 5), B = rnd(2, 5);
        const p = (R / (R + B)) * (B / (R + B - 1));
        o = opts(`${p.toFixed(3)}`, () => `${(p + 0.1).toFixed(3)}`, () => `${(R / (R + B)).toFixed(3)}`, () => `${(B / (R + B)).toFixed(3)}`);
        q = G("gen.tree.uq5", { v1: R, v2: B }, `盒中 ${R} 红 ${B} 蓝，不放回依次取 2 个，先红后蓝的概率是？`);
        exp = G("gen.tree.ue5", { v1: R, v2: R + B, v3: B, v4: R + B - 1, v5: p.toFixed(3) }, `P = (${R}/${R + B}) × (${B}/${R + B - 1}) ≈ ${p.toFixed(3)}。`);
      } else if (type === 7) {
        const T = rnd(1, 5);
        o = opts(`${(6 - T)}/6`, () => `${T}/6`, () => `${(6 - T + 1)}/6`, () => `1/6`);
        q = G("gen.tree.uq6", { v1: T }, `掷一枚均匀骰子，点数大于 ${T} 的概率是？`);
        exp = G("gen.tree.ue6", { v1: T + 1, v2: 6 - T, v3: 6 - T }, `点数 ${T + 1},…,6 共 ${6 - T} 种，概率 = ${6 - T}/6。`);
      } else if (type === 8) {
        const a = rnd(2, 5), b = rnd(2, 5);
        o = opts(`${a * b}`, () => `${a + b}`, () => `${a}`, () => `${a * b - 1}`);
        q = G("gen.tree.uq7", { v1: a, v2: b }, `用树状图：第一阶段有 ${a} 种选择，第二阶段各有 ${b} 种，总路径数是？`);
        exp = G("gen.tree.ue7", { v1: a, v2: b, v3: a * b }, `乘法原理：总路径 = ${a} × ${b} = ${a * b}。`);
      } else {
        const R = rnd(2, 5), B = rnd(2, 5);
        const p = Math.pow(R / (R + B), 2);
        o = opts(`${p.toFixed(3)}`, () => `${(p + 0.1).toFixed(3)}`, () => `${(R / (R + B)).toFixed(3)}`, () => `${(B / (R + B)).toFixed(3)}`);
        q = G("gen.tree.uq8", { v1: R, v2: B }, `盒中 ${R} 红 ${B} 蓝，有放回取 2 次，两次都是红球的概率是？`);
        exp = G("gen.tree.ue8", { v1: R, v2: R + B, v3: R, v4: R + B, v5: p.toFixed(3) }, `每次红球概率 ${R}/${R + B}，放回独立，P = (${R}/${R + B})² ≈ ${p.toFixed(3)}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.tree.pt0", null, "树状图法"), "tree_diagram"));
    }
    return results;
  }

  function qCounting(n) {
    const results = [];
    const comb = (N, K) => { let c = 1; for (let j = 0; j < K; j++) c = c * (N - j) / (j + 1); return c; };
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const nn = rnd(4, 13);
        const A = nn * (nn - 1);
        o = opts(`${A}`, () => `${nn * (nn - 1) / 2}`, () => `${nn}`, () => `${nn - 1}`);
        q = G("gen.counting.0q", { v1: nn }, `从 ${nn} 人中选 2 人排成一列（有顺序），有几种排法？`);
        exp = G("gen.counting.1e", { v1: nn, v2: nn, v3: nn, v4: A }, `排列数 A(${nn},2) = ${nn} × (${nn}−1) = ${A}。`);
      } else if (type === 1) {
        const nn = rnd(4, 13);
        const C = nn * (nn - 1) / 2;
        o = opts(`${C}`, () => `${nn * (nn - 1)}`, () => `${nn}`, () => `${nn - 1}`);
        q = G("gen.counting.2q", { v1: nn }, `从 ${nn} 人中选 2 人组成一个小组（无顺序），有几种选法？`);
        exp = G("gen.counting.3e", { v1: nn, v2: nn, v3: nn, v4: C }, `组合数 C(${nn},2) = ${nn}(${nn}−1)/2 = ${C}。`);
      } else if (type === 2) {
        const nn = rnd(3, 10);
        let f = 1; for (let j = 2; j <= nn; j++) f *= j;
        o = opts(`${f}`, () => `${nn}`, () => `${nn * nn}`, () => `${Math.pow(2, nn)}`);
        q = G("gen.counting.uq0", { v1: nn }, `${nn} 个人排成一排照相，有几种排法？`);
        exp = G("gen.counting.ue0", { v1: nn, v2: nn, v3: f }, `${nn} 个人的全排列 = ${nn}! = ${f}。`);
      } else if (type === 3) {
        const nn = rnd(5, 13);
        const C = nn * (nn - 1) / 2;
        o = opts(`${C}`, () => `${nn}`, () => `${2 * nn}`, () => `${nn - 1}`);
        q = G("gen.counting.uq1", { v1: nn }, `${nn} 个人两两握手一次，共握手几次？`);
        exp = G("gen.counting.ue1", { v1: nn, v2: nn, v3: nn, v4: C }, `每两人握一次，C(${nn},2) = ${nn}(${nn}−1)/2 = ${C} 次。`);
      } else if (type === 4) {
        const nn = rnd(5, 13), k = rnd(2, 5);
        let A = 1; for (let j = 0; j < k; j++) A *= (nn - j);
        o = opts(`${A}`, () => `${comb(nn, k)}`, () => `${A + 1}`, () => `${nn}`);
        q = G("gen.counting.uq2", { v1: nn, v2: k, v3: nn, v4: k }, `从 ${nn} 个不同元素中选 ${k} 个排成一列（排列 A(${nn},${k})），有几种？`);
        exp = G("gen.counting.ue2", { v1: nn, v2: k, v3: nn, v4: nn - 1, v5: nn - k + 1, v6: A }, `A(${nn},${k}) = ${nn}×${nn - 1}×…×${nn - k + 1} = ${A}。`);
      } else if (type === 5) {
        const nn = rnd(5, 13), k = rnd(2, 5);
        const C = comb(nn, k);
        let perm = 1; for (let j = 0; j < k; j++) perm *= (nn - j);
        o = opts(`${C}`, () => `${perm}`, () => `${C + 1}`, () => `${nn}`);
        q = G("gen.counting.uq3", { v1: nn, v2: k, v3: nn, v4: k }, `从 ${nn} 个不同元素中选 ${k} 个组成一组（组合 C(${nn},${k})），有几种？`);
        exp = G("gen.counting.ue3", { v1: nn, v2: k, v3: nn, v4: nn, v5: k, v6: k, v7: C }, `C(${nn},${k}) = ${nn}!/((${nn}-${k})!·${k}!) = ${C}。`);
      } else if (type === 6) {
        const m = rnd(2, 8), nn = rnd(2, 8);
        const C = comb(m + nn, m);
        o = opts(`${C}`, () => `${m * nn}`, () => `${C + 1}`, () => `${m + nn}`);
        q = G("gen.counting.uq4", { v1: m, v2: nn }, `在 ${m} × ${nn} 的方格网格中，从左上角只向右/下走到右下角，有几种路径？`);
        exp = G("gen.counting.ue4", { v1: m, v2: nn, v3: m, v4: m, v5: nn, v6: m, v7: C }, `共走 ${m}+${nn} 步选 ${m} 步向右：C(${m}+${nn},${m}) = ${C}。`);
      } else if (type === 7) {
        const nn = rnd(3, 10);
        const val = nn * (nn - 1);
        o = opts(`${val}`, () => `${nn}`, () => `${nn * nn}`, () => `${val / 2}`);
        q = G("gen.counting.uq5", { v1: nn }, `用 ${nn} 个不同数字组成两位数（数字不重复）有几种？`);
        exp = G("gen.counting.ue5", { v1: nn, v2: nn - 1, v3: nn, v4: nn, v5: val }, `十位 ${nn} 种、个位 ${nn - 1} 种，共 ${nn}×(${nn}−1) = ${val} 种。`);
      } else if (type === 8) {
        const nn = rnd(3, 7);
        let f = 1; for (let j = 2; j <= nn - 1; j++) f *= j;
        o = opts(`${f}`, () => `${nn}`, () => `${f * nn}`, () => `${Math.pow(2, nn)}`);
        q = G("gen.counting.uq6", { v1: nn }, `${nn} 个人围圆桌而坐（圆排列），有几种坐法？`);
        exp = G("gen.counting.ue6", { v1: nn, v2: f }, `圆排列 = (${nn}−1)! = ${f}。`);
      } else {
        const nn = rnd(2, 6);
        o = opts(`${Math.pow(2, nn)}`, () => `${nn}`, () => `${Math.pow(2, nn) - 1}`, () => `${nn * 2}`);
        q = G("gen.counting.uq7", { v1: nn }, `用 2 种颜色给一排 ${nn} 个格子涂色（每格一色），共有几种涂法？`);
        exp = G("gen.counting.ue7", { v1: nn, v2: Math.pow(2, nn) }, `每格 2 种选择且独立，共 2^${nn} = ${Math.pow(2, nn)} 种。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.counting.pt0", null, "排列与组合"), "counting_tree"));
    }
    return results;
  }

  function qCauchy(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const A = rnd(1, 6), B = rnd(1, 6), C = rnd(1, 6), D = rnd(1, 6);
        o = opts(G("gen.cauchy.uo0", null, "两向量 (a,b) 与 (c,d) 共线（对应分量成比例）"), () => G("gen.cauchy.uo1", null, "两向量垂直"), () => "a = c", () => G("gen.cauchy.uo2", null, "任意情况"));
        q = G("gen.cauchy.uq0", { v1: A, v2: B, v3: C, v4: D, v5: A, v6: C, v7: B, v8: D }, `二维柯西 (${A}²+${B}²)(${C}²+${D}²) ≥ (${A}${C}+${B}${D})² 中等号成立的条件是？`);
        exp = G("gen.cauchy.ue0", null, `等号当且仅当向量 (a,b) 与 (c,d) 共线（对应分量成比例）。`);
      } else if (type === 1) {
        const P = rnd(2, 9), Q = rnd(2, 9);
        const m = (Math.sqrt(P * Q)).toFixed(2);
        o = opts(`${m}`, () => `${(Math.sqrt(P)).toFixed(2)}`, () => `${(Math.sqrt(Q)).toFixed(2)}`, () => `${P + Q}`);
        q = G("gen.cauchy.uq1", { v1: P, v2: Q }, `已知 a²+b²=${P} 且 c²+d²=${Q}，则 ac+bd 的最大值为？`);
        exp = G("gen.cauchy.ue1", { v1: P, v2: Q, v3: P * Q, v4: P * Q, v5: m }, `柯西：(ac+bd)² ≤ (a²+b²)(c²+d²) = ${P}×${Q} = ${P * Q}，故最大值 = √${P * Q} ≈ ${m}。`);
      } else if (type === 2) {
        const K = rnd(3, 8);
        o = opts("2", () => `${K}`, () => "1", () => "4");
        q = G("gen.cauchy.uq2", { v1: K }, `要使不等式 (x+y)² ≤ M(x²+y²) 对任意 x,y 成立，M 的最小整数值是（与常数 2 比较，这里验证 M=${K} 时）？`);
        exp = G("gen.cauchy.ue2", { v1: K }, `由柯西 (1²+1²)(x²+y²) ≥ (x+y)²，即 2(x²+y²) ≥ (x+y)²，故最小 M = 2（${K} ≥ 2 显然也成立）。`);
      } else if (type === 3) {
        const N = rnd(2, 8);
        o = opts(G("gen.cauchy.uo3", null, "任意有限维（n 维）都成立"), () => G("gen.cauchy.uo4", null, "只二维"), () => G("gen.cauchy.uo5", null, "只三维"), () => G("gen.cauchy.uo6", null, "只一维"));
        q = G("gen.cauchy.uq3", { v1: N, v2: N, v3: N }, `柯西不等式 (Σ_{i=1}^{${N}} aᵢ²)(Σ_{i=1}^{${N}} bᵢ²) ≥ (Σ_{i=1}^{${N}} aᵢbᵢ)² 适用于？`);
        exp = G("gen.cauchy.ue3", { v1: N }, `柯西不等式对任意有限维（此处 ${N} 维）内积空间都成立。`);
      } else if (type === 4) {
        const R = rnd(2, 8), p = rnd(1, 5), q2 = rnd(1, 5);
        const m = (R * Math.sqrt(p * p + q2 * q2)).toFixed(2);
        o = opts(`${m}`, () => `${(R * (p + q2)).toFixed(2)}`, () => `${(R * Math.sqrt(p * p + q2 * q2) + 1).toFixed(2)}`, () => `${R}`);
        q = G("gen.cauchy.uq4", { v1: R * R, v2: p, v3: q2 }, `已知 x²+y²=${R * R}，则 ${p}x + ${q2}y 的最大值是？`);
        exp = G("gen.cauchy.ue4", { v1: p, v2: q2, v3: p, v4: q2, v5: p * p + q2 * q2, v6: R * R, v7: m }, `柯西：((${p}x+${q2}y)²) ≤ (${p}²+${q2}²)(x²+y²) = (${p * p + q2 * q2})·${R * R}，最大值 ≈ ${m}。`);
      } else if (type === 5) {
        const A = rnd(1, 6), B = rnd(1, 6);
        o = opts(G("gen.cauchy.uo7", null, "向量 (x,y) 与 (a,b) 共线（成比例）"), () => G("gen.cauchy.uo8", null, "两向量垂直"), () => "x = y", () => G("gen.cauchy.uo9", null, "任意"));
        q = G("gen.cauchy.uq5", { v1: A, v2: B, v3: A, v4: B }, `由柯西 (${A}x + ${B}y)² ≤ (${A}²+${B}²)(x²+y²)，等号成立（取等）的条件是？`);
        exp = G("gen.cauchy.ue5", { v1: A, v2: B }, `等号当且仅当 (x,y) 与 (${A},${B}) 共线（对应分量成比例）。`);
      } else if (type === 6) {
        const N = rnd(2, 6), P = rnd(2, 9);
        const m = (Math.sqrt(N * P)).toFixed(2);
        o = opts(`${m}`, () => `${(Math.sqrt(P)).toFixed(2)}`, () => `${N}`, () => `${P}`);
        q = G("gen.cauchy.uq6", { v1: N, v2: N, v3: P }, `已知 ${N} 个数 a₁…a_${N} 满足 Σ aᵢ² = ${P}，则由柯西 Σaᵢ 的最大值是？`);
        exp = G("gen.cauchy.ue6", { v1: N, v2: N * P, v3: N * P, v4: m }, `(Σaᵢ)² ≤ ${N}·Σaᵢ² = ${N * P}，故 Σaᵢ 最大值 = √(${N * P}) ≈ ${m}。`);
      } else if (type === 7) {
        const A = rnd(2, 8), B = rnd(2, 8);
        o = opts("4", () => `${A + B}`, () => "2", () => "1");
        q = G("gen.cauchy.uq7", { v1: A, v2: B }, `对任意正数 a = ${A}, b = ${B}，由柯西 (a+b)(1/a+1/b) ≥ (1+1)² = ？`);
        exp = G("gen.cauchy.ue7", null, `(a+b)(1/a+1/b) ≥ (√a·1/√a + √b·1/√b)² = (1+1)² = 4。`);
      } else if (type === 8) {
        const K = rnd(2, 6);
        o = opts("3", () => `${K}`, () => "2", () => "1");
        q = G("gen.cauchy.uq8", { v1: K }, `由柯西 (x+y+z)² ≤ M(x²+y²+z²) 对任意 x,y,z 成立，M 的最小整数值是（验证 M=${K}）？`);
        exp = G("gen.cauchy.ue8", null, `(x+y+z)² = (1·x+1·y+1·z)² ≤ (1²+1²+1²)(x²+y²+z²) = 3(x²+y²+z²)，最小 M = 3。`);
      } else {
        const A = rnd(1, 5), B = rnd(1, 5), C = rnd(1, 5), D = rnd(1, 5), E = rnd(1, 5), F = rnd(1, 5);
        o = opts(G("gen.cauchy.uo10", null, "两向量 (a,b,c) 与 (d,e,f) 共线"), () => G("gen.cauchy.uo11", null, "两向量垂直"), () => "a=d", () => G("gen.cauchy.uo12", null, "任意"));
        q = G("gen.cauchy.uq9", { v1: A, v2: B, v3: C, v4: D, v5: E, v6: F, v7: A, v8: D, v9: B, v10: E, v11: C, v12: F }, `三维柯西 (${A}²+${B}²+${C}²)(${D}²+${E}²+${F}²) ≥ (${A}${D}+${B}${E}+${C}${F})² 等号条件是？`);
        exp = G("gen.cauchy.ue9", null, `等号当且仅当三维向量 (a,b,c) 与 (d,e,f) 共线。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.cauchy.pt0", null, "柯西不等式"), "cauchy_rect"));
    }
    return results;
  }

  function qLinearProg(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const m = rnd(3, 12);
        o = opts(`${m}`, () => `${2 * m}`, () => `${m / 2}`, () => `${m * m}`);
        q = G("gen.linearprog.uq0", { v1: m }, `约束 x≥0, y≥0, x+y≤${m}，目标 z = x+y 的最大值是？`);
        exp = G("gen.linearprog.ue0", { v1: m, v2: m, v3: m }, `在顶点 (${m},0) 或 (0,${m}) 处 z = ${m} 达到最大。`);
      } else if (type === 1) {
        const a = 2 * rnd(2, 6);
        const zmax = 2 * a / 3;
        o = opts(`${zmax}`, () => `${a}`, () => `${a / 3}`, () => `${2 * a}`);
        q = G("gen.linearprog.uq1", { v1: a, v2: a }, `约束 x≥0, y≥0, 2x+y≤${a}, x+2y≤${a}，目标 z = x+y 的最大值是？`);
        exp = G("gen.linearprog.ue1", { v1: a, v2: a, v3: zmax }, `两约束交于 x=y=${a}/3，z = 2×${a}/3 = ${zmax}；比坐标轴上的顶点更大。`);
      } else if (type === 2) {
        const ncons = rnd(2, 5);
        o = opts(G("gen.linearprog.uo0", null, "凸多边形（凸集）"), () => G("gen.linearprog.uo1", null, "任意形状"), () => G("gen.linearprog.uo2", null, "圆形"), () => G("gen.linearprog.uo3", null, "一条直线"));
        q = G("gen.linearprog.uq2", { v1: ncons }, `线性规划中，由 ${ncons} 个线性不等式围成的有限可行域是？`);
        exp = G("gen.linearprog.ue2", null, "线性约束的交集是凸集，有限情形为凸多边形。");
      } else if (type === 3) {
        const m = rnd(3, 10);
        o = opts(G("gen.linearprog.uo4", null, "可行域的顶点（角点）"), () => G("gen.linearprog.uo5", null, "可行域内部"), () => G("gen.linearprog.uo6", null, "坐标原点"), () => G("gen.linearprog.uo7", null, "任意边界点"));
        q = G("gen.linearprog.uq3", { v1: m }, `在约束 x≥0, y≥0, x+y≤${m} 下，目标函数的最值一定在何处取得？`);
        exp = G("gen.linearprog.ue3", null, "由线性规划基本定理，最值在可行域的某个顶点取得。");
      } else if (type === 4) {
        const a = rnd(2, 6), b = rnd(2, 6), m = rnd(4, 16);
        const val = (m / a).toFixed(2);
        o = opts(`${val}`, () => `${(m / b).toFixed(2)}`, () => `${m}`, () => `${(m / (a + b)).toFixed(2)}`);
        q = G("gen.linearprog.uq4", { v1: a, v2: b, v3: m }, `约束 x≥0, y≥0, ${a}x + ${b}y ≤ ${m}，目标 z = x 的最大值是？`);
        exp = G("gen.linearprog.ue4", { v1: m, v2: a, v3: val, v4: val }, `让 y=0 得 x ≤ ${m}/${a}，故 z=x 最大 = ${val}（在 (${val},0)）。`);
      } else if (type === 5) {
        const m = rnd(3, 12);
        o = opts(`${3 * m}`, () => `${2 * m}`, () => `${m}`, () => `${4 * m}`);
        q = G("gen.linearprog.uq5", { v1: m }, `约束 x≥0, y≥0, x+y≤${m}，目标 z = 2x + 3y 的最大值是？`);
        exp = G("gen.linearprog.ue5", { v1: m, v2: m, v3: 3 * m, v4: m, v5: m, v6: 3 * m }, `角点 (0,${m}) 处 z = 3·${m} = ${3 * m}，大于 (${m},0) 的 2·${m}，故最大 ${3 * m}。`);
      } else if (type === 6) {
        const m = rnd(4, 14);
        o = opts(`${m}`, () => `${m / 2}`, () => `${2 * m}`, () => `${m + 1}`);
        q = G("gen.linearprog.uq6", { v1: m }, `约束 x≥0, y≥0, x + 2y ≤ ${m}，目标 z = x + 2y 的最大值是？`);
        exp = G("gen.linearprog.ue6", { v1: m, v2: m }, `目标恰为左端，沿约束线 z = ${m} 恒定达到，故最大 = ${m}。`);
      } else if (type === 7) {
        const m = rnd(6, 18);
        const val = (m / 3).toFixed(2);
        o = opts(`${val}`, () => `${(m / 4).toFixed(2)}`, () => `${m}`, () => `${(m / 2).toFixed(2)}`);
        q = G("gen.linearprog.uq7", { v1: m }, `约束 x≥0, y≥0, 3x + 4y ≤ ${m}，目标 z = x + y 的最大值是？`);
        exp = G("gen.linearprog.ue7", { v1: m, v2: val, v3: m, v4: m / 4, v5: val }, `角点 (${m}/3,0) 处 z = ${val}，大于 (0,${m}/4) 的 ${m / 4}，故最大 ≈ ${val}。`);
      } else if (type === 8) {
        const m = rnd(3, 10);
        o = opts(G("gen.linearprog.uo8", null, "变量非负（x≥0, y≥0 等）"), () => G("gen.linearprog.uo9", null, "变量可任意实数"), () => G("gen.linearprog.uo10", null, "变量为整数"), () => G("gen.linearprog.uo11", null, "变量为正数"));
        q = G("gen.linearprog.uq8", { v1: m }, `标准线性规划中，除约束外通常还要求决策变量满足（如本题 x≥0, y≥0, x+y≤${m}）？`);
        exp = G("gen.linearprog.ue8", null, "线性规划一般要求变量非负，可行域才有界可求最值。");
      } else {
        const m = rnd(3, 12);
        o = opts(`${m}`, () => `${-m}`, () => `0`, () => `${2 * m}`);
        q = G("gen.linearprog.uq9", { v1: m }, `约束 x≥0, y≥0, x+y≤${m}，目标 z = x − y 的最大值是？`);
        exp = G("gen.linearprog.ue9", { v1: m, v2: m, v3: m, v4: m, v5: m }, `在角点 (${m},0) 处 z = ${m} − 0 = ${m}，为最大（(0,${m}) 给 −${m}）。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.linearprog.pt0", null, "线性规划"), "lprog_region"));
    }
    return results;
  }

  function qMatrix(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 4), b = rnd(1, 4), c = rnd(1, 4), d = rnd(1, 4);
        const det = a * d - b * c;
        o = opts(`${det}`, () => `${a * d + b * c}`, () => `${a * b - c * d}`, () => `${a + d - b - c}`);
        q = G("gen.matrix.0q", { v1: a, v2: b, v3: c, v4: d }, `二阶行列式 |${a} ${b}; ${c} ${d}| = ？`);
        exp = G("gen.matrix.1e", { v1: a, v2: d, v3: b, v4: c, v5: det }, `二阶行列式 = 主对角积 − 副对角积 = ${a}·${d} − ${b}·${c} = ${det}。`);
      } else if (type === 1) {
        o = opts(G("gen.matrix.o0", null, "A 本身"), () => G("gen.matrix.o1", null, "零矩阵"), () => G("gen.matrix.o2", null, "单位矩阵 I"), () => "A²");
        q = G("gen.matrix.s0q", null, "单位矩阵 I 与任意矩阵 A 满足 IA = ？");
        exp = G("gen.matrix.s1e", null, "单位矩阵是乘法单位元，IA = A。");
      } else if (type === 2) {
        const a = rnd(2, 5), d = rnd(2, 5);
        o = opts(`${a * d}`, () => `${a + d}`, () => `0`, () => `1`);
        q = G("gen.matrix.2q", { v1: a, v2: d }, `对角阵 |${a} 0; 0 ${d}| 的行列式 = ？`);
        exp = G("gen.matrix.3e", { v1: a, v2: d, v3: a * d }, `对角阵行列式 = 对角元乘积 = ${a} × ${d} = ${a * d}。`);
      } else {
        o = opts(G("gen.matrix.o3", null, "不可逆（奇异）"), () => G("gen.matrix.o4", null, "可逆"), () => G("gen.matrix.o5", null, "对称"), () => G("gen.matrix.o6", null, "对角"));
        q = G("gen.matrix.s2q", null, "若二阶矩阵行列式为 0，则该矩阵？");
        exp = G("gen.matrix.s3e", null, "行列式为 0 ⇔ 矩阵不可逆（奇异矩阵）。");
      }
      results.push(Q(q, o, "进阶", exp, G("gen.matrix.pt0", null, "矩阵与行列式"), "matrix_det"));
    }
    return results;
  }

  function qLhopital(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const k = rnd(2, 15);
        o = opts(`${k}`, () => `${k + 1}`, () => `1`, () => `0`);
        q = G("gen.lhopital.uq0", { v1: k }, `极限 lim(x→0) sin(${k}x) / x = ？（0/0 型，可用洛必达）`);
        exp = G("gen.lhopital.ue0", { v1: k, v2: k, v3: k }, `洛必达：分子分母求导 → ${k}cos(${k}x)/1，x→0 得 ${k}。`);
      } else if (type === 1) {
        const k = rnd(2, 15);
        o = opts(`${k}`, () => `${k + 1}`, () => `1`, () => `0`);
        q = G("gen.lhopital.uq1", { v1: k }, `极限 lim(x→0) (e^(${k}x) − 1) / x = ？`);
        exp = G("gen.lhopital.ue1", { v1: k, v2: k, v3: k }, `洛必达：分子分母求导 → ${k}e^(${k}x)/1，x→0 得 ${k}。`);
      } else if (type === 2) {
        const k = rnd(2, 15);
        o = opts(`${k}`, () => `${k / 2}`, () => `1`, () => `0`);
        q = G("gen.lhopital.uq2", { v1: k }, `极限 lim(x→0) ln(1 + ${k}x) / x = ？`);
        exp = G("gen.lhopital.ue2", { v1: k, v2: k, v3: k }, `洛必达：分子分母求导 → (${k}/(1+${k}x))/1，x→0 得 ${k}。`);
      } else if (type === 3) {
        const k = rnd(2, 15);
        const val = (k * k / 2).toFixed(2);
        o = opts(`${val}`, () => `${k}`, () => `${k * k}`, () => `0`);
        q = G("gen.lhopital.uq3", { v1: k }, `极限 lim(x→0) (1 − cos(${k}x)) / x² = ？`);
        exp = G("gen.lhopital.ue3", { v1: k, v2: k, v3: k, v4: val }, `洛必达两次或等价无穷小：1−cos(${k}x) ~ (${k}²x²)/2，故极限 = ${k}²/2 = ${val}。`);
      } else if (type === 4) {
        const k = rnd(2, 15);
        o = opts(`${k}`, () => `${k + 1}`, () => `1`, () => `0`);
        q = G("gen.lhopital.uq4", { v1: k }, `极限 lim(x→0) tan(${k}x) / x = ？`);
        exp = G("gen.lhopital.ue4", { v1: k, v2: k, v3: k }, `洛必达：分子分母求导 → ${k}sec²(${k}x)/1，x→0 得 ${k}。`);
      } else if (type === 5) {
        const k = rnd(2, 15);
        const val = (k / 2).toFixed(2);
        o = opts(`${val}`, () => `${k}`, () => `0`, () => `1`);
        q = G("gen.lhopital.uq5", { v1: 1 + k }, `极限 lim(x→0) (√(${1 + k}x) − 1) / x = ？`);
        exp = G("gen.lhopital.ue5", { v1: k, v2: 1 + k, v3: k, v4: val }, `洛必达：分子求导 (${k}/(2√(${1 + k}x)))/1，x→0 得 ${k}/2 = ${val}。`);
      } else if (type === 6) {
        const k = rnd(2, 15);
        o = opts(`${k}`, () => `${k + 1}`, () => `1`, () => `0`);
        q = G("gen.lhopital.uq6", { v1: k }, `极限 lim(x→0) arcsin(${k}x) / x = ？`);
        exp = G("gen.lhopital.ue6", { v1: k, v2: k, v3: k }, `洛必达：分子求导 (${k}/√(1−${k}²x²))/1，x→0 得 ${k}。`);
      } else if (type === 7) {
        const a = rnd(2, 12);
        const val = Math.log(a).toFixed(3);
        o = opts(`${val}`, () => `${a}`, () => `1`, () => `0`);
        q = G("gen.lhopital.uq7", { v1: a, v2: a }, `极限 lim(x→0) (${a}^x − 1) / x = ？（提示：答案与 ln ${a} 有关）`);
        exp = G("gen.lhopital.ue7", { v1: a, v2: val }, `由导数定义 (a^x)' = a^x ln a，在 x=0 处得 ln ${a} ≈ ${val}。`);
      } else if (type === 8) {
        const k = rnd(2, 5);
        o = opts(G("gen.lhopital.uo0", null, "0/0 或 ∞/∞ 型未定式"), () => G("gen.lhopital.uo1", null, "0/∞ 型"), () => G("gen.lhopital.uo2", null, "任意分式"), () => G("gen.lhopital.uo3", null, "两数之积"));
        q = G("gen.lhopital.uq8", { v1: k }, `极限 lim(x→0) sin(${k}x) / x 属于什么未定式，才可直接用洛必达？`);
        exp = G("gen.lhopital.ue8", null, `分子→0、分母→0，属 0/0 未定式，可直接洛必达。`);
      } else {
        const p = rnd(1, 4);
        o = opts("0", () => `∞`, () => `${p}`, () => `1`);
        q = G("gen.lhopital.uq9", { v1: p, v2: p }, `极限 lim(x→∞) (ln x) / x^${p} = ？（p = ${p} > 0，∞/∞ 型）`);
        exp = G("gen.lhopital.ue9", { v1: p, v2: p, v3: p, v4: p }, `洛必达：分子求导 (1/x)/(${p}x^{${p}−1}) = 1/(${p}x^${p}) → 0（x→∞）。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.lhopital.pt0", null, "洛必达法则"), "lhopital_graph"));
    }
    return results;
  }

  function qMvt(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 4), b = a + rnd(1, 5);
        o = opts(`(f(${b}) − f(${a})) / (${b} − ${a})`, () => `f(${b}) − f(${a})`, () => `f'(${a})`, () => `0`);
        q = G("gen.mvt.uq0", { v1: a, v2: b, v3: a, v4: b, v5: a, v6: b }, `拉格朗日中值定理：f 在[${a},${b}]连续、(${a},${b})可导，则 ∃ξ∈(${a},${b}) 使 f'(ξ) = ？`);
        exp = G("gen.mvt.ue0", { v1: b, v2: a, v3: b, v4: a }, `存在 ξ 使切线斜率等于割线斜率：f'(ξ) = (f(${b})−f(${a}))/(${b}−${a})。`);
      } else if (type === 1) {
        const A = rnd(2, 8);
        o = opts(`${A / 2}`, () => `${A}`, () => `0`, () => `2`);
        q = G("gen.mvt.uq1", { v1: A }, `f(x)=x² 在 [0,${A}] 上，满足中值定理的 ξ = ？`);
        exp = G("gen.mvt.ue1", { v1: A, v2: A, v3: A, v4: A, v5: A }, `(${A}²−0)/${A} = ${A}，令 2ξ = ${A} → ξ = ${A}/2。`);
      } else if (type === 2) {
        o = opts(G("gen.mvt.uo0", null, "平行于弦（割线）"), () => G("gen.mvt.uo1", null, "垂直于 x 轴"), () => G("gen.mvt.uo2", null, "过原点"), () => G("gen.mvt.uo3", null, "平行于 y 轴"));
        q = G("gen.mvt.uq2", null, "中值定理的几何意义：存在一点切线？");
        exp = G("gen.mvt.ue2", null, "存在 ξ 使该点切线与区间端点的连线（割线）平行。");
      } else if (type === 3) {
        const N = rnd(2, 6);
        o = opts(`${N}/√3`, () => `${N}/3`, () => `√${N}`, () => `${N * N}/3`);
        q = G("gen.mvt.uq3", { v1: N }, `f(x)=x³ 在 [0,${N}] 上，满足中值定理的 ξ = ？`);
        exp = G("gen.mvt.ue3", { v1: N, v2: N, v3: N, v4: N, v5: N }, `(f(${N})−f(0))/${N} = ${N}²，令 3ξ²=${N}² → ξ=${N}/√3。`);
      } else if (type === 4) {
        const B = rnd(1, 4), C = B + rnd(2, 5);
        const xi = ((B + C) / 2).toFixed(2);
        o = opts(`${xi}`, () => `${B}`, () => `${C}`, () => `${(B + C).toFixed(2)}`);
        q = G("gen.mvt.uq4", { v1: B, v2: C }, `f(x)=x² 在 [${B},${C}] 上，满足中值定理的 ξ = ？`);
        exp = G("gen.mvt.ue4", { v1: C, v2: B, v3: C, v4: B, v5: B, v6: C, v7: B, v8: C, v9: (B + C) / 2 }, `割线斜率 = (${C}²−${B}²)/(${C}−${B}) = ${B}+${C}，令 2ξ=${B}+${C} → ξ=${(B + C) / 2}。`);
      } else if (type === 5) {
        const A = rnd(2, 6), B = A + rnd(1, 5);
        const xi = (Math.sqrt(A * B)).toFixed(2);
        o = opts(`${xi}`, () => `${(A + B) / 2}`, () => `${A}`, () => `${B}`);
        q = G("gen.mvt.uq5", { v1: A, v2: B }, `f(x)=1/x 在 [${A},${B}] 上，满足中值定理的 ξ = ？`);
        exp = G("gen.mvt.ue5", { v1: B, v2: A, v3: B, v4: A, v5: A, v6: B, v7: A, v8: B, v9: A, v10: B, v11: xi }, `割线斜率 = (1/${B}−1/${A})/(${B}−${A}) = −1/(${A}${B})，令 −1/ξ² = −1/(${A}${B}) → ξ=√(${A}${B}) ≈ ${xi}。`);
      } else if (type === 6) {
        const A = rnd(2, 9);
        o = opts(`${A / 4}`, () => `${A / 2}`, () => `√${A}`, () => `${A}`);
        q = G("gen.mvt.uq6", { v1: A }, `f(x)=√x 在 [0,${A}] 上，满足中值定理的 ξ = ？`);
        exp = G("gen.mvt.ue6", { v1: A, v2: A, v3: A, v4: A, v5: A, v6: A }, `割线斜率 = √${A}/${A} = 1/√${A}，令 1/(2√ξ)=1/√${A} → √ξ=√${A}/2 → ξ=${A}/4。`);
      } else if (type === 7) {
        const A = rnd(2, 9);
        const xi = ((A - 1) / Math.log(A)).toFixed(2);
        o = opts(`${xi}`, () => `${(A - 1).toFixed(2)}`, () => `${A}`, () => `1`);
        q = G("gen.mvt.uq7", { v1: A }, `f(x)=ln x 在 [1,${A}] 上，满足中值定理的 ξ = ？`);
        exp = G("gen.mvt.ue7", { v1: A, v2: A, v3: A, v4: A, v5: A, v6: A, v7: xi }, `割线斜率 = ln ${A}/(${A}−1)，令 1/ξ = ln ${A}/(${A}−1) → ξ = (${A}−1)/ln ${A} ≈ ${xi}。`);
      } else if (type === 8) {
        const a = rnd(1, 5), b = a + rnd(1, 5);
        o = opts(`f(${a}) = f(${b})`, () => `f(${a}) ≠ f(${b})`, () => `f'(ξ) = 0`, () => G("gen.mvt.uo4", { v1: a, v2: b }, `f(${a})·f(${b}) = 0`));
        q = G("gen.mvt.uq8", { v1: a, v2: b, v3: a, v4: b }, `罗尔定理要求 f 在[${a},${b}]连续、(${a},${b})可导，且还需满足？`);
        exp = G("gen.mvt.ue8", { v1: a, v2: b }, `罗尔定理还要端点函数值相等：f(${a}) = f(${b})，则存在 ξ 使 f'(ξ) = 0。`);
      } else {
        const A = rnd(1, 4), B = A + rnd(1, 4);
        const val = (Math.sqrt((B * B + A * B + A * A) / 3)).toFixed(2);
        o = opts(`${val}`, () => `${(A + B) / 2}`, () => `${B}`, () => `√${(A * A + A * B + B * B)}`);
        q = G("gen.mvt.uq9", { v1: A, v2: B }, `f(x)=x³ 在 [${A},${B}] 上，满足中值定理的 ξ = ？`);
        exp = G("gen.mvt.ue9", { v1: B, v2: A, v3: B, v4: A, v5: B, v6: A, v7: B, v8: A, v9: val }, `割线斜率 = (${B}³−${A}³)/(${B}−${A}) = ${B}²+${A}${B}+${A}²，令 3ξ² = 该值 → ξ ≈ ${val}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.mvt.pt0", null, "中值定理"), "mvt_tangent"));
    }
    return results;
  }

  function qBayes(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const p1 = rnd(3, 9) / 10, p2 = rnd(4, 9) / 10;
        const prod = (p1 * p2).toFixed(3);
        o = opts(`${prod}`, () => `${p2}`, () => `${p1}`, () => `${(p1 + p2).toFixed(3)}`);
        q = G("gen.bayes.uq0", { v1: p1.toFixed(1), v2: p2.toFixed(1) }, `已知 P(A)=${p1.toFixed(1)}，P(B|A)=${p2.toFixed(1)}，则 P(A∩B) = ？`);
        exp = G("gen.bayes.ue0", { v1: p1.toFixed(1), v2: p2.toFixed(1), v3: prod }, `乘法公式：P(A∩B) = P(A)·P(B|A) = ${p1.toFixed(1)} × ${p2.toFixed(1)} = ${prod}。`);
      } else if (type === 1) {
        const pa = rnd(2, 8) / 10, pb = rnd(1, 7) / 10;
        o = opts(`${(pa + pb).toFixed(3)}`, () => `${(pa * pb).toFixed(3)}`, () => `0`, () => `1`);
        q = G("gen.bayes.uq1", { v1: pa.toFixed(1), v2: pb.toFixed(1) }, `若 A、B 互斥，P(A)=${pa.toFixed(1)}，P(B)=${pb.toFixed(1)}，则 P(A∪B) = ？`);
        exp = G("gen.bayes.ue1", { v1: (pa + pb).toFixed(3) }, `互斥事件无交集，P(A∪B) = P(A)+P(B) = ${(pa + pb).toFixed(3)}。`);
      } else if (type === 2) {
        const s = rnd(8, 9) / 10;
        o = opts(G("gen.bayes.uo0", null, "由结果反推原因（逆概率）"), () => G("gen.bayes.uo1", null, "求独立"), () => G("gen.bayes.uo2", null, "求期望"), () => G("gen.bayes.uo3", null, "求方差"));
        q = G("gen.bayes.uq2", { v1: s.toFixed(1) }, `某检测灵敏度 ${s.toFixed(1)}，贝叶斯公式主要用于解决哪类问题？`);
        exp = G("gen.bayes.ue2", null, "贝叶斯公式由已观察到的“结果（如阳性）”反推各“原因（如患病）”的概率，即逆概率。");
      } else if (type === 3) {
        const a = rnd(3, 8) / 10, b = rnd(4, 9) / 10;
        const c = Math.min(0.99, a * b + 0.1);
        const ans = (a * b / c).toFixed(3);
        o = opts(`${ans}`, () => `${(a).toFixed(3)}`, () => `${(b).toFixed(3)}`, () => `${(c).toFixed(3)}`);
        q = G("gen.bayes.uq3", { v1: a.toFixed(2), v2: b.toFixed(2), v3: c.toFixed(2) }, `P(A)=${a.toFixed(2)}，P(B|A)=${b.toFixed(2)}，P(B)=${c.toFixed(2)}，则 P(A|B) = ？`);
        exp = G("gen.bayes.ue3", { v1: a.toFixed(2), v2: b.toFixed(2), v3: c.toFixed(2), v4: ans }, `贝叶斯：P(A|B) = P(A)P(B|A)/P(B) = ${a.toFixed(2)}×${b.toFixed(2)}/${c.toFixed(2)} ≈ ${ans}。`);
      } else if (type === 4) {
        const a = rnd(3, 7) / 10, b = rnd(4, 9) / 10, cc = rnd(3, 8) / 10;
        const pb = (a * b + (1 - a) * cc).toFixed(3);
        o = opts(`${pb}`, () => `${(a * b).toFixed(3)}`, () => `${(cc).toFixed(3)}`, () => `${(a).toFixed(3)}`);
        q = G("gen.bayes.uq4", { v1: a.toFixed(1), v2: b.toFixed(1), v3: cc.toFixed(1) }, `A1,A2 完备，P(A1)=${a.toFixed(1)}，P(B|A1)=${b.toFixed(1)}，P(B|A2)=${cc.toFixed(1)}，由全概率公式 P(B) = ？`);
        exp = G("gen.bayes.ue4", { v1: a.toFixed(1), v2: b.toFixed(1), v3: (1 - a).toFixed(1), v4: cc.toFixed(1), v5: pb }, `P(B)=P(A1)P(B|A1)+P(A2)P(B|A2)=${a.toFixed(1)}×${b.toFixed(1)}+${(1 - a).toFixed(1)}×${cc.toFixed(1)}≈${pb}。`);
      } else if (type === 5) {
        const p = rnd(1, 8) / 100, s = rnd(8, 9) / 10, t = rnd(8, 9) / 10;
        const num = p * s, den = num + (1 - p) * (1 - t);
        const ans = (num / den).toFixed(4);
        o = opts(`${ans}`, () => `${(num).toFixed(4)}`, () => `${(s).toFixed(2)}`, () => `${(p).toFixed(3)}`);
        q = G("gen.bayes.uq5", { v1: p.toFixed(2), v2: s.toFixed(1), v3: t.toFixed(1) }, `某病患病率 ${p.toFixed(2)}，检测灵敏度 ${s.toFixed(1)}、特异度 ${t.toFixed(1)}。随机一人检测呈阳性，则其患病概率（贝叶斯）≈ ？`);
        exp = G("gen.bayes.ue5", { v1: ans }, `P(病|阳)=P(病)P(阳|病)/(P(病)P(阳|病)+P(无病)P(阳|无病))≈${ans}。`);
      } else if (type === 6) {
        const a = rnd(3, 8) / 10, b = rnd(2, 8) / 10;
        o = opts(`${(a * b).toFixed(3)}`, () => `${(a + b).toFixed(3)}`, () => `0`, () => `1`);
        q = G("gen.bayes.uq6", { v1: a.toFixed(1), v2: b.toFixed(1) }, `若 A、B 独立，P(A)=${a.toFixed(1)}，P(B)=${b.toFixed(1)}，则 P(A∩B) = ？`);
        exp = G("gen.bayes.ue6", { v1: a.toFixed(1), v2: b.toFixed(1), v3: (a * b).toFixed(3) }, `独立事件 P(A∩B) = P(A)·P(B) = ${a.toFixed(1)}×${b.toFixed(1)} = ${(a * b).toFixed(3)}。`);
      } else if (type === 7) {
        const x = rnd(2, 6) / 10, y = rnd(4, 9) / 10;
        o = opts(`${(x / y).toFixed(3)}`, () => `${(x).toFixed(3)}`, () => `${(y).toFixed(3)}`, () => `${(x * y).toFixed(3)}`);
        q = G("gen.bayes.uq7", { v1: x.toFixed(2), v2: y.toFixed(2) }, `已知 P(A∩B)=${x.toFixed(2)}，P(B)=${y.toFixed(2)}，则条件概率 P(A|B) = ？`);
        exp = G("gen.bayes.ue7", { v1: x.toFixed(2), v2: y.toFixed(2), v3: (x / y).toFixed(3) }, `P(A|B) = P(A∩B)/P(B) = ${x.toFixed(2)}/${y.toFixed(2)} ≈ ${(x / y).toFixed(3)}。`);
      } else if (type === 8) {
        const a = rnd(3, 8) / 10, b = rnd(2, 8) / 10;
        o = opts(`P(A∩B) = P(A)P(B)`, () => `P(A∩B) = 0`, () => `P(A∪B) = 0`, () => `P(A) = P(B)`);
        q = G("gen.bayes.uq8", { v1: a.toFixed(1), v2: b.toFixed(1) }, `已知 P(A)=${a.toFixed(1)}，P(B)=${b.toFixed(1)}，若 A、B 独立则必满足？`);
        exp = G("gen.bayes.ue8", null, `独立等价于 P(A∩B) = P(A)·P(B)。`);
      } else {
        const a = rnd(3, 8) / 10, b = rnd(3, 8) / 10;
        o = opts(`P(A)`, () => `P(B)`, () => `P(A)P(B)`, () => `P(A∪B)`);
        q = G("gen.bayes.uq9", null, `若 A、B 独立，则条件概率 P(A|B) = ？`);
        exp = G("gen.bayes.ue9", null, `独立时 P(A|B) = P(A∩B)/P(B) = P(A)P(B)/P(B) = P(A)。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.bayes.pt0", null, "条件概率与贝叶斯"), "bayes_tree"));
    }
    return results;
  }

  /* ============================================================
   * 拓展第三批：衔接 / 大学预备方法（8 个）
   * ============================================================ */
  function qFullProb(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, o, exp;
      if (type === 0) {
        const p1 = rnd(3, 7) / 10;
        const a = rnd(4, 9) / 10;
        const b = rnd(1, 4) / 10;
        const pb = p1 * a + (1 - p1) * b;
        o = opts(pb.toFixed(2), () => (p1 * a).toFixed(2), () => (a * b).toFixed(2), () => ((1 - p1) * b).toFixed(2));
        q = G("gen.fullprob.0q", { v1: p1.toFixed(1), v2: a.toFixed(1), v3: b.toFixed(1) }, `A1、A2 为完备事件组，P(A1)=${p1.toFixed(1)}，P(B|A1)=${a.toFixed(1)}，P(B|A2)=${b.toFixed(1)}。由全概率公式求 P(B)=？`);
        exp = G("gen.fullprob.1e", { v1: p1.toFixed(1), v2: a.toFixed(1), v3: (1-p1).toFixed(1), v4: b.toFixed(1), v5: pb.toFixed(2) }, `P(B)=P(A1)P(B|A1)+P(A2)P(B|A2)=${p1.toFixed(1)}×${a.toFixed(1)}+${(1-p1).toFixed(1)}×${b.toFixed(1)}=${pb.toFixed(2)}。`);
      } else if (type === 1) {
        const k = rnd(2, 9);
        o = opts(`1/${k}`, () => `1/${k+1}`, () => `2/${k}`, () => `${(k-1)}/${k}`);
        q = G("gen.fullprob.2q", { v1: k }, `抽签问题：共 ${k} 张签中有 1 张中奖，第 1 个人抽中的概率是？`);
        exp = G("gen.fullprob.3e", { v1: k }, `抽签公平：无论先后，每人抽中概率都是 1/${k}。`);
      } else if (type === 2) {
        const p = rnd(1, 6) / 100;
        const sens = rnd(8, 9) / 10;
        const ppos = p * sens + (1 - p) * 0.05;
        o = opts(ppos.toFixed(3), () => (p * sens).toFixed(3), () => sens.toFixed(3), () => p.toFixed(3));
        q = G("gen.fullprob.4q", { v1: p.toFixed(2), v2: sens.toFixed(1) }, `某病患病率 ${p.toFixed(2)}，检测灵敏度 ${sens.toFixed(1)}、误诊率 0.05。随机一人检测呈阳性的概率约为？`);
        exp = G("gen.fullprob.5e", { v1: p.toFixed(2), v2: sens.toFixed(1), v3: (1-p).toFixed(2), v4: ppos.toFixed(3) }, `P(阳性)=P(病)P(阳|病)+P(无病)P(阳|无病)=${p.toFixed(2)}×${sens.toFixed(1)}+${(1-p).toFixed(2)}×0.05≈${ppos.toFixed(3)}。`);
      } else {
        o = opts(G("gen.fullprob.o0", null, "由因导果求总概率"), () => G("gen.fullprob.o1", null, "由果溯因"), () => G("gen.fullprob.o2", null, "求期望"), () => G("gen.fullprob.o3", null, "求方差"));
        q = G("gen.fullprob.s0q", null, "全概率公式主要用于？");
        exp = G("gen.fullprob.s1e", null, "全概率公式由“原因”推“结果”的总概率；贝叶斯公式才是由果溯因。");
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.fullprob.pt0", null, "全概率公式")));
    }
    return results;
  }

  function qNormalApp(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, o, exp;
      if (type === 0) {
        o = opts(G("gen.normal_app.o0", null, "约 68.27%"), () => G("gen.normal_app.o1", null, "约 95.45%"), () => G("gen.normal_app.o2", null, "约 99.74%"), () => G("gen.normal_app.o3", null, "约 50%"));
        q = G("gen.normal_app.s0q", null, "正态分布 N(μ,σ²) 中，落入 [μ−σ, μ+σ] 的概率约为？");
        exp = G("gen.normal_app.s1e", null, "3σ 原则：P(μ−σ<X<μ+σ)≈0.6827（约 68.27%）。");
      } else if (type === 1) {
        o = opts(G("gen.normal_app.o4", null, "约 95.45%"), () => G("gen.normal_app.o5", null, "约 68.27%"), () => G("gen.normal_app.o6", null, "约 99.74%"), () => G("gen.normal_app.o7", null, "约 34.13%"));
        q = G("gen.normal_app.s2q", null, "N(μ,σ²) 中，落入 [μ−2σ, μ+2σ] 的概率约为？");
        exp = G("gen.normal_app.s3e", null, "P(μ−2σ<X<μ+2σ)≈0.9545（约 95.45%）。");
      } else if (type === 2) {
        const mu = rnd(95, 105), sig = rnd(2, 8);
        o = opts(`[${mu-sig}, ${mu+sig}]`, () => `[${mu-2*sig}, ${mu+2*sig}]`, () => `[${mu}, ${mu+sig}]`, () => `[${mu-sig}, ${mu}]`);
        q = G("gen.normal_app.0q", { v1: mu, v2: sig }, `某指标 X~N(${mu}, ${sig}²)，约 68.27% 的数据落在哪个区间？`);
        exp = G("gen.normal_app.1e", { v1: mu-sig, v2: mu+sig }, `[μ−σ, μ+σ] = [${mu-sig}, ${mu+sig}]。`);
      } else {
        o = opts(G("gen.normal_app.o8", null, "μ 决定位置，σ 决定胖瘦"), () => G("gen.normal_app.o9", null, "都决定位置"), () => G("gen.normal_app.o10", null, "都决定胖瘦"), () => G("gen.normal_app.o11", null, "无关"));
        q = G("gen.normal_app.s4q", null, "正态分布参数 μ 与 σ 的几何意义是？");
        exp = G("gen.normal_app.s5e", null, "μ 是对称中心（位置），σ 是离散程度（胖瘦）。");
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.normal_app.pt0", null, "正态分布")));
    }
    return results;
  }

  function qDefiniteInt(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 9);
        o = opts("0", () => "1", () => `${a}`, () => "f(a)");
        q = G("gen.definite_int.uq0", { v1: a, v2: a }, `定积分 ∫_${a}^${a} f(x) dx = ？`);
        exp = G("gen.definite_int.ue0", null, `上下限相同，积分区间长度为 0，故为 0。`);
      } else if (type === 1) {
        const b = rnd(2, 9);
        const ans = b * b + b;
        o = opts(`${ans}`, () => `${b*b}`, () => `${b}`, () => `${(b+1)*(b+1)}`);
        q = G("gen.definite_int.0q", { v1: b }, `∫_0^${b} (2x+1) dx = ？`);
        exp = G("gen.definite_int.1e", { v1: b, v2: b, v3: ans }, `原函数 x²+x，代入得 ${b}²+${b} = ${ans}。`);
      } else if (type === 2) {
        const N = rnd(1, 4);
        o = opts(`${2 * N}`, () => `${N}`, () => `0`, () => `${2 * N + 1}`);
        q = G("gen.definite_int.uq1", { v1: N }, `∫_0^${N}π |sin x| dx = ？（每个半周期面积为 2）`);
        exp = G("gen.definite_int.ue1", { v1: N, v2: N, v3: 2 * N }, `|sin x| 每 π 面积为 2，共 ${N} 段 → 2×${N} = ${2 * N}。`);
      } else if (type === 3) {
        const a = rnd(1, 4), b = a + rnd(1, 4), c = b + rnd(1, 4);
        o = opts(`∫_a^c = ∫_a^b + ∫_b^c`, () => `∫_a^c = ∫_a^b − ∫_b^c`, () => G("gen.definite_int.uo0", null, `∫_a^c = ∫_a^b · ∫_b^c`), () => `∫_a^c = 0`);
        q = G("gen.definite_int.uq2", { v1: a, v2: b, v3: c }, `定积分的区间可加性（a=${a},b=${b},c=${c}）是？`);
        exp = G("gen.definite_int.ue2", null, `∫_a^c f(x)dx = ∫_a^b f(x)dx + ∫_b^c f(x)dx（b 在 a、c 之间）。`);
      } else if (type === 4) {
        const b = rnd(2, 9);
        o = opts(`${(b * b / 2).toFixed(1)}`, () => `${b * b}`, () => `${b}`, () => `${(b*b/2 + 1).toFixed(1)}`);
        q = G("gen.definite_int.uq3", { v1: b }, `∫_0^${b} x dx = ？`);
        exp = G("gen.definite_int.ue3", { v1: b, v2: b, v3: (b*b/2).toFixed(1) }, `原函数 x²/2，代入 0..${b} 得 ${b}²/2 = ${(b*b/2).toFixed(1)}。`);
      } else if (type === 5) {
        const b = rnd(2, 6);
        o = opts(`${b * b * b}`, () => `${b * b}`, () => `${b}`, () => `${3 * b * b}`);
        q = G("gen.definite_int.uq4", { v1: b }, `∫_0^${b} 3x² dx = ？`);
        exp = G("gen.definite_int.ue4", { v1: b, v2: b, v3: b * b * b }, `原函数 x³，代入 0..${b} 得 ${b}³ = ${b * b * b}。`);
      } else if (type === 6) {
        const k = rnd(1, 3), b = rnd(1, 3);
        const val = ((Math.exp(k * b) - 1) / k).toFixed(2);
        o = opts(`${val}`, () => `${(Math.exp(k * b)).toFixed(2)}`, () => `${(b).toFixed(2)}`, () => `${(Math.exp(b) - 1).toFixed(2)}`);
        q = G("gen.definite_int.uq5", { v1: b, v2: k }, `∫_0^${b} e^(${k}x) dx = ？`);
        exp = G("gen.definite_int.ue5", { v1: k, v2: k, v3: k * b, v4: k, v5: val }, `原函数 e^(${k}x)/${k}，代入得 (e^(${k * b})−1)/${k} ≈ ${val}。`);
      } else if (type === 7) {
        const b = rnd(2, 8);
        const val = Math.sin(b).toFixed(2);
        o = opts(`${val}`, () => `${Math.cos(b).toFixed(2)}`, () => `${b}`, () => `0`);
        q = G("gen.definite_int.uq6", { v1: b }, `∫_0^${b} cos x dx = ？`);
        exp = G("gen.definite_int.ue6", { v1: b, v2: val }, `原函数 sin x，代入得 sin ${b} ≈ ${val}。`);
      } else if (type === 8) {
        const a = rnd(2, 8), b = rnd(2, 8);
        o = opts(`${a * b}`, () => `${a}`, () => `${b}`, () => `${a + b}`);
        q = G("gen.definite_int.uq7", { v1: b, v2: a }, `∫_0^${b} ${a} dx = ？（常数积分）`);
        exp = G("gen.definite_int.ue7", { v1: a, v2: b, v3: a * b }, `常数积分 = ${a} × (${b}−0) = ${a * b}。`);
      } else {
        const b = rnd(2, 6);
        o = opts("0", () => `${b * b}`, () => `${b}`, () => `${2 * b}`);
        q = G("gen.definite_int.uq8", { v1: (-b), v2: b }, `∫_${(-b)}^${b} x³ dx = ？（被积函数为奇函数）`);
        exp = G("gen.definite_int.ue8", null, `x³ 为奇函数，对称区间积分 = 0。`);
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.definite_int.pt0", null, "定积分")));
    }
    return results;
  }

  function qDiffEq(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const k = rnd(1, 12);
        o = opts(G("gen.diffeq.uo0", { v1: k }, `y = C·e^{${k}x}`), () => G("gen.diffeq.uo1", { v1: k }, `y = C·x^${k}`), () => `y = e^{${k}x} + C`, () => G("gen.diffeq.uo2", { v1: k }, `y = C·${k}x`));
        q = G("gen.diffeq.uq0", { v1: k }, `微分方程 dy/dx = ${k}y 的通解是？`);
        exp = G("gen.diffeq.ue0", { v1: k, v2: k, v3: k }, `分离变量：dy/y = ${k}dx → ln|y| = ${k}x + C → y = C·e^{${k}x}。`);
      } else if (type === 1) {
        const m = rnd(1, 12);
        o = opts(`y = ${m / 2}x² + C`, () => `y = ${m}x² + C`, () => `y = x^${m} + C`, () => `y = e^${m}x + C`);
        q = G("gen.diffeq.uq1", { v1: m }, `dy/dx = ${m}x 的通解是？`);
        exp = G("gen.diffeq.ue1", { v1: m, v2: m }, `两边积分：y = ∫${m}x dx = (${m}/2)x² + C。`);
      } else if (type === 2) {
        const a = rnd(2, 12);
        o = opts(`y² = ${a}x² + C`, () => `y² = x² + C`, () => `y = ${a}x + C`, () => `y² = ${a}x + C`);
        q = G("gen.diffeq.uq2", { v1: a }, `由 dy/dx = ${a}x/y（y≠0）分离变量并积分得？`);
        exp = G("gen.diffeq.ue2", { v1: a, v2: a, v3: a }, `y dy = ${a}x dx → y²/2 = ${a}x²/2 + C → y² = ${a}x² + C（C 任意常数）。`);
      } else if (type === 3) {
        const k = rnd(1, 12);
        o = opts(G("gen.diffeq.uo3", null, "含未知函数导数的方程"), () => G("gen.diffeq.uo4", null, "代数方程"), () => G("gen.diffeq.uo5", null, "不等式"), () => G("gen.diffeq.uo6", null, "积分方程"));
        q = G("gen.diffeq.uq3", { v1: k }, `微分方程 dy/dx = ${k}y 在概念上是指？`);
        exp = G("gen.diffeq.ue3", null, "含有未知函数及其导数（或微分）的方程，称为微分方程。");
      } else if (type === 4) {
        const k = rnd(1, 12);
        o = opts(`y = ${k}x + C`, () => `y = ${k}x² + C`, () => G("gen.diffeq.uo7", { v1: k }, `y = C·e^${k}x`), () => `y = ${k} + C`);
        q = G("gen.diffeq.uq4", { v1: k }, `dy/dx = ${k}（导数等于常数）的通解是？`);
        exp = G("gen.diffeq.ue4", { v1: k }, `直接积分：y = ${k}x + C（直线族）。`);
      } else if (type === 5) {
        const b = rnd(1, 12);
        o = opts(G("gen.diffeq.uo8", { v1: b / 2 }, `y = ${b / 2}x² + C1·x + C2`), () => G("gen.diffeq.uo9", null, `y = C1·x + C2`), () => G("gen.diffeq.uo10", null, `y = C·e^x`), () => `y = ${b}x + C2`);
        q = G("gen.diffeq.uq5", { v1: b }, `二阶方程 y'' = ${b}（常数）的通解是？`);
        exp = G("gen.diffeq.ue5", { v1: b, v2: b }, `两次积分：y' = ${b}x + C1，y = (${b}/2)x² + C1·x + C2。`);
      } else if (type === 6) {
        const k = rnd(1, 8), A = rnd(2, 12);
        o = opts(G("gen.diffeq.uo11", { v1: A, v2: k }, `y = ${A}·e^{${k}x}`), () => G("gen.diffeq.uo12", { v1: k }, `y = C·e^(${k}x)`), () => G("gen.diffeq.uo13", { v1: A, v2: k }, `y = ${A}·e^(${k}x) + 1`), () => `y = ${A}x + C`);
        q = G("gen.diffeq.uq6", { v1: k, v2: A }, `初值问题 dy/dx = ${k}y，y(0) = ${A} 的特解是？`);
        exp = G("gen.diffeq.ue6", { v1: k, v2: A, v3: A, v4: k }, `通解 y = C·e^(${k}x)，代入 x=0 得 C = ${A}，故 y = ${A}·e^(${k}x)。`);
      } else if (type === 7) {
        const p = rnd(1, 12);
        o = opts(G("gen.diffeq.uo14", { v1: p }, `y = C·e^(−${p}x)`), () => G("gen.diffeq.uo15", { v1: p }, `y = C·e^(${p}x)`), () => G("gen.diffeq.uo16", null, `y = C·x`), () => G("gen.diffeq.uo17", { v1: p }, `y = ${p}·e^(−x)`));
        q = G("gen.diffeq.uq7", { v1: p }, `dy/dx + ${p}y = 0 的通解是？`);
        exp = G("gen.diffeq.ue7", { v1: p, v2: p }, `分离变量 dy/y = −${p}dx → y = C·e^(−${p}x)。`);
      } else if (type === 8) {
        o = opts(G("gen.diffeq.uo18", null, "y = C·x"), () => G("gen.diffeq.uo19", null, "y = C·x²"), () => G("gen.diffeq.uo20", null, "y = C·e^x"), () => "y = ln x + C");
        q = G("gen.diffeq.uq8", null, "齐次方程 dy/dx = y/x（x≠0）的通解是？");
        exp = G("gen.diffeq.ue8", null, "分离变量 dy/y = dx/x → ln|y| = ln|x| + C → y = C·x。");
      } else {
        const k = rnd(1, 8), A = rnd(1, 12);
        o = opts(G("gen.diffeq.uo21", { v1: A, v2: k }, `y = ${A} + C·e^(${k}x)`), () => G("gen.diffeq.uo22", { v1: A, v2: k }, `y = ${A}·e^(${k}x)`), () => G("gen.diffeq.uo23", { v1: k }, `y = C·e^(${k}x)`), () => G("gen.diffeq.uo24", { v1: A }, `y = ${A} + C·x`));
        q = G("gen.diffeq.uq9", { v1: k, v2: A }, `方程 dy/dx = ${k}(y − ${A}) 的通解是？`);
        exp = G("gen.diffeq.ue9", { v1: A, v2: k, v3: k, v4: A, v5: k }, `令 u = y − ${A}，则 du/dx = ${k}u → u = C·e^(${k}x)，故 y = ${A} + C·e^(${k}x)。`);
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.diffeq.pt0", null, "微分方程")));
    }
    return results;
  }

  function qIneqScale(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const nn = rnd(2, 18);
        o = opts(`1/(${nn}(${nn}+1)) < 1/${nn}`, () => `1/(${nn}(${nn}+1)) > 1/${nn}`, () => `1/(${nn}(${nn}+1)) = 1/${nn}`, () => `1/(${nn}(${nn}+1)) > 1/${nn}²`);
        q = G("gen.ineq_scale.uq0", { v1: nn }, `放缩技巧：当 n=${nn}>0 时，1/(n(n+1)) 与 1/n 的关系是？（裂项放缩基础）`);
        exp = G("gen.ineq_scale.ue0", null, `分母 n(n+1) > n，故 1/(n(n+1)) < 1/n。常用于把级数放缩成易求和形式。`);
      } else if (type === 1) {
        const N = rnd(2, 12);
        o = opts(`1/((n-1)n)`, () => `1/n²`, () => `1/(n+1)`, () => `1/(2n)`);
        q = G("gen.ineq_scale.uq1", { v1: N }, `证明 Σ_{n=${N}}^∞ 1/n² 收敛，可把通项 1/n² 放缩为（便于裂项）？`);
        exp = G("gen.ineq_scale.ue1", null, `对 n≥2，1/n² < 1/((n-1)n) = 1/(n-1) − 1/n，裂项求和得上界。`);
      } else if (type === 2) {
        const a = rnd(2, 15);
        o = opts(`a_n ≤ ${a}`, () => `a_n ≥ ${a}`, () => `a_n = ${a}`, () => `a_n < 0`);
        q = G("gen.ineq_scale.uq2", { v1: a }, `已知 0<a_n≤${a} 且 {a_n} 单调递减，则对任意 n 有 a_n ？`);
        exp = G("gen.ineq_scale.ue2", { v1: a, v2: a }, `单调递减且首项 ≤ ${a} ⇒ 之后每项 a_n ≤ a_1 ≤ ${a}。`);
      } else if (type === 3) {
        const N = rnd(3, 18);
        o = opts(G("gen.ineq_scale.uo0", null, "把难求的式放缩到易求范围"), () => G("gen.ineq_scale.uo1", null, "精确计算"), () => G("gen.ineq_scale.uo2", null, "求导"), () => G("gen.ineq_scale.uo3", null, "积分"));
        q = G("gen.ineq_scale.uq3", { v1: N }, `用放缩法估计 Σ_{k=1}^{${N}} 1/k 的上界时，主要思路是？`);
        exp = G("gen.ineq_scale.ue3", null, `当精确值难求时，把目标式放缩到容易求和/比较的范围，从而证明不等式或估计大小。`);
      } else if (type === 4) {
        const nn = rnd(2, 18);
        o = opts(`1/${nn} − 1/(${nn}+1)`, () => `1/${nn} + 1/(${nn}+1)`, () => `1/${nn} − 1/${nn}`, () => `1/(${nn}+1) − 1/${nn}`);
        q = G("gen.ineq_scale.uq4", { v1: nn }, `裂项放缩：1/(n(n+1))（取 n=${nn}）可拆成？`);
        exp = G("gen.ineq_scale.ue4", { v1: nn, v2: nn, v3: nn }, `1/(n(n+1)) = 1/n − 1/(n+1)，故 n=${nn} 时为 1/${nn} − 1/(${nn}+1)。`);
      } else if (type === 5) {
        const N = rnd(2, 12);
        o = opts(G("gen.ineq_scale.uo4", null, "也收敛"), () => G("gen.ineq_scale.uo5", null, "必发散"), () => G("gen.ineq_scale.uo6", null, "和为 0"), () => G("gen.ineq_scale.uo7", null, "无法判断"));
        q = G("gen.ineq_scale.uq5", { v1: N }, `比较判别：若对 n≥${N} 有 0≤a_n≤b_n 且 Σ b_n 收敛，则 Σ a_n ？`);
        exp = G("gen.ineq_scale.ue5", null, `小者被收敛级数控制，由比较判别法 Σ a_n 也收敛。`);
      } else if (type === 6) {
        const nn = rnd(2, 18);
        o = opts(`1/√${nn} > 2(√(${nn}+1) − √${nn})`, () => `1/√${nn} < 2(√(${nn}+1) − √${nn})`, () => `=`, () => `1/√${nn} = √(${nn}+1) − √${nn}`);
        q = G("gen.ineq_scale.uq6", { v1: nn }, `根式放缩：比较 1/√n（取 n=${nn}）与 2(√(n+1) − √n) 的大小？`);
        exp = G("gen.ineq_scale.ue6", null, `2(√(n+1)−√n) = 2/(√(n+1)+√n) < 2/(2√n) = 1/√n，故 1/√n 更大。`);
      } else if (type === 7) {
        const N = rnd(2, 12);
        o = opts(G("gen.ineq_scale.uo8", { v1: N }, `1/n! ≤ 1/2^{n-1}（n≥${N}）`), () => `1/n! ≥ 1/2^{n-1}`, () => `1/n! = 1/2^{n-1}`, () => `1/n! ≤ 1/n`);
        q = G("gen.ineq_scale.uq7", { v1: N }, `证明 Σ 1/n! 收敛，可放缩（对 n≥${N}）为？`);
        exp = G("gen.ineq_scale.ue7", null, `n! ≥ 2^{n-1}（n≥1），故 1/n! ≤ 1/2^{n-1}，等比级数收敛 ⇒ 原级数收敛。`);
      } else if (type === 8) {
        const nn = rnd(3, 8);
        o = opts(`1/(${nn}-1) − 1/${nn}`, () => `1/(${nn}-1) + 1/${nn}`, () => `1/${nn} − 1/(${nn}-1)`, () => G("gen.ineq_scale.uo9", { v1: nn, v2: nn }, `1/(${nn}·${nn})`));
        q = G("gen.ineq_scale.uq8", { v1: nn }, `裂项：1/((n-1)n)（取 n=${nn}）等于？`);
        exp = G("gen.ineq_scale.ue8", { v1: nn, v2: nn, v3: nn }, `1/((n-1)n) = 1/(n-1) − 1/n，故 n=${nn} 时为 1/(${nn}-1) − 1/${nn}。`);
      } else {
        const N = rnd(2, 5);
        o = opts(`Σ a_n < 2`, () => `Σ a_n > 2`, () => `Σ a_n = 2`, () => `Σ a_n < 1`);
        q = G("gen.ineq_scale.uq9", { v1: N, v2: N }, `若对 n≥${N} 有 0<a_n<1/n²，则由放缩可知 Σ_{n=${N}}^∞ a_n ？`);
        exp = G("gen.ineq_scale.ue9", null, `Σ 1/n² < 1 + Σ_{n=2}∞ 1/((n-1)n) = 1+1 = 2，故 Σ a_n < 2。`);
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.ineq_scale.pt0", null, "放缩法")));
    }
    return results;
  }

  function qSeqIneq(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const M = rnd(3, 15);
        o = opts(G("gen.seq_ineq.uo0", null, "数学归纳法"), () => G("gen.seq_ineq.uo1", null, "代入法"), () => G("gen.seq_ineq.uo2", null, "配方法"), () => G("gen.seq_ineq.uo3", null, "换元法"));
        q = G("gen.seq_ineq.uq0", { v1: M }, `证明对一切 n∈N* 都有 a_n < ${M}，最常用的方法是？`);
        exp = G("gen.seq_ineq.ue0", null, `由 n=1 验证、假设 n=k 再推 n=k+1，即数学归纳法。`);
      } else if (type === 1) {
        const N = rnd(3, 15);
        o = opts(G("gen.seq_ineq.uo4", null, "单调有界数列必收敛"), () => G("gen.seq_ineq.uo5", null, "单调必发散"), () => G("gen.seq_ineq.uo6", null, "有界必发散"), () => G("gen.seq_ineq.uo7", null, "无界必收敛"));
        q = G("gen.seq_ineq.uq1", { v1: N }, `对前 ${N} 项组成的数列，极限存在准则“单调有界定理”内容是？`);
        exp = G("gen.seq_ineq.ue1", null, `单调递增（减）且有上（下）界的数列必收敛。`);
      } else if (type === 2) {
        const c = rnd(2, 15);
        o = opts(`≤ ${c}`, () => `≥ ${c}`, () => `= ${c}`, () => `< 0`);
        q = G("gen.seq_ineq.uq2", { v1: c }, `已知 a_1 = ${c} 且数列 {a_n} 单调递减，则对任意 n 有 a_n ？`);
        exp = G("gen.seq_ineq.ue2", { v1: c }, `单调递减 ⇒ a_n ≤ a_1 = ${c}。`);
      } else if (type === 3) {
        const M = rnd(3, 15);
        o = opts(G("gen.seq_ineq.uo8", null, "先放缩再求和"), () => G("gen.seq_ineq.uo9", null, "直接求通项"), () => G("gen.seq_ineq.uo10", null, "求导"), () => G("gen.seq_ineq.uo11", null, "积分"));
        q = G("gen.seq_ineq.uq3", { v1: M }, `证明 Σ a_n < ${M}（a_n>0）常用思路？`);
        exp = G("gen.seq_ineq.ue3", null, `先放缩 a_n 到可求和的已知数列（如等比、裂项），再求和得上界。`);
      } else if (type === 4) {
        const c = rnd(2, 15);
        o = opts(`≥ ${c}`, () => `≤ ${c}`, () => `= ${c}`, () => `< 0`);
        q = G("gen.seq_ineq.uq4", { v1: c }, `已知 a_1 = ${c} 且数列 {a_n} 单调递增，则对任意 n 有 a_n ？`);
        exp = G("gen.seq_ineq.ue4", { v1: c }, `单调递增 ⇒ a_n ≥ a_1 = ${c}。`);
      } else if (type === 5) {
        const M = rnd(3, 15);
        o = opts(`L ≤ ${M}`, () => `L ≥ ${M}`, () => `L = ${M}`, () => `L > ${M}`);
        q = G("gen.seq_ineq.uq5", { v1: M }, `若 a_n → L（极限存在）且对每个 n 有 a_n < ${M}，则极限 L 满足？`);
        exp = G("gen.seq_ineq.ue5", { v1: M, v2: M }, `极限保号（保不等式）：由 a_n < ${M} 恒成立，得 L ≤ ${M}。`);
      } else if (type === 6) {
        const L = rnd(1, 12);
        o = opts(`a_n → ${L}`, () => `a_n → 0`, () => G("gen.seq_ineq.uo12", null, `a_n 发散`), () => `a_n → ${L + 1}`);
        q = G("gen.seq_ineq.uq6", { v1: L, v2: L }, `若 b_n ≤ a_n ≤ c_n 且 b_n → ${L}、c_n → ${L}，则由夹逼定理 a_n ？`);
        exp = G("gen.seq_ineq.ue6", { v1: L, v2: L }, `夹逼定理：双边被同极限 ${L} 控制，故 a_n → ${L}。`);
      } else if (type === 7) {
        const N = rnd(2, 10);
        o = opts(G("gen.seq_ineq.uo13", null, "也收敛"), () => G("gen.seq_ineq.uo14", null, "必发散"), () => G("gen.seq_ineq.uo15", null, "和为 0"), () => G("gen.seq_ineq.uo16", null, "无法判断"));
        q = G("gen.seq_ineq.uq7", { v1: N }, `比较判别：若对 n≥${N} 有 0≤a_n≤b_n 且 Σ b_n 收敛，则 Σ a_n ？`);
        exp = G("gen.seq_ineq.ue7", null, `小者被收敛级数控制，由比较判别法 Σ a_n 也收敛。`);
      } else if (type === 8) {
        const A = rnd(2, 12), r = rnd(2, 9);
        o = opts(`≤ ${A}`, () => `≥ ${A}`, () => `= ${A}`, () => `< 0`);
        q = G("gen.seq_ineq.uq8", { v1: A, v2: r, v3: r }, `数列 a_n = ${A}·(${r}/10)^n（|${r}/10|<1），则 |a_n| 满足？`);
        exp = G("gen.seq_ineq.ue8", { v1: r, v2: A, v3: r, v4: A }, `|${r}/10|<1 ⇒ |a_n| = ${A}·(${r}/10)^n ≤ ${A}，且 a_n → 0。`);
      } else {
        const B = rnd(2, 12);
        o = opts(G("gen.seq_ineq.uo17", null, "收敛"), () => G("gen.seq_ineq.uo18", null, "发散"), () => G("gen.seq_ineq.uo19", null, "趋于 ∞"), () => G("gen.seq_ineq.uo20", null, "无界"));
        q = G("gen.seq_ineq.uq9", { v1: B }, `若 a_{n+1} ≤ a_n（递减）且对所有 n 有 a_n ≥ ${B}（有下界），则 {a_n} ？`);
        exp = G("gen.seq_ineq.ue9", { v1: B }, `单调递减且有下界（≥ ${B}），由单调有界定理知 {a_n} 收敛。`);
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.seq_ineq.pt0", null, "数列不等式")));
    }
    return results;
  }

  function qComplexGeo(n) {
    const results = [];
    const fmt = (re, im) => (im >= 0 ? `${re} + ${im}i` : `${re} − ${-im}i`);
    const ANG = [30, 45, 60, 90, 120, 135, 150, 180];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 6), b = rnd(1, 6);
        const r = Math.sqrt(a * a + b * b);
        o = opts(`${r.toFixed(2)}`, () => `${a}`, () => `${b}`, () => `${(a + b)}`);
        q = G("gen.complex_geo.uq0", { v1: a, v2: b }, `复数 z = ${a} + ${b}i 的模 |z|（几何意义：到原点距离）为？`);
        exp = G("gen.complex_geo.ue0", { v1: a, v2: b, v3: r.toFixed(2) }, `|z| = √(a²+b²) = √(${a}²+${b}²) = ${r.toFixed(2)}。`);
      } else if (type === 1) {
        const a = rnd(2, 5), b = rnd(1, 4);
        o = opts(`${b} − ${a}i`, () => `${a} + ${b}i`, () => `−${a} + ${b}i`, () => `${b} + ${a}i`);
        q = G("gen.complex_geo.2q", { v1: a, v2: b }, `复数 z = ${a} + ${b}i 乘 i 后等于？（i·(a+bi)）`);
        exp = G("gen.complex_geo.3e", { v1: b, v2: a }, `i(a+bi) = ai + bi² = −b + ai = ${b}−${a}i（相当于逆时针旋转 90°）。`);
      } else if (type === 2) {
        const a = rnd(1, 5), b = rnd(1, 4);
        o = opts(G("gen.complex_geo.uo0", null, "关于实轴对称"), () => G("gen.complex_geo.uo1", null, "关于原点对称"), () => G("gen.complex_geo.uo2", null, "逆时针转 90°"), () => G("gen.complex_geo.uo3", null, "放大"));
        q = G("gen.complex_geo.uq1", { v1: a, v2: b }, `复数 z = ${a} + ${b}i 与它的共轭 z̄ 在复平面上的位置关系是？`);
        exp = G("gen.complex_geo.ue1", null, `z=a+bi 与 z̄=a−bi 实部相同、虚部相反，关于实轴对称。`);
      } else if (type === 3) {
        const a = rnd(1, 5), b = rnd(1, 5);
        o = opts(G("gen.complex_geo.uo4", null, "辐角 arg(z)"), () => G("gen.complex_geo.uo5", null, "模长"), () => G("gen.complex_geo.uo6", null, "实部"), () => G("gen.complex_geo.uo7", null, "虚部"));
        q = G("gen.complex_geo.uq2", { v1: a, v2: b }, `复数 z = ${a} + ${b}i 对应向量与正实轴的夹角称为？`);
        exp = G("gen.complex_geo.ue2", null, `该夹角称为辐角 arg(z)，由 tanθ = b/a 确定（注意象限）。`);
      } else if (type === 4) {
        const a1 = rnd(1, 6), b1 = rnd(1, 5), a2 = rnd(1, 6), b2 = rnd(1, 5);
        const re = a1 + a2, im = b1 + b2;
        o = opts(fmt(re, im), () => fmt(a1 - a2, b1 - b2), () => fmt(a1 + a2, b1 - b2), () => fmt(a1, b2));
        q = G("gen.complex_geo.uq3", { v1: a1, v2: b1, v3: a2, v4: b2 }, `复数加法 (${a1}+${b1}i) + (${a2}+${b2}i) = ？`);
        exp = G("gen.complex_geo.ue3", { v1: a1, v2: a2, v3: b1, v4: b2, v5: fmt(re, im) }, `实部相加、虚部相加：(${a1}+${a2}) + (${b1}+${b2})i = ${fmt(re, im)}。`);
      } else if (type === 5) {
        const a1 = rnd(1, 5), b1 = rnd(1, 4), a2 = rnd(1, 5), b2 = rnd(1, 4);
        const re = a1 * a2 - b1 * b2;
        const imv = a1 * b2 + b1 * a2;
        o = opts(fmt(re, imv), () => fmt(a1 * a2, b1 * b2), () => fmt(re, -imv), () => fmt(a1 + a2, b1 + b2));
        q = G("gen.complex_geo.uq4", { v1: a1, v2: b1, v3: a2, v4: b2 }, `复数乘法 (${a1}+${b1}i)(${a2}+${b2}i) = ？`);
        exp = G("gen.complex_geo.ue4", { v1: a1, v2: a2, v3: b1, v4: b2, v5: a1, v6: b2, v7: b1, v8: a2, v9: fmt(re, imv) }, `= (${a1}${a2}−${b1}${b2}) + (${a1}${b2}+${b1}${a2})i = ${fmt(re, imv)}。`);
      } else if (type === 6) {
        const a1 = rnd(1, 5), b1 = rnd(1, 4), a2 = rnd(1, 5), b2 = rnd(1, 4);
        const r1 = Math.sqrt(a1 * a1 + b1 * b1), r2 = Math.sqrt(a2 * a2 + b2 * b2);
        o = opts(`${(r1 / r2).toFixed(2)}`, () => `${(r2 / r1).toFixed(2)}`, () => `${(r1 + r2).toFixed(2)}`, () => `${(r1 * r2).toFixed(2)}`);
        q = G("gen.complex_geo.uq5", { v1: a1, v2: b1, v3: a2, v4: b2 }, `复数 z₁=${a1}+${b1}i、z₂=${a2}+${b2}i，则 |z₁/z₂| = ？`);
        exp = G("gen.complex_geo.ue5", { v1: r1.toFixed(2), v2: r2.toFixed(2), v3: (r1 / r2).toFixed(2) }, `商的模 = 模的商：|z₁/z₂| = |z₁|/|z₂| = ${r1.toFixed(2)}/${r2.toFixed(2)} ≈ ${(r1 / r2).toFixed(2)}。`);
      } else if (type === 7) {
        const t1 = pick(ANG), t2 = pick(ANG);
        const sum = (t1 + t2) % 360;
        o = opts(`${sum}°`, () => `${t1}°`, () => `${t2}°`, () => `${(t1 - t2 + 360) % 360}°`);
        q = G("gen.complex_geo.uq6", { v1: t1, v2: t2 }, `复数 z₁ 辐角 ${t1}°、z₂ 辐角 ${t2}°，则 z₁·z₂ 的辐角是？`);
        exp = G("gen.complex_geo.ue6", { v1: t1, v2: t2, v3: sum }, `乘积辐角 = 辐角之和（模 360）：${t1}°+${t2}° = ${sum}°。`);
      } else if (type === 8) {
        const a = rnd(1, 6), b = rnd(1, 6);
        const den = a * a + b * b;
        o = opts(fmt((a / den).toFixed(3), (-b / den).toFixed(3)), () => fmt((a / den).toFixed(3), (b / den).toFixed(3)), () => `${a} + ${b}i`, () => `${den}`);
        q = G("gen.complex_geo.uq7", { v1: a, v2: b }, `求 1/(${a}+${b}i) = ？`);
        exp = G("gen.complex_geo.ue7", { v1: a, v2: b, v3: a, v4: b, v5: den, v6: fmt((a / den).toFixed(3), (-b / den).toFixed(3)) }, `分子分母同乘共轭：${a}−${b}i 除以 (${a})²+(${b})² = ${den}，得 ${fmt((a / den).toFixed(3), (-b / den).toFixed(3))}。`);
      } else {
        const a = rnd(1, 6), b = rnd(1, 6);
        o = opts(`${a * a + b * b}`, () => `${a * a - b * b}`, () => `${2 * a * b}`, () => `${a + b}`);
        q = G("gen.complex_geo.uq8", { v1: a, v2: b }, `复数 z = ${a}+${b}i 与共轭乘积 z·z̄ = ？`);
        exp = G("gen.complex_geo.ue8", { v1: a, v2: b, v3: a, v4: b, v5: a, v6: b, v7: a * a + b * b }, `z·z̄ = (${a}+${b}i)(${a}−${b}i) = ${a}²+${b}² = ${a * a + b * b} = |z|²。`);
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.complex_geo.pt0", null, "复数几何")));
    }
    return results;
  }

  function qSeries(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 9);
        o = opts("|r| < 1", () => "|r| > 1", () => "r > 0", () => "r < 1");
        q = G("gen.series.uq0", { v1: a }, `等比级数 Σ_{n=0}^∞ ${a}·rⁿ 收敛的充要条件是（r 为公比）？`);
        exp = G("gen.series.ue0", null, "公比绝对值 |r| < 1 时收敛，否则发散。");
      } else if (type === 1) {
        const N = rnd(2, 9);
        o = opts("p > 1", () => "p > 0", () => "p ≥ 1", () => "p < 1");
        q = G("gen.series.uq1", { v1: N }, `p 级数 Σ_{n=1}^${N} 1/n^p（取极限 n→∞）收敛的条件是？`);
        exp = G("gen.series.ue1", null, "p > 1 收敛，p ≤ 1 发散（p=1 为调和级数，发散）。");
      } else if (type === 2) {
        const N = rnd(10, 99);
        o = opts(G("gen.series.uo0", null, "发散"), () => G("gen.series.uo1", null, "收敛于 1"), () => G("gen.series.uo2", null, "收敛于 0"), () => G("gen.series.uo3", null, "收敛于 ln2"));
        q = G("gen.series.uq2", { v1: N }, `调和级数 Σ_{n=1}^${N} 1/n（与无穷级数同敛散）的敛散性是？`);
        exp = G("gen.series.ue2", null, "调和级数发散（虽通项趋于 0，但部分和趋于 ∞）。");
      } else if (type === 3) {
        const r = rnd(2, 6) / 10;
        const sum = r / (1 - r);
        o = opts(`${sum.toFixed(2)}`, () => `${r.toFixed(2)}`, () => `${(1/(1-r)).toFixed(2)}`, () => `${(r*r).toFixed(2)}`);
        q = G("gen.series.uq3", { v1: r.toFixed(1), v2: r.toFixed(1), v3: r.toFixed(1) }, `级数 Σ_{n=1}^∞ ${r.toFixed(1)}ⁿ 的和（首项 ${r.toFixed(1)}、公比 ${r.toFixed(1)}）是？`);
        exp = G("gen.series.ue3", { v1: r.toFixed(1), v2: r.toFixed(1), v3: sum.toFixed(2) }, `等比求和（从 n=1 起）= a/(1−r) = ${r.toFixed(1)}/(1−${r.toFixed(1)}) = ${sum.toFixed(2)}。`);
      } else if (type === 4) {
        const a = rnd(2, 8), r = rnd(2, 6) / 10;
        const sum = a / (1 - r);
        o = opts(`${sum.toFixed(2)}`, () => `${(a*r).toFixed(2)}`, () => `${(a).toFixed(2)}`, () => `${(a/(1+r)).toFixed(2)}`);
        q = G("gen.series.uq4", { v1: a, v2: r.toFixed(1), v3: a, v4: r.toFixed(1) }, `级数 Σ_{n=0}^∞ ${a}·(${r.toFixed(1)})ⁿ（首项 ${a}、公比 ${r.toFixed(1)}）的和是？`);
        exp = G("gen.series.ue4", { v1: a, v2: r.toFixed(1), v3: sum.toFixed(2) }, `等比求和（从 n=0 起）= a/(1−r) = ${a}/(1−${r.toFixed(1)}) = ${sum.toFixed(2)}。`);
      } else if (type === 5) {
        o = opts(G("gen.series.uo4", null, "≈ 0.693（ln 2）"), () => G("gen.series.uo5", null, "发散"), () => "= 1", () => "= 0");
        q = G("gen.series.uq5", null, "交错调和级数 Σ_{n=1}^∞ (−1)^{n−1}/n 的和收敛于？");
        exp = G("gen.series.ue5", null, "交错级数满足莱布尼茨条件，收敛到 ln 2 ≈ 0.693。");
      } else if (type === 6) {
        const N = rnd(2, 6);
        o = opts(G("gen.series.uo6", null, "也收敛"), () => G("gen.series.uo7", null, "必发散"), () => G("gen.series.uo8", null, "和为 0"), () => G("gen.series.uo9", null, "无法判断"));
        q = G("gen.series.uq6", { v1: N }, `比较判别：若对 n≥${N} 有 0≤a_n≤b_n 且 Σ b_n 收敛，则 Σ a_n ？`);
        exp = G("gen.series.ue6", null, "小者被收敛级数控制，由比较判别法 Σ a_n 也收敛。");
      } else if (type === 7) {
        const L = rnd(2, 8) / 10;
        o = opts(G("gen.series.uo10", null, "收敛"), () => G("gen.series.uo11", null, "发散"), () => G("gen.series.uo12", null, "条件收敛"), () => G("gen.series.uo13", null, "无法判断"));
        q = G("gen.series.uq7", { v1: L.toFixed(1) }, `比值判别：若 lim|a_{n+1}/a_n| = ${L.toFixed(1)} < 1，则正项级数 Σ a_n ？`);
        exp = G("gen.series.ue7", null, "比值极限 L = ${L.toFixed(1)} < 1，由比值判别法级数收敛。");
      } else if (type === 8) {
        const N = rnd(2, 9);
        o = opts(G("gen.series.uo14", null, "≈ 1.645（π²/6）"), () => "= 1", () => G("gen.series.uo15", null, "发散"), () => "= 2");
        q = G("gen.series.uq8", { v1: N }, `巴塞尔问题：Σ_{n=1}^${N} 1/n²（取 n→∞ 极限）的和是？`);
        exp = G("gen.series.ue8", null, "Σ 1/n² = π²/6 ≈ 1.645（著名结果）。");
      } else {
        const a = rnd(1, 5), r = rnd(2, 6) / 10, N = rnd(3, 7);
        const s = a * (1 - Math.pow(r, N)) / (1 - r);
        o = opts(`${s.toFixed(2)}`, () => `${(a * (1 - Math.pow(r, N + 1)) / (1 - r)).toFixed(2)}`, () => `${(a * N).toFixed(2)}`, () => `${(a / (1 - r)).toFixed(2)}`);
        q = G("gen.series.uq9", { v1: N, v2: a, v3: r.toFixed(1) }, `有限等比和 Σ_{n=0}^{${N}} ${a}·(${r.toFixed(1)})ⁿ = ？`);
        exp = G("gen.series.ue9", { v1: N, v2: a, v3: r.toFixed(1), v4: N, v5: r.toFixed(1), v6: s.toFixed(2) }, `S_${N} = ${a}(1−${r.toFixed(1)}^${N})/(1−${r.toFixed(1)}) ≈ ${s.toFixed(2)}。`);
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.series.pt0", null, "数项级数")));
    }
    return results;
  }

  /* ---------- 拓展：解析几何综合（coord_geo） ---------- */
  function qCoordGeo(n) {
    const results = [];
    const sgn = v => v === 0 ? "" : (v > 0 ? "-" + v : "+" + (-v));
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, o, exp;
      if (type === 0) {
        let x1 = rnd(-6, 6), y1 = rnd(-6, 6), x2 = rnd(-6, 6), y2 = rnd(-6, 6);
        while (x1 === x2 && y1 === y2) { x2 = rnd(-6, 6); y2 = rnd(-6, 6); }
        const d2 = (x2 - x1) ** 2 + (y2 - y1) ** 2, d = Math.sqrt(d2);
        o = opts(d.toFixed(2), () => Math.sqrt(d2 + rnd(1, 10)).toFixed(2), () => Math.sqrt(Math.abs(d2 - rnd(1, 10))).toFixed(2), () => (Math.abs(x2 - x1) + Math.abs(y2 - y1)).toFixed(2));
        q = G("gen.coord_geo.0q", { v1: x1, v2: y1, v3: x2, v4: y2 }, `点 A(${x1},${y1}) 与 B(${x2},${y2}) 的距离是？`);
        exp = G("gen.coord_geo.1e", { v1: x2, v2: x1, v3: y2, v4: y1, v5: d2, v6: d.toFixed(2) }, `d = √[(${x2}−${x1})² + (${y2}−${y1})²] = √${d2} ≈ ${d.toFixed(2)}。`);
      } else if (type === 1) {
        const x1 = rnd(-8, 8), y1 = rnd(-8, 8), x2 = rnd(-8, 8), y2 = rnd(-8, 8);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        o = opts(`(${mx},${my})`, () => `(${x1},${y1})`, () => `(${x2},${y2})`, () => `(${mx},${y1})`);
        q = G("gen.coord_geo.2q", { v1: x1, v2: y1, v3: x2, v4: y2 }, `线段 AB 中点（A(${x1},${y1})、B(${x2},${y2})）是？`);
        exp = G("gen.coord_geo.3e", { v1: mx, v2: my }, `中点 = ((x₁+x₂)/2,(y₁+y₂)/2) = (${mx},${my})。`);
      } else if (type === 2) {
        let x1 = rnd(-5, 5), y1 = rnd(-5, 5);
        let x2 = rnd(-5, 5); while (x2 === x1) x2 = rnd(-5, 5);
        const y2 = rnd(-5, 5), k = (y2 - y1) / (x2 - x1);
        o = opts(k.toFixed(2), () => ((y1 - y2) / (x2 - x1)).toFixed(2), () => ((x2 - x1) / (y2 - y1)).toFixed(2), () => rnd(1, 5).toFixed(2));
        q = G("gen.coord_geo.4q", { v1: x1, v2: y1, v3: x2, v4: y2 }, `过 A(${x1},${y1})、B(${x2},${y2}) 的直线斜率 k = ？`);
        exp = G("gen.coord_geo.5e", { v1: y2, v2: y1, v3: x2, v4: x1, v5: k.toFixed(2) }, `k = (y₂−y₁)/(x₂−x₁) = (${y2}−${y1})/(${x2}−${x1}) = ${k.toFixed(2)}。`);
      } else {
        const a = rnd(-5, 5), b = rnd(-5, 5), r = rnd(2, 6);
        o = opts(`(x${sgn(a)})²+(y${sgn(b)})²=${r * r}`, () => `(x${sgn(a)})²+(y${sgn(b)})²=${r * r + 1}`, () => `(x${sgn(a)})²+y²=${r * r}`, () => `x²+y²=${r * r}`);
        q = G("gen.coord_geo.6q", { v1: a, v2: b, v3: r }, `圆心 (${a},${b})、半径 ${r} 的圆的标准方程是？`);
        exp = G("gen.coord_geo.7e", { v1: sgn(a), v2: sgn(b), v3: r * r }, `标准方程 (x−a)²+(y−b)²=r² → (x${sgn(a)})²+(y${sgn(b)})²=${r * r}。`);
      }
      results.push(Q(q, o, type === 3 ? "基础" : "进阶", exp, G("gen.coord_geo.pt0", null, "解析几何")));
    }
    return results;
  }

  /* ---------- 拓展：琴生不等式与凸函数（jensen） ---------- */
  function qJensen(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const A = rnd(1, 5);
        o = opts(G("gen.jensen.uo0", null, "下凸（凸）"), () => G("gen.jensen.uo1", null, "上凸（凹）"), () => G("gen.jensen.uo2", null, "线性"), () => G("gen.jensen.uo3", null, "既凸又凹"));
        q = G("gen.jensen.uq0", { v1: A, v2: A }, `函数 f(x)=${A}x²（${A}>0）的凹凸性是？`);
        exp = G("gen.jensen.ue0", { v1: 2 * A }, `f''=${2 * A}>0，二阶导为正，故为下凸（凸）函数。`);
      } else if (type === 1) {
        const A = rnd(1, 5);
        o = opts(G("gen.jensen.uo4", null, "上凸（凹）"), () => G("gen.jensen.uo5", null, "下凸（凸）"), () => G("gen.jensen.uo6", null, "线性"), () => G("gen.jensen.uo7", null, "既凸又凹"));
        q = G("gen.jensen.uq1", { v1: A }, `函数 f(x)=−${A}x² 的凹凸性是？`);
        exp = G("gen.jensen.ue1", { v1: 2 * A }, `f''=−${2 * A}<0，二阶导为负，故为上凸（凹）函数。`);
      } else if (type === 2) {
        const x = rnd(1, 5), y = rnd(6, 10);
        o = opts(`f((${x}+${y})/2) ≤ (f(${x})+f(${y}))/2`, () => `f((${x}+${y})/2) ≥ (f(${x})+f(${y}))/2`, () => `f((${x}+${y})/2) = (f(${x})+f(${y}))/2`, () => `f((${x}+${y})/2) + (f(${x})+f(${y}))/2 = 0`);
        q = G("gen.jensen.uq2", { v1: x, v2: y }, `若 f 为下凸（凸）函数，则对任意 x=${x}, y=${y} 有？`);
        exp = G("gen.jensen.ue2", null, `凸函数满足 Jensen：f((x+y)/2) ≤ (f(x)+f(y))/2。`);
      } else if (type === 3) {
        const a = rnd(2, 9), b = rnd(2, 9);
        o = opts(G("gen.jensen.uo8", null, "平方平均 ≥ 算术平均 ≥ 几何平均 ≥ 调和平均"), () => G("gen.jensen.uo9", null, "算术平均 ≥ 平方平均 ≥ 几何平均 ≥ 调和平均"), () => G("gen.jensen.uo10", null, "几何平均 ≥ 算术平均 ≥ 调和平均 ≥ 平方平均"), () => G("gen.jensen.uo11", null, "调和平均 ≥ 几何平均 ≥ 算术平均 ≥ 平方平均"));
        q = G("gen.jensen.uq3", { v1: a, v2: b }, `对正数 a=${a}, b=${b}，四个经典平均（平方/算术/几何/调和）的大小顺序是？`);
        exp = G("gen.jensen.ue3", null, `Q ≥ A ≥ G ≥ H。这是 Jensen（凸性）的直接推论。`);
      } else if (type === 4) {
        const x = rnd(1, 5), y = rnd(6, 10);
        o = opts(`e^((${x}+${y})/2) ≤ (e^${x}+e^${y})/2`, () => `e^((${x}+${y})/2) ≥ (e^${x}+e^${y})/2`, () => `e^((${x}+${y})/2) = (e^${x}+e^${y})/2`, () => G("gen.jensen.uo12", { v1: x, v2: y, v3: x, v4: y }, `e^((${x}+${y})/2) · (e^${x}+e^${y})/2 = 1`));
        q = G("gen.jensen.uq4", { v1: x, v2: y }, `由 Jensen 不等式，对 f(t)=eᵗ 与 x=${x}, y=${y} 有？`);
        exp = G("gen.jensen.ue4", { v1: x, v2: y }, `f(t)=eᵗ 下凸，故 e^((x+y)/2)=f((x+y)/2) ≤ (f(x)+f(y))/2 = (e^${x}+e^${y})/2。`);
      } else if (type === 5) {
        const x = rnd(1, 5), y = rnd(6, 10);
        o = opts(`f((${x}+${y})/2) ≥ (f(${x})+f(${y}))/2`, () => `f((${x}+${y})/2) ≤ (f(${x})+f(${y}))/2`, () => `f((${x}+${y})/2) = (f(${x})+f(${y}))/2`, () => G("gen.jensen.uo13", null, `两者之和为 0`));
        q = G("gen.jensen.uq5", { v1: x, v2: y }, `若 f 为上凸（凹）函数，则对任意 x=${x}, y=${y} 有？`);
        exp = G("gen.jensen.ue5", null, `凹函数满足反向 Jensen：f((x+y)/2) ≥ (f(x)+f(y))/2。`);
      } else if (type === 6) {
        const x = rnd(2, 9), y = rnd(2, 9);
        o = opts(`ln((${x}+${y})/2) ≥ (ln ${x}+ln ${y})/2`, () => `ln((${x}+${y})/2) ≤ (ln ${x}+ln ${y})/2`, () => `ln((${x}+${y})/2) = (ln ${x}+ln ${y})/2`, () => `ln((${x}+${y})/2) + (ln ${x}+ln ${y})/2 = 0`);
        q = G("gen.jensen.uq6", { v1: x, v2: y }, `由 f(t)=ln t 的凹性，对 x=${x}, y=${y} 有？`);
        exp = G("gen.jensen.ue6", null, `ln t 上凸，故 ln((x+y)/2) ≥ (ln x+ln y)/2 = ln√(xy)，即 (x+y)/2 ≥ √(xy)。`);
      } else if (type === 7) {
        const lam = rnd(2, 8) / 10;
        o = opts(`f(${lam}x+(1−${lam})y) ≤ ${lam}f(x)+(1−${lam})f(y)`, () => `≥`, () => `=`, () => `f(${lam}x+(1−${lam})y) + ${lam}f(x) = 0`);
        q = G("gen.jensen.uq7", { v1: lam }, `下凸函数 f 与 λ=${lam}（0<λ<1），Jensen 一般形式是？`);
        exp = G("gen.jensen.ue7", { v1: lam }, `f(λx+(1−λ)y) ≤ λf(x)+(1−λ)f(y)（λ=${lam}）。`);
      } else if (type === 8) {
        const x = rnd(2, 9), y = rnd(2, 9);
        o = opts(G("gen.jensen.uo14", { v1: x, v2: y, v3: x, v4: y }, `(${x}+${y})/2 ≥ √(${x}·${y})`), () => G("gen.jensen.uo15", { v1: x, v2: y, v3: x, v4: y }, `(${x}+${y})/2 ≤ √(${x}·${y})`), () => G("gen.jensen.uo16", { v1: x, v2: y, v3: x, v4: y }, `(${x}+${y})/2 = √(${x}·${y})`), () => G("gen.jensen.uo17", { v1: x, v2: y, v3: x, v4: y }, `(${x}+${y})/2 · √(${x}·${y}) = 1`));
        q = G("gen.jensen.uq8", { v1: x, v2: y }, `对正数 x=${x}, y=${y}，算术平均与几何平均的关系（Jensen 推论）是？`);
        exp = G("gen.jensen.ue8", null, `由 ln 的凹性得 (x+y)/2 ≥ √(xy)（算术平均 ≥ 几何平均）。`);
      } else {
        const x = rnd(2, 9), y = rnd(2, 9);
        o = opts(G("gen.jensen.uo18", { v1: x, v2: y, v3: x, v4: y, v5: x, v6: y }, `2·${x}·${y}/(${x}+${y}) ≤ √(${x}·${y})`), () => `≥`, () => `=`, () => G("gen.jensen.uo19", { v1: x, v2: y, v3: x, v4: y, v5: x, v6: y }, `2·${x}·${y}/(${x}+${y}) + √(${x}·${y}) = 0`));
        q = G("gen.jensen.uq9", { v1: x, v2: y }, `对正数 x=${x}, y=${y}，调和平均与几何平均的关系（Jensen 推论）是？`);
        exp = G("gen.jensen.ue9", null, `调和平均 H=2xy/(x+y) ≤ √(xy)=G，故调和 ≤ 几何 ≤ 算术 ≤ 平方。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.jensen.pt0", null, "琴生不等式")));
    }
    return results;
  }

  /* ---------- 拓展：重要极限（important_limit） ---------- */
  function qImpLimit(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const k = rnd(1, 12);
        o = opts("1", () => "0", () => `${k}`, () => "∞");
        q = G("gen.important_limit.uq0", { v1: k, v2: k }, `lim_{x→0} sin(${k}x)/(${k}x) = ？（重要极限一）`);
        exp = G("gen.important_limit.ue0", { v1: k }, `令 t=${k}x，lim_{t→0} sin t / t = 1。`);
      } else if (type === 1) {
        const a = rnd(2, 12);
        const val = Math.exp(a).toFixed(3);
        o = opts(G("gen.important_limit.uo0", { v1: val, v2: a }, `${val}（即 e^${a}）`), () => `${a}`, () => `1`, () => G("gen.important_limit.uo1", { v1: val, v2: a }, `${val}·${a}`));
        q = G("gen.important_limit.uq1", { v1: a }, `lim_{x→∞} (1 + ${a}/x)^x = ？`);
        exp = G("gen.important_limit.ue1", { v1: a, v2: val }, `重要极限二推广：lim (1 + a/x)^x = e^${a} ≈ ${val}。`);
      } else if (type === 2) {
        const a = rnd(2, 12);
        const val = Math.exp(a).toFixed(3);
        o = opts(G("gen.important_limit.uo2", { v1: val, v2: a }, `${val}（即 e^${a}）`), () => `${a}`, () => `1`, () => `${Math.exp(a - 1).toFixed(3)}`);
        q = G("gen.important_limit.uq2", { v1: a }, `lim_{n→∞} (1 + ${a}/n)^n = ？（n 为正整数）`);
        exp = G("gen.important_limit.ue2", { v1: a, v2: val }, `离散推广：lim (1 + a/n)^n = e^${a} ≈ ${val}。`);
      } else if (type === 3) {
        const k = rnd(1, 12);
        const val = Math.exp(k).toFixed(3);
        o = opts(G("gen.important_limit.uo3", { v1: val, v2: k }, `${val}（即 e^${k}）`), () => `1`, () => `0`, () => `${k}`);
        q = G("gen.important_limit.uq3", { v1: k }, `lim_{x→0} (1 + ${k}x)^{1/x} = ？`);
        exp = G("gen.important_limit.ue3", { v1: k, v2: k, v3: val }, `令 t=1/x，则 lim (1 + ${k}/t)^t = e^${k} ≈ ${val}。`);
      } else if (type === 4) {
        const a = rnd(2, 12);
        const val = Math.log(a).toFixed(3);
        o = opts(G("gen.important_limit.uo4", { v1: val, v2: a }, `${val}（即 ln ${a}）`), () => `${a}`, () => `1`, () => `0`);
        q = G("gen.important_limit.uq4", { v1: a }, `lim_{x→0} (${a}^x − 1)/x = ？（指数型重要极限）`);
        exp = G("gen.important_limit.ue4", { v1: a, v2: val }, `由 (a^x)' = a^x ln a 在 x=0 处，极限 = ln ${a} ≈ ${val}。`);
      } else if (type === 5) {
        const x = rnd(2, 12);
        const val = Math.exp(x).toFixed(3);
        o = opts(G("gen.important_limit.uo5", { v1: val, v2: x }, `${val}（即 e^${x}）`), () => `${x}`, () => `1`, () => `${Math.exp(x / 2).toFixed(3)}`);
        q = G("gen.important_limit.uq5", { v1: x }, `lim_{n→∞} (1 + ${x}/n)^n = ？`);
        exp = G("gen.important_limit.ue5", { v1: x, v2: val }, `lim (1 + x/n)^n = e^${x} ≈ ${val}（第二个重要极限的推广）。`);
      } else if (type === 6) {
        const a = rnd(1, 12);
        o = opts(`${(a * a / 2).toFixed(2)}`, () => `0`, () => `${a}`, () => `1`);
        q = G("gen.important_limit.uq6", { v1: a }, `lim_{x→0} (1 − cos(${a}x)) / x² = ？`);
        exp = G("gen.important_limit.ue6", { v1: a, v2: a, v3: a, v4: (a * a / 2).toFixed(2) }, `1−cos(${a}x) ~ (${a}²x²)/2，故极限 = ${a}²/2 = ${(a * a / 2).toFixed(2)}。`);
      } else if (type === 7) {
        const k = rnd(1, 12);
        o = opts(`${k}`, () => `0`, () => `1`, () => `∞`);
        q = G("gen.important_limit.uq7", { v1: k }, `lim_{x→0} tan(${k}x)/x = ？`);
        exp = G("gen.important_limit.ue7", { v1: k, v2: k, v3: k }, `tan(${k}x) ~ ${k}x，故极限 = ${k}（亦可归为重要极限一）。`);
      } else if (type === 8) {
        const k = rnd(1, 5);
        o = opts(`${k}`, () => `0`, () => `1`, () => `∞`);
        q = G("gen.important_limit.uq8", { v1: k }, `lim_{x→0} ln(1 + ${k}x)/x = ？`);
        exp = G("gen.important_limit.ue8", { v1: k, v2: k, v3: k }, `ln(1+${k}x) ~ ${k}x，故极限 = ${k}。`);
      } else {
        const k = rnd(1, 5);
        o = opts(`${k}`, () => `0`, () => `1`, () => `∞`);
        q = G("gen.important_limit.uq9", { v1: k }, `lim_{x→0} (e^(${k}x) − 1)/x = ？`);
        exp = G("gen.important_limit.ue9", { v1: k, v2: k, v3: k }, `e^(${k}x)−1 ~ ${k}x，故极限 = ${k}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.important_limit.pt0", null, "重要极限")));
    }
    return results;
  }

  /* ---------- 拓展：棣莫弗定理（de_moivre） ---------- */
  function qDeMoivre(n) {
    const results = [];
    const pow1i = (p) => {
      const mag = Math.pow(2, p / 2), ang = p * Math.PI / 4;
      const re = Math.round(mag * Math.cos(ang)), im = Math.round(mag * Math.sin(ang));
      if (im === 0) return `${re}`;
      if (re === 0) return `${im}i`;
      return `${re} + ${im}i`;
    };
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const m = rnd(2, 6);
        o = opts(G("gen.de_moivre.uo0", { v1: m, v2: m }, `cos(${m}θ)+i·sin(${m}θ)`), () => G("gen.de_moivre.uo1", { v1: m }, `cos θ + i·sin(${m}θ)`), () => G("gen.de_moivre.uo2", { v1: m }, `${m}(cos θ + i·sin θ)`), () => G("gen.de_moivre.uo3", { v1: m, v2: m }, `cos(${m}θ)·sin(${m}θ)`));
        q = G("gen.de_moivre.uq0", { v1: m }, `(cos θ + i·sin θ)^${m} = ？`);
        exp = G("gen.de_moivre.ue0", { v1: m, v2: m, v3: m }, `棣莫弗定理：(cosθ+i sinθ)^${m} = cos(${m}θ)+i sin(${m}θ)。`);
      } else if (type === 1) {
        const r = rnd(2, 6), m = rnd(2, 5);
        const root = Math.pow(r, 1 / m).toFixed(2);
        o = opts(G("gen.de_moivre.uo4", { v1: root, v2: m, v3: m }, `${root}(cos((θ+2kπ)/${m}) + i·sin((θ+2kπ)/${m}))`), () => G("gen.de_moivre.uo5", { v1: r, v2: m, v3: m }, `${r}(cos(θ/${m}) + i·sin(θ/${m}))`), () => G("gen.de_moivre.uo6", { v1: root }, `${root}(cos θ + i·sin θ)`), () => G("gen.de_moivre.uo7", { v1: Math.pow(r, 1 / m).toFixed(2), v2: m + 1, v3: m + 1 }, `${Math.pow(r, 1 / m).toFixed(2)}(cos((θ+2kπ)/${m + 1}) + i·sin((θ+2kπ)/${m + 1}))`));
        q = G("gen.de_moivre.uq1", { v1: r, v2: m, v3: m - 1 }, `复数 z = ${r}(cos θ + i·sin θ) 的 ${m} 次方根（k=0,…,${m - 1}）是？`);
        exp = G("gen.de_moivre.ue1", { v1: m, v2: m, v3: root, v4: m }, `${m} 次方根模为 r^{1/${m}}=${root}，辐角 (θ+2kπ)/${m}。`);
      } else if (type === 2) {
        const nn = rnd(2, 8);
        o = opts(G("gen.de_moivre.uo8", { v1: nn }, `${nn} 个`), () => G("gen.de_moivre.uo9", null, `1 个`), () => G("gen.de_moivre.uo10", null, `2 个`), () => G("gen.de_moivre.uo11", null, `无穷多个`));
        q = G("gen.de_moivre.uq2", { v1: nn, v2: nn }, `方程 z^${nn} = 1（${nn} 为正整数）在复数范围内的根有？`);
        exp = G("gen.de_moivre.ue2", { v1: nn, v2: nn, v3: nn, v4: nn }, `单位圆上的 ${nn} 次单位根共 ${nn} 个：e^{2πik/${nn}}（k=0,…,${nn}-1）。`);
      } else if (type === 3) {
        const p = [2, 4, 6, 8][rnd(0, 3)];
        const val = pow1i(p);
        o = opts(val, () => p === 2 ? "-2i" : "4", () => "0", () => `${p}`);
        q = G("gen.de_moivre.uq3", { v1: p }, `(1+i)^${p} = ？`);
        exp = G("gen.de_moivre.ue3", { v1: p, v2: p, v3: p, v4: val }, `1+i = √2·e^{iπ/4}，故 (1+i)^${p} = 2^{${p}/2}·e^{i${p}π/4} = ${val}。`);
      } else if (type === 4) {
        const th = rnd(15, 75);
        o = opts(G("gen.de_moivre.uo12", { v1: th, v2: th }, `cos ${th}° − i·sin ${th}°`), () => G("gen.de_moivre.uo13", { v1: th, v2: th }, `cos ${th}° + i·sin ${th}°`), () => G("gen.de_moivre.uo14", { v1: th, v2: th }, `−cos ${th}° + i·sin ${th}°`), () => G("gen.de_moivre.uo15", { v1: th, v2: th }, `1/(cos ${th}° + i·sin ${th}°)`));
        q = G("gen.de_moivre.uq4", { v1: th, v2: th }, `(cos ${th}° + i·sin ${th}°)^{−1} = ？`);
        exp = G("gen.de_moivre.ue4", null, `由棣莫弗：(cosθ+i sinθ)^{−1} = cos(−θ)+i sin(−θ) = cosθ − i sinθ。`);
      } else if (type === 5) {
        const m = rnd(2, 5);
        o = opts(G("gen.de_moivre.uo16", { v1: m, v2: m }, `cos(${m}θ) − i·sin(${m}θ)`), () => G("gen.de_moivre.uo17", { v1: m, v2: m }, `cos(${m}θ) + i·sin(${m}θ)`), () => G("gen.de_moivre.uo18", { v1: m, v2: m }, `−cos(${m}θ) + i·sin(${m}θ)`), () => G("gen.de_moivre.uo19", { v1: m }, `${m}(cos θ − i·sin θ)`));
        q = G("gen.de_moivre.uq5", { v1: m }, `(cos θ + i·sin θ)^{−${m}} = ？`);
        exp = G("gen.de_moivre.ue5", { v1: m, v2: m, v3: m, v4: m }, `负幂：= cos(−${m}θ)+i sin(−${m}θ) = cos(${m}θ) − i·sin(${m}θ)。`);
      } else if (type === 6) {
        const th = rnd(20, 70);
        o = opts("cos²θ − sin²θ", () => G("gen.de_moivre.uo20", null, "2·sinθ·cosθ"), () => "cos²θ + sin²θ", () => "1 − 2sin²θ");
        q = G("gen.de_moivre.uq6", { v1: th, v2: th, v3: th }, `由棣莫弗，(cos ${th}° + i·sin ${th}°)² 的实部（即 cos 2${th}°）等于？`);
        exp = G("gen.de_moivre.ue6", null, `(cosθ+i sinθ)² = cos2θ + i sin2θ = cos²θ−sin²θ + i·2sinθcosθ，实部 = cos²θ−sin²θ。`);
      } else if (type === 7) {
        const nn = rnd(2, 8);
        o = opts("0", () => "1", () => `${nn}`, () => "−1");
        q = G("gen.de_moivre.uq7", { v1: nn, v2: nn }, `方程 z^${nn} = 1 的全部 ${nn} 个根（单位根）之和 = ？`);
        exp = G("gen.de_moivre.ue7", { v1: nn, v2: nn }, `单位根 e^{2πik/${nn}}（k=0..${nn}-1）是等比数列求和，和为 0。`);
      } else if (type === 8) {
        const r = rnd(2, 8), m = rnd(2, 5);
        o = opts(`r^{1/${m}} = ${Math.pow(r, 1 / m).toFixed(2)}`, () => `r`, () => `${r * m}`, () => `${Math.pow(r, m).toFixed(2)}`);
        q = G("gen.de_moivre.uq8", { v1: r, v2: m }, `复数 z = ${r}(cos θ + i·sin θ) 的 ${m} 次方根的模（公共）是？`);
        exp = G("gen.de_moivre.ue8", { v1: m, v2: Math.pow(r, 1 / m).toFixed(2) }, `n 次方根模均为 r^{1/${m}（≈ ${Math.pow(r, 1 / m).toFixed(2)}）}`);
      } else {
        const th = rnd(15, 60);
        o = opts(G("gen.de_moivre.uo21", null, "2·sinθ·cosθ（即 sin 2θ）"), () => "cos²θ − sin²θ", () => "sin²θ + cos²θ", () => G("gen.de_moivre.uo22", null, "2·cos²θ − 1"));
        q = G("gen.de_moivre.uq9", { v1: th, v2: th, v3: th }, `由棣莫弗，(cos ${th}° + i·sin ${th}°)² 的虚部（即 sin 2${th}°）等于？`);
        exp = G("gen.de_moivre.ue9", null, `展开虚部 = 2sinθcosθ，即 sin2θ。`);
      }
      results.push(Q(q, o, type === 2 ? "基础" : "进阶", exp, G("gen.de_moivre.pt0", null, "棣莫弗定理")));
    }
    return results;
  }

  /* ---------- 拓展：随机变量与数字特征（random_var） ---------- */
  function qRandVar(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(2, 5), b = rnd(1, 5), mu = rnd(1, 4);
        o = opts(`${a * mu + b}`, () => `${a * mu}`, () => `${mu + b}`, () => `${a * mu - b}`);
        q = G("gen.random_var.0q", { v1: mu, v2: a, v3: b }, `若 E(X)=${mu}，则 E(${a}X+${b}) = ？`);
        exp = G("gen.random_var.1e", { v1: a, v2: mu, v3: b, v4: a * mu + b }, `线性性质：E(aX+b)=aE(X)+b = ${a}·${mu}+${b} = ${a * mu + b}。`);
      } else if (type === 1) {
        const a = rnd(2, 5), s2 = rnd(1, 4);
        o = opts(`${a * a * s2}`, () => `${a * s2}`, () => `${s2}`, () => `${a * a + s2}`);
        q = G("gen.random_var.2q", { v1: s2, v2: a }, `若 D(X)=${s2}，则 D(${a}X) = ？`);
        exp = G("gen.random_var.3e", { v1: a, v2: s2, v3: a * a * s2 }, `D(aX)=a²D(X)=${a}²·${s2}=${a * a * s2}。`);
      } else if (type === 2) {
        const p = rnd(2, 8) / 10, dp = (p * (1 - p)).toFixed(2);
        o = opts(`E=${p}, D=${dp}`, () => `E=${p}, D=${(p * p).toFixed(2)}`, () => `E=${dp}, D=${p}`, () => `E=${1 - p}, D=${p}`);
        q = G("gen.random_var.4q", { v1: p }, `X~两点分布，P(X=1)=${p}，则 E(X)、D(X) 是？`);
        exp = G("gen.random_var.5e", { v1: p, v2: dp }, `两点分布：E=p=${p}，D=p(1-p)=${dp}。`);
      } else {
        const nn = rnd(5, 15), p = rnd(2, 7) / 10, e = (nn * p).toFixed(0), d = (nn * p * (1 - p)).toFixed(2);
        o = opts(`E=${e}, D=${d}`, () => `E=${nn}, D=${d}`, () => `E=${e}, D=${(nn * p * nn * p).toFixed(2)}`, () => `E=${p}, D=${d}`);
        q = G("gen.random_var.6q", { v1: nn, v2: p }, `X~B(${nn}, ${p})（二项分布），则 E(X)、D(X) 是？`);
        exp = G("gen.random_var.7e", { v1: nn, v2: p, v3: e, v4: d }, `二项分布：E=np=${nn}·${p}=${e}，D=np(1-p)=${d}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.random_var.pt0", null, "随机变量")));
    }
    return results;
  }

  /* ---------- 拓展：傅里叶级数初步（fourier） ---------- */
  function qFourier(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const T = rnd(2, 20);
        o = opts("a₀/2 + Σ(aₙ cos(nωx) + bₙ sin(nωx))", () => "Σ aₙ xⁿ", () => "Σ aₙ eⁿ", () => "a₀ + Σ aₙ cos(nx)");
        q = G("gen.fourier.uq0", { v1: T }, `周期为 T=${T} 的函数可展开为（ω=2π/T）？`);
        exp = G("gen.fourier.ue0", null, `傅里叶级数：f(x) ~ a₀/2 + Σ(aₙ cos(nωx) + bₙ sin(nωx))。`);
      } else if (type === 1) {
        const k = rnd(1, 12);
        o = opts(G("gen.fourier.uo0", null, "只有正弦项（bₙ）"), () => G("gen.fourier.uo1", null, "只有余弦项（aₙ）"), () => G("gen.fourier.uo2", null, "只有常数项"), () => G("gen.fourier.uo3", null, "既有正弦又有余弦"));
        q = G("gen.fourier.uq1", { v1: k }, `奇函数 f(x)=sin(${k}x)（满足 f(−x)=−f(x)）的傅里叶展开？`);
        exp = G("gen.fourier.ue1", null, `奇函数：aₙ=0，只含正弦项（正弦级数）。`);
      } else if (type === 2) {
        const k = rnd(1, 12);
        o = opts(G("gen.fourier.uo4", null, "只有余弦项（aₙ）"), () => G("gen.fourier.uo5", null, "只有正弦项（bₙ）"), () => G("gen.fourier.uo6", null, "只有常数项"), () => G("gen.fourier.uo7", null, "既有正弦又有余弦"));
        q = G("gen.fourier.uq2", { v1: k }, `偶函数 f(x)=cos(${k}x)（满足 f(−x)=f(x)）的傅里叶展开？`);
        exp = G("gen.fourier.ue2", null, `偶函数：bₙ=0，只含余弦项（余弦级数）。`);
      } else if (type === 3) {
        const T = rnd(2, 20);
        const w = (2 * Math.PI / T).toFixed(2);
        o = opts(`ω=${w}`, () => `${(Math.PI / T).toFixed(2)}`, () => `${(4 * Math.PI / T).toFixed(2)}`, () => `${(T / (2 * Math.PI)).toFixed(2)}`);
        q = G("gen.fourier.uq3", { v1: T }, `周期为 T=${T} 的函数，基频 ω = ？`);
        exp = G("gen.fourier.ue3", { v1: T, v2: w }, `基频 ω = 2π/T = 2π/${T} = ${w}。`);
      } else if (type === 4) {
        const A = rnd(1, 8);
        o = opts(`(1/π)∫_{−π}^{π} f(x) dx`, () => `(1/T)∫ f`, () => `(2/π)∫ f`, () => `∫ f`);
        q = G("gen.fourier.uq4", { v1: A }, `对周期 2π 的函数 f(x)=${A}·g(x)，傅里叶系数 a₀（出现在 a₀/2 中）的计算公式是？`);
        exp = G("gen.fourier.ue4", null, `a₀ = (1/π)∫_{−π}^{π} f(x) dx（故常数项为 a₀/2）。`);
      } else if (type === 5) {
        const N = rnd(1, 12);
        o = opts(`(1/π)∫_{−π}^{π} f(x) sin(${N}x) dx`, () => `(1/π)∫ f(x) cos(${N}x) dx`, () => `(1/${N})∫ f`, () => `∫ f(x) sin(${N}x) dx`);
        q = G("gen.fourier.uq5", { v1: N }, `对周期 2π 的函数，傅里叶正弦系数 b_${N} = ？`);
        exp = G("gen.fourier.ue5", { v1: N }, `b_n = (1/π)∫_{−π}^{π} f(x) sin(nx) dx，取 n=${N}。`);
      } else if (type === 6) {
        const k = rnd(1, 10);
        o = opts(G("gen.fourier.uo8", null, "bₙ = 0（全为 0）"), () => "aₙ = 0", () => "a₀ = 0", () => G("gen.fourier.uo9", null, "全部非零"));
        q = G("gen.fourier.uq6", { v1: k }, `若 f(x)=cos(${k}x)（偶函数），则其傅里叶正弦系数 bₙ ？`);
        exp = G("gen.fourier.ue6", null, `偶函数只含余弦项，故所有 bₙ = 0。`);
      } else if (type === 7) {
        const x0 = rnd(1, 12);
        o = opts(`(f(x₀⁺) + f(x₀⁻)) / 2`, () => `f(x₀)`, () => `0`, () => `(f(x₀⁺) − f(x₀⁻)) / 2`);
        q = G("gen.fourier.uq7", { v1: x0 }, `在间断点 x=${x0} 处，傅里叶级数收敛到？`);
        exp = G("gen.fourier.ue7", null, `狄利克雷定理：收敛到左右极限的平均值 (f(x₀⁺)+f(x₀⁻))/2。`);
      } else if (type === 8) {
        const N = rnd(1, 5);
        const sign = (N % 2 === 1) ? "" : "−";
        o = opts(`${sign}2/${N}`, () => `2/${N}`, () => `${sign}1/${N}`, () => `${sign}2/${N + 1}`);
        q = G("gen.fourier.uq8", { v1: N }, `f(x)=x（−π<x<π）的傅里叶正弦系数 b_${N} = ？`);
        exp = G("gen.fourier.ue8", { v1: N, v2: sign, v3: N }, `b_n = 2(−1)^{n+1}/n，取 n=${N} 得 ${sign}2/${N}。`);
      } else {
        const L = rnd(2, 6);
        o = opts(G("gen.fourier.uo10", null, "正弦级数（奇延拓）"), () => G("gen.fourier.uo11", null, "余弦系列（偶延拓）"), () => G("gen.fourier.uo12", null, "既有正弦又有余弦"), () => G("gen.fourier.uo13", null, "只有常数项"));
        q = G("gen.fourier.uq9", { v1: L }, `定义在 [0,${L}] 上的函数做奇延拓后，其傅里叶展开是？`);
        exp = G("gen.fourier.ue9", null, `奇延拓把函数变成奇函数，展开为正弦级数。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.fourier.pt0", null, "傅里叶级数")));
    }
    return results;
  }

  /* ---------- 拓展：定积分应用（integral_app） ---------- */
  function qIntApp(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(0, 2), b = rnd(3, 6), area = (b * b - a * a) / 2;
        o = opts(`${area}`, () => `${b * b - a * a}`, () => `${b - a}`, () => `${(b * b * a * a) / 2}`);
        q = G("gen.integral_app.0q", { v1: a, v2: b, v3: a, v4: b }, `曲线 y=x 与 x 轴在 [${a}, ${b}] 围成的面积 = ∫_{${a}}^{${b}} x dx = ？`);
        exp = G("gen.integral_app.1e", { v1: b, v2: a, v3: area }, `∫ x dx = x²/2，面积 = (${b}²−${a}²)/2 = ${area}。`);
      } else if (type === 1) {
        const a = rnd(0, 2), b = rnd(2, 5), V = (Math.PI * (b * b * b - a * a * a) / 3).toFixed(2);
        o = opts(`${V}`, () => `${(Math.PI * (b - a) / 3).toFixed(2)}`, () => `${(Math.PI * (b * b - a * a) / 3).toFixed(2)}`, () => `${(Math.PI * (b * b * b - a * a * a) / 2).toFixed(2)}`);
        q = G("gen.integral_app.2q", { v1: a, v2: b, v3: a, v4: b }, `y=x 绕 x 轴在 [${a}, ${b}] 旋转所得体积 V = π∫_{${a}}^{${b}} x² dx = ？`);
        exp = G("gen.integral_app.3e", { v1: b, v2: a, v3: V }, `π∫ x² dx = π·x³/3，V = π(${b}³−${a}³)/3 = ${V}。`);
      } else if (type === 2) {
        const a = rnd(0, 3), b = rnd(4, 8), avg = (b * b - a * a) / (2 * (b - a));
        o = opts(`${avg.toFixed(2)}`, () => `${(b + a).toFixed(2)}`, () => `${(b * b - a * a).toFixed(2)}`, () => `${(b - a).toFixed(2)}`);
        q = G("gen.integral_app.uq0", { v1: a, v2: b }, `函数 y=x 在 [${a}, ${b}] 上的平均值 = ？`);
        exp = G("gen.integral_app.ue0", { v1: avg.toFixed(2) }, `平均值 = (1/(b−a))∫ x dx = (a+b)/2 = ${avg.toFixed(2)}。`);
      } else if (type === 3) {
        const b = rnd(2, 6), L = (Math.SQRT2 * b).toFixed(2);
        o = opts(`${L}`, () => `${b.toFixed(2)}`, () => `${(2 * b).toFixed(2)}`, () => `${(Math.SQRT2 * (b + 1)).toFixed(2)}`);
        q = G("gen.integral_app.uq1", { v1: b }, `曲线 y=x（0≤x≤${b}）的弧长 = ？`);
        exp = G("gen.integral_app.ue1", { v1: b, v2: b, v3: b, v4: L }, `弧长 = ∫_0^${b} √(1+(y')²) dx = ∫_0^${b} √2 dx = √2·${b} = ${L}。`);
      } else if (type === 4) {
        const a = rnd(0, 2), b = rnd(2, 5), area = (b * b * b - a * a * a) / 3;
        o = opts(`${area}`, () => `${(b * b - a * a).toFixed(2)}`, () => `${b - a}`, () => `${(b * b * b * b - a * a * a * a) / 4}`);
        q = G("gen.integral_app.uq2", { v1: a, v2: b, v3: a, v4: b }, `曲线 y=x² 与 x 轴在 [${a}, ${b}] 围成的面积 = ∫_{${a}}^{${b}} x² dx = ？`);
        exp = G("gen.integral_app.ue2", { v1: b, v2: a, v3: area }, `∫ x² dx = x³/3，面积 = (${b}³−${a}³)/3 = ${area}。`);
      } else if (type === 5) {
        const a = rnd(0, 2), b = rnd(2, 4), V = (Math.PI * (Math.pow(b, 5) - Math.pow(a, 5)) / 5).toFixed(2);
        o = opts(`${V}`, () => `${(Math.PI * (b * b * b - a * a * a) / 3).toFixed(2)}`, () => `${(Math.PI * (b - a) / 5).toFixed(2)}`, () => `${(Math.PI * (Math.pow(b, 5) - Math.pow(a, 5)) / 3).toFixed(2)}`);
        q = G("gen.integral_app.uq3", { v1: a, v2: b, v3: a, v4: b }, `y=x² 绕 x 轴在 [${a}, ${b}] 旋转所得体积 = π∫_{${a}}^{${b}} x⁴ dx = ？`);
        exp = G("gen.integral_app.ue3", { v1: b, v2: a, v3: V }, `π∫ x⁴ dx = π·x⁵/5，V = π(${b}⁵−${a}⁵)/5 = ${V}。`);
      } else if (type === 6) {
        const a = rnd(0, 2), b = rnd(3, 6);
        const avg = (b * b * b - a * a * a) / (3 * (b - a));
        o = opts(`${avg.toFixed(2)}`, () => `${(b * b - a * a).toFixed(2)}`, () => `${(b + a).toFixed(2)}`, () => `${(b - a).toFixed(2)}`);
        q = G("gen.integral_app.uq4", { v1: a, v2: b }, `函数 y=x² 在 [${a}, ${b}] 上的平均值 = ？`);
        exp = G("gen.integral_app.ue4", { v1: avg.toFixed(2) }, `平均值 = (1/(b−a))∫ x² dx = (b³−a³)/(3(b−a)) = ${avg.toFixed(2)}。`);
      } else if (type === 7) {
        const a = rnd(0, 2), b = rnd(3, 6), c = rnd(1, 3);
        const area = (b * b - a * a) / 2 - c * (b - a);
        o = opts(`${area}`, () => `${(b * b - a * a) / 2}`, () => `${c * (b - a)}`, () => `${b - a}`);
        q = G("gen.integral_app.uq5", { v1: c, v2: a, v3: b }, `曲线 y=x 与直线 y=${c} 在 [${a}, ${b}] 之间围成的面积 = ？`);
        exp = G("gen.integral_app.ue5", { v1: c, v2: b, v3: a, v4: c, v5: b, v6: a, v7: area }, `面积 = ∫(x−${c})dx = (${b}²−${a}²)/2 − ${c}(${b}−${a}) = ${area}。`);
      } else if (type === 8) {
        const k = rnd(1, 4), b = rnd(2, 5);
        const L = (b * Math.sqrt(1 + k * k)).toFixed(2);
        o = opts(`${L}`, () => `${(b * k).toFixed(2)}`, () => `${b.toFixed(2)}`, () => `${(b * Math.sqrt(k)).toFixed(2)}`);
        q = G("gen.integral_app.uq6", { v1: k, v2: b }, `曲线 y=${k}x（0≤x≤${b}）的弧长 = ？`);
        exp = G("gen.integral_app.ue6", { v1: b, v2: k, v3: b, v4: k, v5: L }, `弧长 = ∫_0^${b} √(1+${k}²) dx = ${b}√(1+${k}²) = ${L}。`);
      } else {
        const b = rnd(2, 6), area = (b * b) / 2;
        o = opts(`${area}`, () => `${b * b}`, () => `${b}`, () => `${(b * b * b) / 3}`);
        q = G("gen.integral_app.uq7", { v1: b }, `曲线 y=x 与 x 轴在 [0, ${b}] 围成的三角形面积 = ？`);
        exp = G("gen.integral_app.ue7", { v1: b, v2: b, v3: area }, `面积 = ∫_0^${b} x dx = ${b}²/2 = ${area}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.integral_app.pt0", null, "定积分应用")));
    }
    return results;
  }

  /* ---------- 拓展：函数图像变换（graph_transform） ---------- */
  function qGraphTrans(n) {
    const results = [];
    const FN = ["x²", "sin x", "eˣ", "ln x", "√x"];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 12);
        o = opts(G("gen.graph_transform.uo0", { v1: a }, `向右平移 ${a}`), () => G("gen.graph_transform.uo1", { v1: a }, `向左平移 ${a}`), () => G("gen.graph_transform.uo2", { v1: a }, `向上平移 ${a}`), () => G("gen.graph_transform.uo3", null, `关于 y 轴对称`));
        q = G("gen.graph_transform.uq0", { v1: a }, `将 y=f(x) 变为 y=f(x−${a}) 的变换是？`);
        exp = G("gen.graph_transform.ue0", { v1: a }, `y=f(x−a) 是 y=f(x) 向右平移 ${a} 个单位（左加右减）。`);
      } else if (type === 1) {
        const fn = pick(FN), c = rnd(2, 9);
        o = opts(G("gen.graph_transform.uo4", null, "关于 y 轴对称"), () => G("gen.graph_transform.uo5", null, "关于 x 轴对称"), () => G("gen.graph_transform.uo6", null, "关于原点对称"), () => G("gen.graph_transform.uo7", null, "向右平移 1"));
        q = G("gen.graph_transform.uq1", { v1: c, v2: fn }, `y=f(x)=${c}·${fn} → y=f(−x) 的变换是？`);
        exp = G("gen.graph_transform.ue1", null, "x 取相反数，图像关于 y 轴对称。");
      } else if (type === 2) {
        const A = rnd(2, 12);
        o = opts(G("gen.graph_transform.uo8", { v1: A }, `纵向拉伸为 ${A} 倍`), () => G("gen.graph_transform.uo9", { v1: A }, `纵向压缩为 ${A} 倍`), () => G("gen.graph_transform.uo10", { v1: A }, `横向拉伸为 ${A} 倍`), () => G("gen.graph_transform.uo11", { v1: A }, `横向压缩为 ${A} 倍`));
        q = G("gen.graph_transform.uq2", { v1: A }, `y=f(x) → y=${A}f(x) 的变换是？`);
        exp = G("gen.graph_transform.ue2", { v1: A }, `系数乘在函数值上：纵坐标变为原来的 ${A} 倍（纵向伸缩）。`);
      } else if (type === 3) {
        const fn = pick(FN), c = rnd(2, 9);
        o = opts(G("gen.graph_transform.uo12", null, "将 x 轴下方的部分翻折到上方"), () => G("gen.graph_transform.uo13", null, "将 y 轴左侧翻折到右侧"), () => G("gen.graph_transform.uo14", null, "整体向上平移"), () => G("gen.graph_transform.uo15", null, "关于 y 轴对称"));
        q = G("gen.graph_transform.uq3", { v1: c, v2: fn }, `y=f(x)=${c}·${fn} → y=|f(x)| 的变换是？`);
        exp = G("gen.graph_transform.ue3", null, "y=|f(x)|：保留 x 轴上方，将下方部分沿 x 轴翻折到上方。");
      } else if (type === 4) {
        const a = rnd(1, 12);
        o = opts(G("gen.graph_transform.uo16", { v1: a }, `向上平移 ${a}`), () => G("gen.graph_transform.uo17", { v1: a }, `向下平移 ${a}`), () => G("gen.graph_transform.uo18", { v1: a }, `向左平移 ${a}`), () => G("gen.graph_transform.uo19", { v1: a }, `纵向拉伸 ${a} 倍`));
        q = G("gen.graph_transform.uq4", { v1: a }, `y=f(x) → y=f(x)+${a} 的变换是？`);
        exp = G("gen.graph_transform.ue4", { v1: a, v2: a }, `函数值整体加 ${a}：图像向上平移 ${a} 个单位。`);
      } else if (type === 5) {
        const a = rnd(2, 12);
        o = opts(G("gen.graph_transform.uo20", { v1: a }, `横向压缩为原来的 1/${a}`), () => G("gen.graph_transform.uo21", { v1: a }, `横向拉伸为 ${a} 倍`), () => G("gen.graph_transform.uo22", { v1: a }, `纵向压缩为 1/${a}`), () => G("gen.graph_transform.uo23", { v1: a }, `向右平移 ${a}`));
        q = G("gen.graph_transform.uq5", { v1: a, v2: a }, `y=f(x) → y=f(${a}x)（${a}>1）的变换是？`);
        exp = G("gen.graph_transform.ue5", { v1: a, v2: a }, `x 乘 ${a}>1：周期变短，图像横向压缩为原来的 1/${a}。`);
      } else if (type === 6) {
        const fn = pick(FN), c = rnd(2, 9);
        o = opts(G("gen.graph_transform.uo24", null, "关于 x 轴对称"), () => G("gen.graph_transform.uo25", null, "关于 y 轴对称"), () => G("gen.graph_transform.uo26", null, "关于原点对称"), () => G("gen.graph_transform.uo27", null, "向上平移 1"));
        q = G("gen.graph_transform.uq6", { v1: c, v2: fn }, `y=f(x)=${c}·${fn} → y=−f(x) 的变换是？`);
        exp = G("gen.graph_transform.ue6", null, "函数值取相反数，图像关于 x 轴对称（上下翻转）。");
      } else if (type === 7) {
        const a = rnd(1, 12);
        o = opts(G("gen.graph_transform.uo28", { v1: a }, `向左平移 ${a}`), () => G("gen.graph_transform.uo29", { v1: a }, `向右平移 ${a}`), () => G("gen.graph_transform.uo30", { v1: a }, `向上平移 ${a}`), () => G("gen.graph_transform.uo31", null, `关于 y 轴对称`));
        q = G("gen.graph_transform.uq7", { v1: a }, `y=f(x) → y=f(x+${a}) 的变换是？`);
        exp = G("gen.graph_transform.ue7", { v1: a }, `y=f(x+a) 是 y=f(x) 向左平移 ${a} 个单位（左加右减）。`);
      } else if (type === 8) {
        const a = rnd(1, 8), b = rnd(1, 8);
        o = opts(G("gen.graph_transform.uo32", { v1: b }, `先关于 y 轴对称再向上平移 ${b}`), () => G("gen.graph_transform.uo33", { v1: b }, `先向上平移 ${b} 再关于 y 轴对称`), () => G("gen.graph_transform.uo34", { v1: a, v2: b }, `向右平移 ${a} 再上移 ${b}`), () => G("gen.graph_transform.uo35", { v1: b }, `关于原点对称再上移 ${b}`));
        q = G("gen.graph_transform.uq8", { v1: b }, `y=f(x) → y=f(−x)+${b} 的变换顺序是？`);
        exp = G("gen.graph_transform.ue8", { v1: b, v2: b }, `先作 x→−x（关于 y 轴对称），再加 ${b}（向上平移 ${b}）。`);
      } else {
        const a = rnd(1, 8), b = rnd(1, 8);
        o = opts(G("gen.graph_transform.uo36", { v1: a, v2: b }, `向右平移 ${a} 且向上平移 ${b}`), () => G("gen.graph_transform.uo37", { v1: a, v2: b }, `向左平移 ${a} 且向下平移 ${b}`), () => G("gen.graph_transform.uo38", null, `关于 y 轴对称`), () => G("gen.graph_transform.uo39", { v1: a }, `纵向拉伸 ${a} 倍`));
        q = G("gen.graph_transform.uq9", { v1: a, v2: b }, `y=f(x) → y=f(x−${a})+${b} 的变换是？`);
        exp = G("gen.graph_transform.ue9", { v1: a, v2: b, v3: a, v4: b }, `右移 ${a} 单位、上移 ${b} 单位（x−${a} 右移、+${b} 上移）。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.graph_transform.pt0", null, "图像变换")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 极坐标深化（十二年级+）
   * ============================================================ */
  function qPolarDeep(n) {
    const results = [];
    const TH = [Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 12), b = rnd(1, 12);
        const rho = Math.sqrt(a * a + b * b);
        o = opts(`${rho.toFixed(2)}`, () => `${(a + b).toFixed(2)}`, () => `${Math.abs(a - b)}`, () => `${(a * a + b * b)}`);
        q = G("gen.polar_deep.uq0", { v1: a, v2: b }, `直角坐标点 (${a}, ${b}) 的极径 ρ = ？`);
        exp = G("gen.polar_deep.ue0", { v1: a*a, v2: b*b, v3: rho.toFixed(2) }, `ρ = √(a²+b²) = √(${a*a}+${b*b}) ≈ ${rho.toFixed(2)}。`);
      } else if (type === 1) {
        const th = pick(TH), rho = rnd(2, 8);
        const x = (rho * Math.cos(th)).toFixed(2), y = (rho * Math.sin(th)).toFixed(2);
        o = opts(`(${x}, ${y})`, () => `(${y}, ${x})`, () => `(${-x}, ${y})`, () => `(${rho}, ${rho})`);
        q = G("gen.polar_deep.uq1", { v1: rho, v2: (th * 180 / Math.PI).toFixed(0) }, `极坐标 (ρ=${rho}, θ=${(th * 180 / Math.PI).toFixed(0)}°) 的直角坐标是？`);
        exp = G("gen.polar_deep.ue1", { v1: x, v2: y }, `x=ρcosθ≈${x}, y=ρsinθ≈${y}。`);
      } else if (type === 2) {
        const a = rnd(1, 6);
        o = opts(`(${a}, 0)`, () => `(0, ${a})`, () => `(-${a}, 0)`, () => `(0, 0)`);
        q = G("gen.polar_deep.uq2", { v1: a }, `极坐标方程 ρ = 2·${a}·cosθ 表示的圆，其圆心是？`);
        exp = G("gen.polar_deep.ue2", { v1: a, v2: a, v3: a }, `ρ=2a cosθ → x²+y²=2ax → (x−${a})²+y²=${a}²，圆心(${a},0)。`);
      } else if (type === 3) {
        const r1 = rnd(2, 7), r2 = rnd(2, 7), th = pick(TH);
        const d = Math.sqrt(r1 * r1 + r2 * r2 - 2 * r1 * r2 * Math.cos(th));
        o = opts(`${d.toFixed(2)}`, () => `${(r1 + r2).toFixed(2)}`, () => `${Math.abs(r1 - r2).toFixed(2)}`, () => `${(r1 * r2).toFixed(2)}`);
        q = G("gen.polar_deep.uq3", { v1: r1, v2: r2, v3: (th * 180 / Math.PI).toFixed(0) }, `极坐标 P1(${r1}, 0)、P2(${r2}, ${(th * 180 / Math.PI).toFixed(0)}°)，两点距离 = ？`);
        exp = G("gen.polar_deep.ue3", { v1: (th * 180 / Math.PI).toFixed(0), v2: d.toFixed(2) }, `d² = ρ1²+ρ2²−2ρ1ρ2cos(${(th * 180 / Math.PI).toFixed(0)}°) ≈ ${d.toFixed(2)}²。`);
      } else if (type === 4) {
        const R = rnd(2, 9);
        o = opts(`ρ = ${R}`, () => `ρ = ${R * R}`, () => `θ = ${R}`, () => `ρ = 2${R}`);
        q = G("gen.polar_deep.uq4", { v1: R * R }, `直角坐标方程 x² + y² = ${R * R} 化为极坐标是？`);
        exp = G("gen.polar_deep.ue4", { v1: R * R, v2: R }, `x²+y²=ρ²，故 ρ²=${R * R} → ρ=${R}。`);
      } else if (type === 5) {
        const x = rnd(2, 9), y = rnd(2, 9);
        const ang = (Math.atan2(y, x) * 180 / Math.PI).toFixed(1);
        o = opts(`${ang}°`, () => `${(Math.atan2(x, y) * 180 / Math.PI).toFixed(1)}°`, () => `${(90 - Math.atan2(y, x) * 180 / Math.PI).toFixed(1)}°`, () => `0°`);
        q = G("gen.polar_deep.uq5", { v1: x, v2: y }, `直角坐标点 (${x}, ${y}) 的极角 θ（主值，度）约为？`);
        exp = G("gen.polar_deep.ue5", { v1: y, v2: x, v3: ang }, `tanθ = ${y}/${x}，第一象限，θ ≈ ${ang}°。`);
      } else if (type === 6) {
        const b = rnd(1, 7);
        o = opts(`y = ${b}`, () => `x = ${b}`, () => `y = ${b * b}`, () => `x²+y² = ${b}`);
        q = G("gen.polar_deep.uq6", { v1: b }, `极坐标方程 ρ·sinθ = ${b} 化为直角坐标方程是？`);
        exp = G("gen.polar_deep.ue6", { v1: b }, `ρsinθ = y，故 y = ${b}（一条水平直线）。`);
      } else if (type === 7) {
        const a = rnd(1, 6);
        o = opts(`(0, ${a})`, () => `(${a}, 0)`, () => `(-${a}, 0)`, () => `(0, 0)`);
        q = G("gen.polar_deep.uq7", { v1: a }, `极坐标方程 ρ = 2·${a}·sinθ 表示的圆，其圆心是？`);
        exp = G("gen.polar_deep.ue7", { v1: a, v2: a, v3: a }, `ρ=2a sinθ → x²+y²=2ay → x²+(y−${a})²=${a}²，圆心(0,${a})。`);
      } else if (type === 8) {
        const R = rnd(2, 6), th = pick(TH);
        const area = (0.5 * R * R * th).toFixed(2);
        o = opts(`${area}`, () => `${(R * R * th).toFixed(2)}`, () => `${(0.5 * R * th).toFixed(2)}`, () => `${R.toFixed(2)}`);
        q = G("gen.polar_deep.uq8", { v1: R, v2: (th * 180 / Math.PI).toFixed(0) }, `极坐标曲线 ρ = ${R} 在 θ∈[0, ${(th * 180 / Math.PI).toFixed(0)}°] 扫过的面积 = ？`);
        exp = G("gen.polar_deep.ue8", { v1: R, v2: (th * 180 / Math.PI).toFixed(0), v3: area }, `面积 = (1/2)∫ρ²dθ = (1/2)·${R}²·${(th * 180 / Math.PI).toFixed(0)}°(弧度) ≈ ${area}。`);
      } else {
        const x = rnd(1, 9), y = rnd(1, 9);
        const rho = Math.sqrt(x * x + y * y);
        o = opts(`${rho.toFixed(2)}`, () => `${(x + y).toFixed(2)}`, () => `${(x * x + y * y)}`, () => `${Math.abs(x - y).toFixed(2)}`);
        q = G("gen.polar_deep.uq9", { v1: x, v2: y }, `直角坐标点 (${x}, ${y}) 的极径 ρ = ？`);
        exp = G("gen.polar_deep.ue9", { v1: x*x, v2: y*y, v3: rho.toFixed(2) }, `ρ = √(x²+y²) = √(${x*x}+${y*y}) ≈ ${rho.toFixed(2)}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.polar_deep.upt0", null, "极坐标深化"), type === 0 ? "polar_grid" : null));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 参数方程求最值（十二年级+）
   * ============================================================ */
  function qParamExtremum(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 8);
        const m = (a * Math.SQRT2).toFixed(2);
        o = opts(`${m}`, () => `${a}`, () => `${2 * a}`, () => `1`);
        q = G("gen.param_extremum.uq0", { v1: a, v2: a }, `参数方程 x=${a}cosθ, y=${a}sinθ，则 x+y 的最大值为？`);
        exp = G("gen.param_extremum.ue0", { v1: a, v2: a, v3: m }, `x+y = ${a}(cosθ+sinθ)，振幅 ${a}√2，最大 ${m}。`);
      } else if (type === 1) {
        const a = rnd(1, 7), b = rnd(1, 7);
        const m = Math.sqrt(a * a + b * b).toFixed(2);
        o = opts(`${m}`, () => `${(a + b).toFixed(2)}`, () => `${Math.max(a, b)}`, () => `${a * b}`);
        q = G("gen.param_extremum.uq1", { v1: a, v2: b }, `参数方程 x=${a}cosθ, y=${b}sinθ，则 x+y 的最大值为？`);
        exp = G("gen.param_extremum.ue1", { v1: a*a, v2: b*b, v3: m }, `a cosθ+b sinθ 振幅 √(a²+b²)=√(${a*a}+${b*b}) ≈ ${m}。`);
      } else if (type === 2) {
        const p = rnd(2, 8), q2 = rnd(1, 9);
        const m = (q2 - p * p / 4).toFixed(2);
        o = opts(`${m}`, () => `${q2}`, () => `${(q2 - p).toFixed(2)}`, () => `${-p}`);
        q = G("gen.param_extremum.uq2", { v1: p, v2: q2 }, `参数方程 x=t, y=t²−${p}t+${q2}，则 y 的最小值为？`);
        exp = G("gen.param_extremum.ue2", { v1: p, v2: q2, v3: p, v4: m }, `y=(t−${p}/2)² + (${q2} − ${p}²/4)，顶点处最小 ≈ ${m}。`);
      } else if (type === 3) {
        const a = rnd(1, 6), b = rnd(1, 6);
        o = opts(`${a + b}`, () => `${a}`, () => `${b}`, () => `${Math.sqrt(a * a + b * b).toFixed(2)}`);
        q = G("gen.param_extremum.uq3", { v1: a, v2: b, v3: b }, `参数方程 x=${a}+${b}cosθ, y=${b}sinθ（圆），点 (x,y) 到原点距离的最大值是？`);
        exp = G("gen.param_extremum.ue3", { v1: a, v2: b, v3: a, v4: b }, `圆心(${a},0)、半径 ${b}，到原点最大距离 = ${a}+${b}。`);
      } else if (type === 4) {
        const A = rnd(1, 6), B = rnd(1, 6);
        const m = (A * B / 4).toFixed(2);
        o = opts(`${m}`, () => `${(A * B).toFixed(2)}`, () => `${(A / 4).toFixed(2)}`, () => `${(B / 4).toFixed(2)}`);
        q = G("gen.param_extremum.uq4", { v1: A, v2: B }, `参数方程 x=${A}cos²θ, y=${B}sin²θ，则 xy 的最大值为？`);
        exp = G("gen.param_extremum.ue4", { v1: A, v2: B, v3: A, v4: B, v5: A, v6: B, v7: m }, `xy = ${A}${B}cos²θsin²θ = (${A}${B}/4)sin²2θ ≤ ${A}${B}/4 ≈ ${m}。`);
      } else if (type === 5) {
        const a = rnd(1, 6), b = rnd(1, 6), p = rnd(1, 5), q2 = rnd(1, 5);
        const m = Math.sqrt(p * p * a * a + q2 * q2 * b * b).toFixed(2);
        o = opts(`${m}`, () => `${(p * a + q2 * b).toFixed(2)}`, () => `${(p * b + q2 * a).toFixed(2)}`, () => `${a + b}`);
        q = G("gen.param_extremum.uq5", { v1: a, v2: b, v3: p, v4: q2 }, `参数方程 x=${a}cosθ, y=${b}sinθ，则 ${p}x+${q2}y 的最大值为？`);
        exp = G("gen.param_extremum.ue5", { v1: p, v2: a, v3: q2, v4: b, v5: p, v6: a, v7: q2, v8: b, v9: m }, `${p}·${a}cosθ+${q2}·${b}sinθ 振幅 √((${p}${a})²+(${q2}${b})²) ≈ ${m}。`);
      } else if (type === 6) {
        const a = rnd(1, 9);
        const m = (2 * Math.sqrt(a)).toFixed(2);
        o = opts(`${m}`, () => `${a}`, () => `${Math.sqrt(a).toFixed(2)}`, () => `1`);
        q = G("gen.param_extremum.uq6", { v1: a }, `参数 t>0，x = t + ${a}/t 的最小值为（均值不等式）？`);
        exp = G("gen.param_extremum.ue6", { v1: a, v2: a, v3: m, v4: a }, `t>0 时 t+${a}/t ≥ 2√(${a}) ≈ ${m}，t=√${a} 取等。`);
      } else if (type === 7) {
        const a = rnd(1, 6), b = rnd(2, 9);
        const m = (b * b / (4 * a)).toFixed(2);
        o = opts(`${m}`, () => `${(b / (2 * a)).toFixed(2)}`, () => `${(b * b / a).toFixed(2)}`, () => `${b}`);
        q = G("gen.param_extremum.uq7", { v1: a, v2: b }, `参数方程 y = −${a}t² + ${b}t（抛体高度），y 的最大值为？`);
        exp = G("gen.param_extremum.ue7", { v1: b, v2: a, v3: b, v4: a, v5: m }, `顶点 t=${b}/(2${a})，y = ${b}²/(4${a}) ≈ ${m}。`);
      } else if (type === 8) {
        const R = rnd(1, 8);
        o = opts(`${R * R}`, () => `${R}`, () => `${2 * R}`, () => `${R * R * R}`);
        q = G("gen.param_extremum.uq8", { v1: R, v2: R }, `参数方程 x=${R}cosθ, y=${R}sinθ，则 x²+y² = ？`);
        exp = G("gen.param_extremum.ue8", { v1: R, v2: R, v3: R }, `x²+y² = ${R}²cos²θ+${R}²sin²θ = ${R}²（`);
      } else {
        const A = rnd(1, 6), B = rnd(1, 6);
        const area = (Math.PI * A * B).toFixed(2);
        o = opts(`${area}`, () => `${(2 * A * B).toFixed(2)}`, () => `${(Math.PI * Math.max(A, B)).toFixed(2)}`, () => `${(A * B).toFixed(2)}`);
        q = G("gen.param_extremum.uq9", { v1: A, v2: B }, `参数方程 x=${A}cosθ, y=${B}sinθ 表示的椭圆面积是？`);
        exp = G("gen.param_extremum.ue9", { v1: A, v2: B, v3: area }, `椭圆面积 = π·${A}·${B} ≈ ${area}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.param_extremum.upt0", null, "参数方程求最值"), type === 3 ? "param_curve" : null));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 向量法解立体几何进阶（十二年级+）
   * ============================================================ */
  function qVectorGeoAdv(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 9), b = rnd(1, 9);
        o = opts("90°", () => "0°", () => "45°", () => "180°");
        q = G("gen.vector_geo_adv.uq0", { v1: a, v2: b }, `方向向量 u=(${a},0,0)、v=(0,${b},0) 的两直线夹角 = ？`);
        exp = G("gen.vector_geo_adv.ue0", null, `u·v=0 → 夹角 90°。`);
      } else if (type === 1) {
        const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9);
        const s = Math.sqrt(a * a + b * b + c * c);
        const sinp = (c / s).toFixed(3);
        o = opts(`${sinp}`, () => `${(a / s).toFixed(3)}`, () => `${(Math.sqrt(a * a + c * c) / s).toFixed(3)}`, () => `1`);
        q = G("gen.vector_geo_adv.uq1", { v1: a, v2: b, v3: c }, `直线方向向量 s=(${a},${b},${c})，平面法向量 n=(0,0,1)，则线面角 φ 满足 sinφ = ？`);
        exp = G("gen.vector_geo_adv.ue1", { v1: c, v2: s.toFixed(3), v3: sinp }, `sinφ = |s·n|/(|s||n|) = ${c}/${s.toFixed(3)} ≈ ${sinp}。`);
      } else if (type === 2) {
        const a = rnd(1, 9), b = rnd(1, 9);
        o = opts("0", () => "1", () => "1/√2", () => "√2/2");
        q = G("gen.vector_geo_adv.uq2", { v1: a, v2: b }, `两平面法向量 n1=(${a},0,0)、n2=(0,${b},0)，二面角的余弦绝对值 = ？`);
        exp = G("gen.vector_geo_adv.ue2", null, `n1·n2=0，cos=0，二面角为 90°。`);
      } else if (type === 3) {
        const a = rnd(1, 6), b = rnd(1, 6), c = rnd(1, 6);
        const p = rnd(1, 6), q2 = rnd(1, 6), r = rnd(1, 6);
        const num = a * p + b * q2 + c * r;
        const den = Math.sqrt(a * a + b * b + c * c);
        const d = (Math.abs(num) / den).toFixed(2);
        o = opts(`${d}`, () => `${(Math.abs(num)).toFixed(2)}`, () => `${den.toFixed(2)}`, () => `${(Math.abs(num) / (a + b + c)).toFixed(2)}`);
        q = G("gen.vector_geo_adv.uq3", { v1: a, v2: b, v3: c, v4: p, v5: q2, v6: r }, `平面 ${a}x+${b}y+${c}z=0 到点 P(${p},${q2},${r}) 的距离是？`);
        exp = G("gen.vector_geo_adv.ue3", { v1: a, v2: p, v3: b, v4: q2, v5: c, v6: r, v7: a*a, v8: b*b, v9: c*c, v10: num, v11: den.toFixed(2), v12: d }, `d = |${a}·${p}+${b}·${q2}+${c}·${r}|/√(${a*a}+${b*b}+${c*c}) = |${num}|/${den.toFixed(2)} ≈ ${d}。`);
      } else if (type === 4) {
        const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9);
        const cosv = (b / Math.sqrt(b * b + c * c)).toFixed(3);
        o = opts(`${cosv}`, () => `${(a / Math.sqrt(b * b + c * c)).toFixed(3)}`, () => `${(c / Math.sqrt(a * a + b * b)).toFixed(3)}`, () => `1`);
        q = G("gen.vector_geo_adv.uq4", { v1: a, v2: b, v3: c }, `向量 a=(${a},0,0)、b=(${b},${c},0) 的夹角余弦 cosθ = ？`);
        exp = G("gen.vector_geo_adv.ue4", { v1: a, v2: b, v3: a, v4: b*b, v5: c*c, v6: b, v7: b*b, v8: c*c, v9: cosv }, `cosθ = a·b/(|a||b|) = ${a}·${b}/(${a}·√(${b*b}+${c*c})) = ${b}/√(${b*b}+${c*c}) ≈ ${cosv}。`);
      } else if (type === 5) {
        const a = rnd(1, 9), b = rnd(1, 9);
        o = opts(G("gen.vector_geo_adv.uo0", null, "垂直"), () => G("gen.vector_geo_adv.uo1", null, "平行"), () => G("gen.vector_geo_adv.uo2", null, "夹角 60°"), () => G("gen.vector_geo_adv.uo3", null, "重合"));
        q = G("gen.vector_geo_adv.uq5", { v1: a, v2: b, v3: b, v4: a }, `方向向量 u=(${a},${b},0)、v=(−${b},${a},0) 的两直线位置 = ？`);
        exp = G("gen.vector_geo_adv.ue5", { v1: a, v2: b, v3: b, v4: a }, `u·v = −${a}·${b}+${b}·${a}+0 = 0 → 两直线垂直。`);
      } else if (type === 6) {
        const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9);
        const len = Math.sqrt(a * a + b * b + c * c).toFixed(2);
        o = opts(`${len}`, () => `${(a * a + b * b + c * c)}`, () => `${a + b + c}`, () => `${Math.max(a, b, c)}`);
        q = G("gen.vector_geo_adv.uq6", { v1: a, v2: b, v3: c }, `向量 AB = (${a},${b},${c})，则 |AB| = ？`);
        exp = G("gen.vector_geo_adv.ue6", { v1: a*a, v2: b*b, v3: c*c, v4: a*a+b*b+c*c, v5: len }, `|AB| = √(${a*a}+${b*b}+${c*c}) = √(${a*a+b*b+c*c}) ≈ ${len}。`);
      } else if (type === 7) {
        const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9);
        o = opts(`${a}x+${b}y+${c}z=0`, () => `${a}x+${b}y+${c}z=1`, () => `${a}x−${b}y+${c}z=0`, () => `${a}x²+${b}y²+${c}z²=0`);
        q = G("gen.vector_geo_adv.uq7", { v1: a, v2: b, v3: c }, `过原点、法向量 n=(${a},${b},${c}) 的平面方程是？`);
        exp = G("gen.vector_geo_adv.ue7", { v1: a, v2: b, v3: c }, `平面: n·(x,y,z) = 0 → ${a}x+${b}y+${c}z=0。`);
      } else if (type === 8) {
        const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9);
        const dot = a * b + b * c + c * a;
        o = opts(`${dot}`, () => `${a * a + b * b + c * c}`, () => `${a + b + c}`, () => `0`);
        q = G("gen.vector_geo_adv.uq8", { v1: a, v2: b, v3: c, v4: b, v5: c, v6: a }, `向量 u=(${a},${b},${c})、v=(${b},${c},${a}) 的点积 u·v = ？`);
        exp = G("gen.vector_geo_adv.ue8", { v1: a, v2: b, v3: b, v4: c, v5: c, v6: a, v7: dot }, `u·v = ${a}·${b}+${b}·${c}+${c}·${a} = ${dot}。`);
      } else {
        const a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9);
        o = opts("0", () => `${a * a + b * b + c * c}`, () => `${a + b + c}`, () => `${a * b * c}`);
        q = G("gen.vector_geo_adv.uq9", { v1: a, v2: b, v3: c }, `向量 u=(${a},${b},${c}) 与自身的叉积 u×u = ？`);
        exp = G("gen.vector_geo_adv.ue9", null, `任意向量与自身的叉积为 0 向量。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.vector_geo_adv.upt0", null, "向量法解立体几何"), type === 6 ? "vector_solid_adv" : null));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 绝对值不等式（十二年级+）
   * ============================================================ */
  function qAbsIneq(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const A = rnd(2, 9);
        o = opts(`(−${A}, ${A})`, () => `(−∞,${A})`, () => `[−${A},${A}]`, () => `x<${A}`);
        q = G("gen.abs_ineq.uq0", { v1: A }, `不等式 |x| < ${A} 的解集是？`);
        exp = G("gen.abs_ineq.ue0", { v1: A, v2: A, v3: A, v4: A, v5: A }, `|x|<${A} ⇔ −${A} < x < ${A}，即 (−${A},${A})。`);
      } else if (type === 1) {
        const B = rnd(1, 9), C = rnd(1, 9);
        const lo = B - C, hi = B + C;
        o = opts(`[${lo}, ${hi}]`, () => `[${B},${hi}]`, () => `(−∞,${hi}]`, () => `x≤${hi}`);
        q = G("gen.abs_ineq.uq1", { v1: B, v2: C }, `|x−${B}| ≤ ${C} 的解集是？`);
        exp = G("gen.abs_ineq.ue1", { v1: C, v2: B, v3: C, v4: lo, v5: hi, v6: lo, v7: hi }, `−${C} ≤ x−${B} ≤ ${C} ⇔ ${lo} ≤ x ≤ ${hi}，即 [${lo},${hi}]。`);
      } else if (type === 2) {
        const a = rnd(1, 9), b = rnd(2, 9);
        const lo = -b - a, hi = b - a;
        o = opts(`(−∞,${lo}] ∪ [${hi},+∞)`, () => `[${lo},${hi}]`, () => `x≥${hi}`, () => `x≤${lo}`);
        q = G("gen.abs_ineq.uq2", { v1: a, v2: b }, `|x+${a}| ≥ ${b} 的解集是？`);
        exp = G("gen.abs_ineq.ue2", { v1: a, v2: b, v3: a, v4: b, v5: hi, v6: lo }, `x+${a}≥${b} 或 x+${a}≤−${b} ⇔ x≥${hi} 或 x≤${lo}。`);
      } else if (type === 3) {
        const c = rnd(1, 10), d = rnd(1, 8);
        o = opts(`(${c - d}, ${c + d})`, () => `(${c},${c + d})`, () => `(${c - d},${c})`, () => `(−${d},${c + d})`);
        q = G("gen.abs_ineq.uq3", { v1: c, v2: d, v3: c, v4: d }, `|x−${c}| < ${d} 表示 x 到 ${c} 的距离小于 ${d}，解集 = ？`);
        exp = G("gen.abs_ineq.ue3", { v1: c, v2: d, v3: c, v4: d, v5: c - d, v6: c + d }, `${c}−${d} < x < ${c}+${d} ⇔ ${c - d} < x < ${c + d}。`);
      } else if (type === 4) {
        const A = rnd(1, 9), B = rnd(1, 9);
        o = opts(`${A + B}`, () => `${Math.abs(A - B)}`, () => `${A * B}`, () => `${Math.max(A, B)}`);
        q = G("gen.abs_ineq.uq4", { v1: A, v2: B }, `已知 |x|=${A}, |y|=${B}，则 |x+y| 的最大值是（三角不等式）？`);
        exp = G("gen.abs_ineq.ue4", { v1: A, v2: B }, `|x+y| ≤ |x|+|y| = ${A}+${B}，同号时取等。`);
      } else if (type === 5) {
        const a = rnd(1, 9), b = rnd(1, 9);
        o = opts(`${a + b}`, () => `${Math.abs(a - b)}`, () => `${a * b}`, () => `${Math.max(a, b)}`);
        q = G("gen.abs_ineq.uq5", { v1: a, v2: b }, `实数 a=${a}, b=${b}（均大于 0），则 |a+b| = ？`);
        exp = G("gen.abs_ineq.ue5", { v1: a + b }, `a,b>0 时 |a+b| = a+b = ${a + b}。`);
      } else if (type === 6) {
        const e = rnd(1, 9), f = rnd(1, 9);
        const mn = Math.abs(e - f);
        o = opts(`${mn}`, () => `0`, () => `${e + f}`, () => `${Math.max(e, f)}`);
        q = G("gen.abs_ineq.uq6", { v1: e, v2: f }, `函数 f(x)=|x−${e}|+|x−${f}| 的最小值是？`);
        exp = G("gen.abs_ineq.ue6", { v1: e, v2: f, v3: e, v4: f, v5: f, v6: e, v7: mn }, `|x−${e}|+|x−${f}| ≥ |(x−${e})−(x−${f})| = |${f}-${e}| = ${mn}。`);
      } else if (type === 7) {
        const k = rnd(2, 9), m = rnd(1, 20), p = rnd(1, 9);
        const s1 = (m + p) / k, s2 = (m - p) / k;
        o = opts(G("gen.abs_ineq.uo0", { v1: s1, v2: s2 }, `x=${s1} 或 x=${s2}`), () => `x=${s1}`, () => `x=${s2}`, () => `x=${m / k}`);
        q = G("gen.abs_ineq.uq7", { v1: k, v2: m, v3: p }, `方程 |${k}x−${m}| = ${p} 的解是？`);
        exp = G("gen.abs_ineq.ue7", { v1: k, v2: m, v3: p, v4: m, v5: p, v6: k, v7: s1, v8: s2 }, `${k}x−${m}=±${p} → x=(${m}±${p})/${k} = ${s1} 或 ${s2}。`);
      } else if (type === 8) {
        const A = rnd(2, 9);
        o = opts(`(−∞,−${A}] ∪ [${A},+∞)`, () => `(−${A},${A})`, () => `x≥${A}`, () => `[−${A},${A}]`);
        q = G("gen.abs_ineq.uq8", { v1: A }, `不等式 |x| ≥ ${A} 的解集是？`);
        exp = G("gen.abs_ineq.ue8", { v1: A, v2: A, v3: A }, `|x|≥${A} ⇔ x≤−${A} 或 x≥${A}。`);
      } else {
        o = opts(`|a|+|b|`, () => `||a|−|b||`, () => `|a|−|b|`, () => G("gen.abs_ineq.uo1", null, `|a|·|b|`));
        q = G("gen.abs_ineq.uq9", null, `对任意实数 a,b，恒有 |a+b| ≤ ？`);
        exp = G("gen.abs_ineq.ue9", null, `绝对值三角不等式：|a+b| ≤ |a|+|b|。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.abs_ineq.upt0", null, "绝对值不等式")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 柯西不等式应用（十二年级+）
   * ============================================================ */
  function qCauchyApp(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const R = rnd(1, 9);
        const m = (R * Math.SQRT2).toFixed(2);
        o = opts(`${m}`, () => `${R}`, () => `${2 * R}`, () => `1`);
        q = G("gen.cauchy_app.uq0", { v1: R * R }, `已知 x²+y²=${R * R}，则 x+y 的最大值为（柯西不等式）？`);
        exp = G("gen.cauchy_app.ue0", { v1: R * R, v2: 2 * R * R, v3: m }, `(1²+1²)(x²+y²) ≥ (x+y)² → 2·${R * R} ≥ (x+y)² → 最大 √(${2 * R * R}) = ${m}。`);
      } else if (type === 1) {
        const S = rnd(2, 20);
        const m = (5 * Math.sqrt(S)).toFixed(2);
        o = opts(`${m}`, () => `${Math.sqrt(S).toFixed(2)}`, () => `${2 * S}`, () => `${S}`);
        q = G("gen.cauchy_app.uq1", { v1: S }, `已知 a²+b²=${S}，则 3a+4b 的最大值为？`);
        exp = G("gen.cauchy_app.ue1", { v1: S, v2: S, v3: m }, `(a²+b²)(3²+4²) ≥ (3a+4b)² → ${S}·25 ≥ (...)² → 最大 5√${S} ≈ ${m}。`);
      } else if (type === 2) {
        const A = rnd(2, 12);
        const m = (4 / A).toFixed(3);
        o = opts(`${m}`, () => `${A}`, () => `${(2 / A).toFixed(3)}`, () => `4`);
        q = G("gen.cauchy_app.uq2", { v1: A }, `x,y>0 且 x+y=${A}，则 1/x+1/y 的最小值为？`);
        exp = G("gen.cauchy_app.ue2", { v1: A, v2: m }, `(x+y)(1/x+1/y) ≥ (1+1)² = 4 → 1/x+1/y ≥ 4/${A} ≈ ${m}。`);
      } else if (type === 3) {
        const T = rnd(1, 15);
        const m = (Math.sqrt(3 * T)).toFixed(2);
        o = opts(`${m}`, () => `${T}`, () => `${Math.sqrt(T).toFixed(2)}`, () => `3`);
        q = G("gen.cauchy_app.uq3", { v1: T }, `已知 x²+y²+z²=${T}，则 x+y+z 的最大值为？`);
        exp = G("gen.cauchy_app.ue3", { v1: T, v2: 3 * T, v3: m }, `(1+1+1)(x²+y²+z²) ≥ (x+y+z)² → 3·${T} ≥ (x+y+z)² → 最大 √(${3 * T}) ≈ ${m}。`);
      } else if (type === 4) {
        const deg = pick([0, 30, 45, 60, 90, 120, 150, 180]);
        const cs = Math.cos(deg * Math.PI / 180).toFixed(3);
        o = opts(`${cs}`, () => `${Math.sin(deg * Math.PI / 180).toFixed(3)}`, () => `1`, () => `0`);
        q = G("gen.cauchy_app.uq4", { v1: deg }, `n 维单位向量 u,v，若夹角为 ${deg}°，则 Σaᵢbᵢ（点积） = ？`);
        exp = G("gen.cauchy_app.ue4", { v1: deg, v2: deg, v3: cs }, `点积 = |u||v|cos ${deg}° = cos ${deg}° = ${cs}。`);
      } else if (type === 5) {
        const R = rnd(1, 9);
        const m = (R * Math.sqrt(13)).toFixed(2);
        o = opts(`${m}`, () => `${(R * 2).toFixed(2)}`, () => `${(R * 3).toFixed(2)}`, () => `${R}`);
        q = G("gen.cauchy_app.uq5", { v1: R * R }, `已知 x²+y²=${R * R}，则 2x+3y 的最大值为？`);
        exp = G("gen.cauchy_app.ue5", { v1: R * R, v2: R, v3: m }, `(x²+y²)(2²+3²) ≥ (2x+3y)² → ${R * R}·13 ≥ (...)² → 最大 ${R}√13 ≈ ${m}。`);
      } else if (type === 6) {
        const A = rnd(2, 12);
        const m = (9 / A).toFixed(3);
        o = opts(`${m}`, () => `${A}`, () => `${(3 / A).toFixed(3)}`, () => `9`);
        q = G("gen.cauchy_app.uq6", { v1: A }, `正数 a,b,c 且 a+b+c=${A}，则 1/a+1/b+1/c 的最小值为？`);
        exp = G("gen.cauchy_app.ue6", { v1: A, v2: m }, `(a+b+c)(1/a+1/b+1/c) ≥ (1+1+1)² = 9 → ≥ 9/${A} ≈ ${m}。`);
      } else if (type === 7) {
        const S = rnd(1, 15), p = rnd(1, 6), q2 = rnd(1, 6);
        const m = (Math.sqrt(S * (p * p + q2 * q2))).toFixed(2);
        o = opts(`${m}`, () => `${(Math.sqrt(S) * (p + q2)).toFixed(2)}`, () => `${(Math.sqrt(S * p * p + q2 * q2)).toFixed(2)}`, () => `${S}`);
        q = G("gen.cauchy_app.uq7", { v1: S, v2: p, v3: q2 }, `已知 x²+y²=${S}，则 ${p}x+${q2}y 的最大值为？`);
        exp = G("gen.cauchy_app.ue7", { v1: p, v2: q2, v3: p, v4: q2, v5: S, v6: p * p + q2 * q2, v7: S * (p * p + q2 * q2), v8: m }, `(x²+y²)(${p}²+${q2}²) ≥ (${p}x+${q2}y)² → ${S}·${p * p + q2 * q2} ≥ (...)² → 最大 √(${S * (p * p + q2 * q2)}) ≈ ${m}。`);
      } else if (type === 8) {
        const R = rnd(1, 9);
        o = opts(`${(R * Math.SQRT2).toFixed(2)}`, () => `${R}`, () => `${2 * R}`, () => `1`);
        q = G("gen.cauchy_app.uq8", { v1: R * R }, `已知 x²+y²=${R * R}，则 |x−y| 的最大值约为？`);
        exp = G("gen.cauchy_app.ue8", { v1: R }, `|x−y| ≤ √(1²+(−1)²)·√(x²+y²) = √2·${R}。`);
      } else {
        const S = rnd(2, 20);
        o = opts(`${(5 * Math.sqrt(S)).toFixed(2)}`, () => `${Math.sqrt(S).toFixed(2)}`, () => `${2 * S}`, () => `${S}`);
        q = G("gen.cauchy_app.uq9", { v1: S }, `已知 a²+b²=${S}，则 |3a−4b| 的最大值约为？`);
        exp = G("gen.cauchy_app.ue9", { v1: S }, `|3a−4b| ≤ √(3²+4²)·√(a²+b²) = 5√${S}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.cauchy_app.upt0", null, "柯西不等式应用")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 排序不等式（十二年级+）
   * ============================================================ */
  function qRearrIneq(n) {
    const results = [];
    const mk = () => { const v = [rnd(1, 4), rnd(2, 6), rnd(4, 9)]; return v.slice().sort((x, y) => x - y); };
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = mk(), b = mk();
        const same = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const rev = a[0] * b[2] + a[1] * b[1] + a[2] * b[0];
        const shuf = a[0] * b[1] + a[1] * b[2] + a[2] * b[0];
        o = opts(`${same}`, () => `${rev}`, () => `${shuf}`, () => `${a[0] + a[1] + a[2]}`);
        q = G("gen.rearrange_ineq.uq0", { v1: a.join(','), v2: b.join(',') }, `a=(${a.join(',')})、b=(${b.join(',')}) 均升序，同序乘积和 = ？`);
        exp = G("gen.rearrange_ineq.ue0", { v1: a[0], v2: b[0], v3: a[1], v4: b[1], v5: a[2], v6: b[2], v7: same }, `同序和 = ${a[0]}·${b[0]}+${a[1]}·${b[1]}+${a[2]}·${b[2]} = ${same}。`);
      } else if (type === 1) {
        const a = mk();
        const same = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
        const rev = a[0] * a[2] + a[1] * a[1] + a[2] * a[0];
        o = opts(`${same}`, () => `${rev}`, () => `${a[0] + a[1] + a[2]}`, () => `${(a[0] + a[1] + a[2]) * 2}`);
        q = G("gen.rearrange_ineq.uq1", { v1: a.join(',') }, `a=(${a.join(',')}) 与自身同序相乘之和 = ？`);
        exp = G("gen.rearrange_ineq.ue1", { v1: a[0], v2: a[0], v3: a[1], v4: a[1], v5: a[2], v6: a[2], v7: same }, `${a[0]}·${a[0]}+${a[1]}·${a[1]}+${a[2]}·${a[2]} = ${same}。`);
      } else if (type === 2) {
        const a = mk(), b = mk();
        const rev = a[0] * b[2] + a[1] * b[1] + a[2] * b[0];
        const same = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const shuf = a[0] * b[1] + a[1] * b[0] + a[2] * b[2];
        o = opts(`${rev}`, () => `${same}`, () => `${shuf}`, () => `${a[0] + a[1] + a[2]}`);
        q = G("gen.rearrange_ineq.uq2", { v1: a.join(','), v2: b.join(',') }, `a=(${a.join(',')}) 升序、b=(${b.join(',')}) 升序，反序配对（最大配最小）乘积和 = ？`);
        exp = G("gen.rearrange_ineq.ue2", { v1: a[0], v2: b[2], v3: a[1], v4: b[1], v5: a[2], v6: b[0], v7: rev }, `反序和 = ${a[0]}·${b[2]}+${a[1]}·${b[1]}+${a[2]}·${b[0]} = ${rev}。`);
      } else if (type === 3) {
        const a = mk(), b = mk();
        o = opts(G("gen.rearrange_ineq.uo0", null, "同序（都从小到大）"), () => G("gen.rearrange_ineq.uo1", null, "逆序"), () => G("gen.rearrange_ineq.uo2", null, "随意配对"), () => G("gen.rearrange_ineq.uo3", null, "交叉配对"));
        q = G("gen.rearrange_ineq.uq3", { v1: a.join(','), v2: b.join(',') }, `数组 a=(${a.join(',')})、b=(${b.join(',')}) 均升序，要使对应乘积和最大，应让两数组如何配对？`);
        exp = G("gen.rearrange_ineq.ue3", null, `同序配对（都按从小到大）得最大和。`);
      } else if (type === 4) {
        const a = mk(), b = mk();
        o = opts(G("gen.rearrange_ineq.uo4", null, "≤（前者为乱序/反序）"), () => "≥", () => "=", () => G("gen.rearrange_ineq.uo5", null, "无关"));
        q = G("gen.rearrange_ineq.uq4", { v1: a.join(','), v2: b.join(',') }, `a=(${a.join(',')}) 降序、b=(${b.join(',')}) 升序，则 a₁b₃+a₂b₂+a₃b₁ 与 a₁b₁+a₂b₂+a₃b₃ 的大小？`);
        exp = G("gen.rearrange_ineq.ue4", null, `前者是乱序/反序和，后者是同序和，故前者 ≤ 后者。`);
      } else if (type === 5) {
        const nn = rnd(3, 8);
        o = opts(G("gen.rearrange_ineq.uo6", null, "同序和 ≥ 乱序和 ≥ 反序和"), () => G("gen.rearrange_ineq.uo7", null, "同序 ≤ 乱序"), () => G("gen.rearrange_ineq.uo8", null, "乱序 ≥ 同序"), () => G("gen.rearrange_ineq.uo9", null, "反序 ≥ 同序"));
        q = G("gen.rearrange_ineq.uq5", { v1: nn }, `对 ${nn} 项两组正数，排序不等式的三类和大小关系是？`);
        exp = G("gen.rearrange_ineq.ue5", null, `同序和 ≥ 乱序和 ≥ 反序和。`);
      } else if (type === 6) {
        const x = mk(), y = mk();
        o = opts("T ≤ S", () => "T ≥ S", () => "T = S", () => G("gen.rearrange_ineq.uo10", null, "不确定"));
        q = G("gen.rearrange_ineq.uq6", { v1: x.join(','), v2: y.join(',') }, `正数 x=(${x.join(',')}) 升序、y=(${y.join(',')}) 升序，T=x₁y₃+x₂y₂+x₃y₁ 与 S=x₁y₁+x₂y₂+x₃y₃ 的关系？`);
        exp = G("gen.rearrange_ineq.ue6", null, `T 是反序/乱序和，S 是同序和，故 T ≤ S。`);
      } else if (type === 7) {
        const a = mk(), b = mk();
        const rev = a[0] * b[2] + a[1] * b[1] + a[2] * b[0];
        const same = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        o = opts(`${rev}`, () => `${same}`, () => `${a[0] * b[1] + a[1] * b[2] + a[2] * b[0]}`, () => `${a[0] + a[1] + a[2]}`);
        q = G("gen.rearrange_ineq.uq7", { v1: a.join(','), v2: b.join(',') }, `a=(${a.join(',')})、b=(${b.join(',')}) 反序配对（最大配最小）的乘积和 = ？`);
        exp = G("gen.rearrange_ineq.ue7", { v1: a[0], v2: b[2], v3: a[1], v4: b[1], v5: a[2], v6: b[0], v7: rev }, `反序 = ${a[0]}·${b[2]}+${a[1]}·${b[1]}+${a[2]}·${b[0]} = ${rev}。`);
      } else if (type === 8) {
        const a = mk(), b = mk();
        const same = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        const shuf = a[0] * b[2] + a[1] * b[0] + a[2] * b[1];
        o = opts(G("gen.rearrange_ineq.uo11", null, "同序和最大"), () => G("gen.rearrange_ineq.uo12", null, "乱序和最大"), () => G("gen.rearrange_ineq.uo13", null, "反序和最大"), () => G("gen.rearrange_ineq.uo14", null, "三者相等"));
        q = G("gen.rearrange_ineq.uq8", { v1: a.join(','), v2: b.join(',') }, `a=(${a.join(',')})、b=(${b.join(',')}) 任意配对乘积和，哪种配对最大？`);
        exp = G("gen.rearrange_ineq.ue8", { v1: same }, `排序不等式：同序和 ≥ 乱序和 ≥ 反序和，故同序和最大（=${same}）。`);
      } else {
        const a = mk(), b = mk();
        const rev = a[0] * b[2] + a[1] * b[1] + a[2] * b[0];
        o = opts(`${rev}`, () => `${a[0] * b[0] + a[1] * b[1] + a[2] * b[2]}`, () => `${a[0] + a[1] + a[2]}`, () => `${(a[0] + a[1] + a[2]) * 2}`);
        q = G("gen.rearrange_ineq.uq9", { v1: a.join(','), v2: b.join(',') }, `a=(${a.join(',')})、b=(${b.join(',')}) 反序（逆序）乘积和 = ？`);
        exp = G("gen.rearrange_ineq.ue9", { v1: a[0], v2: b[2], v3: a[1], v4: b[1], v5: a[2], v6: b[0], v7: rev }, `反序和 = ${a[0]}·${b[2]}+${a[1]}·${b[1]}+${a[2]}·${b[0]} = ${rev}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.rearrange_ineq.upt0", null, "排序不等式")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 马尔可夫链入门（大学预科）
   * ============================================================ */
  function qMarkov(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 9) / 10, b = rnd(1, 9) / 10;
        const p11 = a * a + (1 - a) * b;
        o = opts(`${p11.toFixed(3)}`, () => `${a.toFixed(1)}`, () => `${b.toFixed(1)}`, () => `${(a * b).toFixed(3)}`);
        q = G("gen.markov.uq0", { v1: a.toFixed(1), v2: (1 - a).toFixed(1), v3: b.toFixed(1), v4: (1 - b).toFixed(1) }, `转移矩阵 P=[[${a.toFixed(1)},${(1 - a).toFixed(1)}],[${b.toFixed(1)},${(1 - b).toFixed(1)}]]（行：状态1,2），从状态1出发两步后仍在状态1的概率 = ？`);
        exp = G("gen.markov.ue0", { v1: a.toFixed(1), v2: a.toFixed(1), v3: (1 - a).toFixed(1), v4: b.toFixed(1), v5: p11.toFixed(3) }, `P²₁₁ = ${a.toFixed(1)}·${a.toFixed(1)}+${(1 - a).toFixed(1)}·${b.toFixed(1)} = ${p11.toFixed(3)}。`);
      } else if (type === 1) {
        const a = rnd(1, 9) / 10, b = rnd(1, 9) / 10;
        const pi1 = b / (1 - a + b);
        o = opts(`${pi1.toFixed(3)}`, () => `${a.toFixed(1)}`, () => `${(1 - pi1).toFixed(3)}`, () => `${b.toFixed(1)}`);
        q = G("gen.markov.uq1", { v1: a.toFixed(1), v2: (1 - a).toFixed(1), v3: b.toFixed(1), v4: (1 - b).toFixed(1) }, `转移矩阵 P=[[${a.toFixed(1)},${(1 - a).toFixed(1)}],[${b.toFixed(1)},${(1 - b).toFixed(1)}]] 的平稳分布 π=(π₁,π₂) 中 π₁ = ？`);
        exp = G("gen.markov.ue1", { v1: b.toFixed(1), v2: (1 - a).toFixed(1), v3: b.toFixed(1), v4: pi1.toFixed(3) }, `平稳分布满足 π=πP，解得 π₁ = ${b.toFixed(1)}/(${(1 - a).toFixed(1)}+${b.toFixed(1)}) = ${pi1.toFixed(3)}。`);
      } else if (type === 2) {
        const a = rnd(1, 9) / 10;
        o = opts(`${a.toFixed(1)}`, () => `${(1 - a).toFixed(1)}`, () => `${(a * a).toFixed(3)}`, () => `1`);
        q = G("gen.markov.uq2", { v1: a.toFixed(1) }, `若今天处于状态1，且一步转移 P(1→1)=${a.toFixed(1)}，则明天仍在状态1的概率 = ？`);
        exp = G("gen.markov.ue2", { v1: a.toFixed(1) }, `一步转移，明天状态1 = P(1→1) = ${a.toFixed(1)}。`);
      } else if (type === 3) {
        const a = rnd(1, 9) / 10, b = rnd(1, 9) / 10;
        const p21 = b * a + (1 - b) * b;
        o = opts(`${p21.toFixed(3)}`, () => `${a.toFixed(1)}`, () => `${b.toFixed(1)}`, () => `${(a * b).toFixed(3)}`);
        q = G("gen.markov.uq3", { v1: a.toFixed(1), v2: (1 - a).toFixed(1), v3: b.toFixed(1), v4: (1 - b).toFixed(1) }, `转移矩阵 P=[[${a.toFixed(1)},${(1 - a).toFixed(1)}],[${b.toFixed(1)},${(1 - b).toFixed(1)}]]，从状态2出发两步后到状态1的概率 = ？`);
        exp = G("gen.markov.ue3", { v1: b.toFixed(1), v2: a.toFixed(1), v3: (1 - b).toFixed(1), v4: b.toFixed(1), v5: p21.toFixed(3) }, `P²₂₁ = ${b.toFixed(1)}·${a.toFixed(1)}+${(1 - b).toFixed(1)}·${b.toFixed(1)} = ${p21.toFixed(3)}。`);
      } else if (type === 4) {
        const x = rnd(1, 9) / 10;
        o = opts(G("gen.markov.uo0", null, "当前状态（与更早历史无关）"), () => G("gen.markov.uo1", null, "初始状态"), () => G("gen.markov.uo2", null, "全部历史"), () => G("gen.markov.uo3", null, "下一状态"));
        q = G("gen.markov.uq4", { v1: x.toFixed(1) }, `若马尔可夫链中 P(A→B)=${x.toFixed(1)}，则“下一状态只依赖于”什么？`);
        exp = G("gen.markov.ue4", null, `无记忆性：下一状态仅取决于当前状态。`);
      } else if (type === 5) {
        const ii = rnd(1, 6);
        o = opts(G("gen.markov.uo4", null, "吸收态"), () => G("gen.markov.uo5", null, "平稳态"), () => G("gen.markov.uo6", null, "暂态"), () => G("gen.markov.uo7", null, "周期态"));
        q = G("gen.markov.uq5", { v1: ii, v2: ii, v3: ii }, `若某状态 ${ii} 满足 P(${ii}→${ii})=1（进入后不再离开），称为？`);
        exp = G("gen.markov.ue5", null, `进入后不再离开的状态称为吸收态。`);
      } else if (type === 6) {
        const nn = rnd(2, 8);
        o = opts(G("gen.markov.uo8", null, "唯一存在"), () => G("gen.markov.uo9", null, "不存在"), () => G("gen.markov.uo10", null, "有无穷多个"), () => G("gen.markov.uo11", null, "等于初始分布"));
        q = G("gen.markov.uq6", { v1: nn }, `有限状态、不可约且非周期（共 ${nn} 个状态）的马尔可夫链，其平稳分布？`);
        exp = G("gen.markov.ue6", null, `遍历链有唯一平稳分布。`);
      } else if (type === 7) {
        const nn = rnd(2, 8);
        o = opts(G("gen.markov.uo12", null, "平稳分布（与初始无关）"), () => G("gen.markov.uo13", null, "初始分布"), () => G("gen.markov.uo14", null, "均匀分布"), () => G("gen.markov.uo15", null, "零向量"));
        q = G("gen.markov.uq7", { v1: nn }, `对含 ${nn} 个状态的遍历马尔可夫链，当步数 n→∞，状态分布趋于？`);
        exp = G("gen.markov.ue7", null, `极限分布 = 平稳分布，与初始分布无关。`);
      } else if (type === 8) {
        o = opts(G("gen.markov.uo16", null, "一步转移矩阵的平方 P²"), () => "2P", () => G("gen.markov.uo17", null, "P 的转置"), () => G("gen.markov.uo18", null, "P 的迹"));
        q = G("gen.markov.uq8", null, `马尔可夫链的“两步转移概率矩阵”等于？`);
        exp = G("gen.markov.ue8", null, `两步转移概率 = P·P = P²。`);
      } else {
        o = opts("πP = π", () => G("gen.markov.uo19", null, "π = Pπ 转置"), () => "πP = 1", () => "π + P = π");
        q = G("gen.markov.uq9", null, `马尔可夫链的平稳分布 π 满足？`);
        exp = G("gen.markov.ue9", null, `平稳分布满足 πP = π（左特征向量，特征值 1）。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.markov.upt0", null, "马尔可夫链")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 大数定律（大学预科）
   * ============================================================ */
  function qLLN(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const nn = rnd(50, 500);
        o = opts(G("gen.lln.uo0", null, "总体期望 E[X]"), () => G("gen.lln.uo1", null, "样本方差"), () => "0", () => G("gen.lln.uo2", null, "总体中位数"));
        q = G("gen.lln.uq0", { v1: nn }, `弱大数定律：样本量 n=${nn} 时，样本均值 X̄ₙ 依概率收敛于？`);
        exp = G("gen.lln.ue0", null, `弱大数定律：X̄ₙ → E[X]（依概率）。`);
      } else if (type === 1) {
        const nn = rnd(50, 500), p = rnd(1, 9) / 10;
        o = opts(`${p.toFixed(1)}`, () => `0.5`, () => `0`, () => `${nn}`);
        q = G("gen.lln.uq1", { v1: nn, v2: p.toFixed(1) }, `抛硬币 ${nn} 次，正面概率 p=${p.toFixed(1)}，正面频率 m/n 当 n→∞ 时依概率收敛于？`);
        exp = G("gen.lln.ue1", { v1: p.toFixed(1) }, `伯努利大数定律：频率依概率收敛于概率 ${p.toFixed(1)}。`);
      } else if (type === 2) {
        const nn = rnd(20, 200);
        o = opts(G("gen.lln.uo3", null, "独立同分布且期望存在（有限）"), () => G("gen.lln.uo4", null, "正态分布"), () => G("gen.lln.uo5", null, "方差有限即可"), () => G("gen.lln.uo6", null, "相互独立即可"));
        q = G("gen.lln.uq2", { v1: nn }, `辛钦大数定律要求 ${nn} 个随机变量的序列？`);
        exp = G("gen.lln.ue2", null, `辛钦：独立同分布且期望存在（有限）。`);
      } else if (type === 3) {
        const nn = rnd(20, 200);
        o = opts(G("gen.lln.uo7", null, "切比雪夫不等式"), () => G("gen.lln.uo8", null, "柯西不等式"), () => G("gen.lln.uo9", null, "排序不等式"), () => G("gen.lln.uo10", null, "詹森不等式"));
        q = G("gen.lln.uq3", { v1: nn }, `用切比雪夫类不等式证明 ${nn} 个样本均值收敛，常用的是？`);
        exp = G("gen.lln.ue3", null, `切比雪夫：P(|X̄−μ|≥ε) ≤ Var(X̄)/ε² → 0。`);
      } else if (type === 4) {
        const m = rnd(4, 12);
        const mu = (m + 1) / 2;
        o = opts(`${mu}`, () => `${m}`, () => `${mu + 1}`, () => `${(m / 2).toFixed(1)}`);
        q = G("gen.lln.uq4", { v1: m, v2: m }, `均匀 ${m} 面骰子（点数 1..${m}）掷很多次，点数平均值趋于？`);
        exp = G("gen.lln.ue4", { v1: m, v2: mu }, `期望 = (1+${m})/2 = ${mu}。`);
      } else if (type === 5) {
        const nn = rnd(100, 1000);
        o = opts(G("gen.lln.uo11", null, "收敛性（稳定性）"), () => G("gen.lln.uo12", null, "精确分布"), () => G("gen.lln.uo13", null, "方差大小"), () => G("gen.lln.uo14", null, "相关性"));
        q = G("gen.lln.uq5", { v1: nn }, `大数定律研究 ${nn} 次试验下样本均值随 n 增大的什么性质？`);
        exp = G("gen.lln.ue5", null, `大数定律研究均值随 n 增大而稳定（收敛）于期望。`);
      } else if (type === 6) {
        const nn = rnd(100, 1000);
        o = opts(G("gen.lln.uo15", null, "依概率收敛"), () => G("gen.lln.uo16", null, "几乎必然收敛"), () => G("gen.lln.uo17", null, "必然收敛"), () => G("gen.lln.uo18", null, "均方收敛"));
        q = G("gen.lln.uq6", { v1: nn }, `对 ${nn} 次独立同分布试验，弱大数定律的收敛是？`);
        exp = G("gen.lln.ue6", null, `弱大数定律是依概率收敛；强大数定律才是几乎必然收敛。`);
      } else if (type === 7) {
        const k = rnd(100, 5000);
        o = opts(G("gen.lln.uo19", null, "大量独立风险下频率趋稳于概率"), () => G("gen.lln.uo20", null, "单次赔付确定"), () => G("gen.lln.uo21", null, "损失为零"), () => G("gen.lln.uo22", null, "利率恒定"));
        q = G("gen.lln.uq7", { v1: k }, `保险公司承保 ${k} 份独立保单能稳定定价，主要依据大数定律的哪一点？`);
        exp = G("gen.lln.ue7", null, `大数定律保证大量独立重复下频率稳定于概率，便于精算。`);
      } else if (type === 8) {
        const a = rnd(1, 9), b = rnd(1, 9);
        const mu = ((a + b) / 2).toFixed(1);
        o = opts(`${mu}`, () => `${a}`, () => `${b}`, () => `${(a + b)}`);
        q = G("gen.lln.uq8", { v1: a, v2: b }, `独立同分布随机变量 X 取值 ${a},${b} 等可能，则大量抽样后 X̄ 趋于？`);
        exp = G("gen.lln.ue8", { v1: a, v2: b, v3: mu }, `E[X] = (${a}+${b})/2 = ${mu}。`);
      } else {
        const nn = rnd(50, 500);
        o = opts(G("gen.lln.uo23", null, "样本均值"), () => G("gen.lln.uo24", null, "总体均值"), () => G("gen.lln.uo25", null, "中位数"), () => "0");
        q = G("gen.lln.uq9", { v1: nn }, `对 ${nn} 个独立同分布样本，依概率收敛于真实期望的是？`);
        exp = G("gen.lln.ue9", null, `样本均值依概率收敛于总体期望（弱大数定律）。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.lln.upt0", null, "大数定律")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 置信区间（大学预科）
   * ============================================================ */
  function qConfidence(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const lv = pick([90, 95, 99]);
        o = opts(G("gen.confidence.uo0", { v1: lv }, `重复抽样时约 ${lv}% 的区间覆盖参数真值`), () => G("gen.confidence.uo1", { v1: lv }, `参数有 ${lv}% 概率落在区间`), () => G("gen.confidence.uo2", null, `区间一定有真值`), () => G("gen.confidence.uo3", null, `真值固定在区间内`));
        q = G("gen.confidence.uq0", { v1: lv }, `${lv}% 置信区间的含义是？`);
        exp = G("gen.confidence.ue0", { v1: lv }, `频率派解释：重复抽样下约 ${lv}% 的区间含真值。`);
      } else if (type === 1) {
        const A = rnd(80, 120), B = rnd(2, 12);
        const z = 1.96;
        const lo = (A - z * B).toFixed(1), hi = (A + z * B).toFixed(1);
        o = opts(`(${lo}, ${hi})`, () => `(${A}, ${A + B})`, () => `(${A - B}, ${A + B})`, () => `${A}±${B}`);
        q = G("gen.confidence.uq1", { v1: A, v2: B, v3: z }, `x̄=${A}, 标准误 SE=${B}, 95% 置信区间（z=${z}）≈？`);
        exp = G("gen.confidence.ue1", { v1: A, v2: z, v3: B, v4: A, v5: (z * B).toFixed(1), v6: lo, v7: hi }, `${A} ± ${z}·${B} = ${A} ± ${(z * B).toFixed(1)} → (${lo}, ${hi})。`);
      } else if (type === 2) {
        const a = rnd(90, 95), b = a + rnd(2, 5);
        o = opts(G("gen.confidence.uo4", null, "变宽"), () => G("gen.confidence.uo5", null, "变窄"), () => G("gen.confidence.uo6", null, "不变"), () => G("gen.confidence.uo7", null, "消失"));
        q = G("gen.confidence.uq2", { v1: a, v2: b }, `置信水平从 ${a}% 提高到 ${b}%，置信区间会？`);
        exp = G("gen.confidence.ue2", null, `更高置信需更大临界值，区间变宽。`);
      } else if (type === 3) {
        const n1 = rnd(20, 100), n2 = n1 * 2;
        o = opts(G("gen.confidence.uo8", null, "变窄"), () => G("gen.confidence.uo9", null, "变宽"), () => G("gen.confidence.uo10", null, "不变"), () => G("gen.confidence.uo11", null, "先窄后宽"));
        q = G("gen.confidence.uq3", { v1: n1, v2: n2 }, `样本量从 ${n1} 增大到 ${n2}（其他不变），置信区间会？`);
        exp = G("gen.confidence.ue3", null, `SE = σ/√n 随 n 增大而减小，区间变窄。`);
      } else if (type === 4) {
        const lv = pick([90, 95, 99]);
        const z = lv === 90 ? 1.645 : lv === 95 ? 1.96 : 2.576;
        o = opts(`${z}`, () => `1.645`, () => `1.96`, () => `2.576`);
        q = G("gen.confidence.uq4", { v1: lv }, `正态总体、大样本下 ${lv}% 置信区间的双尾 z 临界值约为？`);
        exp = G("gen.confidence.ue4", { v1: lv, v2: z }, `双尾 ${lv}% 对应 z = ${z}。`);
      } else if (type === 5) {
        const A = rnd(80, 120);
        o = opts(G("gen.confidence.uo12", null, "样本均值 x̄"), () => G("gen.confidence.uo13", null, "总体均值"), () => G("gen.confidence.uo14", null, "中位数"), () => "0");
        q = G("gen.confidence.uq5", { v1: A }, `以 x̄=${A} 为点估计构造的置信区间，通常是以什么为中心？`);
        exp = G("gen.confidence.ue5", null, `区间中心是样本均值 x̄（点估计）。`);
      } else if (type === 6) {
        const sig = rnd(5, 20), nn = pick([25, 36, 49, 64, 100]);
        const se = sig / Math.sqrt(nn);
        o = opts(`${se.toFixed(2)}`, () => `${sig}`, () => `${(sig / nn).toFixed(2)}`, () => `${nn}`);
        q = G("gen.confidence.uq6", { v1: sig, v2: nn }, `总体标准差 σ=${sig}, n=${nn}，标准误 SE = ？`);
        exp = G("gen.confidence.ue6", { v1: sig, v2: nn, v3: sig, v4: Math.sqrt(nn).toFixed(2), v5: se.toFixed(2) }, `SE = σ/√n = ${sig}/√${nn} = ${sig}/${Math.sqrt(nn).toFixed(2)} ≈ ${se.toFixed(2)}。`);
      } else if (type === 7) {
        const lv = pick([90, 95, 99]);
        o = opts(G("gen.confidence.uo15", { v1: lv }, `参数有 ${lv}% 概率落在已算出的这个区间内`), () => G("gen.confidence.uo16", null, `它是随机区间，随样本而变`), () => G("gen.confidence.uo17", { v1: lv }, `其覆盖率在长期重复抽样下约为 ${lv}%`), () => G("gen.confidence.uo18", null, `用于估计总体未知参数`));
        q = G("gen.confidence.uq7", { v1: lv }, `下列关于 ${lv}% 置信区间的说法，错误的是？`);
        exp = G("gen.confidence.ue7", { v1: lv }, `频率派下参数是固定常数，不能说“有 ${lv}% 概率落在此区间”。`);
      } else if (type === 8) {
        const A = rnd(50, 150), B = rnd(3, 15);
        const lo = (A - B).toFixed(1), hi = (A + B).toFixed(1);
        o = opts(`(${lo}, ${hi})`, () => `(${A}, ${hi})`, () => `(${lo}, ${A})`, () => `${A}±${(2 * B).toFixed(1)}`);
        q = G("gen.confidence.uq8", { v1: A, v2: B }, `已知 95% 置信区间为 (${A} ± ${B})，则完整写法是？`);
        exp = G("gen.confidence.ue8", { v1: A, v2: B, v3: lo, v4: hi }, `${A} ± ${B} 即 (${lo}, ${hi})。`);
      } else {
        const n1 = rnd(30, 80), n2 = n1 + rnd(50, 200);
        o = opts(G("gen.confidence.uo19", null, "变窄"), () => G("gen.confidence.uo20", null, "变宽"), () => G("gen.confidence.uo21", null, "不变"), () => G("gen.confidence.uo22", null, "无法判断"));
        q = G("gen.confidence.uq9", { v1: n1, v2: n2 }, `将样本量由 ${n1} 增至 ${n2} 且置信水平不变，置信区间宽度会？`);
        exp = G("gen.confidence.ue9", null, `SE = σ/√n 变小，区间宽度变窄。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.confidence.upt0", null, "置信区间")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 假设检验入门（大学预科）
   * ============================================================ */
  function qHypothesis(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const mu = rnd(50, 150);
        o = opts(G("gen.hypothesis.uo0", null, "原假设 H0"), () => G("gen.hypothesis.uo1", null, "备择假设 H1"), () => G("gen.hypothesis.uo2", null, "样本均值"), () => G("gen.hypothesis.uo3", null, "显著性水平"));
        q = G("gen.hypothesis.uq0", { v1: mu }, `在检验 H0: μ=${mu} 时，我们通常用证据反对的是？`);
        exp = G("gen.hypothesis.ue0", null, `检验以“拒绝 H0”为目标，H0 是原假设。`);
      } else if (type === 1) {
        const a = pick([0.01, 0.05, 0.10]);
        o = opts(G("gen.hypothesis.uo4", { v1: a }, `第一类错误（弃真）概率不超过 ${a}`), () => G("gen.hypothesis.uo5", null, `第二类错误概率`), () => G("gen.hypothesis.uo6", null, `置信度`), () => G("gen.hypothesis.uo7", null, `p 值`));
        q = G("gen.hypothesis.uq1", { v1: a }, `显著性水平 α=${a} 表示？`);
        exp = G("gen.hypothesis.ue1", { v1: a }, `α 是犯第一类错误（H0 真却拒绝）的上限，≤${a}。`);
      } else if (type === 2) {
        const a = pick([0.01, 0.05, 0.10]);
        const p = pick([0.02, 0.03, 0.08, 0.15]);
        const rej = p < a;
        o = opts(rej ? G("gen.hypothesis.uo8", null, "拒绝 H0") : G("gen.hypothesis.uo9", null, "不拒绝 H0"), () => rej ? G("gen.hypothesis.uo10", null, "不拒绝 H0") : G("gen.hypothesis.uo11", null, "拒绝 H0"), () => G("gen.hypothesis.uo12", null, "接受 H0 为真"), () => G("gen.hypothesis.uo13", null, "无法判断"));
        q = G("gen.hypothesis.uq2", { v1: p, v2: a }, `若 p 值 = ${p}, α = ${a}，则应？`);
        exp = G("gen.hypothesis.ue2", { v1: rej ? "<" : "≥", v2: rej ? "拒绝" : "不拒绝" }, `p ${rej ? "<" : "≥"} α → ${rej ? "拒绝" : "不拒绝"} H0。`);
      } else if (type === 3) {
        const mu = rnd(50, 150);
        o = opts(G("gen.hypothesis.uo14", null, "H0 为真时却拒绝了 H0"), () => G("gen.hypothesis.uo15", null, "H0 假时未拒绝"), () => G("gen.hypothesis.uo16", null, "样本错误"), () => G("gen.hypothesis.uo17", null, "计算错误"));
        q = G("gen.hypothesis.uq3", { v1: mu }, `检验 H0: μ=${mu}，第一类错误（α 错误）是指？`);
        exp = G("gen.hypothesis.ue3", null, `第一类错误 = 弃真：H0 真却拒绝。`);
      } else if (type === 4) {
        const mu = rnd(50, 150);
        o = opts(G("gen.hypothesis.uo18", null, "H0 为假时却未拒绝 H0"), () => G("gen.hypothesis.uo19", null, "H0 真时拒绝"), () => G("gen.hypothesis.uo20", null, "p 值过大"), () => G("gen.hypothesis.uo21", null, "置信区间过宽"));
        q = G("gen.hypothesis.uq4", { v1: mu }, `检验 H0: μ=${mu}，第二类错误（β 错误）是指？`);
        exp = G("gen.hypothesis.ue4", null, `第二类错误 = 取伪：H0 假却未拒绝。`);
      } else if (type === 5) {
        const z = (rnd(15, 30) / 10).toFixed(2);
        o = opts(G("gen.hypothesis.uo22", null, "拒绝 H0"), () => G("gen.hypothesis.uo23", null, "接受 H0"), () => G("gen.hypothesis.uo24", null, "增大 α"), () => G("gen.hypothesis.uo25", null, "停止检验"));
        q = G("gen.hypothesis.uq5", { v1: z }, `当检验统计量 z=${z} 落入拒绝域时，应当？`);
        exp = G("gen.hypothesis.ue5", null, `落入拒绝域 → 拒绝 H0。`);
      } else if (type === 6) {
        const a = pick([0.05, 0.01, 0.10]);
        const cv = a === 0.05 ? "±1.96" : a === 0.01 ? "±2.576" : "±1.645";
        o = opts(`${cv}`, () => `±1.645`, () => `±2.576`, () => `±1.0`);
        q = G("gen.hypothesis.uq6", { v1: a }, `大样本、α=${a} 的双侧 z 检验临界值约为？`);
        exp = G("gen.hypothesis.ue6", { v1: a, v2: cv }, `双尾 ${a} 对应 ${cv}。`);
      } else if (type === 7) {
        const a = pick([0.05, 0.01, 0.10]);
        const cv = a === 0.05 ? "1.645" : a === 0.01 ? "2.326" : "1.282";
        o = opts(`${cv}`, () => `1.96`, () => `2.576`, () => `1.28`);
        q = G("gen.hypothesis.uq7", { v1: a }, `大样本、α=${a} 的单侧（上侧）z 检验临界值约为？`);
        exp = G("gen.hypothesis.ue7", { v1: a, v2: cv }, `单尾 ${a} 对应 z = ${cv}。`);
      } else if (type === 8) {
        o = opts(G("gen.hypothesis.uo26", null, "拒绝域越大，越易拒绝 H0"), () => G("gen.hypothesis.uo27", null, "拒绝域越小越好"), () => G("gen.hypothesis.uo28", null, "拒绝域固定不变"), () => G("gen.hypothesis.uo29", null, "与 α 无关"));
        q = G("gen.hypothesis.uq8", null, `在其他不变时，提高显著性水平 α 会使拒绝域如何？`);
        exp = G("gen.hypothesis.ue8", null, `α 增大 → 临界值减小 → 拒绝域变大，更易拒绝 H0。`);
      } else {
        const mu = rnd(50, 150);
        o = opts(G("gen.hypothesis.uo30", null, "p 值越小越反对 H0"), () => G("gen.hypothesis.uo31", null, "p 值越大越反对 H0"), () => G("gen.hypothesis.uo32", null, "p 值是 H0 为真的概率"), () => G("gen.hypothesis.uo33", null, "p 值固定为 α"));
        q = G("gen.hypothesis.uq9", { v1: mu }, `检验 H0: μ=${mu}，关于 p 值的正确说法是？`);
        exp = G("gen.hypothesis.ue9", null, `p 值是在 H0 下观测到当前或更极端结果的概率，越小越反对 H0。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.hypothesis.upt0", null, "假设检验")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 反常积分（大学预科）
   * ============================================================ */
  function qImproperInt(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const p = rnd(2, 15);
        const v = (1 / (p - 1)).toFixed(3);
        o = opts(`${v}`, () => `∞`, () => `0`, () => `${(1 / p).toFixed(3)}`);
        q = G("gen.improper_int.uq0", { v1: p }, `反常积分 ∫₁^∞ 1/x^${p} dx = ？`);
        exp = G("gen.improper_int.ue0", { v1: p - 1, v2: p - 1, v3: p - 1, v4: v }, `[−1/(${p - 1})x^{${p - 1}}]₁^∞ = 0 − (−1/(${p - 1})) = ${v}。`);
      } else if (type === 1) {
        const a = rnd(2, 15);
        o = opts(G("gen.improper_int.uo0", null, "发散（∞）"), () => G("gen.improper_int.uo1", null, `收敛到 1`), () => G("gen.improper_int.uo2", { v1: a }, `收敛到 ln${a}`), () => G("gen.improper_int.uo3", null, `收敛到 0`));
        q = G("gen.improper_int.uq1", { v1: a }, `反常积分 ∫${a}^∞ 1/x dx 的敛散性？`);
        exp = G("gen.improper_int.ue1", { v1: a }, `[ln x]${a}^∞ = ∞，发散。`);
      } else if (type === 2) {
        const qe = rnd(1, 9) / 10;
        const v = (1 / (1 - qe)).toFixed(3);
        o = opts(`${v}`, () => `1`, () => `∞`, () => `${(1 / qe).toFixed(3)}`);
        q = G("gen.improper_int.uq2", { v1: qe.toFixed(1) }, `反常积分 ∫₀¹ 1/x^${qe.toFixed(1)} dx = ？`);
        exp = G("gen.improper_int.ue2", { v1: (1 - qe).toFixed(1), v2: (1 - qe).toFixed(1), v3: v }, `[x^{${(1 - qe).toFixed(1)}}/${(1 - qe).toFixed(1)}]₀¹ = ${v}（收敛）。`);
      } else if (type === 3) {
        const p = rnd(1, 15) / 2;
        o = opts("p > 1", () => "p ≥ 1", () => "p > 0", () => "p < 1");
        q = G("gen.improper_int.uq3", { v1: p.toFixed(1) }, `积分 ∫₁^∞ 1/x^${p.toFixed(1)} dx 收敛的充要条件是？`);
        exp = G("gen.improper_int.ue3", null, `p>1 收敛于 1/(p−1)；p≤1 发散。`);
      } else if (type === 4) {
        const k = rnd(1, 12);
        o = opts("1", () => "0", () => `${k}`, () => "∞");
        q = G("gen.improper_int.uq4", { v1: k, v2: k }, `反常积分 ∫₀^∞ ${k}e^(−${k}x) dx = ？`);
        exp = G("gen.improper_int.ue4", { v1: k, v2: k, v3: k }, `∫₀^∞ ${k}e^{−${k}x} dx = [−e^{−${k}x}]₀^∞ = 0 − (−1) = 1。`);
      } else if (type === 5) {
        const a = rnd(1, 9);
        o = opts("π", () => `${Math.PI / 2}`, () => `2π`, () => `${a}π`);
        q = G("gen.improper_int.uq5", { v1: a, v2: a * a }, `反常积分 ∫_{−∞}^∞ ${a}/(${a * a}+x²) dx = ？`);
        exp = G("gen.improper_int.ue5", { v1: a }, `[arctan(x/${a})]_{−∞}^∞ = π/2 − (−π/2) = π。`);
      } else if (type === 6) {
        const a = rnd(2, 15);
        o = opts(G("gen.improper_int.uo4", null, "发散"), () => G("gen.improper_int.uo5", null, `收敛到 1`), () => G("gen.improper_int.uo6", null, `收敛到 0`), () => G("gen.improper_int.uo7", { v1: a }, `收敛到 ln${a}`));
        q = G("gen.improper_int.uq6", { v1: a }, `反常积分 ∫₀^${a} 1/x dx 的敛散性？`);
        exp = G("gen.improper_int.ue6", { v1: a }, `[ln x]₀^${a} = ∞，在 0 处发散。`);
      } else if (type === 7) {
        const a = rnd(2, 15);
        const v = (1 / Math.log(a)).toFixed(3);
        o = opts(`${v}`, () => `∞`, () => `${Math.log(a).toFixed(3)}`, () => `1`);
        q = G("gen.improper_int.uq7", { v1: a }, `反常积分 ∫${a}^∞ 1/[x(ln x)²] dx 收敛到？`);
        exp = G("gen.improper_int.ue7", { v1: a, v2: a, v3: v }, `令 u=ln x：∫_{ln ${a}}^∞ u^{−2} du = [−1/u] = 1/ln ${a} ≈ ${v}。`);
      } else if (type === 8) {
        const p = rnd(2, 6);
        const v = (1 / ((p - 1) * Math.pow(2, p - 1))).toFixed(3);
        o = opts(`${v}`, () => `∞`, () => `0`, () => `1`);
        q = G("gen.improper_int.uq8", { v1: p }, `反常积分 ∫₂^∞ 1/x^${p} dx = ？`);
        exp = G("gen.improper_int.ue8", { v1: p - 1, v2: p - 1, v3: p - 1, v4: p - 1, v5: v }, `[−1/(${p - 1})x^{${p - 1}}]₂^∞ = 1/(${p - 1})·2^{−${p - 1}} = ${v}。`);
      } else {
        const k = rnd(1, 5);
        const v = (1 / k).toFixed(3);
        o = opts(`${v}`, () => `1`, () => `0`, () => `∞`);
        q = G("gen.improper_int.uq9", { v1: k }, `反常积分 ∫₀^∞ e^(−${k}x) dx = ？`);
        exp = G("gen.improper_int.ue9", { v1: k, v2: k, v3: k, v4: v }, `[−e^(−${k}x)/${k}]₀^∞ = 1/${k} = ${v}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.improper_int.upt0", null, "反常积分")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 多元函数偏导（大学预科）
   * ============================================================ */
  function qPartialDeriv(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 6), X = rnd(1, 5), Y = rnd(1, 5);
        const v = 2 * a * X * Y;
        o = opts(`${v}`, () => `${a * X * Y}`, () => `${2 * a * X}`, () => `${Y}`);
        q = G("gen.partial_deriv.uq0", { v1: a, v2: X, v3: Y }, `f(x,y)=${a}x²y，求 ∂f/∂x 在 (${X},${Y}) 的值 = ？`);
        exp = G("gen.partial_deriv.ue0", { v1: a, v2: a, v3: X, v4: Y, v5: v }, `∂f/∂x = 2${a}xy = 2·${a}·${X}·${Y} = ${v}。`);
      } else if (type === 1) {
        const a = rnd(1, 6), X = rnd(1, 5);
        const v = a * X * X;
        o = opts(`${v}`, () => `${2 * a * X}`, () => `${a}`, () => `${2 * a * v}`);
        q = G("gen.partial_deriv.uq1", { v1: a, v2: X, v3: rnd(1, 5) }, `f(x,y)=${a}x²y，求 ∂f/∂y 在 (${X},${rnd(1, 5)}) 的值 = ？`);
        exp = G("gen.partial_deriv.ue1", { v1: a, v2: a, v3: X, v4: v }, `∂f/∂y = ${a}x² = ${a}·${X}² = ${v}。`);
      } else if (type === 2) {
        const a = rnd(1, 6), b = rnd(1, 6), X = rnd(1, 5), Y = rnd(1, 5);
        const v = 2 * a * X + b * Y;
        o = opts(`${v}`, () => `${2 * a * X}`, () => `${a * X + b * Y}`, () => `${b * Y}`);
        q = G("gen.partial_deriv.uq2", { v1: a, v2: b, v3: X, v4: Y }, `f(x,y)=${a}x²+${b}xy，求 ∂f/∂x 在 (${X},${Y}) 的值 = ？`);
        exp = G("gen.partial_deriv.ue2", { v1: a, v2: b, v3: a, v4: X, v5: b, v6: Y, v7: v }, `∂f/∂x = 2${a}x+${b}y = 2·${a}·${X}+${b}·${Y} = ${v}。`);
      } else if (type === 3) {
        const nn = rnd(2, 4);
        o = opts(G("gen.partial_deriv.uo0", null, "相等"), () => G("gen.partial_deriv.uo1", null, "互为相反数"), () => G("gen.partial_deriv.uo2", null, "无关"), () => G("gen.partial_deriv.uo3", null, "相差一个常数"));
        q = G("gen.partial_deriv.uq3", { v1: nn }, `若 ${nn} 元函数二阶混合偏导连续，则 ∂²f/∂x∂y 与 ∂²f/∂y∂x 的关系是？`);
        exp = G("gen.partial_deriv.ue3", null, `克莱罗定理：连续时混合偏导相等。`);
      } else if (type === 4) {
        const a = rnd(1, 6), b = rnd(1, 6);
        o = opts("(∂f/∂x)dx + (∂f/∂y)dy", () => "∂f/∂x + ∂f/∂y", () => "(∂f/∂x)(∂f/∂y)", () => "dx+dy");
        q = G("gen.partial_deriv.uq4", { v1: a, v2: b }, `二元函数 f(x,y)=${a}x²+${b}y² 的全微分 df = ？`);
        exp = G("gen.partial_deriv.ue4", { v1: a, v2: b }, `df = f_x dx + f_y dy = 2${a}x dx + 2${b}y dy（形式即 f_x dx + f_y dy）。`);
      } else if (type === 5) {
        const a = rnd(1, 5), X = rnd(1, 4), Y = rnd(1, 4);
        const v = (a * Y * Math.exp(a * X * Y)).toFixed(3);
        o = opts(`${v}`, () => `${(X * Math.exp(a * X * Y)).toFixed(3)}`, () => `${(Math.exp(a * X * Y)).toFixed(3)}`, () => `${(a * X * Y * Math.exp(a * X * Y)).toFixed(3)}`);
        q = G("gen.partial_deriv.uq5", { v1: a, v2: X, v3: Y }, `f(x,y)=e^(${a}xy)，求 ∂f/∂x 在 (${X},${Y}) 的值 = ？`);
        exp = G("gen.partial_deriv.ue5", { v1: a, v2: a, v3: a, v4: Y, v5: a, v6: X, v7: Y, v8: v }, `∂f/∂x = e^{${a}xy}·${a}y = ${a}·${Y}·e^{${a}·${X}·${Y}} ≈ ${v}。`);
      } else if (type === 6) {
        const a = rnd(1, 9);
        o = opts(G("gen.partial_deriv.uo4", null, "曲面沿 x 方向切线的斜率"), () => G("gen.partial_deriv.uo5", null, "曲面法向量"), () => G("gen.partial_deriv.uo6", null, "体积变化率"), () => G("gen.partial_deriv.uo7", null, "面积"));
        q = G("gen.partial_deriv.uq6", { v1: a }, `偏导数 ∂f/∂x（如 f(x,y)=x²+y²+${a}）的几何意义是？`);
        exp = G("gen.partial_deriv.ue6", null, `固定 y=y0，曲面截线对 x 的切线斜率。`);
      } else if (type === 7) {
        const P = rnd(1, 6), Q = rnd(1, 6);
        o = opts(`(${P},${Q})`, () => `(${Q},${P})`, () => `(0,0)`, () => `(${P + Q},${P})`);
        q = G("gen.partial_deriv.uq7", { v1: P, v2: Q }, `f(x,y)=x²+y²−2${P}x−2${Q}y 的唯一驻点是？`);
        exp = G("gen.partial_deriv.ue7", { v1: P, v2: Q, v3: P, v4: Q, v5: P, v6: Q }, `f_x=2x−2${P}=0, f_y=2y−2${Q}=0 → x=${P}, y=${Q}，驻点(${P},${Q})。`);
      } else if (type === 8) {
        const a = rnd(1, 6), b = rnd(1, 6), X = rnd(1, 5), Y = rnd(1, 5);
        const v = 2 * b * Y + a * X;
        o = opts(`${v}`, () => `${2 * b * Y}`, () => `${a * X + b * Y}`, () => `${a * X}`);
        q = G("gen.partial_deriv.uq8", { v1: a, v2: b, v3: X, v4: Y }, `f(x,y)=${a}xy+${b}y²，求 ∂f/∂y 在 (${X},${Y}) 的值 = ？`);
        exp = G("gen.partial_deriv.ue8", { v1: a, v2: b, v3: a, v4: X, v5: b, v6: Y, v7: v }, `∂f/∂y = ${a}x+2${b}y = ${a}·${X}+2·${b}·${Y} = ${v}。`);
      } else {
        const c = rnd(1, 6), d = rnd(1, 6);
        const v = (c * d).toFixed(3);
        o = opts(`${v}`, () => `${c}`, () => `${d}`, () => `${(c / d).toFixed(3)}`);
        q = G("gen.partial_deriv.uq9", { v1: c, v2: d }, `f(x,y)=${c}x·${d}y，求 ∂²f/∂x∂y = ？`);
        exp = G("gen.partial_deriv.ue9", { v1: c * d, v2: c * d }, `∂f/∂x = ${c * d}y，再对 y 求偏导 = ${c * d}。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.partial_deriv.upt0", null, "多元函数偏导")));
    }
    return results;
  }

  /* ============================================================
   * 拓展 · 梯度（大学预科）
   * ============================================================ */
  function qGradient(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 10;
      let q, o, exp;
      if (type === 0) {
        const a = rnd(1, 6), b = rnd(1, 6), X = rnd(1, 5), Y = rnd(1, 5);
        const v = `(${2 * a * X}, ${2 * b * Y})`;
        o = opts(`${v}`, () => `(${a * X}, ${b * Y})`, () => `(${2 * a}, ${2 * b})`, () => `(${2 * a * X + 2 * b * Y})`);
        q = G("gen.gradient.uq0", { v1: a, v2: b, v3: X, v4: Y }, `f(x,y)=${a}x²+${b}y² 的梯度 ∇f 在 (${X},${Y}) = ？`);
        exp = G("gen.gradient.ue0", { v1: a, v2: b, v3: X, v4: Y, v5: 2 * a * X, v6: 2 * b * Y }, `∇f = (2${a}x, 2${b}y)，在 (${X},${Y}) 为 (${2 * a * X}, ${2 * b * Y})。`);
      } else if (type === 1) {
        const a = rnd(1, 9);
        o = opts(G("gen.gradient.uo0", null, "函数值增加最快的方向"), () => G("gen.gradient.uo1", null, "减小最快的方向"), () => G("gen.gradient.uo2", null, "等高线切线方向"), () => G("gen.gradient.uo3", null, "任意方向"));
        q = G("gen.gradient.uq1", { v1: a }, `对 f(x,y)=x²+y²+${a}，梯度 ∇f 的方向是？`);
        exp = G("gen.gradient.ue1", null, `梯度方向是函数值增长最快的方向。`);
      } else if (type === 2) {
        const a = rnd(1, 9);
        o = opts(G("gen.gradient.uo4", null, "最大方向导数"), () => G("gen.gradient.uo5", null, "函数值"), () => G("gen.gradient.uo6", null, "零"), () => G("gen.gradient.uo7", null, "偏导数之和"));
        q = G("gen.gradient.uq2", { v1: a, v2: a }, `对 f(x,y)=${a}x+${a}y，梯度的模 |∇f| 等于？`);
        exp = G("gen.gradient.ue2", null, `|∇f| 等于该点方向导数的最大值。`);
      } else if (type === 3) {
        const a = rnd(1, 9);
        o = opts(G("gen.gradient.uo8", null, "垂直（法向）"), () => G("gen.gradient.uo9", null, "平行"), () => G("gen.gradient.uo10", null, "相切"), () => G("gen.gradient.uo11", null, "无关"));
        q = G("gen.gradient.uq3", { v1: a }, `对 f(x,y)=x²+${a}y，在一点处 ∇f 与过该点的等高线的关系是？`);
        exp = G("gen.gradient.ue3", null, `梯度垂直于等高线，指向函数增大方向（法向）。`);
      } else if (type === 4) {
        const a = rnd(1, 9);
        o = opts(G("gen.gradient.uo12", null, "∇f · u"), () => "|∇f|", () => "∇f × u", () => "∂f/∂x");
        q = G("gen.gradient.uq4", { v1: a }, `沿单位向量 u 的方向导数 D_u f（如 f(x,y)=x²+${a}y）等于？`);
        exp = G("gen.gradient.ue4", null, `D_u f = ∇f · u = |∇f|cosφ。`);
      } else if (type === 5) {
        const c = rnd(1, 6), X = rnd(1, 5), Y = rnd(1, 5);
        const v = `(${c * Y}, ${c * X})`;
        o = opts(`${v}`, () => `(${c * X}, ${c * Y})`, () => `(${c}, ${c})`, () => `(${X}, ${Y})`);
        q = G("gen.gradient.uq5", { v1: c, v2: X, v3: Y }, `f(x,y)=${c}xy 在 (${X},${Y}) 处的梯度 = ？`);
        exp = G("gen.gradient.ue5", { v1: c, v2: c, v3: X, v4: Y, v5: c * Y, v6: c * X, v7: Math.sqrt(c * c * (X * X + Y * Y)).toFixed(2) }, `∇f = (${c}y, ${c}x)，在 (${X},${Y}) 为 (${c * Y}, ${c * X})，模 ${Math.sqrt(c * c * (X * X + Y * Y)).toFixed(2)}。`);
      } else if (type === 6) {
        const a = rnd(1, 9);
        o = opts(G("gen.gradient.uo13", null, "−∇f（负梯度）"), () => "∇f", () => G("gen.gradient.uo14", null, "等高线方向"), () => G("gen.gradient.uo15", null, "任意"));
        q = G("gen.gradient.uq6", { v1: a }, `对 f(x,y)=${a}x²+y²，要使函数值下降最快，应沿哪个方向？`);
        exp = G("gen.gradient.ue6", null, `最速下降方向 = 负梯度 −∇f。`);
      } else if (type === 7) {
        const p = rnd(1, 9), q2 = rnd(1, 9);
        o = opts(`(${p}, ${q2})`, () => `(${q2}, ${p})`, () => `(${p + q2}, 0)`, () => `(${p}, 0)`);
        q = G("gen.gradient.uq7", { v1: p, v2: q2 }, `f(x,y)=${p}x+${q2}y 的梯度 ∇f = ？`);
        exp = G("gen.gradient.ue7", { v1: p, v2: q2 }, `∇f = (∂f/∂x, ∂f/∂y) = (${p}, ${q2})。`);
      } else if (type === 8) {
        const c = rnd(1, 6), X = rnd(1, 5), Y = rnd(1, 5);
        const mod = (c * Math.sqrt(X * X + Y * Y)).toFixed(2);
        o = opts(`${mod}`, () => `${c}`, () => `${(c * X).toFixed(2)}`, () => `${(c * (X + Y)).toFixed(2)}`);
        q = G("gen.gradient.uq8", { v1: c, v2: X, v3: Y }, `f(x,y)=${c}(x²+y²) 在 (${X},${Y}) 处梯度的模 = ？`);
        exp = G("gen.gradient.ue8", { v1: c, v2: c, v3: c, v4: X, v5: Y, v6: mod }, `∇f = (2${c}x, 2${c}y)，模 = 2${c}√(${X}²+${Y}²) = ${mod}。`);
      } else {
        const c = rnd(1, 6);
        const dir = `(${c}, ${c})`;
        o = opts(`${dir}`, () => `(${-c}, ${-c})`, () => `(${c}, 0)`, () => `(0, ${c})`);
        q = G("gen.gradient.uq9", { v1: c, v2: c }, `f(x,y)=${c}x+${c}y，使函数值增长最快的单位方向梯度的指向是？`);
        exp = G("gen.gradient.ue9", { v1: c, v2: c, v3: c, v4: c }, `∇f = (${c}, ${c})，指向 (${c}, ${c})（增长最快方向）。`);
      }
      results.push(Q(q, o, "进阶", exp, G("gen.gradient.upt0", null, "梯度")));
    }
    return results;
  }

  /* ============================================================
   * 注册到 window.TECHNIQUES
   * ============================================================ */
  const GEN = {
    euler: qEuler,
    taylor: qTaylor,
    numshape: qNumShape,
    induction: qInduction,
    amgm: qAmGm,
    binomial: qBinomial,
    inclusion_hs: qInclusion,
    recurrence: qRecurrence,
    tree: qTree,
    counting: qCounting,
    cauchy: qCauchy,
    linearprog: qLinearProg,
    matrix: qMatrix,
    lhopital: qLhopital,
    mvt: qMvt,
    bayes: qBayes,
    fullprob: qFullProb,
    normal_app: qNormalApp,
    definite_int: qDefiniteInt,
    diffeq: qDiffEq,
    ineq_scale: qIneqScale,
    seq_ineq: qSeqIneq,
    complex_geo: qComplexGeo,
    series: qSeries,
    coord_geo: qCoordGeo,
    jensen: qJensen,
    important_limit: qImpLimit,
    de_moivre: qDeMoivre,
    random_var: qRandVar,
    fourier: qFourier,
    integral_app: qIntApp,
    graph_transform: qGraphTrans,
    set: qSet,
    funcconcept: qFuncConcept,
    explog: qExpLog,
    trig: qTrig,
    sequence: qSequence,
    vector: qVector,
    solid: qSolid,
    derivative: qDerivative,
    conic: qConic,
    complex: qComplex,
    dist_exp: qDistExp,
    dist_binom: qDistBinom,
    stat_case: qStatCase,
    trig_id: qTrigId,
    seqsum: qSeqSum,
    solid_axis: qSolidAxis,
    solid_angle: qSolidAngle,
    deriv_mon: qDerivMon,
    deriv_ineq: qDerivIneq,
    func_zero: qFuncZero,
    conic_link: qConicLink,
    conic_chord: qConicChord,
    conic_prop: qConicProp,
    param_eq: qParamEq,
    polar_deep: qPolarDeep,
    param_extremum: qParamExtremum,
    vector_geo_adv: qVectorGeoAdv,
    abs_ineq: qAbsIneq,
    cauchy_app: qCauchyApp,
    rearrange_ineq: qRearrIneq,
    markov: qMarkov,
    lln: qLLN,
    confidence: qConfidence,
    hypothesis: qHypothesis,
    improper_int: qImproperInt,
    partial_deriv: qPartialDeriv,
    gradient: qGradient
  };

  if (window.TECHNIQUES) {
    window.TECHNIQUES.forEach(t => {
      if (GEN[t.id]) t.qgen = GEN[t.id];
    });
  }
  window.QGEN_HIGH_READY = true;
})();
