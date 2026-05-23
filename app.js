/* =========================================================
   Atlas of Women Writers — globe + interactions
   ========================================================= */

(() => {

const CSV_URL    = "women_writers.csv";
const GLOBE_R    = 1.0;
const POINT_R    = GLOBE_R + 0.005;
const STAGE      = document.getElementById("stage");
const TOOLTIP    = document.getElementById("tooltip");
const SPLASH     = document.getElementById("splash");
const CARD       = document.getElementById("card");
const SEARCH     = document.getElementById("search");
const REGION_CHIPS = document.getElementById("region-chips");

/* ----- bilingual lookup for cities, regions, countries -----
 * Rule:
 *   - Chinese-rooted entries (中国/上海/香港 etc.) → show Chinese only
 *   - Everything else      → "中文 (English)"
 * If a token isn't in the map, we leave it as-is.
 */
const ZH = {
  // === countries / nationalities ===
  "United Kingdom": "英国",
  "England":        "英格兰",
  "Scotland":       "苏格兰",
  "France":         "法国",
  "Italy":          "意大利",
  "Spain":          "西班牙",
  "Spain (Catalonia)": "西班牙加泰罗尼亚",
  "Catalonia":      "加泰罗尼亚",
  "Germany":        "德国",
  "West Germany":   "西德",
  "GDR":            "东德",
  "East Berlin":    "东柏林",
  "Austria":        "奥地利",
  "Switzerland":    "瑞士",
  "Hungary":        "匈牙利",
  "Poland":         "波兰",
  "Greece":         "希腊",
  "Sweden":         "瑞典",
  "Norway":         "挪威",
  "Finland":        "芬兰",
  "Russia":         "俄罗斯",
  "USSR":           "苏联",
  "Belarus":        "白俄罗斯",
  "Romania":        "罗马尼亚",
  "United States":  "美国",
  "USA":            "美国",
  "Canada":         "加拿大",
  "Mexico":         "墨西哥",
  "Venezuela":      "委内瑞拉",
  "Chile":          "智利",
  "Brazil":         "巴西",
  "Argentina":      "阿根廷",
  "China":          "中国",
  "Japan":          "日本",
  "South Korea":    "韩国",
  "Korea":          "韩国",
  "India":          "印度",
  "Iran":           "伊朗",
  "Turkey":         "土耳其",
  "UK":             "英国",
  "Nigeria":        "尼日利亚",
  "Zimbabwe":       "津巴布韦",
  "Egypt":          "埃及",
  "South Africa":   "南非",
  "Botswana":       "博茨瓦纳",
  "Senegal":        "塞内加尔",
  "Australia":      "澳大利亚",
  "New Zealand":    "新西兰",
  "Antigua":        "安提瓜",
  "Haiti":          "海地",
  "Guadeloupe":     "瓜德罗普",
  "Dominica":       "多米尼克",

  // === US states ===
  "Georgia":           "佐治亚州",
  "Maine":             "缅因州",
  "Massachusetts":     "马萨诸塞州",
  "Vermont":           "佛蒙特州",
  "Colorado":          "科罗拉多州",
  "California":        "加利福尼亚州",
  "Alabama":           "阿拉巴马州",
  "Nebraska":          "内布拉斯加州",

  // === Canadian / regional ===
  "Ontario":               "安大略省",
  "Prince Edward Island":  "爱德华王子岛",

  // === Other regional ===
  "Cornwall":          "康沃尔",
  "New South Wales":   "新南威尔士",
  "Coquimbo Region":   "科金博大区",

  // === Cities ===
  "London":         "伦敦",
  "Edinburgh":      "爱丁堡",
  "Manchester":     "曼彻斯特",
  "Cornwall":       "康沃尔",
  "Chawton":        "乔顿",
  "Haworth":        "霍沃斯",
  "Devon":          "德文",
  "Fowey":          "福伊",
  "Paris":          "巴黎",
  "Cergy":          "塞尔吉",
  "Geneva":         "日内瓦",
  "Berlin":         "柏林",
  "Vienna":         "维也纳",
  "Steyr":          "施泰尔",
  "Budapest":       "布达佩斯",
  "Kraków":         "克拉科夫",
  "Krajanów":       "克拉雅诺夫",
  "Wrocław":        "弗罗茨瓦夫",
  "Minsk":          "明斯克",
  "Leningrad":      "列宁格勒",
  "Saint Petersburg":"圣彼得堡",
  "Lesbos":         "莱斯沃斯",
  "Mytilene":       "米蒂利尼",
  "Mårbacka":       "莫尔巴卡",
  "Sunne":          "松内",
  "Lillehammer":    "利勒哈默尔",
  "Helsinki":       "赫尔辛基",
  "Klovharu":       "克洛夫哈鲁",
  "Rome":           "罗马",
  "Naples":         "那不勒斯",
  "Turin":          "都灵",
  "Barcelona":      "巴塞罗那",

  "New York":       "纽约",
  "New York (Harlem)": "纽约 (哈莱姆)",
  "Boston":         "波士顿",
  "Chicago":        "芝加哥",
  "Cincinnati":     "辛辛那提",
  "Atlanta":        "亚特兰大",
  "Concord":        "康科德",
  "Brunswick":      "布伦瑞克",
  "South Berwick":  "南伯威克",
  "New Orleans":    "新奥尔良",
  "Los Angeles":    "洛杉矶",
  "San Francisco":  "旧金山",
  "Berkeley":       "伯克利",
  "Miami":          "迈阿密",
  "Boulder":        "博尔德",
  "Monroeville, Alabama": "蒙罗维尔 (阿拉巴马州)",
  "Red Cloud, Nebraska":  "雷德克劳德 (内布拉斯加州)",

  "Toronto":        "多伦多",
  "Clinton":        "克林顿",
  "Cavendish":      "卡文迪什",
  "Mexico City":    "墨西哥城",
  "Caracas":        "加拉加斯",
  "Santiago":       "圣地亚哥",
  "Vicuña":         "比库尼亚",
  "Rio de Janeiro": "里约热内卢",
  "Buenos Aires":   "布宜诺斯艾利斯",

  "Tokyo":          "东京",
  "Kyoto":          "京都",
  "Seoul":          "首尔",
  "Beijing":        "北京",
  "Shanghai":       "上海",
  "Hong Kong":      "香港",
  "Harbin":         "哈尔滨",
  "Delhi":          "德里",
  "Tehran":         "德黑兰",
  "Istanbul":       "伊斯坦布尔",

  "Lagos":          "拉各斯",
  "Enugu":          "埃努古",
  "Cairo":          "开罗",
  "Dakar":          "达喀尔",
  "Johannesburg":   "约翰内斯堡",
  "Harare":         "哈拉雷",
  "Serowe":         "塞罗韦",

  "Sydney":         "悉尼",
  "Oamaru":         "奥马鲁",
  "Okarito":        "奥卡里托",
  "Levin":          "莱文",

  "Goyave":         "戈亚夫",
  "Pointe-à-Pitre": "皮特尔角城",
  "Port-au-Prince": "太子港",
  "Roseau":         "罗索",
  "St. John's":     "圣约翰",

  // === presumed / annotations to keep ===
  "presumed":       "推测",
};

// terms that mean "this is a Chinese place/country, show Chinese ONLY"
const CHINESE_TOKENS = new Set([
  "China", "Hong Kong", "Beijing", "Shanghai", "Harbin",
]);

/* ---- paragraphize: split long Chinese text into 2-3 paragraphs ----
 * Strategy:
 *   - split on full-stop / question / exclamation (keep them in)
 *   - join sentences into paragraphs targeting ~3-4 sentences each
 *   - never produce a single-sentence orphan at the end
 */
function paragraphize(text, opts) {
  if (!text) return "";
  text = String(text).trim();
  // Chinese full-stop 。 plus Western .!? — keep the delimiter
  const sentences = text
    .split(/(?<=[。！？!?])/)
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length <= 2) return text;

  // pick target paragraphs: short text -> 2, longer -> 3
  const len = text.length;
  const targetParas = len < 180 ? 2 : (len < 380 ? 2 : 3);
  const per = Math.ceil(sentences.length / targetParas);

  const paras = [];
  for (let i = 0; i < sentences.length; i += per) {
    paras.push(sentences.slice(i, i + per).join(""));
  }
  // if final paragraph is a stub (1 sentence and total > 2), merge into previous
  if (paras.length > 1 && paras[paras.length - 1].length < 40) {
    paras[paras.length - 2] += paras.pop();
  }
  return paras.join("\n\n");
}

function renderParagraphs(el, text) {
  el.innerHTML = "";
  const paras = paragraphize(text).split("\n\n");
  for (const p of paras) {
    const node = document.createElement("p");
    node.textContent = p;
    el.appendChild(node);
  }
}

/**
 * Localize a "Place, Subregion" / "Country/Country" / single-token string.
 * Splits on common separators, looks up each piece in ZH, then formats:
 *   - if every piece is Chinese-rooted → 中文 only
 *   - otherwise                         → "中文 (English)"
 * If a piece has no ZH translation, it's kept verbatim.
 */
function localize(raw) {
  if (!raw || raw === "—") return "—";
  raw = String(raw).trim();
  if (!raw) return "—";

  // detect separator style (comma list vs slash list); keep style
  let parts, sepZh, sepEn;
  if (raw.includes("/")) { parts = raw.split("/"); sepZh = " / "; sepEn = " / "; }
  else if (raw.includes(",")) { parts = raw.split(","); sepZh = "、"; sepEn = ", "; }
  else { parts = [raw]; sepZh = ""; sepEn = ""; }

  const zhParts = [];
  const enParts = [];
  let allChinese = true;

  for (let p of parts) {
    p = p.trim();
    // strip parenthetical annotations like "(presumed)" — but if the full
    // string is itself a known compound key (e.g. "Spain (Catalonia)"),
    // skip the strip and look it up whole.
    let annotation = "", annotationEn = "";
    const mAnno = p.match(/^(.+?)\s*\((.+)\)\s*$/);
    if (mAnno && !ZH[p]) {
      p = mAnno[1].trim();
      const annoZh = ZH[mAnno[2]] || mAnno[2];
      annotation   = `(${annoZh})`;
      annotationEn = ` (${mAnno[2]})`;
    }

    const zh = ZH[p];
    if (zh) {
      zhParts.push(zh + annotation);
      enParts.push(p + annotationEn);
      if (!CHINESE_TOKENS.has(p)) allChinese = false;
    } else {
      // no translation — fall through, treat as foreign
      zhParts.push(p + annotation);
      enParts.push(p + annotationEn);
      allChinese = false;
    }
  }

  const zhStr = zhParts.join(sepZh);
  const enStr = enParts.join(sepEn);
  if (allChinese) return zhStr;
  return `${zhStr} (${enStr})`;
}

// ---------- state ----------
let BOOKS = [];          // raw rows from CSV
let SCENE_POINTS = [];   // { mesh, book, idx, baseColor, ... }
let activeIdx = -1;
let filterRegion = null;
let filterQuery  = "";

// ---------- helpers ----------
function latLonToVec3(lat, lon, r) {
  const phi   = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  // standard: x = -r sin(phi) cos(theta), y = r cos(phi), z = r sin(phi) sin(theta)
  const x = -r * Math.sin(phi) * Math.cos(theta);
  const y =  r * Math.cos(phi);
  const z =  r * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

/* Inverse of latLonToVec3 — used by the "pick on globe" mode.
 * Input: vec in globe-local coordinates (i.e. AFTER undoing globe.rotation).
 */
function vec3ToLatLon(v) {
  const r = v.length();
  const lat = 90 - (Math.acos(v.y / r) * 180 / Math.PI);
  let theta = Math.atan2(v.z, -v.x);     // inverse of (x=-r sphi*cth, z=r sphi*sth)
  let lon = theta * 180 / Math.PI - 180;
  // normalize lon into [-180, 180]
  while (lon < -180) lon += 360;
  while (lon >  180) lon -= 360;
  return { lat, lon };
}

function parseTags(s) {
  if (!s) return [];
  return s.split(/[;,，；]/).map(x => x.trim()).filter(Boolean);
}

function regionOf(book) {
  const t = book.tags || [];
  const known = ["欧洲","北美","拉美","亚洲","非洲","大洋洲","加勒比"];
  for (const k of known) if (t.includes(k)) return k;
  return "其他";
}

// ---------- three.js setup ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(STAGE.clientWidth, STAGE.clientHeight);
renderer.setClearColor(0x000000, 0);
STAGE.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(38, STAGE.clientWidth / STAGE.clientHeight, 0.1, 100);
camera.position.set(0, 0, 3.2);

// lighting (very soft, since we use unlit materials mostly)
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const key = new THREE.DirectionalLight(0xfff5e0, 0.35);
key.position.set(3, 2, 4);
scene.add(key);

// ---------- the globe (parent group, rotates as one) ----------
const globe = new THREE.Group();
scene.add(globe);

// (1) base sphere — very pale paper-tone, unlit so the whole globe stays light
const sphereGeo = new THREE.SphereGeometry(GLOBE_R, 96, 64);
const sphereMat = new THREE.MeshBasicMaterial({
  color: 0xf4ede0,    // matches the page paper tone
});
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
globe.add(sphereMesh);

// add a very subtle radial shading on top so the globe still reads as 3D,
// rendered as a separate inner sphere with a soft fresnel-ish front-face material.
const shadeGeo = new THREE.SphereGeometry(GLOBE_R * 0.999, 96, 64);
const shadeMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    tint: { value: new THREE.Color(0xd9cdb3) },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    uniform vec3 tint;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      float d = 1.0 - max(dot(vNormal, vViewDir), 0.0);
      // very gentle edge darkening only — center stays bright
      float a = smoothstep(0.55, 1.0, d) * 0.18;
      gl_FragColor = vec4(tint, a);
    }
  `,
});
globe.add(new THREE.Mesh(shadeGeo, shadeMat));

// (2) graticule (meridians + parallels) — thin sepia
function buildGraticule() {
  const g = new THREE.Group();
  const matMain = new THREE.LineBasicMaterial({ color: 0xb09878, transparent: true, opacity: 0.55 });
  const matEq   = new THREE.LineBasicMaterial({ color: 0x8a6a48, transparent: true, opacity: 0.85 });
  const r = GLOBE_R * 1.0005;
  // parallels every 15°
  for (let lat = -75; lat <= 75; lat += 15) {
    const pts = [];
    for (let lon = 0; lon <= 360; lon += 2) {
      pts.push(latLonToVec3(lat, lon - 180, r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, lat === 0 ? matEq : matMain);
    g.add(line);
  }
  // meridians every 15°
  for (let lon = -180; lon < 180; lon += 15) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 2) {
      pts.push(latLonToVec3(lat, lon, r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, lon === 0 ? matEq : matMain);
    g.add(line);
  }
  return g;
}
globe.add(buildGraticule());

// (3) continent outlines — drawn from a simplified GeoJSON-ish polyline set
// We don't ship a heavy file; instead we use a built-in coarse outline.
async function loadContinentOutlines() {
  try {
    // Natural Earth 110m simplified - via a small public source
    // Fall back gracefully if blocked
    const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json");
    if (!res.ok) throw new Error("no atlas");
    const topology = await res.json();
    // we'll need topojson — but to keep zero deps, we'll instead use a tiny manual polyline
    // file. So skip this path. Keep this here for the offline-friendly version.
  } catch (e) {
    // intentionally silent — graticule alone looks fine
  }
}
// We pull a small precomputed land outline (GeoJSON line features) from a CDN.
async function loadLandLines() {
  try {
    const url = "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_coastline.json";
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const mat = new THREE.LineBasicMaterial({ color: 0x5a4f43, transparent: true, opacity: 0.75 });
    const r = GLOBE_R * 1.001;
    const grp = new THREE.Group();
    for (const f of data.features) {
      const geom = f.geometry;
      const lines = geom.type === "LineString" ? [geom.coordinates] :
                    geom.type === "MultiLineString" ? geom.coordinates : [];
      for (const line of lines) {
        const pts = line.map(([lon, lat]) => latLonToVec3(lat, lon, r));
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        grp.add(new THREE.Line(g, mat));
      }
    }
    globe.add(grp);
  } catch (e) {
    console.warn("land outlines unavailable", e);
  }
}
loadLandLines();

// Country borders (political): drawn slightly above coastlines with a
// fainter, cooler tone. Natural Earth 110m simplified — about 250KB,
// 240+ countries. Polygons are decomposed into line loops.
async function loadCountryBorders() {
  const candidates = [
    "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json",
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const mat = new THREE.LineBasicMaterial({
        color: 0x8a7e6c, transparent: true, opacity: 0.30,
      });
      const r = GLOBE_R * 1.0011;   // slightly above the coastline (1.001)
      const grp = new THREE.Group();
      for (const f of data.features) {
        const geom = f.geometry;
        // each country may be Polygon or MultiPolygon; we just need the rings
        const polys = geom.type === "Polygon" ? [geom.coordinates] :
                      geom.type === "MultiPolygon" ? geom.coordinates : [];
        for (const poly of polys) {
          // poly = [outerRing, hole1, hole2, ...]; we draw all rings
          for (const ring of poly) {
            const pts = ring.map(([lon, lat]) => latLonToVec3(lat, lon, r));
            const g = new THREE.BufferGeometry().setFromPoints(pts);
            grp.add(new THREE.Line(g, mat));
          }
        }
      }
      globe.add(grp);
      return;  // first successful source wins
    } catch (e) {
      // try next
    }
  }
  console.warn("country borders unavailable from any source");
}
loadCountryBorders();

// (4) faint outer halo
const haloGeo = new THREE.SphereGeometry(GLOBE_R * 1.06, 64, 32);
const haloMat = new THREE.MeshBasicMaterial({
  color: 0xc8b89a, transparent: true, opacity: 0.10, side: THREE.BackSide,
});
globe.add(new THREE.Mesh(haloGeo, haloMat));

// ---------- vine service ----------
// Hover-triggered: when the user hovers a data point, a curved
// vine grows out, spelling the work's title character-by-character
// along the curve, with color fading from moss (root) to the
// work's fire-color (tip). See vine.js for the full module.
if (window.AtlasVineService) {
  AtlasVineService.init({
    THREE,
    scene: globe,          // parent under the globe so it rotates with it
    globeRadius: GLOBE_R,
  });
}

// ---------- data points ----------
const pointGeo = new THREE.SphereGeometry(0.008, 12, 12);
const hotColor  = new THREE.Color(0x9d2933);  // cinnabar — hover/active
const userTint  = new THREE.Color(0x4a5d3a);  // moss — user-added (a subtle base tint)

/* Halo textures — two layers per point for richer, softer edges:
 *   - inner: bright concentrated core that fades fast (like an ember)
 *   - outer: very faint wide aura that bleeds into the paper (like ink)
 * We render the inner over the outer with additive blending so colors
 * intermingle naturally. */
function makeGlowTexture(stops) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  for (const [t, color] of stops) grd.addColorStop(t, color);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
  return tex;
}
// inner: bright core, narrow falloff
const glowTexInner = makeGlowTexture([
  [0.00, "rgba(255,255,255,1)"],
  [0.18, "rgba(255,255,255,.78)"],
  [0.45, "rgba(255,255,255,.22)"],
  [0.85, "rgba(255,255,255,.02)"],
  [1.00, "rgba(255,255,255,0)"],
]);
// outer: very faint wide aura, like ink bleeding into paper
const glowTexOuter = makeGlowTexture([
  [0.00, "rgba(255,255,255,.32)"],
  [0.25, "rgba(255,255,255,.22)"],
  [0.55, "rgba(255,255,255,.10)"],
  [0.85, "rgba(255,255,255,.02)"],
  [1.00, "rgba(255,255,255,0)"],
]);

/* Color resolution per book:
 *   - Built-in works:  AtlasColorService maps year → temperature color
 *   - User-added:      moss base tint (the user's personal palette);
 *                      if the user-entered year is valid we still mix
 *                      a little color-service hue to maintain temporal
 *                      coherence.
 */
function colorFor(book) {
  if (book.__user) {
    // moss with a hint of temperature
    if (window.AtlasColorService && book.year) {
      const c = AtlasColorService.colorForYear(book.year);
      const cs = new THREE.Color(c.hex);
      const out = new THREE.Color();
      out.r = userTint.r * 0.7 + cs.r * 0.3;
      out.g = userTint.g * 0.7 + cs.g * 0.3;
      out.b = userTint.b * 0.7 + cs.b * 0.3;
      return out;
    }
    return userTint.clone();
  }
  if (window.AtlasColorService) {
    return new THREE.Color(AtlasColorService.colorForYear(book.year).hex);
  }
  return new THREE.Color(0x6b4226);  // safe fallback
}

function rebuildPoints() {
  // remove existing
  for (const p of SCENE_POINTS) {
    globe.remove(p.mesh);
    globe.remove(p.stalk);
    if (p.halo) globe.remove(p.halo);
    if (p.aura) globe.remove(p.aura);
  }
  SCENE_POINTS = [];

  BOOKS.forEach((b, idx) => {
    const baseC = colorFor(b);

    // per-point hue/value jitter — small but enough so 109 points don't
    // look identically minted. Seeded by the book so it's stable.
    const seed = (Math.abs(hashStr(b.title + b.author)) % 10000) / 10000;
    const hsl = { h: 0, s: 0, l: 0 };
    baseC.getHSL(hsl);
    hsl.h = (hsl.h + (seed - 0.5) * 0.04 + 1) % 1;          // ±0.02 hue
    hsl.l = Math.max(0.10, Math.min(0.85, hsl.l + (seed - 0.5) * 0.10));  // ±0.05 light
    const c = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);

    // core dot — small and opaque-ish; the halos do most of the visual work
    const mat = new THREE.MeshBasicMaterial({ color: c.clone(), transparent: true });
    const m = new THREE.Mesh(pointGeo, mat);
    const v = latLonToVec3(b.lat, b.lon, POINT_R);
    m.position.copy(v);
    m.userData.idx = idx;
    globe.add(m);

    // outer aura — very faint wide bleed, gives the ink-on-paper feel
    const auraMat = new THREE.SpriteMaterial({
      map: glowTexOuter,
      color: c.clone(),
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const aura = new THREE.Sprite(auraMat);
    aura.position.copy(v);
    aura.scale.set(0.13, 0.13, 1);
    aura.userData.idx = idx;
    globe.add(aura);

    // inner halo — concentrated breathing ember
    const haloMat = new THREE.SpriteMaterial({
      map: glowTexInner,
      color: c.clone(),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.position.copy(v);
    halo.scale.set(0.05, 0.05, 1);
    halo.userData.idx = idx;
    globe.add(halo);

    // little stalk
    const innerV = latLonToVec3(b.lat, b.lon, GLOBE_R * 1.0005);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([innerV, v]);
    const lineMat = new THREE.LineBasicMaterial({ color: c.getHex(), transparent: true, opacity: 0.30 });
    const stalk = new THREE.Line(lineGeo, lineMat);
    globe.add(stalk);

    SCENE_POINTS.push({
      mesh: m, halo, haloMat, aura, auraMat, stalk, mat, lineMat,
      book: b, idx, visible: true,
      // store the jittered color so hover-out restores to the right tint
      jitterColor: c.clone(),
      // pulse phase per book (so they don't all breathe in sync)
      pulsePhase: (Math.abs(hashStr(b.title + b.author)) % 1000) / 1000 * Math.PI * 2,
      // alive flag: dimmed by the timeline if year > slider value
      alive: true,
      // current target opacity for fading in/out under timeline control
      targetVisible: 1.0,
      currentVisible: 1.0,
    });
  });

  // If the timeline has already been initialized, immediately reconcile
  // alive state without firing ink washes (this is a structural rebuild,
  // not a temporal transition).
  if (typeof reconcileTimelineSilently === "function") {
    reconcileTimelineSilently();
  }
}

// tiny deterministic hash for pulse phase
function hashStr(s) {
  s = String(s);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function applyFilter() {
  const q = filterQuery.trim().toLowerCase();
  for (const p of SCENE_POINTS) {
    let visible = true;
    if (filterRegion && regionOf(p.book) !== filterRegion) visible = false;
    if (q) {
      const b = p.book;
      // model: fuzzy match against EVERY text field
      const hay = [
        b.title, b.author, b.author_bio,
        b.writing_location, b.nationality, b.active_city,
        b.year, b.field, b.summary,
        (b.tags || []).join(' ')
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) visible = false;
    }
    p.visible = visible;
    p.mesh.visible = visible && p.alive !== false;
    p.stalk.visible = visible && p.alive !== false;
    if (p.halo) p.halo.visible = visible && p.alive !== false;
    if (p.aura) p.aura.visible = visible && p.alive !== false;
  }
  // if the currently-hovered point became hidden, retract its vine
  if (hoverIdx !== -1 && SCENE_POINTS[hoverIdx] && !SCENE_POINTS[hoverIdx].visible) {
    disposeVineFor(hoverIdx);
  }
  updateMeta();
}

function updateMeta() {
  // count points that pass BOTH filter (visible) AND timeline (alive)
  const visibleBooks = SCENE_POINTS.filter(p => p.visible && p.alive !== false).map(p => p.book);
  document.getElementById("count").textContent = visibleBooks.length;
  const countries = new Set(visibleBooks.map(b => (b.nationality||'').split('/')[0].trim()));
  document.getElementById("countries").textContent = countries.size;
}

// ---------- raycasting / hover ----------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoverIdx = -1;

function onMouseMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const meshes = SCENE_POINTS.filter(p => p.visible).map(p => p.mesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length > 0) {
    const idx = hits[0].object.userData.idx;
    if (idx !== hoverIdx) {
      // hover changed: retract previous vine, grow new one
      if (hoverIdx !== -1) disposeVineFor(hoverIdx);
      hoverIdx = idx;
      showTooltip(BOOKS[idx], e.clientX, e.clientY);
      updateHoverHighlight();
      spawnVineFor(idx);
    } else {
      // just reposition tooltip
      placeTooltip(e.clientX, e.clientY);
    }
    STAGE.style.cursor = "pointer";
  } else {
    if (hoverIdx !== -1) {
      disposeVineFor(hoverIdx);
      hoverIdx = -1;
      hideTooltip();
      updateHoverHighlight();
    }
    STAGE.style.cursor = drag.active ? "grabbing" : "grab";
  }
}

/* ---------- vine spawn/dispose helpers ---------- */
// We key vines by point index. Spawn pulls the title + the
// year-derived fire color; dispose triggers the retraction animation.
function spawnVineFor(idx) {
  if (!window.AtlasVineService) return;
  const p = SCENE_POINTS[idx];
  if (!p || !p.alive) return;             // don't grow on dimmed/dead points
  if (!p.visible) return;                  // don't grow on filtered-out points
  const b = p.book;
  const title = String(b.title || "").trim();
  if (!title) return;
  const tipHex = (window.AtlasColorService
    ? AtlasColorService.colorForYear(b.year).hex
    : 0x9d2933);
  AtlasVineService.spawn("pt:" + idx, {
    lat: b.lat,
    lon: b.lon,
    text: title,
    tipColorHex: tipHex,
  });
}
function disposeVineFor(idx) {
  if (!window.AtlasVineService) return;
  AtlasVineService.dispose("pt:" + idx);
}

function updateHoverHighlight() {
  for (const p of SCENE_POINTS) {
    const isHover = p.idx === hoverIdx;
    const isActive = p.idx === activeIdx;
    // for hover-out, restore to the per-point jittered color (richer
    // than the un-jittered baseline from colorFor)
    const base = p.jitterColor || colorFor(p.book);
    if (isActive) {
      p.mat.color.copy(hotColor);
      if (p.haloMat) p.haloMat.color.copy(hotColor);
      if (p.auraMat) p.auraMat.color.copy(hotColor);
      p.mesh.scale.setScalar(1.8);
    } else if (isHover) {
      p.mat.color.copy(hotColor);
      if (p.haloMat) p.haloMat.color.copy(hotColor);
      if (p.auraMat) p.auraMat.color.copy(hotColor);
      p.mesh.scale.setScalar(1.5);
    } else {
      p.mat.color.copy(base);
      if (p.haloMat) p.haloMat.color.copy(base);
      if (p.auraMat) p.auraMat.color.copy(base);
      p.mesh.scale.setScalar(1.0);
    }
  }
}

function showTooltip(b, x, y) {
  document.getElementById("tt-title").textContent = b.title;
  document.getElementById("tt-author").textContent = b.author;
  const place = b.writing_location || b.active_city || b.nationality || "";
  document.getElementById("tt-meta").textContent = `${b.year || ''} · ${localize(place)}`;
  TOOLTIP.classList.add("show");
  placeTooltip(x, y);
}
function placeTooltip(x, y) {
  const pad = 14;
  const tw = TOOLTIP.offsetWidth, th = TOOLTIP.offsetHeight;
  let lx = x + pad, ly = y + pad;
  if (lx + tw > window.innerWidth - 8)  lx = x - pad - tw;
  if (ly + th > window.innerHeight - 8) ly = y - pad - th;
  TOOLTIP.style.left = lx + "px";
  TOOLTIP.style.top  = ly + "px";
}
function hideTooltip() { TOOLTIP.classList.remove("show"); }

// ---------- click → open card ----------
function onClick(e) {
  if (drag.didDrag) return;
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const meshes = SCENE_POINTS.filter(p => p.visible).map(p => p.mesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length > 0) {
    const idx = hits[0].object.userData.idx;
    openCard(idx);
    rotateGlobeTo(BOOKS[idx].lat, BOOKS[idx].lon);
  }
}

// ---------- card ----------
function openCard(idx) {
  activeIdx = idx;
  const b = BOOKS[idx];
  updateHoverHighlight();

  const folio = b.__user
    ? `your footprint · 我的足迹 № ${b.__userNum || ''}`
    : `№ ${String(idx + 1).padStart(3, "0")} / ${String(BOOKS.length).padStart(3,"0")}`;
  document.getElementById("folio").innerHTML = `${folio}<span class="sep">·</span>${b.field || ''}`;
  document.getElementById("c-folio-bottom").textContent = folio;

  document.getElementById("c-title").textContent = b.title;
  document.getElementById("c-author").textContent = b.author;
  renderParagraphs(document.getElementById("c-bio"), b.author_bio || '');
  renderParagraphs(document.getElementById("c-summary"), b.summary || '');
  document.getElementById("c-field").textContent = b.field || '—';
  document.getElementById("c-year").textContent = b.year || '—';
  document.getElementById("c-writing-loc").textContent = localize(b.writing_location);
  document.getElementById("c-active").textContent = localize(b.active_city);
  document.getElementById("c-nat").textContent = localize(b.nationality);
  document.getElementById("c-coord").textContent = `${(+b.lat).toFixed(3)}°, ${(+b.lon).toFixed(3)}°`;

  const tagsBox = document.getElementById("c-tags");
  tagsBox.innerHTML = "";
  for (const t of (b.tags || [])) {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = t;
    tagsBox.appendChild(el);
  }

  // wikipedia link & image
  const authorClean = b.author.split('(')[0].split('/')[0].trim();
  const wiki = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(authorClean)}`;
  document.getElementById("c-wiki").href = wiki;

  if (b.__user && b.image) {
    // user-uploaded picture
    const wrap = document.getElementById("c-img-wrap");
    const img  = document.getElementById("c-img");
    wrap.classList.remove("empty", "loading");
    img.src = b.image;
    img.style.display = "block";
  } else {
    fetchAuthorImage(authorClean);
  }

  CARD.classList.add("open");
}

