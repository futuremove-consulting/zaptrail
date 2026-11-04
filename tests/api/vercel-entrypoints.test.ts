import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GET as healthGet } from '../../api/health';
import { POST as vercelIngestPost } from '../../api/v1/ingest/whatsapp';
import { POST as canonicalIngestPost } from '../../src/app/api/v1/ingest/whatsapp/route';

describe('Vercel Serverless Entrypoints', () => {
  it('GET /api/health returns 200 with service metadata and security headers', async () => {
    const response = await healthGet();
    expect(response.status).toBe(200);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('cache-control')).toBe('no-store');

    const body = (await response.json()) as {
      status: string;
      service: string;
      version: string;
      timestamp: string;
    };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('zaptrail');
    expect(body.version).toBe('1.1.0');
    expect(typeof body.timestamp).toBe('string');
  });

  it('api/v1/ingest/whatsapp.ts re-exports the canonical POST handler', () => {
    expect(vercelIngestPost).toBe(canonicalIngestPost);
  });

  it('vercel.json defines /health rewrite to /api/health', () => {
    const raw = readFileSync(join(process.cwd(), 'vercel.json'), 'utf8');
    const parsed = JSON.parse(raw) as {
      rewrites?: Array<{ source: string; destination: string }>;
    };
    expect(parsed.rewrites).toEqual(
      expect.arrayContaining([
        { source: '/health', destination: '/api/health' },
      ]),
    );
  });
});
