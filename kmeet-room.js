(function () {
  "use strict";

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const KMEET_BASE = "https://kmeet.infomaniak.com/PSIR-";

  const heading = document.getElementById("discussionHeading");
  const discussions = document.getElementById("discussions");

  if (!heading || !discussions) {
    console.warn("PSIR live room: discussion section not found.");
    return;
  }
  if (!window.supabase) {
    console.warn("PSIR live room: Supabase did not load.");
    return;
  }

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // ---------- panel ----------
  const panel = document.createElement("section");
  panel.id = "psirRoom";
  panel.style.cssText = "display:none;margin:0 0 22px;padding:18px;border:1px solid #e2e8ef;border-radius:16px;background:#fff;";

  const title = document.createElement("h3");
  title.textContent = "Live room";
  title.style.cssText = "margin:0 0 6px;color:#102b46;";

  const info = document.createElement("p");
  info.style.cssText = "margin:0 0 12px;color:#64748b;";

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;align-items:center;";

  const frameBox = document.createElement("div");

  panel.append(title, info, actions, frameBox);

  // Place the panel above the discussion feed
  const layout = discussions.querySelector(".community-layout");
  if (layout && layout.parentNode) {
    layout.parentNode.insertBefore(panel, layout);
  } else {
    discussions.appendChild(panel);
  }

  // ---------- state ----------
  let currentSlug = null;     // category the room belongs to
  let currentName = null;
  let isOpen = false;         // whether the call is showing
  let lastKey = null;
  let checking = false;
  let runId = 0;

  function slugify(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function makeButton(label, onClick, secondary) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText =
      "padding:10px 16px;border-radius:999px;border:none;font-size:15px;font-weight:600;cursor:pointer;" +
      (secondary ? "background:#e7eaf0;color:#102b46;" : "background:#102b46;color:#fff;");
    b.addEventListener("click", onClick);
    return b;
  }

  function setInfo(text) {
    info.textContent = text;
  }

  function closeCall() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    frameBox.innerHTML = "";
    isOpen = false;
  }

  function openCall() {
    if (!currentSlug) return;
    frameBox.innerHTML = "";

    const frame = document.createElement("iframe");
    frame.src = KMEET_BASE + currentSlug;
    frame.title = "PSIR live room";
    frame.allow = "camera; microphone; fullscreen; display-capture; autoplay";
    frame.style.cssText =
      "width:100%;height:70vh;min-height:420px;border:0;border-radius:12px;margin-top:12px;background:#000;";
    frameBox.appendChild(frame);

    isOpen = true;
    render(true);
  }

  function toggleFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    const target = frameBox;
    const request = target.requestFullscreen || target.webkitRequestFullscreen;
    if (request) {
      request.call(target).catch(() => {});
    }
  }

  // Draws the buttons for the current state
  function render(loggedIn) {
    actions.innerHTML = "";

    if (!currentSlug) {
      panel.style.display = "none";
      return;
    }

    panel.style.display = "block";

    if (!loggedIn) {
      setInfo("Log in to join the live room for " + currentName + ".");
      return;
    }

    if (isOpen) {
      setInfo("You are in the live room for " + currentName + ".");
      actions.append(
        makeButton("Full screen", toggleFullScreen),
        makeButton("Leave room", () => { closeCall(); render(true); }, true)
      );
    } else {
      setInfo("Join the video and audio room for " + currentName + ". Your microphone and camera start off.");
      actions.append(makeButton("Join live room", openCall));
    }

    const link = document.createElement("a");
    link.href = KMEET_BASE + currentSlug;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open in a new tab";
    link.style.cssText = "color:#1f6f78;font-weight:600;";
    actions.append(link);
  }

  // Finds the category from the web address first, then from the heading
  async function findCategory() {
    const { data, error } = await db.from("categories").select("name, slug");
    if (error) throw error;

    const match = location.pathname.replace(/\/+$/, "").match(/^\/categories\/([a-z0-9-]+)$/);
    let found = match ? data.find(c => slugify(c.name) === match[1]) : null;

    if (!found) {
      const headingText = heading.textContent.trim();
      found = data.find(c => c.name === headingText) || null;
    }
    return found;
  }

  async function check() {
    if (checking) return;
    checking = true;
    const myRun = ++runId;

    try {
      const { data: sessionData } = await db.auth.getSession();
      const loggedIn = !!(sessionData && sessionData.session);

      const found = await findCategory();
      if (myRun !== runId) return;

      const newSlug = found ? found.slug : null;
      const newName = found ? found.name : null;

      // Close the call only if the category changed or the user logged out
      if (isOpen && (newSlug !== currentSlug || !loggedIn)) {
        closeCall();
      }

      currentSlug = newSlug;
      currentName = newName;
      render(loggedIn);
    } catch (err) {
      console.error("PSIR live room error:", err);
      panel.style.display = "block";
      setInfo("The live room could not load: " + (err.message || "unknown error"));
      actions.innerHTML = "";
    } finally {
      checking = false;
    }
  }

  // Check when the page or category heading changes
  setInterval(() => {
    const key = location.pathname + "|" + heading.textContent.trim();
    if (key !== lastKey) {
      lastKey = key;
      check();
    }
  }, 1000);

  db.auth.onAuthStateChange(() => {
    setTimeout(check, 0);
  });

  check();
})();