# 短連結解析器（Cloudflare Worker）

**已部署：** `https://gmap-resolver.jupiterlaw159.workers.dev`（2026-11-03 經 Cloudflare API 部署，Token 權限只限 Workers Scripts Edit）

實測結果（2026-11-03）：Google 會以 429 擋資料中心請求並跳去 `/sorry/` 頁，Worker 已內置喺
`sorry` 頁嘅 `continue` 參數搶救返目標網址，再抽座標／地址地理編碼。兩款連結都實測通過：
網頁分享款抽到精確落釘座標；iOS App 分享款（Nationwide Parking, 31 Moray St, Southbank）
以地址地理編碼得到 -37.827609, 144.961194。

安全加固（2026-11-03）：已加域名白名單 — 只接受 Google 域名（maps.app.goo.gl、goo.gl、
*.google.* 各國域名），輸入同每一跳 redirect 都查，其他網址一律拒絕（回 422），
避免畀人攞嚟做通用代理跳板；你條 iOS 連結加固後重測結果不變。

## 點解需要佢

Google Maps App 分享出嚟嘅係 `maps.app.goo.gl` 短連結，條連結本身**冇經緯度**。
純瀏覽器工具（`index.html`）受 CORS 限制，冇辦法自己跟隨 redirect 去展開條連結；
iPhone 捷徑嘅「展開 URL」有時亦只會得到含地點 ID 嘅中途連結，座標藏喺目標頁面嘅
HTML 入面。呢個 Worker 喺伺服器端做齊三步：

1. 跟隨 redirect 攞最終長連結，喺長連結度抽座標（`!3d/!4d`、`@lat,lon`、`query=`）
2. 抽唔到就讀目標頁面 HTML，再抽（包括 Google 頁面資料入面嘅 `[null,null,lat,lon]`）
3. 將 WGS-84 轉 GCJ-02，再 302 跳轉去目的地

## 用法

```
https://<你的-worker-網址>/?u=<URL編碼咗嘅 Google 連結>
```

- 預設（`mode=page`）：跳去轉換器頁面，座標已填好，等用戶確認再撳高德連結
- `&mode=nav`：直接跳高德導航（`uri.amap.com/navigation`）
- `&mode=marker`：直接跳高德標記（`uri.amap.com/marker`）

## iPhone 捷徑（配合 Worker，最簡版）

1. 捷徑 App 開新捷徑「轉去高德」，開啓「在分享表中顯示」，接收類型揀 URL
2. 加動作「URL 編碼」：對象 = 捷徑輸入
3. 加動作「開啟 URL」：`https://gmap-resolver.jupiterlaw159.workers.dev/?u=` + 編碼後嘅變數（想要直接導航就將條連結尾加 `&mode=nav`）

之後喺 Google Maps App 撳分享 →「轉去高德」→ 自動去到轉換頁（座標已填好）／高德 App。

注意：iOS App 分享款連結冇精確座標，Worker 會以地址地理編碼兜底，屬地址級精度，
去到轉換頁請先望一眼個落釘位置先撳高德連結；網頁分享款就有精確落釘座標。

## 部署（約 3 分鐘，免費額度足夠個人用）

1. 登入 Cloudflare Dashboard → Workers & Pages → Create → Worker
2. 命名（例如 `gmap-resolver`），Create 之後撳「Edit code」
3. 將 `resolver-worker.js` 成個內容貼上，撳 Deploy
4. 記低 Worker 網址（`https://gmap-resolver.<你的子域名>.workers.dev`），填返入上面捷徑條連結
