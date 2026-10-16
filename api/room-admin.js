const crypto = require('crypto');

const SUPABASE_URL = 'https://updxillknwufqekfzkur.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ctcI-xHdTj4TDIS9wC8n-Q_waZAg4F5';
const HOST_ROLES = ['scholar', 'moderator', 'admin'];

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

// Admin token that lets this server manage rooms
function makeAdminToken(apiKey, apiSecret, room) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: apiKey,
    sub: 'room-admin-server',
    nbf: now,
    exp: now + 10 * 60,
    video: { room, roomAdmin: true, roomList: true }
  };
  const data = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', apiSecret).update(data).digest('base64url');
  return data + '.' + signature;
}

// Call LiveKit's server API
async function livekitCall(method, body, adminToken) {
  const base = process.env.LIVEKIT_URL.replace('wss://', 'https://');
  const res = await fetch(base + '/twirp/livekit.RoomService/' + method, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(method + ' failed: ' + (await res.text()));
  return res.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  // 1. Check the caller is logged in
  const accessToken = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!accessToken) return res.status(401).json({ error: 'Log in first' });

  const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken }
  });
  if (!userRes.ok) return res.status(401).json({ error: 'Session expired. Log in again.' });
  const user = await userRes.json();

  // 2. Check the caller is a host
  const profRes = await fetch(
    SUPABASE_URL + '/rest/v1/profiles?id=eq.' + user.id + '&select=role',
    { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + accessToken } }
  );
  const profiles = await profRes.json();
  const role = profiles[0] && profiles[0].role;
  if (!HOST_ROLES.includes(role)) {
    return res.status(403).json({ error: 'Only hosts can manage sessions' });
  }

  // 3. Read the request
  const { action, room, identity } = req.body || {};
  if (!room || !/^psir-[a-z0-9-]+$/.test(room)) {
    return res.status(400).json({ error: 'Invalid room' });
  }

  const { LIVEKIT_API_KEY: apiKey, LIVEKIT_API_SECRET: apiSecret } = process.env;
  if (!apiKey || !apiSecret || !process.env.LIVEKIT_URL) {
    return res.status(500).json({ error: 'Server is missing LiveKit settings' });
  }
  const adminToken = makeAdminToken(apiKey, apiSecret, room);

  try {
    if (action === 'invite' || action === 'revoke') {
      // Invite: allow the listener to speak. Revoke: stop them speaking.
      if (!identity) return res.status(400).json({ error: 'Missing identity' });
      const canPublish = action === 'invite';
      await livekitCall('UpdateParticipant', {
        room,
        identity,
        permission: { can_subscribe: true, can_publish: canPublish, can_publish_data: true }
      }, adminToken);
      return res.status(200).json({ ok: true, action });
    }

    if (action === 'remove') {
      if (!identity) return res.status(400).json({ error: 'Missing identity' });
      await livekitCall('RemoveParticipant', { room, identity }, adminToken);
      return res.status(200).json({ ok: true, action });
    }

    if (action === 'end') {
      await livekitCall('DeleteRoom', { room }, adminToken);
      return res.status(200).json({ ok: true, action });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
