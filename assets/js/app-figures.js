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

  function renderPMC(fig) {
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

    // Retrospective mode: a case-study PMC of real past data — no TODAY
    // cursor and no forecast; instead the event window is highlighted and
    // the X axis reads in months. Opt-in via data-mode="retro" on the
    // figure, with per-point `date` (ISO) in the data and data-event-start /
    // data-event-end marking the event to band. data-months overrides the
    // month tick labels (comma list, Jan-first) for localized posts.
    var retro = fig.getAttribute('data-mode') === 'retro';
    var evStart = fig.getAttribute('data-event-start');
    var evEnd = fig.getAttribute('data-event-end');
    var evLabel = fig.getAttribute('data-event-label') || '';
    var monthNames = (fig.getAttribute('data-months') ||
      'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec').split(',');

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

    // LAYER 4: TODAY vertical marker (live mode) — or event band (retro)
    var tx = x(todayIdx, pts.length);
    if (retro) {
      if (evStart && evEnd) {
        var iS = pts.findIndex(function (p) { return p.date >= evStart; });
        var iE = -1;
        for (var k = pts.length - 1; k >= 0; k--) { if (pts[k].date <= evEnd) { iE = k; break; } }
        if (iS >= 0 && iE >= iS) {
          var bx = x(iS, pts.length), bw = x(iE, pts.length) - bx;
          svg.appendChild(el('rect', {
            x: bx.toFixed(1), y: PAD.t, width: Math.max(bw, 2).toFixed(1), height: PLOT_H,
            class: 'afx-event-band'
          }));
          if (evLabel) {
            var elab = el('text', {
              x: (bx + bw / 2).toFixed(1), y: (PAD.t + 9).toFixed(1),
              'text-anchor': 'middle', class: 'afx-event-label'
            });
            elab.textContent = evLabel;
            svg.appendChild(elab);
          }
        }
      }
    } else {
      svg.appendChild(el('line', {
        x1: tx.toFixed(1), y1: PAD.t, x2: tx.toFixed(1), y2: PAD.t + PLOT_H, class: 'afx-today'
      }));
    }

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

    // LAYER 8: today's TSB marker (ring + core) — live mode only
    if (!retro) {
      var tdy = pts[todayIdx];
      var tdyY = y(tdy.tsb, s);
      svg.appendChild(el('circle', { cx: tx.toFixed(1), cy: tdyY.toFixed(1), r: 4.5, class: 'afx-today-dot-ring' }));
      svg.appendChild(el('circle', { cx: tx.toFixed(1), cy: tdyY.toFixed(1), r: 3, class: 'afx-today-dot-core' }));
    }

    // LAYER 9: X labels — months (retro) or -Nd / TODAY / +Nd (live)
    var xLabels;
    if (retro) {
      // one tick per month boundary, using each point's ISO `date`
      xLabels = [];
      var lastMonth = null;
      pts.forEach(function (p, i) {
        if (!p.date) return;
        var m = p.date.slice(0, 7);
        if (m !== lastMonth) {
          lastMonth = m;
          var mi = parseInt(p.date.slice(5, 7), 10) - 1;
          xLabels.push({ pos: i / (pts.length - 1), text: monthNames[mi] || '' });
        }
      });
    } else {
      xLabels = [
        { pos: 0, text: '-' + historic + 'D' },
        { pos: todayIdx / (pts.length - 1) * 0.5, text: '-' + Math.max(Math.round(historic / 2), 1) + 'D' },
        { pos: todayIdx / (pts.length - 1), text: 'TODAY', today: true },
        { pos: (todayIdx / (pts.length - 1) + 1) / 2, text: '+' + Math.max(Math.round(forecast / 2), 1) + 'D' },
        { pos: 1, text: '+' + forecast + 'D' }
      ];
    }
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

  // ── Weekly load + fitness bar/line (mirrors a training-load block view)
  // Bars = weekly TSS (left axis), line = CTL / fitness (right axis),
  // recovery weeks highlighted. Data: [{wk,tss,ctl,recovery}]. Dual axis so
  // the ~7× scale gap between weekly TSS and CTL both read cleanly.
  function renderWeekly(fig) {
    var dataEl = fig.querySelector('.app-figure-data');
    var target = fig.querySelector('.app-figure-chart');
    if (!dataEl || !target) return;
    var wks;
    try { wks = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!Array.isArray(wks) || !wks.length) return;

    var W = 600, H = 300, PAD = { l: 34, r: 30, t: 14, b: 30 };
    var PW = W - PAD.l - PAD.r, PH = H - PAD.t - PAD.b;
    var n = wks.length;

    // Axis maxima/steps: auto by default, overridable per figure so a
    // non-CTL right axis (e.g. average power in W) gets round tick labels.
    var na = function (attr) { var v = parseFloat(fig.getAttribute(attr)); return isFinite(v) ? v : null; };
    var tssMax = na('data-left-max') || Math.ceil(Math.max.apply(null, wks.map(function (w) { return w.tss; })) / 200) * 200;
    var tssStep = na('data-left-step') || tssMax / 4;
    var rMax = na('data-right-max') || Math.ceil(Math.max.apply(null, wks.map(function (w) { return w.ctl; })) / 25) * 25;
    var rStep = na('data-right-step') || rMax / 4;
    var yT = function (v) { return PAD.t + PH * (1 - v / tssMax); };
    var yC = function (v) { return PAD.t + PH * (1 - v / rMax); };
    var band = PW / n, bw = band * 0.6;
    var cx = function (i) { return PAD.l + band * i + band / 2; };

    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet', role: 'img' });

    // gridlines + left (bar) / right (line) axis labels
    for (var g = 0; g <= tssMax + 0.5; g += tssStep) {
      var gy = yT(g);
      svg.appendChild(el('line', { x1: PAD.l, y1: gy.toFixed(1), x2: W - PAD.r, y2: gy.toFixed(1), class: 'afx-grid' + (g === 0 ? ' is-zero' : '') }));
      var lt = el('text', { x: PAD.l - 5, y: (gy + 3).toFixed(1), 'text-anchor': 'end', class: 'afx-axis-label' });
      lt.textContent = String(Math.round(g)); svg.appendChild(lt);
    }
    for (var c = 0; c <= rMax + 0.5; c += rStep) {
      var rt = el('text', { x: W - PAD.r + 5, y: (yC(c) + 3).toFixed(1), 'text-anchor': 'start', class: 'afx-axis-label afx-axis-ctl' });
      rt.textContent = String(Math.round(c)); svg.appendChild(rt);
    }

    // bars (weekly TSS)
    wks.forEach(function (w, i) {
      var h = Math.max(PAD.t + PH - yT(w.tss), 0);
      svg.appendChild(el('rect', {
        x: (cx(i) - bw / 2).toFixed(1), y: yT(w.tss).toFixed(1),
        width: bw.toFixed(1), height: h.toFixed(1), rx: 1.5,
        class: 'afx-bar' + (w.recovery ? ' is-recovery' : '')
      }));
    });

    // CTL line + dots (right axis)
    var d = '';
    wks.forEach(function (w, i) { d += (i ? 'L' : 'M') + cx(i).toFixed(1) + ' ' + yC(w.ctl).toFixed(1) + ' '; });
    svg.appendChild(el('path', { d: d.trim(), class: 'afx-line afx-ctl' }));
    wks.forEach(function (w, i) {
      svg.appendChild(el('circle', { cx: cx(i).toFixed(1), cy: yC(w.ctl).toFixed(1), r: 2.4, class: 'afx-ctl-dot' }));
    });

    // X labels — all bars when few, else every 3rd + endpoints
    wks.forEach(function (w, i) {
      if (n > 8 && i !== 0 && (i + 1) % 3 !== 0 && i !== n - 1) return;
      var t = el('text', { x: cx(i).toFixed(1), y: (H - PAD.b + 18).toFixed(1), 'text-anchor': 'middle', class: 'afx-axis-label' });
      t.textContent = (w.label || ('W' + w.wk)); svg.appendChild(t);
    });

    target.textContent = '';
    target.appendChild(svg);
  }

  function init() {
    var figs = document.querySelectorAll('[data-app-figure]');
    for (var i = 0; i < figs.length; i++) {
      var type = figs[i].getAttribute('data-app-figure');
      if (type === 'weekly') renderWeekly(figs[i]);
      else renderPMC(figs[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