function closeCard() {
  CARD.classList.remove("open");
  activeIdx = -1;
  updateHoverHighlight();
}
document.getElementById("close-card").addEventListener("click", closeCard);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCard(); });

// ---------- author image via Wikipedia REST ----------
const IMG_CACHE = new Map();
async function fetchAuthorImage(name) {
  const wrap = document.getElementById("c-img-wrap");
  const img  = document.getElementById("c-img");
  img.style.display = "none";
  wrap.classList.remove("empty");
  wrap.classList.add("loading");

  // try cache
  if (IMG_CACHE.has(name)) {
    const url = IMG_CACHE.get(name);
    wrap.classList.remove("loading");
    if (url) {
      img.src = url; img.style.display = "block";
    } else {
      wrap.classList.add("empty");
    }
    return;
  }

  const candidates = [name];
  // also try without diacritics fallback
  const ascii = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (ascii !== name) candidates.push(ascii);

  let url = null;
  for (const lang of ["en", "zh"]) {
    for (const cand of candidates) {
      try {
        const api = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cand.replace(/ /g, "_"))}`;
        const res = await fetch(api);
        if (!res.ok) continue;
        const data = await res.json();
        const thumb = (data.thumbnail && data.thumbnail.source) || (data.originalimage && data.originalimage.source);
        if (thumb) { url = thumb; break; }
      } catch (e) {}
    }
    if (url) break;
  }

  IMG_CACHE.set(name, url);
  wrap.classList.remove("loading");
  if (url) {
    img.src = url; img.style.display = "block";
  } else {
    wrap.classList.add("empty");
  }
}

// ---------- pointer rotation ----------
const drag = {
  active: false,
  didDrag: false,
  lastX: 0, lastY: 0,
  velX: 0, velY: 0,
};
const target = { rotY: 0, rotX: 0 }; // desired rotation
let zoom = 3.2;

STAGE.addEventListener("pointerdown", (e) => {
  drag.active = true;
  drag.didDrag = false;
  drag.lastX = e.clientX; drag.lastY = e.clientY;
  drag.velX = drag.velY = 0;
  STAGE.classList.add("dragging");
});
window.addEventListener("pointermove", (e) => {
  onMouseMove(e);
  if (!drag.active) return;
  const dx = e.clientX - drag.lastX;
  const dy = e.clientY - drag.lastY;
  if (Math.abs(dx) + Math.abs(dy) > 3) drag.didDrag = true;
  drag.lastX = e.clientX; drag.lastY = e.clientY;
  target.rotY += dx * 0.005;
  target.rotX += dy * 0.005;
  target.rotX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, target.rotX));
  drag.velX = dx * 0.005;
  drag.velY = dy * 0.005;
});
window.addEventListener("pointerup", () => {
  drag.active = false;
  STAGE.classList.remove("dragging");
});

STAGE.addEventListener("click", onClick);

STAGE.addEventListener("wheel", (e) => {
  e.preventDefault();
  zoom += e.deltaY * 0.002;
  zoom = Math.max(1.6, Math.min(5.5, zoom));
}, { passive: false });

// rotate target so a (lat, lon) faces the camera.
//
// Camera sits at (0, 0, +z) looking at origin. The globe is rotated
// in order Rx * Ry (default three.js euler order), so a point at local
// position v ends up at world position Rx(rotX) * Ry(rotY) * v.
//
// Deriving the angles by solving Rx*Ry*v = (0,0,r):
//   v_local(lat,lon) = ( r cos(lat)cos(lon), r sin(lat), -r cos(lat)sin(lon) )
//   target.rotY = -(lon + 90)°  in radians   ← brings the meridian to face camera
//   target.rotX = lat°           in radians   ← tilts to the right parallel
function rotateGlobeTo(lat, lon) {
  let ty = -(lon * Math.PI / 180) - Math.PI / 2;
  const tx =  (lat * Math.PI / 180);

  // ease takes the shortest angular path: normalize ty so it's within
  // π of the current rotY (otherwise easing might unwind the long way)
  const TAU = Math.PI * 2;
  while (ty - globe.rotation.y >  Math.PI) ty -= TAU;
  while (ty - globe.rotation.y < -Math.PI) ty += TAU;

  target.rotY = ty;
  target.rotX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, tx));
  // pause autospin so the move is visible
  auto = false;
  lastUserAt = performance.now();
}

// ---------- animate ----------
let auto = true;
let lastUserAt = performance.now();
window.addEventListener("pointerdown", () => { auto = false; lastUserAt = performance.now(); });
window.addEventListener("wheel",        () => { auto = false; lastUserAt = performance.now(); });
SEARCH.addEventListener("focus",        () => { auto = false; lastUserAt = performance.now(); });

/* ============ ink-wash ripple effect ============
 * When the timeline crosses a point's year (forward direction),
 * we spawn a brief expanding ring at that point. Visually: like a
 * drop of ink hitting paper and spreading.
 *
 *   - geometry: a thin ring sprite using a generated ring texture
 *   - lifetime: ~900ms
 *   - the ring scales up from ~0.04 to ~0.20 while fading
 *
 * (Defined BEFORE animate() so the animate loop can reference
 *  INK_WASHES without hitting the temporal-dead-zone — `const`/`let`
 *  bindings are not hoisted the way `function` declarations are.)
 */
const INK_WASHES = [];
const ringTex = (() => {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grd.addColorStop(0.00, "rgba(255,255,255,0)");
  grd.addColorStop(0.55, "rgba(255,255,255,0)");
  grd.addColorStop(0.72, "rgba(255,255,255,.9)");
  grd.addColorStop(0.86, "rgba(255,255,255,.35)");
  grd.addColorStop(1.00, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace || t.colorSpace;
  return t;
})();

function spawnInkWash(point) {
  // cap simultaneous washes so a fast drag doesn't drown the scene
  if (INK_WASHES.length >= 24) return;
  const mat = new THREE.SpriteMaterial({
    map: ringTex,
    color: colorFor(point.book),
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.position.copy(point.mesh.position);
  sprite.scale.set(0.04, 0.04, 1);
  globe.add(sprite);
  INK_WASHES.push({
    sprite,
    mat,
    born: performance.now() * 0.001,
    duration: 0.9,
  });
}

function updateInkWashes(tNow) {
  for (let i = INK_WASHES.length - 1; i >= 0; i--) {
    const w = INK_WASHES[i];
    const age = tNow - w.born;
    const u = age / w.duration;
    if (u >= 1) {
      globe.remove(w.sprite);
      w.mat.dispose();
      INK_WASHES.splice(i, 1);
      continue;
    }
    // ease-out scale, ease-out fade
    const eo = 1 - Math.pow(1 - u, 2);
    const s = 0.04 + (0.20 - 0.04) * eo;
    w.sprite.scale.set(s, s, 1);
    w.mat.opacity = 0.85 * (1 - eo);
  }
}

let lastFrameMs = performance.now();
function animate() {
  requestAnimationFrame(animate);

  const nowMs = performance.now();
  const dt = Math.min((nowMs - lastFrameMs) * 0.001, 0.1);  // clamp to 100ms to survive tab-resume
  lastFrameMs = nowMs;
  const tNow = nowMs * 0.001;  // seconds

  // resume autospin after idle ~6s
  if (!auto && performance.now() - lastUserAt > 6000 && activeIdx === -1) {
    auto = true;
  }
  if (auto && !drag.active && activeIdx === -1) {
    target.rotY += 0.0015;
  }

  // ease toward target
  globe.rotation.y += (target.rotY - globe.rotation.y) * 0.10;
  globe.rotation.x += (target.rotX - globe.rotation.x) * 0.10;
  camera.position.z += (zoom - camera.position.z) * 0.10;

  // ---- per-point breathing (halo pulse) and timeline crossfade ----
  for (const p of SCENE_POINTS) {
    if (!p.halo) continue;

    // ease currentVisible toward targetVisible (for timeline fade in/out)
    p.currentVisible += (p.targetVisible - p.currentVisible) * 0.12;

    // breathing: gentle sine modulation per-point phase
    const phase = p.pulsePhase || 0;
    const breath = 0.5 + 0.5 * Math.sin(tNow * 1.4 + phase);  // 0..1
    // aura breathes slower and phase-shifted, giving a layered shimmer
    const auraBreath = 0.5 + 0.5 * Math.sin(tNow * 0.9 + phase * 1.3 + 1.1);

    const baseScale  = 0.040;
    const peakScale  = 0.072;
    const baseAlpha  = 0.28;
    const peakAlpha  = 0.62;

    const isHot = (p.idx === hoverIdx) || (p.idx === activeIdx);
    const heat = isHot ? 1.35 : 1.0;

    const s = (baseScale + (peakScale - baseScale) * breath) * heat;
    const a = (baseAlpha + (peakAlpha - baseAlpha) * breath) * p.currentVisible;

    p.halo.scale.set(s, s, 1);
    p.haloMat.opacity = a;

    // outer aura: larger scale, much lower opacity, breathes independently
    if (p.aura && p.auraMat) {
      const auraS = (0.105 + 0.045 * auraBreath) * heat;
      const auraA = (0.16 + 0.18 * auraBreath) * p.currentVisible;
      p.aura.scale.set(auraS, auraS, 1);
      p.auraMat.opacity = auraA;
    }

    // core dot subtle pulse: ±8%
    const dotScale = (isHot ? p.mesh.scale.x : (0.92 + 0.16 * breath));
    if (!isHot) p.mesh.scale.setScalar(dotScale);

    // fade core + stalk under timeline control
    if (p.mat.opacity !== undefined) {
      p.mat.transparent = true;
      p.mat.opacity = p.currentVisible;
    }
    if (p.lineMat) {
      p.lineMat.opacity = 0.30 * p.currentVisible;
    }
    // when fully faded, also hide hard (raycaster won't pick it)
    const reallyVisible = p.visible && p.currentVisible > 0.04;
    p.mesh.visible  = reallyVisible;
    p.stalk.visible = reallyVisible;
    p.halo.visible  = reallyVisible;
    if (p.aura) p.aura.visible = reallyVisible;
  }

  // ---- ink-wash effects (year-crossing reactions) ----
  updateInkWashes(tNow);

  // ---- vines (hover-grown text along curves) ----
  if (window.AtlasVineService) AtlasVineService.update(dt);

  renderer.render(scene, camera);
}
animate();

// ---------- resize ----------
window.addEventListener("resize", () => {
  const w = STAGE.clientWidth, h = STAGE.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ---------- search + region chips ----------
SEARCH.addEventListener("input", (e) => {
  filterQuery = e.target.value;
  applyFilter();
});

function buildRegionChips() {
  const regions = ["欧洲","北美","拉美","亚洲","非洲","大洋洲","加勒比"];
  // ALL chip
  const all = document.createElement("button");
  all.className = "chip active";
  all.textContent = "all · 全部";
  all.dataset.region = "";
  REGION_CHIPS.appendChild(all);
  for (const r of regions) {
    const c = document.createElement("button");
    c.className = "chip";
    c.textContent = r;
    c.dataset.region = r;
    REGION_CHIPS.appendChild(c);
  }
  REGION_CHIPS.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    [...REGION_CHIPS.children].forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    filterRegion = btn.dataset.region || null;
    applyFilter();
  });
}

// ---------- load CSV ----------
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    BOOKS = results.data.map(r => ({
      title: r.title,
      author: r.author,
      author_bio: r.author_bio,
      writing_location: r.writing_location,
      nationality: r.nationality,
      active_city: r.active_city,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      year: r.year,
      field: r.field,
      summary: r.summary,
      tags: parseTags(r.tags),
    })).filter(r => Number.isFinite(r.lat) && Number.isFinite(r.lon));

    // merge in user-saved entries from localStorage
    const userBooks = loadUserBooks();
    userBooks.forEach((u, i) => { u.__user = true; u.__userNum = i + 1; });
    BOOKS = BOOKS.concat(userBooks);

    rebuildPoints();
    buildRegionChips();
    updateMeta();
    renderUserList();

    // hide splash
    setTimeout(() => SPLASH.classList.add("gone"), 250);
  },
  error: (err) => {
    SPLASH.querySelector(".sub").textContent = "Failed to load CSV. 请通过本地 server 打开。";
    console.error(err);
  }
});

/* =========================================================
 *  FOOTPRINT MODULE — local-only entries
 *    storage:    localStorage["atlas:user-books"] -> JSON array
 *    new book:   form input + pick-on-globe + image compress
 *    listing:    inside form panel, click to focus / delete
 * ========================================================= */

const STORAGE_KEY = "atlas:user-books-v1";
const FORM_PANEL  = document.getElementById("form-panel");
const PICK_BANNER = document.getElementById("pick-banner");

let pickMode = false;

function loadUserBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function saveUserBooks(arr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    return true;
  } catch (e) {
    // probably quota exceeded
    console.error("storage failed", e);
    return false;
  }
}

/* ----- image: load → compress → base64 (max ~400px, ~80 KB) ----- */
function compressImage(file, maxDim = 400, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    if (file.size > 500 * 1024 * 4) {
      reject(new Error("图片过大,请选择 2MB 以内的图片"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("无法读取图片"));
    reader.onload  = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("无法解析图片"));
      img.onload  = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width  = Math.round(width  * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        // jpeg is more compact for photos
        const out = canvas.toDataURL("image/jpeg", quality);
        resolve(out);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ----- form open / close ----- */
const formEl     = document.getElementById("footprint-form");
const formError  = document.getElementById("form-error");
const imgInput   = document.getElementById("image-input");
const imgDrop    = document.getElementById("image-drop");
const imgPreview = document.getElementById("image-preview");
const imgPh      = document.getElementById("image-placeholder");
const imgRemove  = document.getElementById("image-remove");
const latInput   = document.getElementById("form-lat");
const lonInput   = document.getElementById("form-lon");
const coordHint  = document.getElementById("coord-hint");
const pickBtn    = document.getElementById("pick-on-globe-btn");

let currentImageData = null;   // base64 string or null
let editingId = null;          // for future use

function openForm() {
  if (CARD.classList.contains("open")) closeCard();
  FORM_PANEL.classList.add("open");
  renderUserList();
}
function closeForm() {
  FORM_PANEL.classList.remove("open");
  exitPickMode();
}

document.getElementById("open-add-btn").addEventListener("click", openForm);
document.getElementById("close-form").addEventListener("click", closeForm);
document.getElementById("form-cancel").addEventListener("click", () => {
  resetForm();
  closeForm();
});

/* ----- image upload bindings ----- */
imgDrop.addEventListener("click", (e) => {
  if (e.target === imgRemove) return;
  imgInput.click();
});
imgInput.addEventListener("change", async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  try {
    const b64 = await compressImage(f);
    currentImageData = b64;
    imgPreview.src = b64;
    imgPreview.style.display = "block";
    imgPh.style.display = "none";
    imgRemove.style.display = "flex";
  } catch (err) {
    formError.textContent = err.message || String(err);
  }
});
imgRemove.addEventListener("click", (e) => {
  e.stopPropagation();
  currentImageData = null;
  imgPreview.src = "";
  imgPreview.style.display = "none";
  imgPh.style.display = "flex";
  imgRemove.style.display = "none";
  imgInput.value = "";
});

// drag & drop
["dragenter","dragover"].forEach(ev => imgDrop.addEventListener(ev, (e) => {
  e.preventDefault(); imgDrop.classList.add("dragging");
}));
["dragleave","drop"].forEach(ev => imgDrop.addEventListener(ev, (e) => {
  e.preventDefault(); imgDrop.classList.remove("dragging");
}));
imgDrop.addEventListener("drop", async (e) => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (!f) return;
  try {
    const b64 = await compressImage(f);
    currentImageData = b64;
    imgPreview.src = b64;
    imgPreview.style.display = "block";
    imgPh.style.display = "none";
    imgRemove.style.display = "flex";
  } catch (err) {
    formError.textContent = err.message || String(err);
  }
});

/* ----- pick-on-globe mode ----- */
function enterPickMode() {
  pickMode = true;
  pickBtn.classList.add("active");
  pickBtn.querySelector("span").textContent = "在地球上点击 …";
  PICK_BANNER.classList.add("show");
  STAGE.classList.add("picking");
  // keep form panel open but slightly de-emphasize? — easier: leave open.
}
function exitPickMode() {
  pickMode = false;
  pickBtn.classList.remove("active");
  pickBtn.querySelector("span").textContent = "在地球上选点";
  PICK_BANNER.classList.remove("show");
  STAGE.classList.remove("picking");
}
pickBtn.addEventListener("click", () => {
  if (pickMode) exitPickMode(); else enterPickMode();
});
document.getElementById("pick-cancel").addEventListener("click", exitPickMode);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && pickMode) exitPickMode();
});

/* hook into globe click — done via a separate event listener that runs BEFORE
 * the normal onClick (registered on STAGE). We listen with capture=true
 * and stop propagation when in pick mode. */
STAGE.addEventListener("click", (e) => {
  if (!pickMode) return;
  if (drag.didDrag) return;  // a rotate gesture shouldn't be treated as a pick
  e.stopPropagation();
  // raycast against the globe sphere itself
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(sphereMesh, false);
  if (hits.length === 0) return;
  // hits[0].point is in world space — transform into globe-local space
  const localPoint = globe.worldToLocal(hits[0].point.clone());
  const { lat, lon } = vec3ToLatLon(localPoint);
  latInput.value = lat.toFixed(4);
  lonInput.value = lon.toFixed(4);
  coordHint.textContent = `selected · 已选 ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  exitPickMode();
}, true);   // capture phase so we run before stage's normal click handler

