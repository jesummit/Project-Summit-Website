/* Project Summit — blog language routing.
 *
 * On a blog page, the header language switcher should take the reader to the
 * translated version of THIS article (separate URLs + hreflang), not just swap
 * the shared-shell UI strings. Each page declares its alternates on <body> as
 * data-alt-en / data-alt-es / data-alt-ca. app.js still persists the language
 * choice; we navigate right after so the target page also loads in that UI.
 */
(function () {
  'use strict';

  function boot() {
    var b = document.body;
    var alts = {
      en: b.getAttribute('data-alt-en'),
      es: b.getAttribute('data-alt-es'),
      ca: b.getAttribute('data-alt-ca'),
    };
    if (!alts.en && !alts.es && !alts.ca) return;

    Array.prototype.forEach.call(document.querySelectorAll('.lang-option'), function (btn) {
      btn.addEventListener('click', function () {
        var url = alts[btn.getAttribute('data-lang')];
        if (url && url !== location.pathname) {
          // Defer so app.js's own click handler (persist choice) runs first.
          setTimeout(function () { location.href = url; }, 0);
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
