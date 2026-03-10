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


    




document.querySelector('.cv-button').addEventListener('click', function(e) {
           e.preventDefault();
            
            window.open('CV.pdf', '_blank')
          
});








   



