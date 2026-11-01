// Vercel serverless function: fills in a job posting from a public link (structured data, meta tags)
// and/or from pasted job text. Signed-in members and staff only. Nothing is invented: a field that
// cannot be found is returned empty and listed as missing.
const dns = require("dns").promises;
const net = require("net");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://updxillknwufqekfzkur.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
const MAX_PAGE = 600 * 1024;
const MAX_TEXT = 20000;
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
    return robotsAllows(await readLimited(r, 100 * 1024), u.pathname + u.search);
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
const typeOf = n => [].concat(n["@type"] || []).map(String);
const textOf = v => {
  if (!v) return "";
  if (typeof v === "string") return clean(v, 500);
  if (Array.isArray(v)) return textOf(v[0]);
  if (typeof v === "object") return textOf(v.name || v.addressLocality || v["@value"] || "");
  return "";
};

// Job type from free text, using the same options as the form
function mapType(s) {
  const t = String(s || "");
  if (/intern/i.test(t)) return "Internship";
  if (/research\s+assistant/i.test(t)) return "Research Assistant";
  if (/policy/i.test(t)) return "Policy Job";
  if (/full[\s_-]?time/i.test(t)) return "Full-time";
  if (/part[\s_-]?time/i.test(t)) return "Part-time";
  if (/volunteer/i.test(t)) return "Volunteer";
  if (/fellow/i.test(t)) return "Fellowship";
  return "";
}
// ISO date for deadlines that fall in a sensible range
function isoDate(s) {
  const d = new Date(String(s || "").replace(/(\d+)(st|nd|rd|th)/i, "$1"));
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  if (y < 2026 || y > 2040) return "";
  return d.toISOString().slice(0, 10);
}

// Job postings marked up with schema.org JobPosting
function fromStructuredData(html, base) {
  const node = jsonLdRecords(html).find(n => typeOf(n).indexOf("JobPosting") !== -1);
  if (!node) return {};
  const loc = [].concat(node.jobLocation || [])[0] || {};
  const addr = loc.address || {};
  const place = [addr.addressLocality, addr.addressRegion, addr.addressCountry].map(textOf).filter(Boolean).join(", ");
  let salary = "";
  const bs = node.baseSalary;
  if (bs) {
    const v = bs.value || {};
    const cur = bs.currency || v.currencyCode || "";
    const unit = v.unitText ? " per " + String(v.unitText).toLowerCase() : "";
    const amount = v.value || (v.minValue && v.maxValue ? v.minValue + " - " + v.maxValue : v.minValue || v.maxValue || "");
    if (amount) salary = clean(cur + " " + amount + unit, 200);
  }
  let experience = "";
  const exp = node.experienceRequirements;
  if (exp && typeof exp === "object" && exp.monthsOfExperience) {
    const m = Number(exp.monthsOfExperience);
    if (m > 0) experience = m % 12 === 0 ? (m / 12) + " year(s) of experience" : m + " months of experience";
  } else if (typeof exp === "string") {
    experience = clean(exp, 200);
  }
  const types = [].concat(node.employmentType || []).map(String).join(" ").replace(/_/g, " ");
  return {
    title: clean(node.title || "", 200),
    organisation: textOf(node.hiringOrganization),
    job_type: mapType(types),
    description: clean(node.description || "", 5000),
    location: clean(place, 150),
    salary: clean(salary, 200),
    experience: clean(experience, 200),
    deadline: isoDate(node.validThrough || ""),
    apply_url: node.url ? String(node.url) : ""
  };
}

// Open Graph and standard meta tags (title, organisation, short description)
function fromMeta(html, base) {
  const meta = {};
  (html.match(/<meta\b[^>]*>/gi) || []).forEach(tag => {
    const a = attrs(tag);
    const key = (a.property || a.name || "").toLowerCase();
    if (key && a.content !== undefined && meta[key] === undefined) meta[key] = a.content;
  });
  const titleTag = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
  return {
    title: clean(meta["og:title"] || titleTag, 200),
    organisation: clean(meta["og:site_name"] || "", 150),
    description: clean(meta["og:description"] || meta["description"] || "", 5000)
  };
}

