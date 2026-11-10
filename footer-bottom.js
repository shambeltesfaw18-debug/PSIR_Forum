// Keeps the footer on the bottom edge of the screen when the page is short, and full width.
(function () {
  "use strict";
  function fit() {
    var f = document.querySelector("footer.site-footer");
    if (!f) return;
    f.style.marginTop = "";
    var base = parseFloat(window.getComputedStyle(f).marginTop) || 0;
    var bottom = f.getBoundingClientRect().bottom + window.scrollY;
    var extra = window.innerHeight - bottom;
    if (extra > 0) f.style.marginTop = (base + extra) + "px";
  }
  window.addEventListener("load", fit);
  window.addEventListener("resize", fit);
  setTimeout(fit, 300);
  setTimeout(fit, 1200);
})();
