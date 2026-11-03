// Google Maps 短連結解析器 — Cloudflare Worker
// 用途：Google Maps App 分享出嚟嘅 maps.app.goo.gl 短連結本身冇座標，
// 瀏覽器端（純 HTML 工具）因為 CORS 解唔到；呢個 Worker 喺伺服器端跟隨
// redirect、必要時讀埋目標頁面 HTML，抽出經緯度，轉 GCJ-02 後跳轉。
//
// 用法：
//   https://<your-worker>/?u=<URL編碼咗嘅 Google 連結>
//   https://<your-worker>/?u=<...>&mode=nav     直接跳高德導航
//   https://<your-worker>/?u=<...>&mode=marker  直接跳高德標記
//   預設 mode=page：跳去轉換器頁面（已填好座標），俾用戶確認再撳
//
// 部署：Cloudflare Dashboard → Workers & Pages → Create Worker → 貼上呢個檔 → Deploy

const CONVERTER = "https://jupiterlaw.github.io/google-to-amap-converter/";

/* ===== GCJ-02 conversion (same algorithm as index.html) ===== */
const PI = 3.1415926535897932384626, A = 6378245.0, EE = 0.00669342162296594323;
function transformLat(x, y) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}
function transformLng(x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}
function outOfChina(lng, lat) { return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271; }
function wgs84ToGcj02(lng, lat) {
  if (outOfChina(lng, lat)) return [lng, lat];
  let dLat = transformLat(lng - 105.0, lat - 35.0), dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * PI;
  let magic = Math.sin(radLat); magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
  dLng = (dLng * 180.0) / (A / sqrtMagic * Math.cos(radLat) * PI);
  return [lng + dLng, lat + dLat];
}

