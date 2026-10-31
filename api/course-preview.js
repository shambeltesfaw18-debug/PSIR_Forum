// Vercel serverless function: reads a public course page and returns its title, provider,
// description and thumbnail. Signed-in members only. Reads Open Graph, Twitter Card, HTML and
// JSON-LD (schema.org) data, honours robots.txt, refuses private and local addresses, and limits
// redirects, time and page size. Missing details are returned as empty, never invented.
const dns = require("dns").promises;
const net = require("net");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://updxillknwufqekfzkur.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
const MAX_PAGE = 600 * 1024;
const MAX_IMAGE = 6 * 1024 * 1024;
const MIN_IMAGE = 3 * 1024;          // smaller files are usually tracking pixels or icons
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const BOT_TOKEN = "PSIR-Forum-course-preview";

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

// Only public https addresses on the standard port; resolves the name and checks every address
async function safeUrl(raw) {
  let u;
  try { u = new URL(raw); } catch (e) { return null; }
  if (u.protocol !== "https:" || u.username || u.password) return null;
  if (u.port && u.port !== "443") return null;
  if (!u.hostname || u.hostname === "localhost" || u.hostname.endsWith(".local") || u.hostname.endsWith(".internal")) return null;
  let addrs;
  try { addrs = await dns.lookup(u.hostname, { all: true }); } catch (e) { return null; }
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) return null;
  return u;
}

async function timedFetch(url, opts, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, Object.assign({ redirect: "manual", signal: ctrl.signal }, opts)); }
  finally { clearTimeout(timer); }
}

async function readLimited(r, max) {
  if (!r.body) return "";
  const reader = r.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > max) { chunks.push(value.subarray(0, Math.max(0, value.length - (total - max)))); reader.cancel(); break; }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map(c => Buffer.from(c))).toString("utf8");
}

// robots.txt: Disallow rules for "*" or our own token; the longest matching rule decides
function robotsAllows(text, path) {
  const groups = [];
  let cur = null;
  text.split(/\r?\n/).forEach(line => {
    const l = line.replace(/#.*/, "").trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(l);
    if (!m) return;
    const field = m[1].toLowerCase(), value = m[2].trim();
    if (field === "user-agent") {
      if (!cur || cur.rules.length) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(value.toLowerCase());
    } else if ((field === "allow" || field === "disallow") && cur) {
      cur.rules.push({ allow: field === "allow", path: value });
    }
  });
  const mine = groups.filter(g => g.agents.indexOf(BOT_TOKEN.toLowerCase()) !== -1);
  const use = mine.length ? mine : groups.filter(g => g.agents.indexOf("*") !== -1);
  let best = null;
  use.forEach(g => g.rules.forEach(r => {
    if (r.path === "" && !r.allow) return;
    if (path.indexOf(r.path) === 0 && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }));
  return !best || best.allow;
}

async function allowedByRobots(u) {
  try {
    const r = await timedFetch(new URL("/robots.txt", u).href, { headers: { "User-Agent": BROWSER_UA } }, 4000);
    if (!r.ok) return true;
    const text = await readLimited(r, 100 * 1024);
    return robotsAllows(text, u.pathname + u.search);
  } catch (e) { return true; }
}

async function fetchPage(start) {
  let current = start;
  for (let hop = 0; hop < 3; hop++) {
    const r = await timedFetch(current.href, {
      headers: { "User-Agent": BROWSER_UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "en" }
    }, 8000);
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
      const next = await safeUrl(new URL(r.headers.get("location"), current).href);
      if (!next) return { ok: false, code: "unreadable" };
      current = next;
      continue;
    }
    if (!r.ok) return { ok: false, code: [401, 403, 429, 503].indexOf(r.status) !== -1 ? "blocked" : "unreadable" };
    if (!/text\/html|application\/xhtml/i.test(r.headers.get("content-type") || "")) return { ok: false, code: "unreadable" };
    return { ok: true, url: current, html: await readLimited(r, MAX_PAGE) };
  }
  return { ok: false, code: "unreadable" };
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(s) {
  return String(s || "").replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    }
    return ENT[e.toLowerCase()] !== undefined ? ENT[e.toLowerCase()] : m;
  });
}
function clean(s, max) { return decode(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
function attrs(tag) {
  const out = {};
  tag.replace(/([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g, (m, k, v, a, b, c) => {
    out[k.toLowerCase()] = a !== undefined ? a : (b !== undefined ? b : (c || ""));
    return m;
  });
  return out;
}

// Structured data (JSON-LD): course, programme, organisation and event records
const COURSE_TYPES = ["Course", "EducationalOccupationalProgram", "LearningResource", "CreativeWork", "Product", "Organization", "EducationalOrganization", "CollegeOrUniversity", "Event", "WebPage"];
function jsonLdRecords(html) {
  const out = [];
  (html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || []).forEach(block => {
    const body = block.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "");
    let data;
    try { data = JSON.parse(body); } catch (e) { return; }
    const walk = node => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== "object") return;
      if (node["@graph"]) walk(node["@graph"]);
      out.push(node);
    };
    walk(data);
  });
  return out;
}
function typeOf(n) { return [].concat(n["@type"] || []).map(String); }
function textOf(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return textOf(v[0]);
  if (typeof v === "object") return textOf(v.name || v.url || v["@value"] || "");
  return "";
}
function imageOf(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) { for (const x of v) { const i = imageOf(x); if (i) return i; } return ""; }
  return typeof v === "object" ? (v.url || v.contentUrl || "") : "";
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
  const pick = (...keys) => { for (const k of keys) if (meta[k] && meta[k].trim()) return meta[k]; return ""; };
  const titleTag = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";

  // Structured data first, then Open Graph / Twitter / HTML tags
  const ld = jsonLdRecords(html);
  const course = ld.find(n => typeOf(n).some(t => ["Course", "EducationalOccupationalProgram", "LearningResource"].indexOf(t) !== -1));
  const org = ld.find(n => typeOf(n).some(t => /Organization|University|College/.test(t)));
  const ldTitle = course ? textOf(course.name) : "";
  const ldDesc = course ? textOf(course.description) : "";
  const ldImage = course ? imageOf(course.image) : "";
  const ldProvider = course ? textOf(course.provider || course.publisher || course.creator) : (org ? textOf(org.name) : "");

  const title = clean(ldTitle || pick("og:title", "twitter:title") || titleTag, 200);
  const description = clean(ldDesc || pick("og:description", "twitter:description", "description"), 1000);
  const provider = clean(ldProvider || pick("og:site_name", "application-name"), 150) || base.hostname.replace(/^www\./, "");
  const imageCandidates = [ldImage, pick("og:image", "og:image:secure_url", "og:image:url", "twitter:image", "twitter:image:src"), linkImage].filter(Boolean);
  return {
    title, description, provider,
    imageCandidates: imageCandidates.map(c => clean(c, 2000)),
    fields: {
      title: !!title, description: !!description, provider: !!provider, image: imageCandidates.length > 0
    }
  };
}

