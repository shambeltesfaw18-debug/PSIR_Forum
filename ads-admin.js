// Ads tab on the moderation page: upload a short video, set its message and link, choose the live ad.
(function () {
  "use strict";
  var view = document.getElementById("ads-view");
  if (!view || !window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var MAX_BYTES = 10 * 1024 * 1024, MAX_SECONDS = 15;

  function $(id) { return document.getElementById(id); }
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function say(text, bad) { var m = $("ads-msg"); m.textContent = text || ""; m.style.color = bad ? "#B42318" : "#237A57"; }

  view.innerHTML =
    '<h2 style="margin-top:0">Ads and banner</h2>' +
    '<p class="muted">Upload a short video (MP4 or WebM, up to 10 MB and 15 seconds). The live ad appears in a banner at the top of the home page. Members who close it do not see it again, until you choose Show again to all.</p>' +
    '<form id="ad-form" class="form" style="display:grid;gap:10px;max-width:640px;">' +
    '<label>Title (for the team)<input id="ad-title" required minlength="3" maxlength="120"></label>' +
    '<label>Message shown with the video (optional)<textarea id="ad-message" rows="2" maxlength="300"></textarea></label>' +
    '<label>Link (optional, must start with https://)<input id="ad-link" type="url" placeholder="https://..."></label>' +
    '<label>Video file (MP4 or WebM, up to 10 MB, up to 15 seconds)<input id="ad-video" type="file" accept="video/mp4,video/webm" required></label>' +
    '<label style="display:flex;gap:8px;align-items:center;"><input id="ad-live" type="checkbox"> Show on the home page now (this replaces the current live ad)</label>' +
    '<div id="ad-preview"></div>' +
    '<button type="submit" id="ad-send" class="btn">Upload</button>' +
    '</form>' +
    '<p id="ads-msg" role="status"></p>' +
    '<h3>All ads</h3>' +
    '<div id="ads-list"></div>';

  $("ad-video").addEventListener("change", function () {
    var f = this.files[0];
    var box = $("ad-preview");
    box.innerHTML = "";
    if (!f) return;
    var url = URL.createObjectURL(f);
    var v = document.createElement("video");
    v.controls = true;
    v.preload = "metadata";
    v.style.cssText = "width:100%;max-width:360px;border-radius:8px;background:#000;margin:6px 0;display:block;";
    var note = document.createElement("p");
    note.className = "muted";
    note.style.margin = "4px 0";
    v.onloadedmetadata = function () {
      note.textContent = "Length: " + Math.round(v.duration) + " seconds. Check that the preview plays before you upload.";
      note.style.color = "";
    };
    v.onerror = function () {
      note.textContent = "This browser cannot play this video. Export it again as MP4 (H.264 video, AAC audio), then choose it again.";
      note.style.color = "#B42318";
    };
    box.appendChild(v);
    box.appendChild(note);
    v.src = url;
  });

  function videoSeconds(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = function () { var d = v.duration; URL.revokeObjectURL(url); resolve(d); };
      v.onerror = function () { URL.revokeObjectURL(url); reject(new Error("This browser cannot read this video. Export it again as MP4 (H.264 video, AAC audio), then choose it again.")); };
      v.src = url;
    });
  }

  async function currentUser() { var s = await db.auth.getSession(); return s.data.session ? s.data.session.user : null; }

  async function deactivateOthers() {
    var r = await db.from("site_ads").update({ is_active: false }).eq("is_active", true).select("id");
    if (r.error) throw r.error;
  }

  $("ad-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    var user = await currentUser();
    if (!user) return say("Please log in again.", true);
    var file = $("ad-video").files[0];
    if (!file) return say("Please choose a video file.", true);
    if (!/^video\/(mp4|webm)$/.test(file.type)) return say("The video must be an MP4 or WebM file.", true);
    if (file.size > MAX_BYTES) return say("The video must be 10 MB or smaller.", true);
    var link = $("ad-link").value.trim();
    if (link && !/^https:\/\//i.test(link)) return say("The link must start with https://", true);
    say("Checking the video length…");
    var seconds;
    try { seconds = await videoSeconds(file); } catch (err) { return say(err.message, true); }
    if (!(seconds > 0) || seconds > MAX_SECONDS) return say("The video must be 15 seconds or shorter (this one is " + Math.round(seconds || 0) + " seconds).", true);

    $("ad-send").disabled = true;
    say("Uploading…");
    try {
      var ext = file.type === "video/webm" ? "webm" : "mp4";
      var path = user.id + "/" + crypto.randomUUID() + "." + ext;
      var up = await db.storage.from("ads").upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) throw up.error;
      var publicUrl = db.storage.from("ads").getPublicUrl(path).data.publicUrl;
      var live = $("ad-live").checked;
      if (live) await deactivateOthers();
      var ins = await db.from("site_ads").insert({
        title: $("ad-title").value.trim(),
        message: $("ad-message").value.trim() || null,
        link_url: link || null,
        video_url: publicUrl,
        is_active: live,
        created_by: user.id
      });
      if (ins.error) { await db.storage.from("ads").remove([path]); throw ins.error; }
      $("ad-form").reset();
      say(live ? "Uploaded and now live on the home page." : "Uploaded. Choose Make live when you are ready.");
      loadList();
    } catch (err) {
      say("Could not upload: " + (err.message || err), true);
    } finally {
      $("ad-send").disabled = false;
    }
  });

  async function loadList() {
    var r = await db.from("site_ads").select("id, title, message, link_url, video_url, is_active, version, created_at").order("created_at", { ascending: false });
    var box = $("ads-list");
    if (r.error) { box.textContent = "Could not load the ads: " + r.error.message; return; }
    if (!r.data || !r.data.length) { box.innerHTML = '<p class="muted">No ads yet.</p>'; return; }
    box.innerHTML = r.data.map(function (a) {
      return '<div class="card" style="border:1px solid #DCE3EE;border-radius:10px;padding:12px;margin-bottom:10px;background:#fff;">' +
        '<strong>' + esc(a.title) + '</strong> ' + (a.is_active ? '<span style="color:#237A57;font-weight:700;">LIVE</span>' : '<span class="muted">not live</span>') +
        ' <span class="muted">· version ' + a.version + ' · ' + esc(String(a.created_at).slice(0, 10)) + '</span>' +
        (a.message ? '<p style="margin:6px 0;">' + esc(a.message) + '</p>' : '') +
        '<p style="margin:4px 0;"><a href="' + esc(a.video_url) + '" target="_blank" rel="noopener noreferrer">Open video</a>' + (a.link_url ? ' · <a href="' + esc(a.link_url) + '" target="_blank" rel="noopener noreferrer">Link</a>' : '') + '</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">' +
        (a.is_active
          ? '<button type="button" class="secondary" data-act="takedown" data-id="' + esc(a.id) + '">Take down</button>'
          : '<button type="button" data-act="live" data-id="' + esc(a.id) + '">Make live</button>') +
        '<button type="button" class="secondary" data-act="again" data-id="' + esc(a.id) + '" data-v="' + a.version + '">Show again to all</button>' +
        '<button type="button" class="secondary" data-act="delete" data-id="' + esc(a.id) + '" data-url="' + esc(a.video_url) + '">Delete</button>' +
        '</div></div>';
    }).join("");
  }

  view.addEventListener("click", async function (e) {
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var id = b.dataset.id, act = b.dataset.act;
    var r;
    if (act === "live") {
      try { await deactivateOthers(); } catch (err) { return say("Could not change the live ad: " + err.message, true); }
      r = await db.from("site_ads").update({ is_active: true }).eq("id", id).select("id");
      if (r.error || !r.data || !r.data.length) return say("Could not make it live.", true);
      say("This ad is now live on the home page.");
    } else if (act === "takedown") {
      r = await db.from("site_ads").update({ is_active: false }).eq("id", id).select("id");
      if (r.error || !r.data || !r.data.length) return say("Could not take it down.", true);
      say("Taken down from the home page.");
    } else if (act === "again") {
      r = await db.from("site_ads").update({ version: Number(b.dataset.v) + 1 }).eq("id", id).select("id");
      if (r.error || !r.data || !r.data.length) return say("Could not reset it.", true);
      say("Members will see it again on their next visit.");
    } else if (act === "delete") {
      if (!window.confirm("Delete this ad and its video? This cannot be undone.")) return;
      r = await db.from("site_ads").delete().eq("id", id).select("id");
      if (r.error || !r.data || !r.data.length) return say("Could not delete the ad.", true);
      var marker = "/object/public/ads/";
      var u = b.dataset.url || "";
      var i = u.indexOf(marker);
      if (i !== -1) await db.storage.from("ads").remove([u.slice(i + marker.length)]);
      say("Ad deleted.");
    }
    loadList();
  });

  function showAds(on) {
    view.style.display = on ? "block" : "none";
    $("tab-ads").setAttribute("aria-pressed", String(on));
    $("tab-ads").className = on ? "" : "secondary";
    if (on) {
      $("reports-view").style.display = "none";
      $("log-view").style.display = "none";
      $("tab-reports").setAttribute("aria-pressed", "false");
      $("tab-log").setAttribute("aria-pressed", "false");
      $("tab-reports").className = "secondary";
      $("tab-log").className = "secondary";
      loadList();
    }
  }
  $("tab-ads").addEventListener("click", function () { showAds(true); });
  ["tab-reports", "tab-log"].forEach(function (id) {
    $(id).addEventListener("click", function () { showAds(false); });
  });
})();