/* ----- form reset / read ----- */
function resetForm() {
  formEl.reset();
  currentImageData = null;
  imgPreview.src = "";
  imgPreview.style.display = "none";
  imgPh.style.display = "flex";
  imgRemove.style.display = "none";
  formError.textContent = "";
  coordHint.textContent = "填入数字或在地球上点击";
  editingId = null;
}

function readForm() {
  const fd = new FormData(formEl);
  const obj = {};
  for (const [k, v] of fd.entries()) obj[k] = String(v || "").trim();
  // parse / sanitize
  obj.lat = parseFloat(obj.lat);
  obj.lon = parseFloat(obj.lon);
  obj.year = obj.year ? String(parseInt(obj.year, 10)) : "";
  obj.tags = parseTags(obj.tags);
  if (currentImageData) obj.image = currentImageData;
  obj.id = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  obj.createdAt = new Date().toISOString();
  return obj;
}

function validate(o) {
  if (!o.title)  return "请填写书名";
  if (!o.author) return "请填写作者";
  if (!Number.isFinite(o.lat) || o.lat < -90 || o.lat > 90)
    return "请填写有效的纬度 (-90 至 90)";
  if (!Number.isFinite(o.lon) || o.lon < -180 || o.lon > 180)
    return "请填写有效的经度 (-180 至 180)";
  return null;
}

