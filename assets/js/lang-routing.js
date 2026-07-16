/* Project Summit — language routing for pages that exist as separate,
 * per-locale URLs (the blog, and — since these are build.js-generated — the
 * marketing shell pages under /es/ and /ca/), as opposed to the older
 * single-URL data-i18n DOM swap.
 *
 * On these pages the header language switcher should take the reader to the
 * translated URL, not just swap the shared-shell UI strings. Each page
 * declares its alternates on <body> as data-alt-en / data-alt-es /
 * data-alt-ca (see build.js). app.js still persists the language choice and
 * swaps the current DOM as a same-page preview; we navigate right after so
 * the target page also loads in that language.
 *
 * Landing on one of these pages should also honour the language the visitor
 * already chose elsewhere on the site (e.g. the shared header always links to
 * the English/default URL of the target section). We only act on an explicit
 * choice (state.langExplicit, set by the nav language switcher) — never on
 * the 'es' default — so a first-time or organic-search visitor lands
 * untouched on whichever URL they actually requested.
 */
(function () {
  'use strict';

  // "/blog/index.html" and "/blog/" are the same page on GitHub Pages, but
  // alternates are declared with the collapsed form — normalize before
  // comparing so we don't fire a redundant redirect on the .html URL.
  function normalize(p) {
    return p ? p.replace(/index\.html$/, '') : p;
  }

  function boot() {
    var b = document.body;
    var alts = {
      en: b.getAttribute('data-alt-en'),
      es: b.getAttribute('data-alt-es'),
      ca: b.getAttribute('data-alt-ca'),
    };
    if (!alts.en && !alts.es && !alts.ca) return;

    var here = normalize(location.pathname);

    var summit = window.Summit && window.Summit.get();
    if (summit && summit.langExplicit) {
      var target = alts[summit.lang];
      if (target && normalize(target) !== here) {
        location.replace(target);
        return;
      }
    }

    Array.prototype.forEach.call(document.querySelectorAll('.lang-option'), function (btn) {
      btn.addEventListener('click', function () {
        var url = alts[btn.getAttribute('data-lang')];
        if (url && normalize(url) !== here) {
          // Defer so app.js's own click handler (persist choice) runs first.
          setTimeout(function () { location.href = url; }, 0);
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
