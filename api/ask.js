// PSIR Forum assistant. Runs on the server (Vercel), so the Gemini key stays secret.
// Only signed-in members can ask, each member has a daily limit, and a failed question is refunded.
const SUPABASE_URL = "https://updxillknwufqekfzkur.supabase.co";
const SUPABASE_KEY = "sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5";
const DAILY_LIMIT = 20;

// Models to try, in order. GEMINI_MODEL (optional, set in Vercel) is tried first.
const MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
].filter(Boolean);

const SYSTEM = `You are the assistant for PSIR Forum, an online community for political science and international relations in Ethiopia.
Answer only questions about how to use PSIR Forum. Keep answers short, clear and friendly. If you are not sure, say so and suggest psirforum@gmail.com.
Do not give legal, medical or financial advice. Never ask for or repeat personal data (passwords, ID numbers, phone numbers, addresses).

What the site offers:
- Joining: click "Join forum". Sign up with email or Google, and accept the Terms of Use and Privacy Policy.
- Profile: add your name and university or institution. Some features need a completed profile.
- Discussions: ask questions and debate by topic. Use "New discussion" once signed in.
- Research Hub: submit research papers. Moderators check each paper before it is published. This is editorial checking, not peer review.
- News and Journal: short news and longer articles. Items are checked by moderators before they appear.
- Books and Materials: share a link or a PDF (up to 10 MB). Only share material you own or are allowed to share.
- Career: free courses, scholarships and jobs, checked before listing. Never pay to apply.
- Live Room: the General Live Room opens in the browser. Press Join inside the room.
- Exams: published exams with a timer and instant results. Three attempts per exam each day. Explanations appear after submitting.
- Messages: message members who have completed their profile. You can report or block messages, and delete your own messages. Messages are removed after 12 months.
- Privacy: profile photos are optional. You can turn them off, or request account deletion from your profile page.
- Contact: psirforum@gmail.com. The Telegram channel and Facebook page are linked in the footer.`;

async function callSupabase(path, token, body) {
  return fetch(SUPABASE_URL + path, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Please sign in to use the assistant." });

  const who = await fetch(SUPABASE_URL + "/auth/v1/user", { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + token } });
  if (!who.ok) return res.status(401).json({ error: "Please sign in again." });

  const question = String((req.body && req.body.question) || "").trim().slice(0, 500);
  if (question.length < 3) return res.status(400).json({ error: "Please type a question." });

  const lim = await callSupabase("/rest/v1/rpc/ai_check_and_log", token, { p_limit: DAILY_LIMIT });
  if (!lim.ok) return res.status(500).json({ error: "The assistant is not available right now." });
  if ((await lim.json()) !== true) {
    return res.status(429).json({ error: "You have used your " + DAILY_LIMIT + " questions for today. Please try again tomorrow." });
  }

  const refund = () => callSupabase("/rest/v1/rpc/ai_refund", token, {}).catch(() => {});
  const key = process.env.GEMINI_API_KEY;
  if (!key) { await refund(); return res.status(500).json({ error: "The assistant is not set up yet." }); }

  let lastStatus = 0, lastDetail = "";
  for (const model of MODELS) {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key.trim() },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
        }),
      }
    );
    if (r.ok) {
      const data = await r.json();
      const answer = ((data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [])
        .map(function (p) { return p.text || ""; }).join("").trim();
      return res.status(200).json({ answer: answer || "Sorry, I could not answer that. Please email psirforum@gmail.com." });
    }
    lastStatus = r.status;
    lastDetail = (await r.text()).slice(0, 300);
    console.error("Gemini error", model, r.status, lastDetail);
    // Try the next model only if this one does not exist or the request was rejected.
    if (r.status !== 404 && r.status !== 400) break;
  }

  await refund();
  console.error("Assistant failed. Last status:", lastStatus);
  return res.status(502).json({ error: "The assistant is busy. Please try again shortly." });
}
