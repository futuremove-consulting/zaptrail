# ZT-009 — Criar Aplicação Web Mobile-First e Timeline Dual

**Ponytail**: Next.js App Router + shadcn/ui mobile-first, English identifiers only, RLS integration

## Objective
Build the responsive web application as the "moment concentrado" — analysis, review, and operation surface. Mobile-first design that works excellent on notebook and celular. Core feature: timeline dual (conversa original + timeline semantica + "Mostrar na conversa").

## Architecture (Fechado)
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI**: React + Tailwind CSS + shadcn/ui components
- **State**: React Query (TanStack) for data fetching, SWR for revalidation
- **Backend**: Supabase (Postgres, RLS, Auth, Storage, Edge Functions)
- **Routing**: App Router with `(app)` and `(marketing)` segments
- **Responsive**: Tailwind breakpoints `sm`, `md`, `lg`, `xl`; mobile-first by default

## Directory Structure (Next.js App Router)
```
src/
  app/
    (app)/
      layout.tsx       — Global layout with auth wrapper, sidebar, header
      page.tsx         — Home/dashboard (recent conversations, quick actions)
      conversations/
        page.tsx       — List conversations with search/filter
        [conversation]/
          page.tsx     — Conversation view with timeline dual
      projects/
        page.tsx       — Projects listing
      workspaces/
        page.tsx       — Workspace selector
    api/
      management-objects/
        route.ts       — CRUD API for management objects
        webhooks/
          whatsapp.ts  — WhatsApp webhook handler
  components/
    ui/              — shadcn/ui components (button, card, input, etc.)
    layout/          — Sidebar, Header, Navbar
    conversations/   — ConversationList, ConversationCard
    timeline/        — TimelineDual, ConversationTimeline, SemanticTimeline
    management/      — ManagementObjectCard, ObjectForm, ConfirmationModal
    onboarding/      — OnboardingWizard, ProviderStatus
  hooks/             — useConversations, useManagementObjects, useSupabase
  lib/               — supabase client, utils, constants
```

## Core Features

### 1. Timeline Dual (ZT-009.1)
Two complementary views on the same conversation:

#### A. Conversa Original
- Full message list with participant avatars
- Search within conversation
- Filter by message type (message, status, reaction)
- Export/share individual messages

#### B. Timeline Semântica
- **Objetos detectados** — cards for each Task/Decision/Opportunity/Commitment/Alert
- **Evidência** — each object links to origin message with excerpt
- **Status** — pending/confirmed/rejected with visual indicator
- **Actions** — confirm, reject, edit each object
- **Deep link** — "Mostrar na conversa" jumps to message origin

#### C. "Mostrar na conversa" (ZT-009.2)
- Deep link tokenized: `/conversation/[id]?anchor=msg_[id]`
- Server-side token validation + workspace authorization
- Jumps conversation view to specific message
- Highlights the evidence message with visual overlay

### 2. Conversation Selection (ZT-009.3)
- List all conversations with preview (last message, object count)
- Search by participant name/number
- Group vs 1:1 toggle
- Recent vs All toggle

### 3. Management Object Inline Editing (ZT-009.4)
- Click-to-edit object title, deadline, assignedTo
- Status transition: pending → confirmed / pending → rejected
- Inline confirmation modal for status changes
- Confidence score display (0.0-1.0) with visual meter

## API Routes (Next.js App Router)

### GET `/api/management-objects?workspace=ws&type=t&status=p`
- Returns objects filtered by workspace, type, status

### POST `/api/management-objects`
- Body: `{ object_type, title, origin_message_id, confidence?, deadline?, metadata?, assigned_to? }`
- Creates object with status='pending'

### PUT `/api/management-objects/[id]`
- Body: partial update (status, confidence, deadline, metadata, assigned_to)
- Only allows: pending → confirmed / pending → rejected

### GET `/api/conversations?workspace=ws&search=term`
- Returns conversations with preview data (last message, object count)

### GET `/api/conversations/[id]/messages?limit=20&anchor=msg_x`
- Returns messages starting from anchored message

## MockProvider Integration (ZT-009.5)
- On app load, fetch management objects from MockProvider
- If no real provider, display fixtures as demo data
- "Mostrar na conversa" works with fixture message IDs
- UI toggles between MockProvider and real provider mode

## RLS (Row Level Security)
- All management_objects queries filtered by `workspace_id` from user's membership
- Users can only access conversations in their authorized workspaces
- Deep links validated server-side against workspace membership

## Compliance
- **English identifiers only** per `global_rules.md §9` — all component props, variables, filenames
- **Build-first**: Next.js + shadcn/ui + Supabase building blocks, no custom infra
- **MockProvider first** — UI works with demo data before real provider
- **Mobile-first**: Tailwind mobile-first breakpoints, responsive from 320px
- **No Portuguese mixing** — all identifiers, comments, and user-facing text in English

## Implementation Path (ZT-009.1 to ZT-009.6)
- ZT-009.1: Create Next.js App Router structure with layout, mobile-first Tailwind config
- ZT-009.2: Implement TimelineDual component (conversa original + semantic timeline)
- ZT-009.3: Implement conversation selection and evidence display
- ZT-009.4: Implement "Mostrar na conversa" deep link with token validation
- ZT-009.5: Integrate MockProvider fixtures as demo data
- ZT-009.6: Tests, compliance verification, responsive design audit

## Key Dependencies
- `next` — App Router
- `react`, `react-dom` — UI
- `@tanstack/react-query` — data fetching
- `@tanstack/react-table` — object table (if needed)
- `shadcn/ui` — UI components (button, card, input, dialog, etc.)
- `tailwindcss` — mobile-first responsive styling
- `supabase` — backend/PLSQL
- `@supabase/ssr` — Next.js integration

## Visual Design Guidelines (Mobile-First)
- **Max width**: 640px mobile, 768px tablet, 1024px desktop, 1280px large
- **Typography**: Tailwind `text-sm`, `text-base`, `text-lg` with `leading-relaxed`
- **Spacing**: `p-2`, `p-4`, `p-6` system; `gap-2`, `gap-4`, `gap-6`
- **Color**: Tailwind theme respecting dark mode, semantic colors for object types:
  - task: `bg-blue-100 text-blue-800` (light), `bg-blue-900 text-blue-200` (dark)
  - decision: `bg-purple-100 text-purple-800` (light), `bg-purple-900 text-purple-200` (dark)
  - opportunity: `bg-green-100 text-green-800` (light), `bg-green-900 text-green-200` (dark)
  - commitment: `bg-orange-100 text-orange-800` (light), `bg-orange-900 text-orange-200` (dark)
  - alert: `bg-red-100 text-red-800` (light), `bg-red-900 text-red-200` (dark)
- **Responsive**: `flex-col md:flex-row`, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Accessibility**: `focus-visible`, `sr-only` for icon-only buttons, aria-labels on deep links