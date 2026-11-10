---
type: "Reference"
title: "Quickstart & System Overview"
openwiki_generated: true
verified:
  - by: openwiki/0.9.0
    at: 2026-11-10T22:22:09.496Z
sources:
  - id: openwiki-source-5b54a58d1b51cd490b0e7162
    resource: repo://package.json
  - id: openwiki-source-67379b744d851f2a86534825
    resource: repo://scripts/check-quality-gates.mjs
generated: { by: "antigravity", at: "2026-11-10T22:22:09.496Z" }
---

# Quickstart & System Overview

ZapTrail is a high-performance conversational intelligence engine that transforms unstructured WhatsApp message streams into grounded business opportunities. It combines deterministic Stage 1 rule classifiers with Stage 2 structured LLM fallback and strict anti-hallucination verification.

## Prerequisites & Installation

ZapTrail runs on Node.js (LTS version recommended) and uses `pnpm` as its primary package manager:

```bash
# Clone the repository
git clone https://github.com/futuremove-consulting/zaptrail.git
cd zaptrail

# Install dependencies
pnpm install
```

## Running the Application Locally

```bash
# Start the Next.js development server
pnpm dev

# Build the production bundle
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the ZapTrail AppShell and Review Inbox.

## Quality Verification Commands

Before creating any pull request or committing changes, execute the canonical quality verification pipeline:

```bash
# Verify architectural gates (350-line limit, OKLCH tokens, scrim contract)
node scripts/check-quality-gates.mjs

# TypeScript static type check
npx tsc --noEmit

# Run complete Vitest suite (41+ suites, 315+ tests)
pnpm test

# Run Playwright browser E2E tests (real Chromium)
pnpm test:e2e

# Run all checks sequentially
pnpm check:all
```

## Task-Routing Map

Navigate directly to the relevant documentation section based on your engineering task:

| I want to... | Documentation Page |
| :--- | :--- |
<!-- openwiki: broken internal link [/openwiki/core/universal-envelope.md] link "/openwiki/core/universal-envelope.md" is root-absolute, which no real consumer resolves against the repository root (not a coding agent reading the page, not GitHub's Markdown renderer, not a local viewer); use a path relative to this file instead. Fix the href or restore the target, then delete this comment. -->
| **Understand the core data contracts & types** | [Universal Semantic Envelope & Core Types](/openwiki/core/universal-envelope.md) |
<!-- openwiki: broken internal link [/openwiki/domain/real-estate-engine.md] link "/openwiki/domain/real-estate-engine.md" is root-absolute, which no real consumer resolves against the repository root (not a coding agent reading the page, not GitHub's Markdown renderer, not a local viewer); use a path relative to this file instead. Fix the href or restore the target, then delete this comment. -->
| **Modify or add Real Estate 7-layer extraction rules** | [Real Estate Domain Pack & 7-Layer Classifier](/openwiki/domain/real-estate-engine.md) |
<!-- openwiki: broken internal link [/openwiki/integrations/pilotcrm.md] link "/openwiki/integrations/pilotcrm.md" is root-absolute, which no real consumer resolves against the repository root (not a coding agent reading the page, not GitHub's Markdown renderer, not a local viewer); use a path relative to this file instead. Fix the href or restore the target, then delete this comment. -->
| **Integrate with PilotCRM or inspect proposal schemas** | [PilotCRM Hexagonal Adapter & AI Suggestions Loop](/openwiki/integrations/pilotcrm.md) |
<!-- openwiki: broken internal link [/openwiki/workflows/ingest-pipeline.md] link "/openwiki/workflows/ingest-pipeline.md" is root-absolute, which no real consumer resolves against the repository root (not a coding agent reading the page, not GitHub's Markdown renderer, not a local viewer); use a path relative to this file instead. Fix the href or restore the target, then delete this comment. -->
| **Configure WhatsApp webhooks, coalescing or debouncing** | [WhatsApp Turn Ingestion Pipeline & Coalescing](/openwiki/workflows/ingest-pipeline.md) |
<!-- openwiki: broken internal link [/openwiki/ui/design-system.md] link "/openwiki/ui/design-system.md" is root-absolute, which no real consumer resolves against the repository root (not a coding agent reading the page, not GitHub's Markdown renderer, not a local viewer); use a path relative to this file instead. Fix the href or restore the target, then delete this comment. -->
| **Work on UI components, Radix sheets, or OKLCH styling** | [PilotCRM Design System & UI Components](/openwiki/ui/design-system.md) |
<!-- openwiki: broken internal link [/openwiki/operations/testing-and-quality.md] link "/openwiki/operations/testing-and-quality.md" is root-absolute, which no real consumer resolves against the repository root (not a coding agent reading the page, not GitHub's Markdown renderer, not a local viewer); use a path relative to this file instead. Fix the href or restore the target, then delete this comment. -->
| **Review quality gates, 350-line limit, or write tests** | [Testing Strategy & Quality Gates](/openwiki/operations/testing-and-quality.md) |
<!-- openwiki: broken internal link [/openwiki/architecture/overview.md] link "/openwiki/architecture/overview.md" is root-absolute, which no real consumer resolves against the repository root (not a coding agent reading the page, not GitHub's Markdown renderer, not a local viewer); use a path relative to this file instead. Fix the href or restore the target, then delete this comment. -->
| **Learn about system boundaries and hexagonal ports** | [Architecture & Bounded Contexts](/openwiki/architecture/overview.md) |
