import 'dotenv/config';
import http from 'http';
import { createPool, logRequest } from './utils/database.js';
import {
  extractTenantUuidFromHost,
  readRequestBody,
  prepareRequestLogRow,
} from './utils/request.js';

const BASE_DOMAIN = process.env.BASE_DOMAIN?.trim();
if (!BASE_DOMAIN) {
  console.error('BASE_DOMAIN is required (e.g. 397625878.xyz or localhost for dev)');
  process.exit(1);
}

const pool = createPool();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer(async (req, res) => {
  try {
    const tenantUuid = extractTenantUuidFromHost(req.headers.host, BASE_DOMAIN);
    if (!tenantUuid) {
      res.writeHead(400, {
        'Content-Type': 'text/plain',
        ...corsHeaders,
      });
      res.end('Invalid host');
      return;
    }

    const body = await readRequestBody(req);
    const row = prepareRequestLogRow(req, body, tenantUuid);
    await logRequest(pool, row);

    res.writeHead(200, {
      'Content-Type': 'text/plain',
      ...corsHeaders,
    });
    res.end(`Request logged for ${tenantUuid}`);
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error && err.message === 'Request body too large'
        ? 'Payload too large'
        : 'Failed to log request';
    const status = message === 'Payload too large' ? 413 : 500;
    res.writeHead(status, { 'Content-Type': 'text/plain', ...corsHeaders });
    res.end(message);
  }
});

const port = Number(process.env.PORT || 8787);

server.listen(port, () => {
  console.log(`Request logger listening on http://0.0.0.0:${port}`);
});

const shutdown = async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