/* ===== coordinate extraction ===== */
function extractFromText(text) {
  let m = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return { lat: +m[1], lon: +m[2], how: "pin (!3d/!4d)" };
  m = text.match(/[?&](?:query|q|destination|daddr)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: +m[1], lon: +m[2], how: "query param" };
  m = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: +m[1], lon: +m[2], how: "viewport (@)" };
  // Google page data blobs: [null,null,<lat>,<lon>] is the place location pair
  m = text.match(/\[null,null,(-?\d{1,3}\.\d{4,}),(-?\d{1,3}\.\d{4,})\]/);
  if (m) return { lat: +m[1], lon: +m[2], how: "page data" };
  return null;
}
function extractName(url) {
  const m = url.match(/\/place\/([^\/@?]+)/);
  if (!m) return "";
  try { return decodeURIComponent(m[1].replace(/\+/g, " ")); } catch (e) { return m[1].replace(/\+/g, " "); }
}
function errorPage(msg) {
  return new Response(
    `<!DOCTYPE html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<body style="font-family:-apple-system,sans-serif;padding:24px;line-height:1.6"><h3>⚠️ ${msg}</h3>` +
    `<p>可以改用轉換器手動處理：<a href="${CONVERTER}">${CONVERTER}</a></p></body></html>`,
    { status: 422, headers: { "content-type": "text/html; charset=utf-8" } });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const u = url.searchParams.get("u");
    const mode = url.searchParams.get("mode") || "page";
    if (!u) return errorPage("缺少 u 參數（要解析嘅 Google 連結）。");

    let found = extractFromText(u);
    let name = extractName(u);
    const debug = url.searchParams.get("debug") === "1";
    const dbg = { input: u };

    if (!found) {
      // Follow redirects server-side (no CORS limit), then dig into the page if needed
      let res;
      try {
        res = await fetch(u, {
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
            "Accept-Language": "zh-Hant,zh;q=0.9,en;q=0.8",
          },
        });
      } catch (e) {
        return errorPage("開唔到條連結：" + e.message);
      }
      const finalUrl = res.url || u;
      // Google often 429-blocks datacenter fetchers and lands on a /sorry/ page;
      // the intended maps URL survives inside its "continue" parameter — recover it.
      let targetUrl = finalUrl;
      if (finalUrl.includes("/sorry/")) {
        try {
          const cont = new URL(finalUrl).searchParams.get("continue");
          if (cont) targetUrl = cont;
        } catch (e) { /* keep finalUrl */ }
      }
      name = name || extractName(targetUrl);
      found = extractFromText(targetUrl);
      let html = "";
      if (!found && targetUrl === finalUrl) {
        html = await res.text();
        found = extractFromText(html);
      }
      if (debug) {
        dbg.fetchStatus = res.status;
        dbg.finalUrl = finalUrl;
        dbg.targetUrl = targetUrl;
        dbg.urlFound = extractFromText(targetUrl);
        dbg.htmlLen = html.length;
        dbg.htmlFound = found;
        const ftid = new URL(targetUrl).searchParams.get("ftid") || "";
        dbg.ftid = ftid;
        dbg.qParam = new URL(targetUrl).searchParams.get("q");
        if (html) {
          const needle = ftid.split(":")[1] || "Moray";
          const idx = html.indexOf(needle);
          dbg.needle = needle;
          dbg.needleIdx = idx;
          dbg.aroundNeedle = idx >= 0 ? html.slice(Math.max(0, idx - 300), idx + 500) : null;
          const plus = html.match(/[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}/g);
          dbg.plusCodes = plus ? plus.slice(0, 5) : [];
          const pairs = html.match(/\[null,null,-?\d{1,3}\.\d+,-?\d{1,3}\.\d+\]/g);
          dbg.nullPairs = pairs ? pairs.slice(0, 5) : [];
        }
      }
      if (!found) {
        // iOS App 分享連結常見形式：最終網址只有 ?q=<名稱+地址>&ftid=<地點ID>，成條網址冇座標。
        // 最後手段：用 q 入面嘅地址做地理編碼（OSM Nominatim，免 Key），攞返 WGS-84 座標。
        const q = new URL(targetUrl).searchParams.get("q");
        if (q) {
          // Try several query variants: full q, q without trailing CJK country word, address-only (drop place name)
          const cleaned = q.replace(/(澳洲|澳大利亚|澳大利亞|紐西蘭|新西蘭)\s*$/u, "").trim();
          const addrOnly = cleaned.split(",").slice(1).join(",").trim();
          const variants = [q, cleaned, addrOnly].filter((v, i, a) => v && a.indexOf(v) === i);
          dbg.geocodeVariants = variants;
          dbg.geocodeResults = [];
          for (const v of variants) {
            try {
              const geo = await fetch(
                "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(v),
                { headers: { "User-Agent": "google-to-amap-converter (personal tool)" } });
              const arr = await geo.json();
              dbg.geocodeResults.push({ v, n: arr ? arr.length : 0, first: arr && arr.length ? [arr[0].lat, arr[0].lon] : null });
              if (arr && arr.length) {
                found = { lat: +arr[0].lat, lon: +arr[0].lon, how: "address geocode (fallback)" };
                if (!name) name = q.split(",")[0];
                break;
              }
            } catch (e) { dbg.geocodeResults.push({ v, error: String(e) }); }
          }
        }
      }
      if (debug) {
        return new Response(JSON.stringify(dbg, null, 1), { headers: { "content-type": "application/json; charset=utf-8" } });
      }
      if (!found) return errorPage("條連結展開之後都搵唔到座標，地址地理編碼亦失敗。");
    }

    const gcj = wgs84ToGcj02(found.lon, found.lat);
    const enc = encodeURIComponent(name || "落釘位置");
    if (mode === "nav") {
      return Response.redirect(
        `https://uri.amap.com/navigation?to=${gcj[0].toFixed(6)},${gcj[1].toFixed(6)},${enc}&mode=car&coordinate=gaode&callnative=1`, 302);
    }
    if (mode === "marker") {
      return Response.redirect(
        `https://uri.amap.com/marker?position=${gcj[0].toFixed(6)},${gcj[1].toFixed(6)}&name=${enc}&coordinate=gaode&callnative=1`, 302);
    }
    // default: back to the converter page, pre-filled
    return Response.redirect(
      `${CONVERTER}?lat=${found.lat.toFixed(6)}&lon=${found.lon.toFixed(6)}&name=${enc}`, 302);
  },
};
