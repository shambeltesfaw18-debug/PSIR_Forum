(function () {
  "use strict";

  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";

  const anchor = document.querySelector(".community-layout");
  if (!anchor || !window.supabase) return;

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const bar = document.createElement("div");
  bar.id = "psirStats";
  bar.setAttribute("aria-label", "Community statistics");
  bar.style.cssText = "display:flex;flex-wrap:wrap;gap:12px;margin:0 0 18px;";
  anchor.parentNode.insertBefore(bar, anchor);

  function statBox(value, label) {
    const box = document.createElement("div");
    box.style.cssText = "flex:1 1 140px;background:#fff;border:1px solid #e2e8ef;border-radius:12px;padding:12px 14px;";
    const number = document.createElement("strong");
    number.style.cssText = "display:block;font-size:22px;color:#1b2a41;";
    number.textContent = value;
    const text = document.createElement("span");
    text.style.cssText = "font-size:13px;color:#5b6573;";
    text.textContent = label;
    box.append(number, text);
    return box;
  }

  async function load() {
    const [members, discussions, categories] = await Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("threads").select("id", { count: "exact", head: true }).eq("is_hidden", false),
      db.from("categories").select("id", { count: "exact", head: true })
    ]);

    bar.innerHTML = "";
    [[members, "Members"], [discussions, "Discussions"], [categories, "Categories"]]
      .forEach(([result, label]) => {
        if (result.error || result.count === null) return;
        bar.appendChild(statBox(result.count, label));
      });

    if (!bar.children.length) bar.remove();
  }

  load();
})();