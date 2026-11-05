# ZapTrail UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a interface completa do ZapTrail — shell, review inbox, extrações, conversas, timeline dual, dashboard e configurações — seguindo a spec outside-in e alinhada ao design system do PilotCRM.

**Architecture:** Next.js App Router com `src/app/` como raiz. Componentes em `src/components/` organizados por feature. UI primitives de `@repo/ui` (compartilhados com PilotCRM — verificar se existe ou criar stubs locais). Estado da URL gerenciado via `useSearchParams`. API routes em `src/app/api/`.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, `@repo/ui` (ou stubs), Lucide React, Vitest, React Testing Library, Playwright (E2E).

**Spec:** `docs/superpowers/specs/2026-11-05-zaptrail-product-ux-spec.md`

## Global Constraints

- Arquivos de produção ≤ 350 linhas (quality/max-lines)
- Nenhum HTML raw interativo (`<button>`, `<input>`) — sempre `@repo/ui`
- Código 100% em inglês; microcopy 100% em pt-BR
- Tipografia numérica com `font-mono` (Geist Mono)
- Zero cores Tailwind raw — sempre tokens semânticos (`bg-primary`, `text-muted-foreground`)
- 5 estados obrigatórios em toda DataTable/container: ideal, loading skeleton, empty, filtered-empty, error
- Confidence badge: verde ≥ 0.85, amarelo 0.65–0.84, vermelho < 0.65
- h-14 (56px) datum line no AppShell header
- Sidebar `w-64` em desktop
- Touch targets `min-h-11 min-w-11` (44×44px) em mobile
- TDD: test first, red-green-commit

## Review Focus

1. **Keyboard navigation no Review Inbox**: `j`/`k` devem mover seleção E atualizar o Peek Sheet simultaneamente sem re-fetch — exercitar com testes de interação de teclado.
2. **Deep link `?inspectId=`**: recarregar a URL com `?inspectId=rv_xxx` deve abrir o Peek Sheet diretamente sobre o item correto — testar com renderização inicial de rota.
3. **Domain labels dinâmicos**: quando o `domain_key` muda, todas as labels/colunas devem re-renderizar — testar com dois mocks de DomainPackUIManifest.
4. **5 estados simultâneos**: loading skeleton não pode causar CLS (layout shift) — verificar que skeleton tem exatamente as mesmas dimensões do estado ideal.
5. **Evidence highlight acessível**: `<mark>` não pode ser a única indicação visual (usar bold também) e deve ter `aria-label` — testar com axe-core.

---

## Task 1: UI Foundation — AppShell, Tokens, Stubs

**Files:**
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/domain-indicator.tsx`
- Create: `src/components/ui/index.ts` (stubs/re-exports de `@repo/ui`)
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/textarea.tsx`
- Create: `src/lib/domain-manifest.ts`
- Create: `src/lib/domain-manifest.types.ts`
- Modify: `src/app/layout.tsx`
- Test: `src/components/layout/__tests__/app-shell.test.tsx`

**Interfaces:**
- Produces: `AppShell({ children, activeDomainKey })`, `DomainIndicator({ manifest })`, `DomainPackUIManifest` type
- Produces: Stubs de `Badge`, `Button`, `Card`, `Skeleton`, `Sheet`, `Dialog`, `Input`, `Textarea` com props mínimas

- [ ] **Step 1: Escrever teste de AppShell**

```tsx
// src/components/layout/__tests__/app-shell.test.tsx
it('renders sidebar with domain badge', () => {
  render(<AppShell activeDomainKey="real_estate"><div>content</div></AppShell>)
  expect(screen.getByRole('navigation')).toBeInTheDocument()
  expect(screen.getByText('Imobiliário')).toBeInTheDocument()
})

it('renders datum line header at h-14', () => {
  render(<AppShell activeDomainKey="real_estate"><div /></AppShell>)
  const header = screen.getByRole('banner')
  expect(header).toHaveClass('h-14')
})

it('renders nav links for all primary routes', () => {
  render(<AppShell activeDomainKey="real_estate"><div /></AppShell>)
  expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
  expect(screen.getByRole('link', { name: /revisão/i })).toHaveAttribute('href', '/review')
  expect(screen.getByRole('link', { name: /extrações/i })).toHaveAttribute('href', '/extractions')
  expect(screen.getByRole('link', { name: /conversas/i })).toHaveAttribute('href', '/conversations')
})
```

- [ ] **Step 2: Rodar teste para verificar falha**

Run: `npx vitest run src/components/layout/__tests__/app-shell.test.tsx`
Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Definir `DomainPackUIManifest` em `src/lib/domain-manifest.types.ts`**

```typescript
export interface DomainPackUIManifest {
  domain_key: string
  display_name: string        // "Imobiliário"
  icon: string                // lucide icon name
  description: string
  labels: {
    opportunity: string
    participant: string
    intent: string
    entity: string
  }
  extra_columns: Array<{
    key: string
    label: string
    type: 'currency' | 'text' | 'number' | 'badge'
    path: string              // dot-notation path into envelope
  }>
  extra_filters: Array<{
    key: string
    label: string
    type: 'select' | 'range' | 'text'
    options?: Array<{ value: string; label: string }>
  }>
  intent_labels: Record<string, string>
  opportunity_labels: Record<string, string>
  role_labels: Record<string, string>
}
```

- [ ] **Step 4: Implementar `DOMAIN_MANIFESTS` registry em `src/lib/domain-manifest.ts`**

Exportar `const DOMAIN_MANIFESTS: Record<string, DomainPackUIManifest>` com entrada para `real_estate`. Exportar `function getDomainManifest(key: string): DomainPackUIManifest` que retorna o manifest ou o generic fallback.

- [ ] **Step 5: Implementar stubs de `@repo/ui` em `src/components/ui/`**

Cada stub é um componente React com props mínimas que renderiza o HTML semântico correto com as classes Tailwind do design system. Badge: `<span>`, Button: `<button>`, Card: `<div>`, Skeleton: `<div>` animado, Sheet: drawer lateral, Dialog: modal, Input: `<input>`, Textarea: `<textarea>`.

