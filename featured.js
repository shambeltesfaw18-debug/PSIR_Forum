(function () {
  "use strict";
  const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
  const box = document.getElementById("featuredDiscussions");
  if (!box || !window.supabase) return;
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const style = document.createElement("style");
  style.textContent = `
    .featured-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; margin:18px 0 22px; }
    .featured-card { display:block; background:#fff; border:1px solid #e2e8ef; border-left:4px solid #e7b451; border-radius:16px; padding:18px; color:#172b3d; text-decoration:none; }
    .featured-card:hover { box-shadow:0 8px 24px rgba(16,43,70,.1); }
    .featured-card:focus-visible { outline:3px solid #e7b451; outline-offset:2px; }
    .featured-card h3 { margin:6px 0 8px; color:#102b46; font-size:1.05rem; line-height:1.35; overflow-wrap:anywhere; }
    .featured-card p { margin:0 0 10px; color:#4a5b6c; font-size:.92rem; line-height:1.55; overflow-wrap:anywhere; }
    .featured-meta { color:#6b7b8b; font-size:.8rem; }
    .featured-pill { display:inline-block; background:#edf3f9; color:#315b83; font-size:.72rem; font-weight:800; padding:3px 9px; border-radius:6px; }
    .featured-note { color:#5b6b7b; background:#fff; border:1px dashed #c8d4e0; border-radius:14px; padding:18px; }
  `;
  document.head.appendChild(style);

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
  }
  function slugify(name) {
    return String(name || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function excerpt(stored) {
    const plain = String(stored || "").replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return plain.length > 160 ? plain.slice(0, 160) + "…" : plain;
  }
  function message(html) {
    box.innerHTML = html;
  }

  async function load() {
    message('<p class="featured-note">Loading recent discussions…</p>');
    try {
      const { data: threads, error } = await db.from("threads")
        .select("id, title, body, created_at, author_id, category_id")
        .eq("is_hidden", false).order("created_at", { ascending: false }).limit(3);
      if (error) throw error;
      if (!threads.length) {
        message('<p class="featured-note">No discussions yet. <a href="/discussions" style="color:#2864a0;font-weight:700;">Start the first conversation</a>.</p>');
        return;
      }

      const threadIds = threads.map(t => t.id);
      const categoryIds = [...new Set(threads.map(t => t.category_id))];
      const authorIds = [...new Set(threads.map(t => t.author_id))];

      const [catsRes, peopleRes, repliesRes] = await Promise.all([
        db.from("categories").select("id, name, slug").in("id", categoryIds),
        db.from("profiles").select("id, full_name").in("id", authorIds),
        db.from("replies").select("thread_id").in("thread_id", threadIds).eq("is_hidden", false)
      ]);
      const cats = new Map((catsRes.data || []).map(c => [c.id, c]));
      const names = new Map((peopleRes.data || []).map(p => [p.id, p.full_name]));
      const replies = new Map();
      (repliesRes.data || []).forEach(r => replies.set(r.thread_id, (replies.get(r.thread_id) || 0) + 1));

      box.innerHTML = threads.map(t => {
        const cat = cats.get(t.category_id);
        const count = replies.get(t.id) || 0;
        const link = cat ? "/categories/" + slugify(cat.name) : "/discussions";
        return `
          <a class="featured-card" href="${esc(link)}">
            <span class="featured-pill">${esc(cat ? cat.name : "Discussion")}</span>
            <h3>${esc(t.title)}</h3>
            <p>${esc(excerpt(t.body))}</p>
            <div class="featured-meta">${esc(names.get(t.author_id) || "Member")} · ${esc(new Date(t.created_at).toLocaleDateString())} · ${count} ${count === 1 ? "reply" : "replies"}</div>
          </a>`;
      }).join("");
    } catch (err) {
      console.error("Featured discussions:", err);
      message('<p class="featured-note" style="color:#8c2929;">Could not load recent discussions. Please refresh the page.</p>');
    }
  }
  load();
})();
