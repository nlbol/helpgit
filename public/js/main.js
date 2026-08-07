(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var STORAGE_KEY = 'helpgit-theme';
  var root = document.documentElement;
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     1. Tema (claro / oscuro / automático)
     ------------------------------------------------------------ */
  var pref = 'auto';
  try {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') pref = stored;
  } catch (e) {}

  function resolveTheme() {
    return pref === 'auto' ? (sysDark.matches ? 'dark' : 'light') : pref;
  }

  function applyTheme() {
    var eff = resolveTheme();
    root.setAttribute('data-theme', eff);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = eff === 'dark' ? '#0c1210' : '#f4f7f5';
    updateButtons();
  }

  function updateButtons() {
    document.querySelectorAll('.theme-option').forEach(function (btn) {
      var active = btn.dataset.themePref === pref;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });
  }

  function setPref(p) {
    pref = p;
    try { localStorage.setItem(STORAGE_KEY, p); } catch (e) {}
    applyTheme();
  }

  document.querySelectorAll('.theme-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPref(btn.dataset.themePref);
    });
  });

  if (typeof sysDark.addEventListener === 'function') {
    sysDark.addEventListener('change', function () {
      if (pref === 'auto') applyTheme();
    });
  }

  applyTheme();

  /* ------------------------------------------------------------
     2. Progreso de la guía (barra + línea de pasos)
     ------------------------------------------------------------ */
  var fill = document.getElementById('progress-fill');
  var items = Array.prototype.slice.call(document.querySelectorAll('.progress-item'));
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step[id]'));

  function setProgress(index) {
    var pct = steps.length ? (index / steps.length) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
    items.forEach(function (item, i) {
      item.classList.toggle('is-done', i < index);
      item.classList.toggle('is-active', i === index);
    });
  }

  if ('IntersectionObserver' in window && steps.length) {
    var stepObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = steps.indexOf(entry.target);
          if (idx > -1) setProgress(idx);
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    steps.forEach(function (step) { stepObserver.observe(step); });
  } else {
    setProgress(0);
  }

  /* ------------------------------------------------------------
     3. Aparición progresiva al hacer scroll
     ------------------------------------------------------------ */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function showReveal(el) { el.classList.add('is-visible'); }

  if (!reducedMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          showReveal(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(showReveal);
  }

  /* ------------------------------------------------------------
     4. Sombra del header al hacer scroll
     ------------------------------------------------------------ */
  var header = document.getElementById('site-header');

  function updateHeaderState() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  /* ------------------------------------------------------------
     5. Ajuste del alto del header como variable CSS
     ------------------------------------------------------------ */
  function setHeaderVars() {
    if (!header) return;
    root.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  setHeaderVars();
  window.addEventListener('resize', setHeaderVars);

  /* ------------------------------------------------------------
     6. Generador de código QR ilustrativo (patrón determinista)
     ------------------------------------------------------------ */
  function renderQr(svg) {
    var size = 21;
    var seed = 20260807;

    function rnd() {
      seed = (seed * 1103515245 + 12345) % 2147483647;
      return seed / 2147483647;
    }

    var NS = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('shape-rendering', 'crispEdges');

    while (svg.firstChild) { svg.removeChild(svg.firstChild); }

    var g = document.createElementNS(NS, 'g');
    g.setAttribute('fill', '#10140f');

    function addRect(x, y, w, h) {
      var r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x);
      r.setAttribute('y', y);
      r.setAttribute('width', w);
      r.setAttribute('height', h);
      g.appendChild(r);
    }

    function inFinder(x, y) {
      return (x >= 0 && x < 7 && y >= 0 && y < 7) ||
             (x >= size - 7 && x < size && y >= 0 && y < 7) ||
             (x >= 0 && x < 7 && y >= size - 7 && y < size);
    }

    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        if (inFinder(x, y)) continue;
        if (rnd() < 0.45) addRect(x, y, 1, 1);
      }
    }

    var finders = [[0, 0], [size - 7, 0], [0, size - 7]];
    finders.forEach(function (f) {
      var fx = f[0], fy = f[1];
      addRect(fx, fy, 7, 7);
      var ring = document.createElementNS(NS, 'rect');
      ring.setAttribute('x', fx + 1);
      ring.setAttribute('y', fy + 1);
      ring.setAttribute('width', 5);
      ring.setAttribute('height', 5);
      ring.setAttribute('fill', '#ffffff');
      g.appendChild(ring);
      addRect(fx + 2, fy + 2, 3, 3);
    });

    svg.appendChild(g);
  }

  document.querySelectorAll('.qr-svg').forEach(renderQr);

  /* ------------------------------------------------------------
     7. Año del footer
     ------------------------------------------------------------ */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