- [ ] **Step 6: Implementar `AppShell` + `Sidebar` + `DomainIndicator`**

`AppShell`: layout grid com sidebar `w-64` fixo e main content. Header `h-14` com `border-b border-border`. `Sidebar`: lista de nav links com active state. `DomainIndicator`: badge clicável com nome do domínio.

- [ ] **Step 7: Rodar teste para verificar aprovação**

Run: `npx vitest run src/components/layout/__tests__/app-shell.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 8: Verificar quality gates**

Run: `node scripts/check-quality-gates.mjs`
Expected: 0 violations

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/ src/components/ui/ src/lib/domain-manifest*
git commit -m "feat(ui): add AppShell, Sidebar, DomainIndicator, and UI component stubs"
```

---

## Task 2: Review Inbox — DataTable + Peek Sheet

**Files:**
- Create: `src/app/review/page.tsx`
- Create: `src/components/review/review-inbox-table.tsx`
- Create: `src/components/review/review-peek-sheet.tsx`
- Create: `src/components/review/evidence-highlight.tsx`
- Create: `src/components/review/confidence-badge.tsx`
- Create: `src/components/review/epistemic-badge.tsx`
- Create: `src/components/shared/page-header.tsx`
- Create: `src/components/shared/filter-toolbar.tsx`
- Create: `src/components/shared/empty-state.tsx`
- Create: `src/components/shared/error-state.tsx`
- Create: `src/components/shared/skeleton-table.tsx`
- Create: `src/hooks/use-review-keyboard.ts`
- Create: `src/app/api/review/route.ts`
- Test: `src/components/review/__tests__/review-inbox.test.tsx`
- Test: `src/components/review/__tests__/evidence-highlight.test.tsx`

**Interfaces:**
- Consumes: `AppShell` (Task 1), `DomainPackUIManifest` (Task 1), `ReviewQueueRecord` from `src/packages/core/review-inbox.ts`
- Produces: `/review` page with DataTable + Peek Sheet, keyboard navigation hook

- [ ] **Step 1: Escrever testes do ReviewInboxTable**

```tsx
// src/components/review/__tests__/review-inbox.test.tsx
const mockItems: ReviewQueueRecord[] = [
  { review_id: 'rv_1', severity: 'high', reason: 'Preço ambíguo',
    conversation_id: 'conv_abc', status: 'pending',
    original_payload: { role: 'owner' },
    evidence_refs: [{ exact_quote: 'estou vendendo por 1,2 milhão', confidence: 0.72, ... }],
    tenant_id: 't1', target_id: 'env_1', created_at: '2026-11-05T10:00:00Z' }
]

it('renders review items in table', () => {
  render(<ReviewInboxTable items={mockItems} onSelect={vi.fn()} selectedId={null} />)
  expect(screen.getByRole('row', { name: /conv_abc/i })).toBeInTheDocument()
  expect(screen.getByTestId('severity-badge-high')).toBeInTheDocument()
})

it('calls onSelect when row is clicked', () => {
  const onSelect = vi.fn()
  render(<ReviewInboxTable items={mockItems} onSelect={onSelect} selectedId={null} />)
  fireEvent.click(screen.getByRole('row', { name: /conv_abc/i }))
  expect(onSelect).toHaveBeenCalledWith('rv_1')
})

it('shows selected row with aria-selected', () => {
  render(<ReviewInboxTable items={mockItems} onSelect={vi.fn()} selectedId="rv_1" />)
  expect(screen.getByRole('row', { name: /conv_abc/i })).toHaveAttribute('aria-selected', 'true')
})

it('keyboard j/k moves selection', async () => {
  const onSelect = vi.fn()
  const items = [mockItems[0], { ...mockItems[0], review_id: 'rv_2', conversation_id: 'conv_def' }]
  render(<ReviewInboxTable items={items} onSelect={onSelect} selectedId="rv_1" />)
  fireEvent.keyDown(document, { key: 'j' })
  expect(onSelect).toHaveBeenCalledWith('rv_2')
})

it('shows all 5 states correctly', () => {
  const { rerender } = render(<ReviewInboxPage />)
  // loading
  expect(screen.getByTestId('skeleton-table')).toBeInTheDocument()
  // empty
  rerender(<ReviewInboxPage _testItems={[]} _testLoaded />)
  expect(screen.getByText(/tudo revisado/i)).toBeInTheDocument()
  // error
  rerender(<ReviewInboxPage _testError="Network error" />)
  expect(screen.getByRole('alert')).toBeInTheDocument()
  expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Escrever testes de EvidenceHighlight**

```tsx
// src/components/review/__tests__/evidence-highlight.test.tsx
it('renders message with highlighted quote', () => {
  render(<EvidenceHighlight
    messageBody="Sou o dono sim, estou vendendo por 1,2 milhão"
    quote="1,2 milhão"
  />)
  const mark = screen.getByRole('mark')
  expect(mark).toHaveTextContent('1,2 milhão')
  expect(mark).toHaveAttribute('aria-label', 'Trecho citado como evidência')
})

it('renders before/highlighted/after text segments', () => {
  render(<EvidenceHighlight
    messageBody="Sou o dono sim, estou vendendo por 1,2 milhão"
    quote="1,2 milhão"
  />)
  expect(screen.getByTestId('before-text')).toHaveTextContent('Sou o dono sim, estou vendendo por ')
  expect(screen.getByTestId('after-text')).toHaveTextContent('')
})

it('falls back gracefully when quote not found in body', () => {
  render(<EvidenceHighlight messageBody="Olá" quote="xyz" />)
  expect(screen.getByTestId('evidence-fallback')).toBeInTheDocument()
})

