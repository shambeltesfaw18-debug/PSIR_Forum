// Public profile: "Send message" beside the member's name (under the photo if the name cannot be found).
// Shown to signed-in members viewing someone else's profile.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  function buttonEl() {
    var a = document.createElement("a");
    a.href = "/messages.html?to=" + encodeURIComponent(id);
    a.id = "psirSendMessage";
    a.textContent = "Send message";
    a.style.cssText = "display:inline-block;vertical-align:middle;margin-left:12px;background:#2855A6;color:#fff;border-radius:8px;padding:8px 14px;font-size:.92rem;font-weight:700;text-decoration:none;white-space:nowrap;";
    return a;
  }

  function findNameEl(name) {
    var els = document.querySelectorAll("h1, h2, h3, a, strong, span, div, p");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.children.length > 2) continue;
      if ((el.textContent || "").trim() === name) return el;
    }
    return null;
  }

  function findPhoto() {
    var img = document.querySelector("img");
    return img ? (img.closest("a, div, section") || img) : null;
  }

  async function place() {
    var s = await db.auth.getSession();
    var me = s.data.session ? s.data.session.user.id : null;
    if (!me || me === id) return;
    if (document.getElementById("psirSendMessage")) return;
    var p = await db.from("profiles").select("full_name").eq("id", id).maybeSingle();
    var name = p.data && p.data.full_name ? String(p.data.full_name).trim() : "";
    var btn = buttonEl();
    var nameEl = name ? findNameEl(name) : null;
    if (nameEl && nameEl.parentNode) {
      nameEl.insertAdjacentElement("afterend", btn);
      return;
    }
    var photo = findPhoto();
    if (photo && photo.parentNode) {
      btn.style.marginLeft = "0";
      btn.style.display = "inline-block";
      btn.style.marginTop = "8px";
      photo.insertAdjacentElement("afterend", btn);
    }
  }

  var tries = 0;
  var t = setInterval(function () {
    tries++;
    if (document.getElementById("psirSendMessage") || tries > 30) { clearInterval(t); return; }
    place();
  }, 500);
})();
