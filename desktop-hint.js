(function () {
  "use strict";
  // Shows a "Welcome back" style message at the top of the screen when someone opens a new
  // page or category on a phone. It stays for 15 seconds and suggests the desktop site.
  const SHOWN_KEY = "psirHintShown";
  const SHOW_MS = 15000;
  let name = null;
  let last = null;

  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }

  function shownSet() {
    try { return new Set(JSON.parse(sessionStorage.getItem(SHOWN_KEY) || "[]")); } catch (e) { return new Set(); }
  }
  function remember(path) {
    const s = shownSet();
    s.add(path);
    try { sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...s])); } catch (e) {}
  }

  const style = document.createElement("style");
  style.textContent = "@keyframes psirHintIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}" +
    "@media (prefers-reduced-motion: reduce){#psirHint{animation:none!important}}";
  document.head.appendChild(style);

  function show() {
    if (window.innerWidth >= 760) return;
    const old = document.getElementById("psirHint");
    if (old) old.remove();

    const box = document.createElement("div");
    box.id = "psirHint";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    box.style.cssText = "position:fixed;left:12px;right:12px;top:12px;z-index:500;background:#102b46;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 12px 32px rgba(0,0,0,.28);font-size:14px;line-height:1.5;display:flex;gap:12px;align-items:flex-start;animation:psirHintIn .25s ease-out;";

    const text = document.createElement("div");
    text.style.flex = "1";
    text.innerHTML = '<strong style="font-size:15px;color:#e7b451;">' +
      (name ? "Welcome back, " + esc(name) + "!" : "Welcome to PSIR Forum!") + "</strong><br>" +
      "For a wider view of papers, reviews and discussions, switch to the desktop site: tap ⋮ in your browser, then tick <em>Desktop site</em>.";

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

  // Each page or category is announced once per visit (per browser session)
  function check() {
    const path = location.pathname.replace(/\/+$/, "") || "/";
    if (path === last) return;
    last = path;
    if (shownSet().has(path)) return;
    remember(path);
    show();
  }

  function start() {
    if (!window.supabase) { setInterval(check, 800); return; }
    const db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
    db.auth.getSession().then(({ data }) => {
      const user = data.session ? data.session.user : null;
      if (user) name = (user.user_metadata && user.user_metadata.full_name) || (user.email || "").split("@")[0];
      check();
      setInterval(check, 800);
    }).catch(() => { check(); setInterval(check, 800); });
  }
  start();
})();
