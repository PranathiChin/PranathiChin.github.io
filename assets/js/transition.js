/**
 * Page transition: radial dot-burst.
 *
 * Exit:  cells start as small circles at scale 0, grow into squares that
 *        tile the screen, with per-cell delay proportional to distance
 *        from the click point. A label fades in near the end.
 *
 * Enter: on next page load, the reverse plays automatically — cells
 *        start as a solid sheet and retract into circles fading out,
 *        revealing the new page from the click point outward.
 *
 * Exposed as window.PageTransition.exit(href, x, y, label).
 */
(function (global) {
  "use strict";

  const COLS = 24;
  const ROWS = 14;
  const STAGGER_MS = 320; // max per-cell delay
  const CELL_MS = 520;    // per-cell transition duration
  const LABEL_TAIL_MS = 80; // tiny pause after label is up before navigating
  const SS_KEY = "px:tx";

  function buildOverlay(originX, originY, label) {
    const overlay = document.createElement("div");
    overlay.className = "tx-overlay";
    overlay.style.setProperty("--cols", COLS);
    overlay.style.setProperty("--rows", ROWS);

    const grid = document.createElement("div");
    grid.className = "tx-grid";

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cellW = w / COLS;
    const cellH = h / ROWS;

    // Normalize delays to the farthest corner from the origin so the wave
    // reaches every cell within STAGGER_MS regardless of click position.
    let maxDist = 1;
    for (const [cx, cy] of [[0, 0], [w, 0], [0, h], [w, h]]) {
      maxDist = Math.max(maxDist, Math.hypot(cx - originX, cy - originY));
    }

    const frag = document.createDocumentFragment();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement("span");
        cell.className = "tx-cell";
        const px = (c + 0.5) * cellW;
        const py = (r + 0.5) * cellH;
        const d = Math.hypot(px - originX, py - originY);
        const delay = (d / maxDist) * STAGGER_MS;
        cell.style.setProperty("--d", `${delay.toFixed(0)}ms`);
        frag.appendChild(cell);
      }
    }
    grid.appendChild(frag);
    overlay.appendChild(grid);

    if (label) {
      const lab = document.createElement("span");
      lab.className = "tx-label";
      lab.textContent = label;
      overlay.appendChild(lab);
    }

    return overlay;
  }

  function playExit(href, originX, originY, label) {
    sessionStorage.setItem(SS_KEY, JSON.stringify({ x: originX, y: originY }));

    const overlay = buildOverlay(originX, originY, label);
    document.body.appendChild(overlay);

    // Reflow then activate so the transition kicks in.
    overlay.getBoundingClientRect();
    overlay.classList.add("is-active");

    const totalMs = STAGGER_MS + CELL_MS + LABEL_TAIL_MS;
    setTimeout(() => {
      window.location.href = href;
    }, totalMs);
  }

  function playEnter() {
    let data = null;
    try {
      data = JSON.parse(sessionStorage.getItem(SS_KEY) || "null");
    } catch (_) {}
    if (!data) return;
    sessionStorage.removeItem(SS_KEY);

    const overlay = buildOverlay(data.x, data.y, "");
    // Start fully covered with no transition, then enable transitions and
    // remove `is-active` so cells retract.
    overlay.classList.add("is-instant", "is-active");
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect();
    overlay.classList.remove("is-instant");

    requestAnimationFrame(() => {
      overlay.classList.remove("is-active");
    });

    const totalMs = STAGGER_MS + CELL_MS + 120;
    setTimeout(() => overlay.remove(), totalMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", playEnter);
  } else {
    playEnter();
  }

  global.PageTransition = { exit: playExit };
})(window);