it('mark element has font-weight-bold for color-agnostic distinction', () => {
  render(<EvidenceHighlight messageBody="vendendo por 1,2 milhão" quote="1,2 milhão" />)
  expect(screen.getByRole('mark')).toHaveClass('font-semibold')
})
```

- [ ] **Step 3: Rodar testes para verificar falha**

Run: `npx vitest run src/components/review/__tests__/`
Expected: FAIL — modules not found

- [ ] **Step 4: Implementar `EvidenceHighlight`**

Recebe `messageBody: string` e `quote: string`. Usa `buildShowInConversationLink` de `src/packages/core/review-inbox.ts` para calcular offsets. Renderiza `<span data-testid="before-text">`, `<mark role="mark" aria-label="Trecho citado como evidência" className="bg-warning/20 font-semibold">`, `<span data-testid="after-text">`. Se quote não encontrado: `<span data-testid="evidence-fallback">`.

- [ ] **Step 5: Implementar `ConfidenceBadge`**

Props: `confidence: number`. Usa `evaluateConfidenceBand()` de `src/packages/core/confidence-policy.ts`. Classes: band high → `bg-success/15 text-success`, medium → `bg-warning/15 text-warning`, low → `bg-destructive/15 text-destructive`. Renderiza valor com `font-mono`.

- [ ] **Step 6: Implementar `EpistemicBadge`**

Props: `status: EpistemicStatus`. Mapeamento de status → label pt-BR + variant. `validated_human` → "✓ Validado" (success), `inferred` → "Inferido" (warning), `superseded` → `line-through`, etc.

- [ ] **Step 7: Implementar shared components**

`PageHeader({ title, badge, actions })`: h2 + Badge + slot de botões. `FilterToolbar({ onSearch, filters })`: Input de busca + dropdowns. `EmptyState({ icon, title, description, action? })`. `ErrorState({ message, onRetry })` com `role="alert"`. `SkeletonTable({ rows, cols })`: grid de `Skeleton` com mesmas dimensões do DataTable.

- [ ] **Step 8: Implementar `useReviewKeyboard` hook**

```typescript
// src/hooks/use-review-keyboard.ts
export function useReviewKeyboard(options: {
  items: Array<{ id: string }>
  selectedId: string | null
  onSelect: (id: string) => void
  onApprove: () => void
  onEdit: () => void
  onReject: () => void
}): void
```
Registra `keydown` em `document`. `j`/`ArrowDown` → próximo, `k`/`ArrowUp` → anterior, `Enter` → approve, `e` → edit, `r` → reject, `Esc` → fechar (onSelect(null)).

- [ ] **Step 9: Implementar `ReviewInboxTable`**

Props: `items: ReviewQueueRecord[]`, `onSelect(id: string | null): void`, `selectedId: string | null`. Tabela com colunas: Severidade (badge), Conversa, Razão, Evidência preview (50 chars), Data (`toRelativeTime()`). Cada row: `aria-selected={selectedId === item.review_id}`.

- [ ] **Step 10: Implementar `ReviewPeekSheet`**

Props: `item: ReviewQueueRecord | null`, `onClose: () => void`, `onApprove: () => void`, `onEdit: () => void`, `onReject: () => void`. Sheet lateral com: header (review_id + severity badge), seção Evidence (EvidenceHighlight), seção Payload (key-value list com ConfidenceBadge por campo), 3 botões de ação com atalhos de teclado exibidos.

- [ ] **Step 11: Implementar API route `/api/review`**

`src/app/api/review/route.ts`: GET com query params `status`, `severity`, `conversation_id`. Usa `ReviewInboxService.listReviews()`. Retorna JSON `{ items: ReviewQueueRecord[] }`.

API route PATCH `/api/review/[id]/route.ts`: body `ReviewResolutionInput`. Usa `ReviewInboxService.resolveReviewItem()`.

- [ ] **Step 12: Implementar `ReviewInboxPage`**

`src/app/review/page.tsx`: usa `useSearchParams` para `inspectId`, `status`, `severity`. Faz fetch para `/api/review`. Gerencia selectedId em estado local + sincroniza com `?inspectId=` na URL. Renderiza: PageHeader + badge de count, FilterToolbar, ReviewInboxTable, ReviewPeekSheet. 5 estados completos.

- [ ] **Step 13: Rodar todos os testes para verificar aprovação**

Run: `npx vitest run src/components/review/`
Expected: PASS (todos os testes)

- [ ] **Step 14: Verificar quality gates**

Run: `node scripts/check-quality-gates.mjs`
Expected: 0 violations (todos os arquivos ≤ 350 linhas)

- [ ] **Step 15: Commit**

```bash
git add src/app/review/ src/components/review/ src/components/shared/ src/hooks/use-review-keyboard.ts
git commit -m "feat(ui): implement Review Inbox with DataTable, Peek Sheet, and keyboard navigation"
```

---

## Task 3: Extractions List + Extraction Detail

**Files:**
- Create: `src/app/extractions/page.tsx`
- Create: `src/app/extractions/[id]/page.tsx`
- Create: `src/components/extractions/extractions-table.tsx`
- Create: `src/components/extractions/extraction-detail.tsx`
- Create: `src/components/extractions/observation-row.tsx`
- Create: `src/components/extractions/opportunity-card.tsx`
- Create: `src/app/api/extractions/route.ts`
- Create: `src/app/api/extractions/[id]/route.ts`
- Test: `src/components/extractions/__tests__/extractions-table.test.tsx`
- Test: `src/components/extractions/__tests__/extraction-detail.test.tsx`

**Interfaces:**
- Consumes: `UniversalInterpretationEnvelope` from `src/packages/core/types.ts`, `DomainPackUIManifest` (Task 1), shared components (Task 2)
- Produces: `/extractions` list, `/extractions/:id` 3-rail detail, `ObservationRow`, `OpportunityCard`

- [ ] **Step 1: Escrever testes de ExtractionsTable**

```tsx
// src/components/extractions/__tests__/extractions-table.test.tsx
const mockEnvelope = {
  envelope_id: 'env_1', conversation_id: 'conv_abc',
  domain_key: 'real_estate', created_at: '2026-11-05T10:00:00Z',
  review_required: false, opportunities: [{}, {}],
  evidence_refs: [{ confidence: 0.91 }], ...
}

it('renders envelope rows with domain badge', () => {
  render(<ExtractionsTable envelopes={[mockEnvelope]} manifest={realEstateManifest} />)
  expect(screen.getByText('conv_abc')).toBeInTheDocument()
  expect(screen.getByText('Imobiliário')).toBeInTheDocument()
  expect(screen.getByText('2')).toBeInTheDocument() // opportunities count
})

