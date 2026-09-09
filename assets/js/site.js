(function () {
  "use strict";

  const MAG_RADIUS = 110;
  const MAG_STRENGTH = 0.38;

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  const coordsEl = document.getElementById("coords");
  const navItems = document.querySelectorAll(".mag-item");

  const view = { w: 0, h: 0 };
  const mouse = { x: -9999, y: -9999, active: false };

  // ── Blueprint palette ──────────────────────────────────────
  const CREAM = "240,236,216";
  const GOLD  = "212,160,23";

  let t = 0;

  // ── Type particles ────────────────────────────────────────
  const ORBIT_TEXT = "DESIGN · ENGINEER · MAKER · 2025 · ";
  let typeP = [];

  function computeTypeHomes() {
    const cx  = view.w * 0.62;
    const cy  = view.h * 0.36;
    const max = Math.min(view.w, view.h) * 0.26;
    const chars = ORBIT_TEXT.split("");
    const n = chars.length;

    chars.forEach((ch, i) => {
      const angle   = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r       = max * 0.80;
      const hx      = cx + Math.cos(angle) * r;
      const hy      = cy + Math.sin(angle) * r;
      const tangent = angle + Math.PI / 2;

      if (typeP[i]) {
        typeP[i].hx = hx;
        typeP[i].hy = hy;
        typeP[i].tangent = tangent;
      } else {
        typeP.push({ ch, hx, hy, x: hx, y: hy, vx: 0, vy: 0, tangent });
      }
    });
  }

  function drawTypeField() {
    const SPRING  = 0.065;
    const DAMPING = 0.78;
    const REPEL_R = 90;
    const REPEL_F = 2400;

    typeP.forEach((p) => {
      // Spring toward home
      let fx = (p.hx - p.x) * SPRING;
      let fy = (p.hy - p.y) * SPRING;

      // Repel from cursor
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d  = Math.hypot(dx, dy);
        if (d < REPEL_R && d > 0) {
          const f = REPEL_F / (d * d);
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        }
      }

      p.vx = (p.vx + fx) * DAMPING;
      p.vy = (p.vy + fy) * DAMPING;
      p.x += p.vx;
      p.y += p.vy;

      // How far displaced — drives gold tint + size swell
      const disp     = Math.hypot(p.x - p.hx, p.y - p.hy);
      const heat     = Math.min(disp / 48, 1);
      const fontSize = 9 + heat * 5;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tangent);
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.font         = `700 ${fontSize}px "SF Mono","Fira Code",monospace`;

      if (heat > 0.05) {
        ctx.fillStyle = `rgba(${GOLD},${0.45 + heat * 0.55})`;
      } else {
        ctx.fillStyle = `rgba(${CREAM},0.38)`;
      }

      ctx.fillText(p.ch, 0, 0);
      ctx.restore();
    });
  }

  // ── Resize ────────────────────────────────────────────────
  function resize() {
    view.w = canvas.width  = window.innerWidth;
    view.h = canvas.height = window.innerHeight;
    computeTypeHomes();
  }

  // ── Mouse ─────────────────────────────────────────────────
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;

    if (coordsEl) {
      const nx = (e.clientX / view.w * 180 - 90).toFixed(3);
      const ny = (e.clientY / view.h * 90  - 45).toFixed(3);
      coordsEl.textContent = `${nx}° E  ·  ${ny}° N`;
    }
  }

  // ── Blueprint radar ────────────────────────────────────────
  function drawRadar() {
    const cx  = view.w * 0.62;
    const cy  = view.h * 0.36;
    const max = Math.min(view.w, view.h) * 0.26;

    // Concentric rings
    for (let i = 1; i <= 5; i++) {
      const r = (i / 5) * max;
      ctx.strokeStyle = `rgba(${CREAM},${0.04 + i * 0.018})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dashed crosshair axes
    ctx.strokeStyle = `rgba(${CREAM},0.07)`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 10]);
    ctx.beginPath();
    ctx.moveTo(cx - max, cy); ctx.lineTo(cx + max, cy);
    ctx.moveTo(cx, cy - max); ctx.lineTo(cx, cy + max);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tick marks on outermost ring
    const ticks = 36;
    for (let i = 0; i < ticks; i++) {
      const a    = (i / ticks) * Math.PI * 2;
      const main = i % 9 === 0;
      const len  = main ? 10 : 4;
      ctx.strokeStyle = `rgba(${CREAM},${main ? 0.28 : 0.1})`;
      ctx.lineWidth   = main ? 1 : 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (max - len), cy + Math.sin(a) * (max - len));
      ctx.lineTo(cx + Math.cos(a) * max,         cy + Math.sin(a) * max);
      ctx.stroke();
    }

    // Gold sweep trail
    const sweep = t * 0.55;
    const trailLen = 0.55;
    for (let i = 0; i < 30; i++) {
      const a     = sweep - (i / 30) * trailLen;
      const alpha = (1 - i / 30) * 0.065;
      ctx.fillStyle = `rgba(${GOLD},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, max, a - 0.04, a);
      ctx.closePath();
      ctx.fill();
    }

    // Gold sweep line
    ctx.strokeStyle = `rgba(${GOLD},0.65)`;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweep) * max, cy + Math.sin(sweep) * max);
    ctx.stroke();

    // Center pip
    ctx.fillStyle = `rgba(${CREAM},0.35)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.font = '8px "SF Mono","Fira Code",monospace';
    ctx.fillStyle = `rgba(${CREAM},0.22)`;
    ctx.textAlign = "center";
    ctx.fillText("SURVEY REF. PC-01", cx, cy + max + 16);
    ctx.textAlign = "left";
  }

  // ── Crosshair at cursor ───────────────────────────────────
  function drawCrosshair() {
    if (!mouse.active) return;
    const { x, y } = mouse;
    const r   = 26;
    const gap = 6;
    const len = 14;

    ctx.strokeStyle = `rgba(${CREAM},0.45)`;
    ctx.lineWidth   = 0.8;

    // Circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Four gapped lines
    ctx.beginPath();
    ctx.moveTo(x - r - len, y);   ctx.lineTo(x - r - gap, y);
    ctx.moveTo(x + r + gap, y);   ctx.lineTo(x + r + len, y);
    ctx.moveTo(x, y - r - len);   ctx.lineTo(x, y - r - gap);
    ctx.moveTo(x, y + r + gap);   ctx.lineTo(x, y + r + len);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = `rgba(${CREAM},0.6)`;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Magnetic nav ──────────────────────────────────────────
  function applyMag() {
    navItems.forEach((el) => {
      const r    = el.getBoundingClientRect();
      const cx   = r.left + r.width  / 2;
      const cy   = r.top  + r.height / 2;
      const dx   = mouse.x - cx;
      const dy   = mouse.y - cy;
      const dist = Math.hypot(dx, dy);
      if (mouse.active && dist < MAG_RADIUS) {
        const pull = (1 - dist / MAG_RADIUS) * MAG_STRENGTH;
        el.style.transform = `translate(${(dx*pull).toFixed(1)}px,${(dy*pull).toFixed(1)}px)`;
      } else {
        el.style.transform = "";
      }
    });
  }

  // ── Nav page transitions ──────────────────────────────────
  function bindNav() {
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const label = Array.from(item.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n)   => n.textContent.trim())
          .filter(Boolean)[0] || "";
        if (window.PageTransition) {
          window.PageTransition.exit(item.getAttribute("href"), e.clientX, e.clientY, label);
        } else {
          window.location.href = item.getAttribute("href");
        }
      });
    });
  }

  // ── Loop ─────────────────────────────────────────────────
  function loop() {
    ctx.clearRect(0, 0, view.w, view.h);
    drawRadar();
    drawTypeField();
    drawCrosshair();
    applyMag();
    t += 0.012;
    requestAnimationFrame(loop);
  }

  function init() {
    resize();
    bindNav();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resize);
    requestAnimationFrame(loop);
  }

  init();
})();
