/**
 * CoreUp — shared site behaviour.
 * Loaded with `defer` on every page; each feature no-ops when its markup is absent.
 */

/* ===== Mobile navigation ===== */
function initMobileMenu() {
  const menu = document.querySelector('[data-menu]');
  const mobile = document.querySelector('[data-mobile-nav]');
  if (!menu || !mobile) return;

  menu.addEventListener('click', () => {
    const open = mobile.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
}

/* ===== Active nav link ===== */
function initActiveNav() {
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  document.querySelectorAll('[data-nav]').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('#')[0].toLowerCase() || 'index.html';
    if (href === current) link.setAttribute('aria-current', 'page');
  });
}

/* ===== Reveal on scroll ===== */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/* ===== Animated counters ===== */
const COUNTER_DURATION = 1200;

function animateCounter(el, target) {
  const t0 = performance.now();

  const tick = (now) => {
    const progress = Math.min(1, (now - t0) / COUNTER_DURATION);
    const value = target * (1 - Math.pow(1 - progress, 3)); // ease-out cubic
    el.textContent = target % 1 ? value.toFixed(2) : Math.round(value);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        animateCounter(el, target);
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
  });
}

/* ===== Contact form (opens a pre-filled email) ===== */
function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);

    const subject = encodeURIComponent('CoreUp cleaning enquiry - ' + (data.get('company') || 'Facility'));
    const body = encodeURIComponent(
      [
        `Name: ${data.get('name')}`,
        `Company: ${data.get('company')}`,
        `Email: ${data.get('email')}`,
        `Service: ${data.get('service') || ''}`,
        '',
        data.get('message') || '',
      ].join('\n')
    );

    window.location.href = `mailto:info@coreup.se?subject=${subject}&body=${body}`;
  });
}

/* ===== Parallax ===== */
const PARALLAX_MAX_SHIFT = 12;
const PARALLAX_FACTOR = 0.025;

function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!elements.length || reducedMotion) return;

  window.addEventListener(
    'scroll',
    () => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const raw = (window.innerHeight / 2 - rect.top) * PARALLAX_FACTOR;
        const shift = Math.max(-PARALLAX_MAX_SHIFT, Math.min(PARALLAX_MAX_SHIFT, raw));
        el.style.transform = `translateY(${shift}px)`;
      });
    },
    { passive: true }
  );
}

/* ===== Footer year ===== */
function initYear() {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initActiveNav();
  initReveal();
  initCounters();
  initContactForm();
  initParallax();
  initYear();
});