it('renders confidence with correct band color', () => {
  render(<ExtractionsTable envelopes={[mockEnvelope]} manifest={realEstateManifest} />)
  const badge = screen.getByTestId('confidence-badge')
  expect(badge).toHaveClass('bg-success') // 0.91 is high band
})

it('renders domain-specific extra columns from manifest', () => {
  const manifest = { ...realEstateManifest, extra_columns: [
    { key: 'sale_price', label: 'Preço de Venda', type: 'currency', path: 'domain_entities.asking_price' }
  ]}
  render(<ExtractionsTable envelopes={[{ ...mockEnvelope, domain_entities: { asking_price: 1200000 } }]} manifest={manifest} />)
  expect(screen.getByRole('columnheader', { name: 'Preço de Venda' })).toBeInTheDocument()
  expect(screen.getByText('R$ 1.200.000')).toBeInTheDocument()
})
```

- [ ] **Step 2: Escrever testes de ExtractionDetail**

```tsx
it('renders all 6 observation tabs', () => {
  render(<ExtractionDetail envelope={mockFullEnvelope} manifest={realEstateManifest} />)
  expect(screen.getByRole('tab', { name: /participantes/i })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /intenções/i })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /valores/i })).toBeInTheDocument()
})

it('renders participant with confidence badge and show-in-conversation link', () => {
  render(<ExtractionDetail envelope={mockFullEnvelope} manifest={realEstateManifest} />)
  fireEvent.click(screen.getByRole('tab', { name: /participantes/i }))
  expect(screen.getByText('Proprietário')).toBeInTheDocument()  // role_labels translation
  expect(screen.getByText(/mostrar na conversa/i)).toBeInTheDocument()
})

it('renders superseded value with strikethrough', () => {
  const envelope = { ...mockFullEnvelope, values: [
    { field_key: 'sale_asking_price', amount: 1000000, epistemic_status: 'superseded', ... },
    { field_key: 'sale_asking_price', amount: 1200000, epistemic_status: 'declared', ... }
  ]}
  render(<ExtractionDetail envelope={envelope} manifest={realEstateManifest} />)
  fireEvent.click(screen.getByRole('tab', { name: /valores/i }))
  const superseded = screen.getByTestId('value-superseded')
  expect(superseded).toHaveClass('line-through')
})
```

- [ ] **Step 3: Rodar testes para verificar falha**

Run: `npx vitest run src/components/extractions/`
Expected: FAIL — modules not found

- [ ] **Step 4: Implementar `ObservationRow`**

Props: `label: string`, `value: React.ReactNode`, `confidence: number`, `epistemicStatus: EpistemicStatus`, `evidenceQuote?: string`, `conversationId?: string`, `messageId?: string`. Renderiza linha com label (muted), valor, ConfidenceBadge, EpistemicBadge, e link "Mostrar na conversa" quando `evidenceQuote` disponível.

- [ ] **Step 5: Implementar `OpportunityCard`**

Props: `opportunity: OpportunityAssessment`, `manifest: DomainPackUIManifest`. Card com: opportunity_type (traduzido por `manifest.opportunity_labels`), stage badge, confidence badge, attributes domain-specific.

- [ ] **Step 6: Implementar `ExtractionsTable`**

Tabela com colunas core + `manifest.extra_columns`. Função `resolveColumnValue(envelope, path: string)`: usa dot-notation para extrair valor do envelope. Formata `currency` com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. Renderiza em `font-mono`.

- [ ] **Step 7: Implementar `ExtractionDetail` (3-Rail)**

Left rail: metadata (envelope_id, conversation link, tenant, domain_key, parser_version, extractor, llm_invoked). Center rail: Tabs (Participantes, Intenções, Fatos, Valores, Relações, Condições) — cada aba renderiza array de `ObservationRow`. Right rail: OpportunityCard list + ActionRecommendation list + ReviewItem list com link "/resolve".

- [ ] **Step 8: Implementar API routes**

`GET /api/extractions`: lê envelopes da storage (`SupabaseStoragePort.getExtractionRuns()`). `GET /api/extractions/[id]`: envelope individual.

- [ ] **Step 9: Implementar pages**

`src/app/extractions/page.tsx`: PageHeader + FilterToolbar (domain, date range, review status) + ExtractionsTable + Pagination. `src/app/extractions/[id]/page.tsx`: ExtractionDetail com `params` async.

- [ ] **Step 10: Rodar testes**

Run: `npx vitest run src/components/extractions/`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add src/app/extractions/ src/components/extractions/
git commit -m "feat(ui): implement Extractions list and Extraction Detail 3-rail view"
```

---

## Task 4: Dashboard

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/dashboard/metric-card.tsx`
- Create: `src/components/dashboard/health-indicator.tsx`
- Create: `src/components/dashboard/confidence-histogram.tsx`
- Create: `src/components/dashboard/top-intents-list.tsx`
- Create: `src/app/api/dashboard/stats/route.ts`
- Test: `src/components/dashboard/__tests__/metric-card.test.tsx`
- Test: `src/components/dashboard/__tests__/dashboard.test.tsx`

**Interfaces:**
- Consumes: shared components (Task 2), `DomainPackUIManifest` (Task 1)
- Produces: `/dashboard` page, `MetricCard`, `HealthIndicator`

- [ ] **Step 1: Escrever testes**

```tsx
it('renders metric card with value, trend, and label', () => {
  render(<MetricCard label="Extrações Hoje" value={47} trend={15} trendLabel="vs. ontem" />)
  expect(screen.getByText('47')).toHaveClass('font-mono')
  expect(screen.getByText('↑ 15%')).toBeInTheDocument()
})

it('renders health indicator with correct status', () => {
  render(<HealthIndicator label="CRM" status="ok" lastEventAt={new Date(Date.now() - 120000)} />)
  expect(screen.getByTestId('health-dot-ok')).toBeInTheDocument()
  expect(screen.getByText(/há 2 minutos/i)).toBeInTheDocument()
})

it('health warning when last event > 5min', () => {
  render(<HealthIndicator label="CRM" status="ok" lastEventAt={new Date(Date.now() - 400000)} />)
  expect(screen.getByTestId('health-dot-warning')).toBeInTheDocument()
})

