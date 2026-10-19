/* Site navigation, shared by every page: Home, then KS3 / KS4 / KS5 menus with their subjects.
   - Menu pages: a sticky dark bar across the top.
   - Tool pages on a phone or small tablet (up to 900px wide): the same bar, with the tool's own bar under it.
   - Tool pages on a laptop or board: the menus go inside the tool's own sticky bar, so no screen height is lost.
     If the bar gets too full, they fold into one "Menu" button.
   The pages still work without this file: it only adds the menus. */
(function () {
  "use strict";
  if (document.querySelector(".sitenav")) return;

  var STAGES = [
    { id: "ks3", label: "KS3", note: "Years 7–9", subjects: ["biology", "chemistry", "physics"] },
    { id: "ks4", label: "KS4", note: "GCSE", subjects: ["biology", "chemistry", "physics"] },
    { id: "ks5", label: "KS5", note: "A-level", subjects: ["biology"] }
  ];
  var NAMES = { biology: "Biology", chemistry: "Chemistry", physics: "Physics" };
  var H = 44, WIDE = "(min-width: 901px)";
  var topbar = document.getElementById("topbar");
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var wideMq = window.matchMedia ? window.matchMedia(WIDE) : { matches: true };

  var css =
    /* the dark bar */
    ".sitenav{position:sticky;top:0;z-index:40;height:" + H + "px;display:flex;align-items:center;gap:4px;" +
    "padding:0 12px;background:#14243D;color:#fff;font:700 16px/1 var(--f-body,system-ui,sans-serif);letter-spacing:.01em}" +
    ".sn-darkpref .sitenav{background:#0B1526}" +
    ".sitenav a,.sitenav .sn-dd>button,.sitenav .sn-theme{font:inherit;color:inherit;background:none;border:0;cursor:pointer;" +
    "text-decoration:none;display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 10px;border-radius:8px;white-space:nowrap}" +
    ".sitenav>a:hover,.sitenav .sn-dd>button:hover,.sitenav .sn-dd>button[aria-expanded=true],.sitenav .sn-theme:hover{background:rgba(255,255,255,.14)}" +
    ".sitenav :focus-visible{outline:3px solid #D9A536;outline-offset:1px}" +
    ".sitenav .sn-sep{width:1px;height:22px;background:rgba(255,255,255,.3);margin:0 4px}" +
    ".sitenav .sn-sp{flex:1}" +
    ".sitenav .sn-theme{border:1px solid rgba(255,255,255,.35);border-radius:999px;font-size:15px}" +
    /* the menus inside a tool's bar: pills like the tool's own buttons */
    ".sn-inbar{display:flex;align-items:center;gap:5px;flex:none}" +
    ".sn-inbar>a,.sn-inbar .sn-dd>button{font:700 15px var(--f-body,system-ui,sans-serif);display:inline-flex;align-items:center;gap:5px;" +
    "min-height:44px;padding:6px 11px;border-radius:999px;border:1px solid var(--line,#D5DCE5);background:var(--surface,#fff);" +
    "color:var(--ink,#1E252E);cursor:pointer;text-decoration:none;white-space:nowrap}" +
    ".sn-inbar>a:hover,.sn-inbar .sn-dd>button:hover,.sn-inbar .sn-dd>button[aria-expanded=true]{border-color:var(--accent,#14243D)}" +
    ".sn-inbar .sn-bar{width:1px;align-self:stretch;margin:6px 3px;background:var(--line,#D5DCE5)}" +
    ".sn-inbar .sn-fold{display:none}" +
    ".sn-inbar.sn-folded .sn-dd.sn-ks{display:none}.sn-inbar.sn-folded .sn-fold{display:block}" +
    ".sn-inbar.sn-tight>.sn-home,.sn-inbar.sn-tight .sn-bar{display:none}" +
    /* last resort when even one button won't fit: the dark bar comes back above the tool's bar */
    ".sn-row .sitenav{display:flex!important}.sn-row .sn-inbar{display:none!important}.sn-row .topbar{top:" + H + "px}" +
    /* shared */
    ".sn-home svg{height:24px;width:auto;display:block}" +
    ".sn-darkpref .sn-inbar .sn-home path:first-child{fill:#D9A536}.sn-darkpref .sn-inbar .sn-home path+path{stroke:#14243D}" +
    ".sn-darkpref .sn-inbar .sn-home text{fill:#14243D}" +
    ".sn-dd{position:relative}" +
    ".sn-caret{font-size:11px;opacity:.75}" +
    ".sn-menu{position:absolute;top:calc(100% + 6px);left:0;z-index:50;min-width:200px;padding:6px;margin:0;list-style:none;" +
    "background:var(--surface,#FBFAF8);color:var(--ink,#1E252E);border:1px solid var(--line,#D5DCE5);border-radius:10px;" +
    "box-shadow:0 8px 24px rgba(20,36,61,.18);font:400 16px/1.3 var(--f-body,system-ui,sans-serif);text-align:left}" +
    ".sn-menu[hidden]{display:none}" +
    ".sn-menu a{display:flex;align-items:center;padding:9px 12px;border-radius:6px;color:var(--ink,#1E252E);text-decoration:none;white-space:nowrap}" +
    ".sn-menu a:hover{background:var(--bg,#E9EDF3)}" +
    ".sn-menu a[aria-current=page]{font-weight:700}" +
    ".sn-menu .sn-all{font-weight:700;color:var(--accent,#14243D)}" +
    ".sn-menu .sn-note{color:var(--muted,#5A6472);font-size:14px;font-weight:400;margin-left:auto;padding-left:12px}" +
    ".sn-menu .sn-sub{padding-left:24px}" +
    "@media (max-width:520px){.sitenav{padding:0 6px;gap:0}.sitenav a,.sitenav .sn-dd>button{padding:0 8px}" +
    ".sitenav .sn-hw,.sitenav .sn-tw{display:none}.sitenav .sn-sep{margin:0 2px}}" +
    "@media print{.sitenav,.sn-inbar{display:none}}";
  if (topbar) {
    css += "@media " + WIDE + "{.sitenav{display:none}.topbar .tb-name{display:none!important}}" +
      "@media (max-width:900px){.sn-inbar{display:none!important}.topbar{top:" + H + "px}}";
  }
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var dark = function () {
    var r = document.documentElement;
    if (r.dataset.theme) return r.dataset.theme === "dark";
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  };
  var syncDark = function () { document.documentElement.classList.toggle("sn-darkpref", dark()); };

  var shield = function (inbar) {
    var f1 = inbar ? "#14243D" : "#D9A536", f2 = inbar ? "#D9A536" : "#14243D", tx = inbar ? "#FFFFFF" : "#14243D";
    return '<svg viewBox="10 4 72 88" aria-hidden="true"><path d="M46 8 L78 18 v30 c0 22 -18 34 -32 40 -14 -6 -32 -18 -32 -40 V18 z" fill="' + f1 + '"/>' +
      '<path d="M46 15 L71 23 v25 c0 17 -14 27 -25 32 -11 -5 -25 -15 -25 -32 V23 z" fill="none" stroke="' + f2 + '" stroke-width="1.6"/>' +
      '<text x="46" y="57" font-family="Georgia,\'DejaVu Serif\',\'Times New Roman\',serif" font-size="34" font-weight="bold" fill="' + tx +
      '" text-anchor="middle">T</text></svg>';
  };
  var cur = function (f) { return here === f ? ' aria-current="page"' : ""; };
  var home = function (inbar) {
    return '<a class="sn-home" href="index.html" aria-label="Home" title="Home: choose a key stage"' + cur("index.html") + ">" +
      shield(inbar) + (inbar ? "" : '<span class="sn-hw">Home</span>') + "</a>";
  };
  var menuFor = function (s, pre) {
    var h = '<div class="sn-dd sn-ks"><button type="button" aria-expanded="false" aria-controls="' + pre + s.id + '">' + s.label +
      ' <span class="sn-caret" aria-hidden="true">▾</span></button><ul class="sn-menu" id="' + pre + s.id + '" hidden>' +
      '<li><a class="sn-all" href="' + s.id + '.html"' + cur(s.id + ".html") + ">All " + s.label + ' <span class="sn-note">' + s.note + "</span></a></li>";
    s.subjects.forEach(function (sub) {
      var f = s.id + "-" + sub + ".html";
      h += '<li><a href="' + f + '"' + cur(f) + ">" + NAMES[sub] + "</a></li>";
    });
    return h + "</ul></div>";
  };
  var foldMenu = function (pre) {
    var h = '<div class="sn-dd sn-fold"><button type="button" aria-expanded="false" aria-controls="' + pre + 'all">Menu' +
      ' <span class="sn-caret" aria-hidden="true">▾</span></button><ul class="sn-menu" id="' + pre + 'all" hidden>' +
      '<li><a class="sn-all" href="index.html"' + cur("index.html") + ">Home</a></li>";
    STAGES.forEach(function (s) {
      h += '<li><a class="sn-all" href="' + s.id + '.html"' + cur(s.id + ".html") + ">" + s.label + ' <span class="sn-note">' + s.note + "</span></a></li>";
      s.subjects.forEach(function (sub) {
        var f = s.id + "-" + sub + ".html";
        h += '<li><a class="sn-sub" href="' + f + '"' + cur(f) + ">" + NAMES[sub] + "</a></li>";
      });
    });
    return h + "</ul></div>";
  };

  /* the dark bar */
  var nav = document.createElement("nav");
  nav.className = "sitenav";
  nav.setAttribute("aria-label", "Site");
  var h = home(false) + '<span class="sn-sep" aria-hidden="true"></span>';
  STAGES.forEach(function (s) { h += menuFor(s, "sn-"); });
  h += '<span class="sn-sp"></span>';
  if (!document.getElementById("themeBtn")) h += '<button type="button" class="sn-theme" id="snTheme"></button>';
  nav.innerHTML = h;
  document.body.insertBefore(nav, document.body.firstChild);

  /* the menus inside a tool's own bar */
  var inbar = null;
  if (topbar) {
    inbar = document.createElement("nav");
    inbar.className = "sn-inbar";
    inbar.setAttribute("aria-label", "Site");
    h = home(true);
    STAGES.forEach(function (s) { h += menuFor(s, "sb-"); });
    h += foldMenu("sb-") + '<span class="sn-bar" aria-hidden="true"></span>';
    inbar.innerHTML = h;
    topbar.insertBefore(inbar, topbar.firstChild);
  }

  /* open / close */
  var allButtons = function () { return document.querySelectorAll(".sn-dd > button"); };
  var closeAll = function (except) {
    var bs = allButtons();
    for (var i = 0; i < bs.length; i++) if (bs[i] !== except) {
      bs[i].setAttribute("aria-expanded", "false");
      bs[i].nextElementSibling.hidden = true;
    }
  };
  var bs = allButtons();
  for (var i = 0; i < bs.length; i++) bs[i].addEventListener("click", function (e) {
    var b = e.currentTarget, open = b.getAttribute("aria-expanded") !== "true";
    closeAll(b);
    b.setAttribute("aria-expanded", String(open));
    b.nextElementSibling.hidden = !open;
    if (open && e.detail === 0) { var first = b.nextElementSibling.querySelector("a"); if (first) first.focus(); }
  });
  var inMenus = function (el) { return !!el && (nav.contains(el) || (inbar && inbar.contains(el))); };
  document.addEventListener("click", function (e) { if (!inMenus(e.target)) closeAll(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = document.querySelector(".sn-dd > button[aria-expanded=true]");
    if (open) { closeAll(); open.focus(); }
  });
  [nav, inbar].forEach(function (n) {
    if (n) n.addEventListener("focusout", function (e) { if (e.relatedTarget && !inMenus(e.relatedTarget)) closeAll(); });
  });

  /* fold the KS menus into one "Menu" button if the tool's bar would wrap onto a second line */
  var wraps = function () {
    var kids = topbar.children, top0 = null;
    for (var j = 0; j < kids.length; j++) {
      var r = kids[j].getBoundingClientRect();
      if (!r.width) continue;
      if (top0 === null) top0 = r.top; else if (r.top > top0 + 8) return true;
    }
    return false;
  };
  var root = document.documentElement;
  var fit = function () {
    if (!inbar) return;
    root.classList.remove("sn-row");
    inbar.classList.remove("sn-folded", "sn-tight");
    if (!wideMq.matches || !wraps()) return;
    inbar.classList.add("sn-folded");
    if (!wraps()) return;
    inbar.classList.add("sn-tight");
    if (!wraps()) return;
    root.classList.add("sn-row");
  };
  if (inbar) {
    var t = 0;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(fit, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    fit();
  }

  /* light / dark */
  var tb = document.getElementById("snTheme"), paint = syncDark;
  if (tb) {
    paint = function () {
      var d = dark();
      tb.innerHTML = (d ? "☀" : "☾") + '<span class="sn-tw">' + (d ? " Light mode" : " Dark mode") + "</span>";
      tb.setAttribute("aria-pressed", String(d));
      tb.title = d ? "Switch to light mode" : "Switch to dark mode";
      syncDark();
    };
    tb.addEventListener("click", function () {
      var next = dark() ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("ks3tools-theme", next); } catch (e) {}
      paint();
    });
  } else {
    var tbtn = document.getElementById("themeBtn");
    if (tbtn) tbtn.addEventListener("click", function () { setTimeout(syncDark, 0); });
  }
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", paint);
  }
  paint();
})();
