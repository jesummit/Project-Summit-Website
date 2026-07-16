/* Project Summit — blog email capture (progressive enhancement).
 *
 * Each <div class="email-capture"> on a blog page is wired here. On submit it
 * POSTs { email, consent, article, magnet, lang } as JSON to the public
 * `blog_subscribe_v1` Supabase Edge Function (verify_jwt: false — no key in the
 * page). A hidden honeypot field ("website") traps bots. The function upserts
 * into the existing `contacts` table and sends the lead magnet via Resend.
 *
 * A <div> (not a <form>) is used so the block can live inside <article> prose
 * without nested-form issues.
 *
 * The POST goes same-origin to /blog-subscribe (the Cloudflare Worker forwards
 * it to the Edge Function — see infra/cloudflare-worker.js), so the strict CSP
 * `connect-src 'self'` covers it and no third-party origin is needed.
 */
(function () {
  'use strict';

  var ENDPOINT = '/blog-subscribe';

  var MSG = {
    en: { ok: "Check your inbox — the template is on its way.", err: "Something went wrong. Try again in a moment.", bad: "Please enter a valid email and tick the box.", sending: "Sending…" },
    es: { ok: "Revisa tu correo — la plantilla va en camino.", err: "Algo ha fallado. Prueba de nuevo en un momento.", bad: "Introduce un email válido y marca la casilla.", sending: "Enviando…" },
    ca: { ok: "Mira el teu correu — la plantilla ja va cap allà.", err: "Alguna cosa ha fallat. Torna-ho a provar d'aquí un moment.", bad: "Introdueix un email vàlid i marca la casella.", sending: "Enviant…" }
  };

  function lang() {
    try { if (window.SummitLang && SummitLang.get()) return SummitLang.get(); } catch (e) {}
    try { var s = JSON.parse(localStorage.getItem('summit_site_v1') || '{}'); if (s.lang) return s.lang; } catch (e) {}
    return 'en';
  }
  function t() { return MSG[lang()] || MSG.en; }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function wire(box) {
    var input = box.querySelector('input[name="email"]');
    var consent = box.querySelector('input[name="consent"]');
    var hp = box.querySelector('input[name="website"]');
    var btn = box.querySelector('button[type="submit"]');
    var status = box.querySelector('.email-capture-status');

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg || '';
      status.className = 'email-capture-status' + (kind ? ' is-' + kind : '');
    }

    function submit() {
      if (hp && hp.value) return;                              // honeypot: silent drop
      var email = (input && input.value || '').trim();
      if (!validEmail(email) || (consent && !consent.checked)) { setStatus(t().bad, 'err'); return; }

      if (btn) btn.disabled = true;
      setStatus(t().sending, null);

      var payload = {
        email: email,
        consent: true,
        article: box.getAttribute('data-article') || 'blog',
        magnet: box.getAttribute('data-magnet') || null,
        lang: lang()
      };

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { if (!r.ok) throw new Error('bad status ' + r.status); return r.json().catch(function () { return {}; }); })
        .then(function () {
          setStatus(t().ok, 'ok');
          if (input) input.value = '';
          if (consent) consent.checked = false;
          try { if (window.posthog && posthog.capture) posthog.capture('blog_signup', { article: payload.article }); } catch (e) {}
        })
        .catch(function () { setStatus(t().err, 'err'); })
        .then(function () { if (btn) btn.disabled = false; });
    }

    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); submit(); });
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('.email-capture'), wire);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