it('dashboard shows empty state for new workspace', () => {
  render(<DashboardPage _testStats={{ totalExtractions: 0 }} />)
  expect(screen.getByText(/nenhuma extração ainda/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /configurar integrações/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Rodar testes para falha**

Run: `npx vitest run src/components/dashboard/`
Expected: FAIL

- [ ] **Step 3: Implementar `MetricCard`**

Props: `label: string`, `value: number | string`, `trend?: number`, `trendLabel?: string`, `sparklineData?: number[]`. Card com: value em `text-2xl font-mono`, trend com seta (↑ verde, ↓ vermelho), sparkline simples (SVG path ou div bars).

- [ ] **Step 4: Implementar `HealthIndicator`**

Props: `label: string`, `status: 'ok' | 'warning' | 'error'`, `lastEventAt?: Date`, `eventsToday?: number`. Dot colorido + label + "Último evento: X" com `formatRelativeTime()`.

- [ ] **Step 5: Implementar `ConfidenceHistogram`**

Props: `distribution: { high: number; medium: number; low: number }`. Barras horizontais empilhadas com cores semânticas (success/warning/destructive).

- [ ] **Step 6: Implementar `TopIntentsList`**

Props: `intents: Array<{ label: string; count: number }>`, `manifest: DomainPackUIManifest`. Lista ordenada com rótulos traduzidos do manifest, contagem, barra de proporção relativa.

- [ ] **Step 7: Implementar API stats route**

`GET /api/dashboard/stats?period=7d`: agrega dados da storage. Retorna `{ totalExtractions, extractionsByDay, confidenceDistribution, reviewQueueSize, topIntents, integrationHealth }`.

- [ ] **Step 8: Implementar DashboardPage**

Grid 2×3 de MetricCards + 2 HealthIndicators + ConfidenceHistogram + TopIntentsList. Period selector (7d/30d/90d) no PageHeader. 5 estados.

- [ ] **Step 9: Rodar testes**

Run: `npx vitest run src/components/dashboard/`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/app/dashboard/ src/components/dashboard/
git commit -m "feat(ui): implement Dashboard with metric cards and health indicators"
```

---

## Task 5: Conversations List + Timeline Dual

**Files:**
- Create: `src/app/conversations/page.tsx`
- Create: `src/app/conversations/[id]/page.tsx`
- Create: `src/components/conversations/conversations-table.tsx`
- Create: `src/components/conversations/timeline-dual.tsx`
- Create: `src/components/conversations/timeline-message.tsx`
- Create: `src/components/conversations/timeline-extraction.tsx`
- Create: `src/app/api/conversations/route.ts`
- Create: `src/app/api/conversations/[id]/route.ts`
- Test: `src/components/conversations/__tests__/timeline-dual.test.tsx`

**Interfaces:**
- Consumes: `ConversationMessage` (types.ts), `UniversalInterpretationEnvelope` (types.ts), shared components (Task 2)
- Produces: `/conversations`, `/conversations/:id` split pane

- [ ] **Step 1: Escrever testes de TimelineDual**

```tsx
it('renders both message and extraction panels', () => {
  render(<TimelineDual messages={mockMessages} envelopes={mockEnvelopes} />)
  expect(screen.getByTestId('messages-panel')).toBeInTheDocument()
  expect(screen.getByTestId('extractions-panel')).toBeInTheDocument()
})

it('scrolls message into view when show-in-conversation link is clicked', async () => {
  render(<TimelineDual messages={mockMessages} envelopes={mockEnvelopes} anchorMessageId="msg_2" />)
  const msg = screen.getByTestId('message-msg_2')
  expect(msg).toBeVisible()
  // anchor message should be highlighted
  expect(msg).toHaveClass('ring-2')
})

it('highlights exact quote in message body when envelope is hovered', async () => {
  render(<TimelineDual messages={mockMessages} envelopes={mockEnvelopes} />)
  const extractionCard = screen.getByTestId('extraction-env_1')
  fireEvent.mouseEnter(extractionCard)
  expect(screen.getByRole('mark')).toBeInTheDocument()
})
```

- [ ] **Step 2: Rodar testes para falha**

Run: `npx vitest run src/components/conversations/`
Expected: FAIL

- [ ] **Step 3: Implementar `TimelineMessage`**

Props: `message: ConversationMessage`, `highlightQuote?: string`, `isAnchor?: boolean`. Bolha com: direção (inbound right-align, outbound left), sender name, timestamp (Geist Mono), raw_text com EvidenceHighlight se `highlightQuote`. `isAnchor` adiciona `ring-2 ring-primary`.

- [ ] **Step 4: Implementar `TimelineExtraction`**

Props: `envelope: UniversalInterpretationEnvelope`, `manifest: DomainPackUIManifest`, `onHover?: (quotesByMessageId: Record<string, string>) => void`. Card com summary (N participantes, M oportunidades, confiança). Hover → `onHover` com mapa de messageId → quote para highlighting.

- [ ] **Step 5: Implementar `TimelineDual`**

Props: `messages: ConversationMessage[]`, `envelopes: UniversalInterpretationEnvelope[]`, `manifest: DomainPackUIManifest`, `anchorMessageId?: string`. Estado interno `hoveredQuotes: Record<string, string>`. Split pane 50/50 com scroll independente. Scroll automático ao `anchorMessageId` via `useEffect + scrollIntoView`.

- [ ] **Step 6: Implementar páginas e API routes**

`/conversations`: tabela com colunas (conversa, mensagens count, extrações count, oportunidades, última atividade). `/conversations/[id]`: TimelineDual. API: lê mensagens e envelopes por `conversation_id` da storage.

- [ ] **Step 7: Rodar testes**

Run: `npx vitest run src/components/conversations/`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/app/conversations/ src/components/conversations/
git commit -m "feat(ui): implement Conversations list and Timeline Dual view"
```

---

## Task 6: Settings — General, Team, Confidence

**Files:**
- Create: `src/app/settings/layout.tsx`
- Create: `src/app/settings/general/page.tsx`
- Create: `src/app/settings/team/page.tsx`
- Create: `src/app/settings/confidence/page.tsx`
- Create: `src/components/settings/settings-nav.tsx`
- Create: `src/components/settings/member-row.tsx`
- Create: `src/components/settings/confidence-slider.tsx`
- Create: `src/components/settings/floating-save-bar.tsx`
- Create: `src/app/api/settings/confidence/route.ts`
- Create: `src/app/api/settings/team/route.ts`
- Test: `src/components/settings/__tests__/confidence-slider.test.tsx`
- Test: `src/components/settings/__tests__/settings-team.test.tsx`

**Interfaces:**
- Consumes: shared components (Task 2), `ConfidenceEvaluation` from confidence-policy.ts
- Produces: Settings layout, Confidence sliders, Team management, Floating save bar

- [ ] **Step 1: Escrever testes**

```tsx
// confidence-slider.test.tsx
it('renders three bands with correct default values', () => {
  render(<ConfidenceSlider value={{ high: 0.85, medium: 0.65 }} onChange={vi.fn()} />)
  expect(screen.getByTestId('slider-high')).toHaveValue('0.85')
  expect(screen.getByTestId('slider-medium')).toHaveValue('0.65')
})

it('shows impact preview percentage when values change', async () => {
  render(<ConfidenceSlider value={{ high: 0.85, medium: 0.65 }} onChange={vi.fn()} recentStats={{ high: 63, medium: 28, low: 9 }} />)
  expect(screen.getByText(/~63% das extrações seriam automáticas/i)).toBeInTheDocument()
})

// settings-team.test.tsx
it('renders member list with role dropdown', () => {
  render(<TeamSettingsPage _testMembers={[{ id: '1', name: 'Gustavo', email: 'g@g.com', role: 'admin' }]} />)
  expect(screen.getByText('Gustavo')).toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: /role/i })).toHaveValue('admin')
})

it('shows floating save bar when form is dirty', async () => {
  render(<TeamSettingsPage _testMembers={[{ id: '1', name: 'Gustavo', email: 'g@g.com', role: 'admin' }]} />)
  fireEvent.change(screen.getByRole('combobox', { name: /role/i }), { target: { value: 'reviewer' } })
  expect(screen.getByTestId('floating-save-bar')).toBeVisible()
})
```

- [ ] **Step 2: Rodar testes para falha**

Run: `npx vitest run src/components/settings/`
Expected: FAIL

- [ ] **Step 3: Implementar `FloatingSaveBar`**

Props: `isDirty: boolean`, `onSave: () => void`, `onReset: () => void`. Fixed bottom bar `bottom-0 left-0 right-0 z-50` que aparece/desaparece com transition baseado em `isDirty`. Botões "Restaurar" (ghost) + "Salvar" (primary).

- [ ] **Step 4: Implementar `ConfidenceSlider`**

3 sliders (range inputs) para high_min, medium_min. High band vai de medium_min a 1.0, medium vai de low_max a high_min. Atualização em tempo real do impact preview.

- [ ] **Step 5: Implementar `MemberRow`**

Props: `member: WorkspaceMember`, `onRoleChange: (id, role) => void`, `isCurrentUser: boolean`. Avatar + nome + email + role dropdown (admin/reviewer/viewer). Se `isCurrentUser`, role dropdown disabled.

- [ ] **Step 6: Implementar Settings layout e páginas**

`settings/layout.tsx`: sidebar de settings com links (Geral, Domínio, Integrações, Equipe, Confiança, Playground). `settings/general/page.tsx`: form com workspace name, timezone, notifications. `settings/team/page.tsx`: MemberRow list + invite form. `settings/confidence/page.tsx`: ConfidenceSlider.

- [ ] **Step 7: Rodar testes**

Run: `npx vitest run src/components/settings/`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/app/settings/ src/components/settings/
git commit -m "feat(ui): implement Settings pages (general, team, confidence)"
```

---

## Task 7: Settings — Integrations + Health

**Files:**
- Create: `src/app/settings/integrations/page.tsx`
- Create: `src/components/settings/integration-card.tsx`
- Create: `src/app/api/settings/integrations/route.ts`
- Create: `src/app/api/settings/integrations/test/route.ts`
- Test: `src/components/settings/__tests__/integration-card.test.tsx`

**Interfaces:**
- Consumes: `HealthIndicator` (Task 4), shared components (Task 2)
- Produces: `/settings/integrations`, `IntegrationCard` with health status

- [ ] **Step 1: Escrever testes**

```tsx
it('renders CRM card with health status', () => {
  render(<IntegrationCard
    type="crm" label="PilotCRM" status="ok"
    lastEventAt={new Date()} eventsToday={47}
    url="https://crm.app/api" token="abc"
  />)
  expect(screen.getByTestId('health-dot-ok')).toBeInTheDocument()
  expect(screen.getByText('47')).toBeInTheDocument()
})

it('shows masked token', () => {
  render(<IntegrationCard type="crm" label="PilotCRM" token="secret123" status="ok" />)
  expect(screen.getByTestId('token-masked')).toHaveTextContent('••••••••••123')
})

it('test-connection button calls API and shows result', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({ connected: true }) })
  render(<IntegrationCard type="crm" label="PilotCRM" status="ok" onTest={mockFetch} />)
  fireEvent.click(screen.getByRole('button', { name: /testar conexão/i }))
  await screen.findByText(/conexão bem-sucedida/i)
})
```

- [ ] **Step 2–5: Implementar `IntegrationCard` + API routes + page**

`IntegrationCard`: Card com label, status (HealthIndicator), URL field, token field (masked com toggle reveal), botões "Testar Conexão" + "Editar" + "Copiar URL". `POST /api/settings/integrations/test`: faz ping para o endpoint configurado e retorna `{ connected: boolean, latencyMs: number }`.

- [ ] **Step 6: Commit**

```bash
git add src/app/settings/integrations/ src/components/settings/integration-card*
git commit -m "feat(ui): implement Integrations settings with health monitoring"
```

---

## Task 8: Settings — Domain Pack Catalog + Create Wizard

**Files:**
- Create: `src/app/settings/domain/page.tsx`
- Create: `src/app/settings/domain/create/page.tsx`
- Create: `src/components/settings/domain-pack-card.tsx`
- Create: `src/components/settings/domain-create-wizard.tsx`
- Create: `src/lib/domain-registry.ts`
- Create: `src/app/api/settings/domain/route.ts`
- Test: `src/components/settings/__tests__/domain-pack-card.test.tsx`
- Test: `src/components/settings/__tests__/domain-create-wizard.test.tsx`

**Interfaces:**
- Consumes: `DomainPackUIManifest` + `DOMAIN_MANIFESTS` (Task 1)
- Produces: Domain catalog page, Domain Pack create wizard (5-step)

- [ ] **Step 1: Escrever testes**

```tsx
it('renders domain catalog with active domain highlighted', () => {
  render(<DomainPackCard manifest={realEstateManifest} isActive={true} onSelect={vi.fn()} />)
  expect(screen.getByText('Imobiliário')).toBeInTheDocument()
  expect(screen.getByText('✅ Ativo')).toBeInTheDocument()
})

it('create wizard has 5 steps navigable via Next', async () => {
  render(<DomainCreateWizard onComplete={vi.fn()} />)
  expect(screen.getByText(/passo 1/i)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
  expect(screen.getByText(/passo 2/i)).toBeInTheDocument()
})

it('wizard prevents Next on step 1 without name', async () => {
  render(<DomainCreateWizard onComplete={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
  expect(screen.getByText(/passo 1/i)).toBeInTheDocument() // did not advance
  expect(screen.getByRole('alert')).toBeInTheDocument()
})

it('wizard step 2 adds and removes intents', async () => {
  render(<DomainCreateWizard onComplete={vi.fn()} />)
  // navigate to step 2
  fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Meu Domínio' } })
  fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
  fireEvent.click(screen.getByRole('button', { name: /adicionar intenção/i }))
  expect(screen.getAllByTestId('intent-row')).toHaveLength(1)
})
```

- [ ] **Step 2–6: Implementar `DomainPackCard`, `DomainCreateWizard`, pages, API**

Wizard 5 passos: (1) Nome + ícone + descrição, (2) Intenções (lista editável), (3) Tipos de oportunidade, (4) Roles de participante, (5) Preview + publicar. Validação por passo com mensagens de erro pt-BR. `PATCH /api/settings/domain`: salva manifest em storage (ou arquivo local para MVP).

- [ ] **Step 7: Commit**

```bash
git add src/app/settings/domain/ src/components/settings/domain-*
git commit -m "feat(ui): implement Domain Pack catalog and 5-step create wizard"
```

---

## Task 9: Playground

**Files:**
- Create: `src/app/settings/playground/page.tsx`
- Create: `src/components/playground/playground-split-pane.tsx`
- Create: `src/components/playground/extraction-preview.tsx`
- Create: `src/app/api/playground/extract/route.ts`
- Test: `src/components/playground/__tests__/playground.test.tsx`

**Interfaces:**
- Consumes: `ingestWhatsappTurn` from `src/packages/api/ingest-handler.ts`, `ExtractionDetail` (Task 3)
- Produces: `/settings/playground` split pane with real-time extraction

- [ ] **Step 1: Escrever testes**

```tsx
it('renders input textarea and extract button', () => {
  render(<PlaygroundSplitPane manifest={realEstateManifest} />)
  expect(screen.getByRole('textbox')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /extrair/i })).toBeInTheDocument()
})

it('calls extraction API when button clicked', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({ envelope: mockEnvelope }) })
  render(<PlaygroundSplitPane manifest={realEstateManifest} _testFetch={mockFetch} />)
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Sou o dono, vendendo por 1,2mi' } })
  fireEvent.click(screen.getByRole('button', { name: /extrair/i }))
  await screen.findByTestId('extraction-preview')
  expect(screen.getByText(/extração concluída/i)).toBeInTheDocument()
})

