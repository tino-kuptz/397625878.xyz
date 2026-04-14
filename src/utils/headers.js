/**
 * Strips proxy and Cloudflare-style headers from the object used for logging
 * (client IP is stored separately).
 * @param {import('http').IncomingHttpHeaders} headers
 * @returns {Record<string, string | string[] | undefined>}
 */
export function stripProxyHeaders(headers) {
  const cleaned = {};

  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    if (
      lower.startsWith('cf-') ||
      lower.startsWith('x-forwarded-') ||
      lower === 'x-real-ip'
    ) {
      continue;
    }
    cleaned[key] = value;
  }

  return cleaned;
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {string}
 */
export function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') {
    return xff.split(',')[0].trim() || 'unknown';
  }
  if (Array.isArray(xff) && xff[0]) {
    return xff[0].split(',')[0].trim() || 'unknown';
  }

  const xri = req.headers['x-real-ip'];
  if (typeof xri === 'string' && xri.trim()) {
    return xri.trim();
  }

  const remote = req.socket?.remoteAddress;
  if (remote?.startsWith('::ffff:')) {
    return remote.slice(7);
  }

  return remote || 'unknown';
}
