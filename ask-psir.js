// "Ask PSIR" button and panel for signed-in members. Questions go to the server function /api/ask.
(function () {
  "use strict";
  if (!window.supabase) return;
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");
  var btn = document.createElement("button");
  btn.type = "button";
  btn.id = "psirAskBtn";
  btn.textContent = "Ask PSIR";
  btn.setAttribute("aria-label", "Ask the PSIR Forum assistant");
  btn.style.cssText = "position:fixed;left:16px;bottom:82px;z-index:9000;height:44px;padding:0 14px;border-radius:999px;border:1px solid #E6B75A;background:#1E3F82;color:#fff;font:700 .9rem system-ui,sans-serif;box-shadow:0 8px 18px rgba(10,30,70,.3);cursor:pointer;display:none;";
  var panel = document.createElement("section");
  panel.id = "psirAskPanel";
  panel.setAttribute("aria-label", "PSIR Forum assistant");
  panel.style.cssText = "position:fixed;left:12px;bottom:136px;z-index:9001;width:min(380px,calc(100% - 24px));height:min(560px,72vh);display:none;flex-direction:column;overflow:hidden;background:#fff;color:#263238;border:1px solid #DCE3EE;border-radius:14px;box-shadow:0 16px 36px rgba(10,30,70,.28);padding:12px;box-sizing:border-box;";
  panel.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">' +
    '<strong style="color:#1E3F82;">Ask PSIR</strong>' +
    '<button type="button" id="psirAskClose" aria-label="Close" style="border:1px solid #CBD5E1;background:#fff;border-radius:8px;padding:4px 10px;cursor:pointer;">Close</button></div>' +
    '<p style="margin:0 0 8px;font-size:.78rem;color:#64748B;">AI assistant. It can make mistakes. Do not type personal details.</p>' +
    '<div id="psirAskOut" style="overflow:auto;flex:1 1 0;min-height:0;font-size:.92rem;line-height:1.5;white-space:pre-wrap;"></div>' +
    '<form id="psirAskForm" style="display:flex;gap:8px;margin-top:8px;">' +
    '<input id="psirAskQ" maxlength="500" placeholder="Ask about the forum" style="flex:1;min-height:40px;border:1px solid #CBD5E1;border-radius:8px;padding:8px;font:inherit;">' +
    '<button type="submit" id="psirAskSend" style="min-height:40px;padding:0 14px;border:0;border-radius:8px;background:#2855A6;color:#fff;font-weight:700;cursor:pointer;">Send</button></form>';
  document.body.appendChild(btn);
  document.body.appendChild(panel);

  // Common questions: answers are ready in advance, so they open at once and do not use a daily question.
  var QA = [
    { q: "How do I join the forum?", a: "Click \"Join forum\" at the top of the home page. Sign up with your email or Google account. Then accept the Terms of Use and confirm you have read the Privacy Policy. After that you can use the forum." },
    { q: "How do I take an exam?", a: "Open the Exams page from the menu or the Explore row. Choose an exam and tap \"Start exam\". Answer one question per page, and use Previous and Next to move between them. Tap the flag icon to mark a question to come back to. When you finish, tap \"Submit exam\". You get three attempts per exam each day. After submitting, you see your score, and each question shows your answer, the correct answer and, where included, an explanation." },
    { q: "How do I send a message?", a: "Open a member's profile and tap \"Send message\". You and the other member both need a completed profile (name, and university or institution). Type your message, or attach a photo, short video or PDF up to 10 MB. To open your messages later, tap the blue chat button at the bottom left." },
    { q: "How do I submit research?", a: "Open the Research Hub and tap \"Submit Research\". Fill in the form, or paste a link to fill in some details, and attach your PDF. A moderator checks it before it is published. This is editorial checking, not formal peer review. You can follow its status under \"My submissions\"." },
    { q: "How do I share a book or material?", a: "Open Books and Materials, tap \"Share a material\", and add a link or upload a PDF up to 10 MB. Only share material you own or are allowed to share. A moderator checks it first. You can also upload a thumbnail image." },
    { q: "How do I delete my account?", a: "Open your profile, go to \"Your privacy\", write an optional note, and tap \"Request account deletion\". A moderator confirms when it is done. You can also email psirforum@gmail.com." }
  ];
  var chips = document.createElement("div");
  chips.style.cssText = "display:flex;flex-wrap:nowrap;gap:6px;margin-bottom:8px;overflow-x:auto;flex:0 0 auto;padding-bottom:4px;";
  QA.forEach(function (item) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = item.q;
    b.style.cssText = "border:1px solid #CBD5E1;background:#F5F9FF;color:#1E3F82;border-radius:999px;padding:6px 10px;font:600 .8rem system-ui,sans-serif;cursor:pointer;text-align:left;white-space:nowrap;flex:0 0 auto;";
    b.addEventListener("click", function () {
      document.getElementById("psirAskQ").value = "";
      document.getElementById("psirAskOut").textContent = item.a;
    });
    chips.appendChild(b);
  });
  panel.insertBefore(chips, panel.children[1]);

  function out(text) { document.getElementById("psirAskOut").textContent = text; }

  btn.addEventListener("click", function () {
    panel.style.display = panel.style.display === "flex" ? "none" : "flex";
    if (panel.style.display === "flex") document.getElementById("psirAskQ").focus();
  });
  document.getElementById("psirAskClose").addEventListener("click", function () { panel.style.display = "none"; });

  document.getElementById("psirAskForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var q = document.getElementById("psirAskQ").value.trim();
    if (q.length < 3) return out("Please type a question.");
    var s = await db.auth.getSession();
    if (!s.data.session) return out("Please sign in to use the assistant.");
    var sendBtn = document.getElementById("psirAskSend");
    sendBtn.disabled = true;
    out("Thinking…");
    try {
      var r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + s.data.session.access_token },
        body: JSON.stringify({ question: q })
      });
      var data = await r.json().catch(function () { return {}; });
      out(r.ok ? data.answer : ((data.error || "Could not get an answer.") + (data.detail ? "\n\nDetail: " + data.detail : "")));
    } catch (err) {
      out("Could not reach the assistant. Please check your connection and try again.");
    }
    sendBtn.disabled = false;
  });

  function refresh() {
    db.auth.getSession().then(function (s) { btn.style.display = s.data.session ? "block" : "none"; });
  }
  db.auth.onAuthStateChange(function () { setTimeout(refresh, 0); });
  refresh();
})();
