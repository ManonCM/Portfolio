document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // --- NAVBAR SLIDE-OUT ---
  // -----------------------------
  const menu = document.querySelector(".menu-container");
  const overlay = document.querySelector(".overlay");
  const hamburger = document.querySelector(".hamburger");
  const menuToggle = document.querySelector(".menu-toggle");
  const links = document.querySelectorAll(".menu-links .link");

  const tlMenu = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  tlMenu.to(menu, { duration: 0.4, right: 0 })
        .to(overlay, { duration: 0.3, autoAlpha: 1 }, "-=0.3")
        .to(links, { duration: 0.4, opacity: 1, x: 0, stagger: 0.1 }, "-=0.1");

  function openNav() { hamburger.classList.add("active"); tlMenu.play(); }
  function closeNav() { hamburger.classList.remove("active"); tlMenu.reverse(); }

  menuToggle.addEventListener("click", () => {
    hamburger.classList.contains("active") ? closeNav() : openNav();
  });
  overlay.addEventListener("click", closeNav);
  document.querySelectorAll(".menu-container a").forEach(link => link.addEventListener("click", closeNav));

  // -----------------------------
  // --- HEADER QUI DISPARAIT ---
  // -----------------------------
  let prevScroll = window.pageYOffset;
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    const curr = window.pageYOffset;
    if (curr <= 0 || prevScroll > curr) header.style.top = "0";
    else header.style.top = "-100px";
    prevScroll = curr;
  });

  // -----------------------------
  // --- FILTRE AUTO URL ---
  // -----------------------------
  setTimeout(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) {
      const cb = Array.from(document.querySelectorAll(".filters input[type='checkbox']"))
                      .find(c => c.value.toLowerCase() === cat.toLowerCase());
      if (cb) { cb.checked = true; cb.dispatchEvent(new Event("change")); }
    }
  }, 50);

});



  // -----------------------------
  // --- CARROUSELS ---
  // -----------------------------

  const carouselConfig = {
    'carousel1': { desktopVisible: 3 },
    'carousel2': { desktopVisible: 3 },
    'carousel3': { desktopVisible: 3 },
  };

  const state = {};

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────

  function getVisibleCount(id) {
    const base = carouselConfig[id]?.desktopVisible || 3;
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return Math.min(base, 2);
    return base;
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getCenteredOffset(carousel, index, visible) {
    const items = carousel.querySelectorAll('.carousel-item');
    const gap = isMobile() ? 12 : 20;
    const wrapperWidth = carousel.parentElement.offsetWidth;

    let rawOffset = 0;
    for (let i = 0; i < index; i++) {
      rawOffset += items[i].offsetWidth + gap;
    }

    let visibleWidth = 0;
    for (let i = 0; i < visible; i++) {
      if (items[index + i]) visibleWidth += items[index + i].offsetWidth + gap;
    }
    visibleWidth -= gap;

    const centerAdjust = (wrapperWidth - visibleWidth) / 2;
    return rawOffset - centerAdjust;
  }

  function applyTransform(id, animated) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const s = state[id];
    carousel.style.transition = animated ? 'transform 0.8s ease' : 'none';
    const offset = getCenteredOffset(carousel, s.currentIndex, s.visible);
    carousel.style.transform = `translateX(-${offset}px)`;
  }

  function updateOpacity(id) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const s = state[id];
    const items = carousel.querySelectorAll('.carousel-item');
    items.forEach(item => item.style.opacity = '0.4');
    for (let i = 0; i < s.visible; i++) {
      const item = items[s.currentIndex + i];
      if (item) item.style.opacity = '1';
    }
  }

  // ─────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────

  function initCarousel(id) {
    const carousel = document.getElementById(id);
    if (!carousel) return;

    carousel.querySelectorAll('.clone').forEach(el => el.remove());

    const visible = getVisibleCount(id);
    const originalItems = Array.from(carousel.querySelectorAll('.carousel-item:not(.clone)'));
    const originalLength = originalItems.length;

    // Clones de fin placés au début
    for (let i = originalLength - visible; i < originalLength; i++) {
      const clone = originalItems[i].cloneNode(true);
      clone.classList.add('clone');
      carousel.insertBefore(clone, carousel.firstChild);
    }

    // Clones du début placés à la fin
    for (let i = 0; i < visible; i++) {
      const clone = originalItems[i].cloneNode(true);
      clone.classList.add('clone');
      carousel.appendChild(clone);
    }

    state[id] = {
      currentIndex: visible,
      visible,
      originalLength,
      initialized: false,
    };

    // Les carousels vidéo n'ont pas d'images — on positionne directement
    const allImgs = Array.from(carousel.querySelectorAll('img'));

    function doPosition() {
      setTimeout(() => {
        applyTransform(id, false);
        updateOpacity(id);
        setTimeout(() => { state[id].initialized = true; }, 50);
      }, 100);
    }

    if (allImgs.length === 0) {
      doPosition();
      return;
    }

    let loaded = 0;
    function onLoad() {
      loaded++;
      if (loaded >= allImgs.length) doPosition();
    }

    allImgs.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        onLoad();
      } else {
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onLoad);
      }
    });
  }

  // ─────────────────────────────────────────
  // SLIDE
  // ─────────────────────────────────────────

  function slideCarousel(id, direction) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const s = state[id];
    if (!s || !s.initialized) return;

    s.currentIndex += direction;
    applyTransform(id, true);
    updateOpacity(id);

    setTimeout(() => {
      let jumped = false;

      if (s.currentIndex <= s.visible - 1) {
        s.currentIndex = s.originalLength + (s.visible - 1);
        jumped = true;
      } else if (s.currentIndex >= s.originalLength + s.visible) {
        s.currentIndex = s.visible;
        jumped = true;
      }

      if (jumped) {
        applyTransform(id, false);
        updateOpacity(id);
        setTimeout(() => {
          applyTransform(id, false);
          updateOpacity(id);
        }, 50);
      }
    }, 820);
  }

  window.slideCarousel = slideCarousel;

  // ─────────────────────────────────────────
  // INIT TOUS LES CAROUSELS
  // ─────────────────────────────────────────

  ['carousel1', 'carousel2', 'carousel3'].forEach(id => initCarousel(id));

  // Réinit complète au resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ['carousel1', 'carousel2', 'carousel3'].forEach(id => initCarousel(id));
    }, 200);
  });

  document.querySelectorAll('.sound-btn').forEach(btn => {
    const video     = btn.closest('.video-sound-wrapper').querySelector('video');
    const iconMuted = btn.querySelector('.icon-muted');
    const iconSound = btn.querySelector('.icon-sound');

    btn.addEventListener('click', () => {
        video.muted = !video.muted;
        video.volume = 1;
        iconMuted.style.display = video.muted ? 'block' : 'none';
        iconSound.style.display = video.muted ? 'none'  : 'block';
    });
});



  document.querySelectorAll('.video-facade').forEach(facade => {
    facade.addEventListener('click', () => {
      const id = facade.dataset.id;
      facade.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/${id}?autoplay=1&mute=0&loop=1&playlist=${id}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>`;
    });
  });





