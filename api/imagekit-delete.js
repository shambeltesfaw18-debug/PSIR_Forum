// Vercel serverless function: removes an ImageKit cover image that is no longer used.
// Safe by design: the caller must be signed in, the file must be in the caller's own folder
// (or the caller must be a moderator), and no publication may still use the file.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://updxillknwufqekfzkur.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
const FOLDER = "/psir/news-covers/";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) return res.status(500).json({ error: "The image service is not configured." });

  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ error: "Please log in." });
  const memberHeaders = { Authorization: "Bearer " + match[1], apikey: SUPABASE_KEY };

  let user = null;
  try {
    const check = await fetch(SUPABASE_URL + "/auth/v1/user", { headers: memberHeaders });
    if (check.ok) user = await check.json();
  } catch (e) {
    return res.status(503).json({ error: "Could not confirm your sign-in." });
  }
  if (!user || !user.id) return res.status(401).json({ error: "Please log in." });

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const fileId = String(body.fileId || "");
  if (!/^[A-Za-z0-9]{8,64}$/.test(fileId)) return res.status(400).json({ error: "Invalid file." });

  try {
    // Is the caller a moderator? (read with the caller's own token)
    const prof = await fetch(SUPABASE_URL + "/rest/v1/profiles?select=role&id=eq." + user.id, { headers: memberHeaders });
    const rows = prof.ok ? await prof.json() : [];
    const isStaff = rows.length > 0 && ["admin", "moderator"].indexOf(rows[0].role) !== -1;

    // Still used by a publication the caller can see? Then keep it.
    const used = await fetch(SUPABASE_URL + "/rest/v1/publications?select=id&image_file_id=eq." + encodeURIComponent(fileId) + "&limit=1", { headers: memberHeaders });
    if (!used.ok) return res.status(503).json({ error: "Could not check the file. Please try again." });
    if ((await used.json()).length > 0) return res.status(409).json({ error: "This image is still in use." });

    // Where is the file stored? Only the owner's folder (or any cover folder, for moderators) may be cleaned up.
    const auth = "Basic " + Buffer.from(privateKey + ":").toString("base64");
    const info = await fetch("https://api.imagekit.io/v1/files/" + encodeURIComponent(fileId), { headers: { Authorization: auth } });
    if (info.status === 404) return res.status(200).json({ deleted: false, reason: "not found" });
    if (!info.ok) return res.status(503).json({ error: "Could not check the file. Please try again." });
    const file = await info.json();
    const path = String(file.filePath || "");
    const ownFolder = FOLDER + user.id + "/";
    if (path.indexOf(FOLDER) !== 0 || (!isStaff && path.indexOf(ownFolder) !== 0)) {
      return res.status(403).json({ error: "You can only remove your own images." });
    }

    const removed = await fetch("https://api.imagekit.io/v1/files/" + encodeURIComponent(fileId), {
      method: "DELETE", headers: { Authorization: auth }
    });
    if (!removed.ok && removed.status !== 404) return res.status(503).json({ error: "The image could not be removed. Please try again." });
    return res.status(200).json({ deleted: true });
  } catch (e) {
    return res.status(503).json({ error: "The image could not be removed. Please try again." });
  }
};
