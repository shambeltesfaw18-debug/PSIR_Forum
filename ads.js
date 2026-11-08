// Live ad banner on the home page. Shows the ad an admin or moderator made live, with a close button.
// Closing hides that ad, until its version is changed.
(function () {
  "use strict";
  if (!window.supabase) return;
  var path = window.location.pathname;
  if (path !== "/" && path !== "/index.html") return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  async function show() {
    var r = await db.from("site_ads").select("id, title, message, link_url, video_url, version").eq("is_active", true).maybeSingle();
    if (r.error || !r.data) return;
    var ad = r.data;
    var key = "psir-ad-dismissed-" + ad.id + "-" + ad.version;
    try { if (localStorage.getItem(key) === "1") return; } catch (e) {}

    var box = document.createElement("section");
    box.setAttribute("aria-label", "PSIR Forum announcement");
    box.style.cssText = "width:min(960px,calc(100% - 24px));margin:14px auto;background:#FFFFFF;border:1px solid #E6B75A;border-radius:12px;padding:12px 14px;box-shadow:0 8px 22px rgba(10,30,70,.18);box-sizing:border-box;";
    box.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;">' +
      '<strong style="color:#1E3F82;font-size:.95rem;">' + esc(ad.title) + '</strong>' +
      '<button type="button" class="ad-close" style="min-height:36px;padding:0 12px;border-radius:6px;border:1px solid #2855A6;background:#FFFFFF;color:#2855A6;font:inherit;font-weight:700;cursor:pointer;">Close</button>' +
      '</div>' +
      '<video src="' + esc(ad.video_url) + '" controls playsinline preload="metadata" style="width:100%;max-height:420px;border-radius:8px;background:#000;display:block;"></video>' +
      (ad.message ? '<p style="margin:8px 0 0;font-size:.95rem;line-height:1.45;color:#263238;">' + esc(ad.message) + '</p>' : '') +
      (ad.link_url ? '<p style="margin:8px 0 0;"><a href="' + esc(ad.link_url) + '" target="_blank" rel="noopener noreferrer" style="color:#2855A6;font-weight:700;">Learn more</a></p>' : '');
    box.querySelector(".ad-close").addEventListener("click", function () {
      try { localStorage.setItem(key, "1"); } catch (e) {}
      box.remove();
    });
    var header = document.querySelector("header.top, header.navbar");
    if (header && header.parentNode) header.parentNode.insertBefore(box, header.nextSibling);
    else document.body.insertBefore(box, document.body.firstChild);
  }
  show();
})();
