// Moderation page: staff confidentiality acknowledgement, privacy requests (admins) and the access log (admins).
(function () {
  "use strict";
  var view = document.getElementById("privacy-view");
  if (!view || !window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  function $(id) { return document.getElementById(id); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var me = null, role = null;

  async function ackGate() {
    var p = await db.from("profiles").select("staff_confidentiality_at").eq("id", me.id).maybeSingle();
    if (p.data && p.data.staff_confidentiality_at) return;
    var g = document.createElement("div");
    g.id = "staffAck";
    g.setAttribute("role", "dialog");
    g.setAttribute("aria-modal", "true");
    g.style.cssText = "position:fixed;inset:0;z-index:20001;background:rgba(16,43,70,.8);display:flex;align-items:center;justify-content:center;padding:16px;";
    g.innerHTML = '<div style="background:#fff;color:#263238;max-width:520px;width:100%;border-radius:10px;padding:22px;">' +
      '<h2 style="margin:0 0 10px;color:#1E3F82;font-size:1.2rem;">Staff confidentiality</h2>' +
      '<p style="line-height:1.5;">Before you use the moderation tools, please confirm that you will:</p>' +
      '<p style="line-height:1.5;">keep member information confidential, use only the access you need, follow the community guidelines and academic publishing policy, and never share your sign-in with anyone else.</p>' +
      '<label style="display:flex;gap:8px;align-items:flex-start;margin:12px 0;"><input type="checkbox" id="ackBox"> <span>I confirm this and accept the staff responsibilities.</span></label>' +
      '<p id="ackMsg" style="color:#B42318;font-weight:600;min-height:20px;"></p>' +
      '<button type="button" id="ackBtn" class="psir-btn psir-navy">Continue</button></div>';
    document.body.appendChild(g);
    $("ackBtn").addEventListener("click", async function () {
      if (!$("ackBox").checked) { $("ackMsg").textContent = "Please tick the box to continue."; return; }
      var r = await db.from("profiles").update({ staff_confidentiality_at: new Date().toISOString() }).eq("id", me.id).select("id");
      if (r.error || !r.data || !r.data.length) { $("ackMsg").textContent = "Could not save. Please try again."; return; }
      g.remove();
    });
  }

  async function loadRequests() {
    var r = await db.from("privacy_requests").select("id, user_id, request_type, status, note, created_at").order("created_at", { ascending: false }).limit(100);
    var box = $("pr-list");
    if (r.error) { box.textContent = "Could not load requests: " + r.error.message; return; }
    var rows = r.data || [];
    if (!rows.length) { box.innerHTML = '<p class="muted">No privacy requests yet.</p>'; return; }
    box.innerHTML = rows.map(function (q) {
      return '<div style="border:1px solid #DCE3EE;border-radius:10px;padding:12px;margin-bottom:10px;background:#fff;">' +
        '<strong>' + esc(q.request_type === "delete_account" ? "Account deletion" : q.request_type) + '</strong> · ' +
        '<span>' + esc(q.status) + '</span> · <span class="muted">' + esc(String(q.created_at).slice(0, 10)) + '</span>' +
        '<p style="margin:6px 0;">' + esc(q.note || "(no note)") + '</p>' +
        '<p class="muted" style="margin:0 0 8px;font-size:.88rem;">Before marking done: delete the member in Supabase Authentication, then mark done here.</p>' +
        (q.status === "open"
          ? '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button type="button" data-pr="done" data-id="' + esc(q.id) + '">Mark done</button>' +
            '<button type="button" class="secondary" data-pr="rejected" data-id="' + esc(q.id) + '">Reject</button></div>'
          : '') + '</div>';
    }).join("");
  }

  async function loadLog() {
    var r = await db.from("access_log").select("action, actor_id, created_at").order("created_at", { ascending: false }).limit(100);
    var box = $("al-list");
    if (r.error) { box.textContent = "Could not load the log: " + r.error.message; return; }
    var rows = r.data || [];
    box.innerHTML = rows.length ? '<table style="width:100%;border-collapse:collapse;font-size:.9rem;"><thead><tr><th style="text-align:left;">When</th><th style="text-align:left;">Who</th><th style="text-align:left;">What</th></tr></thead><tbody>' +
      rows.map(function (x) { return '<tr><td>' + esc(String(x.created_at).slice(0, 16).replace("T", " ")) + '</td><td>' + esc(String(x.actor_id || "").slice(0, 8)) + '</td><td>' + esc(x.action) + '</td></tr>'; }).join("") +
      '</tbody></table>' : '<p class="muted">No entries yet.</p>';
  }

  view.innerHTML =
    '<h2 style="margin-top:0">Privacy and access</h2>' +
    '<p class="muted">Deletion requests and the access log are for administrators only.</p>' +
    '<h3>Privacy requests</h3><div id="pr-list"></div>' +
    '<p id="pr-msg" role="status"></p>' +
    '<h3>Access log (latest 100)</h3><div id="al-list"></div>';

  view.addEventListener("click", async function (e) {
    var b = e.target.closest("[data-pr]");
    if (!b) return;
    var status = b.dataset.pr;
    var note = null;
    if (status === "rejected") {
      note = window.prompt("Why is this request rejected? (Please give a reason.)");
      if (!note || note.trim().length < 5) { $("pr-msg").textContent = "A reason of at least 5 characters is needed."; return; }
    }
    var r = await db.from("privacy_requests").update({ status: status, handled_by: me.id, handled_at: new Date().toISOString(), note: note ? note.trim() : undefined }).eq("id", b.dataset.id).select("id");
    if (r.error || !r.data || !r.data.length) { $("pr-msg").textContent = "Could not update the request."; return; }
    $("pr-msg").textContent = "Updated.";
    loadRequests();
  });

  function showPrivacy(on) {
    view.style.display = on ? "block" : "none";
    $("tab-privacy").setAttribute("aria-pressed", String(on));
    $("tab-privacy").className = on ? "" : "secondary";
    if (on) {
      ["reports-view", "log-view", "ads-view"].forEach(function (id) { var el = $(id); if (el) el.style.display = "none"; });
      ["tab-reports", "tab-log", "tab-ads"].forEach(function (id) { var el = $(id); if (el) { el.className = "secondary"; el.setAttribute("aria-pressed", "false"); } });
      if (role === "admin") { loadRequests(); loadLog(); }
    }
  }
  $("tab-privacy").addEventListener("click", function () { showPrivacy(true); });
  ["tab-reports", "tab-log", "tab-ads"].forEach(function (id) {
    var el = $(id); if (el) el.addEventListener("click", function () { showPrivacy(false); });
  });

  (async function init() {
    var s = await db.auth.getSession();
    if (!s.data.session) return;
    me = s.data.session.user;
    var p = await db.from("profiles").select("role").eq("id", me.id).maybeSingle();
    role = p.data ? p.data.role : null;
    if (role !== "admin" && role !== "moderator") return;
    $("tab-privacy").style.display = "";
    await ackGate();
    if (role !== "admin") $("tab-privacy").style.display = "none";
  })();
})();
