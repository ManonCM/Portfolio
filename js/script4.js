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



  // -----------------------------
  // --- CARROUSELS ---
  // -----------------------------




const carouselConfig = {
    'carousel1': { desktopVisible: 4 },
    'carousel2': { desktopVisible: 3 },
    'carousel3': { desktopVisible: 3 },
    'carousel4': { desktopVisible: 3 },
  };

  // État par carousel : { currentIndex, visible, originalLength, initialized }
  const state = {};

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getVisibleCount(id) {
    const base = carouselConfig[id]?.desktopVisible || 3;
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return Math.min(base, 2);
    return base;
  }

  // Calcule l'offset pour centrer les items visibles à partir de currentIndex
  function getCenteredOffset(carousel, index, visible) {
    const items = carousel.querySelectorAll('.carousel-item');
    const gap = isMobile() ? 12 : 20;
    const wrapperWidth = carousel.parentElement.offsetWidth;

    // Offset brut jusqu'à l'index
    let rawOffset = 0;
    for (let i = 0; i < index; i++) {
      rawOffset += items[i].offsetWidth + gap;
    }

    // Largeur totale des items visibles
    let visibleWidth = 0;
    for (let i = 0; i < visible; i++) {
      if (items[index + i]) visibleWidth += items[index + i].offsetWidth + gap;
    }
    visibleWidth -= gap;

    // Ajustement pour centrer dans le wrapper
    const centerAdjust = (wrapperWidth - visibleWidth) / 2;
    return rawOffset - centerAdjust;
  }

  // Applique le transform (animated = false pour saut silencieux)
  function applyTransform(id, animated) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const s = state[id];
    carousel.style.transition = animated ? 'transform 0.8s ease' : 'none';
    const offset = getCenteredOffset(carousel, s.currentIndex, s.visible);
    carousel.style.transform = `translateX(-${offset}px)`;
  }

  // Met à jour les opacités : seul(s) le(s) item(s) actif(s) sont à 1
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

    // Supprime les anciens clones si réinit
    carousel.querySelectorAll('.clone').forEach(el => el.remove());

    const visible = getVisibleCount(id);
    const originalItems = Array.from(carousel.querySelectorAll('.carousel-item:not(.clone)'));
    const originalLength = originalItems.length;

    // Clones de fin placés au début (pour boucle vers la gauche)
    for (let i = originalLength - visible; i < originalLength; i++) {
      const clone = originalItems[i].cloneNode(true);
      clone.classList.add('clone');
      carousel.insertBefore(clone, carousel.firstChild);
    }

    // Clones du début placés à la fin (pour boucle vers la droite)
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

    // Attend que les images soient chargées pour bien calculer les offsets
    const allImgs = Array.from(carousel.querySelectorAll('img'));

    if (allImgs.length === 0) {
      applyTransform(id, false);
      updateOpacity(id);
      setTimeout(() => { state[id].initialized = true; }, 50);
      return;
    }

    let loaded = 0;
    function onLoad() {
      loaded++;
      if (loaded >= allImgs.length) {
        applyTransform(id, false);
        updateOpacity(id);
        setTimeout(() => { state[id].initialized = true; }, 50);
      }
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

    // Après l'animation, saut silencieux si on dépasse les bornes
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
      }
    }, 820);
  }

  window.slideCarousel = slideCarousel;

  // ─────────────────────────────────────────
  // INIT TOUS LES CAROUSELS
  // ─────────────────────────────────────────

  ['carousel1', 'carousel2', 'carousel3', 'carousel4'].forEach(id => {
    initCarousel(id);
  });

  // ─────────────────────────────────────────
  // RESIZE — réinit complète au changement de taille
  // ─────────────────────────────────────────

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ['carousel1', 'carousel2', 'carousel3', 'carousel4'].forEach(id => {
        initCarousel(id);
      });
    }, 200);
  });

});
