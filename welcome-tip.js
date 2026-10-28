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

  function run() {
    welcome();
    check();
    setInterval(check, 500);
    window.addEventListener("popstate", () => setTimeout(check, 50));
    document.addEventListener("click", () => setTimeout(check, 300), true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
