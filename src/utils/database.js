/**
 * Database wrapper for D1 operations
 */
export class DatabaseWrapper {
  constructor(db) {
    this.db = db;
  }

  /**
   * Logs a request to the database
   * @param {Object} requestData - The request data to log
   * @returns {Promise<boolean>} - Success status
   */
  async logRequest(requestData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO http_request_logs (host, headers, body, timestamp, ip, method, url, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      await stmt.bind(
        requestData.host,
        requestData.headers,
        requestData.body,
        requestData.timestamp,
        requestData.ip,
        requestData.method,
        requestData.url,
        requestData.user_agent
      ).run();
      
      console.log(`Successfully logged request for subdomain: ${requestData.host}`);
      return true;
      
    } catch (error) {
      console.error('Error logging to database:', error);
      return false;
    }
  }

  /**
   * Gets recent requests
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} - Array of recent requests
   */
  async getRecentRequests(limit = 10) {
    try {
      const stmt = this.db.prepare(`
        SELECT host, ip, method, timestamp, url 
        FROM http_request_logs 
        ORDER BY timestamp DESC 
        LIMIT ?
      `);
      
      const result = await stmt.bind(limit).all();
      return result.results;
      
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      return [];
    }
  }

  /**
   * Gets requests by subdomain
   * @param {string} subdomain - The subdomain to filter by
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} - Array of requests for the subdomain
   */
  async getRequestsBySubdomain(subdomain, limit = 50) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM http_request_logs 
        WHERE host = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `);
      
      const result = await stmt.bind(subdomain, limit).all();
      return result.results;
      
    } catch (error) {
      console.error('Error fetching requests by subdomain:', error);
      return [];
    }
  }

  /**
   * Gets requests by IP address
   * @param {string} ip - The IP address to filter by
   * @param {number} limit - Number of records to return
   * @returns {Promise<Array>} - Array of requests from the IP
   */
  async getRequestsByIp(ip, limit = 50) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM http_request_logs 
        WHERE ip = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `);
      
      const result = await stmt.bind(ip, limit).all();
      return result.results;
      
    } catch (error) {
      console.error('Error fetching requests by IP:', error);
      return [];
    }
  }

  /**
   * Deletes records older than specified days
   * @param {number} days - Number of days to keep records
   * @returns {Promise<number>} - Number of records deleted
   */
  async cleanupOldRecords(days) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffTimestamp = cutoffDate.toISOString();
      
      const stmt = this.db.prepare(`
        DELETE FROM http_request_logs 
        WHERE timestamp < ?
      `);
      
      const result = await stmt.bind(cutoffTimestamp).run();
      return result.meta.changes || 0;
      
    } catch (error) {
      console.error('Error cleaning up old records:', error);
      return 0;
    }
  }
}
