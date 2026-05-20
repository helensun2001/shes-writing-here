/* =========================================================
 *  AtlasVineService — growing text vines
 *
 *  Hover-triggered animation: from a data point's base on the
 *  globe, a curved vine grows outward; the work's title is
 *  laid out character-by-character along the vine spline,
 *  each character oriented along the curve's tangent. Color
 *  fades from moss-green at the root to the work's fire-color
 *  at the tip.
 *
 *  Independent module loaded BEFORE app.js as a classic script,
 *  exposing `window.AtlasVineService`. Self-contained: no shared
 *  state with app.js beyond what's passed in at init().
 *
 *  Public API:
 *
 *    AtlasVineService.init({
 *      THREE,           // the THREE namespace
 *      scene,           // parent Object3D (usually the globe group)
 *      globeRadius,     // sphere radius for placing the root
 *    })
 *
 *    AtlasVineService.spawn(id, {
 *      lat, lon,        // anchor on globe surface
 *      text,            // string to render along the vine
 *      tipColorHex,     // 0xRRGGBB - "fire" color at the vine tip
 *    })
 *      → idempotent: spawning the same id while alive is a no-op
 *
 *    AtlasVineService.dispose(id)
 *      → starts retraction animation; removes from scene after.
 *
 *    AtlasVineService.update(deltaSeconds)
 *      → call once per frame from your render loop.
 *
 *    AtlasVineService.disposeAll()
 *
 *  Design notes:
 *    - Characters share a single canvas-atlas texture, built
 *      lazily on first character requested. Each glyph slot is
 *      256×256 px. UV offsets are computed from a hash map.
 *    - Each vine = 1 spline curve + N small plane meshes (one
 *      per character), all parented to a single Object3D.
 *    - On retraction, characters fade reverse-order. Once all
 *      gone, the Object3D is removed and disposed.
 *    - Length scales with character count (capped) so short
 *      titles get short vines and long titles get long vines.
 * ========================================================= */

