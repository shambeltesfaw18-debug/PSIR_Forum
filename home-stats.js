// Home page: a short strip of community numbers under the hero. The numbers count up once,
// the cards rise in one after another, and members who prefer less motion see the final numbers at once.
(function () {
  "use strict";
  if (!window.supabase) return;
  var path = window.location.pathname;
  if (path !== "/" && path !== "/index.html") return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var css = document.createElement("style");
  css.textContent =
    ".psir-stats{width:min(1100px,calc(100% - 24px));margin:18px auto 6px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}" +
    ".psir-stat{background:#FFFFFF;border:1px solid #E6B75A;border-radius:12px;padding:14px 12px;text-align:center;box-shadow:0 8px 20px rgba(10,30,70,.12);}" +
    ".psir-stat strong{display:block;font-size:1.7rem;color:#1E3F82;line-height:1.1;}" +
    ".psir-stat span{font-size:.85rem;color:#475569;font-weight:600;}" +
    (reduce ? "" : ".psir-stat{opacity:0;transform:translateY(12px);transition:opacity .5s ease,transform .5s ease;}.psir-stat.in{opacity:1;transform:none;}") +
    "@media (max-width:520px){.psir-stats{gap:8px;}.psir-stat strong{font-size:1.35rem;}.psir-stat span{font-size:.75rem;}}";
  document.head.appendChild(css);

  function countUp(el, to) {
    if (reduce) { el.textContent = to.toLocaleString(); return; }
    var start = null, dur = 900;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  async function build() {
    var m = await db.from("profiles").select("id", { count: "exact", head: true });
    var d = await db.from("threads").select("id", { count: "exact", head: true }).eq("is_hidden", false);
    var c = await db.from("categories").select("id", { count: "exact", head: true });
    var items = [
      { label: "Members", value: m.count || 0 },
      { label: "Discussions", value: d.count || 0 },
      { label: "Categories", value: c.count || 0 }
    ];
    var wrap = document.createElement("section");
    wrap.className = "psir-stats";
    wrap.setAttribute("aria-label", "Community numbers");
    wrap.innerHTML = items.map(function (it) {
      return '<div class="psir-stat"><strong data-n="' + it.value + '">' + (reduce ? it.value.toLocaleString() : "0") + '</strong><span>' + it.label + '</span></div>';
    }).join("");
    var hero = document.querySelector("section.hero");
    if (!hero || !hero.parentNode) return;
    wrap.id = "psirHomeStats";
    hero.parentNode.insertBefore(wrap, hero.nextSibling);
    // Hide the strip while the Discussions view is open, which already shows these numbers.
    setInterval(function () {
      var d = document.getElementById("discussions");
      var discussionsOpen = !!(d && window.getComputedStyle(d).display !== "none");
      wrap.style.display = discussionsOpen ? "none" : "";
    }, 400);
    var cards = wrap.querySelectorAll(".psir-stat");
    var nums = wrap.querySelectorAll("strong[data-n]");
    requestAnimationFrame(function () {
      cards.forEach(function (card, i) {
        setTimeout(function () { card.classList.add("in"); }, reduce ? 0 : i * 140);
      });
    });
    nums.forEach(function (el, i) {
      setTimeout(function () { countUp(el, Number(el.dataset.n)); }, reduce ? 0 : 200 + i * 140);
    });
  }
  build();
})();
