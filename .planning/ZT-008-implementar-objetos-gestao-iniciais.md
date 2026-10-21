# ZT-008 — Implementar Objetos de Gestão Iniciais

**Ponytail**: minimal CRUD for 5 objects using Supabase building blocks, English identifiers only, RLS by tenant_id

## Objective
Implement full CRUD operations for the 5 management objects (Task, Decision, Opportunity, Commitment, Alert) with:
- Database tables with RLS policies
- API routes for create, read, update, delete
- Object-state management (pending → confirmed/rejected)
- Evidence linkage to original messages
- Tenant isolation by workspace_id

## Canonical Objects (Fechado)
| Type | Description | Key Fields |
|---|---|---|
| `task` | Tarefa/follow-up with deadline | title, deadline, assignedTo, status |
| `decision` | Decision taken in conversation | title, deadline, metadata, status |
| `opportunity` | Business opportunity detected | title, potentialValue, followUpDeadline, status |
| `commitment` | Promise/commitment made | title, paymentMethod, deadline, assignedTo, status |
| `alert` | Occurrence/risk alert | title, severity, metadata, status |

## Database Schema (ZT-008)

### Table: management_objects
```sql
create table if not exists management_objects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  object_type text not null check (object_type in ('task', 'decision', 'opportunity', 'commitment', 'alert')),
  title text not null,
  origin_message_id uuid references messages(id) on delete set null,
  status text not null default 'pending', -- pending, confirmed, rejected
  confidence numeric not null default 0.5, -- 0.0 a 1.0
  deadline timestamptz,
  metadata jsonb not null default '{}'::jsonb, -- object-type-specific fields
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table management_objects is 'Gestão objects (Task, Decision, Opportunity, Commitment, Alert) with evidence and confidence';
comment on column management_objects.object_type is 'Type: task, decision, opportunity, commitment, alert';
comment on column management_objects.status is 'State: pending, confirmed, rejected';
comment on column management_objects.confidence is 'LLM extraction confidence score';
comment on column management_objects.metadata is 'JSONB with object-specific fields (deadline, assignedTo, potentialValue, etc.)';
```

### Row Level Security Policies
- Users can view management_objects in their workspace via membership
- Users can insert management_objects (create) in their workspace
- Users can update management_objects they created or have permission
- Cascade delete when workspace is deleted

### Indexes
- `idx_management_objects_workspace` on workspace_id
- `idx_management_objects_type` on object_type
- `idx_management_objects_status` on status
- `idx_management_objects_deadline` on deadline
- `idx_management_objects_assigned_to` on assigned_to
- Unique constraint on (workspace_id, origin_message_id) to prevent duplicate objects from same message

### Triggers
- `handle_management_objects_updated_at()` — sets updated_at on update

## API Routes (Next.js App Router)

### GET `/api/management-objects`
- Query: `?workspace=ws_id&type=task&status=pending&assignedTo=user_id`
- Returns list of management objects for workspace

### POST `/api/management-objects`
- Body: `{ object_type, title, origin_message_id, confidence?, deadline?, metadata?, assigned_to? }`
- Creates new management object with status='pending'
- Returns created object

### PUT `/api/management-objects/[id]`
- Body: partial update fields (status, confidence, deadline, metadata, assigned_to)
- Only allows status transition: pending → confirmed/rejected
- Returns updated object

### DELETE `/api/management-objects/[id]`
- Soft delete: sets status='rejected' or archives
- Or hard delete if user has permission

## MockProvider Integration (ZT-008.1)
- `MockWhatsAppProvider.getExtractedObjects(chatId)` now persists extracted objects to DB
- On initialization, objects are created with status='pending' and confidence from extraction
- User can confirm/reject objects via API, updating status and metadata

## RLS Policies (management_objects)
```sql
-- Users can view objects in their workspace
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

-- Users can update their own management objects
create policy "Users can update their management objects"
  on management_objects
  for update
  using (assigned_to = auth.uid() or exists (
    select 1 from memberships
    where workspace_id = management_objects.workspace_id
    and user_id = auth.uid()
    and status = 'owner'
  ));
```

## Key Constraints (Fechado)
- English identifiers only (no Portuguese mixing)
- RLS by tenant_id (workspace_id) on all tables
- Object type restricted to: task, decision, opportunity, commitment, alert
- Status transitions: pending → confirmed / pending → rejected (not reversible without new object)
- Each origin_message_id can only produce one object (unique constraint)
- Confidence scores persist for audit trail

## Implementation Path (ZT-008.1 to ZT-008.5)
- ZT-008.1: Create management_objects table + RLS + indexes + triggers
- ZT-008.2: API routes (GET, POST, PUT, DELETE) for management objects
- ZT-008.3: MockProvider persistence — on init, create objects from fixtures with status='pending'
- ZT-008.4: Object confirmation/rejection UI and API (status transition)
- ZT-008.5: Tests and compliance verification

## Compliance
- All English identifiers per global_rules.md §9
- RLS by tenant_id per global_rules.md §☁️
- Build-first: Supabase migrations only, no custom infra
- MockProvider first, UAZAPI spike depois (ZT-012)