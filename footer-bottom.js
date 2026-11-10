// Puts the footer on the bottom edge when the page is short. The gap is set as a CSS variable,
// which the footer rule reads, so no empty space is left below the footer.
(function () {
  "use strict";
  var root = document.documentElement;
  function fit() {
    var f = document.querySelector("footer.site-footer");
    if (!f) return;
    root.style.setProperty("--footer-gap", "0px");
    var bottom = f.getBoundingClientRect().bottom + window.scrollY;
    var extra = window.innerHeight - bottom;
    root.style.setProperty("--footer-gap", (extra > 0 ? extra : 40) + "px");
  }
  window.addEventListener("load", fit);
  window.addEventListener("resize", fit);
  setTimeout(fit, 300);
  setTimeout(fit, 1200);
})();
