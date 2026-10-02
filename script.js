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
    const syncPressed = function () {
      toggle.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
    };
    syncPressed();
    toggle.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      syncPressed();
    });
  }

  // Decorative autoplay video stays still for reduced-motion visitors
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
  }

  // Animation libraries load from CDNs. If any is missing, or the visitor
  // prefers reduced motion, fall back to native scrolling and plain reveals.
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var lenis = null;

  // ── Lenis smooth scroll ──
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
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
  }

  // Scroll listener that works with or without Lenis
  function onScroll(fn) {
    if (lenis) lenis.on('scroll', function (e) { fn(e.scroll); });
    else window.addEventListener('scroll', function () { fn(window.scrollY); }, { passive: true });
  }

  // GSAP ScrollTrigger sync
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', function () { ScrollTrigger.update(); });
  }

  // Anchor clicks go through Lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var target = id.length > 1 ? document.querySelector(id) : null;
      if (target && lenis) {
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

  if (hasGsap && !reduceMotion && heroEls.length) {
    gsap.from(heroEls, {
      opacity: 0,
      y: 28,
      duration: 0.9,
      stagger: 0.14,
      ease: 'power3.out',
      delay: 0.15,
    });
  }

  if (hasGsap && !reduceMotion && heroPhoto) {
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
    if (reduceMotion) {
      revealEls.forEach(function (el) { el.classList.add('revealed'); });
    } else if (hasGsap) {
      revealEls.forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          onEnter: function () { el.classList.add('revealed'); },
        });
      });
    } else if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('revealed'); });
    }
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
    onScroll(function (y) {
      navInner.classList.toggle('nav__inner--scrolled', y > 40);
    });
  }

});
