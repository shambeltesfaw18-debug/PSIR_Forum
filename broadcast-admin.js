// Ads tab (administrators only): send a notification to every member, and see recent sends.
(function () {
  "use strict";
  var view = document.getElementById("ads-view");
  if (!view || !window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  async function init() {
    var s = await db.auth.getSession();
    if (!s.data.session) return;
    var p = await db.from("profiles").select("role").eq("id", s.data.session.user.id).maybeSingle();
    if (!p.data || p.data.role !== "admin") return;

    var box = document.createElement("section");
    box.id = "broadcast-box";
    box.style.cssText = "margin-top:24px;padding-top:16px;border-top:2px solid #E6B75A;";
    box.innerHTML =
      '<h2 style="margin:0 0 6px;color:#1E3F82;font-size:1.15rem;">Send a notification to all members</h2>' +
      '<p class="muted" style="margin:0 0 10px;">Every member receives it in their notifications (bell). Use this for important announcements only. You can send up to 5 a day.</p>' +
      '<form id="bc-form" style="display:grid;gap:10px;max-width:640px;">' +
      '<label>Title (3 to 120 characters)<input id="bc-title" maxlength="120" required></label>' +
      '<label>Message (up to 500 characters)<textarea id="bc-body" rows="3" maxlength="500" required></textarea></label>' +
      '<label>Link (optional: https://... or a page such as /research.html)<input id="bc-link" placeholder="/discussions"></label>' +
      '<label style="display:flex;gap:8px;align-items:flex-start;"><input id="bc-confirm" type="checkbox"> <span>I confirm this message should go to all members.</span></label>' +
      '<button type="submit" id="bc-send" class="btn">Send to all members</button>' +
      '</form>' +
      '<p id="bc-msg" role="status" style="font-weight:600;min-height:20px;"></p>' +
      '<h3 style="margin:14px 0 6px;">Recent notifications to all members</h3>' +
      '<div id="bc-list"></div>';
    view.appendChild(box);

    document.getElementById("bc-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      var msg = document.getElementById("bc-msg");
      var title = document.getElementById("bc-title").value.trim();
      var body = document.getElementById("bc-body").value.trim();
      var link = document.getElementById("bc-link").value.trim() || null;
      if (title.length < 3) { msg.textContent = "The title needs at least 3 characters."; msg.style.color = "#B42318"; return; }
      if (!document.getElementById("bc-confirm").checked) { msg.textContent = "Please tick the confirmation box."; msg.style.color = "#B42318"; return; }
      if (link && !(/^https:\/\//.test(link) || /^\//.test(link))) { msg.textContent = "The link must start with https:// or /."; msg.style.color = "#B42318"; return; }
      if (!window.confirm("Send this notification to ALL members? This cannot be undone.")) return;
      var btn = document.getElementById("bc-send");
      btn.disabled = true;
      msg.textContent = "Sending…"; msg.style.color = "#475569";
      var r = await db.rpc("send_broadcast", { p_title: title, p_body: body, p_link: link });
      btn.disabled = false;
      if (r.error) { msg.textContent = "Could not send: " + r.error.message; msg.style.color = "#B42318"; return; }
      msg.textContent = "Sent to " + (r.data || 0) + " members.";
      msg.style.color = "#237A57";
      e.target.reset();
      document.getElementById("bc-confirm").checked = false;
      loadList();
    });

    loadList();
  }

  async function loadList() {
    var r = await db.from("broadcasts").select("title, body, recipients, created_at").order("created_at", { ascending: false }).limit(10);
    var box = document.getElementById("bc-list");
    if (!box) return;
    if (r.error) { box.textContent = "Could not load: " + r.error.message; return; }
    var rows = r.data || [];
    box.innerHTML = rows.length ? rows.map(function (b) {
      return '<div style="border:1px solid #DCE3EE;border-radius:10px;padding:10px;margin-bottom:8px;background:#fff;">' +
        '<strong>' + esc(b.title) + '</strong> <span class="muted">· ' + esc(String(b.created_at).slice(0, 16).replace("T", " ")) + ' · ' + b.recipients + ' members</span>' +
        '<p style="margin:4px 0 0;">' + esc(b.body) + '</p></div>';
    }).join("") : '<p class="muted">Nothing sent yet.</p>';
  }

  init();
})();
