// Vercel serverless function: issues short-lived ImageKit upload permission.
// The ImageKit private key stays on the server. The caller must be signed in with Supabase;
// the token is checked with Supabase itself, and the upload folder is chosen here, not by the browser.
const crypto = require("crypto");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://updxillknwufqekfzkur.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";

// Only these upload purposes exist. The browser names the purpose; the server picks the folder.
const PURPOSES = { "news-cover": "news-covers" };

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    return res.status(500).json({ error: "The image service is not configured." });
  }

  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ error: "Please log in to upload images." });

  let user = null;
  try {
    const check = await fetch(SUPABASE_URL + "/auth/v1/user", {
      headers: { Authorization: "Bearer " + match[1], apikey: SUPABASE_KEY }
    });
    if (check.ok) user = await check.json();
  } catch (e) {
    return res.status(503).json({ error: "Could not confirm your sign-in. Please try again." });
  }
  if (!user || !user.id) return res.status(401).json({ error: "Please log in to upload images." });

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const folderName = PURPOSES[body.purpose];
  if (!folderName) return res.status(400).json({ error: "Unknown upload type." });

  const expire = Math.floor(Date.now() / 1000) + 600;           // valid for 10 minutes
  const token = crypto.randomBytes(16).toString("hex");
  const signature = crypto.createHmac("sha1", privateKey).update(token + expire).digest("hex");

  return res.status(200).json({
    token,
    expire,
    signature,
    publicKey,
    folder: "/psir/" + folderName + "/" + user.id + "/"
  });
};
