// Floating Messages button for signed-in members, with an unread count. Opens the inbox.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var btn = null, badge = null, timer = null;

  function build() {
    if (btn) return;
    btn = document.createElement("a");
    btn.href = "/messages.html";
    btn.id = "psirChatButton";
    btn.setAttribute("aria-label", "Messages");
    btn.title = "Messages";
    btn.style.cssText = "position:fixed;left:16px;bottom:16px;z-index:9000;width:56px;height:56px;border-radius:50%;background:#2855A6;color:#FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(10,30,70,.3);text-decoration:none;";
    btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    badge = document.createElement("span");
    badge.style.cssText = "position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:#B42318;color:#fff;font:700 12px/22px system-ui,sans-serif;text-align:center;display:none;box-sizing:border-box;";
    btn.style.position = "fixed";
    btn.appendChild(badge);
    document.body.appendChild(btn);
  }

  async function refresh() {
    var s = await db.auth.getSession();
    if (!s.data.session) { if (btn) btn.style.display = "none"; return; }
    build();
    btn.style.display = "flex";
    var r = await db.rpc("list_my_conversations");
    var total = 0;
    (r.data || []).forEach(function (c) { total += (c.unread || 0); });
    badge.textContent = total > 99 ? "99+" : String(total);
    badge.style.display = total > 0 ? "block" : "none";
    btn.setAttribute("aria-label", total > 0 ? "Messages, " + total + " unread" : "Messages");
  }

  db.auth.onAuthStateChange(function () { setTimeout(refresh, 0); });
  refresh();
  timer = setInterval(refresh, 60000);
})();
