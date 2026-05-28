(function () {
  "use strict";

  function initHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function markActiveNav() {
    const parts = window.location.pathname.replace(/\\/g, "/").split("/");
    let path = parts.pop() || "";
    if (!path) path = "index.html";
    document.querySelectorAll(".site-nav a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path) a.classList.add("is-active");
    });
  }

  function closeMenuOnNavigate() {
    const toggle = document.getElementById("menu-toggle");
    if (!toggle) return;
    document.querySelectorAll(".site-nav a").forEach((a) => {
      a.addEventListener("click", () => {
        toggle.checked = false;
      });
    });
  }

  function initCarousel() {
    const root = document.querySelector(".qg-carousel");
    if (!root) return;

    const track = root.querySelector(".qg-carousel__track");
    const slides = [...root.querySelectorAll(".qg-carousel__slide")];
    const prevBtn = root.querySelector(".qg-carousel__btn--prev");
    const nextBtn = root.querySelector(".qg-carousel__btn--next");
    const dotsContainer = root.querySelector(".qg-carousel__dots");

    if (!track || slides.length === 0) return;

    let index = 0;
    let autoplayId = null;
    const interval = 7500;

    function renderDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "qg-carousel__dot";
        b.setAttribute("aria-label", "Ir a la diapositiva " + (i + 1));
        b.addEventListener("click", () => go(i));
        dotsContainer.appendChild(b);
      });
    }

    function syncDots() {
      if (!dotsContainer) return;
      dotsContainer.querySelectorAll(".qg-carousel__dot").forEach((d, i) => {
        d.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      syncDots();
      restartAutoplay();
    }

    function next() {
      go(index + 1);
    }

    function prev() {
      go(index - 1);
    }

    function stopAutoplay() {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function startAutoplay() {
      stopAutoplay();
      if (reduceMotion.matches) return;
      autoplayId = setInterval(next, interval);
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    renderDots();
    go(0);
    startAutoplay();

    prevBtn?.addEventListener("click", prev);
    nextBtn?.addEventListener("click", next);

    root.addEventListener("mouseenter", () => {
      if (!reduceMotion.matches) stopAutoplay();
    });
    root.addEventListener("mouseleave", startAutoplay);

    root.setAttribute("tabindex", "0");
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carrusel");
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    });

    let touchStartX = null;
    root.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    root.addEventListener(
      "touchend",
      (e) => {
        if (touchStartX === null) return;
        const dx = e.changedTouches[0].screenX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) < 50) return;
        if (dx < 0) next();
        else prev();
      },
      { passive: true }
    );
  }

  function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll(".gallery img, .character-card img");
    if (!galleryItems.length) return;

    const body = document.body;
    let overlay = document.getElementById("overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "overlay";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
    }

    galleryItems.forEach((item) => {
      item.addEventListener("click", function () {
        const expandedImg = document.createElement("img");
        expandedImg.src = item.currentSrc || item.src;
        expandedImg.alt = item.alt || "";
        expandedImg.classList.add("expanded-img");

        const caption = document.createElement("div");
        caption.classList.add("caption");
        caption.textContent = item.alt || "";

        overlay.innerHTML = "";
        overlay.appendChild(expandedImg);
        overlay.appendChild(caption);
        body.appendChild(overlay);
        body.classList.add("blurred");
        overlay.style.display = "flex";

        requestAnimationFrame(() => {
          expandedImg.classList.add("expanded");
          caption.classList.add("visible");
        });
      });
    });

    overlay.addEventListener("click", function () {
      const expandedImg = overlay.querySelector(".expanded-img");
      const caption = overlay.querySelector(".caption");

      if (expandedImg) expandedImg.classList.remove("expanded");
      if (caption) caption.classList.remove("visible");

      setTimeout(() => {
        overlay.style.display = "none";
        body.classList.remove("blurred");
      }, 400);
    });
  }

  function initReveal() {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    markActiveNav();
    closeMenuOnNavigate();
    initCarousel();
    initGalleryLightbox();
    initReveal();
  });
})();
