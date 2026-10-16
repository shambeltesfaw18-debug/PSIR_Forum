module.exports = function handler(req, res) {
  const key = process.env.LIVEKIT_API_KEY || '';
  const secret = process.env.LIVEKIT_API_SECRET || '';
  const url = process.env.LIVEKIT_URL || '';
  res.status(200).json({
    urlSet: url.length > 0,
    url,
    apiKeyLength: key.length,
    apiKeyHasSpaces: /\s/.test(key),
    apiSecretLength: secret.length,
    apiSecretHasSpaces: /\s/.test(secret)
  });
};
