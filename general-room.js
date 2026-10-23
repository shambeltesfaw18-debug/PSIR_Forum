(function () {
  "use strict";

  // Academic room for all members. Joining requires login, like the category rooms.
  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const ROOM_URL = "https://kmeet.infomaniak.com/PSIR-academic";

  const discussions = document.getElementById("discussions");
  const layout = discussions && discussions.querySelector(".community-layout");
  if (!discussions || !layout || !layout.parentNode || !window.supabase) return;

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const panel = document.createElement("section");
  panel.id = "psirAcademicRoom";
  panel.className = "side-card";
  panel.setAttribute("aria-labelledby", "psirAcademicRoomTitle");

  const title = document.createElement("h3");
  title.id = "psirAcademicRoomTitle";
  title.textContent = "Academic live room";

  const info = document.createElement("p");
  info.className = "small muted";

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px;";

  const frameBox = document.createElement("div");

  panel.append(title, info, actions, frameBox);
  layout.parentNode.insertBefore(panel, layout);

  let isOpen = false;

  function makeButton(label, onClick, secondary) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = secondary ? "btn btn-outline" : "btn btn-primary";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function closeCall() {
    frameBox.textContent = "";
    isOpen = false;
  }

  function openCall() {
    frameBox.textContent = "";
    const frame = document.createElement("iframe");
    frame.src = ROOM_URL;
    frame.title = "PSIR academic live room";
    frame.allow = "camera; microphone; fullscreen; display-capture; autoplay";
    frame.style.cssText = "width:100%;height:70vh;min-height:420px;border:0;border-radius:12px;margin-top:12px;background:#000;";
    frameBox.appendChild(frame);
    isOpen = true;
    render(true);
  }

  function render(loggedIn) {
    actions.textContent = "";

    if (!loggedIn) {
      info.textContent = "Log in to join the academic live room.";
      return;
    }

    if (isOpen) {
      info.textContent = "You are in the academic live room.";
      actions.append(
        makeButton("Leave room", () => { closeCall(); render(true); }, true)
      );
    } else {
      info.textContent = "Join the video and audio room for all members. Your microphone and camera start off.";
      actions.append(makeButton("Join academic room", openCall));
    }

    const link = document.createElement("a");
    link.href = ROOM_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open in a new tab";
    link.style.cssText = "color:#1f6f78;font-weight:600;";
    actions.append(link);
  }

  async function check() {
    try {
      const { data } = await db.auth.getSession();
      const loggedIn = !!(data && data.session);
      if (!loggedIn && isOpen) closeCall();
      render(loggedIn);
    } catch (err) {
      console.error("PSIR academic room error:", err);
      info.textContent = "The academic live room could not load.";
      actions.textContent = "";
    }
  }

  db.auth.onAuthStateChange(() => setTimeout(check, 0));
  check();
})();
