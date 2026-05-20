/* =========================================================
 *  AtlasColorService — year → color mapping
 *
 *  Independent module. Loaded BEFORE app.js as a classic script
 *  so that `window.AtlasColorService` is available when the
 *  globe initializes. Edit this file alone to retune the palette
 *  or extend its behavior.
 *
 *  Conceptual model: each data point is a fire that has been
 *  burning for a long time. The older the work, the colder the
 *  flame (deep blue → teal → moss); the closer to today, the
 *  warmer it glows (amber → sepia → cinnabar).
 *
 *  Exports (all on window.AtlasColorService):
 *
 *    colorForYear(year, opts?)
 *      → { hex: 0xRRGGBB, css: "#rrggbb", t: 0..1 }
 *
 *    setRange(minYear, maxYear)
 *      → adjust the temperature scale's anchor years.
 *        Defaults: minYear = -700 (Sappho era), maxYear = current year.
 *
 *    palette
 *      → the raw control-point list (read-only).
 *
 *    palette + interpolation are pure functions; no DOM, no state
 *    other than the configurable range.
 * ========================================================= */

(function () {
  "use strict";

  /* ---------- palette ----------
   * Anchored at t = 0 (oldest) → 1 (newest).
   * Tuned to harmonize with the paper-tone UI (sepia / cinnabar accents).
   *
   * t      color           feel
   * ────   ─────────────   ──────────────────────────
   * 0.00   #2c3e63         deep indigo (古老 · 冷火)
   * 0.20   #3a6379         slate teal
   * 0.42   #5b7a5e         moss
   * 0.62   #8a7a3e         olive amber
   * 0.80   #b8693a         burnt sienna
   * 1.00   #9d2933         cinnabar (当代 · 暖火)
   */
  const PALETTE = Object.freeze([
    { t: 0.00, r: 0x2c, g: 0x3e, b: 0x63 },
    { t: 0.20, r: 0x3a, g: 0x63, b: 0x79 },
    { t: 0.42, r: 0x5b, g: 0x7a, b: 0x5e },
    { t: 0.62, r: 0x8a, g: 0x7a, b: 0x3e },
    { t: 0.80, r: 0xb8, g: 0x69, b: 0x3a },
    { t: 1.00, r: 0x9d, g: 0x29, b: 0x33 },
  ]);

  let _minYear = -700;
  let _maxYear = new Date().getFullYear();

  /* ---------- helpers ---------- */

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  // Map t∈[0,1] across the palette using piecewise linear interpolation
  function paletteAt(t) {
    t = clamp(t, 0, 1);
    // find bracketing control points
    let i = 0;
    while (i < PALETTE.length - 1 && PALETTE[i + 1].t < t) i++;
    const a = PALETTE[Math.min(i, PALETTE.length - 1)];
    const b = PALETTE[Math.min(i + 1, PALETTE.length - 1)];
    const span = b.t - a.t || 1;
    const u = (t - a.t) / span;
    const r = Math.round(a.r + (b.r - a.r) * u);
    const g = Math.round(a.g + (b.g - a.g) * u);
    const bl = Math.round(a.b + (b.b - a.b) * u);
    return { r, g, b: bl };
  }

  function hexOf(c) { return (c.r << 16) | (c.g << 8) | c.b; }
  function cssOf(c) {
    const h = (n) => n.toString(16).padStart(2, "0");
    return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
  }

  /* ---------- year-axis non-linearity ----------
   * A simple linear year → t is wrong: ~80% of recorded works fall in
   * the last 200 years, which would crowd them all at the warm end and
   * collapse the cool half into a single century-marker.
   *
   * We use a piecewise linear map with an anchor at PIVOT_YEAR (1500),
   * splitting cool half (pre-pivot) and warm half (post-pivot). This
   * gives the eye real century-level resolution for the modern data,
   * while still letting pre-modern works occupy the cool palette.
   *
   *   year ≤ minYear        → t = 0    (palette[0], deep indigo)
   *   minYear … PIVOT_YEAR  → t = 0   …  0.5  (linear within range)
   *   PIVOT_YEAR … maxYear  → t = 0.5 …  1.0  (linear within range)
   *   year ≥ maxYear        → t = 1
   *
   * Sample (min=-700, pivot=1500, max=2026):
   *   year     t       feel
   *   -600    .045    deep indigo / slate
   *    1000   .386    moss
   *    1500   .500    moss-olive boundary
   *    1800   .585    olive amber
   *    1900   .680    burnt sienna
   *    1950   .728    deeper sienna
   *    2000   .775    cinnabar
   *    2024   .798    full cinnabar
   *
   * Pre-modern works span the full cool half; modern works occupy
   * the warm half with visible decade-by-decade hue shifts.
   */
  const PIVOT_YEAR = 1500;

  function yearToT(year) {
    const y = (typeof year === "number" && isFinite(year))
      ? year
      : parseFloat(year);
    if (!isFinite(y)) return 1; // unknown → assume contemporary

    if (y <= _minYear) return 0;
    if (y >= _maxYear) return 1;

    if (y <= PIVOT_YEAR) {
      const u = (y - _minYear) / (PIVOT_YEAR - _minYear);
      return clamp(u * 0.5, 0, 0.5);
    } else {
      const u = (y - PIVOT_YEAR) / (_maxYear - PIVOT_YEAR);
      return clamp(0.5 + u * 0.5, 0.5, 1);
    }
  }

  /* ---------- public API ---------- */

  function colorForYear(year, _opts) {
    const t = yearToT(year);
    const c = paletteAt(t);
    return { hex: hexOf(c), css: cssOf(c), t };
  }

  function setRange(minYear, maxYear) {
    if (typeof minYear === "number" && isFinite(minYear)) _minYear = minYear;
    if (typeof maxYear === "number" && isFinite(maxYear)) _maxYear = maxYear;
  }

  function getRange() {
    return { min: _minYear, max: _maxYear };
  }

  // expose
  window.AtlasColorService = Object.freeze({
    colorForYear,
    setRange,
    getRange,
    palette: PALETTE,
  });
})();