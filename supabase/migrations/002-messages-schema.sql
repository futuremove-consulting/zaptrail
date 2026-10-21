-- ZT-006 — ZapTrail Messages, Participants, Attachments & Inbound Events Schema
-- Ponytail: minimal schema using Supabase building blocks, English identifiers only
-- Deduplication: unique constraint on external_message_id prevents duplicate webhook payloads

-- --------------------------------------------------------
-- 1. messages — Persisted WhatsApp messages with provenance
-- --------------------------------------------------------

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  external_message_id text not null, -- Unique ID from provider (evolution_msg_id, etc.)
  workspace_id uuid not null references workspaces(id) on delete cascade,
  conversation_id uuid not null, -- References conversations table (may need separate migration)
  participant_id uuid not null, -- Sender participant
  body text,
  kind text not null default 'message', -- message, status, reaction, etc.
  direction text not null default 'inbound', -- inbound, outbound
  status text not null default 'unread', -- unread, read, delivered, failed
  media_url text, -- Reference to Supabase Storage
  metadata jsonb not null default '{}'::jsonb, -- Additional provider-specific data
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table messages is 'Persisted WhatsApp messages with full provenance and deduplication';
comment on column messages.external_message_id is 'Unique ID from WhatsApp provider to enable deduplication';
comment on column messages.direction is 'inbound (received) or outbound (sent)';
comment on column messages.kind is 'message type: message, status, reaction, typing, etc.';

-- --------------------------------------------------------
-- 2. conversation_participants — Conversation participant tracking
-- --------------------------------------------------------

create table if not exists conversation_participants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  whatsapp_number text not null, -- WhatsApp number in international format
  role text not null default 'participant', -- participant, admin, creator
  status text not null default 'active', -- active, left, banned
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(workspace_id, conversation_id, whatsapp_number)
);

comment on table conversation_participants is 'Tracks participants within a workspace conversation';
comment on column conversation_participants.role is 'Role: participant, admin, creator';
comment on column conversation_participants.status is 'Status: active, left, banned';

-- --------------------------------------------------------
-- 3. message_attachments — Media/attachment references for messages
-- --------------------------------------------------------

create table if not exists message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  storage_path text not null, -- Supabase Storage path/URL
  mime_type text not null, -- e.g., image/jpeg, audio/ogg, etc.
  size_bytes bigint not null default 0,
  description text, -- Optional description/title
  created_at timestamptz not null default now()

);

comment on table message_attachments is 'File attachment references linked to messages';
comment on column message_attachments.mime_type is 'MIME type of the attached file';
comment on column message_attachments.size_bytes is 'File size in bytes';

-- --------------------------------------------------------
-- 4. inbound_events — Webhook events with deduplication
-- --------------------------------------------------------

create table if not exists inbound_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  event_type text not null, -- message, callback, delivery, read, etc.
  external_event_id text not null, -- Unique ID from provider
  message_id uuid references messages(id) on delete set null,
  payload jsonb not null default '{}'::jsonb, -- Raw webhook payload
  processed boolean not null default false,
  processing_error text,
  processed_at timestamptz,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(workspace_id, external_event_id)
);

comment on table inbound_events is 'Inbound webhook events from WhatsApp provider with deduplication';
comment on column inbound_events.event_type is 'Type: message, callback, delivery, read, etc.';
comment on column inbound_events.external_event_id is 'Unique ID from provider for deduplication';
comment on column inbound_events.processed is 'Whether the event has been processed by the pipeline';

-- --------------------------------------------------------
-- 5. Row Level Security policies (tenant isolation)
-- --------------------------------------------------------

alter table enable row level security;

-- Messages: users can view messages in their workspaces via membership
create policy "Users can view messages in their workspaces"
  on messages
  for select
  using (exists (
    select 1 from memberships
    where workspace_id = messages.workspace_id
    and user_id = auth.uid()
    and status = 'active'
  ));

create policy "Users can insert messages"
  on messages
  for insert
  with check (exists (
    select 1 from memberships
    where workspace_id = messages.workspace_id
    and user_id = auth.uid()
    and status = 'active'
  ));

