-- ZT-003 — ZapTrail Workspace, Membership & Onboarding Schema
-- Ponytail: minimal schema using Supabase building blocks, English identifiers only

-- --------------------------------------------------------
-- 1. workspaces — Organizational scope (UserAccount → Workspace)
-- --------------------------------------------------------

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free',
  status text not null default 'active',
  region text not null default 'global',
  retention_policy jsonb not null default '{"messages": "90 days", "objects": "365 days", "analyses": "365 days"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table workspaces is 'Organizational scope containing projects, conversations, and management objects';
comment on column workspaces.plan is 'Pricing tier: free, pro, enterprise';
comment on column workspaces.retention_policy is 'Configurable retention for messages, objects, and analyses';

-- --------------------------------------------------------
-- 2. memberships — UserWorkspace relationships with roles/permissions
-- --------------------------------------------------------

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  role text not null default 'member',
  permissions jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  last_accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  unique(user_id, workspace_id)
);

comment on table memberships is 'User membership within a workspace with role-based permissions';
comment on column memberships.role is 'Role: owner, admin, member, viewer';
comment on column memberships.permissions is 'JSONB bitmask of allowed actions per workspace';
comment on column memberships.last_accessed_at is 'Timestamp of last activity within workspace';

-- --------------------------------------------------------
-- 3. onboarding_state — Per-user onboarding progress tracking
-- --------------------------------------------------------

create table if not exists onboarding_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  step text not null default 'welcome',
  completed boolean not null default false,
  completed_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id)
);

comment on table onboarding_state is 'Tracks per-user onboarding progress through ZT phases';
comment on column onboarding_state.step is 'Current onboarding step: welcome, workspace_setup, provider_connection, first_conversation, complete';
comment on column onboarding_state.data is 'JSONB storage for step-specific data (workspace_id, provider_type, etc.)';
comment on column onboarding_state.completed_at is 'Timestamp when onboarding was completed';

-- --------------------------------------------------------
-- 4. Row Level Security policies (tenant isolation)
-- --------------------------------------------------------

-- Workspaces: users can view their own workspaces via membership
alter table enable row level security;

create policy "Users can view their workspaces"
  on workspaces
  for select
  using (exists (
    select 1 from memberships
    where workspace_id = workspaces.id
    and user_id = auth.uid()
    and status = 'active'
  ));

create policy "Users can insert memberships"
  on memberships
  for insert
  with check (exists (
    select 1 from workspaces
    where id = workspace_id
    and status = 'active'
  ));

create policy "Users can view their own memberships"
  on memberships
  for select
  using (user_id = auth.uid());

-- Onboarding state: users can only access their own state
alter table onboarding_state enable row level security;

create policy "Users can manage their onboarding state"
  on onboarding_state
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- --------------------------------------------------------
-- 5. Indexes for performance
-- --------------------------------------------------------

create index if not exists idx_workspaces_status on workspaces(status);
create index if not exists idx_workspaces_region on workspaces(region);
create index if not exists idx_memberships_workspace on memberships(workspace_id);
create index if not exists idx_memberships_user on memberships(user_id);
create index if not exists idx_memberships_unique on memberships(user_id, workspace_id);
create index if not exists idx_onboarding_user on onboarding_state(user_id);
create index if not exists idx_onboarding_step on onboarding_state(step);

-- --------------------------------------------------------
-- 6. Triggers for updated_at
-- --------------------------------------------------------

create or replace function handle_workspaces_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace function handle_memberships_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace function handle_onboarding_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger handle_workspaces_updated_at_trigger
  after update on workspaces
  for each row
  execute function handle_workspaces_updated_at();

create trigger handle_memberships_updated_at_trigger
  after update on memberships
  for each row
  execute function handle_memberships_updated_at();

create trigger handle_onboarding_updated_at_trigger
  after update on onboarding_state
  for each row
  execute function handle_onboarding_updated_at();

-- --------------------------------------------------------
-- 7. Default workspace seed for new tenants
-- --------------------------------------------------------

insert into workspaces (id, name, plan, status, region, retention_policy)
select '00000000-0000-0000-0000-000000000001'::uuid, 'Default Workspace', 'free', 'active', 'global',
  '{"messages": "90 days", "objects": "365 days", "analyses": "365 days"}'::jsonb
where not exists (select 1 from workspaces where id = '00000000-0000-0000-0000-000000000001'::uuid);

insert into memberships (id, user_id, workspace_id, role, permissions, status)
select '00000000-0000-0000-0000-000000000002'::uuid, auth.uid(), '00000000-0000-0000-0000-000000000001'::uuid, 'owner',
  '{"can_manage_workspace": true, "can_manage_projects": true, "can_manage_objects": true, "can_view_evidence": true, "can_create_objects": true, "can_edit_objects": true, "can_delete_objects": false}'::jsonb,
  'active'
where not exists (select 1 from memberships where workspace_id = '00000000-0000-0000-0000-000000000001'::uuid);

comment on table workspaces is 'Organizational scope containing projects, conversations, and management objects (Fechado)';
comment on table memberships is 'User membership within a workspace with role-based permissions (Fechado)';
comment on table onboarding_state is 'Tracks per-user onboarding progress through ZT phases (Fechado)';