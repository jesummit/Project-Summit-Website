/* Project Summit — cookie/analytics consent (GDPR / ePrivacy, opt-in).
 *
 * PostHog is initialised with opt_out_capturing_by_default: true, so it captures
 * NOTHING until the visitor explicitly accepts here. The choice is stored in
 * localStorage (summit_consent = 'granted' | 'denied') and can be changed later
 * via the "Cookie settings" footer link (window.SummitConsent.reopen()).
 */
(function () {
  'use strict';

  var KEY = 'summit_consent';

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

  function applyToPosthog(v) {
    if (!window.posthog || !posthog.opt_in_capturing) return;
    try { v === 'granted' ? posthog.opt_in_capturing() : posthog.opt_out_capturing(); } catch (e) {}
  }

  function remove() { var b = document.getElementById('consent'); if (b) b.parentNode.removeChild(b); }

  function decide(v) { store(v); applyToPosthog(v); remove(); }

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
    if (c === 'granted' || c === 'denied') { applyToPosthog(c); return; }
    show();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
