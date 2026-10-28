/* ============================================================
 * 进度同步插件（服务端）：学员名单与进度存在服务器，所有设备共用一份。
 *
 * 只合并、不覆盖：PUT 的进度与已存的 merge（mastered 取或、薄弱点取更新的那条），
 * 所以任何设备推上来的旧状态都不会让进度倒退。能让进度变少的只有两个显式操作：
 * reset（应用里的「重置进度」）和 DELETE（删除学员，留墓碑，数据仍在文件里可找回）。
 * reset 会记 resetAt：别的设备拉取时看到更新的 resetAt，就用服务器进度整份替换本地，而不是合并
 * （否则它手里的旧进度又会被合并回来，重置等于白做）。局域网内不设鉴权。
 *
 *   GET    learners               → { learners:[{id,name,progress,resetAt}], deleted:[id] }
 *   PUT    learners/<id>          {name?, progress?} → { id, name, progress }
 *   POST   learners/<id>/reset    → { id, name, progress:{} }
 *   DELETE learners/<id>          → { ok:true }
 * 存储：<dataDir>/learners.json（先写临时文件再 rename，旧版留作 .bak）
 * ============================================================ */
const fs = require("fs"), path = require("path");
const { merge } = require("./public/merge.js");

const ID_RE = /^[a-z0-9]{1,40}$/;
const NAME_MAX = 40;

function init({ engine, dataDir, json, readJson }) {
  const FILE = path.join(dataDir, "learners.json");
  const T = engine.techniques;
  let db = { learners: {} };
  if (fs.existsSync(FILE)) {
    db = JSON.parse(fs.readFileSync(FILE, "utf8")); // 坏文件直接拒绝启动，别拿空库覆盖掉学生进度
    if (!db || typeof db.learners !== "object") throw new Error("progress: bad " + FILE);
  }
  function persist() {
    const tmp = FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(db));
    if (fs.existsSync(FILE)) fs.copyFileSync(FILE, FILE + ".bak");
    fs.renameSync(tmp, FILE);
  }
  const view = (id, l) => ({ id, name: l.name, progress: l.progress, resetAt: l.resetAt || 0 });
  const cleanName = n => String(n == null ? "" : n).trim().slice(0, NAME_MAX);

  return async function handler(req, res, sub) {
    if (sub === "learners" && req.method === "GET") {
      const ids = Object.keys(db.learners);
      return json(res, 200, {
        learners: ids.filter(id => !db.learners[id].deleted).map(id => view(id, db.learners[id])),
        deleted: ids.filter(id => db.learners[id].deleted)
      });
    }
    const m = /^learners\/([^/]+)(\/reset)?$/.exec(sub);
    if (!m) return json(res, 404, { error: "not found" });
    const id = m[1];
    if (!ID_RE.test(id)) return json(res, 400, { error: "bad id" });
    const cur = Object.prototype.hasOwnProperty.call(db.learners, id) ? db.learners[id] : null;
    if (cur && cur.deleted) return json(res, 410, { error: "deleted" });

    if (!m[2] && req.method === "PUT") {
      let body;
      try { body = await readJson(req); } catch (e) { return json(res, 400, { error: "bad json" }); }
      const name = cleanName(body.name);
      if (!cur && !name) return json(res, 400, { error: "name required" });
      const l = cur || { name, progress: {}, created: Date.now() };
      if (name) l.name = name;
      if (body.progress !== undefined) l.progress = merge(l.progress, body.progress, T);
      l.updated = Date.now();
      db.learners[id] = l;
      persist();
      return json(res, 200, view(id, l));
    }
    if (m[2] && req.method === "POST") {
      if (!cur) return json(res, 404, { error: "not found" });
      cur.progress = {}; cur.updated = cur.resetAt = Date.now();
      persist();
      return json(res, 200, view(id, cur));
    }
    if (!m[2] && req.method === "DELETE") {
      if (!cur) return json(res, 200, { ok: true }); // 没上传过的本地档案，删了就删了
      cur.deleted = Date.now();
      persist();
      return json(res, 200, { ok: true });
    }
    return json(res, 404, { error: "not found" });
  };
}

// merge.js 必须先于 client.js 注入
module.exports = { init, inject: ["merge.js", "client.js"] };