/* ----- submit ----- */
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  formError.textContent = "";
  const obj = readForm();
  const err = validate(obj);
  if (err) { formError.textContent = err; return; }

  // save
  const list = loadUserBooks();
  list.push(obj);
  const ok = saveUserBooks(list);
  if (!ok) {
    formError.textContent = "保存失败:浏览器存储已满,请删除部分图片或条目";
    return;
  }

  // append to in-memory BOOKS, redraw
  obj.__user = true;
  obj.__userNum = list.length;
  BOOKS.push(obj);
  rebuildPoints();
  applyFilter();   // respects current search/region
  updateMeta();
  renderUserList();

  // celebrate: rotate to it, open the new card
  rotateGlobeTo(obj.lat, obj.lon);
  const newIdx = BOOKS.length - 1;
  setTimeout(() => {
    resetForm();
    closeForm();
    openCard(newIdx);
  }, 220);
});

/* ----- listing ----- */
function renderUserList() {
  const list = loadUserBooks();
  document.getElementById("user-count").textContent = list.length;
  const wrap = document.getElementById("user-entries-list");
  wrap.innerHTML = "";
  list.forEach((u, i) => {
    const row = document.createElement("div");
    row.className = "user-entry-item";
    row.innerHTML = `
      <span class="dot"></span>
      <span class="meta">
        <span class="t"></span>
        <span class="a"></span>
      </span>
      <button class="del" title="delete" aria-label="delete">×</button>
    `;
    row.querySelector(".t").textContent = u.title || "(untitled)";
    row.querySelector(".a").textContent = `${u.author || "—"} · ${(+u.lat).toFixed(2)}°, ${(+u.lon).toFixed(2)}°`;
    row.addEventListener("click", (e) => {
      if (e.target.classList.contains("del")) return;
      // find this in BOOKS by id, open card
      const idx = BOOKS.findIndex(b => b.__user && b.id === u.id);
      if (idx >= 0) {
        rotateGlobeTo(BOOKS[idx].lat, BOOKS[idx].lon);
        openCard(idx);
      }
    });
    row.querySelector(".del").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm(`删除「${u.title || "(untitled)"}」?`)) return;
      const stored = loadUserBooks().filter(x => x.id !== u.id);
      saveUserBooks(stored);
      BOOKS = BOOKS.filter(b => !(b.__user && b.id === u.id));
      // renumber
      let n = 0;
      for (const b of BOOKS) if (b.__user) b.__userNum = ++n;
      rebuildPoints();
      applyFilter();
      updateMeta();
      renderUserList();
    });
    wrap.appendChild(row);
  });
}

