/* Project Summit — blog language routing.
 *
 * On a blog page, the header language switcher should take the reader to the
 * translated version of THIS article (separate URLs + hreflang), not just swap
 * the shared-shell UI strings. Each page declares its alternates on <body> as
 * data-alt-en / data-alt-es / data-alt-ca. app.js still persists the language
 * choice; we navigate right after so the target page also loads in that UI.
 *
 * Entering the blog should also land on the language the visitor already
 * chose elsewhere on the site (e.g. the "Blog" nav link always points at the
 * English URL). We only act on an explicit choice (state.langExplicit, set by
 * the nav language switcher) — never on the 'es' default — so a first-time or
 * organic-search visitor still lands on the English-first blog untouched.
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
