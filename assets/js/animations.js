/* Animations: scroll reveal, intro reel + star-cluster entrance, starfield. */

(function () {
  document.documentElement.classList.add('js');
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  Array.prototype.slice.call(document.querySelectorAll('.folder-tabs')).forEach(function (tablist) {
    var ftabs = Array.prototype.slice.call(tablist.querySelectorAll('.ftab'));
    var fpanels = ftabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var selectTab = function (idx, focus) {
      ftabs.forEach(function (t, i) {
        var on = i === idx;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        fpanels[i].hidden = !on;
      });
      if (focus) { ftabs[idx].focus(); }
      if (typeof queueFill === 'function') { queueFill(); }
    };
    ftabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectTab(i); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') { n = (i + 1) % ftabs.length; }
        else if (e.key === 'ArrowLeft') { n = (i - 1 + ftabs.length) % ftabs.length; }
        else if (e.key === 'Home') { n = 0; }
        else if (e.key === 'End') { n = ftabs.length - 1; }
        if (n !== null) { e.preventDefault(); selectTab(n, true); }
      });
    });
    selectTab(0);
  });

  var intro = document.getElementById('intro');
  if (intro) {
    var introDone = false;
    var killIntro = function () {
      if (introDone) return;
      introDone = true;
      intro.remove();
      document.documentElement.classList.remove('show-intro');
    };
    if (document.documentElement.classList.contains('show-intro')) {
      var startOut = function () { if (!introDone) { intro.classList.add('intro-out'); } };
      document.getElementById('introSkip').addEventListener('click', startOut);
      intro.addEventListener('click', startOut);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') startOut(); });
      intro.addEventListener('animationend', function (e) { if (e.animationName === 'introLeave') killIntro(); });
      setTimeout(killIntro, 7000);
    } else {
      killIntro();
    }
  }
})();

/* The hero shuttle drifts with the first screen and responds to the pointer.
   It stays still when the visitor asks for reduced motion. */
(function () {
  var art = document.querySelector('.hero-shuttle-art');
  if (!art) return;
  var hero = art.closest('.hero');
  var root = document.documentElement;
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var finePointer = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
  var raf = 0;

  function motionOff() {
    return (motionQuery && motionQuery.matches) ||
      (root.getAttribute('data-a11y') || '').indexOf('motion') >= 0;
  }

  function set(name, value) {
    art.style.setProperty(name, value);
  }

  function resetHover() {
    art.classList.remove('is-hovered');
    set('--shuttle-hover-x', '0px');
    set('--shuttle-hover-y', '0px');
    set('--shuttle-hover-rotate', '0deg');
    set('--shuttle-scale', '1');
  }

  function resetAll() {
    resetHover();
    set('--shuttle-scroll-y', '0px');
    set('--shuttle-scroll-rotate', '0deg');
  }

  function updateScroll() {
    raf = 0;
    if (motionOff() || !hero) {
      resetAll();
      return;
    }
    var rect = hero.getBoundingClientRect();
    var travel = Math.max(1, Math.min(hero.offsetHeight, window.innerHeight));
    var progress = Math.max(0, Math.min(1, -rect.top / travel));
    var compact = window.innerWidth <= 960;
    set('--shuttle-scroll-y', (-progress * (compact ? 32 : 58)).toFixed(1) + 'px');
    set('--shuttle-scroll-rotate', (progress * (compact ? 4 : 7)).toFixed(2) + 'deg');
  }

  function queueScroll() {
    if (!raf) raf = requestAnimationFrame(updateScroll);
  }

  art.addEventListener('pointerenter', function () {
    if (motionOff() || (finePointer && !finePointer.matches)) return;
    art.classList.add('is-hovered');
    set('--shuttle-hover-y', '-8px');
    set('--shuttle-scale', '1.035');
  });

  art.addEventListener('pointermove', function (event) {
    if (motionOff() || (finePointer && !finePointer.matches)) return;
    var rect = art.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    var y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    set('--shuttle-hover-x', (x * 10).toFixed(1) + 'px');
    set('--shuttle-hover-y', (-8 + y * 5).toFixed(1) + 'px');
    set('--shuttle-hover-rotate', (x * 3.5).toFixed(2) + 'deg');
  });

  art.addEventListener('pointerleave', resetHover);
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  if (motionQuery && motionQuery.addEventListener) motionQuery.addEventListener('change', queueScroll);
  new MutationObserver(queueScroll).observe(root, { attributes: true, attributeFilter: ['data-a11y'] });
  updateScroll();
})();

/* Starfield: two twinkling depth layers with diffraction sparkles, gentle
   scroll parallax, and a rare ambient shooting star. Respects the reduced
   motion preference and the site's own motion toggle. */
