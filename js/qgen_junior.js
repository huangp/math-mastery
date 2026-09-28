/* ============================================================
 * 融会贯通 · 初中数学方法参数化出题引擎
 * 覆盖：有理数、整式、一元一次方程、不等式、方程组、
 *       线段角、三角形、全等三角形、相似三角形、勾股定理、
 *       四边形、圆、一次函数、反比例函数、二次函数
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
   * 1. 有理数与数轴（七年级）
   * ============================================================ */
  function qRational(n) {
    const results = [];
    const K = 9;
    for (let i = 0; i < n; i++) {
      const type = i % K;
      let q, ans, o, exp;
      if (type === 0) {
        // 绝对值
        let a; do { a = rnd(-15, 15); } while (a === 0);
        const absA = Math.abs(a);
        o = opts(absA, () => -absA, () => absA + 1, () => absA + 2);
        q = G("gen.rational.uq0", { v1: a }, `|${a}| = ？`);
        exp = G("gen.rational.ue0", { v1: a, v2: absA }, `绝对值表示数到原点的距离，|${a}| = ${absA}。`);
      } else if (type === 1) {
        // 相反数
        let a; do { a = rnd(-15, 15); } while (a === 0);
        const opp = -a;
        o = opts(opp, () => a, () => opp + 1, () => opp - 1);
        q = G("gen.rational.uq1", { v1: a }, `${a} 的相反数是？`);
        exp = G("gen.rational.ue1", { v1: a, v2: opp }, `相反数只变符号，${a} 的相反数是 ${opp}。`);
      } else if (type === 2) {
        // 大小比较
        const a = rnd(-9, -1);
        const b = rnd(1, 9);
        o = opts(b, () => a, () => 0, () => rnd(-9, 9));
        q = G("gen.rational.uq2", { v1: a, v2: b }, `比较 ${a} 与 ${b}，较大的数是？`);
        exp = G("gen.rational.ue2", { v1: b, v2: a, v3: b }, `正数大于负数，${b} > ${a}，较大的是 ${b}。`);
      } else if (type === 3) {
        // 数轴两点距离
        let a, b; do { a = rnd(-12, 12); b = rnd(-12, 12); } while (a === b);
        const dist = Math.abs(a - b);
        o = opts(dist, () => dist + 1, () => dist - 1, () => dist + 2);
        q = G("gen.rational.uq3", { v1: a, v2: b }, `数轴上点 A 表示 ${a}，点 B 表示 ${b}，线段 AB 的长度是？`);
        exp = G("gen.rational.ue3", { v1: a, v2: b, v3: dist }, `AB = |${a} − ${b}| = ${dist}。`);
      } else if (type === 4) {
        // 加法
        const a = rnd(-12, 12), b = rnd(-12, 12);
        const s = a + b;
        o = opts(s, () => s + 1, () => s - 1, () => s + 2);
        q = G("gen.rational.uq4", { v1: a, v2: b }, `${a} + (${b}) = ？`);
        exp = G("gen.rational.ue4", { v1: a, v2: b, v3: s }, `异号相加取绝对值较大符号：${a} + ${b} = ${s}。`);
      } else if (type === 5) {
        // 减法
        const a = rnd(-12, 12), b = rnd(-12, 12);
        const s = a - b;
        o = opts(s, () => s + 1, () => s - 1, () => s + 2);
        q = G("gen.rational.uq5", { v1: a, v2: b }, `${a} − (${b}) = ？`);
        exp = G("gen.rational.ue5", { v1: a, v2: b, v3: s }, `减去一个数等于加相反数：${a} − ${b} = ${s}。`);
      } else if (type === 6) {
        // 同号相乘为正
        const a = rnd(2, 9), b = rnd(2, 9);
        const s = a * b;
        o = opts(s, () => -s, () => a + b, () => s + 1);
        q = G("gen.rational.uq6", { v1: a, v2: b }, `(−${a}) × (−${b}) = ？`);
        exp = G("gen.rational.ue6", { v1: a, v2: b, v3: s }, `负负得正：(−${a}) × (−${b}) = ${s}。`);
      } else if (type === 7) {
        // 倒数
        const a = rnd(2, 12);
        o = opts(`1/${a}`, () => `${a}`, () => `1/${a + 1}`, () => `-1/${a}`);
        q = G("gen.rational.uq7", { v1: a }, `${a} 的倒数是？`);
        exp = G("gen.rational.ue7", { v1: a, v2: a }, `乘积为 1 的两个数互为倒数，${a} 的倒数是 1/${a}。`);
      } else {
        // 三数取最大
        const arr = [rnd(-9, 9), rnd(-9, 9), rnd(-9, 9)];
        const mx = Math.max.apply(null, arr);
        o = opts(mx, () => Math.min.apply(null, arr), () => 0, () => arr[0] + arr[1]);
        q = G("gen.rational.uq8", { v1: arr.join("、") }, `三个数 ${arr.join("、")} 中最大的是？`);
        exp = G("gen.rational.ue8", { v1: mx }, `比较大小得最大值是 ${mx}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.rational.pt0", null, "有理数基础")));
    }
    return results;
  }

  /* ============================================================
   * 2. 整式加减（七年级）
   * ============================================================ */
  function qIntegral(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 3;
      let q, ans, o, exp;
      if (type === 0) {
        // 合并同类项
        const a1 = rnd(1, 8), a2 = rnd(1, 8);
        const sum = a1 + a2;
        o = opts(`${sum}x`, () => `${a1 + a2 + 1}x`, () => `${a1}x`, () => `${a2}x`);
        q = G("gen.integral.p0q", { v1: a1, v2: a2 }, `${a1}x + ${a2}x = ？`);
        exp = G("gen.integral.0e", { v1: a1, v2: a2, v3: sum }, `同类项合并：系数相加 ${a1} + ${a2} = ${sum}，字母不变。`);
      } else if (type === 1) {
        // 去括号
        const a = rnd(1, 5);
        const b = rnd(1, 9);
        o = opts(`-${a}x + ${b}`, () => `-${a}x - ${b}`, () => `${a}x + ${b}`, () => `${a}x - ${b}`);
        q = G("gen.integral.p1q", { v1: a, v2: b }, `−(${a}x − ${b}) = ？`);
        exp = G("gen.integral.1e", { v1: a, v2: b }, `括号前是负号，去括号后各项变号：−${a}x + ${b}。`);
      } else {
        // 系数识别
        const a = rnd(2, 9);
        o = opts(`${-a}`, () => `${a}`, () => `${a + 1}`, () => `1`);
        q = G("gen.integral.2q", { v1: a }, `单项式 −${a}x² 的系数是？`);
        exp = G("gen.integral.3e", { v1: a, v2: -a }, `单项式的系数是数字因数，−${a}x² 的系数是 ${-a}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.integral.pt0", null, "整式加减")));
    }
    return results;
  }

  /* ============================================================
   * 3. 一元一次方程（七年级）
   * ============================================================ */
  function qLinear(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, ans, o, exp;
      if (type === 0) {
        // 简单方程 ax + b = c
        const x = rnd(1, 10);
        const a = rnd(2, 5);
        const b = rnd(1, 10);
        const c = a * x + b;
        o = opts(x, () => x + 1, () => x - 1, () => rnd(1, 12));
        q = G("gen.linear1.p0q", { v1: a, v2: b, v3: c }, `${a}x + ${b} = ${c}，x = ？`);
        exp = G("gen.linear1.0e", { v1: a, v2: c, v3: b, v4: c - b, v5: c - b, v6: a, v7: x }, `移项：${a}x = ${c} − ${b} = ${c - b}，x = ${c - b} ÷ ${a} = ${x}。`);
      } else if (type === 1) {
        // 去括号方程
        const x = rnd(1, 8);
        const a = rnd(2, 4);
        const b = rnd(1, 6);
        const c = a * (x + b);
        o = opts(x, () => x + 1, () => x - 1, () => rnd(1, 10));
        q = G("gen.linear1.p1q", { v1: a, v2: b, v3: c }, `${a}(x + ${b}) = ${c}，x = ？`);
        exp = G("gen.linear1.1e", { v1: b, v2: c, v3: a, v4: c / a, v5: c / a, v6: b, v7: x }, `去括号：x + ${b} = ${c} ÷ ${a} = ${c / a}，x = ${c / a} − ${b} = ${x}。`);
      } else if (type === 2) {
        // 应用题（年龄问题）
        const age = rnd(8, 15);
        const years = rnd(5, 15);
        const fatherAge = 2 * age + years; // 保证 fatherAge > 2*age，x = years 为正解
        o = opts(years, () => years + 2, () => years - 2, () => years + 5);
        q = G("gen.linear1.2q", { v1: age, v2: fatherAge }, `儿子 ${age} 岁，父亲 ${fatherAge} 岁，几年后父亲年龄是儿子的 2 倍？`);
        exp = G("gen.linear1.3e", { v1: fatherAge, v2: age, v3: years }, `设 x 年后：${fatherAge} + x = 2(${age} + x)，解得 x = ${years}。`);
      } else {
        // 分式方程
        const x = rnd(2, 8);
        const a = rnd(2, 5);
        const b = a * x;
        o = opts(x, () => x + 1, () => x - 1, () => rnd(1, 10));
        q = G("gen.linear1.p2q", { v1: b, v2: a }, `${b} ÷ x = ${a}，x = ？`);
        exp = G("gen.linear1.p3e", { v1: b, v2: a, v3: x }, `x = ${b} ÷ ${a} = ${x}。`);
      }
      results.push(Q(q, o, type < 2 ? "基础" : "进阶", exp, G("gen.linear1.pt0", null, "一元一次方程")));
    }
    return results;
  }

  /* ============================================================
   * 4. 一元一次不等式（七年级）
   * ============================================================ */
  function qInequal(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 2;
      let q, ans, o, exp;
      if (type === 0) {
        // 解不等式
        const x = rnd(2, 8);
        const a = rnd(2, 5);
        const b = rnd(1, 10);
        const c = a * x + b;
        o = opts(`x < ${x}`, () => `x > ${x}`, () => `x ≤ ${x}`, () => `x ≥ ${x}`);
        q = G("gen.inequal.0q", { v1: a, v2: b, v3: c }, `解不等式 ${a}x + ${b} < ${c}，解集是？`);
        exp = G("gen.inequal.1e", { v1: a, v2: c, v3: b, v4: c - b, v5: c - b, v6: a, v7: x }, `移项：${a}x < ${c} − ${b} = ${c - b}，x < ${c - b} ÷ ${a} = ${x}。`);
      } else {
        // 判断不等号方向
        const a = rnd(1, 5);
        const b = rnd(1, 9);
        const c = a * rnd(1, 3) + b + 5;
        o = opts(`x < ${(c - b) / a}`, () => `x > ${(c - b) / a}`, () => `x < ${((c - b) / a) + 1}`, () => `x > ${((c - b) / a) - 1}`);
        q = G("gen.inequal.2q", { v1: a, v2: b, v3: c }, `解不等式 ${a}x + ${b} < ${c}，解集是？`);
        exp = G("gen.inequal.3e", { v1: a, v2: c - b, v3: (c - b) / a }, `移项：${a}x < ${c - b}，x < ${(c - b) / a}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.inequal.pt0", null, "一元一次不等式")));
    }
    return results;
  }

  /* ============================================================
   * 5. 二元一次方程组（七年级）
   * ============================================================ */
  function qSystem(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 3;
      let q, ans, o, exp;
      if (type === 0) {
        // 代入法
        const x = rnd(1, 8);
        const y = rnd(1, 8);
        const a1 = rnd(1, 3), b1 = rnd(1, 3);
        const c1 = a1 * x + b1 * y;
        const a2 = rnd(1, 3), b2 = rnd(1, 3);
        const c2 = a2 * x + b2 * y;
        o = opts(`${x},${y}`, () => `${y},${x}`, () => `${x + 1},${y}`, () => `${x},${y + 1}`);
        q = G("gen.system.0q", { v1: a1, v2: b1, v3: c1, v4: a2, v5: b2, v6: c2 }, `方程组 ${a1}x + ${b1}y = ${c1} 与 ${a2}x + ${b2}y = ${c2} 的解是？`);
        exp = G("gen.system.1e", { v1: a1, v2: x, v3: b1, v4: y, v5: c1, v6: a2, v7: x, v8: b2, v9: y, v10: c2, v11: x, v12: y }, `代入检验：${a1}×${x} + ${b1}×${y} = ${c1}，${a2}×${x} + ${b2}×${y} = ${c2}，解为 x=${x}, y=${y}。`);
      } else if (type === 1) {
        // 加减消元
        const x = rnd(1, 6);
        const y = rnd(1, 6);
        const c1 = 2 * x + 3 * y;
        const c2 = 3 * x - 2 * y;
        o = opts(`${x},${y}`, () => `${y},${x}`, () => `${x + 1},${y}`, () => `${x},${y + 1}`);
        q = G("gen.system.2q", { v1: c1, v2: c2 }, `方程组 2x + 3y = ${c1} 与 3x − 2y = ${c2} 的解是？`);
        exp = G("gen.system.3e", { v1: x, v2: y }, `加减消元：×2 + ×3 消 y，得 x = ${x}，代入得 y = ${y}。`);
      } else {
        // 应用题
        const a = rnd(1, 5), b = rnd(1, 5);
        const total = a + b;
        o = opts(G("gen.system.o0", { v1: a }, `${a}个苹果`), () => G("gen.system.o1", { v1: b }, `${b}个苹果`), () => G("gen.system.o2", { v1: total }, `${total}个苹果`), () => G("gen.system.o3", { v1: Math.abs(a - b) }, `${Math.abs(a - b)}个苹果`));
        q = G("gen.system.4q", { v1: total, v2: a > b ? a - b : b - a }, `买苹果和梨共 ${total} 个，苹果比梨多 ${a > b ? a - b : b - a} 个，苹果有几个？`);
        exp = G("gen.system.5e", { v1: a > b ? a - b : b - a, v2: total, v3: a }, `设苹果 x 个：x + (x − ${a > b ? a - b : b - a}) = ${total}，解得 x = ${a}。`);
      }
      results.push(Q(q, o, type < 2 ? "基础" : "进阶", exp, G("gen.system.pt0", null, "二元一次方程组")));
    }
    return results;
  }

  /* ============================================================
   * 6. 线段与角（七年级）
   * ============================================================ */
  function qSegAngle(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 3;
      let q, ans, o, exp;
      if (type === 0) {
        // 中点计算
        const a = rnd(2, 10) * 2;
        const mid = a / 2;
        o = opts(mid, () => mid + 1, () => mid - 1, () => a);
        q = G("gen.segangle.0q", { v1: a }, `线段 AB = ${a}cm，M 是 AB 中点，AM = ？`);
        exp = G("gen.segangle.1e", { v1: a, v2: mid }, `中点分线段为两等份，AM = AB ÷ 2 = ${a} ÷ 2 = ${mid}cm。`);
      } else if (type === 1) {
        // 角的度数
        const angle = rnd(30, 150);
        const supplement = 180 - angle;
        o = opts(supplement, () => 180 - supplement, () => 90 - angle, () => angle);
        q = G("gen.segangle.2q", { v1: angle }, `一个角为 ${angle}°，它的补角是？`);
        exp = G("gen.segangle.3e", { v1: angle, v2: supplement }, `补角 = 180° − ${angle}° = ${supplement}°。`);
      } else {
        // 余角
        const angle = rnd(30, 60);
        const complement = 90 - angle;
        o = opts(complement, () => 90 - complement, () => 180 - angle, () => angle);
        q = G("gen.segangle.4q", { v1: angle }, `一个角为 ${angle}°，它的余角是？`);
        exp = G("gen.segangle.5e", { v1: angle, v2: complement }, `余角 = 90° − ${angle}° = ${complement}°。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.segangle.pt0", null, "线段与角")));
    }
    return results;
  }

  /* ============================================================
   * 7. 三角形性质（七年级）
   * ============================================================ */
  function qTriangle(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 3;
      let q, ans, o, exp;
      if (type === 0) {
        // 内角和
        const a = rnd(40, 80);
        const b = rnd(40, 80);
        const c = 180 - a - b;
        o = opts(c, () => a + b, () => 180 - a, () => 180 - b);
        q = G("gen.triangle.0q", { v1: a, v2: b }, `三角形两个角分别为 ${a}° 和 ${b}°，第三个角是？`);
        exp = G("gen.triangle.1e", { v1: a, v2: b, v3: c }, `三角形内角和 = 180°，第三角 = 180° − ${a}° − ${b}° = ${c}°。`);
      } else if (type === 1) {
        // 外角定理
        const a = rnd(40, 70);
        const b = rnd(40, 70);
        const exterior = a + b;
        o = opts(exterior, () => 180 - exterior, () => a - b, () => a + b + 10);
        q = G("gen.triangle.2q", { v1: a, v2: b }, `三角形两个内角为 ${a}° 和 ${b}°，不相邻外角是？`);
        exp = G("gen.triangle.3e", { v1: a, v2: b, v3: exterior }, `外角 = 两内角和 = ${a}° + ${b}° = ${exterior}°。`);
      } else {
        // 三边关系
        const a = rnd(3, 8);
        const b = rnd(3, 8);
        const c = rnd(Math.abs(a - b) + 1, a + b - 1);
        o = opts(G("gen.triangle.o0", null, "能构成"), () => G("gen.triangle.o1", null, "不能构成"), () => G("gen.triangle.o2", null, "无法判断"), () => G("gen.triangle.o3", null, "直角三角形"));
        q = G("gen.triangle.4q", { v1: a, v2: b, v3: c }, `三边长 ${a}, ${b}, ${c}，能否构成三角形？`);
        exp = G("gen.triangle.5e", { v1: a, v2: b, v3: c, v4: a, v5: c, v6: b, v7: b, v8: c, v9: a }, `${a} + ${b} > ${c}，${a} + ${c} > ${b}，${b} + ${c} > ${a}，能构成三角形。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.triangle.pt0", null, "三角形性质")));
    }
    return results;
  }

  /* ============================================================
   * 8. 全等三角形（八年级）
   * ============================================================ */
  function qCongruent(n) {
    const results = [];
    const K = 10;
    for (let i = 0; i < n; i++) {
      const type = i % K;
      let q, ans, o, exp;
      if (type === 0) {
        const a = rnd(3, 12), b = rnd(3, 12), x = rnd(20, 80);
        o = opts("SAS", () => "ASA", () => "SSS", () => "AAS");
        q = G("gen.congruent.uq0", { v1: a, v2: b, v3: x }, `已知 AB = DE = ${a}，AC = DF = ${b}，∠A = ∠D = ${x}°，判定 △ABC≌△DEF 的依据是？`);
        exp = G("gen.congruent.ue0", null, `两边及其夹角对应相等 → SAS（边角边）。`);
      } else if (type === 1) {
        const a = rnd(3, 12), x = rnd(20, 70), y = rnd(20, 70);
        o = opts("ASA", () => "SAS", () => "SSS", () => "AAS");
        q = G("gen.congruent.uq1", { v1: x, v2: a, v3: y }, `已知 ∠B = ∠E = ${x}°，BC = EF = ${a}，∠C = ∠F = ${y}°，依据是？`);
        exp = G("gen.congruent.ue1", null, `两角及其夹边对应相等 → ASA（角边角）。`);
      } else if (type === 2) {
        const a = rnd(3, 12), b = rnd(3, 12), c = rnd(3, 12);
        o = opts("SSS", () => "SAS", () => "ASA", () => "AAS");
        q = G("gen.congruent.uq2", { v1: a, v2: b, v3: c }, `已知 AB = DE = ${a}，BC = EF = ${b}，AC = DF = ${c}，依据是？`);
        exp = G("gen.congruent.ue2", null, `三边对应相等 → SSS（边边边）。`);
      } else if (type === 3) {
        const x = rnd(20, 70), y = rnd(20, 70), a = rnd(3, 12);
        o = opts("AAS", () => "ASA", () => "SAS", () => "SSS");
        q = G("gen.congruent.uq3", { v1: x, v2: y, v3: a }, `已知 ∠A = ∠D = ${x}°，∠B = ∠E = ${y}°，BC = EF = ${a}，依据是？`);
        exp = G("gen.congruent.ue3", null, `两角及一角的对边对应相等 → AAS（角角边）。`);
      } else if (type === 4) {
        const c = rnd(5, 15), a = rnd(3, 12), x = rnd(20, 70);
        o = opts("HL", () => "SAS", () => "SSS", () => "AAS");
        q = G("gen.congruent.uq4", { v1: c, v2: a }, `Rt△ABC 与 Rt△DEF 中，∠C = ∠F = 90°，斜边 AB = DE = ${c}，直角边 AC = DF = ${a}，依据是？`);
        exp = G("gen.congruent.ue4", null, `直角三角形斜边和一条直角边对应相等 → HL（斜边、直角边）。`);
      } else if (type === 5) {
        const a = rnd(3, 15), b = rnd(3, 15), c = rnd(3, 15);
        o = opts(b, () => a, () => c, () => a + c);
        q = G("gen.congruent.uq5", { v1: a, v2: b, v3: c }, `已知 △ABC≌△DEF，AB = ${a}，BC = ${b}，AC = ${c}（B↔E，C↔F），则 EF = ？`);
        exp = G("gen.congruent.ue5", { v1: b }, `全等三角形对应边相等，EF 对应 BC，故 EF = ${b}。`);
      } else if (type === 6) {
        const x = rnd(20, 80);
        o = opts(x, () => 180 - x, () => x + 10, () => 90 - x);
        q = G("gen.congruent.uq6", { v1: x }, `已知 △ABC≌△DEF，∠A = ${x}°（A↔D），则 ∠D = ？`);
        exp = G("gen.congruent.ue6", { v1: x }, `全等三角形对应角相等，∠D = ∠A = ${x}°。`);
      } else if (type === 7) {
        const p = rnd(12, 60);
        o = opts(p, () => p + 1, () => p - 1, () => p + 2);
        q = G("gen.congruent.uq7", { v1: p }, `已知 △ABC≌△DEF，△ABC 的周长为 ${p}，则 △DEF 的周长为？`);
        exp = G("gen.congruent.ue7", { v1: p }, `全等三角形周长相等，△DEF 周长 = ${p}。`);
      } else if (type === 8) {
        const s = rnd(6, 40);
        o = opts(s, () => s + 1, () => s - 1, () => s + 2);
        q = G("gen.congruent.uq8", { v1: s }, `已知 △ABC≌△DEF，△ABC 的面积为 ${s}，则 △DEF 的面积为？`);
        exp = G("gen.congruent.ue8", { v1: s }, `全等三角形面积相等，△DEF 面积 = ${s}。`);
      } else {
        const a = rnd(3, 12), b = rnd(3, 12);
        o = opts(G("gen.congruent.uo0", null, "能"), () => G("gen.congruent.uo1", null, "不能"), () => G("gen.congruent.uo2", null, "无法判断"), () => G("gen.congruent.uo3", null, "一定不全等"));
        q = G("gen.congruent.uq9", { v1: a, v2: b }, `若 △ABC 与 △DEF 满足 AB = DE = ${a}，AC = DF = ${b}，且夹角 ∠A = ∠D，则两三角形？`);
        exp = G("gen.congruent.ue9", null, `两边及夹角相等（SAS），两三角形全等，故“能”判定。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.congruent.upt0", null, "全等判定")));
    }
    return results;
  }

  /* ============================================================
   * 9. 相似三角形（八年级）
   * ============================================================ */
  function qSimilar(n) {
    const results = [];
    const K = 10;
    for (let i = 0; i < n; i++) {
      const type = i % K;
      let q, ans, o, exp;
      if (type === 0) {
        // 相似比计算
        const ratio = rnd(2, 6);
        const small = rnd(2, 6);
        const side1 = ratio * small, side2 = small;
        o = opts(`${ratio}:1`, () => `1:${ratio}`, () => `${ratio + 1}:1`, () => `${ratio}:${ratio + 1}`);
        q = G("gen.similar.uq0", { v1: side1, v2: side2 }, `两个相似三角形对应边分别为 ${side1}cm 和 ${side2}cm，相似比是？`);
        exp = G("gen.similar.ue0", { v1: side1, v2: side2, v3: ratio }, `相似比 = ${side1} : ${side2} = ${ratio} : 1。`);
      } else if (type === 1) {
        // 面积比
        const ratio = rnd(2, 5);
        o = opts(`${ratio * ratio}:1`, () => `${ratio}:1`, () => `1:${ratio * ratio}`, () => `1:1`);
        q = G("gen.similar.uq1", { v1: ratio }, `相似比为 ${ratio}:1 的两个三角形，面积比是？`);
        exp = G("gen.similar.ue1", { v1: ratio, v2: ratio * ratio }, `面积比 = 相似比的平方 = ${ratio}² : 1 = ${ratio * ratio} : 1。`);
      } else if (type === 2) {
        // 周长比 = 相似比
        const ratio = rnd(2, 5);
        o = opts(`${ratio}:1`, () => `1:${ratio}`, () => `${ratio * 2}:1`, () => `1:1`);
        q = G("gen.similar.uq2", { v1: ratio }, `两个相似三角形周长比为 ${ratio}:1，则相似比是？`);
        exp = G("gen.similar.ue2", { v1: ratio }, `相似三角形周长比等于相似比，故相似比 = ${ratio}:1。`);
      } else if (type === 3) {
        // 已知相似比与一边求对应边
        const k = rnd(2, 5), a = rnd(2, 9);
        const de = k * a;
        o = opts(de, () => a, () => a + k, () => de + 1);
        q = G("gen.similar.uq3", { v1: k, v2: a }, `△ABC∽△DEF，相似比为 ${k}:1（AB 对应 DE），若 AB = ${a}，则 DE = ？`);
        exp = G("gen.similar.ue3", { v1: k, v2: a, v3: de }, `DE = k × AB = ${k} × ${a} = ${de}。`);
      } else if (type === 4) {
        // 已知面积比求相似比
        const s = rnd(2, 6);
        o = opts(`${s}:1`, () => `${s * s}:1`, () => `1:${s}`, () => `${s + 1}:1`);
        q = G("gen.similar.uq4", { v1: s * s }, `两个相似三角形面积比为 ${s * s}:1，则相似比是？`);
        exp = G("gen.similar.ue4", { v1: s * s, v2: s }, `相似比 = √(面积比) = √(${s * s}) : 1 = ${s}:1。`);
      } else if (type === 5) {
        // 平行线分线段成比例
        const m = rnd(2, 6), nn = rnd(2, 6);
        o = opts(`${m}:${nn}`, () => `${nn}:${m}`, () => `${m + 1}:${nn}`, () => `1:1`);
        q = G("gen.similar.uq5", { v1: m, v2: nn }, `直线 l∥m，截得的线段 AD:DB = ${m}:${nn}，则 AE:EC = ？`);
        exp = G("gen.similar.ue5", { v1: m, v2: nn }, `平行线分线段成比例，AE:EC = AD:DB = ${m}:${nn}。`);
      } else if (type === 6) {
        // 对应边成比例求未知边
        const a = rnd(2, 9), r = rnd(2, 5);
        const b = a * r, c = rnd(2, 9), ef = c * r;
        o = opts(ef, () => c, () => c + r, () => ef + 1);
        q = G("gen.similar.uq6", { v1: a, v2: b, v3: c }, `△ABC∽△DEF，AB = ${a}，DE = ${b}，BC = ${c}，则 EF（对应 BC）= ？`);
        exp = G("gen.similar.ue6", { v1: b, v2: a, v3: r, v4: c, v5: r, v6: ef }, `对应边成比例：EF/BC = DE/AB = ${b}/${a} = ${r}，故 EF = ${c} × ${r} = ${ef}。`);
      } else if (type === 7) {
        // 影子比例（相似应用）
        const h1 = rnd(2, 9), s1 = rnd(2, 6), r = rnd(2, 4);
        const s2 = s1 * r, h2 = h1 * r;
        o = opts(h2, () => h1, () => h1 + r, () => h2 + 1);
        q = G("gen.similar.uq7", { v1: h1, v2: s1, v3: s2 }, `同一时刻，身高 ${h1}m 的杆影长 ${s1}m，另一杆影长 ${s2}m，则另一杆高 = ？`);
        exp = G("gen.similar.ue7", { v1: h1, v2: s2, v3: s1, v4: h1 * r, v5: h2 }, `物高与影长成正比：h₂ = h₁ × s₂/s₁ = ${h1} × ${s2}/${s1} = ${h1 * r} = ${h2}。`);
      } else if (type === 8) {
        // 对应角相等
        const x = rnd(20, 80);
        o = opts(x, () => 180 - x, () => x + 5, () => 90);
        q = G("gen.similar.uq8", { v1: x }, `△ABC∽△DEF，∠A = ${x}°（A↔D），则 ∠D = ？`);
        exp = G("gen.similar.ue8", { v1: x }, `相似三角形对应角相等，∠D = ∠A = ${x}°。`);
      } else {
        // 已知小周长求大周长
        const k = rnd(2, 5), p = rnd(10, 50);
        const big = k * p;
        o = opts(big, () => p, () => p + k, () => big + 1);
        q = G("gen.similar.uq9", { v1: k, v2: p }, `两个相似三角形相似比为 ${k}:1，小三角形周长 ${p}，则大三角形周长 = ？`);
        exp = G("gen.similar.ue9", { v1: k, v2: p, v3: big }, `周长比 = 相似比，大周长 = ${k} × ${p} = ${big}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.similar.pt0", null, "相似三角形")));
    }
    return results;
  }

  /* ============================================================
   * 10. 勾股定理（八年级）
   * ============================================================ */
  function qPyth(n) {
    const results = [];
    const K = 10;
    function triple() {
      const m = rnd(2, 9), nn = rnd(1, m - 1);
      const a = m * m - nn * nn, b = 2 * m * nn, c = m * m + nn * nn;
      return [a, b, c];
    }
    for (let i = 0; i < n; i++) {
      const type = i % K;
      let q, ans, o, exp;
      if (type === 0) {
        // 已知两直角边求斜边
        const [a, b, c] = triple();
        o = opts(c, () => a + b, () => Math.abs(a - b), () => a * b);
        q = G("gen.pyth.uq0", { v1: a, v2: b }, `直角三角形两直角边为 ${a} 和 ${b}，斜边为？`);
        exp = G("gen.pyth.ue0", { v1: a, v2: b, v3: a*a, v4: b*b, v5: a*a + b*b, v6: c }, `c² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${a*a + b*b}，c = ${c}。`);
      } else if (type === 1) {
        // 已知斜边和一直角边求另一直角边
        const [a, b, c] = triple();
        o = opts(b, () => c - a, () => c + a, () => a);
        q = G("gen.pyth.uq1", { v1: c, v2: a }, `直角三角形斜边 ${c}，一直角边 ${a}，另一直角边为？`);
        exp = G("gen.pyth.ue1", { v1: c*c, v2: a*a, v3: c*c - a*a, v4: b }, `b² = c² − a² = ${c*c} − ${a*a} = ${c*c - a*a}，b = ${b}。`);
      } else if (type === 2) {
        // 判断直角三角形
        const [a, b, c] = triple();
        o = opts(G("gen.pyth.uo0", null, "是直角三角形"), () => G("gen.pyth.uo1", null, "不是"), () => G("gen.pyth.uo2", null, "无法判断"), () => G("gen.pyth.uo3", null, "等边"));
        q = G("gen.pyth.uq2", { v1: a, v2: b, v3: c }, `三边长为 ${a}, ${b}, ${c}，这个三角形是？`);
        exp = G("gen.pyth.ue2", { v1: a, v2: b, v3: a*a + b*b, v4: c*c }, `${a}² + ${b}² = ${a*a + b*b} = ${c*c}，满足勾股定理，是直角三角形。`);
      } else if (type === 3) {
        // 斜边中线 = 斜边一半
        const c = rnd(4, 20);
        const mid = c / 2;
        o = opts(mid, () => c, () => mid + 1, () => c - 1);
        q = G("gen.pyth.uq3", { v1: c }, `直角三角形斜边为 ${c}，斜边上的中线长为？`);
        exp = G("gen.pyth.ue3", { v1: c, v2: mid }, `直角三角形斜边中线 = 斜边一半 = ${c} ÷ 2 = ${mid}。`);
      } else if (type === 4) {
        // 30° 所对直角边 = 斜边一半
        const c = rnd(4, 20);
        o = opts(c / 2, () => c, () => c / 2 + 1, () => c / 4);
        q = G("gen.pyth.uq4", { v1: c }, `直角三角形中，30° 角所对直角边 = 斜边 ÷ 2，若斜边为 ${c}，则 30° 所对直角边 = ？`);
        exp = G("gen.pyth.ue4", { v1: c, v2: c / 2 }, `30° 所对直角边 = 斜边 ÷ 2 = ${c} ÷ 2 = ${c / 2}。`);
      } else if (type === 5) {
        // 面积
        const [a, b, c] = triple();
        const area = a * b / 2;
        o = opts(area, () => a * b, () => (a + b) / 2, () => c);
        q = G("gen.pyth.uq5", { v1: a, v2: b }, `直角三角形两直角边 ${a}, ${b}，面积为？`);
        exp = G("gen.pyth.ue5", { v1: a, v2: b, v3: area }, `面积 = 两直角边乘积 ÷ 2 = ${a} × ${b} ÷ 2 = ${area}。`);
      } else if (type === 6) {
        // 周长
        const [a, b, c] = triple();
        const per = a + b + c;
        o = opts(per, () => a + b, () => per + 1, () => c + 1);
        q = G("gen.pyth.uq6", { v1: a, v2: b, v3: c }, `直角三角形三边长为 ${a}, ${b}, ${c}，周长为？`);
        exp = G("gen.pyth.ue6", { v1: a, v2: b, v3: c, v4: per }, `周长 = ${a} + ${b} + ${c} = ${per}。`);
      } else if (type === 7) {
        // 梯子问题
        const [a, b, c] = triple();
        o = opts(b, () => c - a, () => a, () => b + 1);
        q = G("gen.pyth.uq7", { v1: c, v2: a }, `一架长 ${c} 的梯子靠墙，底端距墙 ${a}，则墙高 = ？`);
        exp = G("gen.pyth.ue7", { v1: c*c, v2: a*a, v3: c*c - a*a, v4: b }, `墙高 = √(c² − a²) = √(${c*c} − ${a*a}) = √(${c*c - a*a}) = ${b}。`);
      } else if (type === 8) {
        // 坐标系距离
        const [a, b, c] = triple();
        o = opts(c, () => a, () => b, () => c + 1);
        q = G("gen.pyth.uq8", { v1: a, v2: b }, `平面直角坐标系中，点 O(0,0) 到点 P(${a},${b}) 的距离是？`);
        exp = G("gen.pyth.ue8", { v1: a*a, v2: b*b, v3: c*c, v4: c }, `距离 = √(a² + b²) = √(${a*a} + ${b*b}) = √(${c*c}) = ${c}。`);
      } else {
        // 斜边平方
        const [a, b, c] = triple();
        const c2 = a * a + b * b;
        o = opts(c2, () => a * a, () => b * b, () => (a + b) * (a + b));
        q = G("gen.pyth.uq9", { v1: a, v2: b }, `直角三角形两直角边 ${a}, ${b}，斜边的平方 c² = ？`);
        exp = G("gen.pyth.ue9", { v1: a, v2: b, v3: a*a, v4: b*b, v5: c2 }, `由勾股定理 c² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${c2}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.pyth.pt0", null, "勾股定理")));
    }
    return results;
  }

  /* ============================================================
   * 11. 四边形与平行四边形（八年级）
   * ============================================================ */
  function qQuad(n) {
    const results = [];
    const K = 11;
    for (let i = 0; i < n; i++) {
      const type = i % K;
      let q, ans, o, exp;
      if (type === 0) {
        // 平行四边形对边相等
        const a = rnd(3, 20);
        o = opts(a, () => a + 1, () => a - 1, () => a + 2);
        q = G("gen.quad.uq0", { v1: a }, `平行四边形 ABCD 中，AB = ${a}，则对边 CD = ？`);
        exp = G("gen.quad.ue0", { v1: a }, `平行四边形对边相等，CD = AB = ${a}。`);
      } else if (type === 1) {
        // 对角相等
        const x = rnd(30, 120);
        o = opts(x, () => 180 - x, () => x + 10, () => x - 10);
        q = G("gen.quad.uq1", { v1: x }, `平行四边形 ABCD 中，∠A = ${x}°，则对角 ∠C = ？`);
        exp = G("gen.quad.ue1", { v1: x }, `平行四边形对角相等，∠C = ∠A = ${x}°。`);
      } else if (type === 2) {
        // 邻角互补
        const x = rnd(30, 120);
        o = opts(180 - x, () => x, () => 180 - x + 10, () => 90 - x);
        q = G("gen.quad.uq2", { v1: x }, `平行四边形 ABCD 中，∠A = ${x}°，则邻角 ∠B = ？`);
        exp = G("gen.quad.ue2", { v1: x, v2: 180 - x }, `平行四边形邻角互补，∠B = 180° − ${x}° = ${180 - x}°。`);
      } else if (type === 3) {
        // 矩形对角线相等
        const d = rnd(5, 20);
        o = opts(d, () => d + 1, () => d - 1, () => d + 2);
        q = G("gen.quad.uq3", { v1: d }, `矩形 ABCD 中，对角线 AC = ${d}，则另一条对角线 BD = ？`);
        exp = G("gen.quad.ue3", { v1: d }, `矩形对角线相等，BD = AC = ${d}。`);
      } else if (type === 4) {
        // 矩形对角线平方
        const a = rnd(3, 15), b = rnd(3, 15);
        const sq = a * a + b * b;
        o = opts(sq, () => a * a, () => b * b, () => (a + b) * (a + b));
        q = G("gen.quad.uq4", { v1: a, v2: b }, `矩形长为 ${a}，宽为 ${b}，其对角线的平方 = ？`);
        exp = G("gen.quad.ue4", { v1: a, v2: b, v3: sq }, `对角线² = 长² + 宽² = ${a}² + ${b}² = ${sq}。`);
      } else if (type === 5) {
        // 菱形边长
        const pp = rnd(2, 12) * 4;
        const side = pp / 4;
        o = opts(side, () => pp, () => side + 1, () => side - 1);
        q = G("gen.quad.uq5", { v1: pp }, `菱形周长为 ${pp}，则边长 = ？`);
        exp = G("gen.quad.ue5", { v1: pp, v2: side }, `菱形四边相等，边长 = 周长 ÷ 4 = ${pp} ÷ 4 = ${side}。`);
      } else if (type === 6) {
        // 菱形面积（对角线）
        const d1 = rnd(2, 12), d2 = rnd(1, 6) * 2;
        const area = d1 * d2 / 2;
        o = opts(area, () => d1 * d2, () => d1 + d2, () => area + 1);
        q = G("gen.quad.uq6", { v1: d1, v2: d2 }, `菱形的两条对角线长分别为 ${d1} 和 ${d2}，面积为？`);
        exp = G("gen.quad.ue6", { v1: d1, v2: d2, v3: area }, `菱形面积 = 对角线乘积 ÷ 2 = ${d1} × ${d2} ÷ 2 = ${area}。`);
      } else if (type === 7) {
        // 正方形面积
        const s = rnd(2, 12);
        o = opts(s * s, () => s, () => s * 2, () => s * s + 1);
        q = G("gen.quad.uq7", { v1: s }, `正方形边长为 ${s}，面积为？`);
        exp = G("gen.quad.ue7", { v1: s, v2: s * s }, `正方形面积 = 边长² = ${s}² = ${s * s}。`);
      } else if (type === 8) {
        // 正方形对角线
        const s = rnd(2, 12);
        o = opts(`${s}√2`, () => `${s * 2}`, () => `${s}`, () => `${s}√3`);
        q = G("gen.quad.uq8", { v1: s }, `正方形边长为 ${s}，对角线长为？`);
        exp = G("gen.quad.ue8", { v1: s }, `正方形对角线 = 边长 × √2 = ${s}√2。`);
      } else if (type === 9) {
        // 梯形中位线
        const a = rnd(1, 9);
        const b = (a % 2 === 0) ? rnd(1, 9) * 2 : rnd(1, 9) * 2 - 1;
        const mid = (a + b) / 2;
        o = opts(mid, () => (a - b) / 2, () => a + b, () => mid + 1);
        q = G("gen.quad.uq9", { v1: a, v2: b }, `梯形上底 ${a}，下底 ${b}，中位线长 = ？`);
        exp = G("gen.quad.ue9", { v1: a, v2: b, v3: mid }, `梯形中位线 = (上底 + 下底) ÷ 2 = (${a} + ${b}) ÷ 2 = ${mid}。`);
      } else {
        // 平行四边形对角线互相平分
        const a = rnd(3, 15);
        o = opts(2 * a, () => a, () => 2 * a + 1, () => a + 1);
        q = G("gen.quad.uq10", { v1: a }, `平行四边形 ABCD 对角线交于 O，AO = ${a}，则 AC = ？`);
        exp = G("gen.quad.ue10", { v1: a, v2: 2 * a }, `平行四边形对角线互相平分，AC = 2 × AO = 2 × ${a} = ${2 * a}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.quad.pt0", null, "四边形性质")));
    }
    return results;
  }

  /* ============================================================
   * 12. 圆的性质（九年级）
   * ============================================================ */
  function qCircle(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 6;
      let q, ans, o, exp;
      if (type === 0) {
        // 圆周角定理
        const central = rnd(60, 120);
        const inscribed = central / 2;
        o = opts(`${inscribed}°`, () => `${central}°`, () => `${90 - inscribed}°`, () => `${180 - central}°`);
        q = G("gen.circ.0q", { v1: central }, `圆心角为 ${central}°，同弧所对的圆周角是？`);
        exp = G("gen.circ.1e", { v1: central, v2: inscribed }, `圆周角 = 圆心角 ÷ 2 = ${central}° ÷ 2 = ${inscribed}°。`);
      } else if (type === 1) {
        // 圆的周长
        const r = rnd(2, 10);
        o = opts(`2${r}π`, () => `${r}π`, () => `${r*r}π`, () => `${4*r}π`);
        q = G("gen.circ.2q", { v1: r }, `半径为 ${r} 的圆，周长为？`);
        exp = G("gen.circ.3e", { v1: r, v2: r }, `周长 C = 2πr = 2 × π × ${r} = 2${r}π。`);
      } else if (type === 2) {
        // 圆的面积
        const r = rnd(2, 10);
        o = opts(`${r*r}π`, () => `2${r}π`, () => `${r}π`, () => `${4*r}π`);
        q = G("gen.circ.uq0", { v1: r }, `半径为 ${r} 的圆，面积为？`);
        exp = G("gen.circ.ue0", { v1: r, v2: r*r }, `面积 S = πr² = π × ${r}² = ${r*r}π。`);
      } else if (type === 4) {
        // 弧长
        const r = rnd(2, 10), deg = rnd(2, 12) * 10;
        const arc = (deg / 360) * 2 * r;
        o = opts(arc, () => arc + 1, () => arc - 1, () => 2 * r);
        q = G("gen.circ.uq1", { v1: r, v2: deg }, `半径为 ${r}、圆心角为 ${deg}° 的弧长（保留 π 前系数，即 ___π）是？`);
        exp = G("gen.circ.ue1", { v1: deg, v2: deg / 360, v3: r, v4: arc }, `弧长 = (${deg}°/360°) × 2πr = ${deg / 360} × 2 × ${r}π = ${arc}π。`);
      } else if (type === 5) {
        // 扇形面积
        const r = rnd(2, 10), deg = rnd(2, 12) * 10;
        const sa = (deg / 360) * r * r;
        o = opts(sa, () => sa + 1, () => sa - 1, () => r * r);
        q = G("gen.circ.uq2", { v1: r, v2: deg }, `半径为 ${r}、圆心角为 ${deg}° 的扇形面积（保留 π 前系数，即 ___π）是？`);
        exp = G("gen.circ.ue2", { v1: deg, v2: deg / 360, v3: r, v4: sa }, `扇形面积 = (${deg}°/360°) × πr² = ${deg / 360} × ${r}²π = ${sa}π。`);
      } else {
        // 弦与直径
        o = opts(G("gen.circ.o0", null, "直径"), () => G("gen.circ.o1", null, "弦"), () => G("gen.circ.o2", null, "切线"), () => G("gen.circ.o3", null, "弧"));
        q = G("gen.circ.6q", null, `圆中最长的弦是？`);
        exp = G("gen.circ.7e", null, `直径是经过圆心的弦，是圆中最长的弦。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.circ.pt0", null, "圆的性质")));
    }
    return results;
  }

  /* ============================================================
   * 13. 一次函数（八年级）
   * ============================================================ */
  function qFunc1(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 4;
      let q, ans, o, exp;
      if (type === 0) {
        // 斜率计算
        const x1 = rnd(0, 5);
        const y1 = rnd(0, 5);
        const x2 = x1 + rnd(1, 5);
        const y2 = y1 + rnd(1, 5);
        const slope = (y2 - y1) / (x2 - x1);
        // (y1−y2)/(x1−x2) 与斜率恒等，等于把正确答案又当成了干扰项；换成「分子分母写反」
        o = opts(slope, () => slope + 1, () => slope - 1, () => (x2 - x1) / (y2 - y1));
        q = G("gen.func1.0q", { v1: x1, v2: y1, v3: x2, v4: y2 }, `点 (${x1},${y1}) 和 (${x2},${y2}) 连线的斜率是？`);
        exp = G("gen.func1.1e", { v1: y2, v2: y1, v3: x2, v4: x1, v5: slope }, `斜率 k = (y₂−y₁)/(x₂−x₁) = (${y2}−${y1})/(${x2}−${x1}) = ${slope}。`);
      } else if (type === 1) {
        // 截距
        const k = rnd(1, 3);
        const b = rnd(-5, 5);
        o = opts(b, () => k, () => 0, () => -b);
        q = G("gen.func1.2q", { v1: k, v2: b }, `一次函数 y = ${k}x + ${b}，y 轴截距是？`);
        exp = G("gen.func1.3e", { v1: b }, `y 轴截距是 x=0 时的 y 值，即 b = ${b}。`);
      } else if (type === 2) {
        // 函数值
        const k = rnd(1, 3);
        const b = rnd(1, 5);
        const x = rnd(1, 5);
        const y = k * x + b;
        o = opts(y, () => k + b, () => x * b, () => k * b);
        q = G("gen.func1.4q", { v1: k, v2: b, v3: x }, `一次函数 y = ${k}x + ${b}，当 x = ${x} 时，y = ？`);
        exp = G("gen.func1.p0e", { v1: k, v2: x, v3: b, v4: y }, `y = ${k}×${x} + ${b} = ${y}。`);
      } else {
        // 图像性质
        const k = rnd(1, 3);
        o = opts(G("gen.func1.o0", null, "上升"), () => G("gen.func1.o1", null, "下降"), () => G("gen.func1.o2", null, "水平"), () => G("gen.func1.o3", null, "垂直"));
        q = G("gen.func1.5q", { v1: k }, `一次函数 y = ${k}x + 1，图像从左到右？`);
        exp = G("gen.func1.6e", { v1: k }, `k = ${k} > 0，图像从左向右上升。`);
      }
      results.push(Q(q, o, type < 3 ? "基础" : "进阶", exp, G("gen.func1.pt0", null, "一次函数")));
    }
    return results;
  }

  /* ============================================================
   * 14. 反比例函数（八年级）
   * ============================================================ */
  function qInverse(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 3;
      let q, ans, o, exp;
      if (type === 0) {
        // 求 k 值
        const k = rnd(2, 12);
        const x = rnd(1, 5);
        const y = k / x;
        o = opts(k, () => k * 2, () => k / 2, () => x + y);
        q = G("gen.inverse.0q", { v1: x, v2: y }, `反比例函数 y = k/x 经过点 (${x},${y})，k 的值为？`);
        exp = G("gen.inverse.p0e", { v1: x, v2: y, v3: k }, `k = x × y = ${x} × ${y} = ${k}。`);
      } else if (type === 1) {
        // 图像位置
        const k = rnd(1, 5);
        o = opts(G("gen.inverse.o0", null, "一、三象限"), () => G("gen.inverse.o1", null, "二、四象限"), () => G("gen.inverse.o2", null, "一、二象限"), () => G("gen.inverse.o3", null, "三、四象限"));
        q = G("gen.inverse.1q", { v1: k }, `反比例函数 y = ${k}/x，图像在？`);
        exp = G("gen.inverse.2e", { v1: k }, `k = ${k} > 0，图像在第一、三象限。`);
      } else {
        // 函数值
        const k = rnd(2, 10);
        const x = rnd(1, 5);
        const y = k / x;
        o = opts(y, () => k + x, () => k - x, () => x / k);
        q = G("gen.inverse.3q", { v1: k, v2: x }, `反比例函数 y = ${k}/x，当 x = ${x} 时，y = ？`);
        exp = G("gen.inverse.p1e", { v1: k, v2: x, v3: y }, `y = ${k} ÷ ${x} = ${y}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.inverse.pt0", null, "反比例函数")));
    }
    return results;
  }

  /* ============================================================
   * 15. 二次函数（九年级）
   * ============================================================ */
  function qQuadfunc(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
      const type = i % 5;
      let q, ans, o, exp;
      if (type === 0) {
        // 顶点坐标
        const h = rnd(-3, 3);
        const k = rnd(-3, 3);
        o = opts(`(${h},${k})`, () => `(${-h},${k})`, () => `(${h},${-k})`, () => `(${-h},${-k})`);
        q = G("gen.quadfunc.0q", { v1: h, v2: k }, `二次函数 y = (x − ${h})² + ${k} 的顶点坐标是？`);
        exp = G("gen.quadfunc.1e", { v1: h, v2: k }, `顶点式为 y = a(x−h)² + k，顶点为 (${h},${k})。`);
      } else if (type === 1) {
        // 开口方向
        const a = rnd(1, 5) * (Math.random() < 0.5 ? 1 : -1);
        o = opts(a > 0 ? G("gen.quadfunc.o0", null, "开口向上") : G("gen.quadfunc.o1", null, "开口向下"), () => a > 0 ? G("gen.quadfunc.o2", null, "开口向下") : G("gen.quadfunc.o3", null, "开口向上"), () => G("gen.quadfunc.o4", null, "无法判断"), () => G("gen.quadfunc.o5", null, "开口水平"));
        q = G("gen.quadfunc.2q", { v1: a }, `二次函数 y = ${a}x² + 2x + 1，开口方向？`);
        exp = G("gen.quadfunc.3e", { v1: a, v2: a > 0 ? ">" : "<", v3: a > 0 ? "向上" : "向下" }, `a = ${a} ${a > 0 ? ">" : "<"} 0，开口${a > 0 ? "向上" : "向下"}。`);
      } else if (type === 2) {
        // 对称轴
        const h = rnd(-3, 3);
        o = opts(`x = ${h}`, () => `x = ${-h}`, () => `y = ${h}`, () => `y = ${-h}`);
        q = G("gen.quadfunc.4q", { v1: h > 0 ? -h : h }, `二次函数 y = (x + ${h > 0 ? -h : h})² 的对称轴是？`);
        exp = G("gen.quadfunc.5e", { v1: h }, `对称轴为 x = ${h}。`);
      } else if (type === 3) {
        // 与 y 轴交点
        const c = rnd(-5, 5);
        o = opts(`(0,${c})`, () => `(${c},0)`, () => `(0,0)`, () => `(1,${c})`);
        q = G("gen.quadfunc.6q", { v1: c }, `二次函数 y = x² + 2x + ${c}，与 y 轴交点是？`);
        exp = G("gen.quadfunc.7e", { v1: c, v2: c }, `令 x = 0，y = ${c}，交点为 (0, ${c})。`);
      } else {
        // 最值
        const a = -Math.abs(rnd(1, 3));
        const k = rnd(1, 5);
        o = opts(G("gen.quadfunc.o6", { v1: k }, `最大值 ${k}`), () => G("gen.quadfunc.o7", { v1: k }, `最小值 ${k}`), () => G("gen.quadfunc.o8", { v1: -k }, `最大值 ${-k}`), () => G("gen.quadfunc.o9", null, `无最值`));
        q = G("gen.quadfunc.8q", { v1: a, v2: k + 1 }, `二次函数 y = ${a}x² + 2x + ${k + 1}，有最值吗？`);
        exp = G("gen.quadfunc.9e", { v1: a, v2: k }, `a = ${a} < 0，开口向下，有最大值 ${k}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.quadfunc.pt0", null, "二次函数")));
    }
    return results;
  }

  /* ============================================================
   * 16. 工程问题（设总量为 1，覆盖小学同名方法以实现题目多样化）
   * ============================================================ */
  function qEngineer(n) {
    const results = [];
    const K = 11;
    const PAIRS = [[6,3],[3,6],[4,4],[12,4],[4,12],[6,6],[8,8],[9,6],[6,9],[12,6],[6,12],[10,15],[15,10],[8,12],[12,8],[5,10],[10,5]];
    for (let i = 0; i < n; i++) {
      const type = i % K;
      let q, ans, o, exp;
      if (type === 0) {
        // 两人合作
        const pr = pick(PAIRS); const a = pr[0], b = pr[1];
        const coop = a * b / (a + b);
        o = opts(coop, () => coop + 1, () => coop - 1, () => Math.max(a, b));
        q = G("gen.engineer.uq0", { v1: a, v2: b }, `一项工程，甲单独做需 ${a} 天，乙单独做需 ${b} 天。两人合作需几天完成？`);
        exp = G("gen.engineer.ue0", { v1: a, v2: b, v3: a, v4: b, v5: a*b, v6: a*b, v7: a, v8: b, v9: coop }, `合作效率 = 1/${a} + 1/${b} = (${a}+${b})/${a*b}，时间 = ${a*b}/(${a}+${b}) = ${coop} 天。`);
      } else if (type === 1) {
        // 反求乙
        const pr = pick(PAIRS); const a = pr[0], b = pr[1];
        const coop = a * b / (a + b);
        o = opts(b, () => b + 1, () => b - 1, () => a);
        q = G("gen.engineer.uq1", { v1: a, v2: coop }, `一项工程，甲单独做需 ${a} 天，甲乙合作需 ${coop} 天。乙单独做需几天？`);
        exp = G("gen.engineer.ue1", { v1: coop, v2: a, v3: a, v4: coop, v5: a*coop, v6: a*coop, v7: a, v8: coop, v9: b }, `1/乙 = 1/${coop} − 1/${a} = (${a} − ${coop})/(${a*coop})，乙 = ${a*coop}/(${a}−${coop}) = ${b} 天。`);
      } else if (type === 2) {
        // 合作比甲单独少用
        const pr = pick(PAIRS); const a = pr[0], b = pr[1];
        const coop = a * b / (a + b);
        const save = a - coop;
        o = opts(save, () => save + 1, () => save - 1, () => coop);
        q = G("gen.engineer.uq2", { v1: a, v2: coop }, `甲单独做 ${a} 天，两人合作 ${coop} 天。合作比甲单独少用几天？`);
        exp = G("gen.engineer.ue2", { v1: a, v2: coop, v3: save }, `少用 = ${a} − ${coop} = ${save} 天。`);
      } else if (type === 3) {
        // 三人合作（家族 [2k,3k,6k]）
        const k = rnd(1, 4);
        const a = 2 * k, b = 3 * k, c = 6 * k;
        o = opts(k, () => k + 1, () => k - 1, () => a);
        q = G("gen.engineer.uq3", { v1: a, v2: b, v3: c }, `一项工程，甲、乙、丙单独做分别需 ${a}、${b}、${c} 天。三人合作需几天？`);
        exp = G("gen.engineer.ue3", { v1: a, v2: b, v3: c, v4: k, v5: k }, `效率和 = 1/${a} + 1/${b} + 1/${c} = 1/${k}，合作需 ${k} 天。`);
      } else if (type === 4) {
        // 三人合作（家族 [2k,4k,4k]）
        const k = rnd(1, 4);
        const a = 2 * k, b = 4 * k, c = 4 * k;
        o = opts(k, () => k + 1, () => k - 1, () => b);
        q = G("gen.engineer.uq4", { v1: a, v2: b, v3: c }, `甲、乙、丙单独做分别需 ${a}、${b}、${c} 天。三人合作需几天？`);
        exp = G("gen.engineer.ue4", { v1: a, v2: b, v3: c, v4: k, v5: k }, `效率和 = 1/${a} + 1/${b} + 1/${c} = 1/${k}，合作需 ${k} 天。`);
      } else if (type === 5) {
        // 效率比求甲单独
        const p = rnd(1, 4), e = rnd(1, 4), t = p * rnd(1, 4);
        const aloneA = t * (p + e) / p;
        o = opts(aloneA, () => aloneA + 1, () => aloneA - 1, () => t);
        q = G("gen.engineer.uq5", { v1: p, v2: e, v3: t }, `甲、乙效率比为 ${p}:${e}，合作 ${t} 天完成。甲单独做需几天？`);
        exp = G("gen.engineer.ue5", { v1: t, v2: p+e, v3: p, v4: aloneA }, `甲效占总效 p/(p+q)，甲单独 = t × (p+q)/p = ${t} × ${p+e}/${p} = ${aloneA} 天。`);
      } else if (type === 6) {
        // 效率比求乙单独
        const p = rnd(1, 4), e = rnd(1, 4), t = e * rnd(1, 4);
        const aloneB = t * (p + e) / e;
        o = opts(aloneB, () => aloneB + 1, () => aloneB - 1, () => t);
        q = G("gen.engineer.uq6", { v1: p, v2: e, v3: t }, `甲、乙效率比为 ${p}:${e}，合作 ${t} 天完成。乙单独做需几天？`);
        exp = G("gen.engineer.ue6", { v1: t, v2: p+e, v3: e, v4: aloneB }, `乙单独 = t × (p+q)/q = ${t} × ${p+e}/${e} = ${aloneB} 天。`);
      } else if (type === 7) {
        // 合作时甲完成比例
        const pr = pick(PAIRS); const a = pr[0], b = pr[1];
        o = opts(`${b}/(${a}+${b})`, () => `${a}/(${a}+${b})`, () => `1/${a}`, () => `1/${b}`);
        q = G("gen.engineer.uq7", { v1: a, v2: b }, `甲单独 ${a} 天、乙单独 ${b} 天，合作完成时甲完成了总工程的几分之几？`);
        exp = G("gen.engineer.ue7", { v1: a, v2: a, v3: b, v4: b, v5: a, v6: b }, `甲完成比例 = 甲效/总效 = (1/${a})/(1/${a}+1/${b}) = ${b}/(${a}+${b})。`);
      } else if (type === 8) {
        // 每天合做量
        const x = rnd(2, 9), y = rnd(2, 9);
        o = opts(x + y, () => x, () => y, () => x * y);
        q = G("gen.engineer.uq8", { v1: x, v2: y }, `甲每天做 ${x} 个零件，乙每天做 ${y} 个。两人合作每天共做几个？`);
        exp = G("gen.engineer.ue8", { v1: x, v2: y, v3: x + y }, `合作每天 = 甲 + 乙 = ${x} + ${y} = ${x + y} 个。`);
      } else if (type === 9) {
        // 合作天数（设总量）
        const x = rnd(2, 9), y = rnd(2, 9), per = x + y;
        const total = per * rnd(2, 6);
        const days = total / per;
        o = opts(days, () => days + 1, () => days - 1, () => total);
        q = G("gen.engineer.uq9", { v1: x, v2: y, v3: total }, `甲每天做 ${x} 个、乙每天做 ${y} 个，共需完成 ${total} 个。两人合作需几天？`);
        exp = G("gen.engineer.ue9", { v1: per, v2: total, v3: per, v4: days }, `合作每天 ${per} 个，需 ${total} ÷ ${per} = ${days} 天。`);
      } else {
        // 甲先做余下合作
        const x = rnd(2, 9), y = rnd(2, 9), per = x + y;
        const m = rnd(1, 4);
        const total = m * x + per * rnd(1, 5);
        const remain = total - m * x;
        const days = remain / per;
        o = opts(days, () => days + 1, () => days - 1, () => m);
        q = G("gen.engineer.uq10", { v1: x, v2: y, v3: m, v4: total }, `甲每天做 ${x} 个、乙每天做 ${y} 个。甲先做 ${m} 天，余下两人合作，还需几天完成共 ${total} 个的任务？`);
        exp = G("gen.engineer.ue10", { v1: m*x, v2: remain, v3: per, v4: remain, v5: per, v6: days }, `甲先做 ${m*x} 个，余 ${remain} 个；合作每天 ${per} 个，需 ${remain} ÷ ${per} = ${days} 天。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.engineer.upt0", null, "工程问题")));
    }
    return results;
  }

  /* ============================================================
   * 17. 周期问题（覆盖小学同名方法以实现题目多样化）
   * ============================================================ */
  function qCycle(n) {
    const results = [];
    const K = 10;
    // 词表改从 i18n 取，长度与下标不变，英文模式下自动出英文
    const WEEK = V("week").slice(1).concat(V("week")[0]);   // 原数组是「一…六,日」
    const BEASTS = V("beast");
    for (let i = 0; i < n; i++) {
      const type = i % K;
      let q, ans, o, exp;
      if (type === 0) {
        // 字母珠子
        const T = rnd(2, 6);
        const letters = "ABCDEF".slice(0, T).split("");
        const nn = rnd(T + 3, T + 20);
        const rem = nn % T, pos = rem === 0 ? T : rem;
        const ansSym = letters[pos - 1];
        o = { opts: shuffle(letters.slice()), ans: letters.indexOf(ansSym) };
        q = G("gen.cycle.uq0", { v1: letters.join(""), v2: nn }, `一串珠子按 ${letters.join("")} 的顺序不断重复排列。第 ${nn} 个珠子是什么？`);
        exp = G("gen.cycle.ue0", { v1: T, v2: nn, v3: T, v4: Math.floor(nn/T), v5: pos, v6: pos, v7: ansSym }, `周期长 ${T}，${nn} ÷ ${T} = ${Math.floor(nn/T)} …… ${pos}，余数定位第 ${pos} 个 = ${ansSym}。`);
      } else if (type === 1) {
        // 数字循环 1..T
        const T = rnd(2, 9);
        const nn = rnd(T + 2, T + 30);
        const val = ((nn - 1) % T) + 1;
        o = opts(val, () => val + 1, () => val - 1, () => T + 1);
        q = G("gen.cycle.uq1", { v1: T, v2: nn }, `数列 1, 2, …, ${T} 依次不断重复，第 ${nn} 项是？`);
        exp = G("gen.cycle.ue1", { v1: T, v2: nn, v3: nn, v4: T, v5: val }, `周期长 ${T}，第 ${nn} 项 = (( ${nn} − 1 ) mod ${T}) + 1 = ${val}。`);
      } else if (type === 2) {
        // 星期循环
        const d = rnd(0, 6);
        const nn = rnd(1, 30);
        const idx = (d + nn) % 7;
        const ansW = WEEK[idx];
        o = opts(ansW, () => WEEK[(idx+1)%7], () => WEEK[(idx+2)%7], () => WEEK[(idx+3)%7]);
        q = G("gen.cycle.uq2", { v1: WEEK[d], v2: nn }, `今天是星期${WEEK[d]}，过 ${nn} 天后是星期几？`);
        exp = G("gen.cycle.ue2", { v1: nn, v2: nn%7, v3: WEEK[d], v4: nn%7, v5: ansW }, `7 天一循环，${nn} mod 7 = ${nn%7}，星期${WEEK[d]} 往后推 ${nn%7} 天 = 星期${ansW}。`);
      } else if (type === 3) {
        // 季度
        const nn = rnd(1, 12);
        const qd = Math.ceil(nn / 3);
        o = opts(qd, () => qd + 1, () => qd - 1, () => 4);
        q = G("gen.cycle.uq3", { v1: nn }, `一年分四季度，第 ${nn} 个月属于第几季度？`);
        exp = G("gen.cycle.ue3", { v1: nn, v2: qd }, `季度 = ⌈${nn} ÷ 3⌉ = ${qd}。`);
      } else if (type === 4) {
        // 四色彩灯
        const colors = V("color");
        const T = 4;
        const nn = rnd(T + 3, T + 25);
        const val = (nn - 1) % T;
        const ansC = colors[val];
        o = opts(ansC, () => colors[(val+1)%4], () => colors[(val+2)%4], () => colors[(val+3)%4]);
        q = G("gen.cycle.uq4", { v1: nn }, `彩灯按 红、黄、蓝、绿 循环闪烁，第 ${nn} 盏是什么颜色？`);
        exp = G("gen.cycle.ue4", { v1: nn, v2: val+1, v3: ansC }, `4 色一循环，第 ${nn} 盏 = 第 ${val+1} 个 = ${ansC}。`);
      } else if (type === 5) {
        // 奇偶交替
        const nn = rnd(1, 30);
        // 正确答案必须与干扰项同源，否则英文模式下它是唯一的中文项
        const parity = nn % 2 === 1 ? G("gen.cycle.uo0", null, "奇数") : G("gen.cycle.uo1", null, "偶数");
        o = opts(parity, () => parity === G("gen.cycle.uo0", null, "奇数") ? G("gen.cycle.uo1", null, "偶数") : G("gen.cycle.uo2", null, "奇数"), () => G("gen.cycle.uo3", null, "质数"), () => G("gen.cycle.uo4", null, "合数"));
        q = G("gen.cycle.uq5", { v1: nn }, `数列 奇、偶、奇、偶…… 交替排列，第 ${nn} 项是奇数还是偶数？`);
        exp = G("gen.cycle.ue5", { v1: nn, v2: nn, v3: nn%2===1?"奇":"偶", v4: parity }, `第 ${nn} 项：${nn} 为${nn%2===1?"奇":"偶"}数，故是${parity}。`);
      } else if (type === 6) {
        // 偶数序列 2..2T
        const T = rnd(2, 5);
        const nn = rnd(T + 2, T + 25);
        const val = ((nn - 1) % T) + 1;
        const v = 2 * val;
        o = opts(v, () => v + 2, () => v - 2, () => v + 1);
        q = G("gen.cycle.uq6", { v1: 2*T, v2: nn }, `数列 2, 4, …, ${2*T} 依次不断重复，第 ${nn} 项是？`);
        exp = G("gen.cycle.ue6", { v1: T, v2: val, v3: v }, `周期长 ${T}，周期内第 ${val} 项 = ${v}。`);
      } else if (type === 7) {
        // 图案 □○△
        const syms = ["□","○","△"];
        const T = 3;
        const nn = rnd(T + 2, T + 20);
        const val = (nn - 1) % T;
        const ansS = syms[val];
        o = opts(ansS, () => syms[(val+1)%3], () => syms[(val+2)%3], () => "☆");
        q = G("gen.cycle.uq7", { v1: nn }, `图案按 □、○、△ 不断重复，第 ${nn} 个图案是？`);
        exp = G("gen.cycle.ue7", { v1: nn, v2: val+1, v3: ansS }, `3 个一循环，第 ${nn} 个 = 第 ${val+1} 个 = ${ansS}。`);
      } else if (type === 8) {
        // 生肖循环
        const base = rnd(0, 11);
        const nn = rnd(1, 24);
        const idx = (base + nn) % 12;
        const ansB = BEASTS[idx];
        o = opts(ansB, () => BEASTS[(idx+1)%12], () => BEASTS[(idx+2)%12], () => BEASTS[(idx+3)%12]);
        q = G("gen.cycle.uq8", { v1: BEASTS[base], v2: nn }, `生肖按 鼠、牛、虎、兔、龙、蛇、马、羊、猴、鸡、狗、猪 循环。若今年为${BEASTS[base]}，则 ${nn} 年后生肖是？`);
        exp = G("gen.cycle.ue8", { v1: nn, v2: nn%12, v3: BEASTS[base], v4: nn%12, v5: ansB }, `12 年一循环，${nn} mod 12 = ${nn%12}，${BEASTS[base]} 往后 ${nn%12} 年 = ${ansB}。`);
      } else {
        // 连续奇数序列
        const T = rnd(2, 6);
        const nn = rnd(T + 2, T + 20);
        const val = ((nn - 1) % T) + 1;
        const v = 2 * val + 1;   // 题面数列从 3 起：3,5,…,2T+1，故第 val 个奇数是 2val+1
        o = opts(v, () => v + 2, () => v - 2, () => v + 1);
        q = G("gen.cycle.uq9", { v1: 2*T+1, v2: nn }, `数列 3, 5, 7, …, ${2*T+1}（连续奇数）依次不断重复，第 ${nn} 项是？`);
        exp = G("gen.cycle.ue9", { v1: T, v2: nn, v3: val, v4: v }, `周期长 ${T}，第 ${nn} 项对应第 ${val} 个奇数 = ${v}。`);
      }
      results.push(Q(q, o, "基础", exp, G("gen.cycle.upt0", null, "周期问题")));
    }
    return results;
  }

  /* ============================================================
   * 注册到 window.TECHNIQUES
   * ============================================================ */
  const GEN = {
    rational: qRational,
    integral: qIntegral,
    linear1: qLinear,
    inequal: qInequal,
    system: qSystem,
    segangle: qSegAngle,
    triangle: qTriangle,
    congruent: qCongruent,
    similar: qSimilar,
    pyth: qPyth,
    quad: qQuad,
    circ: qCircle,
    func1: qFunc1,
    inverse: qInverse,
    quadfunc: qQuadfunc,
    engineer: qEngineer,
    cycle: qCycle
  };

  if (window.TECHNIQUES) {
    window.TECHNIQUES.forEach(t => {
      if (GEN[t.id]) t.qgen = GEN[t.id];
    });
  }
  window.QGEN_JUNIOR_READY = true;
})();
