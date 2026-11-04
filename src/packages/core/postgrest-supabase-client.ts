import {
  OriginMessageRecord,
  ExtractionRunRecord,
  EvidenceSpanRecord,
  ReviewQueueRecord,
} from './supabase-storage';

export interface PostgrestSupabaseClientOptions {
  supabaseUrl?: string;
  serviceRoleKey?: string;
  tablePrefix?: string;
  fetchFn?: typeof fetch;
}

/**
 * Lightweight PostgREST client for real Supabase persistence without colliding
 * with PilotCRM's canonical `messages` / `conversations` tables (uses `zaptrail_` prefix by default).
 */
export class PostgrestSupabaseClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly prefix: string;
  private readonly fetchFn: typeof fetch;

  constructor(options?: PostgrestSupabaseClientOptions) {
    const rawUrl = options?.supabaseUrl || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.baseUrl = rawUrl.replace(/\/$/, '');
    this.apiKey = options?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.prefix = options?.tablePrefix ?? 'zaptrail_';
    this.fetchFn = options?.fetchFn ?? fetch;
  }

  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.apiKey);
  }

  private headers(prefer?: string): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
    };
    if (prefer) h.Prefer = prefer;
    return h;
  }

  public async checkProcessed(tenantId: string, provider: string, externalMessageId: string): Promise<boolean> {
    const url = `${this.baseUrl}/rest/v1/${this.prefix}origin_messages?tenant_id=eq.${encodeURIComponent(tenantId)}&provider=eq.${encodeURIComponent(provider)}&external_message_id=eq.${encodeURIComponent(externalMessageId)}&select=external_message_id&limit=1`;
    const res = await this.fetchFn(url, { method: 'GET', headers: this.headers() });
    if (!res.ok) return false;
    const rows = (await res.json()) as unknown[];
    return Array.isArray(rows) && rows.length > 0;
  }

  public async insertProcessedMarker(tenantId: string, provider: string, externalMessageId: string): Promise<void> {
    const url = `${this.baseUrl}/rest/v1/${this.prefix}origin_messages`;
    await this.fetchFn(url, {
      method: 'POST',
      headers: this.headers('resolution=merge-duplicates,return=minimal'),
      body: JSON.stringify({
        tenant_id: tenantId,
        provider,
        external_message_id: externalMessageId,
        conversation_id: 'system',
        sender_id: 'system',
        direction: 'inbound',
        raw_text: '',
        normalized_text: '',
      }),
    });
  }

  public async insertExtractionRun(run: ExtractionRunRecord): Promise<void> {
    const url = `${this.baseUrl}/rest/v1/${this.prefix}extraction_runs`;
    await this.fetchFn(url, {
      method: 'POST',
      headers: this.headers('resolution=ignore-duplicates,return=minimal'),
      body: JSON.stringify(run),
    });
  }

  public async insertEvidenceSpans(spans: EvidenceSpanRecord[]): Promise<void> {
    if (spans.length === 0) return;
    const url = `${this.baseUrl}/rest/v1/${this.prefix}evidence_spans`;
    await this.fetchFn(url, {
      method: 'POST',
      headers: this.headers('resolution=ignore-duplicates,return=minimal'),
      body: JSON.stringify(spans),
    });
  }

  public async upsertReviewItems(items: ReviewQueueRecord[]): Promise<void> {
    if (items.length === 0) return;
    const url = `${this.baseUrl}/rest/v1/${this.prefix}review_queue`;
    await this.fetchFn(url, {
      method: 'POST',
      headers: this.headers('resolution=merge-duplicates,return=minimal'),
      body: JSON.stringify(items),
    });
  }

  public async upsertOriginMessageRow(record: OriginMessageRecord): Promise<void> {
    const url = `${this.baseUrl}/rest/v1/${this.prefix}origin_messages`;
    await this.fetchFn(url, {
      method: 'POST',
      headers: this.headers('resolution=merge-duplicates,return=minimal'),
      body: JSON.stringify(record),
    });
  }
}
