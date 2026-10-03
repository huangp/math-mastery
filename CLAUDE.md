# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目

「融会贯通」中小学数学方法练习应用：纯前端、零构建、零外链、可离线运行。所有 UI 文案与代码注释均为中文，新增内容请保持中文。

## 常用命令

```bash
python -m http.server 8142        # 本地预览 → http://127.0.0.1:8142/
python verify.py                  # Playwright 截图 QA，输出到 shots/（PORT=9000 换端口）
LANG_UI=en python verify.py       # 英文版截图，输出到 shots-en/
start-lan-server.bat              # Windows：0.0.0.0 起服务并打印局域网地址

node tools/i18n_audit.js          # zh/en 目录对齐、源码引用的键是否存在
node tools/i18n_content_check.js  # 技巧文案与静态题的译文覆盖率、选项是否被译重
NODE_PATH=<jsdom> node tools/gen_check.js 40   # 出题引擎：两种语言同随机序列跑，查回归
NODE_PATH=<jsdom> node tools/zh_snapshot.js --diff base.json  # 中文出题逐字不变（先不带参数跑一次存基线）
NODE_PATH=<jsdom> node tools/e2e_check.js      # 348 条路由 × 2 语言，扫残留中文
NODE_PATH=<jsdom> node tools/profile_check.js  # 学员档案：迁移 / 隔离 / 删除 / 自愈
NODE_PATH=<jsdom> node tools/portability_check.js # 进度导出/导入：往返、非破坏、拒绝非法文件
```

标了 `NODE_PATH=<jsdom>` 的四个脚本需要 jsdom（仓库本身零依赖，按需
`npm i jsdom` 到任意目录后用 `NODE_PATH` 指过去即可）；前两个纯 node，无依赖。

`verify.py` 自带临时静态服务器，逐个路由截图并收集 console 报错，末尾打印 `CONSOLE_ISSUES: n`——改完 JS 后跑它是唯一的自动化验证手段（依赖 `pip install playwright && playwright install chromium`）。没有测试框架、lint、构建步骤。

## 架构

`index.html` 按固定顺序加载脚本，**顺序即依赖**，不可打乱：

```
i18n/zh.js → i18n/en*.js → i18n.js → data.js → animations.js → figures.js
  → qgen.js → qgen_junior.js → qgen_high.js → related-projects.js → app.js
```

i18n 必须最先加载：其余文件在**求值时**就会调用 `window.G` / `window.tx`。

模块之间只通过 `window` 全局对象拼装，没有模块系统：

| 全局 | 定义于 | 内容 |
|---|---|---|
| `window.TECHNIQUES` | data.js | 114 个技巧对象数组，全站唯一数据源 |
| `window.Anim` | animations.js | 动画名 → `fn(containerEl)`，自行渲染 SVG 与控件 |
| `window.Fig` / `window.QFIG_MAP` | figures.js | 配图名 → `fn(params)` 返回 SVG 字符串；`QFIG_MAP` 把 `"技巧id::题号"` 映射到配图 spec |
| `t.qgen` | qgen*.js | 三个引擎按 `t.id` 把生成器挂到 `TECHNIQUES` 元素上 |
| `window.RELATED_PROJECTS` | related-projects.js | 「相关项目」页数据 |
| `window.I18N` / `t` / `tx` / `G` | i18n.js | 取译文；语言切换后 `onChange` 触发重绘 |

`app.js` 是唯一消费方：hash 路由（`#/path`、`#/grade/:年级`、`#/learn/:id`、`#/practice/:id`、`#/gate/:id`、`#/review`、`#/progress`、`#/resources`）+ 渲染 + 进度状态。

## i18n（中英双语，中文是回退语言）

`window.I18N` 提供三个取文案的函数，**用途不同，不要混用**：

| 函数 | 用在哪 | 缺键时 |
|---|---|---|
| `t(key, vars)` | 界面文案（app.js 用别名 `T`；`t` 在 app.js 里已被技巧对象占用） | 回退中文目录，再回退 key 本身 |
| `tx(key, 中文原文, vars)` | 内容型文案：技巧名/摘要/口诀/步骤、静态题 | 回退传入的中文原文 |
| `G(key, vars, 中文原文)` | 出题引擎、配图、动画 | 中文模式直接返回原文；其余语言查目录 |