it('shows processing time after extraction', async () => {
  render(<PlaygroundSplitPane manifest={realEstateManifest} _testFetch={vi.fn().mockResolvedValue({ ok: true, json: () => ({ envelope: mockEnvelope, processingMs: 1234 }) })} />)
  fireEvent.click(screen.getByRole('button', { name: /extrair/i }))
  await screen.findByText(/1\.2s/i)
})
```

- [ ] **Step 2–5: Implementar playground components e API**

`POST /api/playground/extract`: recebe `{ conversationText: string, domainKey: string }`, constrói `IngestWhatsappPayload` sintético, chama `ingestWhatsappTurn()`, retorna envelope + `processingMs`. `PlaygroundSplitPane`: textarea esquerda, `ExtractionPreview` direita (summary de counts + link "Ver Envelope completo").

- [ ] **Step 6: Commit**

```bash
git add src/app/settings/playground/ src/components/playground/
git commit -m "feat(ui): implement Playground for real-time extraction testing"
```

---

## Task 10: Onboarding Wizard + Multi-Domain Dynamic Labels

**Files:**
- Create: `src/app/onboarding/page.tsx`
- Create: `src/components/onboarding/setup-wizard.tsx`
- Create: `src/hooks/use-domain-manifest.ts`
- Create: `src/context/domain-context.tsx`
- Modify: `src/app/layout.tsx` (wrap with DomainProvider)
- Modify: `src/components/review/review-inbox-table.tsx` (dynamic columns)
- Modify: `src/components/extractions/extractions-table.tsx` (dynamic columns)
- Test: `src/hooks/__tests__/use-domain-manifest.test.ts`
- Test: `src/context/__tests__/domain-context.test.tsx`

**Interfaces:**
- Consumes: `DomainPackUIManifest` (Task 1), all previous components
- Produces: Domain context, dynamic labels throughout UI, 4-step onboarding wizard

- [ ] **Step 1: Escrever testes**

```tsx
// use-domain-manifest.test.ts
it('returns real_estate manifest for real_estate key', () => {
  const { result } = renderHook(() => useDomainManifest('real_estate'))
  expect(result.current.display_name).toBe('Imobiliário')
  expect(result.current.labels.opportunity).toBe('Oportunidade Imobiliária')
})

