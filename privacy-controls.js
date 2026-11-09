// Profile page: privacy controls. Photo use can be turned on or off, and account deletion can be requested.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function say(t, bad) { var m = document.getElementById("pc-msg"); if (m) { m.textContent = t || ""; m.style.color = bad ? "#B42318" : "#237A57"; } }

  async function render() {
    var s = await db.auth.getSession();
    var user = s.data.session ? s.data.session.user : null;
    var host = document.querySelector("main") || document.body;
    var old = document.getElementById("privacy-controls");
    if (old) old.remove();
    if (!user) return;
    var p = await db.from("profiles").select("photo_consent, avatar_url").eq("id", user.id).maybeSingle();
    var reqs = await db.from("privacy_requests").select("id, request_type, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
    var photoOn = !!(p.data && p.data.photo_consent);
    var open = (reqs.data || []).find(function (r) { return r.status === "open"; });

    var box = document.createElement("section");
    box.id = "privacy-controls";
    box.setAttribute("aria-labelledby", "pc-title");
    box.style.cssText = "background:#FFFFFF;border:1px solid #DCE3EE;border-radius:12px;padding:18px;margin:16px auto;max-width:900px;box-sizing:border-box;";
    box.innerHTML =
      '<h2 id="pc-title" style="margin:0 0 8px;color:#1E3F82;font-size:1.2rem;">Your privacy</h2>' +
      '<p style="margin:0 0 12px;font-size:.95rem;">You can change these choices at any time. Read the <a href="/info.html?page=privacy" style="color:#2855A6;font-weight:700;">Privacy Policy</a> for details.</p>' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">' +
      '<span><strong>Profile photo shown publicly:</strong> ' + (photoOn ? 'On' : 'Off') + '</span>' +
      '<button type="button" id="pc-photo" class="psir-btn psir-outline">' + (photoOn ? 'Turn off' : 'Turn on') + '</button></div>' +
      (open
        ? '<p style="margin:0 0 8px;"><strong>Account deletion requested</strong> on ' + esc(String(open.created_at).slice(0, 10)) + '. We will confirm once it is done.</p>'
        : '<label style="display:grid;gap:4px;font-weight:700;color:#1E3F82;">Request deletion of my account (optional note)<textarea id="pc-note" rows="2" maxlength="500" style="border:1px solid #CBD5E1;border-radius:6px;padding:8px;font:inherit;"></textarea></label>' +
        '<button type="button" id="pc-delete" class="psir-btn psir-outline-red" style="margin-top:8px;">Request account deletion</button>') +
      '<p id="pc-msg" role="status" style="font-weight:600;margin:10px 0 0;"></p>' +
      '<p style="margin:10px 0 0;font-size:.88rem;color:#475569;">Deleting an account removes it from the live site. Copies in encrypted backups are removed as the backups rotate. Other requests: psirforum@gmail.com.</p>';
    host.appendChild(box);

    document.getElementById("pc-photo").addEventListener("click", async function () {
      var on = !photoOn;
      var upd = { photo_consent: on, photo_consent_at: on ? new Date().toISOString() : null };
      if (!on) upd.avatar_url = null;
      var r = await db.from("profiles").update(upd).eq("id", user.id).select("id");
      if (r.error || !r.data || !r.data.length) return say("Could not save. Please try again.", true);
      say(on ? "Your photo can be shown publicly." : "Your photo is no longer shown publicly.");
      render();
    });
    var del = document.getElementById("pc-delete");
    if (del) del.addEventListener("click", async function () {
      if (!window.confirm("Request deletion of your account? A moderator will confirm when it is done.")) return;
      var note = document.getElementById("pc-note").value.trim() || null;
      var r = await db.from("privacy_requests").insert({ user_id: user.id, request_type: "delete_account", note: note }).select("id");
      if (r.error) return say("Could not send the request: " + r.error.message, true);
      say("Your request has been sent.");
      render();
    });
  }
  db.auth.onAuthStateChange(function () { setTimeout(render, 0); });
  render();
})();