`tx` 与 `G` 的中文原文都留在原文件里，**中文目录里没有这些键**——这样中文只有一份，
不会两处漂移，中文模式的输出也与改造前逐字一致。

目录文件：`js/i18n/zh.js`（仅界面）、`js/i18n/en*.js`（按 ui / tech / q / gen / fig / res 分文件，
都用 `Object.assign(window.I18N_EN, {...})` 合并）。目录值可以是带 `{var}` 占位符的字符串，
也可以是 `(vars) => string` 函数——序数、单复数、依赖数值符号的措辞都靠函数解决。

**中文串同时是数据键**：`grade`（一年级…大学先修）、`stage`（小学/中学/高中）、`q.level`
（基础/进阶/易错）保持中文不动，只在渲染时用 `T("grade." + g)` 之类取译文。所以
`gradeNum()`、`STAGE_DESC`、排序、`#/grade/:name` 这条 URL 全都不用改，旧书签继续有效。

**出题引擎的键 + 变量约定**：生成器不再直接拼句子，而是
`G("gen.chicken.stem", { H, F, ask }, `中文模板`)`。自动包装出来的键里变量按出现顺序叫
`v1, v2 …`；英文模板可以自由调整语序。新增题型时照这个格式写即可。

**几个必须留意的坑**：
- `t.steps[]` 是唯一以 HTML 注入的字段（js/app.js），译文里的 `<b>` 必须保留；而
  `q.explain` 是转义的，写 `<b>` 会显示成字面量。
- `isJudge()` / `judgeMark()` 的「对/错」词表由 `ui.judge.yes` / `ui.judge.no` 跨语言合并而成，
  新增语言时要一并补上，否则判断题的 ✓/✗ 样式会悄悄失效。
- `QFIG_MAP` 是加载时构建的静态表，里面存的是 `capKey` 而不是文案，渲染时才取译文。
- SVG 里英文比中文长 2–3 倍，而 `viewBox` 多数固定 320px：图注要短，必要时把该图的
  `viewBox` 调宽（按 `width:100%` 缩放，对中文无害）。

### 技巧对象（data.js）

```js
{ id, grade: "四年级", stage: "小学"|"中学"|"高中", name, anim: "chicken"|null,
  summary, kou /* 名师口诀 */, steps: [html], prereq, questions: [...] }
```

题目对象（静态题与生成题同构）：`{ q, opts: [string], ans: 正确项下标, level: "基础"|"进阶"|"易错", explain, point, fig }`。

### 解锁规则不是 data.js 里的 prereq

`app.js` 启动时用 `effPrereq()` **覆写**每个 `t.prereq`：1–8 年级按 `TECHNIQUES` 数组中的书写顺序在**同年级内**线性解锁（该年级首个技巧是入口），9 年级及以上一律无前置。所以改解锁次序要动数组顺序，改 data.js 的 `prereq` 字段无效。年级从中文串解析（`gradeNum`），`"十二年级+"` 会归并到十二年级，`"大学先修"` 落到 99。

### 出题引擎的两种注册约定

`app.js` 只依赖一个契约：`t.qgen(n)` 返回 n 道全新随机题。但三个文件实现方式不同：

- `qgen.js`（小学 10 法）：内部生成器是 `q…()` 返回**单题**，注册时包一层循环成 `qgen(n)`。
- `qgen_junior.js` / `qgen_high.js`：生成器本身签名为 `q…(n)`，**自己返回数组**，直接 `t.qgen = GEN[t.id]`。

新增方法时按所在文件的既有约定写，别混用。三个文件各自私有一套同名工具（`rnd/pick/shuffle/opts/Q/S`），签名不完全一致——`qgen.js` 的 `opts(ans, make, n)` 用一个干扰项工厂，junior/high 的 `opts(ans, make1, make2, make3)` 要三个。

### 配图规则

