// Mobile menu
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.body.style.overflow = document.getElementById('mobileMenu').classList.contains('open') ? 'hidden' : '';
}

// Dark mode
(function () {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) {
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  // Theme toggle
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  // Works scroll accordion
  var accordion = document.querySelector('.works-accordion');
  var worksList = document.querySelector('.works-list');
  var rows = Array.from(document.querySelectorAll('.works-row'));
  if (accordion && worksList && rows.length) {
    var STEP = 420;

    function setAccordionHeight() {
      accordion.style.height = (rows.length * STEP + worksList.offsetHeight) + 'px';
    }

    // Activate row by index
    function activateRow(idx) {
      rows.forEach(function (row, i) {
        row.classList.toggle('active', i === idx);
      });
    }

    activateRow(0);
    setAccordionHeight();
    window.addEventListener('resize', setAccordionHeight);

    function updateActive() {
      var navH = 68;
      var rect = accordion.getBoundingClientRect();
      var scrolled = Math.max(0, navH - rect.top);
      var idx = Math.min(rows.length - 1, Math.floor(scrolled / STEP));
      activateRow(idx);
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }
});
