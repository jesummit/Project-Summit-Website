/*
 * Project Summit — analytics helpers (PostHog)
 * Loaded on every page, after the PostHog snippet and translations.js.
 *
 * Responsibility:
 *   Flag internal/test browsers so their traffic can be excluded in PostHog.
 *   Visit any page with ?internal=1 once to flag this browser (persists in
 *   localStorage). Use ?internal=0 to clear it. Flagged sessions send an
 *   `is_internal: true` property on every event, which the project's
 *   "internal & test accounts" filter excludes.
 */
(function () {
  'use strict';

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
})();
