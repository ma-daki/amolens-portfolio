// main.js
(function () {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  // Duplicate the content once for a seamless loop (do this in JS so you avoid manual duplication errors)
  // Note: we clone nodes instead of innerHTML to preserve event handlers if any are added later
  const originalChildren = Array.from(track.children);
  originalChildren.forEach(node => {
    const clone = node.cloneNode(true);
    track.appendChild(clone);
  });

  // Settings
  const pixelsPerSecond = 50; // scrolling speed (px/sec). Increase to scroll faster
  let isPaused = false;
  let lastTimestamp = null;

  // Polyfill-friendly high-level animation loop using scrollLeft
  function step(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (!isPaused) {
      // Convert speed to px per frame based on delta
      const pxToMove = (pixelsPerSecond * delta) / 1000;
      track.scrollLeft += pxToMove;

      // reset when scrolled past half (we duplicated content once)
      const half = track.scrollWidth / 2;
      if (track.scrollLeft >= half) {
        // jump back to equivalent position within first half to make it seamless
        track.scrollLeft -= half;
      }
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);

  // Helper: pause/resume
  function pauseCarousel() {
    isPaused = true;
  }
  function resumeCarousel() {
    isPaused = false;
  }

  // Interaction: pause when iframe/card is clicked (pointerdown), focused, or hovered
  // Resume when pointer leaves or blur happens.
  // We use pointer events + focus/blur to cover clicks, taps, keyboard focus, etc.
  const cards = track.querySelectorAll('.carousel-card');
  cards.forEach(card => {
    // pointerdown => user intends to interact (click/tap)
    card.addEventListener('pointerdown', (e) => {
      // stop animation so user can interact with iframe
      pauseCarousel();
      // allow a small delay to let the click reach the iframe if needed
      // no further action here; we'll resume later on pointerup/leave/blur
    });

    // pointerup: user released pointer (but might still be playing inside iframe)
    card.addEventListener('pointerup', (e) => {
      // do not immediately resume — wait for pointerleave or blur
      // small timeout not necessary; we rely on blur/leave to resume
    });

    // hover in/out
    card.addEventListener('pointerenter', pauseCarousel);
    card.addEventListener('pointerleave', resumeCarousel);

    // keyboard focus (allow keyboard users)
    card.setAttribute('tabindex', '0'); // make it focusable
    card.addEventListener('focus', pauseCarousel);
    card.addEventListener('blur', resumeCarousel);
  });

  // Also, try to detect when user interacts directly with an iframe element.
  // Browsers don't let us peek into iframe playback state cross-origin, but we can listen to pointer events on the iframe element itself.
  const iframes = track.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    // pointerdown on iframe => pause
    iframe.addEventListener('pointerdown', (e) => {
      pauseCarousel();
      // we give the user a small grace period: if they tap once, let them play; when they move away, we resume
    });
    // when pointer leaves iframe area, resume
    iframe.addEventListener('pointerleave', resumeCarousel);
    // focus/blur also
    iframe.setAttribute('tabindex', '0');
    iframe.addEventListener('focus', pauseCarousel);
    iframe.addEventListener('blur', resumeCarousel);
  });

  // Optional: pause on visibilitychange (when user switches tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseCarousel();
    else resumeCarousel();
  });

  // Optional: make carousel draggable (desktop/touch manual scroll)
  let isDragging = false;
  let startX;
  let startScroll;
  track.addEventListener('pointerdown', (e) => {
    // ignore if user clicked a control element
    isDragging = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.style.cursor = 'grabbing';
    // prevent text/image selection while dragging
    e.preventDefault();
  });
  track.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    track.scrollLeft = startScroll - dx;
  });
  track.addEventListener('pointerup', () => {
    isDragging = false;
    track.style.cursor = '';
  });
  track.addEventListener('pointercancel', () => {
    isDragging = false;
    track.style.cursor = '';
  });
})();
