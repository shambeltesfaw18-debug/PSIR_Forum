// Downloads a PDF from a public https link, for signed-in members. Same safety rules as the link reader.
const dns = require("dns").promises;
const net = require("net");
const SUPABASE_URL = process.env.SUPABASE_URL || "https://updxillknwufqekfzkur.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
const MAX_BYTES = 10 * 1024 * 1024;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const p = ip.split(".").map(Number);
    return p[0] === 10 || p[0] === 127 || p[0] === 0 || p[0] >= 224 || (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127);
  }
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:");
  }
  return true;
}
async function safeUrl(raw) {
  let u; try { u = new URL(raw); } catch (e) { return null; }
  if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443")) return null;
  if (!u.hostname || u.hostname === "localhost" || u.hostname.endsWith(".local") || u.hostname.endsWith(".internal")) return null;
  let addrs; try { addrs = await dns.lookup(u.hostname, { all: true }); } catch (e) { return null; }
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) return null;
  return u;
}
async function timedFetch(url, opts, ms) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, Object.assign({ redirect: "manual", signal: ctrl.signal }, opts)); } finally { clearTimeout(t); }
}
async function robotsAllows(u) {
  try {
    const r = await timedFetch(new URL("/robots.txt", u).href, { headers: { "User-Agent": UA } }, 4000);
    if (!r.ok) return true;
    const text = (await r.text()).slice(0, 100 * 1024);
    let applies = false; const disallow = [];
    text.split(/\r?\n/).forEach(line => {
      const l = line.replace(/#.*/, "").trim(); const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(l); if (!m) return;
      const f = m[1].toLowerCase(), v = m[2].trim();
      if (f === "user-agent") applies = v === "*";
      else if (f === "disallow" && applies && v) disallow.push(v);
    });
    return !disallow.some(d => (u.pathname + u.search).indexOf(d) === 0);
  } catch (e) { return true; }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed." }); }
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ error: "Please log in first." });
  let user = null;
  try {
    const c = await timedFetch(SUPABASE_URL + "/auth/v1/user", { headers: { Authorization: "Bearer " + match[1], apikey: SUPABASE_KEY } }, 6000);
    if (c.ok) user = await c.json();
  } catch (e) { return res.status(503).json({ error: "Could not confirm your sign-in." }); }
  if (!user || !user.id) return res.status(401).json({ error: "Please log in first." });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const start = await safeUrl(String(body.url || "").trim());
  if (!start) return res.status(400).json({ error: "Please give a public link that starts with https://" });
  if (!(await robotsAllows(start))) return res.status(422).json({ error: "This website asks automated tools not to download this file. Please upload it yourself." });

  let current = start;
  try {
    for (let hop = 0; hop < 3; hop++) {
      const r = await timedFetch(current.href, { headers: { "User-Agent": UA, Accept: "application/pdf" } }, 15000);
      if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
        const next = await safeUrl(new URL(r.headers.get("location"), current).href);
        if (!next) return res.status(422).json({ error: "The link redirects somewhere that cannot be used." });
        current = next; continue;
      }
      if (!r.ok) return res.status(422).json({ error: "The file could not be downloaded from this link." });
      if (!/application\/pdf/i.test(r.headers.get("content-type") || "")) return res.status(422).json({ error: "This link does not point directly to a PDF file." });
      const len = Number(r.headers.get("content-length") || 0);
      if (len > MAX_BYTES) return res.status(422).json({ error: "This PDF is larger than 10 MB." });
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > MAX_BYTES) return res.status(422).json({ error: "This PDF is larger than 10 MB." });
      if (buf.slice(0, 4).toString() !== "%PDF") return res.status(422).json({ error: "This file is not a valid PDF." });
      res.setHeader("Content-Type", "application/pdf");
      return res.status(200).send(buf);
    }
    return res.status(422).json({ error: "The link redirects too many times." });
  } catch (e) {
    return res.status(422).json({ error: "The file could not be downloaded. Please upload it yourself." });
  }
};
