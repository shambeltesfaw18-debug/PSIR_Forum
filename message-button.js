// Public profile: a "Send message" button for signed-in members viewing someone else's profile.
// It sits in the header row, beside the member's photo and name. The page fills in its details after
// it loads, so the script keeps checking for a short time until the name row is there.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  // The smallest element whose text starts with the given words.
  function findStarting(prefix) {
    var best = null, bestLen = Infinity;
    document.querySelectorAll("body *").forEach(function (el) {
      var t = (el.textContent || "").trim();
      if (t.indexOf(prefix) === 0 && t.length < bestLen) { best = el; bestLen = t.length; }
    });
    return best;
  }

  function place(btn) {
    var note = findStarting("Member of PSIR Forum");
    if (!note || !note.parentNode) return false;
    var row = note.previousElementSibling;
    if (row) { row.appendChild(btn); return true; }
    var wrap = document.createElement("div");
    wrap.style.cssText = "margin:8px 0;";
    wrap.appendChild(btn);
    note.parentNode.insertBefore(wrap, note);
    return true;
  }

  db.auth.getSession().then(function (s) {
    var me = s.data.session ? s.data.session.user.id : null;
    if (!me || me === id) return;
    var btn = document.createElement("a");
    btn.href = "/messages.html?to=" + encodeURIComponent(id);
    btn.textContent = "Send message";
    btn.id = "psirSendMessage";
    btn.style.cssText = "display:inline-block;background:#2855A6;color:#fff;border-radius:8px;padding:9px 14px;font-weight:700;text-decoration:none;font-size:.92rem;margin-left:12px;vertical-align:middle;white-space:nowrap;";

    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (!document.getElementById("psirSendMessage") && place(btn)) {
        // placed; keep watching in case the page redraws its header
      }
      if (tries > 60) clearInterval(timer);
    }, 250);
  });
})();
