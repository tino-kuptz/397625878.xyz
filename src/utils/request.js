import { stripProxyHeaders, getClientIp } from './headers.js';

const DEFAULT_BODY_LIMIT = 10 * 1024 * 1024;

/** RFC 4122 hyphenated UUID (version-agnostic). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Host must be `<uuid>.<BASE_DOMAIN>` (port in Host header is ignored).
 * Returns lowercase UUID or null if invalid.
 * @param {string | undefined} hostHeader
 * @param {string} baseDomain
 * @returns {string | null}
 */
export function extractTenantUuidFromHost(hostHeader, baseDomain) {
  if (!hostHeader || !baseDomain) return null;

  const hostname = hostHeader.split(':')[0].trim().toLowerCase();
  const domain = baseDomain.trim().toLowerCase();
  const suffix = `.${domain}`;

  if (!hostname.endsWith(suffix)) return null;

  const uuid = hostname.slice(0, -suffix.length);
  if (!UUID_RE.test(uuid)) return null;

  return uuid.toLowerCase();
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {number} limitBytes
 * @returns {Promise<string>}
 */
export function readRequestBody(req, limitBytes = DEFAULT_BODY_LIMIT) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        req.destroy();
        reject(new Error('Request body too large'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
  });
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {string}
 */
export function buildRequestUrl(req) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto =
    (typeof forwardedProto === 'string'
      ? forwardedProto.split(',')[0].trim()
      : undefined) || (req.socket?.encrypted ? 'https' : 'http');
  const host = req.headers.host || 'localhost';
  return `${proto}://${host}${req.url || '/'}`;
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {string} body
 * @param {string} tenantUuid lowercase UUID from Host (see extractTenantUuidFromHost)
 * @returns {{
 *   host: string;
 *   headers: string;
 *   body: string;
 *   logged_at: Date;
 *   ip: string;
 *   method: string;
 *   url: string;
 *   user_agent: string | null;
 * }}
 */
export function prepareRequestLogRow(req, body, tenantUuid) {
  const headers = stripProxyHeaders(req.headers);
  const ua = req.headers['user-agent'];

  return {
    host: tenantUuid,
    headers: JSON.stringify(headers),
    body,
    logged_at: new Date(),
    ip: getClientIp(req),
    method: req.method || 'GET',
    url: buildRequestUrl(req),
    user_agent: typeof ua === 'string' ? ua : ua?.[0] ?? null,
  };
}