-- Conversation participants: users can view participants in their conversations
create policy "Users can view conversation participants in their workspaces"
  on conversation_participants
  for select
  using (exists (
    select 1 from memberships
    where workspace_id = conversation_participants.workspace_id
    and user_id = auth.uid()
    and status = 'active'
  ));

-- Inbound events: users can view unprocessed events in their workspaces
create policy "Users can view unprocessed inbound events in their workspaces"
  on inbound_events
  for select
  using (exists (
    select 1 from memberships
    where workspace_id = inbound_events.workspace_id
    and user_id = auth.uid()
    and status = 'active'
  ));

create policy "Users can mark inbound events as processed"
  on inbound_events
  for update
  using (user_id = auth.uid())
  with check (processed = true and user_id = auth.uid());

-- --------------------------------------------------------
-- 6. Indexes for performance
-- --------------------------------------------------------

create index if not exists idx_messages_workspace on messages(workspace_id);
create unique index if not exists uq_messages_external_message_id on messages(external_message_id);
-- Ensures deduplication: same external_message_id cannot be persisted twice per workspace
create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_messages_timestamp on messages(timestamp);
create index if not exists idx_messages_direction on messages(direction);

create index if not exists idx_conversation_participants_workspace on conversation_participants(workspace_id);
create index if not exists idx_conversation_participants_user on conversation_participants(user_id);
create index if not exists idx_conversation_participants_convo on conversation_participants(conversation_id);

create index if not exists idx_message_attachments_message on message_attachments(message_id);

create index if not exists idx_inbound_events_workspace on inbound_events(workspace_id);
create index if not exists idx_inbound_events_type on inbound_events(event_type);
create index if not exists idx_inbound_events_external on inbound_events(external_event_id);
create index if not exists idx_inbound_events_processed on inbound_events(processed);

-- --------------------------------------------------------
-- 7. Triggers for updated_at
-- --------------------------------------------------------

create or replace function handle_messages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace function handle_conversation_participants_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace function handle_message_attachments_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace function handle_inbound_events_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger handle_messages_updated_at_trigger
  after update on messages
  for each row
  execute function handle_messages_updated_at();

create trigger handle_conversation_participants_updated_at_trigger
  after update on conversation_participants
  for each row
  execute function handle_conversation_participants_updated_at();

create trigger handle_message_attachments_updated_at_trigger
  after update on message_attachments
  for each row
  execute function handle_message_attachments_updated_at();

create trigger handle_inbound_events_updated_at_trigger
  after update on inbound_events
  for each row
  execute function handle_inbound_events_updated_at();

-- --------------------------------------------------------
-- 8. Default seed data for new tenants (minimal)
-- --------------------------------------------------------

insert into messages (id, external_message_id, workspace_id, conversation_id, participant_id, body, kind, direction, status, timestamp)
select '00000000-0000-0000-0000-000000000010'::uuid, 'test_msg_1'::text, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'Test message'::text, 'message'::text, 'inbound'::text, 'unread'::text, now()
where not exists (select 1 from messages where external_message_id = 'test_msg_1');

insert into conversation_participants (id, workspace_id, conversation_id, user_id, whatsapp_number, role, status, joined_at)
select '00000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, '551199999-1'::text, 'participant'::text, 'active'::text, now()
where not exists (select 1 from conversation_participants where workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

insert into message_attachments (id, message_id, storage_path, mime_type, size_bytes)
select '00000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-0000-0000-000000000010'::uuid, 'test-path.jpg'::text, 'image/jpeg'::text, 1234::bigint
where not exists (select 1 from message_attachments where message_id = '00000000-0000-0000-0000-000000000010'::uuid);

insert into inbound_events (id, workspace_id, event_type, external_event_id, payload, processed, received_at)
select '00000000-0000-0000-0000-000000000013'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'message'::text, 'test_event_1'::text, '{"direction":"inbound"}'::jsonb, false, now()
where not exists (select 1 from inbound_events where external_event_id = 'test_event_1');

comment on table messages is 'Persisted WhatsApp messages with full provenance and deduplication (Fechado)';
comment on table conversation_participants is 'Tracks participants within a workspace conversation (Fechado)';
comment on table message_attachments is 'File attachment references linked to messages (Fechado)';
comment on table inbound_events is 'Inbound webhook events from WhatsApp provider with deduplication (Fechado)';