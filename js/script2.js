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

// Three.js Carousel
window.addEventListener("load", () => {

  // ─────────────────────────────────────────
  // LECTURE URL
  // ─────────────────────────────────────────

  const urlParams   = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');

  if (filterParam) {
    const filterValue = filterParam.toLowerCase();
    document.querySelectorAll(".filters input[type='checkbox']").forEach(cb => {
      if (cb.value.toLowerCase() === filterValue) cb.checked = true;
    });
  }

  // ─────────────────────────────────────────
  // DONNÉES SLIDES
  // ─────────────────────────────────────────

  const slides       = document.querySelectorAll("#slides-data li");
  const totalSlides  = slides.length;

  const slideTitles    = [];
  const slideLinks     = [];
  const slideSubtitles = [];
  const mediaElements  = [];

  let filteredSlides     = Array.from(slides);
  let filteredSlidesData = [];
  let currentOffset      = 0;
  let loadedCount        = 0;

  // ─────────────────────────────────────────
  // CHARGEMENT MÉDIAS
  // ─────────────────────────────────────────

  function loadImages() {
    slides.forEach((slide, i) => {
      const linkTag     = slide.querySelector("a");
      const videoTag    = slide.querySelector("video");
      const imgTag      = slide.querySelector("img");
      const titleTag    = slide.querySelector(".title");
      const subtitleTag = slide.querySelector(".subtitle");

      slideTitles.push(titleTag     ? titleTag.textContent         : "");
      slideLinks.push(linkTag       ? linkTag.getAttribute("href") : "#");
      slideSubtitles.push(subtitleTag ? subtitleTag.textContent    : "");

      if (videoTag) {
        const vid      = document.createElement("video");
        const sourceEl = videoTag.querySelector("source");
        vid.src        = sourceEl ? sourceEl.src : videoTag.src;
        vid.muted      = true;
        vid.loop       = true;
        vid.playsInline = true;
        vid.preload    = "auto";

        vid.addEventListener("canplaythrough", () => {
          vid.play().catch(() => {});
          mediaElements[i] = vid;
          loadedCount++;
          if (loadedCount === totalSlides) initializeScene();
        }, { once: true });

        vid.addEventListener("error", () => {
          const fallbackImg = videoTag.querySelector("img") || imgTag;
          if (fallbackImg) {
            const img   = new Image();
            img.onload  = () => { mediaElements[i] = img;  loadedCount++; if (loadedCount === totalSlides) initializeScene(); };
            img.onerror = () => { mediaElements[i] = null; loadedCount++; if (loadedCount === totalSlides) initializeScene(); };
            img.src = fallbackImg.src;
          } else {
            mediaElements[i] = null;
            loadedCount++;
            if (loadedCount === totalSlides) initializeScene();
          }
        }, { once: true });

        setTimeout(() => {
          if (!mediaElements[i]) {
            mediaElements[i] = vid;
            loadedCount++;
            if (loadedCount === totalSlides) initializeScene();
          }
        }, 5000);

        vid.load();

      } else if (imgTag) {
        const img   = new Image();
        img.onload  = () => { mediaElements[i] = img;  loadedCount++; if (loadedCount === totalSlides) initializeScene(); };
        img.onerror = () => { mediaElements[i] = null; loadedCount++; if (loadedCount === totalSlides) initializeScene(); };
        img.src = imgTag.src;
      } else {
        mediaElements[i] = null;
        loadedCount++;
        if (loadedCount === totalSlides) initializeScene();
      }
    });
  }

  function getMediaSize(media) {
    if (!media) return { w: 1, h: 1 };
    if (media instanceof HTMLVideoElement) return { w: media.videoWidth || 1, h: media.videoHeight || 1 };
    return { w: media.width || 1, h: media.height || 1 };
  }

  // ─────────────────────────────────────────
  // CONFIGURATION RESPONSIVE
  // ─────────────────────────────────────────

  function getMobileConfig() {
    const w = window.innerWidth;

    if (w <= 390) {
      return {
        isMobile:     true,
        parentWidth:  14,
        parentHeight: 55,
        curvature:    10,
        segmentsX:    80,
        segmentsY:    80,
        slideHeight:  14,
        camZ:         20,
        camY:         1,
        lookY:        -1,
        rotX:         -8,
        rotZ:         0,
        fontSize:     55,
        subtitleSize: 28,
        marginX:      0.18,  // ← marges larges pour petit écran
        textPadding:  35,
      };
    } else if (w <= 768) {
      return {
        isMobile:     true,
        parentWidth:  12.5,
        parentHeight: 46.5,
        curvature:    12,
        segmentsX:    100,
        segmentsY:    100,
        slideHeight:  15,
        camZ:         21,
        camY:         1,
        lookY:        -1,
        rotX:         -10,
        rotZ:         0,
        fontSize:     85,
        subtitleSize: 50,
        marginX:      0.14,  // ← marges réduites par rapport aux images
        textPadding:  40,
      };
    } else {
      return {
        isMobile:     false,
        parentWidth:  20,
        parentHeight: 75,
        curvature:    35,
        segmentsX:    200,
        segmentsY:    200,
        slideHeight:  15,
        camZ:         null,
        camY:         5,
        lookY:        -2,
        rotX:         -20,
        rotZ:         -5,
        fontSize:     90,
        subtitleSize: 48,
        marginX:      0.05,  // ← marges desktop originales
        textPadding:  60,
      };
    }
  }

  // ─────────────────────────────────────────
  // SCÈNE THREE.JS
  // ─────────────────────────────────────────

  function initializeScene() {
    const loadingEl = document.querySelector('.loading');
    if (loadingEl) loadingEl.style.display = 'none';

    let cfg = getMobileConfig();

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas:          document.querySelector("canvas"),
      antialias:       true,
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x141414);

    // ── Géométrie ──
    function buildGeometry(c) {
      const geo = new THREE.PlaneGeometry(c.parentWidth, c.parentHeight, c.segmentsX, c.segmentsY);
      const pos = geo.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const y = pos[i + 1];
        const d = Math.abs(y / (c.parentHeight / 2));
        pos[i + 2] = Math.pow(d, 2) * c.curvature;
      }
      geo.computeVertexNormals();
      return geo;
    }

    function positionCamera(c) {
      if (c.isMobile) {
        camera.position.set(0, c.camY, c.camZ);
        camera.lookAt(0, c.lookY, 0);
        camera.rotation.z = 0;
      } else {
        const distance = 17.5;
        const offsetX  = distance * Math.sin(THREE.MathUtils.degToRad(20));
        const offsetZ  = distance * Math.cos(THREE.MathUtils.degToRad(20));
        camera.position.set(offsetX, c.camY, offsetZ);
        camera.lookAt(0, c.lookY, 0);
        camera.rotation.z = THREE.MathUtils.degToRad(c.rotZ);
      }
    }

    let parentGeometry = buildGeometry(cfg);

    const textureCanvas = document.createElement("canvas");
    const ctx = textureCanvas.getContext("2d");
    textureCanvas.width  = 2048;
    textureCanvas.height = 8192;

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS     = THREE.RepeatWrapping;
    texture.wrapT     = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const parentMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    let parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
    parentMesh.rotation.x = THREE.MathUtils.degToRad(cfg.rotX);
    parentMesh.rotation.y = cfg.isMobile ? 0 : THREE.MathUtils.degToRad(20);
    positionCamera(cfg);
    scene.add(parentMesh);

    // ── Données filtrées ──
    function buildFilteredData() {
      filteredSlidesData = filteredSlides.map(slide => {
        const globalIndex = Array.from(slides).indexOf(slide);
        return {
          globalIndex,
          title:    slideTitles[globalIndex],
          subtitle: slideSubtitles[globalIndex],
          link:     slideLinks[globalIndex],
        };
      });
    }

    if (filterParam) {
      const fv = filterParam.toLowerCase();
      filteredSlides = Array.from(slides).filter(slide => {
        const cats = slide.dataset.category.split(",").map(s => s.trim().toLowerCase());
        return cats.includes(fv);
      });
    }
    buildFilteredData();

    // ── Dessin texture ──
    function updateTexture(offset = 0) {
      currentOffset = offset;

      const gap = 0.5;
      const sh  = cfg.slideHeight;
      const fs  = cfg.fontSize;
      const ss  = cfg.subtitleSize;
      const tp  = cfg.textPadding;
      const mx  = cfg.marginX;

      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

      const currentSlides = filteredSlidesData.length;

      if (currentSlides === 0) {
        ctx.fillStyle    = "#eceae9";
        ctx.font         = `300 80px hubot`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Aucun projet", textureCanvas.width / 2, textureCanvas.height / 2);
        texture.needsUpdate = true;
        renderer.render(scene, camera);
        return;
      }

      const baseCount   = Math.max(currentSlides, 5);
      const cycleHeight = baseCount * (sh + gap);
      const extraSlides = 2;

      for (let i = -extraSlides; i < currentSlides + extraSlides; i++) {
        let slideY  = -i * (sh + gap);
        slideY     += offset * cycleHeight;

        const textureY = (slideY / cycleHeight) * textureCanvas.height;
        let wrappedY   = textureY % textureCanvas.height;
        if (wrappedY < 0) wrappedY += textureCanvas.height;

        const slideIndex = ((i % currentSlides) + currentSlides) % currentSlides;
        const slideData  = filteredSlidesData[slideIndex];
        const media      = mediaElements[slideData.globalIndex];

        // ← marginX contrôle la largeur des slides dans la texture
        const slideRect = {
          x:      textureCanvas.width * mx,
          y:      wrappedY,
          width:  textureCanvas.width * (1 - mx * 2),
          height: (sh / cycleHeight) * textureCanvas.height,
        };

        if (media) {
          const { w, h }   = getMediaSize(media);
          const imgAspect  = w / h;
          const rectAspect = slideRect.width / slideRect.height;
          let drawWidth, drawHeight, drawX, drawY;

          if (imgAspect > rectAspect) {
            drawHeight = slideRect.height;
            drawWidth  = drawHeight * imgAspect;
            drawX = slideRect.x + (slideRect.width - drawWidth) / 2;
            drawY = slideRect.y;
          } else {
            drawWidth  = slideRect.width;
            drawHeight = drawWidth / imgAspect;
            drawX = slideRect.x;
            drawY = slideRect.y + (slideRect.height - drawHeight) / 2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.rect(slideRect.x, slideRect.y, slideRect.width, slideRect.height);
          ctx.clip();
          ctx.drawImage(media, drawX, drawY, drawWidth, drawHeight);

          // Dégradé bas
          const gradH = slideRect.height * 0.45;
          const grad  = ctx.createLinearGradient(
            0, slideRect.y + slideRect.height - gradH,
            0, slideRect.y + slideRect.height
          );
          grad.addColorStop(0, "rgba(0,0,0,0)");
          grad.addColorStop(1, "rgba(0,0,0,0.72)");
          ctx.fillStyle = grad;
          ctx.fillRect(slideRect.x, slideRect.y + slideRect.height - gradH, slideRect.width, gradH);
          ctx.restore();

          // Texte
          const textX    = slideRect.x + tp;
          const subtitleY = slideRect.y + slideRect.height - tp;
          const titleY    = subtitleY - ss - 18;

          ctx.textAlign    = "left";
          ctx.textBaseline = "bottom";
          ctx.fillStyle    = "#eceae9";
          ctx.font         = `300 ${ss}px hubot`;
          ctx.fillText(slideData.subtitle, textX, subtitleY);
          ctx.font         = `500 ${fs}px hubot`;
          ctx.fillText(slideData.title, textX, titleY);

        } else {
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle    = "#eceae9";
          ctx.font         = `500 ${fs}px hubot`;
          ctx.fillText(slideData.title,    textureCanvas.width / 2, wrappedY + slideRect.height / 2);
          ctx.font         = `300 ${ss}px hubot`;
          ctx.fillText(slideData.subtitle, textureCanvas.width / 2, wrappedY + slideRect.height / 2 + ss + 10);
        }
      }

      texture.needsUpdate = true;
      renderer.render(scene, camera);
    }

    // ── Animation ──
    let offset    = 0;
    let velocity  = 0;
    const accel   = cfg.isMobile ? 0.00002 : 0.00001;
    const friction = 0.9;

    function animate() {
      if (Math.abs(velocity) > 0.00001) {
        offset   += velocity;
        velocity *= friction;
        offset   %= 1;
        if (offset < 0) offset += 1;
      }
      updateTexture(offset);
      requestAnimationFrame(animate);
    }
    animate();

    // ── Interactions scroll / touch ──
    window.addEventListener("wheel",      e => { velocity += -e.deltaY * accel; }, { passive: true });
    window.addEventListener("touchstart", e => { lastY = e.touches[0].clientY; },  { passive: true });

    let lastY = null;
    window.addEventListener("touchmove", e => {
      const y = e.touches[0].clientY;
      velocity += (y - lastY) * (accel * 1.5);
      lastY = y;
    }, { passive: true });

    // ── Resize ──
    let resizeTimeout;
    window.addEventListener("resize", () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cfg = getMobileConfig();

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        scene.remove(parentMesh);
        parentGeometry.dispose();
        parentGeometry = buildGeometry(cfg);
        parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
        parentMesh.rotation.x = THREE.MathUtils.degToRad(cfg.rotX);
        parentMesh.rotation.y = cfg.isMobile ? 0 : THREE.MathUtils.degToRad(20);
        scene.add(parentMesh);

        positionCamera(cfg);
      }, 250);
    });

    // ── Filtres ──
    const checkboxes = document.querySelectorAll(".filters input[type='checkbox']");
    const canvas     = renderer.domElement;

    checkboxes.forEach(cb => cb.addEventListener("change", () => {
      canvas.classList.add("fade-out");
      setTimeout(() => {
        const active = Array.from(checkboxes)
          .filter(c => c.checked)
          .map(c => c.value.toLowerCase());

        filteredSlides = Array.from(slides).filter(slide => {
          const cats = slide.dataset.category.split(",").map(s => s.trim().toLowerCase());
          return active.length === 0 || active.some(cat => cats.includes(cat));
        });

        buildFilteredData();
        offset   = 0;
        velocity = 0;

        canvas.classList.remove("fade-out");
        canvas.classList.add("fade-in");
        setTimeout(() => canvas.classList.remove("fade-in"), 800);
      }, 400);
    }));

    // ── Clic sur un slide ──
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    renderer.domElement.addEventListener("click", event => {
      if (filteredSlidesData.length === 0) return;

      mouse.x = (event.clientX / window.innerWidth)  * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(parentMesh);

      if (intersects.length > 0) {
        const uv    = intersects[0].uv;
        const texY  = uv.y * textureCanvas.height;
        const gap   = 0.5;
        const sh    = cfg.slideHeight;
        const count = filteredSlidesData.length;
        const cycle = Math.max(count, 5) * (sh + gap);

        let clickedSlide = null;
        let minDist      = Infinity;

        for (let i = 0; i < count + 4; i++) {
          let slideY  = -i * (sh + gap);
          slideY     += currentOffset * cycle;

          const ty = (slideY / cycle) * textureCanvas.height;
          let wy   = ty % textureCanvas.height;
          if (wy < 0) wy += textureCanvas.height;

          const slH  = (sh / cycle) * textureCanvas.height;
          const ctr  = wy + slH / 2;
          let dist   = Math.abs(texY - ctr);
          if (dist > textureCanvas.height / 2) dist = textureCanvas.height - dist;

          if (dist < slH / 2 * 0.9 && dist < minDist) {
            minDist = dist;
            const idx = ((i % count) + count) % count;
            clickedSlide = filteredSlidesData[idx];
          }
        }

        if (clickedSlide) window.location.href = clickedSlide.link;
      }
    });
  }

  loadImages();
});