生成题在 `Q(...)` 最后一个参数带 `fig: { name: "gChicken", ...params }`，`app.js` 的 `renderFigOf()` 据此调 `window.Fig[name](params)`；静态题走 `QFIG_MAP["id::题号"]`。**配图只画题给的已知量，绝不泄露答案**——`gMeet`/`gChase` 用 `show: {v1,v2,s,t}` 开关逐项控制标注，是这条规则的参考实现。`Fig` 函数缺失时静默返回空串，不会报错，容易漏掉，改名后记得两边同步。

### 学员档案（同一台设备多人共用）

进度按学员分开存，键位如下：

| 键 | 内容 |
|---|---|
| `mathMastery.profiles` | `{ active, list:[{id,name,created}] }` |
| `mathMastery.v1.<id>` | 该学员的进度（结构与单人版**完全一致**） |
| `mathMastery.lang` | 语言，按**设备**存，不随学员切换 |
| `mathMastery.v1` | 旧的单人键：首次运行迁移时读一次，之后原样保留以便回退 |

只有 `load()` / `save()` 碰进度键，其余代码照旧读模块级的 `state`。换人后必须走
`afterProfileChange()`（重读 state → 重画外壳 → 刷新角标 → 重走路由）。
`readProfiles()` 在内容损坏时自愈重建，不抛错；`deleteProfile()` 必须同时
`removeItem(progressKey(id))`，否则数据只是失联而没被删掉。

给测试播种进度时，只写旧的 `mathMastery.v1` 是**到不了应用的**——档案表一旦存在就不再迁移。
必须同时写 `mathMastery.profiles` 和 `mathMastery.v1.<id>`（见 `verify.py`、`tools/e2e_check.js`）。

已知边界：**不跨设备同步**；且 `localStorage` 按 origin 隔离，`file://`、
`http://127.0.0.1:8142`、`http://192.168.x.x:8000` 是三份互不相通的数据——局域网上课时
要统一用 `start-lan-server.bat` 的那个地址。

### 进度导出 / 导入

`localStorage` 按 origin 隔离，换域名/换设备都带不走数据，所以给学员一个自己保管的 JSON 文件：

```json
{ "app": "math-mastery", "format": 1, "exported": "...",
  "learners": [ { "name": "Ann", "progress": { …与单人进度结构完全一致… } } ] }
```

`learners` 从一开始就是数组，「导出全部学员」因此只是多传几个 id。`format` 必填：
将来进度结构一变，旧文件要能被**明确拒绝**，而不是悄悄写坏一个档案。

三个关键约定：

- **导入永远新建学员，绝不覆盖当前的人**。重名加 `io.nameSuffix` 后缀（「Ann（导入）」）。
  重复导入会多出档案，但这比静默覆盖学生进度安全得多。
- `sanitizeProgress()` 是**信任边界**：它照着 `TECHNIQUES` 的 id 重建对象，而不是直接收下
  解析结果。未知/过期技巧 id、`__proto__` 构造、越界题号、脏值全在这里被丢掉或强制转型。
  改动进度结构时，这个函数必须同步改，否则导入会静默丢字段。
- 纯逻辑（`buildExport` / `sanitizeProgress` / `applyImport`）与 DOM 管道分开：jsdom 没有
  `URL.createObjectURL`，体检脚本靠打桩 `URL.createObjectURL` 截下 Blob、并用
  `Object.defineProperty` 伪造 `input.files` 来驱动导入。

### 进度与薄弱点

单个学员的进度形如 `{ [techId]: { mastered, weak: { [key]: { fails, cleared } } } }`。薄弱点的 key 分两制：静态题用**题号**，参数化题（`qgen` 存在）用**技巧 id 本身**——因为随机题没有稳定题号，薄弱点指向整个方法，复习时现场再生成一道。改动答题记账逻辑（`renderQuiz` / `renderReview`）时必须同时照顾两条分支。通关（gate）判定：正确率 ≥80% **且** 该技巧薄弱点清零。

## 一次性数据脚本

`transform_grades.py`、`inject_highschool.py` 是直接正则改写 `js/data.js` 的历史迁移脚本（含幂等守卫），不是构建流程的一部分。除非要再做同类批量改造，正常开发不要运行。
