import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { POST as ingestWhatsappPost } from './app/api/v1/ingest/whatsapp/route';

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB payload ceiling

function readRequestBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer | string) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buf.length;
      if (total > MAX_BODY_BYTES) {
        req.destroy(new Error('Payload Too Large'));
        return;
      }
      chunks.push(buf);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

function buildHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else if (typeof value === 'string') {
      headers.set(key, value);
    }
  }
  return headers;
}

async function sendWebResponse(res: ServerResponse, webRes: Response): Promise<void> {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const text = await webRes.text();
  res.end(text);
}

/**
 * Creates the standalone ZapTrail HTTP server mounting:
 * - GET /health
 * - POST /api/v1/ingest/whatsapp
 */
export function createZapTrailHttpServer(): Server {
  return createServer(async (req, res) => {
    try {
      const host = req.headers.host || 'localhost:3001';
      const url = new URL(req.url || '/', `http://${host}`);

      if (req.method === 'GET' && url.pathname === '/health') {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify({
            status: 'ok',
            service: 'zaptrail',
            version: '1.1.0',
            timestamp: new Date().toISOString(),
          })
        );
        return;
      }

      if (url.pathname === '/api/v1/ingest/whatsapp') {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        const bodyBuffer = await readRequestBody(req);
        const webReq = new Request(url.toString(), {
          method: 'POST',
          headers: buildHeaders(req),
          body: new Uint8Array(bodyBuffer),
        });

        const webRes = await ingestWhatsappPost(webReq);
        await sendWebResponse(res, webRes);
        return;
      }

      res.statusCode = 404;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Not Found' }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.statusCode = message === 'Payload Too Large' ? 413 : 500;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ success: false, error: message }));
    }
  });
}

// Start standalone HTTP server when executed directly
const isDirectRun =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

if (isDirectRun) {
  const port = Number(process.env.ZAPTRAIL_PORT || process.env.PORT || 3001);
  const host = process.env.ZAPTRAIL_HOST || '0.0.0.0';
  const server = createZapTrailHttpServer();
  server.listen(port, host, () => {
    process.stdout.write(
      JSON.stringify({
        level: 'info',
        service: 'zaptrail',
        message: `ZapTrail standalone HTTP server listening on http://${host}:${port}`,
      }) + '\n'
    );
  });
}
