# 进度同步插件（progress）

学员名单和学习进度存放在服务器上。每台设备打开应用时，都把服务器上的名单当作自己的档案列表，所以孩子在 iPad 上做的，换到笔记本上也在。
只在自托管时启用：`PLUGINS=progress`（可以和 screentime 并用）。在纯静态部署下，本插件完全不存在，进度照旧只存在浏览器里。

## 同步规则

- **只合并、不倒退。** 任何设备推送上来的进度都会和服务器上的那份合并：
  - `mastered` 取或。
  - 同一个薄弱点，取 `lastTime` 更新的那条；`lastTime` 相同时取 `attempts` 多的。
  - 合并满足交换律、可以重复执行，所以离线、失败后重试、旧设备推送过时的状态，都不会丢进度。
- **能让进度变少的只有两个显式操作：**
  - **重置进度**：服务器清空该学员的进度，并记下 `resetAt`。其他设备拉取时看到更新的 `resetAt`，会用服务器的空进度整份替换本地，而不是合并回去。
  - **删除学员**：服务器只留墓碑，数据仍在文件里。其他设备拉取时会删掉这个档案。
- **什么时候同步：**
  - 拉取：页面加载时、标签页回到前台时、每 2 分钟一次。
  - 推送：本地保存进度或改动名单后 1 秒。
  - 正在测验时不会重画页面，等孩子离开测验页面再刷新。
- **新设备首次加入时**，如果服务器名单不为空，本机那个空白的默认档案（「学员 1」）会被丢掉，免得每台新设备都往名单里加一个。
  本机已有的、带进度或者改过名字的档案，会照常上传。
- 局域网内不设鉴权，谁都能读写任何学员。因为只合并，最坏的情况也只是多出进度，不会抹掉进度。

## API（`/api/progress/`）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `learners` | `{ learners:[{id,name,progress,resetAt}], deleted:[id] }` |
| PUT | `learners/<id>` | `{name?, progress?}`：新建或更新。进度做合并，名字以最后一次为准；已删除的学员返回 410 |
| POST | `learners/<id>/reset` | 清空进度，记下 `resetAt` |
| DELETE | `learners/<id>` | 留墓碑 |

## 数据与恢复

- 文件是 `/data/progress/learners.json`，放在 docker volume `math-data` 里。每次写入都先写临时文件再 rename，上一版保留为 `.bak`。
- 查看：`docker compose exec math cat /data/progress/learners.json`
- **恢复被删除的学员**：把文件里该学员的 `"deleted": …` 字段删掉，再 `docker compose restart math`。
- 文件损坏时，服务会拒绝启动，不会用空库覆盖。此时用 `.bak` 恢复。

## 文件

- `server.js`：API 与存储。
- `public/merge.js`：`sanitize` / `merge` / `same` / `hasProgress`，浏览器和服务端共用同一份。
- `public/client.js`：对账、推送、拉取。
- `check.js`：体检脚本，运行 `node plugins/progress/check.js`，零依赖。