document.getElementById("clear-all-btn").addEventListener("click", () => {
  if (!confirm("清除所有你添加的足迹?此操作不可撤销。")) return;
  saveUserBooks([]);
  BOOKS = BOOKS.filter(b => !b.__user);
  rebuildPoints();
  applyFilter();
  updateMeta();
  renderUserList();
});

/* =========================================================
 *  TIMELINE SLIDER — "a river of time"
 *
 *  The slider's value is "currentYear" T.
 *  A point is "alive" when its year ≤ T.
 *  When a point transitions from alive→dead or dead→alive,
 *  we spawn an ink wash at its location.
 *
 *  At the maximum (current year), all points are visible — the
 *  slider is fully "open" and doesn't filter anything.
 * ========================================================= */

const TIMELINE         = document.getElementById("timeline");
const TIMELINE_SLIDER  = document.getElementById("timeline-slider");
const TIMELINE_HANDLE  = document.getElementById("timeline-handle");
const TIMELINE_TICKS   = document.getElementById("timeline-ticks");
const TIMELINE_TRACK   = document.getElementById("timeline-track");
const YEAR_NOW         = document.getElementById("year-now");
const YEAR_DETAIL      = document.getElementById("year-detail");

const CURRENT_YEAR = new Date().getFullYear();
const TL_MIN = -700;
const TL_MAX = CURRENT_YEAR;
TIMELINE_SLIDER.min = String(TL_MIN);
TIMELINE_SLIDER.max = String(TL_MAX);
TIMELINE_SLIDER.value = String(TL_MAX);

