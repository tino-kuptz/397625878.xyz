/**
 * Extracts subdomain from hostname
 * @param {string} host - The hostname
 * @returns {string} - The subdomain
 */
export function extractSubdomain(host) {
  if (host.endsWith('.397625878.xyz')) {
    return host.replace('.397625878.xyz', '');
  } else if (host.endsWith('.localhost')) {
    return host.replace('.localhost', '');
  } else {
    return host;
  }
}

/**
 * Gets request body as text
 * @param {Request} request - The request object
 * @returns {Promise<string>} - The request body as text
 */
export async function getRequestBody(request) {
  try {
    const clonedRequest = request.clone();
    return await clonedRequest.text();
  } catch (error) {
    return '[Error reading body]';
  }
}

/**
 * Prepares request data for database storage
 * @param {string} subdomain - The subdomain
 * @param {Object} headers - The cleaned headers
 * @param {string} body - The request body
 * @param {string} ip - The real IP address
 * @param {Request} request - The original request object
 * @returns {Object} - Formatted request data
 */
export function prepareRequestData(subdomain, headers, body, ip, request) {
  return {
    host: subdomain,
    headers: JSON.stringify(headers),
    body: body,
    timestamp: new Date().toISOString(),
    ip: ip,
    method: request.method,
    url: request.url,
    user_agent: request.headers.get('user-agent') || ''
  };
}
