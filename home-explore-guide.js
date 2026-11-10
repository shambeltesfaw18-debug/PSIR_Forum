// Home page: dots under the Explore cards, a one-time nudge to show the row can be swiped,
// and a clearer instruction. Dots let people jump straight to any card.
(function () {
  "use strict";
  var path = window.location.pathname;
  if (path !== "/" && path !== "/index.html") return;
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var css = document.createElement("style");
  css.textContent =
    ".psir-dots{display:flex;justify-content:center;align-items:center;gap:8px;margin:12px 0 4px;}" +
    ".psir-dot{width:10px;height:10px;border-radius:999px;border:0;padding:0;background:rgba(120,130,150,.45);cursor:pointer;transition:width .25s ease,background .25s ease;}" +
    ".psir-dot.on{width:28px;background:#E6B75A;box-shadow:0 0 0 2px rgba(230,183,90,.25);}" +
    ".psir-dot:focus-visible{outline:2px solid #2855A6;outline-offset:3px;}" +
    "@media (prefers-reduced-motion: reduce){.psir-dot{transition:none;}}";
  document.head.appendChild(css);

  function init() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".hcard"));
    if (cards.length < 2) return;
    var scroller = cards[0].parentElement;
    for (var k = 0; k < 3 && scroller && scroller.scrollWidth <= scroller.clientWidth + 4; k++) {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;

    var dots = document.createElement("div");
    dots.className = "psir-dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Explore sections");
    var buttons = cards.map(function (card, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "psir-dot";
      var t = card.querySelector("h3");
      b.setAttribute("aria-label", "Show " + (t ? t.textContent.trim() : "section " + (i + 1)));
      b.addEventListener("click", function () { go(i); });
      dots.appendChild(b);
      return b;
    });
    scroller.insertAdjacentElement("afterend", dots);

    function step() {
      return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
    }
    function go(i) {
      scroller.scrollTo({ left: step() * i, behavior: reduce ? "auto" : "smooth" });
    }
    function mark() {
      var idx = Math.round(scroller.scrollLeft / step());
      idx = Math.max(0, Math.min(cards.length - 1, idx));
      buttons.forEach(function (b, i) {
        b.classList.toggle("on", i === idx);
        b.setAttribute("aria-current", i === idx ? "true" : "false");
      });
    }
    scroller.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", mark);
    mark();

    // One gentle nudge per browser session, so people see that the row moves.
    try {
      if (!reduce && !sessionStorage.getItem("psirSwipeNudge")) {
        sessionStorage.setItem("psirSwipeNudge", "1");
        setTimeout(function () {
          scroller.scrollTo({ left: 56, behavior: "smooth" });
          setTimeout(function () { scroller.scrollTo({ left: 0, behavior: "smooth" }); }, 900);
        }, 1400);
      }
    } catch (e) {}

    // Clearer instruction under the heading.
    var all = document.querySelectorAll("p, span, div");
    for (var j = 0; j < all.length; j++) {
      var el = all[j];
      if (el.children.length === 0 && /Swipe sideways to see every section/.test(el.textContent)) {
        el.textContent = "Swipe sideways or tap the dots below to see every section.";
        break;
      }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