// keep AtlasColorService synced to the same range
if (window.AtlasColorService) AtlasColorService.setRange(TL_MIN, TL_MAX);

let currentYearSel = TL_MAX;

/* ----- format helpers ----- */
function formatYear(y) {
  if (!Number.isFinite(y)) return "—";
  if (y < 0)   return `${Math.abs(y)} BCE`;
  if (y === 0) return "1 BCE";
  return String(y);
}
function eraOf(y) {
  if (!Number.isFinite(y)) return "";
  if (y < 500)   return "antiquity · 古典时代";
  if (y < 1500)  return "medieval · 中世纪";
  if (y < 1800)  return "early modern · 近代早期";
  if (y < 1900)  return "19th century · 十九世纪";
  if (y < 1945)  return "early 20c. · 二十世纪上半叶";
  if (y < 2000)  return "late 20c. · 二十世纪下半叶";
  return "contemporary · 当代";
}

/* ----- ticks ----- */
function buildTicks() {
  TIMELINE_TICKS.innerHTML = "";
  const span = TL_MAX - TL_MIN;
  function add(year, label, major) {
    const pct = ((year - TL_MIN) / span) * 100;
    const tick = document.createElement("div");
    tick.className = "tick" + (major ? " major" : "");
    tick.style.left = pct + "%";
    TIMELINE_TICKS.appendChild(tick);
    if (label) {
      const l = document.createElement("div");
      l.className = "label";
      l.style.left = pct + "%";
      l.textContent = label;
      TIMELINE_TICKS.appendChild(l);
    }
  }
  // labeled major ticks
  add(-600, "600 BCE", true);
  add(0,    "year 1",  true);
  add(1000, "1000",    true);
  add(1500, "1500",    true);
  add(1800, "1800",    true);
  add(1900, "1900",    true);
  add(2000, "2000",    true);
  // minor between
  add(-300, null, false);
  add(500,  null, false);
  add(1200, null, false);
  add(1700, null, false);
  add(1850, null, false);
  add(1950, null, false);
}
buildTicks();

