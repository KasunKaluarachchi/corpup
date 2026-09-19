/* ==========================================================================
   Corpup — site behaviour
   Language switch · mobile navigation · scroll reveal · quote form
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     1. Language switch
     Swedish is the markup default; English comes from window.CORPUP_EN.
     --------------------------------------------------------------------- */

  var EN = window.CORPUP_EN || {};
  var STORAGE_KEY = "corpup-lang";

  /* Page titles per language, keyed by file name. */
  var TITLES = {
    "index.html": {
      title: "Corpup — Data centre, data hall and server room cleaning",
      desc: "Corpup specialises in technical cleaning of data centres, data halls and server rooms. ISO 45001 working environment, ESD-safe methods and HEPA-filtered equipment — without downtime."
    },
    "tjanster.html": {
      title: "Services — Technical data hall cleaning | Corpup",
      desc: "Corpup services: technical data hall cleaning, cleaning beneath raised floors, ESD floor care, construction cleaning, particle measurement to ISO 14644-1, cooling unit cleaning and 24/7 call-out."
    },
    "kvalitet-sakerhet.html": {
      title: "Quality & safety — ISO 45001 | Corpup",
      desc: "Corpup staff work to ISO 45001. Read about our health and safety work, ISO 14644-1 methodology, ESD-safe materials, HEPA filtration, confidentiality and documentation."
    },
    "om-oss.html": {
      title: "About us — Corpup",
      desc: "Corpup is a Swedish cleaning company dedicated entirely to data centres, data halls and server rooms. Read about who we are and how we work."
    },
    "kontakt.html": {
      title: "Contact & quotes — Corpup",
      desc: "Contact Corpup for a free assessment of your data hall. Quote requests, 24/7 emergency line and contact details."
    }
  };

  function currentPage() {
    var file = window.location.pathname.split("/").pop();
    return file === "" ? "index.html" : file;
  }

  /* Remember the original Swedish content the first time we touch a node. */
  function original(el) {
    if (el.dataset.i18nSv === undefined) el.dataset.i18nSv = el.innerHTML;
    return el.dataset.i18nSv;
  }

  function originalAttr(el, attr) {
    var key = "i18nSv_" + attr.replace(/-/g, "_");
    if (el.dataset[key] === undefined) el.dataset[key] = el.getAttribute(attr) || "";
    return el.dataset[key];
  }

  function applyLang(lang) {
    var toEnglish = lang === "en";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var sv = original(el);
      var key = el.getAttribute("data-i18n");
      el.innerHTML = toEnglish && EN[key] ? EN[key] : sv;
    });

    /* Attributes: data-i18n-attr="placeholder:form.placeholder, title:some.key" */
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length !== 2) return;
        var attr = parts[0].trim();
        var key = parts[1].trim();
        var sv = originalAttr(el, attr);
        el.setAttribute(attr, toEnglish && EN[key] ? EN[key] : sv);
      });
    });

    /* Document language, title and meta description. */
    document.documentElement.lang = toEnglish ? "en" : "sv";

    var meta = TITLES[currentPage()];
    if (meta) {
      if (document.body.dataset.svTitle === undefined) {
        document.body.dataset.svTitle = document.title;
      }
      document.title = toEnglish ? meta.title : document.body.dataset.svTitle;

      var descTag = document.querySelector('meta[name="description"]');
      if (descTag) {
        if (document.body.dataset.svDesc === undefined) {
          document.body.dataset.svDesc = descTag.getAttribute("content") || "";
        }
        descTag.setAttribute("content", toEnglish ? meta.desc : document.body.dataset.svDesc);
      }
    }

    /* Toggle state */
    document.querySelectorAll(".lang button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  function initLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }

    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    var lang = (fromUrl === "en" || fromUrl === "sv") ? fromUrl
             : (stored === "en" || stored === "sv") ? stored
             : "sv";

    if (lang === "en") applyLang("en");
    else applyLang("sv");

    document.querySelectorAll(".lang button").forEach(function (btn) {
      btn.addEventListener("click", function () { applyLang(btn.dataset.lang); });
    });
  }

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "sv";
  }

  function t(key, fallbackSv) {
    return lang() === "en" && EN[key] ? EN[key] : fallbackSv;
  }

  /* ---------------------------------------------------------------------
     2. Mobile navigation
     --------------------------------------------------------------------- */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------------
     3. Scroll reveal
     --------------------------------------------------------------------- */

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    // Stagger siblings that share a parent (grid cards, steps, FAQ items,
    // gallery thumbnails…) so they cascade in rather than all appearing at
    // once. Elements far apart in the page already trigger at different
    // scroll times regardless, so this only visibly matters for the
    // clustered case it's meant for, and is capped so long lists don't lag.
    var seenCount = new Map();
    items.forEach(function (el) {
      var parent = el.parentElement;
      var i = seenCount.get(parent) || 0;
      seenCount.set(parent, i + 1);
      if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 70 + "ms";
    });

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     3b. Animated stat counters
     Counts up any .stat__value whose text is a plain integer or ends in
     "%" (e.g. "100 %") once it scrolls into view. Non-numeric values
     (24/7, H14, ISO 45001, Hela Sverige…) are left untouched — this only
     fires where it makes sense.
     --------------------------------------------------------------------- */

  function initCounters() {
    var values = document.querySelectorAll(".stat__value");
    if (!values.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    var pattern = /^(\d+)\s*(%)?$/;

    function animate(el, target, suffix) {
      var start = null;
      var duration = 900;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var match = el.textContent.trim().match(pattern);
        if (match) {
          var target = parseInt(match[1], 10);
          var suffix = match[2] ? " %" : "";
          animate(el, target, suffix);
        }
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    values.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------
     3c. Animated FAQ accordion
     Native <details>/<summary> hides content instantly (display swaps to
     none), so a plain CSS transition can't animate it. This intercepts the
     toggle and animates height with the Web Animations API instead, while
     keeping the real `open` attribute in sync — screen readers and
     find-in-page still see a normal, accessible <details> element.
     --------------------------------------------------------------------- */

  function initAccordion() {
    var items = document.querySelectorAll(".faq details");
    if (!items.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof items[0].animate !== "function") return; // native instant toggle is fine

    items.forEach(function (el) {
      var summary = el.querySelector("summary");
      var content = el.querySelector("summary + div");
      if (!summary || !content) return;

      var anim = null;
      var closing = false;
      var expanding = false;

      function onFinish(open) {
        el.open = open;
        anim = null;
        closing = false;
        expanding = false;
        el.style.height = el.style.overflow = "";
      }

      function shrink() {
        closing = true;
        var startHeight = el.offsetHeight + "px";
        var endHeight = summary.offsetHeight + "px";
        el.style.overflow = "hidden";
        if (anim) anim.cancel();
        anim = el.animate({ height: [startHeight, endHeight] }, { duration: 220, easing: "ease-out" });
        anim.onfinish = function () { onFinish(false); };
        anim.oncancel = function () { closing = false; };
      }

      function expand() {
        expanding = true;
        var startHeight = el.offsetHeight + "px";
        var endHeight = (summary.offsetHeight + content.offsetHeight) + "px";
        el.style.overflow = "hidden";
        if (anim) anim.cancel();
        anim = el.animate({ height: [startHeight, endHeight] }, { duration: 220, easing: "ease-out" });
        anim.onfinish = function () { onFinish(true); };
        anim.oncancel = function () { expanding = false; };
      }

      function open() {
        el.style.height = el.offsetHeight + "px";
        el.open = true;
        window.requestAnimationFrame(expand);
      }

      summary.addEventListener("click", function (e) {
        e.preventDefault();
        if (closing || !el.open) open();
        else if (expanding || el.open) shrink();
      });
    });
  }

  /* ---------------------------------------------------------------------
     4. Quote form
     No backend is wired up. Set FORM_ENDPOINT to a POST URL (Formspree,
     Netlify Forms, your own handler) and the form submits there as JSON.
     Left empty, it falls back to opening the visitor's mail client with the
     enquiry pre-filled, so the form is usable from day one.
     --------------------------------------------------------------------- */

  var FORM_ENDPOINT = "";           // e.g. "https://formspree.io/f/xxxxxxx"
  var FORM_MAILTO   = "offert@corpup.se";

  function initForm() {
    var form = document.getElementById("quote-form");
    if (!form) return;

    var status = document.getElementById("form-status");

    function say(state, message) {
      if (!status) return;
      status.dataset.state = state;
      status.textContent = message;
      status.classList.add("is-visible");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Honeypot: silently accept and do nothing. */
      if (form.elements.company_url && form.elements.company_url.value) return;

      var data = Object.fromEntries(new FormData(form).entries());
      delete data.company_url;

      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "");
      if (!data.name || !validEmail) {
        say("err", t("form.err.required",
          "Fyll i namn och en giltig e-postadress."));
        return;
      }

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Request failed");
            form.reset();
            say("ok", t("form.ok",
              "Tack — vi har tagit emot din förfrågan och återkommer inom en arbetsdag."));
          })
          .catch(function () {
            say("err", lang() === "en"
              ? "Something went wrong. Please email " + FORM_MAILTO + " instead."
              : "Något gick fel. Mejla " + FORM_MAILTO + " i stället.");
          });
        return;
      }

      /* Mail-client fallback */
      var labels = lang() === "en"
        ? { name: "Name", company: "Company", email: "Email", phone: "Phone",
            facility: "Facility", need: "Enquiry", message: "Message",
            subject: "Quote request — Corpup" }
        : { name: "Namn", company: "Företag", email: "E-post", phone: "Telefon",
            facility: "Anläggning", need: "Ärende", message: "Meddelande",
            subject: "Offertförfrågan — Corpup" };

      var body = Object.keys(labels)
        .filter(function (k) { return k !== "subject" && data[k]; })
        .map(function (k) { return labels[k] + ": " + data[k]; })
        .join("\n");

      window.location.href = "mailto:" + FORM_MAILTO +
        "?subject=" + encodeURIComponent(labels.subject) +
        "&body=" + encodeURIComponent(body);

      say("ok", t("form.ok",
        "Tack — din förfrågan är förberedd i ditt e-postprogram. Vi svarar inom en arbetsdag."));
    });
  }

  /* ---------------------------------------------------------------------
     5. Footer year
     --------------------------------------------------------------------- */

  function initYear() {
    document.querySelectorAll("#year").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */

  function boot() {
    initLang();
    initNav();
    initReveal();
    initCounters();
    initAccordion();
    initForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
