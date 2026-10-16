const { AccessToken } = require('livekit-server-sdk');

const SUPABASE_URL = 'https://updxillknwufqekfzkur.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5';
const HOST_ROLES = ['scholar', 'moderator', 'admin'];

module.exports = async function handler(req, res) {
  const accessToken = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!accessToken) {
    return res.status(401).json({ error: 'Log in first' });
  }

  const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken }
  });
  if (!userRes.ok) {
    return res.status(401).json({ error: 'Session expired. Log in again.' });
  }
  const user = await userRes.json();

  const profRes = await fetch(
    SUPABASE_URL + '/rest/v1/profiles?id=eq.' + user.id + '&select=full_name,role',
    { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken } }
  );
  const profiles = await profRes.json();
  const profile = profiles[0] || {};
  const isHost = HOST_ROLES.includes(profile.role);

  const slug = String(req.query.room || 'general').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
  const room = 'psir-' + (slug || 'general');

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) {
    return res.status(500).json({ error: 'Server is missing LiveKit settings' });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: profile.full_name || 'Student',
    ttl: '4h'
  });
  at.addGrant({
    roomJoin: true,
    room,
    canSubscribe: true,
    canPublish: isHost,
    canPublishData: true,
    roomAdmin: isHost
  });
  const token = await at.toJwt();

  res.status(200).json({ token, url, room, isHost });
};