/* ----- handle position ----- */
function syncHandle() {
  const span = TL_MAX - TL_MIN;
  const pct = ((currentYearSel - TL_MIN) / span) * 100;
  TIMELINE_HANDLE.style.left = pct + "%";
}

/* ----- timeline visibility apply ----- */
/* Iterates over points; toggles `alive` and `targetVisible`.
 * Newly-alive points trigger an ink wash at their location.
 * Built-in fallback: if a point has no valid year, treat as always alive. */
function applyTimeline() {
  const T = currentYearSel;
  YEAR_NOW.textContent = formatYear(T);
  YEAR_DETAIL.textContent =
    (T >= TL_MAX) ? "all works visible · 全部可见" : eraOf(T);

  for (const p of SCENE_POINTS) {
    const y = parseFloat(p.book.year);
    const hasYear = Number.isFinite(y);
    const shouldBeAlive = !hasYear || y <= T;

    if (shouldBeAlive !== p.alive) {
      // only spawn ink wash when a point comes alive (becoming dead is silent)
      if (shouldBeAlive && hasYear && p.visible) {
        spawnInkWash(p);
      }
      p.alive = shouldBeAlive;
    }
    p.targetVisible = shouldBeAlive ? 1.0 : 0.0;
  }
  // if the timeline buried the currently-hovered point, retract its vine
  if (hoverIdx !== -1 && SCENE_POINTS[hoverIdx] && !SCENE_POINTS[hoverIdx].alive) {
    disposeVineFor(hoverIdx);
  }
  updateMeta();
}

