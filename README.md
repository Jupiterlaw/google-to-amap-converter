# Google Maps → 高德地圖座標轉換器

**[繁體中文](#繁體中文)** | **[简体中文](#简体中文)** | **[English](#english)**

---

## 繁體中文

貼上 Google Maps 連結，自動將 WGS-84 座標轉換成高德地圖用嘅 GCJ-02（火星座標），再生成高德標記／導航連結。唔靠地點名稱搜尋，直接用座標落釘，解決兩個常見問題：

1. **名稱對唔上** — Google 同高德嘅地點資料庫唔同，靠個名喺高德再搜成日搵唔到或搵錯。
2. **座標偏幾百米** — Google 國際版用 WGS-84，中國內地地圖依法例用經偏移嘅 GCJ-02，座標直接搬過去會偏 100–700 米。

單一 HTML 檔，純本地運算，唔使 API Key，唔上傳任何資料，離線都用得。

**即刻用：** 開啟 GitHub Pages 版本，或將 `index.html` 下載到任何裝置用瀏覽器開啟。

### 用法

1. 喺 Google Maps 複製地點嘅長連結（或直接準備「緯度, 經度」座標）。
2. 貼入工具，撳「轉換並生成高德連結」。
3. 複製生成嘅高德標記連結（分享用）或導航連結（直接導航）。
4. 亦支援反方向：高德 GCJ-02 → Google WGS-84；另附百度地圖（BD-09）連結。
5. iPhone 捷徑／書籤支援：網址加參數即自動轉換 — `?lat=<緯度>&lon=<經度>&name=<名稱>` 或 `?q=<Google Maps 連結>`。

### 支援嘅輸入格式

- Google Maps 長連結：`/place/…`、`@lat,lon`、`?q=`、`query=`、連結入面嘅 `!3d<lat>!4d<lon>` 落釘座標（優先採用，最準確）
- 高德連結：`uri.amap.com/marker?position=<lon>,<lat>`
- 純座標文字：`31.230416, 121.473701`

### 已知限制

- `maps.app.goo.gl` 短連結本身唔含座標，純本地工具解唔到 — 先撳開變成長連結再貼。
- GCJ-02 → WGS-84 係近似逆轉換，誤差約 1–2 米，分享落釘足夠用。
- 座標喺演算法嘅中國範圍以外（海外）會原值直出，唔做轉換。

### 驗證

官方範例測試：WGS-84（116.404, 39.915）→ GCJ-02（116.41024449916938, 39.91640428150164），同 wandergis/coordtransform 公佈答案完全一致。

### 演算法來源

GCJ-02 標準轉換公式，同以下開源項目相同：

- [wandergis/coordtransform](https://github.com/wandergis/coordtransform)（JavaScript）
- [googollee/eviltransform](https://github.com/googollee/eviltransform)（多語言）

高德連結格式依高德開放平台 URI API：`https://uri.amap.com/marker?position=<lon>,<lat>&name=<name>&coordinate=gaode`

### License

MIT

---

## 简体中文

粘贴 Google Maps 链接，自动将 WGS-84 坐标转换成高德地图使用的 GCJ-02（火星坐标），再生成高德标记／导航链接。不靠地点名称搜索，直接用坐标落点，解决两个常见问题：

1. **名称对不上** — Google 和高德的地点数据库不同，只靠名称在高德重新搜索，经常找不到或找错。
2. **坐标偏移几百米** — Google 国际版使用 WGS-84，中国内地地图依法规使用经过偏移的 GCJ-02，坐标直接搬过去会偏 100–700 米。

单个 HTML 文件，纯本地运算，无需 API Key，不上传任何数据，离线也能用。

**立即使用：** 打开 GitHub Pages 版本，或将 `index.html` 下载到任何设备用浏览器打开。

### 使用方法

1. 在 Google Maps 复制地点的长链接（或直接准备“纬度, 经度”坐标）。
2. 粘贴到工具中，点击“转换并生成高德链接”。
3. 复制生成的高德标记链接（用于分享）或导航链接（直接导航）。
4. 也支持反方向：高德 GCJ-02 → Google WGS-84；另附百度地图（BD-09）链接。
5. iPhone 快捷指令／书签支持：网址加参数即自动转换 — `?lat=<纬度>&lon=<经度>&name=<名称>` 或 `?q=<Google Maps 链接>`。

### 支持的输入格式

- Google Maps 长链接：`/place/…`、`@lat,lon`、`?q=`、`query=`、链接中的 `!3d<lat>!4d<lon>` 落点坐标（优先采用，最准确）
- 高德链接：`uri.amap.com/marker?position=<lon>,<lat>`
- 纯坐标文本：`31.230416, 121.473701`

### 已知限制

- `maps.app.goo.gl` 短链接本身不含坐标，纯本地工具无法解析 — 请先点开变成长链接再粘贴。
- GCJ-02 → WGS-84 为近似逆转换，误差约 1–2 米，用于分享落点足够。
- 坐标在算法的中国范围以外（海外）会原值输出，不做转换。

### 验证

官方示例测试：WGS-84（116.404, 39.915）→ GCJ-02（116.41024449916938, 39.91640428150164），与 wandergis/coordtransform 公布的答案完全一致。

### 算法来源

GCJ-02 标准转换公式，与以下开源项目相同：

- [wandergis/coordtransform](https://github.com/wandergis/coordtransform)（JavaScript）
- [googollee/eviltransform](https://github.com/googollee/eviltransform)（多语言）

高德链接格式依据高德开放平台 URI API：`https://uri.amap.com/marker?position=<lon>,<lat>&name=<name>&coordinate=gaode`

### License

MIT

---

## English

Paste a Google Maps link and this tool converts its WGS-84 coordinates to the GCJ-02 ("Mars coordinates") used by Amap (Gaode), then generates ready-to-share Amap marker and navigation links. Instead of searching by place name, it shares an exact coordinate pin, which solves two common problems:

1. **Place names don't match** — Google and Amap use different POI databases, so searching the same name in Amap often finds nothing, or the wrong place.
2. **Pins land hundreds of metres off** — Google Maps (international) uses WGS-84, while maps in mainland China are legally required to use the offset GCJ-02 system. Pasting raw coordinates into Amap shifts the point by 100–700 metres.

A single HTML file. Everything runs locally in your browser — no API key, no data uploaded, works offline.

**Use it now:** open the GitHub Pages version, or download `index.html` and open it in any browser.

### How to use

1. Copy a place's long link from Google Maps (or have a `latitude, longitude` pair ready).
2. Paste it into the tool and click "Convert".
3. Copy the generated Amap marker link (for sharing) or navigation link (to start routing).
4. The reverse direction is also supported: Amap GCJ-02 → Google WGS-84. A Baidu Maps (BD-09) link is included as a bonus.
5. iOS Shortcut / bookmark support: append URL parameters to convert automatically — `?lat=<lat>&lon=<lon>&name=<name>`, or `?q=<Google Maps link>`.

### Supported input formats

- Google Maps long links: `/place/…`, `@lat,lon`, `?q=`, `query=`, and the `!3d<lat>!4d<lon>` pin coordinates inside the link (preferred — most accurate)
- Amap links: `uri.amap.com/marker?position=<lon>,<lat>`
- Plain coordinate text: `31.230416, 121.473701`

### Known limitations

- Short links (`maps.app.goo.gl`) contain no coordinates, so a purely local tool cannot resolve them — open the link first so it expands to the long URL, then paste that.
- GCJ-02 → WGS-84 is an approximate inverse conversion with about 1–2 m of error — plenty accurate for sharing a pin.
- Coordinates outside the algorithm's China bounding box (overseas locations) are passed through unchanged.

### Verification

Reference test vector: WGS-84 (116.404, 39.915) → GCJ-02 (116.41024449916938, 39.91640428150164), matching the published result of wandergis/coordtransform exactly.

### Algorithm sources

The standard GCJ-02 transformation, as implemented in these open-source projects:

- [wandergis/coordtransform](https://github.com/wandergis/coordtransform) (JavaScript)
- [googollee/eviltransform](https://github.com/googollee/eviltransform) (multi-language)

Amap link format follows the Amap Open Platform URI API: `https://uri.amap.com/marker?position=<lon>,<lat>&name=<name>&coordinate=gaode`

### License

MIT
