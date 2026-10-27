(function () {
  "use strict";

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const BUCKET = "club-files";
  const MAX_FILES = 5;
  const MAX_BYTES = 10 * 1024 * 1024;
  const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const LEADER = ["admin", "moderator", "scholar"];
  const STAFF = ["admin", "moderator"];

  const list = document.getElementById("discussionList");
  if (!list || !window.supabase) return;

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  let me = null;
  let role = "student";

  // ---------- small helpers ----------

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function btn(label, onClick) {
    const b = el("button", "text-action", label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  // A message box above the discussion list
  const notice = (() => {
    const box = el("div");
    box.id = "featureNotice";
    box.setAttribute("role", "status");
    box.style.cssText = "margin:12px 0;padding:12px 14px;border-radius:12px;display:none;font-weight:600;";
    list.parentNode.insertBefore(box, list);
    return function (text, bad) {
      box.textContent = text;
      box.style.display = "block";
      box.style.background = bad ? "#fdecea" : "#e6f4ea";
      box.style.color = bad ? "#bd3737" : "#24794c";
    };
  })();

  // The page redraws the list after many actions, so reload to show the change
  function reloadSoon() {
    setTimeout(() => location.reload(), 900);
  }

  // ---------- who is logged in ----------

  async function loadMe() {
    const { data } = await db.auth.getSession();
    me = data.session ? data.session.user : null;
    role = "student";
    if (me) {
      const { data: profile } = await db.from("profiles").select("role").eq("id", me.id).maybeSingle();
      if (profile) role = profile.role;
    }
    addModerationLink();
  }

  function addModerationLink() {
    const nav = document.getElementById("navLinks");
    if (!nav) return;
    let link = document.getElementById("moderationLink");
    if (!link) {
      link = el("a", "", "Moderation");
      link.id = "moderationLink";
      link.href = "moderation.html";
      nav.appendChild(link);
    }
    link.style.display = STAFF.includes(role) ? "" : "none";
  }

  // ---------- editing and reporting ----------

  async function editPost(t) {
    const title = prompt("Edit the title (5 to 200 characters):", t.title);
    if (title === null) return;
    const body = prompt("Edit the discussion text (up to 10,000 characters):", t.body);
    if (body === null) return;

    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 5 || cleanTitle.length > 200 || !cleanBody || cleanBody.length > 10000) {
      notice("The title must be 5 to 200 characters, and the text cannot be empty.", true);
      return;
    }

    const { data, error } = await db.from("threads")
      .update({ title: cleanTitle, body: cleanBody })
      .eq("id", t.id)
      .select("id");
    if (error) { notice("Could not save: " + error.message, true); return; }
    if (!data || !data.length) { notice("Could not save. You may not have permission to edit this discussion.", true); return; }

    notice("Discussion saved.", false);
    reloadSoon();
  }

  async function reportPost(threadId) {
    const reason = prompt("Why are you reporting this discussion? (at least 5 characters)");
    if (reason === null) return;
    if (reason.trim().length < 5) { notice("Please give a reason of at least 5 characters.", true); return; }

    const { error } = await db.from("reports").insert({
      reporter_id: me.id,
      target_type: "thread",
      target_id: threadId,
      reason: reason.trim()
    });
    if (error) {
      notice(error.code === "23505"
        ? "You have already reported this discussion."
        : "Could not send the report: " + error.message, true);
      return;
    }
    notice("Thank you. The moderators have been notified.", false);
  }

  // ---------- files ----------

  function renderFiles(box, rows) {
    box.innerHTML = "";
    if (!rows.length) return;

    rows.forEach(async att => {
      const wrap = el("div");
      wrap.style.cssText = "margin-top:8px;padding:10px;border:1px solid #e2e8ef;border-radius:12px;background:#fff;";

      const { data: signed, error } = await db.storage.from(BUCKET).createSignedUrl(att.storage_path, 3600);
      if (error || !signed) {
        wrap.appendChild(el("p", "muted small", "Could not open this file"));
      } else {
        if (att.mime_type !== "application/pdf") {
          const img = el("img");
          img.src = signed.signedUrl;
          img.alt = "Attached photo";
          img.loading = "lazy";
          img.style.cssText = "max-width:100%;border-radius:8px;display:block;margin-bottom:6px;";
          wrap.appendChild(img);
        }
        const link = el("a", "", (att.mime_type === "application/pdf" ? "Open PDF" : "Open photo"));
        link.href = signed.signedUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.fontWeight = "700";
        wrap.appendChild(link);
      }

      if (me && (me.id === att.uploader_id || STAFF.includes(role))) {
        wrap.appendChild(btn("Remove file", () => removeFile(att)));
      }
      box.appendChild(wrap);
    });
  }

  async function removeFile(att) {
    if (!confirm("Remove \"" + att.file_name + "\" from this discussion?")) return;
    const { data, error } = await db.from("attachments").delete().eq("id", att.id).select("id");
    if (error) { notice("Could not remove the file: " + error.message, true); return; }
    if (!data || !data.length) { notice("Could not remove the file. You may not have permission.", true); return; }
    await db.storage.from(BUCKET).remove([att.storage_path]);
    notice("File removed.", false);
    reloadSoon();
  }

  async function uploadFiles(threadId, files) {
    if (!files.length) return;

    for (const f of files) {
      if (!ALLOWED.includes(f.type)) { notice("\"" + f.name + "\" is not a PDF, JPG, PNG or WebP file.", true); return; }
      if (f.size > MAX_BYTES) { notice("\"" + f.name + "\" is larger than 10 MB.", true); return; }
    }

    const { count, error: countError } = await db.from("attachments")
      .select("id", { count: "exact", head: true })
      .eq("thread_id", threadId);
    if (countError) { notice("Could not check existing files: " + countError.message, true); return; }
    if (count + files.length > MAX_FILES) {
      notice("A discussion can have at most " + MAX_FILES + " files. It already has " + count + ".", true);
      return;
    }

    let done = 0;
    for (const f of files) {
      const safe = (f.name || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
      const path = threadId + "/" + crypto.randomUUID() + "-" + safe;

      const { error: upError } = await db.storage.from(BUCKET).upload(path, f, { contentType: f.type, upsert: false });
      if (upError) { notice("Could not upload \"" + f.name + "\": " + upError.message, true); continue; }

      const { error: rowError } = await db.from("attachments").insert({
        thread_id: threadId,
        uploader_id: me.id,
        storage_path: path,
        file_name: (f.name || "file").slice(0, 200),
        mime_type: f.type,
        size_bytes: f.size
      });
      if (rowError) {
        await db.storage.from(BUCKET).remove([path]);
        notice("Could not save \"" + f.name + "\": " + rowError.message, true);
        continue;
      }
      done++;
    }

    if (done) {
      notice(done === files.length ? "Files uploaded." : done + " of " + files.length + " files uploaded.", false);
      reloadSoon();
    }
  }

  function pickFile(threadId) {
    const input = el("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ALLOWED.join(",");
    input.addEventListener("change", () => uploadFiles(threadId, Array.from(input.files || [])));
    input.click();
  }

  // ---------- add the features to each discussion ----------

  async function enhance() {
    await loadMe();

    const cards = Array.from(list.querySelectorAll("article.discussion-card")).filter(c => !c.dataset.enhanced);
    if (!cards.length) return;
    cards.forEach(c => { c.dataset.enhanced = "1"; });

    const ids = cards.map(c => c.id.replace(/^post-/, ""));
    const [threadsRes, filesRes] = await Promise.all([
      db.from("threads").select("id, title, body, author_id").in("id", ids),
      db.from("attachments")
        .select("id, thread_id, uploader_id, storage_path, file_name, mime_type, size_bytes")
        .in("thread_id", ids)
        .order("created_at", { ascending: true })
    ]);
    if (threadsRes.error || filesRes.error) {
      notice("Could not load discussion details: " + (threadsRes.error || filesRes.error).message, true);
      return;
    }

    const threadById = new Map(threadsRes.data.map(t => [t.id, t]));
    const filesByThread = new Map();
    filesRes.data.forEach(f => {
      if (!filesByThread.has(f.thread_id)) filesByThread.set(f.thread_id, []);
      filesByThread.get(f.thread_id).push(f);
    });

    cards.forEach(card => {
      const id = card.id.replace(/^post-/, "");
      const t = threadById.get(id);
      if (!t) return;

      const isOwner = !!me && t.author_id === me.id;
      const actions = card.querySelector(".post-actions");

      if (isOwner) actions.appendChild(btn("Edit", () => editPost(t)));
      if (me && !isOwner) actions.appendChild(btn("Report", () => reportPost(id)));
      if (isOwner && LEADER.includes(role)) actions.appendChild(btn("Attach file", () => pickFile(id)));

      const files = filesByThread.get(id) || [];
      const box = el("div", "psir-files");
      card.insertBefore(box, card.querySelector(".reply-area") || null);

      if (!me) {
        if (files.length) box.appendChild(el("p", "muted small", "Log in to see attached files."));
      } else {
        renderFiles(box, files);
      }
    });
  }

  // Run again whenever the page draws new discussions
  let timer = null;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(enhance, 60);
  }).observe(list, { childList: true });

  enhance();
})();
