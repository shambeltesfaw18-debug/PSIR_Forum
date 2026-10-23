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
  let categoryKey = null;
  let isOpen = false;
  let frame = null;

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

  async function resolveCategory() {
    const name = heading.textContent.trim();
    if (name === categoryKey) return;
    categoryKey = name;
    slug = null;
    if (!name || name === "Community discussions" || name === "My bookmarked discussions") return;
    const { data } = await db.from("categories").select("slug").eq("name", name).maybeSingle();
    slug = data ? data.slug : null;
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
    const target = frameBox;
    const request = target.requestFullscreen || target.webkitRequestFullscreen;
    if (request) {
      request.call(target).catch(() => {});
    } else {
      // Browsers that don't support full screen still get a taller room
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
  let refreshing = false;
  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    try {
      await loadUser();
      await resolveCategory();
      if (isOpen && (!me || !slug)) closeRoom();
      render();
    } finally {
      refreshing = false;
    }
  }

  let timer = null;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(refresh, 300);
  }).observe(heading, { childList: true, characterData: true, subtree: true });

  db.auth.onAuthStateChange(() => setTimeout(refresh, 0));
  refresh();
})();