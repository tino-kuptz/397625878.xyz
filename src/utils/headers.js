/**
 * Strips Cloudflare-specific headers from request headers
 * @param {Headers} headers - The original request headers
 * @returns {Object} - Object containing cleaned headers
 */
export function stripCloudflareHeaders(headers) {
  const cleanedHeaders = {};
  
  for (const [key, value] of headers.entries()) {
    if (!key.toLowerCase().startsWith('cf-') && 
        !key.toLowerCase().startsWith('x-forwarded-') &&
        key.toLowerCase() !== 'x-real-ip') {
      cleanedHeaders[key] = value;
    }
  }
  
  return cleanedHeaders;
}

/**
 * Extracts the real IP address from Cloudflare headers
 * @param {Headers} headers - The request headers
 * @returns {string} - The real IP address or 'unknown'
 */
export function getRealIp(headers) {
  const cfConnectingIp = headers.get('cf-connecting-ip');
  const xForwardedFor = headers.get('x-forwarded-for');
  
  return cfConnectingIp || xForwardedFor?.split(',')[0] || 'unknown';
}