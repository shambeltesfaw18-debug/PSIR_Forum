(function () {
  "use strict";
  if (!window.supabase) return;

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const SHOW_MS = 15000;

  const LABELS = [
    [/^\/$/, "Home"],
    [/^\/categories$/, "Categories"],
    [/^\/live$/, "Categories"],
    [/^\/discussions$/, "Discussions"],
    [/^\/bookmarks$/, "Bookmarks"],
    [/^\/research\.html$/, "Research Hub"],
    [/^\/news\.html$/, "News & Journal"],
    [/^\/publication\.html$/, "Research publication"],
    [/^\/saved\.html$/, "Saved papers"],
    [/^\/policy\.html$/, "Academic publishing policy"],
    [/^\/profile\.html$/, "My profile"],
    [/^\/public-profile\.html$/, "Member profile"],
    [/^\/notifications\.html$/, "Notifications"],
    [/^\/moderation\.html$/, "Moderation"]
  ];

  let me = null, toast = null, hideTimer = null, lastPath = null, lastShownAt = 0;

  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]); }

  function firstName(user) {
    const full = (user.user_metadata && user.user_metadata.full_name) || (user.email ? user.email.split("@")[0] : "") || "member";
    return full.trim().split(/\s+/)[0];
  }

  function currentLabel() {
    const path = (location.pathname.replace(/\/+$/, "")) || "/";
    if (/^\/categories\/[a-z0-9-]+$/.test(path)) {
      const h = document.getElementById("discussionHeading");
      const name = h && h.textContent.trim();
      if (name && name !== "Community discussions") return name;
      return "Category";
    }
    for (const [re, label] of LABELS) if (re.test(path)) return label;
    return (document.title || "PSIR Forum").replace(/\s*[|—-].*$/, "") || "PSIR Forum";
  }

  function build() {
    toast = document.createElement("div");
    toast.id = "psirWelcome";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.style.cssText = "position:fixed;top:12px;left:50%;transform:translateX(-50%);width:min(460px,calc(100% - 24px));z-index:360;background:#102b46;color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 12px 36px rgba(0,0,0,.28);display:none;gap:12px;align-items:flex-start;font-size:14px;border-left:5px solid #e7b451;transition:opacity .4s ease;opacity:0;";
    toast.innerHTML = '<div style="flex:1;min-width:0;"><strong id="psirWelcomeTitle" style="font-size:15px;"></strong>' +
      '<div id="psirWelcomeSub" style="opacity:.92;margin-top:3px;"></div></div>' +
      '<button type="button" aria-label="Close welcome message" style="border:1px solid rgba(255,255,255,.5);background:transparent;color:#fff;border-radius:999px;padding:2px 10px;font:inherit;cursor:pointer;">×</button>';
    document.body.appendChild(toast);
    toast.querySelector("button").addEventListener("click", hide);
  }

  function show() {
    if (!me) return;
    if (!toast) build();
    document.getElementById("psirWelcomeTitle").textContent = "Welcome back, " + firstName(me) + ".";
    document.getElementById("psirWelcomeSub").textContent = "You are in " + currentLabel() + ".";
    toast.style.display = "flex";
    requestAnimationFrame(() => { toast.style.opacity = "1"; });
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, SHOW_MS);
  }

  function hide() {
    if (!toast) return;
    clearTimeout(hideTimer);
    toast.style.opacity = "0";
    setTimeout(() => { if (toast) toast.style.display = "none"; }, 400);
  }

  // Shows once per page or category entry; the same address is not repeated within a minute
  function announce() {
    if (!me) return;
    const path = location.pathname;
    const now = Date.now();
    if (path === lastPath && now - lastShownAt < 60000) return;
    lastPath = path;
    lastShownAt = now;
    show();
  }

  // Category and menu changes inside the single page also count as entering a new page
  const originalPush = history.pushState;
  history.pushState = function () {
    const result = originalPush.apply(this, arguments);
    setTimeout(announce, 700);
    return result;
  };
  window.addEventListener("popstate", () => setTimeout(announce, 700));

  db.auth.onAuthStateChange((_event, session) => {
    me = session ? session.user : null;
    if (!me) hide();
    else setTimeout(announce, 300);
  });

  db.auth.getSession().then(({ data }) => {
    me = data.session ? data.session.user : null;
    if (me) setTimeout(announce, 800);
  });
})();