// Pasted text: labelled lines first ("Location: ..."), then common patterns. Never guesses.
function fromText(raw) {
  const text = String(raw || "").replace(/\r/g, "");
  const lines = text.split("\n").map(s => s.trim()).filter(Boolean);
  const labelled = (re) => { const m = text.match(re); return m ? clean(m[1], 200) : ""; };
  const first = lines.find(l => l.length >= 5 && l.length <= 140) || "";
  const title = labelled(/(?:job\s*title|position|vacancy|post|role)\s*[:\-]\s*([^\n]+)/i) || first;
  const location = labelled(/(?:location|duty\s*station|work\s*location|based\s*in|place\s*of\s*work)\s*[:\-]\s*([^\n]+)/i) ||
    ((text.match(/\b(Addis Ababa|Bahir Dar|Dessie|Hawassa|Mekelle|Adama|Gondar|Jimma|Dire Dawa|Kombolcha|Remote)\b/i) || [])[1] || "");
  const salaryLabel = labelled(/(?:salary|pay|compensation|remuneration|stipend)\s*[:\-]\s*([^\n]+)/i);
  const salaryAmount = (text.match(/((?:ETB|USD|EUR|GBP|Birr|Br\.?|\$)\s?[\d][\d,\.]*(?:\s*(?:-|to|–)\s*(?:ETB|USD|EUR|GBP|Birr|Br\.?|\$)?\s?[\d][\d,\.]*)?(?:\s*(?:per|\/)\s*(?:month|year|annum|week|day|hour))?)/i) || [])[1] || "";
  const salary = clean(salaryLabel || salaryAmount, 200);
  const experience = labelled(/(?:experience|years?\s+of\s+experience)\s*[:\-]\s*([^\n]+)/i) ||
    clean((text.match(/(\d+\+?\s*(?:-|to)?\s*\d*\s*years?\s+of\s+(?:relevant\s+|professional\s+|work\s+)?experience)/i) || [])[1] || "", 200);
  const deadlineRaw = labelled(/(?:deadline|closing\s*date|apply\s*by|last\s*date|applications?\s*close[sd]?)\s*[:\-]?\s*([^\n]+)/i);
  const deadline = isoDate(deadlineRaw);
  const email = (text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/) || [])[0] || "";
  const job_type = mapType(labelled(/(?:job\s*type|employment\s*type|type)\s*[:\-]\s*([^\n]+)/i) || text);
  return {
    title: clean(title, 200), job_type, description: clean(text, 5000), location: clean(location, 150),
    salary, experience: clean(experience, 200), deadline, apply_email: email
  };
}

function pick(...sources) {
  const out = {};
  ["title", "organisation", "job_type", "description", "location", "salary", "experience", "deadline", "apply_url", "apply_email"].forEach(k => {
    out[k] = "";
    for (const s of sources) { if (s && s[k]) { out[k] = s[k]; break; } }
  });
  return out;
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed." }); }

  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || "");
  if (!match) return res.status(401).json({ error: "Please log in." });
  let user = null;
  try {
    const check = await timedFetch(SUPABASE_URL + "/auth/v1/user", { headers: { Authorization: "Bearer " + match[1], apikey: SUPABASE_KEY } }, 6000);
    if (check.ok) user = await check.json();
  } catch (e) { return res.status(503).json({ error: "Could not confirm your sign-in." }); }
  if (!user || !user.id) return res.status(401).json({ error: "Please log in." });

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const link = String(body.url || "").trim();
  const paste = String(body.text || "").slice(0, MAX_TEXT);
  if (!link && !paste.trim()) return res.status(400).json({ error: "Please paste a job link or the job text." });

  let linkData = {}, pageUrl = "";
  let blocked = false;
  try {
    if (link) {
      const start = await safeUrl(link);
      if (!start) return res.status(400).json({ error: "Please give a public job link that starts with https://" });
      if (!(await allowedByRobots(start))) {
        return res.status(422).json({ code: "robots", error: "This website asks automated tools not to read this page. Please paste the job text instead." });
      }
      const got = await fetchPage(start);
      if (!got.ok) {
        if (got.code === "blocked") blocked = true;
        else return res.status(422).json({ code: got.code, error: "Could not read this page. Please paste the job text instead." });
      } else {
        pageUrl = got.url.href;
        linkData = Object.assign({}, fromMeta(got.html, got.url), fromStructuredData(got.html, got.url));
        linkData.apply_url = pageUrl;
      }
    }
    const textData = paste.trim() ? fromText(paste) : {};
    const f = pick(linkData, textData);
    if (blocked && !paste.trim()) {
      return res.status(422).json({ code: "blocked", error: "This website does not allow automatic reading. Please paste the job text instead." });
    }
    const keys = ["title", "job_type", "location", "salary", "experience", "deadline", "description"];
    const missing = keys.filter(k => !f[k]);
    return res.status(200).json({
      fields: f,
      missing,
      source: link && paste.trim() ? "link and text" : (link ? "link" : "text")
    });
  } catch (e) {
    return res.status(422).json({ code: "unreadable", error: "Could not read the job. Please paste the job text instead." });
  }
};
