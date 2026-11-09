// Public profile: a "Send message" button for signed-in members viewing someone else's profile.
// It is placed just above the member's academic profile, inside the page content.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  function findAnchor() {
    var all = document.querySelectorAll("h1, h2, h3, h4, strong, p, div");
    for (var i = 0; i < all.length; i++) {
      var t = (all[i].textContent || "").trim();
      if (all[i].children.length <= 1 && (t === "Academic profile" || t.indexOf("Published on PSIR Forum") === 0)) {
        return all[i].closest(".card, section") || all[i];
      }
    }
    return null;
  }

  db.auth.getSession().then(function (s) {
    var me = s.data.session ? s.data.session.user.id : null;
    if (!me || me === id) return;
    var box = document.createElement("div");
    box.style.cssText = "max-width:900px;margin:12px auto;padding:0 12px;box-sizing:border-box;";
    box.innerHTML = '<a href="/messages.html?to=' + encodeURIComponent(id) + '" style="display:inline-block;background:#2855A6;color:#fff;border-radius:8px;padding:12px 18px;font-weight:700;text-decoration:none;">Send message</a>';
    var anchor = findAnchor();
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(box, anchor);
    } else {
      var host = document.querySelector("main") || document.querySelector(".container") || document.body;
      host.insertBefore(box, host.firstChild);
    }
  });
})();
