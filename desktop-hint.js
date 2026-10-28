(function () {
  "use strict";
  // 1) "Welcome back" for logged-in members, once per browsing session.
  // 2) On each category page, a desktop-site suggestion for phone users who are in mobile view.
  // Flags are kept in a session cookie, which works in more browsers (including in-app browsers)
  // than sessionStorage.
  const SHOW_MS = 15000;
  const COOKIE = "psirHints";

  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }

  function readHints() {
    try {
      const m = document.cookie.match(/(?:^|;\s*)psirHints=([^;]*)/);
      return m ? JSON.parse(decodeURIComponent(m[1])) : {};
    } catch (e) { return {}; }
  }
  function writeHints(hints) {
    try { document.cookie = COOKIE + "=" + encodeURIComponent(JSON.stringify(hints)) + "; path=/; SameSite=Lax"; } catch (e) {}
  }

  // Phone browsers say "Mobile" in their user agent. In desktop-site mode they don't.
  function inMobileView() {
    if (/Mobile|iPhone|iPod/i.test(navigator.userAgent)) return true;
    return window.innerWidth < 600 && navigator.maxTouchPoints > 0;
  }

  // Read the signed-in member straight from the saved session
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
  style.textContent = "@keyframes psirHintIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion: reduce){.psir-hint{animation:none!important}}";
  document.head.appendChild(style);

  function toast(id, html) {
    const old = document.getElementById(id);
    if (old) old.remove();
    const box = document.createElement("div");
    box.id = id;
    box.className = "psir-hint";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    box.style.cssText = "position:fixed;left:12px;right:12px;top:12px;z-index:9000;background:#102b46;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 12px 32px rgba(0,0,0,.28);font-size:14px;line-height:1.5;display:flex;gap:12px;align-items:flex-start;animation:psirHintIn .25s ease-out;";

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
    const timer = setTimeout(() => box.remove(), SHOW_MS);
    close.addEventListener("click", () => { clearTimeout(timer); box.remove(); });
  }

  function welcome() {
    const user = savedUser();
    if (!user) return;
    const hints = readHints();
    if (hints.welcome) return;
    hints.welcome = true;
    writeHints(hints);
    const name = (user.user_metadata && user.user_metadata.full_name) || (user.email || "").split("@")[0] || "member";
    toast("psirWelcome", '<strong style="font-size:15px;color:#e7b451;">Welcome back, ' + esc(name) + "!</strong>");
  }

  let lastPath = null;
  function categoryHint(path) {
    if (!/^\/categories\/[^\/]+$/.test(path)) return;
    if (!inMobileView()) return;                 // desktop site is already on
    const hints = readHints();
    const seen = Array.isArray(hints.categories) ? hints.categories : [];
    if (seen.indexOf(path) !== -1) return;       // once per category per session
    hints.categories = seen.concat([path]).slice(-50);
    writeHints(hints);
    toast("psirDesktopHint",
      '<strong style="color:#e7b451;">Tip for this category</strong><br>' +
      "For the full discussion list and the live room, switch to the desktop site: tap ⋮ in your browser, then tick <em>Desktop site</em>.");
  }

  function check() {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (path === lastPath) return;
    lastPath = path;
    categoryHint(path);
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
