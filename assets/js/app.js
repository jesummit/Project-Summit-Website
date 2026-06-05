/* Project Summit — site controller (vanilla) */
(function () {
  'use strict';

  var STORE_KEY = 'summit_site_v1';
  // Accent is locked to ember (CSS tokens: #D66A2D light / #E8834A dark).
  // theme defaults to the system color scheme until the user overrides it.
  // Language defaults to Spanish (primary audience) until the user picks one.
  var DEFAULTS = { theme: 'light', themeExplicit: false, lang: 'es' };

  function systemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ? 'dark' : 'light';
  }

  function load() {
    var s;
    try { s = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); }
    catch (e) { s = Object.assign({}, DEFAULTS); }
    // Only en / es / ca are supported; anything else falls back to the default.
    if (s.lang !== 'en' && s.lang !== 'es' && s.lang !== 'ca') s.lang = DEFAULTS.lang;
    // Until the user explicitly toggles, follow the device's system color scheme.
    if (!s.themeExplicit) s.theme = systemTheme();
    return s;
  }
  function save(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }

  var state = load();

  function apply(partial) {
    if (partial) Object.assign(state, partial);
    document.documentElement.setAttribute('data-theme', state.theme);
    if (window.SummitLang) window.SummitLang.set(state.lang);
    save(state);
    // keep external listeners (tweaks panel) in sync
    window.dispatchEvent(new CustomEvent('summit:state', { detail: Object.assign({}, state) }));
  }

  window.Summit = {
    apply: apply,
    get: function () { return Object.assign({}, state); }
  };

  /* ---------- Analytics (PostHog, optional) ---------- */
  function track(event, props) {
    try { if (window.posthog) window.posthog.capture(event, props || {}); } catch (e) {}
  }

  /* ---------- Stars ---------- */
  function renderStars() {
    var star = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
    document.querySelectorAll('.stars').forEach(function (el) {
      el.innerHTML = star.repeat(5);
    });
  }

  /* ---------- Carousel ---------- */
  function initCarousel() {
    var track = document.getElementById('carousel');
    if (!track) return;
    var items = track.querySelectorAll('.carousel-item');
    var dotsWrap = document.getElementById('dots');
    var prev = document.getElementById('arrow-prev');
    var next = document.getElementById('arrow-next');

    // build dots
    dotsWrap.innerHTML = '';
    var dots = [];
    items.forEach(function (_, i) {
      var d = document.createElement('div');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', function () { scrollToItem(i); track('carousel_dot_clicked', { slide_index: i }); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });

    function step() {
      if (items.length < 2) return 300;
      return items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
    }
    function current() { return Math.round(track.scrollLeft / step()); }
    function scrollToItem(i) {
      i = Math.max(0, Math.min(items.length - 1, i));
      track.scrollTo({ left: i * step(), behavior: 'smooth' });
    }
    prev.addEventListener('click', function () { scrollToItem(current() - 1); track('carousel_navigated', { direction: 'prev' }); });
    next.addEventListener('click', function () { scrollToItem(current() + 1); track('carousel_navigated', { direction: 'next' }); });

    function update() {
      var c = current();
      dots.forEach(function (d, i) { d.classList.toggle('active', i === c); });
      prev.style.opacity = c <= 0 ? '0.3' : '';
      next.style.opacity = c >= items.length - 1 ? '0.3' : '';
    }
    var raf;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); });

    // drag to scroll
    var down = false, startX = 0, startScroll = 0;
    track.addEventListener('pointerdown', function (e) { down = true; startX = e.clientX; startScroll = track.scrollLeft; track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointermove', function (e) { if (down) track.scrollLeft = startScroll - (e.clientX - startX); });
    track.addEventListener('pointerup', function (e) { down = false; });
    update();
  }

  /* ---------- Nav: progress, hamburger, theme toggle, language ---------- */
  function initNav() {
    var progress = document.getElementById('nav-progress');
    function onScroll() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      if (progress) progress.style.width = p + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var ham = document.getElementById('nav-hamburger');
    var mob = document.getElementById('nav-mobile');
    if (ham && mob) {
      ham.addEventListener('click', function () {
        var willOpen = !mob.classList.contains('open');
        ham.classList.toggle('open');
        mob.classList.toggle('open');
        if (willOpen) track('mobile_menu_opened', { page: document.body.getAttribute('data-page') || '' });
      });
      mob.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { ham.classList.remove('open'); mob.classList.remove('open'); });
      });
    }

    var tt = document.getElementById('theme-toggle');
    if (tt) tt.addEventListener('click', function () {
      var nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      apply({ theme: nextTheme, themeExplicit: true });
      track('theme_toggled', { theme: nextTheme });
    });

    // App Store badges are placeholders until the listing is live — still track intent.
    document.querySelectorAll('.appstore').forEach(function (a) {
      a.addEventListener('click', function () {
        track('appstore_cta_clicked', { source: a.getAttribute('data-source') || 'unknown' });
      });
    });

    // ---- Dropdowns: language switcher + "More" ----
    var langSwitcher = document.getElementById('lang-switcher');
    var langBtn = document.getElementById('lang-selected-btn');
    var moreMenu = document.getElementById('nav-more');
    var moreBtn = document.getElementById('nav-more-btn');

    function closeMenus(except) {
      if (langSwitcher && except !== langSwitcher) langSwitcher.classList.remove('open');
      if (moreMenu && except !== moreMenu) moreMenu.classList.remove('open');
      if (langBtn) langBtn.setAttribute('aria-expanded', langSwitcher && langSwitcher.classList.contains('open') ? 'true' : 'false');
      if (moreBtn) moreBtn.setAttribute('aria-expanded', moreMenu && moreMenu.classList.contains('open') ? 'true' : 'false');
    }

    if (langBtn && langSwitcher) {
      langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        langSwitcher.classList.toggle('open');
        closeMenus(langSwitcher);
      });
    }
    if (moreBtn && moreMenu) {
      moreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        moreMenu.classList.toggle('open');
        closeMenus(moreMenu);
      });
    }
    // Close on outside click / Escape
    document.addEventListener('click', function () { closeMenus(null); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(null); });

    // Language selection — desktop dropdown options + mobile buttons
    document.querySelectorAll('.lang-option, .lang-btn-mobile').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var lang = b.getAttribute('data-lang');
        apply({ lang: lang });
        track('language_changed', { language: lang });
        closeMenus(null);
        if (ham && mob) { ham.classList.remove('open'); mob.classList.remove('open'); }
      });
    });
  }

  /* ---------- Live system-theme following ---------- */
  function initSystemTheme() {
    if (!window.matchMedia) return;
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var handler = function () {
      // Only follow the system while the user hasn't picked a theme manually.
      if (!state.themeExplicit) apply({ theme: systemTheme() });
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  /* ---------- Scroll reveal ----------
     Same criterio across the whole site: as a block scrolls ~30% into view, its
     children reveal with a stagger. Per page (body[data-page]) we map a trigger
     container to the items to stagger. A rule is either { trigger, items } (the
     first match) or { each, items } (every match becomes its own trigger). With
     no `items`, the container reveals itself. The hidden state only exists once
     JS adds .reveal, so no-JS / reduced-motion always show everything. */
  var REVEAL_MAPS = {
    home: [
      { trigger: '#screens',      items: ['.showcase-top', '.carousel-track', '.carousel-dots'] },
      { trigger: '#how',          items: ['.section-head', '.split-block'] },
      { trigger: '#features',     items: ['.section-head', '.feature-card'] },
      { trigger: '#nutrition',    items: ['.section-head', '.split-block'] },
      { trigger: '#whofor',       items: ['.whofor-grid > div:first-child', '.whofor-list li'] },
      { trigger: '#integrations', items: ['.section-head', '.integ-card', '.integ-row-2'] },
      { trigger: '#download',     items: ['.cta-inner'] }
    ],
    about: [
      { trigger: '.founder',    items: ['.founder-photo-wrap', '.founder-text'] },
      { trigger: '.problem',    items: ['.section-eyebrow', '.problem-block'] },
      { trigger: '.principles', items: ['.section-eyebrow', '.principle-card'] },
      { trigger: '.about-cta',  items: ['.about-cta-inner'] }
    ],
    roadmap: [
      { each: '.phase',     items: ['.phase-meta', '.feature-item'] },
      { trigger: '.rm-cta', items: ['.rm-cta-inner'] }
    ],
    faq: [
      { each: '.faq-category', items: ['.faq-cat-label', '.faq-item'] },
      { trigger: '.faq-cta',   items: ['.faq-cta-inner'] }
    ],
    ambassadors: [
      { trigger: '.amb-who',   items: ['.amb-who-title', '.amb-who-body'] },
      { trigger: '.amb-offer', items: ['.amb-offer-label', '.offer-card'] },
      { trigger: '.amb-how',   items: ['.amb-how-label', '.step'] },
      { trigger: '.amb-cta',   items: ['.amb-cta-inner'] }
    ],
    terms: [
      { trigger: '.toc-inner' },
      { each: '.terms-section' }
    ],
    privacy: [
      { trigger: '.toc-block' },
      { each: '.policy-section' }
    ]
  };

  function initReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var page = (document.body && document.body.getAttribute('data-page')) || 'home';
    var rules = REVEAL_MAPS[page];
    if (!rules) return;

    var groups = [];
    function addGroup(container, itemSels) {
      var items = [], i = 0;
      if (itemSels && itemSels.length) {
        itemSels.forEach(function (sel) {
          container.querySelectorAll(sel).forEach(function (el) {
            el.classList.add('reveal');
            el.style.setProperty('--reveal-i', i++);
            items.push(el);
          });
        });
      } else {
        container.classList.add('reveal');
        container.style.setProperty('--reveal-i', 0);
        items.push(container);
      }
      if (items.length) groups.push({ trigger: container, items: items });
    }

    rules.forEach(function (rule) {
      if (rule.each) {
        document.querySelectorAll(rule.each).forEach(function (c) { addGroup(c, rule.items); });
      } else {
        var c = document.querySelector(rule.trigger);
        if (c) addGroup(c, rule.items);
      }
    });
    if (!groups.length) return;

    // Scroll-driven: reveal once a trigger's top has entered ~30% into view.
    // (Plain rect math — reliable across browsers and sandboxed previews.)
    var raf;
    function check() {
      var trigger = window.innerHeight * 0.7;
      for (var k = groups.length - 1; k >= 0; k--) {
        if (groups[k].trigger.getBoundingClientRect().top < trigger) {
          groups[k].items.forEach(function (el) { el.classList.add('is-visible'); });
          groups.splice(k, 1);
        }
      }
      if (!groups.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }
    function onScroll() { cancelAnimationFrame(raf); raf = requestAnimationFrame(check); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    apply();
    renderStars();
    initCarousel();
    initNav();
    initSystemTheme();
    initReveal();
  });
})();
