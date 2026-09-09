// ── Draggable photo cards ──────────────────────────────────
let topZ = 20;
let activeCard = null;
let ox = 0, oy = 0; // cursor offset from card top-left

function startDrag(card, cx, cy) {
  // Cards are positioned absolutely in document coordinates, so we have to
  // add the current page scroll to viewport-relative rect.left/top.
  const rect = card.getBoundingClientRect();
  card.style.left  = rect.left + window.scrollX + "px";
  card.style.top   = rect.top  + window.scrollY + "px";
  card.style.right  = "auto";
  card.style.bottom = "auto";

  ox = cx - rect.left;
  oy = cy - rect.top;

  card.style.zIndex    = ++topZ;
  card.style.boxShadow = "0 24px 64px rgba(0,0,0,0.38)";

  const rot = parseFloat(card.dataset.rot || 0);
  card.style.transform = `rotate(${rot}deg) scale(1.04)`;

  activeCard = card;
}

function moveDrag(cx, cy) {
  if (!activeCard) return;
  activeCard.style.left = cx - ox + window.scrollX + "px";
  activeCard.style.top  = cy - oy + window.scrollY + "px";
}

function endDrag() {
  if (!activeCard) return;
  const rot = parseFloat(activeCard.dataset.rot || 0);
  activeCard.style.transform = `rotate(${rot}deg) scale(1)`;
  activeCard.style.boxShadow = "";
  activeCard = null;
}

document.querySelectorAll(".photo-card").forEach((card) => {
  // Apply initial rotation
  const rot = parseFloat(card.dataset.rot || 0);
  card.style.transform = `rotate(${rot}deg)`;

  card.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startDrag(card, e.clientX, e.clientY);
    card.style.cursor = "grabbing";
  });

  card.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDrag(card, e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });
});

window.addEventListener("mousemove",  (e) => moveDrag(e.clientX, e.clientY));
window.addEventListener("touchmove",  (e) => { if (activeCard) moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener("mouseup",    () => { endDrag(); if (activeCard === null) document.querySelectorAll(".photo-card").forEach(c => c.style.cursor = "grab"); });
window.addEventListener("touchend",   endDrag);

// ── Drag hint toast ───────────────────────────────────────
(function () {
  const hint = document.createElement("div");
  hint.className = "drag-hint";
  hint.textContent = "✦ drag the photos to rearrange";
  document.body.appendChild(hint);
  hint.addEventListener("animationend", () => hint.remove());
})();

// ── Copy email button ──────────────────────────────────────
const copyBtn = document.getElementById("copy-btn");
if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    const email = copyBtn.dataset.email;
    navigator.clipboard.writeText(email).then(() => {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("copied");
      }, 2000);
    });
  });
}

// ── Back link with page transition ────────────────────────
const backLink = document.getElementById("doc-back");
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
