const { LiveKitAPI } = require('livekit-server-sdk');

module.exports = async function handler(req, res) {
  const keyPrefix = (process.env.LIVEKIT_API_KEY || '').slice(0, 6);
  try {
    const host = process.env.LIVEKIT_URL.replace('wss://', 'https://');
    const api = new LiveKitAPI(host, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
    const rooms = await api.room.listRooms();
    res.status(200).json({ ok: true, rooms: rooms.length, keyPrefix });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, keyPrefix });
  }
};
