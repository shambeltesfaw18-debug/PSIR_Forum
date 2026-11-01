// Vercel serverless function: sitemap of approved research papers and news/journal items.
// Reads only public (approved) rows, using the public read key the site already uses.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://updxillknwufqekfzkur.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
const SITE = "https://psirforum.vercel.app";

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

module.exports = async (req, res) => {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).end(); }
  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/publications?select=id,decided_at,created_at&status=eq.approved&order=decided_at.desc.nullslast&limit=5000", {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
    });
    if (!r.ok) throw new Error("Could not load the list (" + r.status + ")");
    const rows = await r.json();
    const urls = rows
      .filter(row => /^[0-9a-f-]{36}$/i.test(row.id))
      .map(row => {
        const date = String(row.decided_at || row.created_at || "").slice(0, 10);
        return "  <url>\n    <loc>" + esc(SITE + "/publication.html?id=" + row.id) + "</loc>" +
          (date ? "\n    <lastmod>" + esc(date) + "</lastmod>" : "") +
          "\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>";
      }).join("\n");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "\n</urlset>\n");
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).send("Sitemap temporarily unavailable.");
  }
};
