const crypto = require('crypto');

const SUPABASE_URL = 'https://updxillknwufqekfzkur.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5';
const VIDEOSDK_API_KEY = 'ba872283-59b5-452a-9a46-981cd3ee4f0f';
const LEADER = ['admin', 'moderator', 'scholar'];

function b64url(text) {
  return Buffer.from(text).toString('base64url');
}

// Signs a short-lived token with the secret, which stays on the server
function makeToken(permissions) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    apikey: VIDEOSDK_API_KEY,
    permissions,
    iat: now,
    exp: now + 4 * 60 * 60
  }));
  const signature = crypto
    .createHmac('sha256', process.env.VIDEOSDK_SECRET)
    .update(header + '.' + payload)
    .digest('base64url');
  return header + '.' + payload + '.' + signature;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }
  if (!process.env.VIDEOSDK_SECRET) {
    return res.status(500).json({ error: 'Server is missing VideoSDK settings' });
  }

  // 1. The caller must be logged in
  const accessToken = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!accessToken) return res.status(401).json({ error: 'Log in first' });

  const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken }
  });
  if (!userRes.ok) return res.status(401).json({ error: 'Session expired. Log in again.' });
  const user = await userRes.json();

  // 2. Find the caller's role
  const profRes = await fetch(
    SUPABASE_URL + '/rest/v1/profiles?id=eq.' + user.id + '&select=role',
    { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken } }
  );
  const profiles = await profRes.json();
  const role = profiles[0] ? profiles[0].role : 'student';
  const isHost = LEADER.includes(role);

  const body = req.body || {};

  // 3a. Leaders create a new room
  if (body.action === 'create') {
    if (!isHost) return res.status(403).json({ error: 'Only club leaders can start a session' });

    const adminToken = makeToken(['allow_join', 'allow_mod']);
    const roomRes = await fetch('https://api.videosdk.live/v2/rooms', {
      method: 'POST',
      headers: { Authorization: adminToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const room = await roomRes.json().catch(() => ({}));
    if (!roomRes.ok || !room.roomId) {
      return res.status(502).json({ error: 'Could not create the audio room' });
    }
    return res.status(200).json({
      roomId: room.roomId,
      token: makeToken(['allow_join', 'allow_mod'])
    });
  }

  // 3b. Members join a room, but only if it belongs to an active session
  if (body.action === 'join') {
    const roomId = String(body.roomId || '');
    if (!/^[a-zA-Z0-9-]{6,60}$/.test(roomId)) {
      return res.status(400).json({ error: 'Invalid session' });
    }

    const sessRes = await fetch(
      SUPABASE_URL + '/rest/v1/audio_sessions?room_id=eq.' + encodeURIComponent(roomId) +
      '&is_active=eq.true&select=room_id',
      { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken } }
    );
    const sessions = await sessRes.json();
    if (!sessions.length) return res.status(404).json({ error: 'This session is no longer active' });

    return res.status(200).json({
      roomId,
      token: makeToken(isHost ? ['allow_join', 'allow_mod'] : ['allow_join'])
    });
  }

  return res.status(400).json({ error: 'Unknown action' });
};
