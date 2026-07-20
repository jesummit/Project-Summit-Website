/*
  app-figures.js — renders in-app figure replicas for the blog
  ------------------------------------------------------------
  Faithful, dependency-free reproduction of the Summit iOS app's FORM-tab
  Performance Management Chart (see TrainingLoadChart.swift). Draws only
  geometry as inline SVG; ALL color comes from CSS classes styled in
  app-figures.css, so a light/dark flip needs no re-render.

  Usage in an article:
    <figure class="app-figure" data-app-figure="pmc"
            data-historic="56" data-forecast="28"
            aria-label="…">
      <script type="application/json" class="app-figure-data">
        [{"tss":72,"ctl":40,"atl":55,"tsb":-8,"projected":false}, …]
      </script>
      … .app-figure-card wrapper with .app-figure-chart target …
    </figure>

  The data is an illustrative model (impulse-response CTL/ATL/TSB), not a
  real athlete's file — the caption says so. No network, no third parties.
*/
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';

  // Plot geometry (viewBox units). Mirrors the app's paddings in spirit:
  // room on the left for Y labels, on the bottom for X labels + TSS dots.
  var W = 600, H = 300;
  var PAD = { l: 30, r: 12, t: 12, b: 34 };
  var PLOT_W = W - PAD.l - PAD.r;
  var PLOT_H = H - PAD.t - PAD.b;

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // Scale: include every visible series AND zero, pad ~10%, snap to /25 —
  // identical rule to TrainingLoadChart.calculateScale().
  function computeScale(pts) {
    var vals = [];
    pts.forEach(function (p) { vals.push(p.ctl, p.atl, p.tsb); });
    var dMin = Math.min.apply(null, vals);
    var dMax = Math.max.apply(null, vals);
    var aMin = Math.min(dMin, 0), aMax = Math.max(dMax, 0);
    var pad = Math.max((aMax - aMin) * 0.1, 10);
    var min = Math.floor((aMin - pad) / 25) * 25;
    var max = Math.ceil((aMax + pad) / 25) * 25;
    return { min: min, max: max };
  }

  function x(i, n) { return PAD.l + PLOT_W * (i / Math.max(n - 1, 1)); }
  function y(v, s) {
    var norm = (v - s.min) / (s.max - s.min);
    return PAD.t + PLOT_H * (1 - Math.min(Math.max(norm, 0), 1));
  }

  // Build an SVG path 'd' for one series. `projected` selects which half;
  // the projected path is prefixed with the last historic point so the
  // dashed forecast visually continues the solid line (as the app does).
  function linePath(pts, key, projected, s) {
    var d = '', started = false;
    for (var i = 0; i < pts.length; i++) {
      var isProj = !!pts[i].projected;
      var include = projected
        ? (isProj || i === lastHistoricIndex(pts))
        : !isProj;
      if (!include) continue;
      var px = x(i, pts.length), py = y(pts[i][key], s);
      d += (started ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1) + ' ';
      started = true;
    }
    return d.trim();
  }

  function lastHistoricIndex(pts) {
    for (var i = pts.length - 1; i >= 0; i--) if (!pts[i].projected) return i;
    return pts.length - 1;
  }

  function render(fig) {
    var dataEl = fig.querySelector('.app-figure-data');
    var target = fig.querySelector('.app-figure-chart');
    if (!dataEl || !target) return;

    var pts;
    try { pts = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!Array.isArray(pts) || pts.length < 2) return;

    var historic = parseInt(fig.getAttribute('data-historic'), 10) || lastHistoricIndex(pts) + 1;
    var forecast = parseInt(fig.getAttribute('data-forecast'), 10) || (pts.length - historic);
    var s = computeScale(pts);
    var todayIdx = lastHistoricIndex(pts);

    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img'
    });

    // LAYER 1: grid + Y labels (every 25)
    for (var g = s.min; g <= s.max; g += 25) {
      var gy = y(g, s);
      svg.appendChild(el('line', {
        x1: PAD.l, y1: gy.toFixed(1), x2: W - PAD.r, y2: gy.toFixed(1),
        class: 'afx-grid' + (g === 0 ? ' is-zero' : '')
      }));
      var lbl = el('text', { x: PAD.l - 5, y: (gy + 3).toFixed(1), 'text-anchor': 'end', class: 'afx-axis-label' });
      lbl.textContent = String(g);
      svg.appendChild(lbl);
    }

    // LAYER 2: TSB optimal band (-10 … -30), only if inside the visible range
    if (s.min <= -10 && s.max >= -30) {
      var yTop = y(-10, s), yBot = y(-30, s);
      svg.appendChild(el('rect', {
        x: PAD.l, y: yTop.toFixed(1), width: PLOT_W, height: (yBot - yTop).toFixed(1),
        class: 'afx-zone'
      }));
    }

    // LAYER 3: TSS load dots at the base, height ∝ TSS
    var maxTSS = 0;
    pts.forEach(function (p) { if (p.tss > maxTSS) maxTSS = p.tss; });
    if (maxTSS > 0) {
      pts.forEach(function (p, i) {
        if (!p.tss) return;
        var dotY = PAD.t + PLOT_H * (1 - (p.tss / maxTSS) * 0.9);
        svg.appendChild(el('circle', {
          cx: x(i, pts.length).toFixed(1), cy: dotY.toFixed(1), r: 2.2,
          class: 'afx-tss' + (p.projected ? ' is-proj' : '')
        }));
      });
    }

    // LAYER 4: TODAY vertical marker
    var tx = x(todayIdx, pts.length);
    svg.appendChild(el('line', {
      x1: tx.toFixed(1), y1: PAD.t, x2: tx.toFixed(1), y2: PAD.t + PLOT_H, class: 'afx-today'
    }));

    // LAYER 5–7: series (TSB behind, then CTL, then ATL — app z-order)
    var series = [
      { key: 'tsb', cls: 'afx-tsb' },
      { key: 'ctl', cls: 'afx-ctl' },
      { key: 'atl', cls: 'afx-atl' }
    ];
    series.forEach(function (ser) {
      svg.appendChild(el('path', { d: linePath(pts, ser.key, false, s), class: 'afx-line ' + ser.cls }));
      if (forecast > 0) {
        svg.appendChild(el('path', { d: linePath(pts, ser.key, true, s), class: 'afx-line is-proj ' + ser.cls }));
      }
    });

    // LAYER 8: today's TSB marker (ring + core)
    var tdy = pts[todayIdx];
    var tdyY = y(tdy.tsb, s);
    svg.appendChild(el('circle', { cx: tx.toFixed(1), cy: tdyY.toFixed(1), r: 4.5, class: 'afx-today-dot-ring' }));
    svg.appendChild(el('circle', { cx: tx.toFixed(1), cy: tdyY.toFixed(1), r: 3, class: 'afx-today-dot-core' }));

    // LAYER 9: X labels (days, like the app: -Nd / -N/2d / TODAY / +N/2d / +Nd)
    var xLabels = [
      { pos: 0, text: '-' + historic + 'D' },
      { pos: todayIdx / (pts.length - 1) * 0.5, text: '-' + Math.max(Math.round(historic / 2), 1) + 'D' },
      { pos: todayIdx / (pts.length - 1), text: 'TODAY', today: true },
      { pos: (todayIdx / (pts.length - 1) + 1) / 2, text: '+' + Math.max(Math.round(forecast / 2), 1) + 'D' },
      { pos: 1, text: '+' + forecast + 'D' }
    ];
    xLabels.forEach(function (l) {
      var lx = PAD.l + PLOT_W * l.pos;
      var t = el('text', {
        x: lx.toFixed(1), y: (H - PAD.b + 20).toFixed(1), 'text-anchor': 'middle',
        class: 'afx-axis-label' + (l.today ? ' is-today' : '')
      });
      t.textContent = l.text;
      svg.appendChild(t);
    });

    target.textContent = '';
    target.appendChild(svg);
  }

  function init() {
    var figs = document.querySelectorAll('[data-app-figure="pmc"]');
    for (var i = 0; i < figs.length; i++) render(figs[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
