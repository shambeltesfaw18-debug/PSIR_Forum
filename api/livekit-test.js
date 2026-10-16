const { RoomServiceClient } = require('livekit-server-sdk');

module.exports = async function handler(req, res) {
  const keyPrefix = (process.env.LIVEKIT_API_KEY || '').slice(0, 6);
  try {
    const host = process.env.LIVEKIT_URL.replace('wss://', 'https://');
    const svc = new RoomServiceClient(host, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
    const rooms = await svc.listRooms();
    res.status(200).json({ ok: true, rooms: rooms.length, keyPrefix });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, keyPrefix });
  }
};
