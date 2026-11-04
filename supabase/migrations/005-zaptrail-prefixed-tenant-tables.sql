-- Migration 005: Non-Colliding ZapTrail Tables Compatible with PilotCRM Shared Supabase (Decision 4)
-- Uses `zaptrail_` table prefix and `tenant_id` isolation so ZapTrail and PilotCRM
-- can safely share a single Supabase database without colliding on `messages` or `conversations`.

CREATE TABLE IF NOT EXISTS zaptrail_origin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  provider text NOT NULL DEFAULT 'whatsapp',
  external_message_id text NOT NULL,
  conversation_id text NOT NULL,
  sender_id text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  raw_text text NOT NULL DEFAULT '',
  normalized_text text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT zaptrail_origin_messages_idempotency_uq UNIQUE (tenant_id, provider, external_message_id)
);

CREATE TABLE IF NOT EXISTS zaptrail_extraction_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id text NOT NULL,
  tenant_id text NOT NULL,
  conversation_id text NOT NULL,
  turn_id text NOT NULL,
  domain_key text NOT NULL,
  parser_version text NOT NULL,
  extractor_type text NOT NULL,
  llm_invoked boolean NOT NULL DEFAULT false,
  llm_error boolean NOT NULL DEFAULT false,
  review_required boolean NOT NULL DEFAULT false,
  envelope_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT zaptrail_extraction_runs_envelope_uq UNIQUE (tenant_id, envelope_id)
);

CREATE TABLE IF NOT EXISTS zaptrail_evidence_spans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  external_message_id text NOT NULL,
  target_id text NOT NULL,
  exact_quote text NOT NULL,
  char_start integer,
  char_end integer,
  epistemic_status text NOT NULL,
  confidence numeric(5,4) NOT NULL,
  hallucination_detected boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zaptrail_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id text NOT NULL,
  tenant_id text NOT NULL,
  conversation_id text NOT NULL,
  target_id text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'edited', 'rejected')),
  original_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved_payload jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewer_id text,
  reviewer_notes text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT zaptrail_review_queue_uq UNIQUE (tenant_id, review_id)
);

ALTER TABLE zaptrail_origin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE zaptrail_extraction_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zaptrail_evidence_spans ENABLE ROW LEVEL SECURITY;
ALTER TABLE zaptrail_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY zaptrail_origin_messages_tenant_isolation ON zaptrail_origin_messages
  FOR ALL USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY zaptrail_extraction_runs_tenant_isolation ON zaptrail_extraction_runs
  FOR ALL USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY zaptrail_evidence_spans_tenant_isolation ON zaptrail_evidence_spans
  FOR ALL USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY zaptrail_review_queue_tenant_isolation ON zaptrail_review_queue
  FOR ALL USING (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');

REVOKE ALL ON zaptrail_origin_messages FROM anon;
REVOKE ALL ON zaptrail_extraction_runs FROM anon;
REVOKE ALL ON zaptrail_evidence_spans FROM anon;
REVOKE ALL ON zaptrail_review_queue FROM anon;
