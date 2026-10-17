(function () {
  "use strict";

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const LEADER = ["admin", "moderator", "scholar"];

  const audioCard = document.getElementById("audio");
  const heading = document.getElementById("discussionHeading");
  if (!audioCard || !heading || !window.supabase) return;

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // ---------- panel ----------
  const panel = document.createElement("section");
  panel.id = "psirAudio";
  panel.style.cssText = "margin-top:16px;padding:16px;border:1px solid #e2e8ef;border-radius:14px;background:#fff;display:none;";

  const title = document.createElement("h3");
  title.textContent = "Live audio session";
  title.style.margin = "0 0 6px";

  const statusEl = document.createElement("p");
  statusEl.style.cssText = "margin:0 0 10px;color:#5b6573;";

  const actionsEl = document.createElement("div");
  actionsEl.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;";

  const msgEl = document.createElement("p");
  msgEl.setAttribute("role", "status");
  msgEl.style.cssText = "margin:10px 0 0;font-weight:600;";

  const soundBox = document.createElement("div");
  soundBox.style.display = "none";

  panel.append(title, statusEl, actionsEl, msgEl, soundBox);
  audioCard.insertAdjacentElement("afterend", panel);

  // ---------- state ----------
  let me = null;
  let role = "student";
  let category = null;
  let categoryKey = null;
  let session = null;
  let meeting = null;
  let micOn = false;
  let participantCount = 0;

  function setMsg(text, bad) {
    msgEl.textContent = text;
    msgEl.style.color = bad ? "#a3172b" : "#1b5e20";
  }

  function button(label, onClick, secondary) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.style.cssText = "padding:10px 14px;border-radius:8px;border:none;font-size:15px;cursor:pointer;" +
      (secondary ? "background:#e7eaf0;color:#1b2a41;" : "background:#1b2a41;color:#fff;");
    b.addEventListener("click", onClick);
    return b;
  }

  async function loadUser() {
    const { data } = await db.auth.getSession();
    me = data.session ? data.session.user : null;
    role = "student";
    if (me) {
      const { data: profile } = await db.from("profiles").select("role").eq("id", me.id).maybeSingle();
      if (profile) role = profile.role;
    }
  }

  async function resolveCategory() {
    const name = heading.textContent.trim();
    if (name === categoryKey) return;
    categoryKey = name;
    category = null;
    if (!name || name === "Community discussions" || name === "My bookmarked discussions") return;
    const { data } = await db.from("categories").select("id, name").eq("name", name).maybeSingle();
    category = data || null;
  }

  async function callApi(payload) {
    const { data } = await db.auth.getSession();
    if (!data.session) throw new Error("Please log in first.");
    const res = await fetch("/api/videosdk-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + data.session.access_token
      },
      body: JSON.stringify(payload)
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || "Request failed (" + res.status + ")");
    return out;
  }

  // ---------- refresh the panel ----------
  let refreshing = false;
  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    try {
      await loadUser();
      const previousId = category ? category.id : null;
      await resolveCategory();

      // Leave the call if the member moves to a different category or logs out
      if (meeting && (!me || !category || category.id !== previousId)) {
        await leaveMeeting();
      }

      if (!category) {
        panel.style.display = "none";
        return;
      }
      panel.style.display = "block";

      const { data } = await db.from("audio_sessions")
        .select("id, room_id, host_id, title")
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);
      session = data && data.length ? data[0] : null;
      render();
    } catch (err) {
      setMsg("Could not load the audio session: " + err.message, true);
    } finally {
      refreshing = false;
    }
  }

  function render() {
    actionsEl.innerHTML = "";

    if (!me) {
      statusEl.textContent = "Log in to join live audio sessions.";
      return;
    }

    if (meeting) {
      statusEl.textContent = "You are in the live session. Participants: " + participantCount + ".";
      actionsEl.append(button(micOn ? "Mute" : "Turn on mic", toggleMic));
      actionsEl.append(button("Leave", leaveMeeting, true));
      if (session && (session.host_id === me.id || role === "admin" || role === "moderator")) {
        actionsEl.append(button("End session for everyone", endSession, true));
      }
      return;
    }

    if (session) {
      statusEl.textContent = "A live session is running. Join to listen. Your microphone starts off.";
      actionsEl.append(button("Join session", joinSession));
    } else {
      statusEl.textContent = "No live session right now.";
      if (LEADER.includes(role)) {
        actionsEl.append(button("Start session", startSession));
      }
    }
  }

  // ---------- starting, joining, leaving ----------
  async function startSession() {
    setMsg("Starting the session...");
    try {
      const made = await callApi({ action: "create" });
      const { error } = await db.from("audio_sessions").insert({
        category_id: category.id,
        room_id: made.roomId,
        host_id: me.id,
        title: "Live discussion"
      });
      if (error) throw new Error("Could not save the session: " + error.message);
      await joinMeeting(made.roomId, made.token);
      setMsg("Session started. Tell members to tap Join session.");
      await refresh();
    } catch (err) {
      setMsg(err.message, true);
    }
  }

  async function joinSession() {
    setMsg("Connecting...");
    try {
      const joined = await callApi({ action: "join", roomId: session.room_id });
      await joinMeeting(joined.roomId, joined.token);
      setMsg("You joined. Your microphone is off.");
    } catch (err) {
      setMsg(err.message, true);
    }
  }

  async function joinMeeting(roomId, token) {
    if (!window.VideoSDK) throw new Error("The audio service did not load. Refresh the page.");
    if (meeting) await leaveMeeting();

    VideoSDK.config(token);
    const name = (me.user_metadata && me.user_metadata.full_name) || "Member";
    meeting = VideoSDK.initMeeting({
      meetingId: roomId,
      name: name,
      micEnabled: false,
      webcamEnabled: false
    });
    micOn = false;
    participantCount = 0;

    meeting.on("meeting-joined", () => {
      updateCount();
      render();
    });
    meeting.on("meeting-left", () => {
      cleanupSound();
      meeting = null;
      micOn = false;
      render();
    });
    meeting.on("participant-joined", p => {
      attachParticipant(p);
      updateCount();
      render();
    });
    meeting.on("participant-left", () => {
      updateCount();
      render();
    });

    await meeting.join();
    if (meeting && meeting.participants) {
      Array.from(meeting.participants.values()).forEach(attachParticipant);
    }
    updateCount();
    render();
  }

  function updateCount() {
    participantCount = meeting && meeting.participants ? meeting.participants.size + 1 : 1;
  }

  // Plays each other participant's sound
  function attachParticipant(p) {
    p.on("stream-enabled", stream => {
      if (stream.kind !== "audio") return;
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audio.dataset.pid = p.id;
      audio.srcObject = new MediaStream([stream.track]);
      soundBox.appendChild(audio);
      audio.play().catch(() => {});
    });
    p.on("stream-disabled", stream => {
      if (stream.kind !== "audio") return;
      soundBox.querySelectorAll('audio[data-pid="' + p.id + '"]').forEach(a => a.remove());
    });
  }

  function cleanupSound() {
    soundBox.innerHTML = "";
  }

  async function toggleMic() {
    if (!meeting) return;
    try {
      if (micOn) {
        meeting.muteMic();
        micOn = false;
        setMsg("Your microphone is off.");
      } else {
        meeting.unmuteMic();
        micOn = true;
        setMsg("Your microphone is on.");
      }
      render();
    } catch (err) {
      setMsg("Could not change the microphone. Allow microphone access and try again.", true);
    }
  }

  async function leaveMeeting() {
    if (meeting) {
      try { meeting.leave(); } catch (e) { /* already closed */ }
    }
    meeting = null;
    micOn = false;
    cleanupSound();
  }

  async function endSession() {
    if (!confirm("End this live session for everyone?")) return;
    try {
      if (meeting) meeting.end();
      meeting = null;
      cleanupSound();
      const { error } = await db.from("audio_sessions").update({ is_active: false }).eq("id", session.id);
      if (error) throw new Error(error.message);
      setMsg("Session ended.");
      await refresh();
    } catch (err) {
      setMsg("Could not end the session: " + err.message, true);
    }
  }

  // ---------- keep the panel up to date ----------
  let timer = null;
  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(refresh, 300);
  }).observe(heading, { childList: true, characterData: true, subtree: true });

  db.auth.onAuthStateChange(() => setTimeout(refresh, 0));
  setInterval(refresh, 15000);
  refresh();
})();
