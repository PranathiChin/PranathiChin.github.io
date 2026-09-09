/**
 * ASCII jellyfish: bell pulse + drifting tentacles, rendered with monospace glyphs.
 * Reacts to a Mouse-like object exposing { x, y, active }.
 */
(function (global) {
  "use strict";

  const COLOR = Object.freeze({ r: 243, g: 237, b: 217 }); // warm cream — reads against the blue page bg

  const CELL = Object.freeze({
    w: 6.5, // horizontal spacing between glyphs
    h: 11.0, // vertical spacing between glyphs
  });

  const PHYS = Object.freeze({
    pulseFreq: 1.55,
    pulseStrength: 0.22,
    buoyancy: 0.01,
    sway: 0.04,
    swayFreq: 0.35,
    repelRadiusFactor: 5,
    repelStrength: 0.12,
    damping: 0.965,
    edgeNudge: 0.18,
  });

  const FONT = '11px "SF Mono","Fira Code","Consolas",monospace';

  function rgba(a) {
    return `rgba(${COLOR.r},${COLOR.g},${COLOR.b},${a.toFixed(2)})`;
  }

  function densityChar(d) {
    if (d > 0.68) return "#";
    if (d > 0.44) return "=";
    if (d > 0.24) return ":";
    return "·";
  }

  class Jellyfish {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.swimT = 0;
      this.size = 100;
    }

    /** Re-center based on viewport dimensions and rescale size. */
    reset(viewW, viewH) {
      this.size = Math.min(viewW, viewH) * 0.22;
      this.x = viewW * 0.55;
      this.y = viewH * 0.38;
      this.vx = 0;
      this.vy = 0;
    }

    update(mouse, viewW, viewH) {
      this.swimT += 0.022;

      // Bell pulse propels upward on contraction.
      this.vy += -Math.max(0, Math.cos(this.swimT * PHYS.pulseFreq)) * PHYS.pulseStrength;
      this.vy += PHYS.buoyancy;
      this.vx += Math.sin(this.swimT * PHYS.swayFreq) * PHYS.sway;

      // Drift away from the mouse, slowly.
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        const radius = this.size * PHYS.repelRadiusFactor;
        if (dist > 0 && dist < radius) {
          const rep = (1 - dist / radius) * PHYS.repelStrength;
          this.vx -= (dx / dist) * rep;
          this.vy -= (dy / dist) * rep;
        }
      }

      this.vx *= PHYS.damping;
      this.vy *= PHYS.damping;
      this.x += this.vx;
      this.y += this.vy;

      // Soft edges so the creature stays in frame.
      const margin = this.size * 2.2;
      if (this.x < margin) this.vx += PHYS.edgeNudge;
      if (this.x > viewW - margin) this.vx -= PHYS.edgeNudge;
      if (this.y < margin) this.vy += PHYS.edgeNudge;
      if (this.y > viewH - margin * 1.5) this.vy -= PHYS.edgeNudge;
    }

    draw(ctx) {
      const pulse = 0.87 + 0.13 * Math.sin(this.swimT * PHYS.pulseFreq);
      const bellW = this.size * pulse;
      const bellH = (this.size * 0.6) / pulse;

      ctx.font = FONT;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      this._drawBell(ctx, bellW, bellH);
      this._drawRim(ctx, bellW, bellH);
      this._drawStrands(ctx, {
        count: 10,
        spread: bellW * 1.85,
        baseLen: this.size * 2.4,
        lenJitter: this.size * 0.7,
        waveAmp1: this.size * 0.17,
        waveAmp2: this.size * 0.09,
        waveFreq1: 0.038,
        waveFreq2: 0.018,
        stepFactor: 0.88,
        alphaMax: 0.65,
        alphaBase: 0.1,
        headRatio: 0.18,
        headChar: ":",
        tailChar: "·",
        clipToBell: true,
        bellW,
      });
      this._drawStrands(ctx, {
        count: 5,
        spread: bellW * 0.55,
        baseLen: this.size * 1.2,
        lenJitter: 0,
        waveAmp1: this.size * 0.07,
        waveAmp2: 0,
        waveFreq1: 0.065,
        waveFreq2: 0,
        stepFactor: 0.75,
        alphaMax: 0.42,
        alphaBase: 0.12,
        headRatio: 0.35,
        headChar: "=",
        tailChar: ":",
        clipToBell: false,
        bellW,
      });
    }

    _drawBell(ctx, bellW, bellH) {
      for (let lx = -bellW; lx <= bellW; lx += CELL.w) {
        for (let ly = -bellH; ly <= 0; ly += CELL.h * 0.82) {
          const nx = lx / bellW;
          const ny = ly / bellH;
          if (nx * nx + ny * ny > 1) continue;

          const distC = Math.sqrt(nx * nx + ny * ny);
          const topness = -ny; // 0 at equator, 1 at apex
          const density = (1 - distC * 0.5) * (0.3 + topness * 0.7);

          ctx.fillStyle = rgba(0.18 + density * 0.88);
          ctx.fillText(densityChar(density), this.x + lx, this.y + ly);
        }
      }
    }

    _drawRim(ctx, bellW, bellH) {
      const steps = 32;
      ctx.fillStyle = rgba(0.35);
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI;
        const frillBob = Math.sin(a * 7 + this.swimT * 4) * bellH * 0.07;
        ctx.fillText(
          "·",
          this.x + Math.cos(a) * bellW,
          this.y + frillBob
        );
      }
    }

    /** Renders a column of wavy character chains hanging from the bell. */
    _drawStrands(ctx, opts) {
      const {
        count,
        spread,
        baseLen,
        lenJitter,
        waveAmp1,
        waveAmp2,
        waveFreq1,
        waveFreq2,
        stepFactor,
        alphaMax,
        alphaBase,
        headRatio,
        headChar,
        tailChar,
        clipToBell,
        bellW,
      } = opts;

      const step = CELL.h * stepFactor;
      const startTy = clipToBell ? CELL.h * 0.4 : 0;

      for (let i = 0; i < count; i++) {
        const offset = count === 1 ? 0 : i / (count - 1) - 0.5;
        const tx = offset * spread;
        if (clipToBell && Math.abs(tx / bellW) > 1.05) continue;

        const len = baseLen + Math.sin(i * 1.9 + 1.2) * lenJitter;

        for (let ty = startTy; ty <= len; ty += step) {
          const wave =
            Math.sin(ty * waveFreq1 + this.swimT * 1.3 + i * 0.95) * waveAmp1 +
            (waveAmp2
              ? Math.sin(ty * waveFreq2 - this.swimT * 0.8 + i * 1.6) * waveAmp2
              : 0);
          const alpha = alphaBase + alphaMax * Math.pow(1 - ty / len, 0.6);
          const ch = ty < len * headRatio ? headChar : tailChar;
          ctx.fillStyle = rgba(alpha);
          ctx.fillText(ch, this.x + tx + wave, this.y + ty);
        }
      }
    }
  }

  global.Jellyfish = Jellyfish;
})(window);
