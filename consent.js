// Sign-up and sign-in gate: Terms of Use and Privacy Policy are accepted separately.
// A photo consent is optional and can be withdrawn later from the profile page.
(function () {
  "use strict";
  if (!window.supabase) return;
  var VERSION = "2026-11-08";
  var db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");

  var style = document.createElement("style");
  style.textContent =
    "#consentGate{position:fixed;inset:0;z-index:20000;background:rgba(16,43,70,.72);display:flex;align-items:center;justify-content:center;padding:16px;}" +
    "#consentGate .cg-box{background:#FFFFFF;color:#263238;max-width:560px;width:100%;max-height:92vh;overflow:auto;border-radius:10px;padding:22px;}" +
    "#consentGate h2{margin:0 0 10px;color:#1E3F82;font-size:1.25rem;}" +
    "#consentGate p{margin:0 0 10px;line-height:1.5;font-size:.95rem;text-align:left;}" +
    "#consentGate a{color:#2855A6;font-weight:700;}" +
    "#consentGate .cg-row{display:flex;gap:10px;align-items:flex-start;margin:10px 0;font-size:.95rem;line-height:1.45;}" +
    "#consentGate .cg-row input{margin-top:4px;}" +
    "#consentGate .cg-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;}" +
    "#consentGate button{min-height:44px;padding:0 16px;border-radius:6px;font:inherit;font-weight:700;cursor:pointer;border:1px solid #2855A6;}" +
    "#consentGate .cg-accept{background:#2855A6;color:#FFFFFF;}" +
    "#consentGate .cg-decline{background:#FFFFFF;color:#2855A6;}" +
    "#consentGate .cg-msg{font-weight:600;color:#B42318;min-height:20px;}";
  document.head.appendChild(style);

  function show(user) {
    if (document.getElementById("consentGate")) return;
    var gate = document.createElement("div");
    gate.id = "consentGate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "cgTitle");
    gate.innerHTML =
      '<div class="cg-box">' +
      '<h2 id="cgTitle">Welcome to PSIR Forum</h2>' +
      '<p>Please read the two documents before you use the forum. They explain how your information is used, what you can and cannot post, and how to ask us about your data.</p>' +
      '<label class="cg-row"><input type="checkbox" id="cgTerms"> <span>I accept the <a href="/info.html?page=terms" target="_blank" rel="noopener noreferrer">Terms of Use</a> (version ' + VERSION + ').</span></label>' +
      '<label class="cg-row"><input type="checkbox" id="cgPrivacy"> <span>I have read the <a href="/info.html?page=privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> (version ' + VERSION + ').</span></label>' +
      '<label class="cg-row"><input type="checkbox" id="cgPhoto"> <span><strong>Optional:</strong> I agree that my profile photo may be shown next to my name in discussions and on my public profile. I can turn this off at any time in my profile.</span></label>' +
      '<p class="cg-msg" id="cgMsg"></p>' +
      '<div class="cg-btns"><button type="button" class="cg-accept" id="cgAccept">Accept and continue</button>' +
      '<button type="button" class="cg-decline" id="cgDecline">Decline and sign out</button></div>' +
      '</div>';
    document.body.appendChild(gate);
    var msg = document.getElementById("cgMsg");
    document.getElementById("cgAccept").addEventListener("click", async function () {
      if (!document.getElementById("cgTerms").checked || !document.getElementById("cgPrivacy").checked) {
        msg.textContent = "Please tick the Terms of Use and the Privacy Policy to continue.";
        return;
      }
      var photo = document.getElementById("cgPhoto").checked;
      var now = new Date().toISOString();
      var r = await db.from("profiles").update({
        terms_version: VERSION, terms_accepted_at: now,
        privacy_version: VERSION, privacy_accepted_at: now,
        photo_consent: photo, photo_consent_at: photo ? now : null
      }).eq("id", user.id).select("id");
      if (r.error || !r.data || !r.data.length) { msg.textContent = "We could not save your choices. Please try again."; return; }
      gate.remove();
    });
    document.getElementById("cgDecline").addEventListener("click", async function () {
      await db.auth.signOut();
      window.location.reload();
    });
  }

  async function check(retry) {
    var s = await db.auth.getSession();
    var user = s.data.session ? s.data.session.user : null;
    if (!user) return;
    var r = await db.from("profiles").select("terms_version, privacy_version").eq("id", user.id).maybeSingle();
    if (r.data && r.data.terms_version === VERSION && r.data.privacy_version === VERSION) return;
    if (!r.data && !retry) { setTimeout(function () { check(true); }, 1500); return; }
    show(user);
  }

  function addNote() {
    var form = document.getElementById("authForm");
    if (!form || document.getElementById("cgNote")) return;
    var p = document.createElement("p");
    p.id = "cgNote";
    p.style.cssText = "margin:10px 0 0;text-align:center;font-size:.82rem;color:#64748B;";
    p.innerHTML = 'By creating an account you agree to our <a href="/info.html?page=terms" target="_blank" rel="noopener noreferrer">Terms of Use</a> and <a href="/info.html?page=privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.';
    form.parentNode.insertBefore(p, form.nextSibling);
  }
  addNote();
  db.auth.onAuthStateChange(function () { setTimeout(function () { check(false); }, 0); });
  check(false);
})();
