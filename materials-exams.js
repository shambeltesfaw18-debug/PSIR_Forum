// Books and Materials: a short list of published exams, linking to the Exams page.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  async function build() {
    var r = await db.from("exams").select("id, title, description, time_limit_minutes, pass_percent, questions")
      .eq("published", true).order("created_at", { ascending: false }).limit(6);
    var rows = r.data || [];
    if (r.error || !rows.length) return;

    var box = document.createElement("section");
    box.id = "materials-exams";
    box.setAttribute("aria-labelledby", "me-title");
    box.style.cssText = "width:min(1100px,calc(100% - 24px));margin:18px auto;";
    box.innerHTML =
      '<h2 id="me-title" style="margin:0 0 4px;color:#1E3F82;font-size:1.25rem;">Exams and practice tests</h2>' +
      '<p style="margin:0 0 12px;color:#475569;">Test yourself on the material. Results are shown straight after you submit.</p>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;">' +
      rows.map(function (ex) {
        return '<article style="background:#fff;border:1px solid #DCE3EE;border-radius:12px;padding:14px;box-shadow:0 6px 16px rgba(10,30,70,.08);display:flex;flex-direction:column;gap:6px;">' +
          '<strong style="color:#1E3F82;">' + esc(ex.title) + '</strong>' +
          '<span style="font-size:.85rem;color:#64748B;">' + ex.questions.length + ' questions · ' +
          (ex.time_limit_minutes ? ex.time_limit_minutes + ' minutes' : 'no time limit') + ' · pass mark ' + ex.pass_percent + '%</span>' +
          '<a href="/exams.html?exam=' + encodeURIComponent(ex.id) + '" style="margin-top:auto;display:inline-block;background:#2855A6;color:#fff;border-radius:8px;padding:9px 12px;font-weight:700;text-decoration:none;text-align:center;">Take exam</a>' +
          '</article>';
      }).join("") + '</div>';

    var main = document.querySelector("main");
    if (!main) return;
    var first = main.querySelector(":scope > section");
    if (first && first.nextSibling) main.insertBefore(box, first.nextSibling);
    else main.appendChild(box);
  }
  build();
})();
