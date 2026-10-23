(function () {
  "use strict";

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";

  const anchor = document.getElementById("audio");
  const heading = document.getElementById("discussionHeading");
  if (!anchor || !heading || !window.supabase) return;

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // ---------- panel ----------
  const panel = document.createElement("section");
  panel.id = "psirRoom";
  panel.style.cssText = "margin-top:16px;padding:16px;border:1px solid #e2e8ef;border-radius:14px;background:#fff;display:none;";

  const title = document.createElement("h3");
  title.textContent = "Live room";
  title.style.margin = "0 0 6px";

  const desc = document.createElement("p");
  desc.style.cssText = "margin:0 0 10px;color:#5b6573;";

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;align-items:center;";

  const frameBox = document.createElement("div");
  frameBox.id = "psirRoomFrame";

  panel.append(title, desc, actions, frameBox);
  anchor.insertAdjacentElement("afterend", panel);

  // ---------- state ----------
  let me = null;
  let slug = null;
  let isOpen = false;
  let frame = null;
  let lastKey = null;
  let busy = false;

  // Same rule as the category links: "Peace & Security" -> "peace-and-security"
  function slugify(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function button(label, onClick, secondary) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText = "padding:10px 14px;border-radius:999px;border:none;font-size:15px;font-weight:600;cursor:pointer;" +
      (secondary ? "background:#e7eaf0;color:#1b2a41;" : "background:#1b2a41;color:#fff;");
    b.addEventListener("click", onClick);
    return b;
  }

  async function loadUser() {
    const { data } = await db.auth.getSession();
    me = data.session ? data.session.user : null;
  }

  // Finds the category from the web address first, then from the heading text
  async function resolveCategory() {
    const { data: cats, error } = await db.from("categories").select("name, slug");
    if (error || !cats) { slug = null; return; }

    const match = location.pathname.replace(/\/+$/, "").match(/^\/categories\/([a-z0-9-]+)$/);
    let found = match ? cats.find(c => slugify(c.name) === match[1]) : null;

    if (!found) {
      const name = heading.textContent.trim();
      found = cats.find(c => c.name === name) || null;
    }
    slug = found ? found.slug : null;
  }

  function closeRoom() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    frameBox.innerHTML = "";
    frame = null;
    isOpen = false;
  }

  function toggleFullScreen() {
    if (!frame) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    const request = frameBox.requestFullscreen || frameBox.webkitRequestFullscreen;
    if (request) {
      request.call(frameBox).catch(() => {});
    } else {
      frame.style.height = "80vh";
    }
  }

  function openRoom(url) {
    frameBox.innerHTML = "";
    frame = document.createElement("iframe");
    frame.src = url;
    frame.title = "Live room";
    frame.allow = "camera; microphone; fullscreen; display-capture; autoplay";
    frame.style.cssText = "width:100%;height:70vh;min-height:420px;border:0;border-radius:12px;margin-top:12px;background:#000;";
    frameBox.appendChild(frame);
    isOpen = true;
    render();
  }

  function render() {
    actions.innerHTML = "";

    if (!slug) {
      panel.style.display = "none";
      return;
    }
    panel.style.display = "block";

    const url = "https://kmeet.infomaniak.com/PSIR-" + slug;

    if (!me) {
      desc.textContent = "Log in to join the live room for this category.";
      return;
    }

    desc.textContent = "Join the video and audio room for this category. You can turn your microphone and camera on or off inside the room.";

    if (isOpen) {
      actions.append(
        button("Full screen", toggleFullScreen),
        button("Leave room", () => { closeRoom(); render(); }, true)
      );
    } else {
      actions.append(button("Join live room", () => openRoom(url)));
    }

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open in a new tab";
    link.style.cssText = "color:#1f6f78;font-weight:600;";
    actions.append(link);
  }

  // ---------- keep the panel up to date ----------
  async function refresh() {
    if (busy) return;
    busy = true;
    try {
      const previousSlug = slug;
      await loadUser();
      await resolveCategory();

      // Close the call only when the category changed or the user logged out
      if (isOpen && (!me || slug !== previousSlug)) closeRoom();
      render();
    } finally {
      busy = false;
    }
  }

  // Check every second whether the address or the heading changed
  setInterval(() => {
    const key = location.pathname + "|" + heading.textContent.trim();
    if (key !== lastKey) {
      lastKey = key;
      refresh();
    }
  }, 1000);

  db.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT" && isOpen) closeRoom();
    setTimeout(refresh, 0);
  });

  refresh();
})();