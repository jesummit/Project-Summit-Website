/*
 * Project Summit — analytics helpers (PostHog)
 * Loaded on every page, after the PostHog snippet and translations.js.
 *
 * Responsibilities:
 *   1. Flag internal/test browsers so their traffic can be excluded in PostHog.
 *      Visit any page with ?internal=1 once to flag this browser (persists in
 *      localStorage). Use ?internal=0 to clear it. Flagged sessions send an
 *      `is_internal: true` property on every event, which the project's
 *      "internal & test accounts" filter excludes.
 *
 *   2. Preserve campaign attribution across the website -> Tally boundary.
 *      Inbound campaign params (utm_*, gclid, fbclid) are forwarded onto every
 *      Tally waitlist link so the eventual signup stays attributed to its source.
 */
(function () {
  'use strict';

  // 1. Internal / test user flagging --------------------------------------
  try {
    var params = new URLSearchParams(window.location.search);
    var flag = params.get('internal');
    if (flag === '1') localStorage.setItem('ps_internal', '1');
    if (flag === '0') localStorage.removeItem('ps_internal');

    if (localStorage.getItem('ps_internal') === '1' && window.posthog) {
      // register() attaches the property to EVERY event (works for anonymous
      // visitors too, unlike setPersonProperties under identified_only).
      posthog.register({ is_internal: true });
    }
  } catch (e) { /* localStorage may be unavailable */ }

  // 2. Forward campaign attribution to the Tally waitlist form -------------
  var CARRY = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

  function forwardAttribution() {
    try {
      var inbound = new URLSearchParams(window.location.search);
      var pairs = [];
      CARRY.forEach(function (k) {
        var v = inbound.get(k);
        if (v) pairs.push([k, v]);
      });
      if (!pairs.length) return;

      var links = document.querySelectorAll('a[href*="tally.so"]');
      links.forEach(function (a) {
        try {
          var u = new URL(a.href);
          pairs.forEach(function (p) {
            if (!u.searchParams.has(p[0])) u.searchParams.set(p[0], p[1]);
          });
          a.href = u.toString();
        } catch (e) { /* malformed href, skip */ }
      });
    } catch (e) { /* no-op */ }
  }

  if (document.readyState !== 'loading') forwardAttribution();
  else document.addEventListener('DOMContentLoaded', forwardAttribution);
})();
