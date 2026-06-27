// Mobile menu
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  var btn  = document.getElementById('menuBtn');
  if (!menu) return;
  var isOpen = menu.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// Dark mode
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme', 'dark');
})();

document.addEventListener('DOMContentLoaded', function () {

  // ── Theme toggle ──
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // ── Lenis smooth scroll ──
  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 0.8,
  });
  window.lenisInstance = lenis;

  // Native RAF loop — most reliable across Lenis versions
  (function lenisLoop(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisLoop);
  }(performance.now()));

  // GSAP ScrollTrigger sync
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', function () { ScrollTrigger.update(); });

  // Anchor clicks go through Lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      }
    });
  });

  // ── Hero: animate in on load ──
  var heroEls = [
    document.querySelector('.hero__headline'),
    document.querySelector('.hero__body'),
    document.querySelector('.hero__socials'),
  ].filter(Boolean);

  var heroPhoto = document.querySelector('.hero__photo');

  if (heroEls.length) {
    gsap.from(heroEls, {
      opacity: 0,
      y: 28,
      duration: 0.9,
      stagger: 0.14,
      ease: 'power3.out',
      delay: 0.15,
    });
  }

  if (heroPhoto) {
    gsap.from(heroPhoto, {
      opacity: 0,
      scale: 0.94,
      duration: 1.1,
      ease: 'power3.out',
      delay: 0.25,
    });
  }

  // ── Scroll reveal (keep CSS .revealed class — GSAP triggers it) ──
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    revealEls.forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: function () { el.classList.add('revealed'); },
      });
    });
  }

  // ── Works accordion ──
  var accordion = document.querySelector('.works-accordion');
  var worksList = document.querySelector('.works-list');
  var rows = Array.from(document.querySelectorAll('.works-row'));

  if (accordion && worksList && rows.length) {
    var STEP = 420;

    function setAccordionHeight() {
      accordion.style.height = (rows.length * STEP + worksList.offsetHeight) + 'px';
    }

    function activateRow(idx) {
      rows.forEach(function (row, i) {
        row.classList.toggle('active', i === idx);
      });
    }

    activateRow(0);
    setAccordionHeight();
    window.addEventListener('resize', setAccordionHeight);

    function updateAccordion() {
      var navH = 68;
      var rect = accordion.getBoundingClientRect();
      var scrolled = Math.max(0, navH - rect.top);
      var idx = Math.min(rows.length - 1, Math.floor(scrolled / STEP));
      activateRow(idx);
    }

    lenis.on('scroll', updateAccordion);
    updateAccordion();
  }

  // ── Insights: grid when ≤2, horizontal scroll when 3+ ──
  var insightsGrid = document.querySelector('.insights-grid');
  var insightsNav  = document.querySelector('.insights-nav');
  var arrows = document.querySelectorAll('.insights-arrow');
  if (insightsGrid) {
    var cardCount = insightsGrid.querySelectorAll('.insight').length;
    if (cardCount > 2) {
      insightsGrid.classList.add('insights-grid--scroll');
      if (arrows.length === 2) {
        function scrollInsights(dir) {
          var card = insightsGrid.querySelector('.insight');
          var step = card ? card.offsetWidth + 28 : 480;
          insightsGrid.scrollBy({ left: dir * step, behavior: 'smooth' });
        }
        arrows[0].addEventListener('click', function () { scrollInsights(-1); });
        arrows[1].addEventListener('click', function () { scrollInsights(1); });
      }
    } else {
      if (insightsNav) insightsNav.style.display = 'none';
    }
  }

  // ── Nav scroll-shrink (optional subtle shadow on scroll) ──
  var navInner = document.querySelector('.nav__inner');
  if (navInner) {
    lenis.on('scroll', function (e) {
      navInner.classList.toggle('nav__inner--scrolled', e.scroll > 40);
    });
  }

});