/* Silently snap all points to whatever the current slider year demands.
 * Used after rebuildPoints() so newly-created points pick up the
 * current timeline state without triggering ink-wash animations. */
function reconcileTimelineSilently() {
  const T = currentYearSel;
  for (const p of SCENE_POINTS) {
    const y = parseFloat(p.book.year);
    const hasYear = Number.isFinite(y);
    const alive = !hasYear || y <= T;
    p.alive = alive;
    p.targetVisible = alive ? 1.0 : 0.0;
    p.currentVisible = alive ? 1.0 : 0.0;  // snap; no fade
  }
}

/* ----- slider events ----- */
let sliderRafScheduled = false;
TIMELINE_SLIDER.addEventListener("input", (e) => {
  currentYearSel = parseInt(e.target.value, 10);
  syncHandle();
  // throttle to once per frame
  if (!sliderRafScheduled) {
    sliderRafScheduled = true;
    requestAnimationFrame(() => {
      sliderRafScheduled = false;
      applyTimeline();
    });
  }
});

document.getElementById("timeline-reset").addEventListener("click", () => {
  currentYearSel = TL_MAX;
  TIMELINE_SLIDER.value = String(TL_MAX);
  syncHandle();
  applyTimeline();
});

// also pause autospin while user is dragging the slider
TIMELINE_SLIDER.addEventListener("pointerdown", () => {
  auto = false; lastUserAt = performance.now();
});

// initial paint
syncHandle();
applyTimeline();

/* =========================================================
 *  AMBIENT MUSIC
 *
 *  Browser autoplay policy blocks audio.play() until the user
 *  interacts with the page. So:
 *    1) on first pointerdown/keydown/wheel, attempt play().
 *    2) provide a toggle button so the user can mute/unmute.
 *    3) persist preference to localStorage so it sticks across visits.
 *    4) start at a gentle 35% volume so it's atmospheric, not loud.
 * ========================================================= */
(function setupMusic() {
  const audio  = document.getElementById("bg-music");
  const button = document.getElementById("music-toggle");
  if (!audio || !button) {
    console.warn("[music] audio or button element not found in DOM");
    return;
  }

  const STORAGE_KEY = "atlas:music-muted";
  audio.volume = 0.35;
  audio.loop = true;

  // ---- diagnostic logging ----
  // We print every meaningful state change to the console with a [music]
  // prefix, so the user can paste them back if anything goes wrong.
  function log(...args) { console.log("[music]", ...args); }
  function warn(...args) { console.warn("[music]", ...args); }

  // Source-level errors don't bubble to <audio>. Listen on each <source>
  // to catch 404s, MIME mismatches, codec errors, etc.
  for (const src of audio.querySelectorAll("source")) {
    src.addEventListener("error", () => {
      warn("source failed to load:", src.src, "type:", src.type);
    });
  }

  // The audio element fires `error` only when ALL sources have failed.
  audio.addEventListener("error", () => {
    const err = audio.error;
    const codes = { 1: "ABORTED", 2: "NETWORK", 3: "DECODE", 4: "SRC_NOT_SUPPORTED" };
    warn("audio element error:", err ? `${err.code} (${codes[err.code]||"?"})` : "(no detail)");
    warn("→ no audio source could be loaded. check that music.mp3 exists in the same folder as index.html and is a valid MP3.");
    button.style.display = "none";
  });

  audio.addEventListener("loadedmetadata", () => {
    log(`loaded, duration ≈ ${audio.duration.toFixed(1)}s, src=${audio.currentSrc}`);
  });
  audio.addEventListener("play",  () => log("playing"));
  audio.addEventListener("pause", () => log("paused"));
  audio.addEventListener("stalled", () => warn("stalled (data not arriving)"));

  // ---- initial muted state ----
  const storedMuted = (() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; }
    catch { return false; }
  })();
  let muted = storedMuted;
  audio.muted = muted;
  button.setAttribute("data-muted", String(muted));
  log("init, stored mute pref =", muted);

  // ---- play attempt ----
  let started = false;
  function tryStart(why) {
    if (started) return;
    if (!audio.paused) { started = true; return; }
    log("attempting play(), trigger =", why);
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        started = true;
        log("play() resolved — music is rolling");
      }).catch((err) => {
        warn("play() rejected:", err && err.message ? err.message : err);
        warn("→ this usually means autoplay is still blocked. Try clicking the music button directly.");
      });
    }
  }

  // ---- first user gesture unlocks autoplay ----
  function onFirstGesture(e) {
    log("first user gesture:", e.type);
    tryStart(e.type);
    window.removeEventListener("pointerdown", onFirstGesture, true);
    window.removeEventListener("keydown",     onFirstGesture, true);
    window.removeEventListener("wheel",       onFirstGesture, true);
    window.removeEventListener("touchstart",  onFirstGesture, true);
  }
  window.addEventListener("pointerdown", onFirstGesture, true);
  window.addEventListener("keydown",     onFirstGesture, true);
  window.addEventListener("wheel",       onFirstGesture, true);
  window.addEventListener("touchstart",  onFirstGesture, true);

  // ---- toggle button ----
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    muted = !muted;
    audio.muted = muted;
    button.setAttribute("data-muted", String(muted));
    try { localStorage.setItem(STORAGE_KEY, String(muted)); } catch {}
    log("toggle clicked, muted now =", muted);
    if (!muted) tryStart("button-click");
  });
})();

})();