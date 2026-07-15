// STOLBASZ - drobna interaktywność (nav mobile + reveal)
(function () {
  // mobilne menu
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // reveal przy scrollu
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
  // od razu pokaż to, co jest w pierwszym ekranie (hero/intro) - nie czekaj na próg observera.
  // (hero bywa WYŻSZE niż viewport i nigdy nie osiąga 12% swojej powierzchni → zostawało puste do scrolla)
  requestAnimationFrame(function () {
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) { el.classList.add('in'); io.unobserve(el); }
    });
  });
})();

// nav kondensuje się po przewinięciu (cienka linia + niższy pasek) - addytywne, lekkie
(function () {
  var nav = document.querySelector('.nav') || document.querySelector('header');
  if (!nav) return;
  var ticking = false;
  function upd() { nav.classList.toggle('is-stuck', window.scrollY > 24); ticking = false; }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(upd); }
  }, { passive: true });
  upd();
})();

/* === rodzina: fachowcy === */
/* === rodzina FACHOWCY ===
   TYLKO suwak PRZED/PO (before/after). NAV NIE chowa się (auto-hide) - telefon-CTA ma być ZAWSZE widoczny (decyzja FAZA 3).
   is-stuck (przezroczysty->cień) obsługuje base.js. */
(function () {
  var sliders = document.querySelectorAll('[data-ba]');
  if (!sliders.length) return;
  sliders.forEach(function (s) {
    var dragging = false;
    function setPos(clientX) {
      var r = s.getBoundingClientRect();
      var p = ((clientX - r.left) / r.width) * 100;
      p = Math.max(3, Math.min(97, p));
      s.style.setProperty('--ba-pos', p + '%');
    }
    function down(e) { dragging = true; setPos(e.touches ? e.touches[0].clientX : e.clientX); }
    function move(e) { if (dragging) setPos(e.touches ? e.touches[0].clientX : e.clientX); }
    function up() { dragging = false; }
    s.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    s.addEventListener('touchstart', down, { passive: true });
    s.addEventListener('touchmove', move, { passive: true });
    s.addEventListener('touchend', up);
  });
})();

/* === NAV NOBU kontroler (silnik) === */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var last = window.scrollY || 0, TOP = 8, TH = 6, ticking = false;
  function upd() {
    var y = window.scrollY || 0;
    if (y <= TOP) { nav.classList.remove('nav-hidden', 'nav-solid'); last = y; ticking = false; return; }
    var d = y - last;
    if (Math.abs(d) <= TH) { ticking = false; return; }
    if (d > 0) nav.classList.add('nav-hidden');
    else { nav.classList.remove('nav-hidden'); nav.classList.add('nav-solid'); }
    last = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(upd); } }, { passive: true });
  upd();
})();

/* === GALERIA realizacji: filtry kategorii === */
(function () {
  var filters = document.querySelectorAll('.gal-filter');
  if (!filters.length) return;
  var items = document.querySelectorAll('.gal-item');
  function apply(f) {
    filters.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-filter') === f); });
    items.forEach(function (it) {
      var show = (f === 'all') || (it.getAttribute('data-kat') || '').split(' ').indexOf(f) > -1;
      it.classList.toggle('is-hidden', !show);
    });
  }
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () { apply(btn.getAttribute('data-filter')); });
  });
  // filtr z parametru URL, np. realizacje.html?kat=Ogrody (z kafelków na home)
  var wanted = new URLSearchParams(window.location.search).get('kat');
  if (wanted && [].some.call(filters, function (b) { return b.getAttribute('data-filter') === wanted; })) {
    apply(wanted);
  }
})();

/* === LIGHTBOX: powiększanie zdjęć w galeriach === */
(function () {
  var imgs = document.querySelectorAll('.gallery img, .gal-masonry img');
  if (!imgs.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<button class="lightbox-close" type="button" aria-label="Zamknij">&times;</button><img alt="">';
  document.body.appendChild(box);
  var boxImg = box.querySelector('img');

  function open(src, alt) {
    boxImg.src = src;
    boxImg.alt = alt || '';
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  imgs.forEach(function (img) {
    img.addEventListener('click', function () { open(img.currentSrc || img.src, img.alt); });
  });
  box.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.classList.contains('is-open')) close();
  });
})();
