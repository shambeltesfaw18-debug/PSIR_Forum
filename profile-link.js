(function () {
  "use strict";
  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";

  const nav = document.getElementById("navLinks");
  if (!nav || !window.supabase) return;

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  async function update(session) {
    let link = document.getElementById("psirProfileLink");
    if (!session) {
      if (link) link.remove();
      return;
    }
    if (!link) {
      link = document.createElement("a");
      link.id = "psirProfileLink";
      link.href = "profile.html";
      link.textContent = "My profile";
      nav.appendChild(link);
    }
  }

  db.auth.onAuthStateChange((event, session) => update(session));
  db.auth.getSession().then(({ data }) => update(data.session));
})();