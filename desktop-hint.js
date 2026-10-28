(function () {
  "use strict";
  // 1) "Welcome back" for logged-in members, once per browsing session.
  // 2) On each category page, a desktop-site suggestion for phone users who are not in desktop view.
  const WELCOME_KEY = "psirWelcome_v2";
  const CATEGORY_KEY = "psirCatHint_v2";
  const SHOW_MS = 15000;
  const DESKTOP_WIDTH = 760;
  let lastPath = null;

  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }

  function readSet(key) {
    try { return new Set(JSON.parse(sessionStorage.getItem(key) || "[]")); } catch (e) { return new Set(); }
  }
  function addToSet(key, value) {
    const s = readSet(key);
    s.add(value);
    try { sessionStorage.setItem(key, JSON.stringify([...s])); } catch (e) {}
  }

  // Read the signed-in member straight from the saved session, so the message does not
  // depend on the network or on the library having finished loading
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
    if (readSet(WELCOME_KEY).has("1")) return;
    addToSet(WELCOME_KEY, "1");
    const name = (user.user_metadata && user.user_metadata.full_name) || (user.email || "").split("@")[0] || "member";
    toast("psirWelcome", '<strong style="font-size:15px;color:#e7b451;">Welcome back, ' + esc(name) + "!</strong>");
  }

  function categoryHint(path) {
    if (!/^\/categories\/[^\/]+$/.test(path)) return;
    if (window.innerWidth >= DESKTOP_WIDTH) return;          // already in desktop view
    if (readSet(CATEGORY_KEY).has(path)) return;             // once per category per session
    addToSet(CATEGORY_KEY, path);
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
