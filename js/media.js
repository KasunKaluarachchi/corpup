/* ==========================================================================
   CoreUp — interactive media
   Hero background video · before/after compare slider · lightbox gallery
   --------------------------------------------------------------------------
   Every component here is a progressive no-op: if the markup for a feature
   isn't on the page, its init function returns immediately. Real assets are
   expected at the paths referenced in the HTML — see assets/MEDIA-GUIDE.md.
   Until a file exists there, missing images/video fall back to a clearly
   labelled placeholder via markMediaMissing(), never a fake stand-in photo.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Shared: mark a .media-slot as missing its real asset.
     Exposed on window so inline onerror="" handlers in the HTML can call it.
     --------------------------------------------------------------------- */

  window.markMediaMissing = function (el) {
    var slot = el.closest(".media-slot");
    if (slot) slot.classList.add("is-missing");
  };

  /* ---------------------------------------------------------------------
     1. Hero background video
     Swaps the hero into its video skin only once the file actually plays.
     No file present → onerror never needs to fire; the video element
     simply stays hidden by default CSS and the light hero shows as normal.
     --------------------------------------------------------------------- */

  function initHeroVideo() {
    var hero = document.querySelector(".hero[data-hero-video]");
    var video = hero && hero.querySelector(".hero__video");
    if (!hero || !video) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // keep the static light hero; never autoplay motion

    video.addEventListener("loadeddata", function () {
      hero.classList.add("has-video");
    });
    video.addEventListener("error", function () {
      hero.classList.remove("has-video");
    });

    // Pause off-screen to save battery/bandwidth; resume on scroll back.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) video.play().catch(function () {});
          else video.pause();
        });
      }, { threshold: 0.1 }).observe(hero);
    }

    video.load();
  }

  /* ---------------------------------------------------------------------
     2. Before / after compare slider
     --------------------------------------------------------------------- */

  function initCompare() {
    document.querySelectorAll("[data-compare]").forEach(function (root) {
      var frame = root.querySelector(".compare__frame");
      var range = root.querySelector(".compare__range");
      if (!frame || !range) return;

      function set(value) {
        frame.style.setProperty("--pos", value + "%");
      }

      range.addEventListener("input", function () { set(range.value); });
      set(range.value);

      // Click/drag anywhere on the frame, not only on the native thumb.
      var dragging = false;
      function posFromEvent(e) {
        var rect = frame.getBoundingClientRect();
        var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        return Math.min(100, Math.max(0, (x / rect.width) * 100));
      }
      function moveTo(e) {
        var v = Math.round(posFromEvent(e));
        range.value = v;
        set(v);
      }
      frame.addEventListener("pointerdown", function (e) {
        dragging = true;
        moveTo(e);
      });
      window.addEventListener("pointermove", function (e) {
        if (dragging) moveTo(e);
      });
      window.addEventListener("pointerup", function () { dragging = false; });
    });
  }

  /* ---------------------------------------------------------------------
     3. Lightbox gallery
     --------------------------------------------------------------------- */

  function initGallery() {
    var grid = document.querySelector("[data-gallery]");
    var box = document.getElementById("lightbox");
    if (!grid || !box) return;

    var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery__item"));
    if (!items.length) return;

    var img = box.querySelector(".lightbox__img");
    var slot = box.querySelector(".lightbox__figure .media-slot");
    var caption = box.querySelector(".lightbox__caption");
    var count = box.querySelector(".lightbox__count");
    var closeBtn = box.querySelector(".lightbox__close");
    var prevBtn = box.querySelector(".lightbox__prev");
    var nextBtn = box.querySelector(".lightbox__next");

    var index = 0;
    var lastFocused = null;

    function labelFor(i) {
      var lang = document.documentElement.lang === "en" ? "en" : "sv";
      return lang === "en"
        ? "Image " + (i + 1) + " of " + items.length
        : "Bild " + (i + 1) + " av " + items.length;
    }

    function render() {
      var item = items[index];
      var sourceSlot = item.querySelector(".media-slot");
      var sourceArt = sourceSlot.querySelector(".media-slot__illustration");
      var full = item.dataset.full || item.querySelector("img").src;
      var alt = item.querySelector("img").alt || "";
      var cap = item.dataset.caption || alt;

      slot.classList.remove("is-missing");
      slot.setAttribute("data-label", sourceSlot.getAttribute("data-label") || "");

      // Carry over this item's illustration so the lightbox placeholder
      // matches the grid thumbnail instead of falling back to a plain hatch.
      var existingArt = slot.querySelector(".media-slot__illustration");
      if (existingArt) existingArt.remove();
      if (sourceArt) slot.insertBefore(sourceArt.cloneNode(true), img);

      img.onerror = function () { slot.classList.add("is-missing"); };
      img.alt = alt;
      img.src = full;

      caption.textContent = cap;
      count.textContent = labelFor(index);
    }

    function open(i) {
      lastFocused = document.activeElement;
      index = i;
      render();
      box.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
      document.addEventListener("keydown", onKey);
    }

    function close() {
      box.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      if (lastFocused) lastFocused.focus();
    }

    function step(delta) {
      index = (index + delta + items.length) % items.length;
      render();
    }

    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        // simple focus trap between the three controls
        var focusables = [prevBtn, nextBtn, closeBtn];
        var i = focusables.indexOf(document.activeElement);
        e.preventDefault();
        var next = e.shiftKey
          ? focusables[(i - 1 + focusables.length) % focusables.length]
          : focusables[(i + 1) % focusables.length];
        (next || closeBtn).focus();
      }
    }

    items.forEach(function (item, i) {
      item.addEventListener("click", function () { open(i); });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });
    box.addEventListener("click", function (e) {
      if (e.target === box) close();
    });

    // Touch swipe
    var touchX = null;
    box.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) step(dx > 0 ? -1 : 1);
      touchX = null;
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */

  function boot() {
    initHeroVideo();
    initCompare();
    initGallery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
