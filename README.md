# Google Maps → 高德地圖 座標轉換器

貼上 Google Maps 連結，自動將 WGS-84 座標轉換成高德地圖用嘅 GCJ-02（火星座標），再生成高德標記／導航連結。唔靠地點名稱搜尋，直接用座標落釘，解決兩個常見問題：

1. **名稱對唔上** — Google 同高德嘅地點資料庫唔同，靠個名喺高德再搜成日搵唔到或搵錯。
2. **座標偏幾百米** — Google 國際版用 WGS-84，中國內地地圖依法例用經偏移嘅 GCJ-02，座標直接搬過去會偏 100–700 米。

單一 HTML 檔，純本地運算，唔使 API Key，唔上傳任何資料，離線都用得。

**即刻用：** 開啟 GitHub Pages 版本，或將 `index.html` 下載到任何裝置用瀏覽器開啟。

## 用法

1. 喺 Google Maps 複製地點嘅長連結（或直接準備「緯度, 經度」座標）。
2. 貼入工具，撳「轉換並生成高德連結」。
3. 複製生成嘅高德標記連結（分享用）或導航連結（直接導航）。
4. 亦支援反方向：高德 GCJ-02 → Google WGS-84；另附百度地圖（BD-09）連結。

## 支援嘅輸入格式

- Google Maps 長連結：`/place/…`、`@lat,lon`、`?q=`、`query=`、連結入面嘅 `!3d<lat>!4d<lon>` 落釘座標（優先採用，最準確）
- 高德連結：`uri.amap.com/marker?position=<lon>,<lat>`
- 純座標文字：`31.230416, 121.473701`

## 已知限制

- `maps.app.goo.gl` 短連結本身唔含座標，純本地工具解唔到 — 先撳開變成長連結再貼。
- GCJ-02 → WGS-84 係近似逆轉換，誤差約 1–2 米，分享落釘足夠用。
- 座標喺演算法嘅中國範圍以外（海外）會原值直出，唔做轉換。

## 驗證

官方範例測試：WGS-84（116.404, 39.915）→ GCJ-02（116.41024449916938, 39.91640428150164），同 wandergis/coordtransform 公佈答案完全一致。

## 演算法來源

GCJ-02 標準轉換公式，同以下開源項目相同：

- [wandergis/coordtransform](https://github.com/wandergis/coordtransform)（JavaScript）
- [googollee/eviltransform](https://github.com/googollee/eviltransform)（多語言）

高德連結格式依高德開放平台 URI API：`https://uri.amap.com/marker?position=<lon>,<lat>&name=<name>&coordinate=gaode`

## License

MIT
