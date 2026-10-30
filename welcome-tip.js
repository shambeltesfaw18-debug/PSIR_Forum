(function () {
  "use strict";
  // 1) "Welcome back, name." for logged-in members: shown for 2 seconds, once per browsing session.
  // 2) On the Categories page and each category page: a tip to use the desktop site, shown for 15 seconds,
  //    once per page per session, for phone users who are in mobile view.
  const WELCOME_MS = 2000;
  const TIP_MS = 15000;
  const COOKIE = "psirTips";

  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }

  function readFlags() {
    try {
      const m = document.cookie.match(/(?:^|;\s*)psirTips=([^;]*)/);
      return m ? JSON.parse(decodeURIComponent(m[1])) : {};
    } catch (e) { return {}; }
  }
  function writeFlags(flags) {
    try { document.cookie = COOKIE + "=" + encodeURIComponent(JSON.stringify(flags)) + "; path=/; SameSite=Lax"; } catch (e) {}
  }

  function inMobileView() {
    if (/Mobile|iPhone|iPod/i.test(navigator.userAgent)) return true;
    return window.innerWidth < 600 && navigator.maxTouchPoints > 0;
  }

  function savedUser() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!/^sb-.*-auth-token$/.test(key)) continue;
        const session = JSON.parse(localStorage.getItem(key) || "null");
        const user = session && (session.user || (session.currentSession && session.currentSession.user));
        if (user && user.id) return user;
      }
    } catch (e) {}
    return null;
  }

  const style = document.createElement("style");
  style.textContent = "@keyframes psirWIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}" +
    "@keyframes psirTIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion: reduce){.psir-tip{animation:none!important}}";
  document.head.appendChild(style);

  function toast(id, html, position, ms, anim) {
    const old = document.getElementById(id);
    if (old) old.remove();
    const box = document.createElement("div");
    box.id = id;
    box.className = "psir-tip";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    const edge = position === "top" ? "top:12px;" : "bottom:12px;";
    box.style.cssText = "position:fixed;left:12px;right:12px;" + edge + "z-index:9000;background:#102b46;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 12px 32px rgba(0,0,0,.28);font-size:14px;line-height:1.5;display:flex;gap:12px;align-items:flex-start;animation:" + anim + " .25s ease-out;";

    const text = document.createElement("div");
    text.style.flex = "1";
    text.innerHTML = html;

    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";
    close.style.cssText = "border:none;background:transparent;color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:0 2px;";

    box.append(text, close);
    document.body.appendChild(box);
    const timer = setTimeout(() => box.remove(), ms);
    close.addEventListener("click", () => { clearTimeout(timer); box.remove(); });
  }

  function welcome() {
    const user = savedUser();
    if (!user) return;
    const flags = readFlags();
    if (flags.welcome) return;
    flags.welcome = true;
    writeFlags(flags);
    const name = (user.user_metadata && user.user_metadata.full_name) || (user.email || "").split("@")[0] || "member";
    toast("psirWelcome", '<strong style="font-size:15px;color:#e7b451;">Welcome back, ' + esc(name) + ".</strong>", "top", WELCOME_MS, "psirWIn");
  }

  function tipFor(path) {
    if (!/^\/categories(\/[^\/]+)?$/.test(path)) return;
    if (!inMobileView()) return;
    const flags = readFlags();
    const seen = Array.isArray(flags.pages) ? flags.pages : [];
    if (seen.indexOf(path) !== -1) return;
    flags.pages = seen.concat([path]).slice(-60);
    writeFlags(flags);
    toast("psirDesktopTip",
      '<strong style="color:#e7b451;">Tip: use the desktop site for a wider view.</strong><br>' +
      "In Chrome, tap ⋮ (top right), then tick <em>Desktop site</em>. Discussions and the live room are easier to read on a larger screen.",
      "bottom", TIP_MS, "psirTIn");
  }

  let lastPath = null;
  function check() {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (path === lastPath) return;
    lastPath = path;
    tipFor(path);
  }

  // Skip link: keyboard users can jump straight to the page content
  function skipLink() {
    const target = document.querySelector("main") || document.querySelector("#content") || document.querySelector(".wrap") || document.body;
    if (!target.id) target.id = "main-content";
    const a = document.createElement("a");
    a.href = "#" + target.id;
    a.textContent = "Skip to content";
    a.style.cssText = "position:absolute;left:8px;top:-60px;z-index:10000;background:#2855A6;color:#FFFFFF;padding:10px 14px;border-radius:6px;font-weight:700;text-decoration:none;transition:top .1s;";
    a.addEventListener("focus", () => { a.style.top = "8px"; });
    a.addEventListener("blur", () => { a.style.top = "-60px"; });
    document.body.insertBefore(a, document.body.firstChild);
  }

  // Hamburger menu for the header on phones and desktop-site mode (pages without their own menu)
  function mobileMenu() {
    const nav = document.querySelector("header nav, .top nav");
    if (!nav || nav.id === "navLinks" || document.querySelector(".mobile-menu")) return;
    nav.classList.add("psir-nav");
    if (!nav.id) nav.id = "psir-nav";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "psir-menu-btn";
    btn.setAttribute("aria-controls", nav.id);
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open menu");
    btn.innerHTML = '<span aria-hidden="true">&#9776;</span>';
    nav.parentNode.insertBefore(btn, nav);

    const setOpen = open => {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      btn.innerHTML = open ? '<span aria-hidden="true">&#10005;</span>' : '<span aria-hidden="true">&#9776;</span>';
    };
    btn.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", e => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) setOpen(false); });
  }

  // Same "PS" mark as the home page on the other pages (the home page already has its own)
  function brandMark() {
    if (document.getElementById("navActions")) return;
    document.querySelectorAll("header .brand").forEach(b => {
      if (b.querySelector(".psir-mark")) return;
      const m = document.createElement("span");
      m.className = "psir-mark";
      m.setAttribute("aria-hidden", "true");
      m.textContent = "PS";
      b.insertBefore(m, b.firstChild);
    });
  }

  function run() {
    brandMark();
    skipLink();
    mobileMenu();
    welcome();
    check();
    setInterval(check, 500);
    window.addEventListener("popstate", () => setTimeout(check, 50));
    document.addEventListener("click", () => setTimeout(check, 300), true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