(function () {
  var DSTAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0 L12.9 11.1 24 12 12.9 12.9 12 24 11.1 12.9 0 12 11.1 11.1 Z" fill="#e6ecff"/></svg>';
  function motionOff() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
      return (document.documentElement.getAttribute('data-a11y') || '').indexOf('motion') >= 0;
    } catch (e) { return false; }
  }
  var host = document.getElementById('stars');
  if (!host) return;
  var still = motionOff();
  var TINTS = ['#cfd8f2', '#cfd8f2', '#cfd8f2', '#bcd2ff', '#f4d9e8'];
  function star(near) {
    var x = (Math.random() * 100).toFixed(2), y = (Math.random() * 100).toFixed(2),
        s = (near ? Math.random() * 1.5 + 0.9 : Math.random() * 0.9 + 0.5).toFixed(2),
        o = (near ? Math.random() * 0.35 + 0.16 : Math.random() * 0.22 + 0.08).toFixed(2),
        d = (Math.random() * 6).toFixed(2), c = TINTS[Math.floor(Math.random() * TINTS.length)];
    return '<i class="star' + (still ? '' : ' tw') + '" style="left:' + x + '%;top:' + y + '%;width:' + s + 'px;height:' + s + 'px;opacity:' + o + ';background:' + c + ';animation-delay:' + d + 's"></i>';
  }
  var far = '', near = '', i;
  for (i = 0; i < 72; i++) far += star(false);
  for (i = 0; i < 52; i++) near += star(true);
  for (i = 0; i < 6; i++) {
    near += '<span class="dstar' + (still ? '' : ' tw') + '" style="left:' + (Math.random() * 94 + 3).toFixed(2) + '%;top:' + (Math.random() * 90 + 3).toFixed(2) + '%;animation-delay:' + (Math.random() * 6).toFixed(2) + 's">' + DSTAR + '</span>';
  }
  var constel =
    '<svg class="constel" style="left:5%;top:14%;width:160px" viewBox="0 0 150 90" aria-hidden="true">' +
      '<polyline points="18,58 44,64 52,40 26,34 18,58" fill="none" stroke="rgba(180,195,240,0.3)" stroke-width="1" stroke-dasharray="3 5"/>' +
      '<polyline points="52,40 78,30 104,26 132,14" fill="none" stroke="rgba(180,195,240,0.3)" stroke-width="1" stroke-dasharray="3 5"/>' +
      '<g fill="#cfd8f2"><circle cx="18" cy="58" r="2"/><circle cx="44" cy="64" r="1.7"/><circle cx="52" cy="40" r="2"/><circle cx="26" cy="34" r="1.6"/><circle cx="78" cy="30" r="1.7"/><circle cx="104" cy="26" r="1.6"/><circle cx="132" cy="14" r="2.2"/></g>' +
    '</svg>' +
    '<svg class="constel" style="right:7%;top:58%;width:130px" viewBox="0 0 120 60" aria-hidden="true">' +
      '<polyline points="8,38 34,16 58,30 84,10 112,26" fill="none" stroke="rgba(180,195,240,0.3)" stroke-width="1" stroke-dasharray="3 5"/>' +
      '<g fill="#cfd8f2"><circle cx="8" cy="38" r="1.8"/><circle cx="34" cy="16" r="1.6"/><circle cx="58" cy="30" r="2"/><circle cx="84" cy="10" r="1.6"/><circle cx="112" cy="26" r="1.9"/></g>' +
    '</svg>';
  host.innerHTML = '<div class="milkyway"></div><div class="starlayer far">' + far + '</div><div class="starlayer near">' + near + constel + '</div>';

  var farEl = host.querySelector('.starlayer.far'), nearEl = host.querySelector('.starlayer.near'), raf = 0;
  function parallax() {
    if (motionOff()) return;
    var cap = window.innerHeight * 0.45, y = window.scrollY || 0;
    farEl.style.transform = 'translateY(' + (-Math.min(y * 0.04, cap)).toFixed(1) + 'px)';
    nearEl.style.transform = 'translateY(' + (-Math.min(y * 0.09, cap)).toFixed(1) + 'px)';
  }
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; parallax(); });
  }, { passive: true });

  function scheduleShot(first) {
    setTimeout(fireShot, first ? (9000 + Math.random() * 9000) : (70000 + Math.random() * 80000));
  }
  function fireShot() {
    try {
      if (!motionOff() && !document.hidden) {
        var el = document.createElement('div');
        el.className = 'shootingstar';
        el.style.top = (Math.random() * 55 + 5).toFixed(1) + '%';
        el.style.animationDuration = (Math.random() * 0.8 + 1.4).toFixed(2) + 's';
        el.addEventListener('animationend', function () { try { el.remove(); } catch (e) {} });
        host.appendChild(el);
        setTimeout(function () { try { el.remove(); } catch (e) {} }, 4500);
      }
    } catch (e) {}
    scheduleShot(false);
  }
  scheduleShot(true);
})();
