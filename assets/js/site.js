/* =====================================================================
   SKILLABLE AT GA  |  site.js
   Builds the parts every page shares (sidebar, breadcrumbs, "On this
   page", progress, next/previous, footer) from site-config.js.
   You should not need to edit this file to change content or menus.
   ===================================================================== */
(function () {
  'use strict';

  var SITE = window.SITE;
  if (!SITE) { return; }

  /* ---- Helpers ---- */
  var scriptEl = document.currentScript || document.querySelector('script[src*="assets/js/site.js"]');
  var ROOT = scriptEl ? scriptEl.src.replace(/assets\/js\/site\.js.*$/, '') : '';
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(file) { return ROOT + file; }
  function normalize(href) {
    var u = href.split('#')[0].split('?')[0];
    try { u = decodeURI(u); } catch (e) { /* leave as is */ }
    if (/\/$/.test(u)) { u += 'index.html'; }
    return u;
  }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { if (v === null) { localStorage.removeItem(k); } else { localStorage.setItem(k, v); } } catch (e) { /* storage unavailable */ } }
  };
  function isIndex(p) { return /(^|\/)index\.html$/.test(p.file); }
  function labelOf(p) { return isIndex(p) ? (p.nav || 'Overview') : (p.nav || p.title); }
  var EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  var ICON_INFO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="22.6" fill="none" stroke="#E41E26" stroke-width="1.4"/><g transform="translate(12.5 12.5) scale(0.96)" fill="none" stroke="#000000" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" style="color:#000000"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></g></svg>';
  var ICON_WARN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="22.6" fill="none" stroke="#E41E26" stroke-width="1.4"/><g transform="translate(12.5 12.5) scale(0.96)" fill="none" stroke="#000000" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" style="color:#000000"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></g></svg>';

  /* ---- Work out which page we are on, and number the pages ---- */
  var here = normalize(location.href);
  var isHome = (here === normalize(ROOT + 'index.html'));
  var all = [], counter = 0, numbers = {};
  SITE.groups.forEach(function (g) {
    g.pages.forEach(function (p, i) {
      if (!g.hidden && !isIndex(p)) { counter++; numbers[p.file] = (counter < 10 ? '0' : '') + counter; }
      all.push({ group: g, page: p, index: i, href: url(p.file) });
    });
  });
  function num(p) { return numbers[p.file] || ''; }
  var current = null;
  all.forEach(function (x) { if (!current && normalize(x.href) === here) { current = x; } });

  /* ---- Sidebar ---- */
  function buildSidebar() {
    var host = $('#site-nav');
    if (!host) { return; }
    var la = SITE.labAdmin || {};
    var secs = SITE.groups.filter(function (g) { return !g.hidden; }).map(function (g) {
      var open = current && current.group.id === g.id;
      var links = g.pages.map(function (p) {
        var on = current && p.file === current.page.file;
        return '<a href="' + url(p.file) + '"' + (on ? ' aria-current="page"' : '') + '><span class="n">' + num(p) + '</span><span>' + esc(labelOf(p)) + '</span></a>';
      }).join('');
      return '<div class="sec' + (open ? ' open' : '') + '"><button class="grp" type="button" aria-expanded="' + (open ? 'true' : 'false') + '">' + esc(g.side || g.title) + CHEV + '</button><div class="links">' + links + '</div></div>';
    }).join('');
    host.outerHTML =
      '<div class="topbar"><a href="' + url('index.html') + '"><img src="' + url('assets/img/logo_dark.png') + '" alt="General Assembly"></a>' +
        '<button class="menu-btn" id="menu-btn" type="button" aria-controls="side" aria-expanded="false">Menu</button></div>' +
      '<div class="scrim" id="scrim"></div>' +
      '<aside class="side" id="side" aria-label="Guides">' +
        '<div class="side-top"><a class="brand" href="' + url('index.html') + '"><img src="' + url('assets/img/logo_dark.png') + '" alt="General Assembly"><div class="site-name">' + esc(SITE.name) + '<span class="r">.</span></div></a>' +
          '<a class="tms" href="' + esc((SITE.links || {}).tms || '#') + '" target="_blank" rel="noopener">Open TMS' + EXT + '</a></div>' +
        '<nav aria-label="Guides"><a class="home-link" href="' + url('index.html') + '"' + (isHome ? ' aria-current="page"' : '') + '><span class="n"></span><span>Home</span></a>' + secs + '</nav>' +
        '<div class="side-foot"><strong>Questions?</strong> Reach out to ' + esc(la.name || '') + '<br><a href="mailto:' + esc(la.email || '') + '">' + esc(la.email || '') + '</a><br><a href="' + url('help/how-to-edit.html') + '">Updating this site</a></div>' +
      '</aside>';
    $$('.side .grp').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = b.parentNode, open = !s.classList.contains('open');
        s.classList.toggle('open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    var mb = $('#menu-btn');
    function setNav(open) { document.body.classList.toggle('nav-open', open); mb.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    mb.addEventListener('click', function () { setNav(!document.body.classList.contains('nav-open')); });
    $('#scrim').addEventListener('click', function () { setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setNav(false); } });
  }

  /* ---- Hero: kicker (page number and section) and red last word ---- */
  function buildHero() {
    var k = $('.hero .kicker');
    if (k && current) {
      var g = current.group, p = current.page;
      if (isIndex(p)) { k.innerHTML = esc(g.title); }
      else { k.innerHTML = '<span class="docno">' + num(p) + '</span><a href="' + url(g.pages[0].file) + '">' + esc(g.title) + '</a>'; }
    } else if (k) { k.textContent = SITE.name; }
    $$('.hero h1').forEach(function (h) {
      if ($('.r', h)) { return; }
      var t = h.innerHTML.replace(/\s+$/, '');
      var m = t.match(/^(.*?)(\S+?)([?!.]?)$/);
      if (!m) { return; }
      h.innerHTML = m[1] + '<span class="r">' + m[2] + (m[3] || '.') + '</span>';
    });
  }

  /* ---- "On this page" and section numbers ---- */
  function buildToc() {
    var art = $('.article'), toc = $('#toc'), body = $('.body');
    if (!art || !body) { return; }
    var heads = $$(':scope > h2', art), used = {};
    heads.forEach(function (h) {
      if (!h.id) {
        var base = slug(h.textContent) || 'section', id = base, n = 2;
        while (used[id] || document.getElementById(id)) { id = base + '-' + n++; }
        h.id = id;
      }
      used[h.id] = true;
    });
    if (heads.length >= 3 && toc) {
      toc.innerHTML = '<h2>On this page</h2>' + heads.map(function (h) { return '<a href="#' + h.id + '">' + esc(h.textContent) + '</a>'; }).join('');
      if ('IntersectionObserver' in window) {
        var links = $$('a', toc);
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); }); } });
        }, { rootMargin: '-10px 0px -70% 0px' });
        heads.forEach(function (h) { io.observe(h); });
      }
    } else { if (toc) { toc.remove(); } body.classList.add('no-toc'); }
    if (heads.length >= 2) {
      heads.forEach(function (h, i) { h.insertAdjacentHTML('afterbegin', '<span class="secno">Section ' + (i < 9 ? '0' : '') + (i + 1) + '</span>'); });
    }
  }

  /* ---- Callouts: icon on the left; tips get a red label ---- */
  function buildCallouts() {
    $$('.article .callout').forEach(function (c) {
      if (c.classList.contains('tip')) {
        if (!$('.callout-title', c)) { c.insertAdjacentHTML('afterbegin', '<span class="lab">Good to know</span>'); }
        return;
      }
      if (c.classList.contains('black') || $('.ic', c)) { return; }
      var body = document.createElement('div'); body.className = 'cbody';
      while (c.firstChild) { body.appendChild(c.firstChild); }
      var ic = document.createElement('span'); ic.className = 'ic'; ic.setAttribute('aria-hidden', 'true');
      ic.innerHTML = c.classList.contains('warn') ? ICON_WARN : ICON_INFO;
      c.appendChild(ic); c.appendChild(body);
    });
  }

  /* ---- Page footer: previous / next, then who to contact ---- */
  function buildPageEnd() {
    var host = $('#page-end');
    if (!host) { return; }
    var la = SITE.labAdmin || {}, html = '';
    if (current) {
      var pages = current.group.pages, i = current.index, p = current.page;
      var seq = current.group.sequence !== false, hub = isIndex(p);
      var byFile = function (f) { var m = all.filter(function (x) { return x.page.file === f; })[0]; return m ? m.page : null; };
      var prev = seq && !hub ? pages[i - 1] : null;
      var next = p.next ? byFile(p.next) : (seq ? pages[i + 1] : null);
      if (prev || next) {
        html += '<div class="pn">' +
          (prev ? '<a class="prev" href="' + url(prev.file) + '"><small>Previous</small><span>' + esc(labelOf(prev)) + '</span></a>' : '') +
          (next ? '<a class="next" href="' + url(next.file) + '"><small>' + (hub ? 'Start with' : 'Next') + '</small><span>' + esc(next.nav || next.title) + '</span></a>' : '') +
          '</div>';
      }
    }
    html += '<p class="contact"><img src="' + url('assets/img/cog.png') + '" alt="">Questions? Reach out to ' + esc(la.name || '') + ' at <a href="mailto:' + esc(la.email || '') + '">' + esc(la.email || '') + '</a></p>';
    host.className = 'docfoot';
    host.innerHTML = html;
  }

  /* ---- Section pages: <div data-pages="group-id"></div> becomes a numbered list ---- */
  function buildPageLists() {
    $$('[data-pages]').forEach(function (el) {
      var g = SITE.groups.filter(function (x) { return x.id === el.getAttribute('data-pages'); })[0];
      if (!g) { return; }
      var pages = g.pages.filter(function (p) { return !isIndex(p); });
      el.innerHTML = '<ol class="path-list">' + pages.map(function (p) {
        return '<li><a href="' + url(p.file) + '"><span class="n">' + num(p) + '</span><span><strong>' + esc(p.title) + '</strong><span class="sum">' + esc(p.summary || '') + '</span></span><span class="time">' + esc(p.time || '') + '</span></a></li>';
      }).join('') + '</ol>';
    });
  }

  /* ---- Home: role tabs, each showing that role's reading path ---- */
  function buildRoleTabs() {
    var host = $('[data-role-tabs]');
    if (!host) { return; }
    var roles = SITE.groups.filter(function (g) { return !g.hidden; });
    var tabs = roles.map(function (g, i) {
      return '<button type="button" role="tab" id="tab-' + g.id + '" aria-controls="panel-' + g.id + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '">' + esc(g.side || g.title) + '</button>';
    }).join('');
    var panels = roles.map(function (g, i) {
      var pages = g.pages.filter(function (p) { return !(isIndex(p) && !p.nav); });
      return '<ol class="path" role="tabpanel" id="panel-' + g.id + '" aria-labelledby="tab-' + g.id + '"' + (i === 0 ? '' : ' hidden') + '>' + pages.map(function (p) {
        return '<li><a href="' + url(p.file) + '"><span class="n">' + num(p) + '</span><strong>' + esc(p.title) + '</strong><span class="d">' + esc(p.summary || '') + '</span></a></li>';
      }).join('') + '</ol>';
    }).join('');
    host.innerHTML = '<div class="tabs" role="tablist" aria-label="Choose your role">' + tabs + '</div>' + panels;
    $$('.tabs button', host).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.tabs button', host).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        $$('[role="tabpanel"]', host).forEach(function (pnl) { pnl.hidden = pnl.id !== b.getAttribute('aria-controls'); });
      });
    });
  }

  /* ---- Shared links and contact details ---- */
  function fillShared() {
    var la = SITE.labAdmin || {};
    var texts = { name: SITE.name, version: SITE.version, updated: SITE.updated, labAdminName: la.name, labAdminEmail: la.email };
    $$('[data-site]').forEach(function (el) { var v = texts[el.getAttribute('data-site')]; if (v) { el.textContent = v; } });
    $$('[data-link]').forEach(function (a) {
      var k = a.getAttribute('data-link'), isMail = /Email$/.test(k);
      var v = k === 'labAdminEmail' ? la.email : (SITE.links || {})[k];
      if (!v) { return; }
      a.setAttribute('href', isMail ? 'mailto:' + v : v);
      if (!a.textContent.trim()) {
        a.textContent = (isMail || a.hasAttribute('data-full')) ? v : v.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }
    });
  }

  /* ---- Footer (home page) ---- */
  function buildFooter() {
    var host = $('#site-footer');
    if (!host) { return; }
    var la = SITE.labAdmin || {}, L = SITE.links || {};
    host.outerHTML = '<footer class="site-foot"><img src="' + url('assets/img/logo_dark.png') + '" alt="General Assembly"><div class="cols">' +
      '<div><p><strong style="color:#fff">' + esc(SITE.name) + '</strong> ' + esc(SITE.version) + ', ' + esc(SITE.updated) + '</p>' +
      '<p>Questions? Reach out to ' + esc(la.name || '') + ' at <a href="mailto:' + esc(la.email || '') + '">' + esc(la.email || '') + '</a></p></div>' +
      '<div><p><a href="' + url('help/how-to-edit.html') + '">Updating this site</a></p><p><a href="' + esc(L.docs) + '">Skillable documentation</a> and <a href="' + esc(L.status) + '">platform status</a></p></div>' +
      '</div></footer>';
  }

  /* ---- Copy buttons ---- */
  function copyText(text, btn) {
    function done() { var old = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = old; }, 1400); }
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
  }
  function buildCopyButtons() {
    $$('.article pre').forEach(function (pre) {
      if (pre.parentNode.classList.contains('codewrap')) { return; }
      var wrap = document.createElement('div'); wrap.className = 'codewrap';
      pre.parentNode.insertBefore(wrap, pre); wrap.appendChild(pre);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'copy'; b.textContent = 'Copy';
      b.addEventListener('click', function () { copyText(pre.innerText.replace(/\n$/, ''), b); });
      wrap.appendChild(b);
    });
    $$('[data-copy-email]').forEach(function (b) {
      b.addEventListener('click', function () {
        var box = b.closest('.email'), subject = $('.bar strong', box), msg = $('.msg', box);
        copyText((subject ? 'Subject: ' + subject.innerText + '\n\n' : '') + (msg ? msg.innerText : ''), b);
      });
    });
  }

  /* ---- FAQ ---- */
  function buildFaq() {
    var items = $$('.faq details'), firstFaq = $('.faq');
    if (items.length >= 4 && firstFaq) {
      var tools = document.createElement('div'); tools.className = 'faq-tools';
      tools.innerHTML = '<button type="button" data-faq="open">Open all</button><button type="button" data-faq="close">Close all</button>';
      firstFaq.parentNode.insertBefore(tools, firstFaq);
      tools.addEventListener('click', function (e) {
        var m = e.target.getAttribute('data-faq');
        if (m) { items.forEach(function (d) { d.open = (m === 'open'); }); }
      });
    }
    function openFromHash() {
      if (!location.hash) { return; }
      var el = document.getElementById(location.hash.slice(1));
      var d = el && el.closest ? el.closest('details') : null;
      if (d) { d.open = true; el.scrollIntoView(); }
    }
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  }

  /* ---- Tick boxes remember their state in this browser ---- */
  function buildChecks() {
    var boxes = $$('.checklist input[type="checkbox"], .article td input[type="checkbox"], .shotitem input[type="checkbox"]');
    if (!boxes.length) { return; }
    boxes.forEach(function (box, i) {
      var key = 'skillable-check:' + here + ':' + i;
      box.checked = store.get(key) === '1';
      box.addEventListener('change', function () { store.set(key, box.checked ? '1' : null); });
    });
    var first = boxes[0].closest('table') || boxes[0].closest('ul') || boxes[0].closest('.shotitem') || boxes[0];
    if (first.parentNode.classList.contains('tscroll')) { first = first.parentNode; }
    var note = document.createElement('p');
    note.innerHTML = '<span class="tick-note">Your ticks are saved in this browser only. </span><button type="button" class="reset-checks">Clear all ticks</button>';
    first.parentNode.insertBefore(note, first);
    $('.reset-checks', note).addEventListener('click', function () {
      boxes.forEach(function (box, i) { box.checked = false; store.set('skillable-check:' + here + ':' + i, null); });
    });
  }

  /* ---- Table filter: <input data-filter="#table-id"> ---- */
  function buildFilters() {
    $$('[data-filter]').forEach(function (input) {
      var table = $(input.getAttribute('data-filter'));
      if (!table) { return; }
      var rows = $$('tbody tr', table), empty = $('.filter-empty');
      input.addEventListener('input', function () {
        var q = input.value.toLowerCase().trim(), shown = 0;
        rows.forEach(function (r) { var hit = !q || r.textContent.toLowerCase().indexOf(q) > -1; r.hidden = !hit; if (hit) { shown++; } });
        if (empty) { empty.hidden = shown > 0; }
      });
    });
  }

  /* ---- Screenshots: placeholder until the image file exists ---- */
  function buildShots() {
    if (SITE.showPlaceholders === false) { document.body.classList.add('no-ph'); }
    $$('figure.shot').forEach(function (f) {
      var img = $('img', f);
      if (!img) { return; }
      function miss() { f.classList.add('missing'); }
      if (img.complete && img.naturalWidth === 0) { miss(); }
      img.addEventListener('error', miss);
      img.addEventListener('load', function () { f.classList.remove('missing'); });
    });
  }

  /* ---- Go ---- */
  buildSidebar();
  buildHero();
  buildToc();
  buildCallouts();
  buildPageEnd();
  buildPageLists();
  buildRoleTabs();
  fillShared();
  buildFooter();
  buildCopyButtons();
  buildFaq();
  buildChecks();
  buildFilters();
  buildShots();
})();
