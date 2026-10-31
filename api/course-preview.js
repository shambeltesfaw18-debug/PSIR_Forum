// Vercel serverless function: reads a public course page and returns its title, provider,
// description and thumbnail. Only signed-in members can use it. Private, local and
// non-HTTPS addresses are refused, and the number of redirects and the page size are limited.
const dns = require("dns").promises;
const net = require("net");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://updxillknwufqekfzkur.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
const MAX_BYTES = 600 * 1024;

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const p = ip.split(".").map(Number);
    return p[0] === 10 || p[0] === 127 || p[0] === 0 || p[0] >= 224 ||
      (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127);
  }
  if (net.isIPv6(ip)) {
    const l = ip.toLowerCase();
    return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") ||
      l.startsWith("::ffff:127.") || l.startsWith("::ffff:10.") || l.startsWith("::ffff:192.168.");
  }
  return true;
}

async function safeUrl(raw) {
  let u;
  try { u = new URL(raw); } catch (e) { return null; }
  if (u.protocol !== "https:" || u.username || u.password) return null;
  if (u.port && u.port !== "443") return null;
  const addrs = await dns.lookup(u.hostname, { all: true });
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) return null;
  return u;
}

async function readLimited(r) {
  const reader = r.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_BYTES) { chunks.push(value.subarray(0, value.length - (total - MAX_BYTES))); break; }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map(c => Buffer.from(c))).toString("utf8");
}

async function fetchPage(start) {
  let current = start;
  for (let hop = 0; hop < 4; hop++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    let r;
    try {
      r = await fetch(current.href, {
        redirect: "manual", signal: ctrl.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml", "Accept-Language": "en"
        }
      });
    } finally { clearTimeout(timer); }
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
      const next = await safeUrl(new URL(r.headers.get("location"), current).href);
      if (!next) return { ok: false, code: "unreadable" };
      current = next;
      continue;
    }
    if (!r.ok) {
      const blocked = [401, 403, 429, 503].indexOf(r.status) !== -1;
      return { ok: false, code: blocked ? "blocked" : "unreadable" };
    }
    if (!/text\/html|application\/xhtml/i.test(r.headers.get("content-type") || "")) return { ok: false, code: "unreadable" };
    return { ok: true, url: current, html: await readLimited(r) };
  }
  return { ok: false, code: "unreadable" };
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(s) {
  return String(s || "").replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] !== undefined ? ENT[e.toLowerCase()] : m;
  });
}
function attrs(tag) {
  const out = {};
  tag.replace(/([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g, (m, k, v, a, b, c) => {
    out[k.toLowerCase()] = a !== undefined ? a : (b !== undefined ? b : (c || ""));
    return m;
  });
  return out;
}
function clean(s, max) { return decode(s).replace(/\s+/g, " ").trim().slice(0, max); }

function pickImage(src, base) {
  try {
    const u = new URL(src, base);
    if (u.protocol === "http:") u.protocol = "https:";
    if (u.protocol !== "https:") return null;
    return u.href.length <= 2000 ? u.href : null;
  } catch (e) { return null; }
}

// First paragraph of real text, used when the page has no description tag
function firstParagraph(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ");
  const paras = body.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || [];
  for (const p of paras) {
    const text = clean(p.replace(/<[^>]+>/g, " "), 1000);
    if (text.length >= 80) return text;
  }
  return "";
}

function extract(html, base) {
  const meta = {};
  (html.match(/<meta\b[^>]*>/gi) || []).forEach(tag => {
    const a = attrs(tag);
    const key = (a.property || a.name || a.itemprop || "").toLowerCase();
    if (key && a.content !== undefined && meta[key] === undefined) meta[key] = a.content;
  });
  let linkImage = "";
  (html.match(/<link\b[^>]*>/gi) || []).forEach(tag => {
    const a = attrs(tag);
    if ((a.rel || "").toLowerCase() === "image_src" && a.href) linkImage = a.href;
  });
  const pick = (...keys) => {
    for (const k of keys) if (meta[k] && meta[k].trim()) return meta[k];
    return "";
  };
  const titleTag = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
  const title = clean(pick("og:title", "twitter:title") || titleTag, 200);
  let description = clean(pick("og:description", "description", "twitter:description"), 1000);
  if (!description) description = firstParagraph(html);
  const provider = clean(pick("og:site_name", "application-name"), 150) || base.hostname.replace(/^www\./, "");
  const candidates = [
    pick("og:image", "og:image:secure_url", "og:image:url", "twitter:image", "twitter:image:src", "image"),
    linkImage
  ].filter(Boolean);
  let image_url = null;
  for (const c of candidates) {
    const v = pickImage(clean(c, 2000), base);
    if (v) { image_url = v; break; }
  }
  return { title, description, provider, image_url, found: { description: !!description, image: !!image_url } };
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed." }); }

  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ error: "Please log in to add a course." });
  let user = null;
  try {
    const check = await fetch(SUPABASE_URL + "/auth/v1/user", { headers: { Authorization: "Bearer " + match[1], apikey: SUPABASE_KEY } });
    if (check.ok) user = await check.json();
  } catch (e) { return res.status(503).json({ error: "Could not confirm your sign-in." }); }
  if (!user || !user.id) return res.status(401).json({ error: "Please log in to add a course." });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const start = await safeUrl(String(body.url || ""));
  if (!start) return res.status(400).json({ error: "Please give a public course link that starts with https://" });

  try {
    const got = await fetchPage(start);
    if (!got.ok) {
      if (got.code === "blocked") {
        return res.status(422).json({ code: "blocked", error: "This website does not allow automatic reading. Please enter the course title and provider yourself. You can add a short description too." });
      }
      return res.status(422).json({ code: "unreadable", error: "Could not read this page. Check that the link is public and opens in a browser." });
    }
    const page = got;
    const info = extract(page.html, page.url);
    const title = info.title && info.title.length >= 5 ? info.title : (page.url.hostname + " course");
    const provider = info.provider && info.provider.length >= 2 ? info.provider : page.url.hostname;
    return res.status(200).json({ url: page.url.href, title, provider, description: info.description, image_url: info.image_url, found: info.found });
  } catch (e) {
    return res.status(422).json({ code: "unreadable", error: "Could not read this page. Please try another link." });
  }
};
