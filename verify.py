# -*- coding: utf-8 -*-
# /// script
# requires-python = ">=3.9"
# dependencies = ["playwright"]
# ///
"""
math-mastery 浏览器 QA 脚本（自包含版）

- 真浏览器把所有路由走一遍（与 tools/e2e_check.js 同一份路由表），收集 console 报错
- LANG_UI=en 时同时扫页面里残留的中文
- 关键页面截图：中文到 shots/，英文到 shots-en/
- 内置临时静态服务器；浏览器优先用本机 Edge，其次 playwright 自带 chromium，
  版本对不上（未下载对应构建）时再回退本机 Google Chrome
- 用法：uv run verify.py                  （中文，默认端口 8137）
        LANG_UI=en uv run verify.py      （英文）
        PORT=9000 uv run verify.py       （自定义端口）
  已能 import playwright 的 Python 也可直接 python verify.py
- 有 console 报错时退出码为 1，便于脚本里串联
依赖：uv（按上方 script 头自动装 playwright）；每台机器一次 playwright install chromium
"""
import os, sys, re, json, threading
import http.server, socketserver

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
LANG = os.environ.get("LANG_UI", "zh")
OUT = os.path.join(HERE, "shots" if LANG == "zh" else "shots-" + LANG)
os.makedirs(OUT, exist_ok=True)

PORT = int(os.environ.get("PORT", "8137"))
BASE = "http://127.0.0.1:%d/" % PORT
CJK = re.compile(r"[\u4e00-\u9fff]")

# 与 tools/e2e_check.js 保持一致：这些技巧的学习页挂着动画
ANIM_IDS = ["chicken", "general", "melon", "func1", "moving", "trip", "area_equal",
            "solid_axis", "conic_link", "euler", "taylor", "numshape", "tree", "linearprog",
            "normal_app", "complex_geo", "important_limit", "graph_transform"]

# ---- 内置静态服务器（守护线程，退出即销毁）----
class _Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=HERE, **k)
    def log_message(self, *a, **k):
        pass

socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("127.0.0.1", PORT), _Handler)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
print("本地服务已启动：", BASE, "语言：", LANG)

# 每次加载、在 app.js 执行前写好语言和学员档案；进度键要用技巧 id，等首屏加载后再写入并重载。
# 只写旧的 mathMastery.v1 是到不了应用的（档案表一旦存在就不再迁移），见 CLAUDE.md。
SEED = """
localStorage.setItem("mathMastery.lang", %s);
localStorage.setItem("mathMastery.profiles",
  JSON.stringify({ active: "test", list: [{ id: "test", name: "Test", created: 0 }] }));
""" % json.dumps(LANG)

issues = []          # (route, message)
cur = {"route": "(boot)"}

