// Adds an Admin (gold) or Moderator (blue) badge, and the profile photo, next to member names.
// Roles and photos are public profile details; members cannot change their own role.
(function () {
  "use strict";
  if (!window.supabase) return;
  const db = window.supabase.createClient("https://updxillknwufqekfzkur.supabase.co", "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5");

  function tagFor(role) {
    if (role === "admin") return '<span class="psir-badge psir-badge-admin">Admin</span>';
    if (role === "moderator") return '<span class="psir-badge psir-badge-mod">Moderator</span>';
    return "";
  }

  async function decorate() {
    const links = Array.from(document.querySelectorAll('a[href*="public-profile.html?id="]'))
      .filter(a => !a.dataset.psirBadge);
    if (!links.length) return;
    const idOf = a => new URL(a.href, location.href).searchParams.get("id");
    const ids = [...new Set(links.map(idOf).filter(Boolean))];
    const { data, error } = await db.from("profiles").select("id, role, avatar_url").in("id", ids);
    if (error || !data) return;
    const people = new Map(data.map(p => [p.id, p]));
    links.forEach(a => {
      a.dataset.psirBadge = "1";
      const p = people.get(idOf(a));
      if (!p) return;
      if (p.avatar_url && !a.querySelector("img")) {
        const img = document.createElement("img");
        img.src = p.avatar_url;
        img.alt = "";
        img.width = 24;
        img.height = 24;
        img.className = "psir-avatar";
        a.insertBefore(img, a.firstChild);
      }
      const tag = tagFor(p.role);
      if (tag) a.insertAdjacentHTML("afterend", tag);
    });
  }

  let timer = null;
  const later = () => { clearTimeout(timer); timer = setTimeout(decorate, 150); };
  new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
  decorate();
})();
