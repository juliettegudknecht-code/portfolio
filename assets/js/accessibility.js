/* Accessibility panel: toggles persisted to localStorage. */
(function () {

  var KEYS = ['motion', 'plain', 'large', 'contrast', 'font', 'links', 'captions'];
  var root = document.documentElement;
  var togs = document.querySelectorAll('.a11y-tog');

  function load() {
    try { return JSON.parse(localStorage.getItem('jg_a11y') || '{}') || {}; } catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem('jg_a11y', JSON.stringify(state)); } catch (e) {}
  }
  function apply(state) {
    var on = KEYS.filter(function (k) { return state[k]; });
    if (on.length) { root.setAttribute('data-a11y', on.join(' ')); }
    else { root.removeAttribute('data-a11y'); }
    togs.forEach(function (t) {
      t.setAttribute('aria-pressed', state[t.getAttribute('data-key')] ? 'true' : 'false');
    });
  }

  var state = load();
  apply(state);

  togs.forEach(function (t) {
    t.addEventListener('click', function () {
      var k = t.getAttribute('data-key');
      state[k] = !state[k];
      save(state);
      apply(state);
    });
  });

  document.getElementById('a11yReset').addEventListener('click', function () {
    state = {};
    try { localStorage.removeItem('jg_a11y'); } catch (e) {}
    apply(state);
  });

  var fab = document.getElementById('a11yFab');
  var panel = document.getElementById('a11yPanel');
  fab.addEventListener('click', function () {
    var open = panel.classList.toggle('open');
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  var dialog = document.getElementById('privacyDialog');
  document.getElementById('privacyOpen').addEventListener('click', function () { dialog.showModal(); });
  document.getElementById('privacyClose').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) {
    var r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) { dialog.close(); }
  });
})();
