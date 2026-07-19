/* Main interactions: tabs, pencils, timeline, dialogs, scrollspy, music. */
(function () {
  var pencils = document.querySelector('.pencils');
  if (pencils) {
    var pens = Array.prototype.slice.call(pencils.querySelectorAll('.pencil'));
    var skpanels = pens.map(function (p) { return document.getElementById(p.getAttribute('aria-controls')); });
    var pickPen = function (idx, focus) {
      pens.forEach(function (p, i) {
        var on = i === idx;
        p.setAttribute('aria-selected', on ? 'true' : 'false');
        p.tabIndex = on ? 0 : -1;
        if (skpanels[i]) { skpanels[i].hidden = !on; }
      });
      if (focus) { pens[idx].focus(); }
    };
    pens.forEach(function (p, i) {
      p.addEventListener('click', function () { pickPen(i); });
      p.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { n = (i + 1) % pens.length; }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { n = (i - 1 + pens.length) % pens.length; }
        else if (e.key === 'Home') { n = 0; }
        else if (e.key === 'End') { n = pens.length - 1; }
        if (n !== null) { e.preventDefault(); pickPen(n, true); }
      });
    });
    pickPen(0);
  }

  var noMotion = function () {
    return (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
      (document.documentElement.getAttribute('data-a11y') || '').indexOf('motion') !== -1;
  };

  var statsBand = document.querySelector('.stats');
  if (statsBand && 'IntersectionObserver' in window) {
    var statParsed = Array.prototype.slice.call(statsBand.querySelectorAll('.stat b')).map(function (el) {
      var m = (el.textContent || '').match(/^([\d,]+)(.*)$/);
      if (!m) { return null; }
      return { el: el, target: parseInt(m[1].replace(/,/g, ''), 10), suffix: m[2] || '', comma: m[1].indexOf(',') !== -1 };
    });
    var statFmt = function (n, comma) { n = Math.round(n); return comma ? n.toLocaleString('en-US') : String(n); };
    var statRan = false;
    var runCounts = function () {
      if (statRan) { return; }
      statRan = true;
      if (noMotion()) { return; }
      var t0 = null, DUR = 1200;
      var tick = function (ts) {
        if (t0 === null) { t0 = ts; }
        var pr = Math.min(1, (ts - t0) / DUR);
        var e = 1 - Math.pow(1 - pr, 3);
        statParsed.forEach(function (s) { if (s) { s.el.textContent = statFmt(s.target * e, s.comma) + s.suffix; } });
        if (pr < 1) { requestAnimationFrame(tick); }
      };
      statParsed.forEach(function (s) { if (s) { s.el.textContent = statFmt(0, false) + s.suffix; } });
      requestAnimationFrame(tick);
    };
    var statObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runCounts(); statObs.disconnect(); }
    }, { threshold: 0.35 });
    statObs.observe(statsBand);
  }

  var tlTrack = document.querySelector('.tl-track');
  if (tlTrack) {
    var tlNodes = Array.prototype.slice.call(tlTrack.querySelectorAll('.tl-node'));
    var tlPanes = tlNodes.map(function (n) { return document.getElementById(n.getAttribute('aria-controls')); });
    var tlScroller = document.querySelector('.tl-scroller');
    var isVis = function (n) { return n.style.display !== 'none'; };
    var pickNode = function (idx, focus, doScroll) {
      tlNodes.forEach(function (n, i) {
        var on = i === idx;
        n.setAttribute('aria-selected', on ? 'true' : 'false');
        n.tabIndex = on ? 0 : -1;
        if (tlPanes[i]) { tlPanes[i].hidden = !on; }
      });
      if (focus) { tlNodes[idx].focus(); }
      if (doScroll && tlScroller) { tlScroller.scrollTo({ left: Math.max(0, tlNodes[idx].offsetLeft - 18), behavior: noMotion() ? 'auto' : 'smooth' }); }
    };
    var stepVisible = function (from, step) {
      var i = from;
      for (var c = 0; c < tlNodes.length; c++) { i = (i + step + tlNodes.length) % tlNodes.length; if (isVis(tlNodes[i])) { return i; } }
      return from;
    };
    tlNodes.forEach(function (n, i) {
      n.addEventListener('click', function () { pickNode(i, false, true); });
      n.addEventListener('keydown', function (e) {
        var m = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { m = stepVisible(i, 1); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { m = stepVisible(i, -1); }
        else if (e.key === 'Home') { m = stepVisible(-1, 1); }
        else if (e.key === 'End') { m = stepVisible(0, -1); }
        if (m !== null) { e.preventDefault(); pickNode(m, true, true); }
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.tl-arrow'), function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-dir'), 10);
        if (tlScroller) { tlScroller.scrollBy({ left: dir * 350, behavior: noMotion() ? 'auto' : 'smooth' }); }
      });
    });
    var tlFilters = Array.prototype.slice.call(document.querySelectorAll('.tl-filter'));
    var applyFilter = function (cat) {
      tlFilters.forEach(function (f) { var on = f.getAttribute('data-cat') === cat; f.classList.toggle('is-active', on); f.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var selHidden = true, firstVis = -1;
      tlNodes.forEach(function (n, i) {
        var show = cat === 'all' || (n.getAttribute('data-cat') || '').split(' ').indexOf(cat) !== -1;
        n.style.display = show ? '' : 'none';
        if (show && firstVis < 0) { firstVis = i; }
        if (show && n.getAttribute('aria-selected') === 'true') { selHidden = false; }
      });
      if (selHidden && firstVis >= 0) { pickNode(firstVis, false, false); }
      if (tlScroller) { tlScroller.scrollTo({ left: 0, behavior: noMotion() ? 'auto' : 'smooth' }); }
    };
    tlFilters.forEach(function (f) { f.addEventListener('click', function () { applyFilter(f.getAttribute('data-cat')); }); });
    pickNode(0);
  }


  var toTop = document.getElementById('toTop');
  if (toTop) {
    var syncToTop = function () { toTop.classList.toggle('show', window.scrollY > 520); };
    window.addEventListener('scroll', syncToTop, { passive: true });
    syncToTop();
    toTop.addEventListener('click', function () {
      if (!noMotion()) { toTop.classList.remove('launching'); void toTop.offsetWidth; toTop.classList.add('launching'); }
      window.scrollTo({ top: 0, behavior: noMotion() ? 'auto' : 'smooth' });
    });
    toTop.addEventListener('animationend', function () { toTop.classList.remove('launching'); });
  }

  var fill = document.getElementById('scrollFill');
  if (fill) {
    var ticking = false;
    var updateFill = function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
    };
    var queueFill = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateFill); }
    };
    window.addEventListener('scroll', queueFill, { passive: true });
    window.addEventListener('resize', queueFill, { passive: true });
    updateFill();
  }

  var shotDialog = document.getElementById('shotDialog');
  if (shotDialog) {
    var shotFull = document.getElementById('shotFull');
    var shotFullCap = document.getElementById('shotFullCap');
    Array.prototype.forEach.call(document.querySelectorAll('.shot'), function (btn) {
      btn.addEventListener('click', function () {
        var img = btn.querySelector('img');
        shotFull.src = img.src;
        shotFull.alt = img.alt;
        shotFull.height = img.getAttribute('height');
        shotFullCap.textContent = btn.querySelector('.shot-cap').textContent;
        shotDialog.showModal();
      });
    });
    document.getElementById('shotClose').addEventListener('click', function () { shotDialog.close(); });
    shotDialog.addEventListener('click', function (e) {
      var r = shotDialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { shotDialog.close(); }
    });
  }

  var vidDialog = document.getElementById('vidDialog');
  if (vidDialog) {
    var vidWrap = document.getElementById('vidWrap');
    var openVid = function (id, start, title) {
      var frame = document.createElement('iframe');
      frame.className = 'yt-frame';
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' + (start ? '&start=' + start : '');
      frame.title = title;
      frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
      frame.setAttribute('allowfullscreen', '');
      vidWrap.textContent = '';
      vidWrap.appendChild(frame);
      vidDialog.showModal();
    };
    Array.prototype.forEach.call(document.querySelectorAll('.talk-video .vplay'), function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.talk-video');
        openVid(card.getAttribute('data-yt'), card.getAttribute('data-start'), btn.getAttribute('aria-label'));
      });
    });
    document.getElementById('vidClose').addEventListener('click', function () { vidDialog.close(); });
    vidDialog.addEventListener('click', function (e) { if (e.target === vidDialog) vidDialog.close(); });
    vidDialog.addEventListener('close', function () { vidWrap.textContent = ''; });
  }

  var printOpened = [];
  window.addEventListener('beforeprint', function () {
    printOpened = [];
    document.querySelectorAll('details:not([open])').forEach(function (d) {
      d.setAttribute('open', ''); printOpened.push(d);
    });
  });
  window.addEventListener('afterprint', function () {
    printOpened.forEach(function (d) { d.removeAttribute('open'); });
    printOpened = [];
  });

  var brandSvg = document.querySelector('.brand svg');
  if (brandSvg) {
    brandSvg.parentNode.addEventListener('click', function () {
      var noMotion = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
        (document.documentElement.getAttribute('data-a11y') || '').indexOf('motion') !== -1;
      if (noMotion) { return; }
      brandSvg.classList.remove('boop');
      void brandSvg.getBoundingClientRect();
      brandSvg.classList.add('boop');
    });
    brandSvg.addEventListener('animationend', function () { brandSvg.classList.remove('boop'); });
  }

  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('nav.site a[href^="#"]'));
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var spyTargets = spyLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          spyLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }
var ddDialog = document.getElementById('ddDialog');
  if (ddDialog) {
    document.getElementById('ddOpen').addEventListener('click', function () { ddDialog.showModal(); });
    document.getElementById('ddClose').addEventListener('click', function () { ddDialog.close(); });
    ddDialog.addEventListener('click', function (e) {
      var r = ddDialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { ddDialog.close(); }
    });
  }
})();

