// Home page: dots under the Explore cards, a short tour that slides the row to the next cards and back,
// played on every page load and after sign-in. It stops as soon as the reader touches or swipes the row.
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

  var scroller = null, cards = [], stepPx = 0, timers = [], running = false;

  function step() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : (cards[0] ? cards[0].offsetWidth : 0); }
  function go(i, instant) {
    scroller.scrollTo({ left: step() * i, behavior: instant || reduce ? "auto" : "smooth" });
  }
  function stopTour() {
    if (!running) return;
    running = false;
    timers.forEach(clearTimeout);
    timers = [];
  }

  // The row moves to the next cards and back, once per page load or sign-in.
  function playTour() {
    if (reduce || running || cards.length < 2 || !scroller) return;
    running = true;
    var seq = [1, Math.min(2, cards.length - 1), 1, 0];
    seq.forEach(function (i, n) {
      timers.push(setTimeout(function () {
        if (!running) return;
        go(i);
        if (n === seq.length - 1) running = false;
      }, 1200 + n * 1100));
    });
  }

  function init() {
    cards = Array.prototype.slice.call(document.querySelectorAll(".hcard"));
    if (cards.length < 2) return;
    scroller = cards[0].parentElement;
    for (var k = 0; k < 3 && scroller && scroller.scrollWidth <= scroller.clientWidth + 4; k++) scroller = scroller.parentElement;
    if (!scroller) return;

    var dots = document.createElement("div");
    dots.className = "psir-dots";
    dots.setAttribute("aria-label", "Explore sections");
    var buttons = cards.map(function (card, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "psir-dot";
      var t = card.querySelector("h3");
      b.setAttribute("aria-label", "Show " + (t ? t.textContent.trim() : "section " + (i + 1)));
      b.addEventListener("click", function () { stopTour(); go(i); });
      dots.appendChild(b);
      return b;
    });
    scroller.insertAdjacentElement("afterend", dots);

    function mark() {
      var idx = Math.round(scroller.scrollLeft / step());
      idx = Math.max(0, Math.min(cards.length - 1, idx));
      buttons.forEach(function (b, i) { b.classList.toggle("on", i === idx); b.setAttribute("aria-current", i === idx ? "true" : "false"); });
    }
    scroller.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", mark);
    ["pointerdown", "touchstart", "wheel", "keydown"].forEach(function (ev) {
      scroller.addEventListener(ev, stopTour, { passive: true });
    });
    mark();

    var all = document.querySelectorAll("p, span, div");
    for (var j = 0; j < all.length; j++) {
      var el = all[j];
      if (el.children.length === 0 && /Swipe sideways/.test(el.textContent)) {
        el.textContent = "Swipe sideways or tap the dots below to see every section.";
        break;
      }
    }

    playTour();
    // Also play once after sign-in.
    try {
      if (window.supabase) {
        var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
        var signedIn = false;
        db.auth.onAuthStateChange(function (event) {
          if (event === "SIGNED_IN") { if (!signedIn) { signedIn = true; setTimeout(playTour, 600); } }
          if (event === "SIGNED_OUT") signedIn = false;
        });
      }
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
