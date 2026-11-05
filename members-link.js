// On the home page, the Members count opens the member list for admins and moderators only.
// Everyone else sees the plain count, with no link and no hint.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");

  async function isStaff() {
    var s = await db.auth.getSession();
    var user = s.data.session ? s.data.session.user : null;
    if (!user) return false;
    var p = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return !!p.data && (p.data.role === "admin" || p.data.role === "moderator");
  }

  function findBox() {
    var label = Array.prototype.find.call(document.querySelectorAll("span, div, p, small, strong"), function (el) {
      return el.children.length === 0 && el.textContent.trim() === "Members";
    });
    return label ? label.parentElement : null;
  }

  var tries = 0;
  var timer = setInterval(async function () {
    tries++;
    var box = findBox();
    if (box) {
      clearInterval(timer);
      if (box.dataset.membersLink) return;
      if (!(await isStaff())) return;
      box.dataset.membersLink = "1";
      box.style.cursor = "pointer";
      box.setAttribute("role", "link");
      box.setAttribute("tabindex", "0");
      box.addEventListener("click", function () { window.location.href = "/members.html"; });
      box.addEventListener("keydown", function (e) { if (e.key === "Enter") window.location.href = "/members.html"; });
    }
    if (tries > 40) clearInterval(timer);
  }, 300);
})();
