# 屏幕时间插件（screentime）

通关测试做完后，孩子可以领取屏幕时间兑换码，兑换进 home-network-ctrl screentime 的银行。
这个插件只在自托管时启用：`PLUGINS=screentime node server/host.js`。用纯静态方式部署时，它完全不存在。

## 工作方式

```
浏览器                                  server/host.js + 本插件                    screentime.lan
quiz:start (gate) ── POST start ──────▶ 记下服务器时间，返回 attemptId
……答题……
quiz:finish ── POST submit ───────────▶ 用出题引擎按种子/题号重放判分
  {attemptId, kid, lang, items, picks}   计分 → 记账本 → makeCode(CODE_SECRET…)
             ◀── {minutes, code, claimUrl}
「去兑换」链接 ────────────────────────────────────────────────────────────▶ /claim 确认页 → 银行
```

- **浏览器什么都不决定。** 用时取服务器时钟。对错由服务器用与前端相同的 mulberry32 种子重放来判，见 `server/engine.js`。
  每个 attemptId 只能提交一次。
- 密钥只放在容器的环境变量里，前端只能拿到签好的码。
- 题目必须是这个技巧自己的题，而且一组题互不重复：生成题恰好 8 道，静态题至少 min(5, 题库) 道。

## 计分（常量在 `server.js` 顶部）

| 项 | 规则 |
|---|---|
| 基数 | 小学 6 · 中学 8 · 高中 10 分钟 |
| 正确率 | `max(0.3, 答对/总数)`：没通过、但认真做完了，也能拿到三成 |
| 用时系数 | `min(1, 秒数 / (题数 × 30))`；平均每题不到 8 秒算乱点，系数记 0 |
| 首次通关 | 同一个孩子第一次通过某技巧时，额外加一个基数。由服务器账本记，换浏览器或新建学员都不能重复领 |
| 限额 | 同一技巧每天最多计 3 次；每个孩子每天最多从数学领取 `DAILY_CAP`（默认 45）分钟 |

几个例子：
- 小学技巧首次通过，8 题对 7 题，用满时间：5 + 6 = 11 分钟。
- 小学技巧没通过，8 题对 3 题：2 分钟。
- 高中技巧首次通过，全对：20 分钟。

如果因为当天的限额一分钟都没发出去，首次通关奖励会保留到下一次。
screentime 银行自己的 `earned_daily_cap`（60）还会再限一道。

## 部署（Mac mini）

```bash
cp plugins/screentime/credit.env.example plugins/screentime/credit.env
chmod 600 plugins/screentime/credit.env
#   CODE_SECRET = /etc/screentime/web.yaml 里的 code_secret
#   KIDS = config.yaml 里的 pool 名，TZ = `timedatectl show -p Timezone --value`
docker compose up -d --build
docker compose logs -f math
```

- 容器只监听 `127.0.0.1:8142`，由本机 nginx 按主机名反代成 `http://math.lan`：
  ```nginx
  server {
      listen 80;
      server_name math.lan;
      location / {
          proxy_pass http://127.0.0.1:8142;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      }
  }
  ```
  DNS 两处都要加 `address=/math.lan/192.168.50.10`：mini 的 dnsmasq（受管设备用）和路由器的
  `/jffs/configs/dnsmasq.conf.add`（其余设备用）。
- 账本在名为 `math-data` 的 volume 里：`docker compose exec math cat /data/screentime/ledger.jsonl`。
- 启动时会自检：`CODE_SECRET`、`KIDS`、`TZ` 缺失或写错，或者签名测试向量对不上，容器都会直接退出，不会带病运行。

## 文件

- `server.js`：API（`kids` / `start` / `submit`）、计分和账本。
- `public/client.js`、`public/client.css`：结果卡下方的领取区，自带中英文案。
- `vendor/screentimeCode.js`：与 `~/work/home-network-ctrl/codegen/screentimeCode.js` 逐字相同。
  上游改了就直接覆盖过来；`vendor/package.json` 让它按 ESM 加载。
- `check.js`：体检，`node plugins/screentime/check.js`，零依赖。