// A thumbnail is kept only if it is a real, reasonably sized image on a public https address
async function checkImage(src, base) {
  let u;
  try { u = new URL(src, base); } catch (e) { return null; }
  if (u.protocol === "http:") u.protocol = "https:";
  const ok = await safeUrl(u.href);
  if (!ok || u.href.length > 2000) return null;
  try {
    const r = await timedFetch(ok.href, { headers: { "User-Agent": BROWSER_UA, Accept: "image/*" } }, 8000);
    if (!r.ok || r.status >= 300) { if (r.body) r.body.cancel(); return null; }
    const type = (r.headers.get("content-type") || "").toLowerCase();
    if (!/^image\/(jpeg|png|webp|gif)/.test(type)) { if (r.body) r.body.cancel(); return null; }
    const size = Number(r.headers.get("content-length") || 0);
    if (size && (size < MIN_IMAGE || size > MAX_IMAGE)) { if (r.body) r.body.cancel(); return null; }
    if (r.body) r.body.cancel();
    return ok.href;
  } catch (e) { return null; }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed." }); }

  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ error: "Please log in to add a course." });
  let user = null;
  try {
    const check = await timedFetch(SUPABASE_URL + "/auth/v1/user", { headers: { Authorization: "Bearer " + match[1], apikey: SUPABASE_KEY } }, 6000);
    if (check.ok) user = await check.json();
  } catch (e) { return res.status(503).json({ error: "Could not confirm your sign-in." }); }
  if (!user || !user.id) return res.status(401).json({ error: "Please log in to add a course." });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const start = await safeUrl(String(body.url || ""));
  if (!start) return res.status(400).json({ code: "invalid", error: "Please give a public course link that starts with https://" });

  try {
    if (!(await allowedByRobots(start))) {
      return res.status(422).json({ code: "robots", error: "This website asks automated tools not to read this page. Please enter the details yourself." });
    }
    const got = await fetchPage(start);
    if (!got.ok) {
      if (got.code === "blocked") {
        return res.status(422).json({ code: "blocked", error: "This website does not allow automatic reading. Please enter the course title and provider yourself. You can add a short description too." });
      }
      return res.status(422).json({ code: "unreadable", error: "Could not read this page. Check that the link is public and opens in a browser." });
    }
    const info = extract(got.html, got.url);
    let image_url = null;
    for (const c of info.imageCandidates) {
      image_url = await checkImage(c, got.url);
      if (image_url) break;
    }
    const title = info.title && info.title.length >= 5 ? info.title : "";
    return res.status(200).json({
      url: got.url.href,
      title,
      provider: info.provider,
      description: info.description,
      image_url,
      found: { title: !!title, description: !!info.description, provider: !!info.provider, image: !!image_url }
    });
  } catch (e) {
    return res.status(422).json({ code: "unreadable", error: "Could not read this page. Please try another link." });
  }
};
