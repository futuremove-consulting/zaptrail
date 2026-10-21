-- ZT-008 — ZapTrail Management Objects (Task, Decision, Opportunity, Commitment, Alert)
-- Ponytail: minimal schema using Supabase building blocks, English identifiers only, RLS by tenant_id

-- --------------------------------------------------------
-- 1. management_objects — Gestão objects with evidence and confidence
-- --------------------------------------------------------

create table if not exists management_objects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  object_type text not null check (object_type in ('task', 'decision', 'opportunity', 'commitment', 'alert')),
  title text not null,
  origin_message_id uuid references messages(id) on delete set null,
  status text not null default 'pending', -- pending, confirmed, rejected
  confidence numeric not null default 0.5, -- 0.0 a 1.0, from LLM extraction
  deadline timestamptz,
  metadata jsonb not null default '{}'::jsonb, -- object-type-specific fields
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(workspace_id, origin_message_id) -- prevent duplicate objects from same message
);

comment on table management_objects is 'Gestão objects (Task, Decision, Opportunity, Commitment, Alert) with evidence and confidence (Fechado)';
comment on column management_objects.object_type is 'Type: task, decision, opportunity, commitment, alert';
comment on column management_objects.status is 'State: pending, confirmed, rejected';
comment on column management_objects.confidence is 'LLM extraction confidence score, 0.0 a 1.0';
comment on column management_objects.metadata is 'JSONB with object-specific fields (deadline, assignedTo, potentialValue, etc.)';
comment on column management_objects.assigned_to is 'User ID assigned to execute this object';
comment on column management_objects.origin_message_id is 'Original message that triggered object creation';

-- --------------------------------------------------------
-- 2. Row Level Security policies (tenant isolation)
-- --------------------------------------------------------

alter table enable row level security;

-- Users can view management objects in their workspace
create policy "Users can view management objects in their workspace"
  on management_objects
  for select
  using (exists (
    select 1 from memberships
    where workspace_id = management_objects.workspace_id
    and user_id = auth.uid()
    and status = 'active'
  ));

-- Users can create management objects in their workspace
create policy "Users can create management objects in their workspace"
  on management_objects
  for insert
  with check (exists (
    select 1 from memberships
    where workspace_id = management_objects.workspace_id
    and user_id = auth.uid()
    and status = 'active'
  ));

-- Users can update their management objects (or if they're owner of workspace)
create policy "Users can update their management objects"
  on management_objects
  for update
  using (assigned_to = auth.uid() or exists (
    select 1 from memberships
    where workspace_id = management_objects.workspace_id
    and user_id = auth.uid()
    and status = 'owner'
  ));

-- --------------------------------------------------------
-- 3. Indexes for performance
-- --------------------------------------------------------

create index if not exists idx_management_objects_workspace on management_objects(workspace_id);
create index if not exists idx_management_objects_type on management_objects(object_type);
create index if not exists idx_management_objects_status on management_objects(status);
create index if not exists idx_management_objects_deadline on management_objects(deadline);
create index if not exists idx_management_objects_assigned_to on management_objects(assigned_to);
create unique index if not exists uq_management_objects_workspace_message on management_objects(workspace_id, origin_message_id);

-- --------------------------------------------------------
-- 4. Triggers for updated_at
-- --------------------------------------------------------

create or replace function handle_management_objects_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger handle_management_objects_updated_at_trigger
  after update on management_objects
  for each row
  execute function handle_management_objects_updated_at();

-- --------------------------------------------------------
-- 5. Default seed data for new tenants (minimal)
-- --------------------------------------------------------

insert into management_objects (id, workspace_id, object_type, title, status, confidence, metadata, created_at, updated_at)
select '00000000-0000-0000-0000-000000000020'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'task'::text, 'Test task object'::text, 'pending'::text, 0.5::numeric, '{"note":"seed data"}'::jsonb, now(), now()
where not exists (select 1 from management_objects where origin_message_id = '00000000-0000-0000-0000-000000000020'::uuid);

comment on table management_objects is 'Gestão objects (Task, Decision, Opportunity, Commitment, Alert) with evidence and confidence (Fechado)';