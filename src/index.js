// Header utilities
import { stripCloudflareHeaders, getRealIp } from './utils/headers.js';

// Cloudflare utilities
import { extractSubdomain, getRequestBody, prepareRequestData } from './utils/cloudflare.js';

// Database utilities
import { DatabaseWrapper } from './utils/database.js';


export default {
  async fetch(request, env, _ctx) {
    const url = new URL(request.url);
    const host = url.hostname;
    
    // Get the real IP address and log it
    const realIp = getRealIp(request.headers);
    console.log(`Request from IP: ${realIp} to host: ${host}`);
    
    // Extract subdomain from host
    const subdomain = extractSubdomain(host);
    console.log(`Subdomain: ${subdomain}`);
    
    // Strip Cloudflare headers
    const headers = stripCloudflareHeaders(request.headers);
    
    // Get request body
    const body = await getRequestBody(request);
    
    // Prepare data for database
    const requestData = prepareRequestData(subdomain, headers, body, realIp, request);
    
    // Log to database using wrapper
    const db = new DatabaseWrapper(env.DB);
    await db.logRequest(requestData);
    
    // Return a simple response
    return new Response(`Request logged for ${subdomain}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  },

  // Scheduled function that runs daily at midnight
  async scheduled(event, env, ctx) {
    console.log('Running scheduled cleanup task...');
    
    const db = new DatabaseWrapper(env.DB);
    const deletedCount = await db.cleanupOldRecords(3); // Delete records older than 3 days
    
    console.log(`Cleanup completed: ${deletedCount} records deleted`);
    
    return new Response(`Cleanup completed: ${deletedCount} records deleted`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};
