// ─── Page data ────────────────────────────────────────────────
// To add real images: set src to './assets/img/your-file.jpg'
const PAGES = [
  { src: './assets/img/sketch-1.jpg', label: 'Character Study' },
  { src: './assets/img/sketch-2.jpg', label: 'Receipt Drawing' },
  { src: './assets/img/sketch-3.jpg', label: 'Hand Studies' },
  { src: './assets/img/sketch-4.jpg', label: 'Figure in Motion' },
];

const TOTAL = PAGES.length;
const TRANSITION_MS = 640; // keep in sync with .card transition in art.css
let current = 0;
let animating = false;

// Shortest signed distance from `current` to `i` on a ring of length TOTAL.
// e.g. with TOTAL=4 and current=0: indexes [0,1,2,3] → positions [0,1,2,-1].
function wrappedPos(i) {
  let pos = i - current;
  const half = TOTAL / 2;
  if (pos > half) pos -= TOTAL;
  else if (pos < -half) pos += TOTAL;
  return pos;
}

// How each position looks relative to center (pos = shortest ring delta)
function posStyle(pos) {
  const abs = Math.abs(pos);
  const sign = Math.sign(pos) || 1;

  // Cards beyond ±2 are invisible
  if (abs > 2) return { opacity: 0, zIndex: 0, pointerEvents: 'none',
    transform: `translateX(${sign * 160}%) scale(0.3)` };

  const configs = [
    { dx: '0%',    scale: 1.08,  rotate:  0,  shadow: '0 28px 70px rgba(0,0,0,0.26), 0 6px 14px rgba(0,0,0,0.12)', opacity: 1,    z: 10 },
    { dx: '84%',   scale: 0.70,  rotate: -4,  shadow: '0 8px 24px rgba(0,0,0,0.1)',   opacity: 0.80, z: 5  },
    { dx: '126%',  scale: 0.48,  rotate: -6,  shadow: '0 4px 12px rgba(0,0,0,0.07)',  opacity: 0.44, z: 2  },
  ];

  const cfg = configs[abs];
  return {
    transform: `translateX(${sign >= 0 ? cfg.dx : '-' + cfg.dx}) scale(${cfg.scale}) rotate(${sign * cfg.rotate}deg)`,
    boxShadow: cfg.shadow,
    opacity: cfg.opacity,
    zIndex: cfg.z,
    pointerEvents: abs === 0 ? 'none' : 'auto',
  };
}

// ─── Build cards ──────────────────────────────────────────────
const track = document.getElementById('carousel-track');
const cards = [];

PAGES.forEach((pg, i) => {
  const card = document.createElement('div');
  card.className = 'card';

  if (pg.src) {
    const img = document.createElement('img');
    img.src = pg.src;
    img.alt = pg.label || '';
    card.appendChild(img);
  } else {
    card.innerHTML = `
      <div class="card-ph">
        <span class="ph-n">${String(i + 1).padStart(2, '0')}</span>
        ${pg.label ? `<span class="ph-lbl">${pg.label}</span>` : ''}
      </div>
      <span class="card-pg-num">${String(i + 1).padStart(2, '0')}</span>
    `;
  }

  card.addEventListener('click', () => {
    const pos = wrappedPos(i);
    if (pos === 0 || animating) return;
    go(pos > 0 ? 1 : -1);
  });

  track.appendChild(card);
  cards.push(card);
});

// ─── Apply positions ──────────────────────────────────────────
function render(instant = false) {
  cards.forEach((card, i) => {
    const pos = wrappedPos(i);
    const last = card._lastPos;
    // If a card had to hop across the seam (e.g. +2 → -1 on a 4-item ring)
    // snap it to its new position with no animation, so the loop is invisible.
    const jumped = last !== undefined && Math.abs(pos - last) > 1;
    const s = posStyle(pos);

    if (instant || jumped) {
      card.style.transition = 'none';
      Object.assign(card.style, s);
      card.dataset.pos = pos;
      void card.offsetWidth; // flush layout so the transition reset takes effect
      card.style.transition = '';
    } else {
      card.style.transition = '';
      Object.assign(card.style, s);
      card.dataset.pos = pos;
    }
    card._lastPos = pos;
  });

  document.getElementById('card-counter').textContent =
    `${String(current + 1).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}`;

  const cap = document.getElementById('card-caption');
  cap.style.opacity = '0';
  setTimeout(() => {
    cap.textContent = PAGES[current].label || '';
    cap.style.opacity = '1';
  }, 180);

  document.querySelectorAll('.dot').forEach((d, i) =>
    d.classList.toggle('active', i === current));
}

// ─── Navigate ─────────────────────────────────────────────────
function go(dir) {
  if (animating) return;
  animating = true;
  current = (current + dir + TOTAL) % TOTAL;
  render();
  setTimeout(() => { animating = false; }, TRANSITION_MS);
}

// ─── Build dots ───────────────────────────────────────────────
const dotsEl = document.getElementById('dots');
PAGES.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 'dot';
  d.setAttribute('aria-label', `Go to page ${i + 1}`);
  d.addEventListener('click', () => {
    if (i === current || animating) return;
    animating = true;
    current = i;
    render();
    setTimeout(() => { animating = false; }, TRANSITION_MS);
  });
  dotsEl.appendChild(d);
});

// ─── Controls ─────────────────────────────────────────────────
document.getElementById('btn-prev').addEventListener('click', () => go(-1));
document.getElementById('btn-next').addEventListener('click', () => go(1));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  go(-1);
  if (e.key === 'ArrowRight') go(1);
});

// Swipe
let tx0 = 0;
document.getElementById('carousel-scene').addEventListener('touchstart', e => {
  tx0 = e.touches[0].clientX;
}, { passive: true });
document.getElementById('carousel-scene').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx0;
  if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
});

// ─── Init ─────────────────────────────────────────────────────
render(true);
requestAnimationFrame(() => {
  cards.forEach(c => { c.style.transition = ''; });
});
