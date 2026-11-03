# 短連結解析器（Cloudflare Worker）

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
3. 加動作「開啟 URL」：`https://<你的-worker-網址>/?u=` + 編碼後嘅變數（想要直接導航就加 `&mode=nav`）

之後喺 Google Maps App 撳分享 →「轉去高德」→ 自動去到轉換頁／高德 App。

## 部署（約 3 分鐘，免費額度足夠個人用）

1. 登入 Cloudflare Dashboard → Workers & Pages → Create → Worker
2. 命名（例如 `gmap-resolver`），Create 之後撳「Edit code」
3. 將 `resolver-worker.js` 成個內容貼上，撳 Deploy
4. 記低 Worker 網址（`https://gmap-resolver.<你的子域名>.workers.dev`），填返入上面捷徑條連結
