/* ══════════════════════════════════════════════════════════
   ENVELOPE INTRO — logic (slow-mo ending + dissolve mulus)
   - Video diam (paused, frame pertama) → ketuk → play.
   - Sisa SLOW_START detik → video dipelanin (1.0 → 0.6 rate).
   - Sisa FADE_START detik (real-time, setelah diperhitungkan
     slow-mo) → GSAP dissolve: opacity + scale + blur.
   - Halaman utama sudah render di belakang → terungkap.
══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var overlay  = document.getElementById('envelope-intro');
  var video    = document.getElementById('envelope-video');
  var tapBtn   = document.getElementById('envelope-tap');
  if (!overlay || !video) return;

  /* Zona slow-mo: mulai 1.6s sebelum video habis */
  var SLOW_START = 1.6;
  var SLOW_RATE  = 0.6;
  /* Zona fade: mulai ~0.9s sebelum video habis */
  var FADE_START = 0.9;

  document.documentElement.style.overflow = 'hidden';

  var dissolved = false;

  function unlockPage() {
    document.documentElement.style.overflow = '';
  }

  /* Dissolve: envelope fade — bunga di belakang terbuka natural */
  function dissolve() {
    if (dissolved) return;
    dissolved = true;

    var remaining = 1.2;
    if (video.duration && !isNaN(video.duration)) {
      remaining = Math.max(video.duration - video.currentTime, 0.8);
    }

    gsap.to(overlay, {
      opacity: 0,
      scale: 1.06,
      filter: 'blur(10px)',
      duration: remaining,
      ease: 'sine.inOut',
      onComplete: function () {
        overlay.style.display = 'none';
        overlay.style.willChange = 'auto';
        /* Aktifkan flower overlay (naikkan z-index ke atas envelope) */
        var flowers = document.getElementById('flower-overlay');
        if (flowers) flowers.classList.add('active');
        unlockPage();
      }
    });
  }

  /* Pantau waktu: slow-mo + fade trigger */
  function onTime() {
    if (!video.duration || isNaN(video.duration)) return;
    var remaining = video.duration - video.currentTime;

    if (remaining <= SLOW_START && video.playbackRate !== SLOW_RATE) {
      video.playbackRate = SLOW_RATE;
    }

    if (remaining <= FADE_START && !dissolved) {
      dissolve();
    }
  }
  video.addEventListener('timeupdate', onTime);

  function startVideo() {
    if (!video.paused) return;
    overlay.classList.add('playing');
    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { dissolve(); });
    }
  }

  if (tapBtn) tapBtn.addEventListener('click', startVideo);
  overlay.addEventListener('click', startVideo);

  video.addEventListener('loadeddata', function () {
    video.currentTime = 0;
  });
})();
