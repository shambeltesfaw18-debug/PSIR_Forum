const crypto = require('crypto');

const SUPABASE_URL = 'https://updxillknwufqekfzkur.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5';

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

function makeLiveKitToken({ apiKey, apiSecret, identity, name, room, canPublish, isAdmin }) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: apiKey,
    sub: identity,
    name,
    nbf: now,
    exp: now + 4 * 60 * 60,
    video: {
      room,
      roomJoin: true,
      canSubscribe: true,
      canPublish,
      canPublishData: true,
      roomAdmin: isAdmin
    }
  };
  const data = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', apiSecret).update(data).digest('base64url');
  return data + '.' + signature;
}

module.exports = async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.replace('Bearer ', '').trim();
  if (!accessToken) {
    return res.status(401).json({ error: 'Log in first' });
  }

  // Check the user's login with Supabase
  const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken }
  });
  if (!userRes.ok) {
    return res.status(401).json({ error: 'Session expired. Log in again.' });
  }
  const user = await userRes.json();

  // Look up the user's role
  const profRes = await fetch(
    SUPABASE_URL + '/rest/v1/profiles?id=eq.' + user.id + '&select=full_name,role',
    { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken } }
  );
  const profiles = await profRes.json();
  const profile = profiles[0] || {};
  const isHost = ['scholar', 'moderator', 'admin'].includes(profile.role);

  // Clean the room name, e.g. "psir-horn-of-africa-diplomacy"
  const slug = String(req.query.room || 'general').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
  const room = 'psir-' + (slug || 'general');

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) {
    return res.status(500).json({ error: 'Server is missing LiveKit settings' });
  }

  const token = makeLiveKitToken({
    apiKey,
    apiSecret,
    identity: user.id,
    name: profile.full_name || 'Student',
    room,
    canPublish: isHost,
    isAdmin: isHost
  });

  res.status(200).json({ token, url, room, isHost });
};
