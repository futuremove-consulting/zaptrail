# Phase 5 Technical Research: PilotCRM Module Registry & Marketplace Card

## Architecture & Integration Points

### 1. Module Registry & Flags in PilotCRM

Location: `C:\Users\Gustavo\pilotcrm\apps\pilotcrm\src\lib\module-flags\types.ts`
- Current `ModuleKey`: union of 13 strings (`pipeline`, `inbox`, `contacts`, `properties`, `owners`, `captacao`, `market_price`, `campaigns`, `broadcast`, `automations`, `portais`, `ai_copilot`, `property_creation`).
- Target: Append `| "zaptrail"`.
- `MODULE_REGISTRY`:
  ```typescript
  zaptrail: {
    key: "zaptrail",
    name: "ZapTrail Intelligence",
    description: "Motor desacoplado de inteligência para WhatsApp, resolução de entidades e extração de oportunidades.",
    category: "inteligencia",
    defaultEnabled: false,
  }
  ```
- `DEFAULT_MODULE_FLAGS`:
  `zaptrail: false`
- `updateModuleSchema`:
  Include `"zaptrail"` in `z.enum([...])`.

### 2. Modules API Route in PilotCRM

Location: `C:\Users\Gustavo\pilotcrm\apps\pilotcrm\src\app\api\crm\modules\route.ts`
- GET: Returns enabled flags for the active workspace/tenant.
- POST: Validates input with `updateModuleSchema` and updates workspace settings / flags in database.

### 3. Settings UI in PilotCRM

Location: `C:\Users\Gustavo\pilotcrm\apps\pilotcrm\src\app\crm\settings\modules/page.tsx`
- Renders modules grouped by `CATEGORIES` (`core`, `operacao`, `inteligencia`, `expansao`).
- ZapTrail will render inside "Inteligência & Mercado".
- Add an expandable configuration drawer or modal for configuring:
  - ZapTrail Endpoint: `http://localhost:3000/api/v1/ingest/whatsapp` (or production URL)
  - Auth Token / API Key
  - Health check indicator (`Ping ZapTrail`)

### 4. Safety & Threat Model (ASVS Level 1)

- **T-05-01**: Tenant Cross-Talk — As flags e credenciais do ZapTrail devem ser escopadas estritamente ao `workspace_id` autenticado do PilotCRM.
- **T-05-02**: Broken Access Control — Apenas usuários com role `owner` ou `admin` podem ativar/desativar módulos e alterar URLs/tokens.
- **T-05-03**: SSRF Mitigation — A URL do ZapTrail deve validar protocolo HTTP/HTTPS e rejeitar IPs privados se configurado em ambiente de produção.