it('falls back to generic manifest for unknown key', () => {
  const { result } = renderHook(() => useDomainManifest('unknown_domain'))
  expect(result.current.display_name).toBe('Domínio Personalizado')
})

// domain-context.test.tsx
it('provides domain manifest to children via context', () => {
  render(
    <DomainProvider activeDomainKey="real_estate">
      <TestConsumer />
    </DomainProvider>
  )
  expect(screen.getByTestId('domain-name')).toHaveTextContent('Imobiliário')
})

it('updates all consumers when domain key changes', async () => {
  const { rerender } = render(<DomainProvider activeDomainKey="real_estate"><TestConsumer /></DomainProvider>)
  expect(screen.getByTestId('domain-name')).toHaveTextContent('Imobiliário')
  rerender(<DomainProvider activeDomainKey="healthcare"><TestConsumer /></DomainProvider>)
  expect(screen.getByTestId('domain-name')).toHaveTextContent('Saúde')  // future manifest
})

// setup-wizard.test.tsx
it('renders 4-step wizard with progress indicator', () => {
  render(<SetupWizard onComplete={vi.fn()} />)
  expect(screen.getByText(/escolha do domínio/i)).toBeInTheDocument()
  expect(screen.getByTestId('wizard-step-1-of-4')).toBeInTheDocument()
})
```

- [ ] **Step 2–6: Implementar DomainContext, useDomainManifest, SetupWizard, e integrar labels dinâmicos**

`DomainContext`: React context com `manifest: DomainPackUIManifest`. `useDomainManifest(key)`: wrapper ao `getDomainManifest()`. Integrar context em `AppShell`, `ReviewInboxTable`, `ExtractionsTable` para usar `manifest.labels.*` e `manifest.extra_columns`. `SetupWizard` 4 passos: escolha de domínio → CRM → WhatsApp provider → teste com sample.

- [ ] **Step 7: Commit**

```bash
git add src/app/onboarding/ src/components/onboarding/ src/context/ src/hooks/use-domain-manifest*
git commit -m "feat(ui): add DomainContext, dynamic labels, and onboarding wizard"
```

---

## Task 11: Quality Gates, Accessibility, E2E

**Files:**
- Create: `src/components/layout/__tests__/accessibility.test.tsx`
- Create: `tests/e2e/review-flow.spec.ts`
- Create: `tests/e2e/extraction-detail.spec.ts`
- Modify: `scripts/check-quality-gates.mjs` (add UI-specific checks)

**Interfaces:**
- Consumes: all previous tasks
- Produces: axe-core accessibility tests, Playwright E2E for core flows

- [ ] **Step 1: Escrever testes de acessibilidade com axe**

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

it('review inbox has no accessibility violations', async () => {
  const { container } = render(<ReviewInboxPage _testItems={mockItems} _testLoaded />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

it('evidence highlight mark has accessible label', () => {
  render(<EvidenceHighlight messageBody="vendendo por 1,2 milhão" quote="1,2 milhão" />)
  const mark = screen.getByRole('mark')
  expect(mark).toHaveAttribute('aria-label', 'Trecho citado como evidência')
})

it('all interactive elements have visible focus ring', () => {
  render(<ReviewInboxPage _testItems={mockItems} _testLoaded />)
  const buttons = screen.getAllByRole('button')
  buttons.forEach(btn => {
    expect(btn).toHaveClass('focus-visible:ring-2')
  })
})
```

