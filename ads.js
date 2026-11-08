// Live ad on the home page. It opens by itself, plays once (muted, with no player controls),
// and closes by itself at the end. Members can close it at any time. It shows once per browser for each ad version.
(function () {
  "use strict";
  if (!window.supabase) return;
  var path = window.location.pathname;
  if (path !== "/" && path !== "/index.html") return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var css = document.createElement("style");
  css.textContent =
    ".psir-ad{position:relative;width:min(640px,calc(100% - 24px));margin:12px auto 0;background:#FFFFFF;border:1px solid #E6B75A;border-radius:12px;box-shadow:0 10px 26px rgba(10,30,70,.22);overflow:hidden;box-sizing:border-box;opacity:0;transform:translateY(-8px);transition:opacity .4s ease,transform .4s ease;}" +
    ".psir-ad.psir-ad-in{opacity:1;transform:none;}" +
    ".psir-ad.psir-ad-out{opacity:0;transform:translateY(-8px);}" +
    ".psir-ad-top{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;}" +
    ".psir-ad-tag{font-size:.75rem;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#64748B;}" +
    ".psir-ad-btn{min-height:32px;padding:0 10px;border-radius:6px;border:1px solid #2855A6;background:#FFFFFF;color:#2855A6;font:inherit;font-weight:700;font-size:.85rem;cursor:pointer;}" +
    ".psir-ad-media{position:relative;background:#000;}" +
    ".psir-ad-media video{display:block;width:100%;max-height:360px;object-fit:contain;pointer-events:none;}" +
    ".psir-ad-cta{display:block;padding:8px 10px 10px;font-size:.92rem;color:#263238;}" +
    ".psir-ad-cta a{color:#2855A6;font-weight:700;}";
  document.head.appendChild(css);

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  async function show() {
    var r = await db.from("site_ads").select("id, title, message, link_url, video_url, version").eq("is_active", true).maybeSingle();
    if (r.error || !r.data) return;
    var ad = r.data;
    var key = "psir-ad-shown-" + ad.id + "-" + ad.version;
    try { if (localStorage.getItem(key) === "1") return; } catch (e) {}

    var box = document.createElement("section");
    box.className = "psir-ad";
    box.setAttribute("aria-label", "Advertisement");
    box.innerHTML =
      '<div class="psir-ad-top"><span class="psir-ad-tag">Ad</span>' +
      '<span style="display:flex;gap:6px;"><button type="button" class="psir-ad-btn psir-ad-sound">Sound off</button>' +
      '<button type="button" class="psir-ad-btn psir-ad-x" aria-label="Close advertisement">Close</button></span></div>' +
      '<div class="psir-ad-media"><video playsinline muted disablepictureinpicture preload="auto" src="' + esc(ad.video_url) + '"></video></div>' +
      '<div class="psir-ad-cta">' + esc(ad.message || ad.title) +
      (ad.link_url ? ' · <a href="' + esc(ad.link_url) + '" target="_blank" rel="noopener noreferrer">Learn more</a>' : '') + '</div>';

    var v = box.querySelector("video");
    var closed = false, timer = null;

    function finish(remember) {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      if (remember) { try { localStorage.setItem(key, "1"); } catch (e) {} }
      box.classList.add("psir-ad-out");
      setTimeout(function () { box.remove(); }, 450);
    }

    box.querySelector(".psir-ad-x").addEventListener("click", function () { finish(true); });
    box.querySelector(".psir-ad-sound").addEventListener("click", function (e) {
      v.muted = !v.muted;
      e.currentTarget.textContent = v.muted ? "Sound off" : "Sound on";
    });
    v.addEventListener("ended", function () { setTimeout(function () { finish(true); }, 800); });

    var header = document.querySelector("header.top, header.navbar");
    if (header && header.parentNode) header.parentNode.insertBefore(box, header.nextSibling);
    else document.body.insertBefore(box, document.body.firstChild);
    requestAnimationFrame(function () { box.classList.add("psir-ad-in"); });

    if (ad.link_url) {
      v.style.cursor = "pointer";
      box.querySelector(".psir-ad-media").addEventListener("click", function () {
        window.open(ad.link_url, "_blank", "noopener,noreferrer");
      });
      box.querySelector(".psir-ad-media").style.cursor = "pointer";
    }

    if (reduceMotion) {
      // No autoplay for people who prefer less motion: show the first frame, then close after a short time.
      v.addEventListener("loadedmetadata", function () { try { v.currentTime = 0.1; } catch (e) {} });
      timer = setTimeout(function () { finish(false); }, 8000);
      return;
    }

    // Safety: never stay longer than the video plus a little, even if 'ended' does not fire.
    var maxMs = 25000;
    v.addEventListener("loadedmetadata", function () {
      if (isFinite(v.duration) && v.duration > 0) maxMs = Math.min(25000, Math.ceil(v.duration * 1000) + 2000);
      clearTimeout(timer);
      timer = setTimeout(function () { finish(true); }, maxMs);
    });
    timer = setTimeout(function () { finish(false); }, maxMs);

    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {
      // Autoplay was blocked by the browser: close quietly, and try again on the next visit.
      finish(false);
    });
  }
  show();
})();
