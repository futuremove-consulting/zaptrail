import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { POST as ingestWhatsappPost } from './app/api/v1/ingest/whatsapp/route';

const DEFAULT_MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB payload ceiling

export interface ZapTrailServerOptions {
  maxBodyBytes?: number;
}

function setSecurityHeaders(res: ServerResponse): void {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('cache-control', 'no-store');
}

function sendJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>): void {
  setSecurityHeaders(res);
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(payload));
}

function readRequestBody(req: IncomingMessage, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const contentLengthHeader = req.headers['content-length'];
    if (contentLengthHeader) {
      const declaredLength = Number(contentLengthHeader);
      if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        req.resume(); // Drain incoming stream so HTTP 413 response can be sent cleanly without ECONNRESET
        reject(new Error('Payload Too Large'));
        return;
      }
    }

    const chunks: Buffer[] = [];
    let total = 0;
    let exceeded = false;

    req.on('data', (chunk: Buffer | string) => {
      if (exceeded) return;
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buf.length;
      if (total > maxBytes) {
        exceeded = true;
        chunks.length = 0;
        req.resume();
        reject(new Error('Payload Too Large'));
        return;
      }
      chunks.push(buf);
    });
    req.on('end', () => {
      if (!exceeded) resolve(Buffer.concat(chunks));
    });
    req.on('error', (err) => {
      if (!exceeded) reject(err);
    });
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
  setSecurityHeaders(res);
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
export function createZapTrailHttpServer(options?: ZapTrailServerOptions): Server {
  const maxBodyBytes = options?.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;

  return createServer(async (req, res) => {
    try {
      const rawHost = req.headers.host || 'localhost:3001';
      const safeHost = /^[a-zA-Z0-9._:-]+$/.test(rawHost) ? rawHost : 'localhost:3001';
      const url = new URL(req.url || '/', `http://${safeHost}`);

      if (req.method === 'GET' && url.pathname === '/health') {
        sendJson(res, 200, {
          status: 'ok',
          service: 'zaptrail',
          version: '1.1.0',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (url.pathname === '/api/v1/ingest/whatsapp') {
        if (req.method !== 'POST') {
          sendJson(res, 405, { success: false, error: 'Method Not Allowed' });
          return;
        }

        const bodyBuffer = await readRequestBody(req, maxBodyBytes);
        const webReq = new Request(url.toString(), {
          method: 'POST',
          headers: buildHeaders(req),
          body: new Uint8Array(bodyBuffer),
        });

        const webRes = await ingestWhatsappPost(webReq);
        await sendWebResponse(res, webRes);
        return;
      }

      sendJson(res, 404, { success: false, error: 'Not Found' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      sendJson(res, message === 'Payload Too Large' ? 413 : 500, {
        success: false,
        error: message,
      });
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
