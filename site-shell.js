/* =========================================================
   SNK AI Academy — Site Shell
   সব পেজে একবারই লোড হয়:
   1) Service Worker (অফলাইন সাপোর্ট)
   2) 📲 Install App বাটন (উপরের navbar-এ)
   3) Admin-এর সেট করা লোগো / নাম সব পেজে
   4) পরীক্ষা • অ্যাসাইনমেন্ট • কুইজের কাউন্টডাউন ও নোটিশ
   ডাটা আসে Firestore: siteSettings/main ও siteSettings/schedule
========================================================= */
(function () {
  "use strict";

  var FS_URL = "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
  var LS_SETTINGS = "snkSiteCache";
  var LS_SCHEDULE = "snkScheduleCache";
  var PAGE = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var IS_ADMIN = /^admin|^attendance-|^students\.html|^login/.test(PAGE) && PAGE !== "attendance-notifications.html";

  var TYPES = {
    exam:       { icon: "📝", name: "পরীক্ষা",        color: "#ff5c5c", wait: "পরীক্ষা শুরু হতে বাকি", live: "পরীক্ষা চলছে — শেষ হতে বাকি", link: "quiz.html",        btn: "পরীক্ষা দাও" },
    quiz:       { icon: "🧠", name: "কুইজ",           color: "#4da3ff", wait: "কুইজ শুরু হতে বাকি",    live: "কুইজ চলছে — শেষ হতে বাকি",    link: "quiz.html",        btn: "কুইজ দাও" },
    assignment: { icon: "📚", name: "অ্যাসাইনমেন্ট", color: "#ffb020", wait: "শুরু হতে বাকি",         live: "জমা দিতে বাকি",               link: "assignments.html", btn: "জমা দাও" }
  };

  /* ---------- helpers ---------- */
  function readJSON(k, f) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function bn(n) { return String(n).replace(/\d/g, function (d) { return "০১২৩৪৫৬৭৮৯"[d]; }); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fmtDate(ms) {
    try { return new Date(ms).toLocaleString("bn-BD", { weekday: "short", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true }); }
    catch (e) { return new Date(ms).toString(); }
  }

  var settings = readJSON(LS_SETTINGS, {}) || {};
  var schedule = readJSON(LS_SCHEDULE, { items: [], notices: [] }) || { items: [], notices: [] };

  /* ---------- public API ---------- */
  var SNK = window.SNK = {
    get settings() { return settings; },
    get schedule() { return schedule; },
    types: TYPES,
    bn: bn,
    esc: esc,
    renderSchedule: function (el, opts) { renderScheduleInto(el, opts || {}); }
  };

  /* ---------- CSS ---------- */
  function injectCSS() {
    if (document.getElementById("snkShellCSS")) return;
    var css = [
      ".snk-install-btn{display:inline-flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0;border:0;border-radius:999px;padding:9px 15px;background:#b7ff00;color:#050505;font:800 13px/1 Arial,'Noto Sans Bengali',sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(183,255,0,.3);white-space:nowrap}",
      ".snk-install-btn:active{transform:scale(.96)}",
      ".snk-install-fixed{position:fixed;top:10px;right:10px;z-index:99998}",
      "@media(max-width:480px){.snk-install-btn{padding:8px 11px;font-size:12px}.snk-install-btn:not(.snk-install-fixed) .snk-lbl-long{display:none}}",
      ".snk-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:0}",
      "@media(min-width:600px){.snk-modal-bg{align-items:center;padding:20px}}",
      ".snk-modal{width:100%;max-width:440px;background:#141414;color:#fff;border:1px solid rgba(183,255,0,.25);border-radius:24px 24px 0 0;padding:24px 22px 28px;font-family:Arial,'Noto Sans Bengali',sans-serif;max-height:90vh;overflow:auto}",
      "@media(min-width:600px){.snk-modal{border-radius:24px}}",
      ".snk-modal h3{font-size:21px;margin-bottom:6px}",
      ".snk-modal p{color:#bbb;line-height:1.7;font-size:15px}",
      ".snk-modal ol{margin:14px 0 4px 20px;line-height:2;font-size:16px;color:#eee}",
      ".snk-modal .snk-x{margin-top:18px;width:100%;border:0;border-radius:14px;padding:15px;background:#b7ff00;color:#050505;font:800 17px Arial,'Noto Sans Bengali',sans-serif;cursor:pointer}",
      ".snk-modal .snk-apk{display:block;text-align:center;margin-top:14px;border-radius:14px;padding:14px;background:#1e1e1e;border:1px solid rgba(183,255,0,.4);color:#b7ff00;font-weight:800;text-decoration:none}",

      ".snk-box{max-width:1100px;margin:14px auto;padding:0 14px;font-family:Arial,'Noto Sans Bengali',sans-serif}",
      ".snk-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;padding:13px 15px;border-radius:16px;font-size:16px;line-height:1.55;font-weight:700;background:rgba(183,255,0,.12);border:1px solid rgba(183,255,0,.35);color:#e9ffb0}",
      ".snk-notice.urgent{background:rgba(255,92,92,.14);border-color:rgba(255,92,92,.5);color:#ffb3b3}",
      ".snk-notice a{color:inherit;text-decoration:underline}",
      ".snk-notice .snk-nx{margin-left:auto;background:none;border:0;color:inherit;font-size:20px;cursor:pointer;line-height:1}",
      ".snk-h{font-size:20px;font-weight:900;margin:6px 0 12px;color:#fff;display:flex;align-items:center;gap:8px}",
      ".snk-card{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-bottom:14px;padding:16px;border-radius:22px;background:#141414;border:2px solid var(--c);box-shadow:0 10px 30px rgba(0,0,0,.35);color:#fff}",
      ".snk-card.snk-over{opacity:.55;border-style:dashed}",
      ".snk-ic{width:58px;height:58px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:32px;background:color-mix(in srgb,var(--c) 22%,transparent);flex-shrink:0}",
      ".snk-info{flex:1;min-width:180px}",
      ".snk-type{font-size:13px;font-weight:800;color:var(--c);letter-spacing:.02em}",
      ".snk-title{font-size:19px;font-weight:900;margin:2px 0 4px;line-height:1.35}",
      ".snk-when{font-size:13px;color:#aaa;line-height:1.5}",
      ".snk-note{font-size:14px;color:#ddd;margin-top:6px;line-height:1.55}",
      ".snk-timer{width:100%;text-align:center;background:#0a0a0a;border-radius:16px;padding:12px 8px}",
      ".snk-tl{font-size:14px;font-weight:800;color:#ccc;margin-bottom:8px}",
      ".snk-dg{display:flex;justify-content:center;gap:8px}",
      ".snk-dg div{min-width:62px;padding:8px 4px;border-radius:12px;background:#1a1a1a}",
      ".snk-dg b{display:block;font-size:28px;line-height:1.1;color:var(--c);font-variant-numeric:tabular-nums}",
      ".snk-dg span{font-size:12px;color:#aaa}",
      ".snk-timer.snk-soon{animation:snkPulse 1.4s infinite}",
      "@keyframes snkPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,92,92,.0)}50%{box-shadow:0 0 0 6px rgba(255,92,92,.25)}}",
      ".snk-state{font-size:18px;font-weight:900}",
      ".snk-go{display:block;width:100%;text-align:center;padding:15px;border-radius:14px;background:var(--c);color:#050505;font-weight:900;font-size:17px;text-decoration:none}",
      ".snk-empty{text-align:center;padding:34px 14px;border:2px dashed rgba(255,255,255,.18);border-radius:22px;color:#aaa;font-size:17px;line-height:1.7}",
      "@media(min-width:700px){.snk-timer{width:auto;min-width:330px}.snk-go{width:auto;min-width:150px}}",
      "body.light .snk-card,body.light .snk-modal{background:#fff;color:#182235}",
      "body.light .snk-title,body.light .snk-h{color:#182235}",
      "body.light .snk-timer{background:#f1f5fa}body.light .snk-dg div{background:#fff}",
      "body.light .snk-note,body.light .snk-when,body.light .snk-tl,body.light .snk-modal p,body.light .snk-modal ol{color:#445}"
    ].join("\n");
    var s = document.createElement("style");
    s.id = "snkShellCSS";
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ---------- head tags ---------- */
  function ensureHead() {
    function add(tag, attrs) {
      var sel = tag + Object.keys(attrs).filter(function (k) { return k === "rel" || k === "name"; }).map(function (k) { return "[" + k + '="' + attrs[k] + '"]'; }).join("");
      if (document.head.querySelector(sel)) return;
      var el = document.createElement(tag);
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
      document.head.appendChild(el);
    }
    add("link", { rel: "manifest", href: "manifest.json" });
    add("link", { rel: "apple-touch-icon", href: "icons/apple-touch-icon.png" });
    add("meta", { name: "theme-color", content: settings.themeColor || "#050505" });
    add("meta", { name: "mobile-web-app-capable", content: "yes" });
    add("meta", { name: "apple-mobile-web-app-capable", content: "yes" });
    add("meta", { name: "apple-mobile-web-app-title", content: settings.appShortName || "SNK Academy" });
  }

  /* ---------- service worker ---------- */
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "https:" && location.hostname !== "localhost") return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  /* ---------- Admin-controlled manifest (নাম / রং / লোগো) ---------- */
  function applyDynamicManifest() {
    var custom = settings.appName || settings.appShortName || settings.themeColor || (settings.logoUrl && /^data:image/.test(settings.logoUrl));
    if (!custom) return;
    try {
      var origin = location.origin + "/";
      var icons = [
        { src: origin + "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: origin + "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: origin + "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
      ];
      if (settings.logoUrl && /^data:image\/png/.test(settings.logoUrl)) {
        icons = [
          { src: settings.logoUrl, sizes: "512x512", type: "image/png", purpose: "any" },
          { src: origin + "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }
        ];
      }
      var m = {
        name: settings.appName || settings.instituteName || "SNK AI Academy",
        short_name: settings.appShortName || "SNK Academy",
        id: origin + "student-dashboard.html",
        start_url: origin + "student-dashboard.html?source=pwa",
        scope: origin,
        display: "standalone",
        orientation: "portrait",
        lang: "bn",
        background_color: "#050505",
        theme_color: settings.themeColor || "#050505",
        icons: icons
      };
      var url = URL.createObjectURL(new Blob([JSON.stringify(m)], { type: "application/manifest+json" }));
      var link = document.querySelector('link[rel="manifest"]');
      if (link) link.setAttribute("href", url);
      var tc = document.querySelector('meta[name="theme-color"]');
      if (tc && settings.themeColor) tc.setAttribute("content", settings.themeColor);
    } catch (e) {}
  }

  /* ---------- Logo / name ---------- */
  function applyBranding() {
    var logo = settings.logoUrl;
    var name = settings.instituteName;

    if (logo) {
      var sel = ".logo-badge,.brand-logo,.logo-box,.logo-icon,.logo";
      var nodes = document.querySelectorAll(sel);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.tagName === "A" || (n.id && n.id.indexOf("dyn") === 0)) continue;
        if (n.querySelector(sel)) continue;
        if (n.getAttribute("data-snk-logo")) continue;
        n.setAttribute("data-snk-logo", "1");
        n.innerHTML = '<img src="' + esc(logo) + '" alt="logo" style="width:100%;height:100%;object-fit:contain;border-radius:inherit;display:block">';
        n.style.background = "transparent";
        n.style.padding = "2px";
      }
      var fav = document.querySelector('link[rel="icon"]');
      if (fav && /^data:image|^https?:/.test(logo)) { fav.setAttribute("href", logo); fav.removeAttribute("type"); }
    }

    if (name && name !== "SNK AI Academy") {
      var els = document.querySelectorAll(".logo-text,.brand-title,.brand-text strong,.brand-text,.footer-brand,.sidebar-head .brand-title");
      for (var j = 0; j < els.length; j++) {
        var e = els[j];
        if (e.id && e.id.indexOf("dyn") === 0) continue;
        for (var c = 0; c < e.childNodes.length; c++) {
          var t = e.childNodes[c];
          if (t.nodeType === 3 && t.nodeValue.indexOf("SNK AI Academy") > -1) t.nodeValue = t.nodeValue.replace("SNK AI Academy", name);
        }
      }
      if (document.title.indexOf("SNK AI Academy") > -1) document.title = document.title.replace("SNK AI Academy", name);
    }
  }

  /* ---------- Install App ---------- */
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredPrompt = e; });
  window.addEventListener("appinstalled", function () { var b = document.getElementById("snkInstallBtn"); if (b) b.remove(); });

  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }

  function showInstallHelp() {
    var bg = document.createElement("div");
    bg.className = "snk-modal-bg";
    var steps, title = "📲 মোবাইলে অ্যাপ ইনস্টল করো";
    if (isIOS()) {
      steps = "<ol><li>নিচের <b>Share (⬆️)</b> বাটনে চাপো</li><li><b>“Add to Home Screen”</b> চাপো</li><li>উপরে ডানে <b>Add</b> চাপো</li></ol><p style='margin-top:10px'>⚠️ iPhone-এ অবশ্যই <b>Safari</b> ব্রাউজারে খুলতে হবে।</p>";
    } else {
      steps = "<ol><li>ব্রাউজারের উপরে ডানে <b>⋮ (তিন ডট)</b> চাপো</li><li><b>“Install app”</b> বা <b>“Add to Home screen”</b> চাপো</li><li><b>Install</b> চাপো — হয়ে গেল! ✅</li></ol><p style='margin-top:10px'>অ্যাপ হোম স্ক্রিনে চলে আসবে।</p>";
    }
    var apk = settings.apkUrl ? '<a class="snk-apk" href="' + esc(settings.apkUrl) + '">📥 APK ফাইল ডাউনলোড (Android)</a>' : "";
    bg.innerHTML = '<div class="snk-modal"><h3>' + title + "</h3><p>একবার ইনস্টল করলে পরীক্ষা, কুইজ আর নোটিশ এক ট্যাপেই খুলবে।</p>" + steps + apk + '<button class="snk-x" type="button">ঠিক আছে</button></div>';
    bg.addEventListener("click", function (e) { if (e.target === bg || (e.target.className || "").indexOf("snk-x") > -1) bg.remove(); });
    document.body.appendChild(bg);
  }

  function onInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; }).catch(function () {});
    } else {
      showInstallHelp();
    }
  }

  function findHeaderTarget() {
    var header = document.querySelector("header") || document.querySelector(".navbar") || document.querySelector(".topbar");
    if (!header) return null;
    var pref = header.querySelector(".nav-actions,.top-actions,.header-actions,.nav-right");
    if (pref) return pref;
    var cands = [header].concat([].slice.call(header.querySelectorAll("nav,.nav,.nav-inner,.container,.navbar,.topbar,.header-inner")));
    for (var i = cands.length - 1; i >= 0; i--) {
      var d = getComputedStyle(cands[i]).display;
      if (d === "flex" || d === "inline-flex") return cands[i];
    }
    return header;
  }

  function addInstallButton() {
    if (settings.installButtonActive === false) return;
    if (isStandalone()) return;
    if (document.getElementById("snkInstallBtn")) return;
    var b = document.createElement("button");
    b.id = "snkInstallBtn";
    b.type = "button";
    b.className = "snk-install-btn";
    b.innerHTML = '📲 <span class="snk-lbl-long">অ্যাপ ইনস্টল</span><span class="snk-lbl-short" style="display:none"></span>';
    b.addEventListener("click", onInstallClick);
    var target = findHeaderTarget();
    if (target) { target.appendChild(b); }
    else { b.classList.add("snk-install-fixed"); document.body.appendChild(b); return; }
    /* জায়গা না হলে (ছোট স্ক্রিনে navbar ভরা) ভাসমান বাটন হিসেবে দেখাও */
    setTimeout(function () {
      var r = b.getBoundingClientRect();
      if (r.right > window.innerWidth - 2 || r.left < 0 || r.width === 0) {
        b.classList.add("snk-install-fixed");
        document.body.appendChild(b);
      }
    }, 400);
  }

  /* ---------- Schedule / countdown ---------- */
  function statusOf(it, now) {
    var s = it.startAt ? Date.parse(it.startAt) : NaN;
    var e = it.endAt ? Date.parse(it.endAt) : NaN;
    var T = TYPES[it.type] || TYPES.exam;
    if (!isNaN(s) && now < s) return { k: "wait", t: s, label: T.wait };
    if (!isNaN(e) && now < e) return { k: "live", t: e, label: T.live };
    if (isNaN(e) && !isNaN(s)) return { k: "over" };
    if (isNaN(s) && isNaN(e)) return { k: "none" };
    return { k: "over" };
  }

  function timerHTML(it) {
    var st = statusOf(it, Date.now());
    if (st.k === "over") return { cls: "", html: '<div class="snk-state">✅ সময় শেষ</div>' };
    if (st.k === "none") return { cls: "", html: "" };
    var diff = Math.max(0, st.t - Date.now());
    var d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24, m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
    var soon = diff < 86400000;
    return {
      cls: soon ? "snk-soon" : "",
      html: '<div class="snk-tl">' + (st.k === "live" ? "🟢 " : "⏳ ") + esc(st.label) + (soon ? " 🔥" : "") + "</div>" +
        '<div class="snk-dg"><div><b>' + bn(d) + "</b><span>দিন</span></div><div><b>" + bn(pad(h)) + "</b><span>ঘণ্টা</span></div><div><b>" + bn(pad(m)) + "</b><span>মিনিট</span></div><div><b>" + bn(pad(s)) + "</b><span>সেকেন্ড</span></div></div>"
    };
  }

  function activeItems(types) {
    var now = Date.now();
    return (schedule.items || []).filter(function (it) {
      if (it.active === false) return false;
      if (types && types.indexOf(it.type) < 0) return false;
      return true;
    }).sort(function (a, b) {
      var sa = statusOf(a, now), sb = statusOf(b, now);
      var ra = sa.k === "over" ? 1 : 0, rb = sb.k === "over" ? 1 : 0;
      if (ra !== rb) return ra - rb;
      var ta = sa.t || Date.parse(a.endAt || a.startAt) || 0, tb = sb.t || Date.parse(b.endAt || b.startAt) || 0;
      return ra ? tb - ta : ta - tb;
    });
  }

  function cardHTML(it) {
    var T = TYPES[it.type] || TYPES.exam;
    var st = statusOf(it, Date.now());
    var s = it.startAt ? Date.parse(it.startAt) : NaN, e = it.endAt ? Date.parse(it.endAt) : NaN;
    var when = "";
    if (!isNaN(s)) when += "শুরু: " + fmtDate(s);
    if (!isNaN(e)) when += (when ? "<br>" : "") + (it.type === "assignment" ? "জমার শেষ সময়: " : "শেষ: ") + fmtDate(e);
    var tm = timerHTML(it);
    var link = it.link || T.link;
    var go = (st.k === "live") ? '<a class="snk-go" href="' + esc(link) + '">👉 ' + esc(T.btn) + "</a>" : "";
    return '<div class="snk-card' + (st.k === "over" ? " snk-over" : "") + '" style="--c:' + T.color + '" data-sid="' + esc(it.id) + '">' +
      '<div class="snk-ic">' + T.icon + "</div>" +
      '<div class="snk-info"><div class="snk-type">' + esc(T.name) + (it.course ? " • " + esc(it.course) : "") + "</div>" +
      '<div class="snk-title">' + esc(it.title) + "</div>" +
      '<div class="snk-when">' + when + "</div>" +
      (it.note ? '<div class="snk-note">📌 ' + esc(it.note) + "</div>" : "") + "</div>" +
      (tm.html ? '<div class="snk-timer ' + tm.cls + '">' + tm.html + "</div>" : "") + go + "</div>";
  }

  function noticesHTML() {
    var now = Date.now();
    var hidden = readSession("snkNoticeHidden", []);
    var list = (schedule.notices || []).filter(function (n) {
      if (n.active === false) return false;
      if (n.expiresAt && Date.parse(n.expiresAt) < now) return false;
      return hidden.indexOf(n.id) < 0;
    });
    return list.map(function (n) {
      var txt = esc(n.text);
      if (n.link) txt = '<a href="' + esc(n.link) + '">' + txt + "</a>";
      return '<div class="snk-notice ' + (n.level === "urgent" ? "urgent" : "") + '" data-nid="' + esc(n.id) + '"><span>' + (n.level === "urgent" ? "🚨" : "📢") + "</span><span>" + txt + '</span><button class="snk-nx" type="button" aria-label="বন্ধ">×</button></div>';
    }).join("");
  }
  function readSession(k, f) { try { var v = sessionStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } }

  function renderScheduleInto(el, opts) {
    if (!el) return;
    var items = activeItems(opts.types);
    if (opts.max) items = items.filter(function (i) { return statusOf(i, Date.now()).k !== "over"; }).slice(0, opts.max);
    var html = "";
    if (opts.notices !== false) html += noticesHTML();
    if (opts.title && items.length) html += '<div class="snk-h">' + opts.title + "</div>";
    if (items.length) html += items.map(cardHTML).join("");
    else if (opts.empty) html += '<div class="snk-empty">' + opts.empty + "</div>";
    el.innerHTML = html;
    el.setAttribute("data-snk-opts", "1");
    el._snkOpts = opts;
  }

  function tick() {
    var boxes = document.querySelectorAll("[data-snk-opts]");
    for (var i = 0; i < boxes.length; i++) {
      var cards = boxes[i].querySelectorAll(".snk-card");
      for (var j = 0; j < cards.length; j++) {
        var id = cards[j].getAttribute("data-sid");
        var it = (schedule.items || []).filter(function (x) { return x.id === id; })[0];
        if (!it) continue;
        var tm = timerHTML(it), box = cards[j].querySelector(".snk-timer");
        if (box) { box.innerHTML = tm.html; box.className = "snk-timer " + tm.cls; }
        var wasLive = !!cards[j].querySelector(".snk-go"), isLive = statusOf(it, Date.now()).k === "live";
        if (wasLive !== isLive) renderScheduleInto(boxes[i], boxes[i]._snkOpts);
      }
    }
  }

  document.addEventListener("click", function (e) {
    var x = e.target.closest && e.target.closest(".snk-nx");
    if (!x) return;
    var n = x.closest(".snk-notice"), id = n && n.getAttribute("data-nid");
    var hidden = readSession("snkNoticeHidden", []);
    hidden.push(id);
    try { sessionStorage.setItem("snkNoticeHidden", JSON.stringify(hidden)); } catch (er) {}
    if (n) n.remove();
  });

  /* কোন পেজে কী দেখাবে */
  var PAGE_RULES = {
    "index.html":              { types: null, max: 2, title: "⏰ সামনে কী আছে" },
    "student-dashboard.html": { types: null, max: 3, title: "⏰ সামনে কী আছে", empty: "এখন কোনো পরীক্ষা বা কুইজ নেই 🎉", all: true },
    "assignments.html":        { types: ["assignment"], title: "⏰ জমা দেওয়ার সময়" },
    "quiz.html":               { types: ["quiz", "exam"], title: "⏰ কুইজ ও পরীক্ষার সময়" },
    "results.html":            { types: null, max: 2, title: "⏰ সামনে কী আছে" },
    "courses.html":            { types: null, max: 3, title: "⏰ সামনে কী আছে" },
    "student-notifications.html": { types: null, max: 5, title: "⏰ সামনে কী আছে" }
  };

  function mountPageBox() {
    if (IS_ADMIN || PAGE === "student-schedule.html") return;
    var rule = PAGE_RULES[PAGE];
    var existing = document.getElementById("snkScheduleBox");
    if (!rule && !existing) {
      // অন্য student পেজে শুধু নোটিশ স্ট্রিপ
      if (PAGE === "index.html" || PAGE === "student-schedule.html" || !/^student-|^courses|^snk-/.test(PAGE)) return;
      rule = { types: [], notices: true, onlyNotices: true };
    }
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "snkScheduleBox";
      existing.className = "snk-box";
      var anchor = document.querySelector("header") || document.querySelector(".topbar") || document.querySelector(".navbar");
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(existing, anchor.nextSibling);
      else document.body.insertBefore(existing, document.body.firstChild);
    }
    var opts = existing._snkOpts || rule || {};
    if (opts.onlyNotices) { existing.innerHTML = noticesHTML(); return; }
    renderScheduleInto(existing, opts);
  }

  function remount() {
    var box = document.getElementById("snkScheduleBox");
    if (box && box._snkOpts) renderScheduleInto(box, box._snkOpts);
    else mountPageBox();
    var full = document.getElementById("snkSchedulePage");
    if (full) renderScheduleInto(full, { title: "", empty: "😊 এখন কোনো পরীক্ষা, কুইজ বা অ্যাসাইনমেন্ট নেই।<br>নতুন কিছু এলে এখানে দেখতে পাবে।" });
    document.dispatchEvent(new CustomEvent("snk:ready", { detail: { settings: settings, schedule: schedule } }));
  }

  /* ---------- Firestore sync ---------- */
  function sync() {
    import("./firebase-config.js").then(function (cfg) {
      return import(FS_URL).then(function (fs) {
        var db = cfg.db;
        return Promise.all([
          fs.getDoc(fs.doc(db, "siteSettings", "main")).catch(function () { return null; }),
          fs.getDoc(fs.doc(db, "siteSettings", "schedule")).catch(function () { return null; })
        ]);
      });
    }).then(function (res) {
      var changed = false;
      if (res[0] && res[0].exists()) { settings = res[0].data() || {}; writeJSON(LS_SETTINGS, settings); changed = true; }
      if (res[1] && res[1].exists()) {
        var d = res[1].data() || {};
        schedule = { items: d.items || [], notices: d.notices || [] };
        writeJSON(LS_SCHEDULE, schedule);
        changed = true;
      }
      if (changed) { applyBranding(); applyDynamicManifest(); remount(); }
    }).catch(function () { /* অফলাইনে cache ব্যবহার হবে */ });
  }

  /* ---------- boot ---------- */
  function boot() {
    injectCSS();
    ensureHead();
    applyBranding();
    applyDynamicManifest();
    addInstallButton();
    mountPageBox();
    var full = document.getElementById("snkSchedulePage");
    if (full) renderScheduleInto(full, { empty: "😊 এখন কোনো পরীক্ষা, কুইজ বা অ্যাসাইনমেন্ট নেই।<br>নতুন কিছু এলে এখানে দেখতে পাবে।" });
    setInterval(tick, 1000);
    sync();
  }

  registerSW();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
