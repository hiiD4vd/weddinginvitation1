/* ══════════════════════════════════════════════════════════
   WEDDING INVITATION – script.js
   Zohan & Rose | 27.09.2026
══════════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. FLOATING PETALS ──────────────────────────────── */
(function initPetals() {
  const container = document.getElementById('petals');
  if (!container) return;

  const emojis = ['🌸', '🌹', '🌺', '✿', '❀', '💮'];
  const count  = 18;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const left     = Math.random() * 100;
    const duration = 6 + Math.random() * 10;  // 6–16s
    const delay    = Math.random() * 12;       // stagger start

    petal.style.cssText = `
      left: ${left}%;
      font-size: ${0.7 + Math.random() * 0.8}rem;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      opacity: ${0.4 + Math.random() * 0.5};
    `;
    container.appendChild(petal);
  }
})();

/* ─── 1b. FLOWER OVERLAY — posisi & scroll ───────────────── */
(function initFlowerOverlay() {
  var overlay = document.getElementById('flower-overlay');
  var flowerL = document.getElementById('flower-left');
  var flowerR = document.getElementById('flower-right');
  var cover   = document.getElementById('cover');
  var wrapper = document.getElementById('app-wrapper');
  if (!overlay || !flowerL || !flowerR || !cover || !wrapper) return;

  function place() {
    var r        = wrapper.getBoundingClientRect();
    var size     = Math.min(wrapper.offsetWidth * 0.48, 230);
    var overhang = 40;
    flowerL.style.width = size + 'px';
    flowerL.style.left  = Math.max(0, r.left - overhang) + 'px';
    flowerR.style.width = size + 'px';
    flowerR.style.right = Math.max(0, window.innerWidth - r.right - overhang) + 'px';
    flowerR.style.left  = 'auto';
  }

  place();
  window.addEventListener('resize', place, { passive: true });

  window.addEventListener('scroll', function () {
    if (!overlay.classList.contains('active')) return;
    var bottom = cover.getBoundingClientRect().bottom;
    /* Sembunyikan hanya saat cover section benar-benar habis dari layar */
    overlay.classList.toggle('hidden', bottom < 0);
  }, { passive: true });
})();

/* ─── 2. SCROLL REVEAL ────────────────────────────────── */

(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // Stagger siblings slightly
          const siblings = entry.target.parentElement
            ? [...entry.target.parentElement.querySelectorAll('.reveal')]
            : [];
          const order = siblings.indexOf(entry.target);
          const delay = Math.min(order * 120, 400);

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => observer.observe(el));
})();

/* ─── 3. COUNTDOWN TIMER ──────────────────────────────── */
(function initCountdown() {
  const weddingDate = new Date('2026-09-27T08:00:00+07:00');

  const elDays    = document.getElementById('cd-days');
  const elHours   = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');

  if (!elDays) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      elDays.textContent    = '00';
      elHours.textContent   = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    elDays.textContent    = pad(d);
    elHours.textContent   = pad(h);
    elMinutes.textContent = pad(m);
    elSeconds.textContent = pad(s);

    // Pulse animation on seconds
    elSeconds.style.transform = 'scale(1.08)';
    setTimeout(() => { elSeconds.style.transform = 'scale(1)'; }, 150);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ─── 4. MUSIC TOGGLE ─────────────────────────────────── */
(function initMusic() {
  const btn      = document.getElementById('music-btn');
  const audio    = document.getElementById('bg-music');
  const iconPlay = document.getElementById('icon-play');
  const iconPause= document.getElementById('icon-pause');

  if (!btn || !audio) return;

  let playing = false;

  btn.addEventListener('click', () => {
    if (!audio.src && !audio.querySelector('source')) {
      // No music file configured – just toggle icon as demo
      playing = !playing;
    } else {
      if (playing) {
        audio.pause();
        playing = false;
      } else {
        audio.play().catch(() => {});
        playing = true;
      }
    }

    iconPlay.style.display  = playing ? 'none'  : 'block';
    iconPause.style.display = playing ? 'block' : 'none';

    btn.style.background = playing
      ? 'rgba(201,123,138,.9)'   // rose when playing
      : 'rgba(184,136,42,.9)';   // gold when paused
  });
})();

/* ─── 5. RSVP FORM SUBMIT ─────────────────────────────── */
function submitRSVP(e) {
  e.preventDefault();

  const name    = document.getElementById('rsvp-name').value.trim();
  const attend  = document.getElementById('rsvp-attend').value;
  const message = document.getElementById('rsvp-message').value.trim();

  if (!name || !attend) return;

  const wall = document.getElementById('wishes-wall');
  const btn  = document.getElementById('rsvp-submit-btn');

  // Build card
  const card = document.createElement('div');
  card.className = 'wish-card';
  card.style.animation = 'none';

  const attendLabel = {
    hadir:   'Hadir',
    tidak:   'Tidak Hadir',
    mungkin: 'Mungkin Hadir'
  }[attend] || '';

  const attendClass = attend === 'hadir' ? 'hadir' : 'tidak';

  card.innerHTML = `
    <div class="wish-avatar">${name.charAt(0).toUpperCase()}</div>
    <div class="wish-body">
      <strong>${escapeHtml(name)}</strong>
      ${message ? `<p>${escapeHtml(message)}</p>` : ''}
      <span class="wish-attend ${attendClass}">${attendLabel}</span>
    </div>
  `;

  // Animate in
  card.style.opacity  = '0';
  card.style.transform = 'translateY(20px)';
  wall.prepend(card);

  requestAnimationFrame(() => {
    card.style.transition = 'opacity .5s ease, transform .5s ease';
    card.style.opacity    = '1';
    card.style.transform  = 'translateY(0)';
  });

  // Reset form
  e.target.reset();

  // Button feedback
  btn.textContent = '✅ Terkirim!';
  btn.style.background = 'linear-gradient(135deg, #4a8a4a, #6aaa6a)';
  setTimeout(() => {
    btn.textContent = 'Kirim Ucapan 💌';
    btn.style.background = '';
  }, 2500);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── 6. SMOOTH ACTIVE NAV (optional future nav bar) ───── */
// Highlights nav links as user scrolls through sections
(function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Future nav links can listen to 'active-section' event
          document.dispatchEvent(new CustomEvent('active-section', {
            detail: { id: entry.target.id }
          }));
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => observer.observe(s));
})();

/* ─── 7. PARALLAX ON COVER BG — DISABLED (video background harus stabil) ── */
/* Mouse-parallax dinonaktifkan agar video background tidak bergerak mengikuti kursor. */

/* ─── 8. GALLERY LIGHTBOX (basic) ────────────────────────── */
(function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Create lightbox overlay
  const overlay = document.createElement('div');
  overlay.id = 'gallery-lightbox';
  overlay.style.cssText = `
    display:none; position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,.85); align-items:center; justify-content:center;
    cursor:zoom-out;
  `;
  document.body.appendChild(overlay);

  const img = document.createElement('img');
  img.style.cssText = 'max-width:90vw; max-height:90vh; border-radius:12px; box-shadow:0 8px 40px rgba(0,0,0,.5);';
  overlay.appendChild(img);

  items.forEach(item => {
    const realImg = item.querySelector('img');
    if (!realImg) return; // skip placeholders

    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      img.src = realImg.src;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  });
})();

/* ─── 9. PRELOADER FADE ────────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .6s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

/* ─── 10. SCROLL-TO-TOP ON COVER LOGO CLICK ──────────── */
document.addEventListener('DOMContentLoaded', () => {
  const scrollHint = document.getElementById('scroll-hint-btn');
  if (scrollHint) {
    scrollHint.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('greeting');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
