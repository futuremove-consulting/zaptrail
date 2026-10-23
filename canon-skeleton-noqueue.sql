CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN CREATE ROLE anon; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE authenticated; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE ROLE service_role; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE OR REPLACE FUNCTION public.current_tenant_id() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
CREATE TABLE IF NOT EXISTS public.contacts (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE IF NOT EXISTS public.conversations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid);
CREATE TABLE IF NOT EXISTS public.messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid, external_message_id text, source_provider text, timestamp timestamptz);
CREATE TABLE IF NOT EXISTS public.whatsapp_raw_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid, account_type text, session_id text, processing_status text DEFAULT 'pending', message_timestamp timestamptz);

CREATE TABLE IF NOT EXISTS public.enrichment_proposals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid);