/* Music: hidden YouTube player, toggled by the button above the rocket.
   Starts on click (browsers require a gesture) and fades out on pause. */
(function () {
  var btn = document.getElementById('musicBtn');
  if (!btn) return;
  var player = null, ready = false, want = false, fade = null, on = false;
  function make() {
    if (player) return;
    if (!document.getElementById('ytm')) {
      var h = document.createElement('div'); h.id = 'ytm';
      h.style.cssText = 'position:fixed;left:-9999px;width:0;height:0;overflow:hidden;';
      document.body.appendChild(h);
    }
    player = new YT.Player('ytm', { height: '0', width: '0', videoId: 'zp7NtW_hKJI',
      playerVars: { autoplay: 0, controls: 0, playsinline: 1, rel: 0, loop: 1, playlist: 'zp7NtW_hKJI' },
      events: { onReady: function () { ready = true; if (want) play(); } } });
  }
  function ensure() {
    if (window.YT && window.YT.Player) { make(); return; }
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () { if (prev) prev(); make(); };
    if (!document.getElementById('ytapi')) {
      var s = document.createElement('script'); s.id = 'ytapi';
      s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    }
  }
  function play() { try { if (fade) { clearInterval(fade); fade = null; } player.setVolume(60); player.unMute(); player.playVideo(); } catch (e) {} }
  btn.addEventListener('click', function () {
    on = !on;
    btn.classList.toggle('playing', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    if (on) { want = true; ensure(); if (ready) play(); }
    else {
      want = false;
      try {
        if (player && ready) {
          var v = 60; if (fade) clearInterval(fade);
          fade = setInterval(function () { v -= 7;
            try { if (v > 0) { player.setVolume(v); } else { clearInterval(fade); fade = null; player.pauseVideo(); player.setVolume(60); } }
            catch (e) { clearInterval(fade); fade = null; } }, 80);
        }
      } catch (e) {}
    }
  });
})();
