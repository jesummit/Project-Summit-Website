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

  /* The sticky mobile App Store CTA (#sticky-cta, see app.js initStickyCta())
     docks edge-to-edge at the bottom of the viewport on <=640px. This banner is
     a floating card pinned to that same corner (bottom: 16px), so it lands on
     top of the bar. Two stacked things in the bottom of a 390px phone is not
     acceptable, and the consent gate wins — so while this banner is in the DOM
     we flag it on <html> and the CSS suppresses the CTA.
     A class rather than a CSS :has() selector on purpose: on a browser without
     :has() support the suppression would silently do nothing and BOTH bars
     would render — the exact failure this is meant to prevent. show() and
     remove() are the only two places the banner enters/leaves the DOM, so they
     are the only two places this flag is touched. */
  var SUPPRESS_CLASS = 'has-consent';
  function flagBanner(on) {
    try {
      var r = document.documentElement;
      if (on) r.classList.add(SUPPRESS_CLASS); else r.classList.remove(SUPPRESS_CLASS);
    } catch (e) {}
  }

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

  function remove() {
    var b = document.getElementById('consent');
    if (b) b.parentNode.removeChild(b);
    flagBanner(false);   // banner gone → the sticky CTA is free to appear again
  }

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
      ' <a href="/privacy-policy.html">' + t.more + '</a></p>' +
      '<div class="consent-actions">' +
        '<button type="button" class="consent-btn consent-reject"></button>' +
        '<button type="button" class="consent-btn consent-accept"></button>' +
      '</div>';
    el.querySelector('.consent-reject').textContent = t.reject;
    el.querySelector('.consent-accept').textContent = t.accept;
    el.querySelector('.consent-accept').addEventListener('click', function () { decide('granted'); });
    el.querySelector('.consent-reject').addEventListener('click', function () { decide('denied'); });
    document.body.appendChild(el);
    flagBanner(true);    // banner docked → suppress the sticky CTA underneath it
  }

  // Public API for the footer "Cookie settings" link.
  window.SummitConsent = {
    get: get,
    reopen: show,
    set: decide
  };

  /* ── Deferred first appearance ──────────────────────────────────────────
   * WHY: appended synchronously at DOMContentLoaded, the banner landed right
   * on top of the hero product shot (1440x900) and covered the phone mockup
   * entirely (390x844) — the visitor's first impression of the product was a
   * dialog sitting over it. So on a first visit we let the hero breathe and
   * only ask after ~2.5s, or as soon as the visitor scrolls (whichever comes
   * first — by then they've seen the hero and a bar at the bottom is no
   * longer covering the thing they came to look at).
   *
   * WHY IT LIVES IN boot() AND NOT IN show(): `show` is exported verbatim as
   * `SummitConsent.reopen()` for the footer "Cookie settings" link. That is a
   * direct user action and must stay instantaneous — delaying it inside
   * show() would make the link feel broken. Only the first-visit path is
   * deferred.
   *
   * This changes ONLY when the banner is inserted into the DOM. The PostHog
   * gate is untouched: nothing is fetched or captured before consent, exactly
   * as before.
   */
  var SHOW_DELAY_MS = 2500;
  var deferTimer = null;
  var deferFired = false;

  // Single entry point for both triggers, so they are mutually idempotent:
  // whichever fires first wins and the other becomes a no-op.
  function showDeferred() {
    if (deferFired) return;
    deferFired = true;
    if (deferTimer !== null) { clearTimeout(deferTimer); deferTimer = null; }
    // Race guard: during the delay the visitor can open the banner via the
    // footer "Cookie settings" link and accept/reject it. A choice now exists,
    // so we must NOT pop the banner back up when the pending trigger fires.
    if (get()) return;
    show();
  }

  function scheduleShow() {
    // The timer must work on its own: thanks.html loads this script, has no
    // footer "Cookie settings" link and is a short page that may not even be
    // scrollable — scroll would never fire there. Don't "optimise" the timer
    // away in favour of scroll-only.
    deferTimer = setTimeout(showDeferred, SHOW_DELAY_MS);
    window.addEventListener('scroll', showDeferred, { passive: true, once: true });
  }

  function boot() {
    var c = get();
    if (c === 'granted') { loadPosthog(); return; }   // returning consenter → init now
    if (c === 'denied') return;                        // explicit no → never init
    scheduleShow();                                    // first visit → ask, but not on top of the hero
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
