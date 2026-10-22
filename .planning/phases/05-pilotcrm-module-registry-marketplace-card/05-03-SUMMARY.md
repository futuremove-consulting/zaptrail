# Plan 05-03 Summary — Server-Side Encrypted Persistence for ZapTrail Integration

**Requirement:** PCRM-02 (Defect closure) ✅
**PilotCRM commit:** `021a947` (`feat(settings): persist ZapTrail credentials encrypted server-side per tenant (PCRM-02, D-5-04)`)

## What was built (PilotCRM repo)
1. **Database Schema & Migrations:**
   - `src/db/schema/tenantIntegrationSettings.ts`: Table `tenant_integration_settings` with `(tenant_id, integration_key)` unique index, storing `endpoint_url`, `secret_ciphertext`, `secret_last4`, `updated_by`.
   - `src/db/migrations/0024_tenant_integration_settings.sql`: PostgreSQL DDL enabling RLS with no public/authenticated policy (accessible only by server backend connection).
   - `src/db/schema/index.ts`: Re-exported `tenantIntegrationSettings`.

2. **Integration Settings Service & Repository:**
   - `src/lib/integrations/zaptrail-settings.ts`:
     - Token encryption via AES-256-GCM (`encrypt` / `decrypt` from `src/lib/owners/crypto.ts`).
     - Plaintext tokens are NEVER stored, returned to frontend, or logged.
     - `validateEndpoint`: validates HTTP/HTTPS in development and enforces HTTPS while blocking private/loopback IP ranges in production (SSRF mitigation, T-05-05).
     - `maskToken`: masks tokens showing only `••••XXXX` (T-05-03).
     - `getZapTrailSettings`: returns safe view `{ configured, endpointUrl, tokenMasked }`.
     - `saveZapTrailSettings`: handles updates (keeps existing ciphertext if token omitted on subsequent edit).
     - `getZapTrailCredentials`: server-only helper for Phase 6 triggers to decrypt credentials.
   - `src/lib/integrations/zaptrail-settings-repo.ts`: Drizzle implementation of `SettingsRepo` with explicit `.where()` tenancy filter.

3. **Secure API Route:**
   - `src/app/api/crm/integrations/zaptrail/route.ts`:
     - `GET`: Authenticated with `requireAuth()`, enforced `admin` role with `requireRole(auth, "admin")`. Returns masked settings.
     - `PUT`: Zod-validated input schema. Updates tenant credentials securely.

4. **UI Refactor (Elimination of `localStorage`):**
   - `ZapTrailConfigCard.tsx`: All `localStorage` reads/writes completely removed. Receives `configured`, `tokenMasked`, `initialEndpoint`, and `onSaveConfig` props. Displays masked token placeholder and clears token field after save.
   - `page.tsx`: Fetches `/api/crm/integrations/zaptrail` on mount and passes server-persisted state to `ZapTrailConfigCard`.
   - `__tests__/zaptrail-card.test.tsx`: Verified that `Storage.prototype.setItem`/`getItem` are never called for ZapTrail.

## Verification
- `vitest run src/app/crm/settings/modules src/lib/integrations src/app/api/crm/integrations`: 6 test files, 52/52 passed.
- `tsc --noEmit`: 0 errors.
- Pre-commit quality gates: `max-lines`, `no-direct-console`, `no-direct-data-access`, `no-raw-color`, `architecture`, `design-system`, `UI writing` all passed.
- All files <= 350 lines (`ZapTrailConfigCard.tsx`: 218 lines, `page.tsx`: 245 lines).
- Success criterion 3 of Phase 5 is now 100% satisfied.
