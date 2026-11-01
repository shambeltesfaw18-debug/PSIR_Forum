// Records unexpected errors in the site's own database (table error_logs). Nothing is sent elsewhere.
// At most 20 reports per visit; each distinct error is reported once.
(function () {
  "use strict";
  const URL_BASE = "https://updxillknwufqekfzkur.supabase.co/rest/v1/error_logs";
  const KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const seen = new Set();
  let sent = 0;

  function signedInUserId() {
    try {
      const raw = localStorage.getItem("sb-updxillknwufqekfzkur-auth-token");
      const s = raw ? JSON.parse(raw) : null;
      return s && s.user && s.user.id ? s.user.id : null;
    } catch (e) { return null; }
  }

  function report(message, source, stack) {
    const msg = String(message || "").trim();
    if (!msg || /ResizeObserver|^Script error\.?$/i.test(msg)) return;
    const key = (msg + "|" + String(source || "")).slice(0, 300);
    if (sent >= 20 || seen.has(key)) return;
    seen.add(key);
    sent += 1;
    fetch(URL_BASE, {
      method: "POST",
      headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        page: (location.pathname + location.search).slice(0, 300),
        message: msg.slice(0, 1000),
        source: String(source || "").slice(0, 300),
        stack: String(stack || "").slice(0, 4000),
        user_agent: navigator.userAgent.slice(0, 300),
        user_id: signedInUserId()
      }),
      keepalive: true
    }).catch(() => {});
  }

  window.addEventListener("error", e => {
    report(e.message, (e.filename || "") + ":" + (e.lineno || ""), e.error && e.error.stack);
  });
  window.addEventListener("unhandledrejection", e => {
    const r = e.reason;
    report(r && r.message ? r.message : String(r), "promise", r && r.stack);
  });
})();
