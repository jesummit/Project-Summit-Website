/* Project Summit — cookie/analytics consent (GDPR / ePrivacy, opt-in).
 *
 * Lazy-init pattern: PostHog is NOT initialised at all until the visitor
 * explicitly accepts. The stub in each page's <head> only defines a queueing
 * `window.posthog` so other scripts can call `posthog.capture(...)` safely; the
 * real lib is only fetched when `posthog.init(...)` is called below (gated by
 * `localStorage.summit_consent`). If the visitor rejects or never decides, no
 * request is ever made to /ingest and no cookies are set.
 *
 * Choice is stored as 'granted' | 'denied' and can be changed later via the
 * "Cookie settings" footer link (window.SummitConsent.reopen()).
 */
(function () {
  'use strict';

  var KEY = 'summit_consent';

  // Single source of truth for the PostHog config. Mirror this if you ever
  // need to tune ingestion behaviour — there is no <head> init to keep in sync.
  var POSTHOG_KEY = 'phc_nx6HJowbqHyMpAZRwfBAa4UjTBRJhtvrKECSD9WDRp8E';
  var POSTHOG_CONFIG = {
    api_host: 'https://projectsummit.app/ingest',
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-01-30',
    person_profiles: 'identified_only',
    enable_heatmaps: true,
    capture_dead_clicks: true
  };

  var STR = {
    en: { text: 'We use privacy-friendly analytics to improve the site. Accept analytics cookies?', more: 'More info', accept: 'Accept', reject: 'Reject' },
    es: { text: 'Usamos analítica respetuosa con la privacidad para mejorar el sitio. ¿Aceptas las cookies de analítica?', more: 'Más información', accept: 'Aceptar', reject: 'Rechazar' },
    ca: { text: 'Fem servir analítica respectuosa amb la privadesa per millorar el web. Acceptes les cookies d’analítica?', more: 'Més informació', accept: 'Accepta', reject: 'Rebutja' }
  };

  function lang() {
    try { if (window.SummitLang && SummitLang.get()) return SummitLang.get(); } catch (e) {}
    try { var s = JSON.parse(localStorage.getItem('summit_site_v1') || '{}'); if (s.lang) return s.lang; } catch (e) {}
    return 'es';
  }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Boot PostHog for real. Only call this once consent is granted. The stub
  // installed by the <head> snippet replays any queued capture/register calls
  // as soon as the lib finishes loading.
  function loadPosthog() {
    if (!window.posthog || posthog.__loaded) return;
    try { posthog.init(POSTHOG_KEY, POSTHOG_CONFIG); } catch (e) {}
  }

  function remove() { var b = document.getElementById('consent'); if (b) b.parentNode.removeChild(b); }

  function decide(v) {
    store(v);
    if (v === 'granted') loadPosthog();
    remove();
  }

  function show() {
    if (document.getElementById('consent')) return;
    var t = STR[lang()] || STR.es;
    var el = document.createElement('div');
    el.className = 'consent';
    el.id = 'consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Cookies');
    el.innerHTML =
      '<p class="consent-text">' + t.text +
      ' <a href="privacy-policy.html">' + t.more + '</a></p>' +
      '<div class="consent-actions">' +
        '<button type="button" class="consent-btn consent-reject"></button>' +
        '<button type="button" class="consent-btn consent-accept"></button>' +
      '</div>';
    el.querySelector('.consent-reject').textContent = t.reject;
    el.querySelector('.consent-accept').textContent = t.accept;
    el.querySelector('.consent-accept').addEventListener('click', function () { decide('granted'); });
    el.querySelector('.consent-reject').addEventListener('click', function () { decide('denied'); });
    document.body.appendChild(el);
  }

  // Public API for the footer "Cookie settings" link.
  window.SummitConsent = {
    get: get,
    reopen: show,
    set: decide
  };

  function boot() {
    var c = get();
    if (c === 'granted') { loadPosthog(); return; }   // returning consenter → init now
    if (c === 'denied') return;                        // explicit no → never init
    show();                                            // first visit → ask
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
