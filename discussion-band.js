// Keeps the discussion heading and its subtitle readable on the photo bands, whatever category is open.
(function () {
  "use strict";
  function paint() {
    var h = document.getElementById("discussionHeading");
    if (!h) return;
    var band = h.closest(".section-heading") || h.parentElement;
    h.style.setProperty("color", "#FFFFFF", "important");
    if (band) {
      band.querySelectorAll("p, span").forEach(function (el) {
        el.style.setProperty("color", "#E2E8F0", "important");
      });
    }
  }
  paint();
  var target = document.getElementById("discussions") || document.body;
  new MutationObserver(paint).observe(target, { childList: true, subtree: true, characterData: true });
})();