- [ ] **Step 2: Escrever testes E2E Playwright**

```typescript
// tests/e2e/review-flow.spec.ts
test('complete review flow: load → select → approve → next', async ({ page }) => {
  await page.goto('/review')
  await expect(page.getByRole('table')).toBeVisible()
  await page.getByRole('row').nth(1).click()
  await expect(page.getByTestId('peek-sheet')).toBeVisible()
  await page.getByRole('button', { name: 'Aprovar' }).click()
  await expect(page.getByTestId('peek-sheet')).toContainText('rv_') // next item
})

test('keyboard navigation j/k moves between review items', async ({ page }) => {
  await page.goto('/review')
  await page.keyboard.press('j')
  const firstRow = page.getByRole('row').nth(1)
  await expect(firstRow).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('j')
  const secondRow = page.getByRole('row').nth(2)
  await expect(secondRow).toHaveAttribute('aria-selected', 'true')
})

test('deep link ?inspectId= opens peek sheet on correct item', async ({ page }) => {
  await page.goto('/review?inspectId=rv_123')
  await expect(page.getByTestId('peek-sheet')).toContainText('rv_123')
})
```

- [ ] **Step 3: Instalar dependências de teste**

```bash
pnpm add -D jest-axe @axe-core/playwright @playwright/test
npx playwright install chromium
```

- [ ] **Step 4: Rodar todos os testes de acessibilidade**

Run: `npx vitest run src/components/layout/__tests__/accessibility.test.tsx`
Expected: PASS (zero violations)

- [ ] **Step 5: Rodar E2E (modo dev)**

Run: `npx playwright test tests/e2e/ --reporter=list`
Expected: PASS

- [ ] **Step 6: Commit final**

```bash
git add tests/ src/components/layout/__tests__/accessibility*
git commit -m "test(ui): add axe-core accessibility tests and Playwright E2E for review flow"
```

---

## Dependências entre Tasks

```
Task 1 (Foundation)
  └── Task 2 (Review Inbox)
  └── Task 3 (Extractions)
  └── Task 4 (Dashboard)
  └── Task 5 (Conversations)
  └── Task 6 (Settings - General/Team/Confidence)
        └── Task 7 (Settings - Integrations)
        └── Task 8 (Settings - Domain)
              └── Task 9 (Playground)
  └── Task 10 (Onboarding + Dynamic Labels) ← depende de Tasks 2,3,4,5
└── Task 11 (Quality + E2E) ← depende de todas
```

**Paralelizável após Task 1:** Tasks 2, 3, 4, 5, 6 podem rodar em paralelo.
**Paralelizável após Task 6:** Tasks 7, 8 podem rodar em paralelo.
**Task 10** aguarda Tasks 2–5. **Task 11** aguarda todas.
