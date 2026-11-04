// Terms and privacy acceptance for signed-in members.
// Anyone who has not accepted the current version sees a short summary and must accept or sign out.
(function () {
  "use strict";
  if (!window.supabase) return;
  const VERSION = "2026-11-04";
  const db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");

  const style = document.createElement("style");
  style.textContent = "#consentGate{position:fixed;inset:0;z-index:20000;background:rgba(16,43,70,.72);display:flex;align-items:center;justify-content:center;padding:16px;}" +
    "#consentGate .cg-box{background:#FFFFFF;color:#263238;max-width:560px;width:100%;max-height:92vh;overflow:auto;border-radius:10px;padding:22px;font-family:inherit;}" +
    "#consentGate h2{margin:0 0 10px;color:#1E3F82;font-size:1.25rem;}" +
    "#consentGate p{margin:0 0 10px;line-height:1.5;font-size:.95rem;text-align:left;}" +
    "#consentGate a{color:#2855A6;font-weight:700;}" +
    "#consentGate .cg-row{display:flex;gap:10px;align-items:flex-start;margin:14px 0;font-size:.95rem;}" +
    "#consentGate .cg-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;}" +
    "#consentGate button{min-height:44px;padding:0 16px;border-radius:6px;font:inherit;font-weight:700;cursor:pointer;border:1px solid #2855A6;}" +
    "#consentGate .cg-accept{background:#2855A6;color:#FFFFFF;}" +
    "#consentGate .cg-decline{background:#FFFFFF;color:#2855A6;}" +
    "#consentGate .cg-msg{font-weight:600;color:#B42318;min-height:20px;}";
  document.head.appendChild(style);

  function show(user) {
    if (document.getElementById("consentGate")) return;
    const gate = document.createElement("div");
    gate.id = "consentGate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "cgTitle");
    gate.innerHTML =
      '<div class="cg-box">' +
      '<h2 id="cgTitle">Terms of Use and Privacy Policy</h2>' +
      '<p>Welcome to PSIR Forum. Before you use the forum, please read the key points below. The full texts are available on the links.</p>' +
      '<p><strong>Your account.</strong> You are responsible for the content you post and for keeping your sign-in safe. You must be 18 or older, or have permission from a parent or guardian.</p>' +
      '<p><strong>Your conduct.</strong> Be respectful. Do not post harmful, false or unlawful content, do not impersonate others, and do not present paid promotion as independent information.</p>' +
      '<p><strong>Your information.</strong> We keep the information you give us, such as your name, email, profile, posts, submissions and reports. We use it to run the forum, moderate content, send notifications and keep the platform secure. We do not sell it. Backups are encrypted.</p>' +
      '<p><strong>Moderation.</strong> Submissions are checked by moderators. This is editorial checking, not peer review.</p>' +
      '<p>Read the <a href="/info.html?page=terms" target="_blank" rel="noopener noreferrer">Terms of Use</a> and the <a href="/info.html?page=privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>' +
      '<label class="cg-row"><input type="checkbox" id="cgAgree"> <span>I have read and agree to the Terms of Use and the Privacy Policy (version ' + VERSION + ').</span></label>' +
      '<p class="cg-msg" id="cgMsg"></p>' +
      '<div class="cg-btns"><button type="button" class="cg-accept" id="cgAccept">Accept and continue</button>' +
      '<button type="button" class="cg-decline" id="cgDecline">Decline and sign out</button></div>' +
      '</div>';
    document.body.appendChild(gate);

    const msg = document.getElementById("cgMsg");
    document.getElementById("cgAccept").addEventListener("click", async () => {
      if (!document.getElementById("cgAgree").checked) { msg.textContent = "Please tick the box to agree before you continue."; return; }
      const { data, error } = await db.from("profiles")
        .update({ terms_version: VERSION, terms_accepted_at: new Date().toISOString() })
        .eq("id", user.id).select("id");
      if (error || !data || !data.length) { msg.textContent = "We could not save your agreement. Please try again."; return; }
      gate.remove();
    });
    document.getElementById("cgDecline").addEventListener("click", async () => {
      await db.auth.signOut();
      window.location.reload();
    });
  }

  async function check(retry) {
    const { data: sess } = await db.auth.getSession();
    const user = sess && sess.session ? sess.session.user : null;
    if (!user) return;
    const { data: prof } = await db.from("profiles").select("terms_version").eq("id", user.id).maybeSingle();
    if (prof && prof.terms_version === VERSION) return;
    if (!prof && !retry) { setTimeout(() => check(true), 1500); return; }
    show(user);
  }

  // A note under the sign-up form, linking to the two documents
  function addNote() {
    const form = document.getElementById("authForm");
    if (!form || document.getElementById("cgNote")) return;
    const p = document.createElement("p");
    p.id = "cgNote";
    p.style.cssText = "margin:10px 0 0;text-align:center;font-size:.82rem;color:#64748B;";
    p.innerHTML = 'By creating an account you agree to our <a href="/info.html?page=terms" target="_blank" rel="noopener noreferrer">Terms of Use</a> and <a href="/info.html?page=privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.';
    form.parentNode.insertBefore(p, form.nextSibling);
  }

  addNote();
  db.auth.onAuthStateChange(() => setTimeout(() => check(false), 0));
  check(false);
})();
