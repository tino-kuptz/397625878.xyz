import pg from 'pg';

/**
 * @returns {pg.Pool}
 */
export function createPool() {
  const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
  } = process.env;

  if (!POSTGRES_HOST || !POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB) {
    throw new Error(
      'Missing PostgreSQL env: POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB are required',
    );
  }

  return new pg.Pool({
    host: POSTGRES_HOST,
    port: Number(POSTGRES_PORT || 5432),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  });
}

/**
 * @param {pg.Pool} pool
 * @param {{
 *   host: string;
 *   headers: string;
 *   body: string;
 *   logged_at: Date;
 *   ip: string;
 *   method: string;
 *   url: string;
 *   user_agent: string | null;
 * }} row
 */
export async function logRequest(pool, row) {
  await pool.query(
    `INSERT INTO http_request_logs (host, headers, body, logged_at, ip, method, url, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      row.host,
      row.headers,
      row.body,
      row.logged_at,
      row.ip,
      row.method,
      row.url,
      row.user_agent,
    ],
  );
}
