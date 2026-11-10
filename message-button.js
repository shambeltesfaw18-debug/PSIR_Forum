// Public profile: a "Send message" button for signed-in members viewing someone else's profile.
// It sits in the header row, beside the member's photo and name.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  // The smallest element whose text starts with the given words (the note under the name).
  function findNote(prefix) {
    var best = null, bestLen = Infinity;
    document.querySelectorAll("body *").forEach(function (el) {
      var t = (el.textContent || "").trim();
      if (t.indexOf(prefix) === 0 && t.length < bestLen) { best = el; bestLen = t.length; }
    });
    return best;
  }

  db.auth.getSession().then(function (s) {
    var me = s.data.session ? s.data.session.user.id : null;
    if (!me || me === id) return;
    var btn = document.createElement("a");
    btn.href = "/messages.html?to=" + encodeURIComponent(id);
    btn.textContent = "Send message";
    btn.style.cssText = "display:inline-block;background:#2855A6;color:#fff;border-radius:8px;padding:9px 14px;font-weight:700;text-decoration:none;font-size:.92rem;margin-left:12px;vertical-align:middle;white-space:nowrap;";

    var note = findNote("Member of PSIR Forum");
    if (note) {
      var row = note.previousElementSibling;
      if (row) { row.appendChild(btn); return; }
      var wrap = document.createElement("div");
      wrap.style.cssText = "margin:8px 0;";
      wrap.appendChild(btn);
      note.parentNode.insertBefore(wrap, note);
      return;
    }
    var card = findNote("Academic profile");
    var target = card ? (card.closest(".card, section") || card) : null;
    var box = document.createElement("div");
    box.style.cssText = "max-width:900px;margin:12px auto;padding:0 12px;box-sizing:border-box;";
    box.appendChild(btn);
    if (target && target.parentNode) target.parentNode.insertBefore(box, target);
  });
})();
