(function () {
  "use strict";
  // 1. "Welcome back, name!" for logged-in members, once per browsing session, for 15 seconds.
  // 2. On each category page, a desktop-site suggestion for phone users (not on desktop view).
  const WELCOME_KEY = "psirWelcomeShown";
  const WELCOME_MS = 15000;
  let name = null;
  let loggedIn = false;
  let last = null;

  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }
  function isPhone() { return window.innerWidth < 760; }
  function isCategoryPage() { return /^\/categories\/[a-z0-9-]+$/.test(location.pathname.replace(/\/+$/, "")); }

  const style = document.createElement("style");
  style.textContent = "@keyframes psirHintIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion: reduce){#psirHint{animation:none!important}}";
  document.head.appendChild(style);

  function welcome() {
    if (!loggedIn || !isPhone()) return;
    try {
      if (sessionStorage.getItem(WELCOME_KEY)) return;
      sessionStorage.setItem(WELCOME_KEY, "1");
    } catch (e) {}

    const box = document.createElement("div");
    box.id = "psirHint";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    box.style.cssText = "position:fixed;left:12px;right:12px;top:12px;z-index:500;background:#102b46;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 12px 32px rgba(0,0,0,.28);font-size:15px;display:flex;gap:12px;align-items:center;animation:psirHintIn .25s ease-out;";

    const text = document.createElement("div");
    text.style.flex = "1";
    text.innerHTML = '<strong style="color:#e7b451;">Welcome back, ' + esc(name || "member") + "!</strong>";

    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.textContent = "×";
    close.style.cssText = "border:none;background:transparent;color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:0 2px;";

    box.append(text, close);
    document.body.appendChild(box);
    const timer = setTimeout(() => box.remove(), WELCOME_MS);
    close.addEventListener("click", () => { clearTimeout(timer); box.remove(); });
  }

  // Desktop-site suggestion, shown on every category page for phone users
  function categoryTip() {
    const old = document.getElementById("psirCatTip");
    if (old) old.remove();
    if (!isCategoryPage() || !isPhone()) return;

    const anchor = document.querySelector("#discussions .section-heading");
    if (!anchor) return;

    const tip = document.createElement("div");
    tip.id = "psirCatTip";
    tip.setAttribute("role", "note");
    tip.style.cssText = "margin:0 0 16px;background:#fff8e1;border:1px solid #f0e2a6;color:#5a4a10;border-radius:14px;padding:12px 14px;font-size:14px;line-height:1.5;display:flex;gap:10px;align-items:flex-start;";

    const text = document.createElement("div");
    text.style.flex = "1";
    text.innerHTML = "<strong>Tip: use the desktop site for a wider view.</strong><br>" +
      "In your browser, tap ⋮ then tick <em>Desktop site</em>. Discussions, rooms and comments are easier to follow on a larger screen.";

    const close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Close tip");
    close.textContent = "×";
    close.style.cssText = "border:none;background:transparent;color:#5a4a10;font-size:18px;line-height:1;cursor:pointer;padding:0 2px;";
    close.addEventListener("click", () => tip.remove());

    tip.append(text, close);
    anchor.insertAdjacentElement("afterend", tip);
  }

  function check() {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (path === last) return;
    last = path;
    welcome();
    categoryTip();
  }

  function start() {
    if (!window.supabase) { setInterval(check, 800); return; }
    const db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
    db.auth.getSession().then(({ data }) => {
      const user = data.session ? data.session.user : null;
      loggedIn = !!user;
      if (user) name = (user.user_metadata && user.user_metadata.full_name) || (user.email || "").split("@")[0];
      check();
      setInterval(check, 800);
    }).catch(() => { check(); setInterval(check, 800); });
  }
  start();
})();