(function () {
  "use strict";

  // ---- module-private state, set by init() ----
  let THREE = null;
  let SCENE = null;
  let GLOBE_R = 1.0;

  // ---- atlas state ----
  const ATLAS_CELL  = 128;     // px per glyph cell (256 looked too big in mem)
  const ATLAS_COLS  = 32;      // 32×32 = 1024 glyph slots; canvas 4096×4096
  const ATLAS_FONT  = "600 92px 'Cormorant Garamond', 'Noto Serif SC', serif";
  let   atlasCanvas = null;
  let   atlasCtx    = null;
  let   atlasTex    = null;
  const glyphIndex  = new Map();   // char -> int slot id
  let   nextSlot    = 0;

  // ---- active vines registry ----
  const VINES = new Map();        // id -> vine state object

  // ---- tuning constants ----
  const ROOT_COLOR  = { r: 0x4a, g: 0x5d, b: 0x3a };  // moss at root
  const VINE_BASE_LEN  = 0.18;     // shortest vine length (radians of arc-out)
  const VINE_LEN_PER_CHAR = 0.012; // additional length per char
  const VINE_MAX_LEN   = 0.55;     // cap
  const CHAR_PLANE_SIZE = 0.022;   // world units, edge of each glyph plane
  const GROWTH_SECONDS  = 1.0;     // time to fully grow
  const RETRACT_SECONDS = 0.6;     // time to fully retract
  const CHAR_FADE_IN    = 0.18;    // per-char fade-in
  const PERLIN_AMP      = 0.10;    // sideways wobble amplitude

  /* ---------- math helpers (no dependency on app.js) ---------- */

  function latLonToVec3(lat, lon, r) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // deterministic 2D-ish noise from seed (cheap pseudo-Perlin)
  function pseudoNoise(seed, t) {
    const s = Math.sin(seed * 9.421 + t * 6.283) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1; // [-1, 1]
  }

  // small string hash for stable seed per vine
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return h;
  }

  /* ---------- atlas: build canvas, alloc glyphs lazily ---------- */

  function ensureAtlas() {
    if (atlasCanvas) return;
    const px = ATLAS_CELL * ATLAS_COLS;
    atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = px;
    atlasCanvas.height = px;
    atlasCtx = atlasCanvas.getContext("2d");
    atlasCtx.fillStyle = "rgba(0,0,0,0)";
    atlasCtx.fillRect(0, 0, px, px);
    atlasTex = new THREE.CanvasTexture(atlasCanvas);
    atlasTex.minFilter = THREE.LinearFilter;
    atlasTex.magFilter = THREE.LinearFilter;
    atlasTex.generateMipmaps = false;
    if (THREE.SRGBColorSpace) atlasTex.colorSpace = THREE.SRGBColorSpace;
    atlasTex.needsUpdate = true;
  }

  function getGlyphSlot(ch) {
    ensureAtlas();
    if (glyphIndex.has(ch)) return glyphIndex.get(ch);
    if (nextSlot >= ATLAS_COLS * ATLAS_COLS) {
      // atlas full — should never happen for a 100-book dataset but be safe
      console.warn("Vine atlas full, reusing slot 0 for", ch);
      glyphIndex.set(ch, 0);
      return 0;
    }
    const slot = nextSlot++;
    const col = slot % ATLAS_COLS;
    const row = Math.floor(slot / ATLAS_COLS);
    const x = col * ATLAS_CELL;
    const y = row * ATLAS_CELL;

    // draw the glyph centered. Use white so we can tint with material color.
    atlasCtx.save();
    atlasCtx.font = ATLAS_FONT;
    atlasCtx.textAlign = "center";
    atlasCtx.textBaseline = "middle";
    atlasCtx.fillStyle = "#ffffff";
    // soft glow so colored tint blends with paper background
    atlasCtx.shadowColor = "rgba(255,255,255,0.55)";
    atlasCtx.shadowBlur = 4;
    atlasCtx.fillText(ch, x + ATLAS_CELL / 2, y + ATLAS_CELL / 2 + 4);
    atlasCtx.restore();

    atlasTex.needsUpdate = true;
    glyphIndex.set(ch, slot);
    return slot;
  }

  function uvForSlot(slot) {
    const col = slot % ATLAS_COLS;
    const row = Math.floor(slot / ATLAS_COLS);
    // three.js textures: row 0 is at v=1 (top), so flip
    const u0 = col / ATLAS_COLS;
    const v0 = 1 - (row + 1) / ATLAS_COLS;
    const u1 = (col + 1) / ATLAS_COLS;
    const v1 = 1 - row / ATLAS_COLS;
    return { u0, v0, u1, v1 };
  }

  /* ---------- spline construction ---------- */

  // Build a curve from globe surface outward + sideways wobble.
  // Length grows with character count; seed gives each vine a unique wobble.
  function buildCurve(lat, lon, charCount, seed) {
    const length = Math.min(
      VINE_BASE_LEN + charCount * VINE_LEN_PER_CHAR,
      VINE_MAX_LEN
    );

    const root   = latLonToVec3(lat, lon, GLOBE_R * 1.0005);
    const radial = root.clone().normalize();
    // build a tangent basis on the sphere at the root
    const upGuess = Math.abs(radial.y) < 0.9
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0);
    const tan1 = new THREE.Vector3().crossVectors(upGuess, radial).normalize();
    const tan2 = new THREE.Vector3().crossVectors(radial, tan1).normalize();

    // 5 control points: root, then 4 going outward with lateral wobble
    const pts = [root.clone()];
    for (let i = 1; i <= 4; i++) {
      const t = i / 4;
      const outward = radial.clone().multiplyScalar(t * length);
      const wobbleA = pseudoNoise(seed, t * 1.7) * PERLIN_AMP * length;
      const wobbleB = pseudoNoise(seed + 17, t * 2.3) * PERLIN_AMP * length;
      const p = root.clone()
        .add(outward)
        .add(tan1.clone().multiplyScalar(wobbleA))
        .add(tan2.clone().multiplyScalar(wobbleB));
      pts.push(p);
    }
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
  }

  /* ---------- glyph plane construction ---------- */

  // One BufferGeometry per char so we can give it custom UVs.
  // We could pool, but glyph planes are cheap enough.
  function makeGlyphMesh(ch, color) {
    const slot = getGlyphSlot(ch);
    const { u0, v0, u1, v1 } = uvForSlot(slot);
    const h = CHAR_PLANE_SIZE;
    const geom = new THREE.BufferGeometry();
    const verts = new Float32Array([
      -h/2, -h/2, 0,
       h/2, -h/2, 0,
       h/2,  h/2, 0,
      -h/2,  h/2, 0,
    ]);
    const uvs = new Float32Array([
      u0, v0,
      u1, v0,
      u1, v1,
      u0, v1,
    ]);
    const idx = new Uint16Array([0, 1, 2, 0, 2, 3]);
    geom.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(new THREE.BufferAttribute(idx, 1));

    const mat = new THREE.MeshBasicMaterial({
      map: atlasTex,
      color: color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geom, mat);
  }

  /* ---------- character filter: skip whitespace, control chars ---------- */
  function prepareChars(text) {
    const out = [];
    for (const ch of String(text)) {
      // collapse runs of whitespace into single space
      if (/\s/.test(ch)) {
        if (out.length && out[out.length - 1] === " ") continue;
        out.push(" ");
      } else {
        out.push(ch);
      }
    }
    // trim leading/trailing spaces
    while (out.length && out[0] === " ") out.shift();
    while (out.length && out[out.length - 1] === " ") out.pop();
    return out;
  }

  /* ---------- color interpolation (root → tip) ---------- */
  function lerpColor(t, tipR, tipG, tipB) {
    const r = ROOT_COLOR.r * (1 - t) + tipR * t;
    const g = ROOT_COLOR.g * (1 - t) + tipG * t;
    const b = ROOT_COLOR.b * (1 - t) + tipB * t;
    return new THREE.Color(r / 255, g / 255, b / 255);
  }

  /* ============ public API ============ */

  function init(opts) {
    THREE   = opts.THREE;
    SCENE   = opts.scene;
    GLOBE_R = opts.globeRadius || 1.0;
  }

  function spawn(id, opts) {
    if (VINES.has(id)) return;  // idempotent
    if (!THREE || !SCENE) {
      console.warn("AtlasVineService.spawn called before init()");
      return;
    }

    const chars = prepareChars(opts.text || "");
    if (chars.length === 0) return;

    const seed = hashStr(id) & 0xffff;
    const curve = buildCurve(opts.lat, opts.lon, chars.length, seed);

    // tip color components
    const tipHex = opts.tipColorHex !== undefined ? opts.tipColorHex : 0x9d2933;
    const tipR = (tipHex >> 16) & 0xff;
    const tipG = (tipHex >>  8) & 0xff;
    const tipB =  tipHex        & 0xff;

    const group = new THREE.Group();
    group.userData.kind = "vine";
    SCENE.add(group);

    // build one mesh per char
    const glyphs = [];
    for (let i = 0; i < chars.length; i++) {
      const t = (i + 0.5) / chars.length;     // [0,1] position along curve
      const color = lerpColor(t, tipR, tipG, tipB);
      const m = makeGlyphMesh(chars[i], color);

      // place mesh at curve point with orientation along tangent
      const pos = curve.getPointAt(t);
      m.position.copy(pos);
      orientAlongCurve(m, curve, t);

      // start invisible; will fade in via update()
      m.material.opacity = 0;
      m.scale.set(0.0001, 0.0001, 0.0001);

      group.add(m);
      glyphs.push({ mesh: m, mat: m.material, t });
    }

    VINES.set(id, {
      id,
      group,
      glyphs,
      curve,
      state: "growing",
      age: 0,
      // for retracting we'll remember when retraction started
      retractAt: 0,
    });
  }

  // orient a mesh at curve param t so its +x lies along the tangent,
  // and its +z faces outward from the globe (so character "stands up")
  function orientAlongCurve(mesh, curve, t) {
    const tangent = curve.getTangentAt(t).normalize();
    const pos = mesh.position;
    // outward = radial from globe center
    const outward = pos.clone().normalize();
    // basis: x = tangent, z = outward, y = z × x
    const x = tangent;
    const z = outward;
    const y = new THREE.Vector3().crossVectors(z, x).normalize();
    // re-orthogonalize x in case tangent isn't perp to outward
    const xOrtho = new THREE.Vector3().crossVectors(y, z).normalize();
    const m = new THREE.Matrix4().makeBasis(xOrtho, y, z);
    mesh.quaternion.setFromRotationMatrix(m);
  }

  function dispose(id) {
    const v = VINES.get(id);
    if (!v) return;
    if (v.state === "retracting" || v.state === "dead") return;
    v.state = "retracting";
    v.retractAt = v.age;
  }

  function disposeAll() {
    for (const id of VINES.keys()) dispose(id);
  }

  function update(dt) {
    if (!dt || !isFinite(dt)) return;
    const toDelete = [];
    for (const v of VINES.values()) {
      v.age += dt;

      if (v.state === "growing") {
        const growthT = Math.min(v.age / GROWTH_SECONDS, 1);
        applyGrowth(v, growthT);
        if (growthT >= 1) v.state = "alive";
      } else if (v.state === "alive") {
        // hold: do nothing, keep everything at full
        applyGrowth(v, 1);
      } else if (v.state === "retracting") {
        const u = Math.min((v.age - v.retractAt) / RETRACT_SECONDS, 1);
        applyRetract(v, u);
        if (u >= 1) toDelete.push(v.id);
      }
    }
    for (const id of toDelete) destroyVine(id);
  }

  function applyGrowth(v, growthT) {
    const N = v.glyphs.length;
    for (let i = 0; i < N; i++) {
      const g = v.glyphs[i];
      // each char starts becoming visible at its t along the curve.
      // local progress = (growthT - t) / charFadeIn, clamped.
      const local = (growthT - g.t) / (CHAR_FADE_IN / Math.max(GROWTH_SECONDS, 1e-6));
      const u = Math.max(0, Math.min(1, local));
      const eased = u * u * (3 - 2 * u);  // smoothstep
      g.mat.opacity = eased;
      g.mesh.scale.setScalar(0.0001 + eased * 0.9999);
    }
  }

  function applyRetract(v, retractU) {
    // retract reverse order: last char disappears first
    const N = v.glyphs.length;
    for (let i = 0; i < N; i++) {
      const g = v.glyphs[i];
      // char i's retract progress: tip retracts at retractU=0, root at retractU=1
      const tipFirst = 1 - g.t;     // tip has tipFirst=0, root has tipFirst=1
      const local = (retractU - tipFirst) / (CHAR_FADE_IN / Math.max(RETRACT_SECONDS, 1e-6));
      const u = Math.max(0, Math.min(1, local));
      const eased = u * u * (3 - 2 * u);
      // eased=0 means fully visible, =1 means gone
      const vis = 1 - eased;
      g.mat.opacity = vis;
      g.mesh.scale.setScalar(0.0001 + vis * 0.9999);
    }
  }

  function destroyVine(id) {
    const v = VINES.get(id);
    if (!v) return;
    for (const g of v.glyphs) {
      g.mesh.geometry.dispose();
      g.mat.dispose();
    }
    SCENE.remove(v.group);
    VINES.delete(id);
  }

  // expose
  window.AtlasVineService = Object.freeze({
    init,
    spawn,
    dispose,
    disposeAll,
    update,
    // for diagnostics
    _state: { vines: VINES, glyphIndex },
  });
})();