(function () {
  "use strict";
  // 1) "Welcome back" for logged-in members, once per browsing session.
  // 2) On category pages, a desktop-site suggestion for phone users who are not in desktop view.
  // Desktop view is detected from the page width: a browser in desktop mode shows a wide page.
  const WELCOME_KEY = "psirWelcomeShown";
  const CATEGORY_KEY = "psirCategoryHintShown";
  const SHOW_MS = 15000;
  const DESKTOP_WIDTH = 760;
  let name = null;
  let loggedIn = false;
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
    box.style.cssText = "position:fixed;left:12px;right:12px;top:12px;z-index:500;background:#102b46;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 12px 32px rgba(0,0,0,.28);font-size:14px;line-height:1.5;display:flex;gap:12px;align-items:flex-start;animation:psirHintIn .25s ease-out;";

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
    if (!loggedIn) return;
    if (readSet(WELCOME_KEY).has("1")) return;
    addToSet(WELCOME_KEY, "1");
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

  function start() {
    if (!window.supabase) { setInterval(check, 800); return; }
    const db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
    db.auth.getSession().then(({ data }) => {
      const user = data.session ? data.session.user : null;
      loggedIn = !!user;
      if (user) name = (user.user_metadata && user.user_metadata.full_name) || (user.email || "").split("@")[0];
      welcome();
      check();
      setInterval(check, 800);
    }).catch(() => { check(); setInterval(check, 800); });
  }
  start();
})();
