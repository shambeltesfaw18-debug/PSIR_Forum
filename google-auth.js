// Adds "Continue with Google" to the sign-in and sign-up window.
// Google accounts are created by Supabase Auth, so they get the same member profile as other sign-ups.
(function () {
  "use strict";
  if (!window.supabase) return;
  const client = window.supabase.createClient(
    "https://updxillknwufqekfzkur.supabase.co",
    "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5"
  );

  function addButton() {
    const form = document.getElementById("authForm");
    if (!form || document.getElementById("googleAuthBtn")) return;

    const wrap = document.createElement("div");
    wrap.style.cssText = "margin:0 0 6px;";

    const btn = document.createElement("button");
    btn.id = "googleAuthBtn";
    btn.type = "button";
    btn.style.cssText = "width:100%;min-height:46px;display:flex;align-items:center;justify-content:center;gap:10px;border:1px solid #CBD5E1;border-radius:6px;background:#FFFFFF;color:#263238;font:inherit;font-weight:700;cursor:pointer;";
    btn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">' +
      '<path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.5 17.7 9.5 24 9.5z"/>' +
      '<path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z"/>' +
      '<path fill="#FBBC05" d="M10.4 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.2.8-4.6l-7.8-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.8-6.1z"/>' +
      '<path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.7-4-13.6-9.6l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/>' +
      "</svg><span>Continue with Google</span>";

    const note = document.createElement("p");
    note.textContent = "Sign up or sign in with your Google account. No password is needed.";
    note.style.cssText = "margin:8px 0 0;text-align:center;font-size:.85rem;color:#64748B;";

    const divider = document.createElement("p");
    divider.textContent = "or use your email";
    divider.style.cssText = "margin:14px 0 6px;text-align:center;font-size:.85rem;color:#64748B;";

    wrap.append(btn, note, divider);
    form.parentNode.insertBefore(wrap, form);

    btn.addEventListener("click", async () => {
      btn.disabled = true;
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/" }
      });
      if (error) {
        btn.disabled = false;
        alert("Google sign-in could not start. Please try again. " + error.message);
      }
    });
  }

  addButton();
})();
