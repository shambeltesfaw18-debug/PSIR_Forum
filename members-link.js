// Makes the Members count on the home page open the member list (staff only, shown there).
(function () {
  "use strict";
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    var label = Array.prototype.find.call(document.querySelectorAll("span, div, p, small, strong"), function (el) {
      return el.children.length === 0 && el.textContent.trim() === "Members";
    });
    if (label) {
      clearInterval(timer);
      var box = label.parentElement;
      if (!box || box.dataset.membersLink) return;
      box.dataset.membersLink = "1";
      box.style.cursor = "pointer";
      box.setAttribute("role", "link");
      box.setAttribute("tabindex", "0");
      box.setAttribute("title", "Open the member list");
      label.textContent = "Members (view list)";
      box.addEventListener("click", function () { window.location.href = "/members.html"; });
      box.addEventListener("keydown", function (e) { if (e.key === "Enter") window.location.href = "/members.html"; });
    }
    if (tries > 40) clearInterval(timer);
  }, 300);
})();
