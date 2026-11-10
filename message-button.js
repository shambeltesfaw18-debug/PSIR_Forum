// Public profile: a "Send message" button for signed-in members viewing someone else's profile.
// It sits in the header row, beside the member's name and photo.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  function findByText(prefix) {
    var all = document.querySelectorAll("p, div, span, small");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.children.length === 0 && (el.textContent || "").trim().indexOf(prefix) === 0) return el;
    }
    return null;
  }

  db.auth.getSession().then(function (s) {
    var me = s.data.session ? s.data.session.user.id : null;
    if (!me || me === id) return;
    var btn = document.createElement("a");
    btn.href = "/messages.html?to=" + encodeURIComponent(id);
    btn.textContent = "Send message";
    btn.style.cssText = "display:inline-block;background:#2855A6;color:#fff;border-radius:8px;padding:9px 14px;font-weight:700;text-decoration:none;font-size:.92rem;margin-left:12px;vertical-align:middle;white-space:nowrap;";

    var note = findByText("Member of PSIR Forum");
    if (note && note.previousElementSibling) {
      // The row above the note holds the photo and the name: put the button at the end of that row.
      note.previousElementSibling.appendChild(btn);
      return;
    }
    if (note && note.parentNode) {
      var wrap = document.createElement("div");
      wrap.style.cssText = "margin:8px 0;";
      wrap.appendChild(btn);
      note.parentNode.insertBefore(wrap, note);
      return;
    }
    var host = document.querySelector("main") || document.body;
    var box = document.createElement("div");
    box.style.cssText = "max-width:900px;margin:12px auto;padding:0 12px;box-sizing:border-box;";
    box.appendChild(btn);
    host.insertBefore(box, host.firstChild);
  });
})();
