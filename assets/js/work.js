(function () {
  "use strict";

  // ── Rest positions for each stacked folder ──────────────
  // Each folder settles at a slightly different x/y/rotation
  // to create a natural stacked-papers look.
  const REST = [
    { x: -24, y: 22,  rot: -6   }, // folder 0 — deepest in stack
    { x: -12, y: 11,  rot:  3   }, // folder 1
    { x:   0, y:  0,  rot: -2   }, // folder 2
    { x:  12, y: -11, rot:  1.2 }, // folder 3 — top of stack
  ];

  const LABELS = ["01", "02", "03", "04"];

  // ── DOM refs ─────────────────────────────────────────────
  const zone    = document.getElementById("folders-zone");
  const folders = [...document.querySelectorAll(".folder[data-index]")];
  const fill    = document.getElementById("progress-fill");
  const counter = document.getElementById("pin-counter");
  const cue     = document.getElementById("scroll-cue");

  if (!zone || folders.length === 0) return;

  // ── Easing ───────────────────────────────────────────────
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ── Set initial off-screen transform ─────────────────────
  function setInitial() {
    const startY = window.innerHeight * 0.95;
    folders.forEach((folder, i) => {
      const rest = REST[i];
      folder.style.transition = "none";
      folder.style.transform  = `translateX(${rest.x + 80}px) translateY(${startY}px) rotate(${rest.rot + 18}deg)`;
      folder.style.zIndex     = String(10 + i);
    });
  }

  // ── Main update ──────────────────────────────────────────
  function update() {
    const rect     = zone.getBoundingClientRect();
    const maxScroll = zone.offsetHeight - window.innerHeight;
    const scrolled  = -rect.top;
    const globalP   = Math.max(0, Math.min(1, scrolled / maxScroll));

    // Progress bar + counter
    if (fill) fill.style.width = (globalP * 100).toFixed(1) + "%";

    const startY = window.innerHeight * 0.95;
    let topVisible = -1;

    folders.forEach((folder, i) => {
      const N = folders.length;
      // Each folder gets an equal slice of the total progress,
      // with a small pause between each one landing.
      const sliceSize = 0.14;           // each folder animates fast
      const gap       = 0.06;          // short pause between each
      const start     = i * (sliceSize + gap);
      const end       = start + sliceSize;

      let p = (globalP - start) / (end - start);
      p = Math.max(0, Math.min(1, p));
      p = easeOutCubic(p);

      const rest = REST[i];

      const x   = lerp(rest.x + 80, rest.x, p);
      const y   = lerp(startY, rest.y, p);
      const rot = lerp(rest.rot + 18, rest.rot, p);

      folder.style.transform = `translateX(${x.toFixed(2)}px) translateY(${y.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`;
      folder.style.zIndex    = String(10 + i);

      // Track topmost visible folder for counter
      if (p > 0.45) topVisible = i;
    });

    // Update counter
    if (counter) {
      counter.textContent = topVisible >= 0 ? LABELS[topVisible] : "";
    }

    // Fade out scroll cue once animation starts
    if (cue) {
      cue.style.opacity = globalP > 0.06 ? "0" : "1";
      cue.style.pointerEvents = globalP > 0.06 ? "none" : "auto";
    }
  }

  // ── Scroll listener (rAF-throttled) ──────────────────────
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    setInitial();
    update();
  });

  // ── Back link transition ──────────────────────────────────
  const backLink = document.getElementById("work-back");
  if (backLink) {
    backLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.PageTransition) {
        window.PageTransition.exit(backLink.getAttribute("href"), e.clientX, e.clientY, "Home");
      } else {
        window.location.href = backLink.getAttribute("href");
      }
    });
  }

  // ── Init ─────────────────────────────────────────────────
  setInitial();
  // Let layout settle before reading getBoundingClientRect
  requestAnimationFrame(update);
})();
