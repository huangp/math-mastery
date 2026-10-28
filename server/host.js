#!/usr/bin/env node
/* ============================================================
 * 自托管服务器（零依赖，Node 20+）：静态托管核心应用 + 按需挂插件。
 *
 *   PLUGINS=screentime PORT=8142 DATA_DIR=./data node server/host.js
 *   node server/host.js --selftest     加载出题引擎与各插件自检后退出
 *
 * 插件约定（plugins/<name>/）：
 *   server.js   module.exports = { init(ctx) → handler(req, res, subpath) }（init 可为 async），挂在 /api/<name>/
 *               ctx = { engine, dataDir, env, json, readJson }；init 抛错即拒绝启动
 *               可选 module.exports.inject = ["merge.js", "client.js", ...]：按序注入的 public/ 文件，
 *               缺省为 ["client.css", "client.js"]（存在才注入）
 *   public/     对外静态目录；注入的脚本排在 app.js 之前，用 window.MathMastery.queue 预注册钩子，
 *               见 CLAUDE.md「插件钩子」
 * 核心文件一律不改：注入只发生在响应里。只放行白名单路径，server/ data/ 与插件私有文件一律 404。
 * ============================================================ */
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const PORT = +process.env.PORT || 8142;
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const PLUGINS = (process.env.PLUGINS || "").split(",").map(s => s.trim()).filter(Boolean);
const MAX_BODY = 64 * 1024;

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on("data", c => { n += c.length; if (n > MAX_BODY) { reject(new Error("body too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

// 静态白名单：路径解析后必须落在这些前缀里
function allowed(rel) {
  if (rel === "index.html" || rel === "styles.css") return true;
  if (rel.startsWith("js/")) return true;
  return PLUGINS.some(p => rel.startsWith("plugins/" + p + "/public/"));
}

async function start() {
  const engine = require("./engine").load();
  const handlers = {}, css = [], js = [];
  for (const name of PLUGINS) {
    if (!/^[a-z0-9_-]+$/.test(name)) throw new Error("bad plugin name: " + name);
    const dir = path.join(ROOT, "plugins", name);
    const dataDir = path.join(DATA_DIR, name);
    fs.mkdirSync(dataDir, { recursive: true });
    const mod = require(path.join(dir, "server.js"));
    handlers[name] = await mod.init({ engine, dataDir, env: process.env, json, readJson });
    for (const f of mod.inject || ["client.css", "client.js"]) {
      if (!fs.existsSync(path.join(dir, "public", f))) continue;
      const url = `plugins/${name}/public/${f}`;
      (f.endsWith(".css") ? css : js).push(f.endsWith(".css") ? `<link rel="stylesheet" href="${url}" />` : `<script src="${url}"></script>`);
    }
  }

  const server = http.createServer(async (req, res) => {
    let url;
    try { url = new URL(req.url, "http://x"); } catch (e) { res.writeHead(400); return res.end(); }
    const p = decodeURIComponent(url.pathname);
    const api = /^\/api\/([a-z0-9_-]+)\/(.*)$/.exec(p);
    if (api) {
      const h = handlers[api[1]];
      if (!h) return json(res, 404, { error: "not found" });
      try { return await h(req, res, api[2]); }
      catch (e) { console.error(e); return json(res, 500, { error: "server error" }); }
    }
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end(); }
    const rel = path.posix.normalize(p === "/" ? "index.html" : p.replace(/^\/+/, ""));
    if (rel.startsWith("..") || !allowed(rel)) { res.writeHead(404); return res.end("Not found"); }
    const file = path.join(ROOT, rel);
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end("Not found"); }
      if (rel === "index.html" && (css.length || js.length)) {
        // 样式进 </head>；脚本插在 app.js 之前（i18n/data 已就绪，钩子赶得上首屏同步渲染）
        buf = Buffer.from(buf.toString("utf8")
          .replace("</head>", css.map(t => "  " + t + "\n").join("") + "</head>")
          .replace('<script src="js/app.js">', js.join("\n  ") + '\n  <script src="js/app.js">'));
      }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(rel)] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(req.method === "HEAD" ? undefined : buf);
    });
  });
  return { server, engine };
}

if (require.main === module) (async () => {
  let server, engine;
  // 插件 init 失败就直接退出，宁可起不来也不带病运行
  try { ({ server, engine } = await start()); } catch (e) { console.error("startup failed: " + e.message); process.exit(1); }
  if (process.argv.includes("--selftest")) {
    console.log(`selftest ok: ${engine.techniques.length} techniques, plugins: ${PLUGINS.join(",") || "(none)"}`);
    process.exit(0);
  }
  server.listen(PORT, HOST, () => console.log(`math-mastery on http://${HOST}:${PORT}  plugins: ${PLUGINS.join(",") || "(none)"}`));
})();

module.exports = { start };
