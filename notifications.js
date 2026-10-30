(function () {
  "use strict";
  if (!window.supabase) return;

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Required fields per academic identity (must match academic_profile_complete in the database)
  const REQUIRED = {
    "Student": ["institution", "department", "academic_level"],
    "Lecturer / Academic Staff": ["institution", "department", "position_title"],
    "Researcher": ["institution", "field_of_study"],
    "Graduate": ["institution", "field_of_study", "graduation_year"],
    "Other Professional": ["field_of_study", "position_title"],
    "Independent Scholar": ["field_of_study"]
  };
  const LABEL = {
    institution: "Institution", department: "Department", academic_level: "Academic level",
    field_of_study: "Field of study", position_title: "Position or rank", graduation_year: "Graduation year"
  };

  let me = null;
  let bell = null, badge = null, panel = null, banner = null;

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
  }

  function ago(iso) {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 60000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return minutes + " min ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " hr ago";
    const days = Math.floor(hours / 24);
    if (days < 7) return days + " day" + (days > 1 ? "s" : "") + " ago";
    return new Date(iso).toLocaleDateString();
  }

  function findHost() {
    return document.getElementById("navActions") || document.querySelector(".nav-actions") ||
           document.querySelector(".top-inner") || document.querySelector(".top-links") || document.querySelector(".bar");
  }

  function ensureBell() {
    const host = findHost();
    if (!host) return false;

    if (!bell) {
      bell = document.createElement("button");
      bell.type = "button";
      bell.id = "psirBell";
      bell.setAttribute("aria-label", "Notifications");
      bell.style.cssText = "position:relative;border:1px solid #cfd9e4;background:#fff;color:#102b46;border-radius:999px;padding:6px 11px;font:inherit;cursor:pointer;margin-left:6px;";
      bell.innerHTML = '<span aria-hidden="true">🔔</span>';

      badge = document.createElement("span");
      badge.id = "psirBellBadge";
      badge.style.cssText = "display:none;position:absolute;top:-6px;right:-6px;min-width:19px;height:19px;padding:0 5px;box-sizing:border-box;background:#d32f2f;color:#fff;font-size:11px;font-weight:800;line-height:17px;text-align:center;border-radius:999px;border:2px solid #fff;";
      bell.appendChild(badge);

      panel = document.createElement("div");
      panel.id = "psirPanel";
      panel.hidden = true;
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "Notifications");
      panel.style.cssText = "position:fixed;top:70px;right:12px;width:min(380px,calc(100% - 24px));max-height:70vh;overflow:auto;background:#fff;color:#172b3d;border:1px solid #dfe7ef;border-radius:14px;box-shadow:0 12px 40px rgba(16,43,70,.18);z-index:300;padding:12px;font-size:14px;";
      document.body.appendChild(panel);

      bell.addEventListener("click", () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden) loadList();
      });
    }

    // Some pages redraw their navigation after sign-in; keep the bell attached
    if (!host.contains(bell)) host.appendChild(bell);
    if (!host.dataset.bellWatch) {
      host.dataset.bellWatch = "1";
      new MutationObserver(() => {
        if (bell && !host.contains(bell)) host.appendChild(bell);
      }).observe(host, { childList: true });
    }
    return true;
  }

  function setBadge(count) {
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.style.display = "inline-block";
      bell.setAttribute("aria-label", "Notifications, " + count + " unread");
    } else {
      badge.style.display = "none";
      bell.setAttribute("aria-label", "Notifications");
    }
  }

  async function refreshCount() {
    if (!me || !bell) return;
    const { count, error } = await db.from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", me.id).is("read_at", null).is("dismissed_at", null);
    if (error) return;
    setBadge(count || 0);
  }

  async function loadList() {
    panel.innerHTML = '<p style="color:#5b6b7b;margin:4px 0;">Loading…</p>';
    const { data, error } = await db.from("notifications")
      .select("id, kind, title, body, link, read_at, created_at")
      .eq("recipient_id", me.id).is("dismissed_at", null)
      .order("created_at", { ascending: false }).limit(30);
    if (error) {
      panel.innerHTML = '<p style="color:#8c2929;margin:4px 0;">Could not load notifications. Please try again.</p>';
      return;
    }
    const unread = data.filter(n => !n.read_at).length;
    // Items shown in the list count as seen: mark them read after the list is drawn
    const unreadIds = data.filter(n => !n.read_at).map(n => n.id);
    if (unreadIds.length) {
      setTimeout(() => {
        db.from("notifications").update({ read_at: new Date().toISOString() }).in("id", unreadIds).then(() => refreshCount());
      }, 0);
    }
    let html = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">' +
      '<strong style="color:#102b46;">Notifications</strong>' +
      '<button type="button" data-act="all" style="border:none;background:none;color:#2864a0;font-weight:700;cursor:pointer;"' + (unread ? "" : " disabled") + '>Mark all as read</button></div>';
    if (!data.length) {
      html += '<p style="color:#5b6b7b;margin:6px 0;">You have no notifications.</p>';
    } else {
      html += data.map(n => `
        <div style="border-top:1px solid #edf1f5;padding:10px 0;${n.read_at ? "" : "background:#f8fbff;"}">
          <div style="font-weight:700;color:#102b46;">${esc(n.title)}</div>
          ${n.body ? '<div style="color:#4a5b6c;font-size:13px;margin-top:2px;white-space:pre-wrap;overflow-wrap:anywhere;">' + esc(n.body) + "</div>" : ""}
          <div style="color:#8a97a6;font-size:12px;margin-top:4px;">${esc(ago(n.created_at))}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;font-size:13px;">
            ${n.link ? '<a href="' + esc(n.link) + '" style="color:#2864a0;font-weight:700;">Open</a>' : ""}
            ${n.read_at ? "" : '<button type="button" data-act="read" data-id="' + esc(n.id) + '" style="border:none;background:none;color:#315b83;cursor:pointer;">Mark read</button>'}
            <button type="button" data-act="dismiss" data-id="' + esc(n.id) + '" style="border:none;background:none;color:#8c2929;cursor:pointer;">Dismiss</button>
          </div>
        </div>`).join("");
    }
    html += '<div style="border-top:1px solid #edf1f5;padding-top:10px;margin-top:6px;"><a href="/notifications.html" style="color:#2864a0;font-weight:700;">All notifications and preferences</a></div>';
    panel.innerHTML = html;
  }

  panelClicks();
  function panelClicks() {
    document.addEventListener("click", async event => {
      if (!panel || panel.hidden) return;
      const button = event.target.closest("button[data-act]");
      if (!button || !panel.contains(button)) return;
      if (button.dataset.act === "all") {
        await db.from("notifications").update({ read_at: new Date().toISOString() })
          .eq("recipient_id", me.id).is("read_at", null);
      } else if (button.dataset.act === "read") {
        await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", button.dataset.id);
      } else if (button.dataset.act === "dismiss") {
        await db.from("notifications").update({ dismissed_at: new Date().toISOString() }).eq("id", button.dataset.id);
      }
      await Promise.all([loadList(), refreshCount()]);
    });
    document.addEventListener("click", event => {
      if (!panel || panel.hidden || !bell) return;
      if (!panel.contains(event.target) && !bell.contains(event.target)) panel.hidden = true;
    });
  }

  function missingFields(row) {
    if (!row || !row.identity) return ["Identity"];
    return (REQUIRED[row.identity] || []).filter(k => !row[k] && row[k] !== 0).map(k => LABEL[k] || k);
  }

  async function checkProfileReminder() {
    if (!me) return;
    const { data: reminder } = await db.from("notifications").select("id, title, body")
      .eq("recipient_id", me.id).eq("kind", "profile_reminder")
      .is("read_at", null).is("dismissed_at", null).limit(1).maybeSingle();
    if (!reminder) {
      if (banner) banner.remove();
      banner = null;
      return;
    }
    const { data: row } = await db.from("academic_profiles").select("*").eq("user_id", me.id).maybeSingle();
    const missing = missingFields(row);
    if (banner) return;

    banner = document.createElement("div");
    banner.id = "psirProfileBanner";
    banner.setAttribute("role", "status");
    banner.style.cssText = "background:#fff8e1;border-bottom:1px solid #f0e2a6;color:#4a3a00;padding:12px 16px;font-size:14px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;";
    banner.innerHTML = '<div style="flex:1;min-width:220px;"><strong>Complete your academic profile.</strong> ' +
      esc(reminder.body || "It helps other members understand your background.") +
      (missing.length ? '<div style="margin-top:4px;">Still needed: ' + esc(missing.join(", ")) + "</div>" : "") + "</div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      '<a href="/profile.html#academicBox" style="background:#102b46;color:#fff;border-radius:999px;padding:8px 14px;font-weight:700;text-decoration:none;">Complete My Academic Profile</a>' +
      '<button type="button" id="psirProfileDismiss" style="border:1px solid #e0cf86;background:#fff;color:#4a3a00;border-radius:999px;padding:8px 12px;font:inherit;cursor:pointer;">Not now</button></div>';
    document.body.insertBefore(banner, document.body.firstChild);

    document.getElementById("psirProfileDismiss").addEventListener("click", async () => {
      await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", reminder.id);
      banner.remove();
      banner = null;
    });
  }

  async function refreshAll() {
    if (!me) {
      if (bell) bell.style.display = "none";
      if (banner) banner.remove();
      banner = null;
      return;
    }
    if (!ensureBell()) return;
    bell.style.display = "";
    await Promise.all([refreshCount(), checkProfileReminder()]);
  }

  db.auth.onAuthStateChange((_event, session) => {
    me = session ? session.user : null;
    setTimeout(refreshAll, 0);
  });

  db.auth.getSession().then(({ data }) => {
    me = data.session ? data.session.user : null;
    return refreshAll();
  });

  setInterval(() => { if (me) refreshAll(); }, 60000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && me) refreshAll(); });
})();