EDGE = r"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
with sync_playwright() as p:
    if os.path.exists(EDGE):
        b = p.chromium.launch(executable_path=EDGE, args=["--no-sandbox"])
    else:
        try:
            b = p.chromium.launch(args=["--no-sandbox"])
        except Exception:
            b = p.chromium.launch(channel="chrome", args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 960, "height": 1040})
    ctx.add_init_script(SEED)
    pg = ctx.new_page()
    pg.on("console", lambda m: issues.append((cur["route"], f"{m.type}: {m.text}"))
          if m.type in ("error", "warning")
          # 完整版 Chrome 会自动请求 /favicon.ico，应用没有这个文件，不算问题
          and not m.location.get("url", "").endswith("/favicon.ico") else None)
    pg.on("pageerror", lambda e: issues.append((cur["route"], f"pageerror: {e}")))

    pg.goto(BASE, wait_until="networkidle")
    ids = pg.evaluate("window.TECHNIQUES.map(t => t.id)")
    seed = {i: {"mastered": True, "weak": {}} for i in ids}
    pg.evaluate("s => localStorage.setItem('mathMastery.v1.test', s)", json.dumps(seed))
    pg.reload(wait_until="networkidle")

    def go(route):
        """切 hash 并等路由渲染完（两帧），返回 #view 的可见文字（含 SVG <text>）。
        不用 innerHTML：属性里的中文是数据键（data-stage="小学" 等），按约定保持中文。"""
        cur["route"] = route
        return pg.evaluate("""r => new Promise(res => {
            location.hash = r;
            requestAnimationFrame(() => requestAnimationFrame(() =>
              res(document.getElementById("view").textContent)));
        })""", route)

    # ---- 1. 全路由扫描 ----
    routes = ["#/path", "#/grade/%E4%B8%80%E5%B9%B4%E7%BA%A7",          # 一年级
              "#/grade/%E5%8D%81%E4%BA%8C%E5%B9%B4%E7%BA%A7",           # 十二年级
              "#/review", "#/progress", "#/resources"]
    for i in ids:
        routes += ["#/learn/" + i, "#/practice/" + i, "#/gate/" + i]

    cjk_pages = []
    for r in routes:
        html = go(r)
        if LANG != "zh" and CJK.search(html):
            hits = list(dict.fromkeys(s.strip() for s in re.findall(r"[^\n]*[\u4e00-\u9fff][^\n]*", html)))[:3]
            cjk_pages.append(f"{r} → {' | '.join(hits)[:160]}")

    # 动画在学习页挂到 #animBox，单独扫一遍其文字
    for a in ANIM_IDS:
        go("#/learn/" + a)
        txt = pg.evaluate("(() => { const b = document.getElementById('animBox'); return b ? b.textContent : ''; })()")
        if LANG != "zh" and CJK.search(txt):
            flat = re.sub(r"\s+", " ", txt)
            cjk_pages.append(f"anim {a} → {flat[:120]}")

    # ---- 2. 关键页面截图（按钮用 data-act 定位，与语言无关）----
    def shot(name, route, act=None, clicks=1, wait=600):
        go(route); pg.wait_for_timeout(wait)
        if act:
            try:
                btn = pg.locator(f"#animBox [data-act='{act}']").first
                for _ in range(clicks):
                    btn.click(timeout=2000); pg.wait_for_timeout(700)
            except Exception as e:
                issues.append((route, f"{act}-button: {e}"))
        pg.screenshot(path=os.path.join(OUT, name))

    shot("1-path.png", "#/path", wait=400)
    shot("2-learn-chicken.png", "#/learn/chicken", act="play", clicks=3)
    shot("3-learn-general.png", "#/learn/general")
    shot("4-learn-melon.png", "#/learn/melon", wait=1200)
    shot("5-learn-func1.png", "#/learn/func1", wait=800)
    shot("6-learn-func-quad.png", "#/learn/func1", act="toggle")
    shot("7-learn-moving.png", "#/learn/moving", wait=1200)
    shot("8-practice.png", "#/practice/ratio", wait=400)
    try:
        pg.locator(".q").first.locator(".opt").nth(0).click(timeout=2000)
        pg.wait_for_timeout(400)
        pg.screenshot(path=os.path.join(OUT, "9-practice-answer.png"))
    except Exception as e:
        issues.append(("#/practice/ratio", "practice-click: " + str(e)))
    shot("10-progress.png", "#/progress", wait=400)
    shot("11-ao-meet-trip.png", "#/learn/meet", act="meet", wait=600)
    shot("12-ao-area-geo.png", "#/learn/area_equal")
    shot("13-hs-conic.png", "#/learn/conic_link", act="toggle", wait=800)
    shot("14-hs-solid.png", "#/learn/solid_axis", act="play", wait=800)

    b.close()

print("techniques:", len(ids))
print("ROUTES:", len(routes), "+", len(ANIM_IDS), "animations")
print("CONSOLE_ISSUES:", len(issues))
for r, m in issues[:40]:
    print(" -", r, "→", m[:200])
if LANG != "zh":
    print("CJK_PAGES:", len(cjk_pages))
    for c in cjk_pages[:40]:
        print(" -", c)
print("screenshots →", OUT)
sys.exit(1 if issues else 0)
