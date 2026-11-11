import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  GOLDEN_CASE_FIXTURES,
  GoldenCaseFixture,
} from '../../src/packages/domain-real-estate/golden-fixtures';
import {
  interpretRealEstateTurn,
  RealEstateDomainPack,
} from '../../src/packages/domain-real-estate/opportunity-orchestrator';
import {
  PilotCRMAdapter,
  PilotCRMEnrichmentActionSchema,
} from '../../src/packages/domain-real-estate/adapters/pilotcrm-adapter';
import { UniversalInterpretationEngine } from '../../src/packages/core/engine';
import { EvidenceRef, TurnWindow, UniversalInterpretationEnvelope } from '../../src/packages/core/types';

function getFixture(caseId: string): GoldenCaseFixture {
  const f = GOLDEN_CASE_FIXTURES.find((item) => item.case_id === caseId);
  if (!f) throw new Error(`Fixture not found for ${caseId}`);
  return f;
}

function assertEvidenceSlices(
  items: Array<{ evidence_refs: EvidenceRef[] }>,
  turnWindow: TurnWindow
) {
  for (const item of items) {
    expect(item.evidence_refs.length).toBeGreaterThanOrEqual(1);
    for (const ref of item.evidence_refs) {
      const msg = turnWindow.messages.find((m) => m.message_id === ref.message_id);
      expect(msg).toBeDefined();
      const targetText = msg!.normalized_text || ref.exact_quote;
      const sliced = targetText.slice(ref.char_start, ref.char_end);
      expect(sliced.toLowerCase()).toBe(ref.exact_quote.toLowerCase());
    }
  }
}

describe('ZapTrail 20 Mandatory Golden Cases (CT-01..CT-20)', () => {
  it('CT-01: Proprietário confirma interesse em vender', async () => {
    const fixture = getFixture('CT-01');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.participants[0].role_label).toBe('owner');
    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.capture_sale');
    expect(envelope.actions[0].action_type).toBe('qualify_property');

    const price = envelope.values.find((v) => v.field_key === 'sale_asking_price');
    expect(price?.amount).toBe(1200000);

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    expect(proposals[0].payload.recommended_action).toBe('qualify_property');
    assertEvidenceSlices(envelope.opportunities, fixture.turnWindow);
  });

  it('CT-02: Proprietário confirma interesse em alugar com condomínio e IPTU', async () => {
    const fixture = getFixture('CT-02');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.participants[0].role_label).toBe('owner');
    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_rent')).toBe(true);
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.capture_rent');
    expect(envelope.actions[0].action_type).toBe('qualify_property');

    expect(envelope.values.find((v) => v.field_key === 'rent_asking_price')?.amount).toBe(4500);
    expect(envelope.values.find((v) => v.field_key === 'condo_fee')?.amount).toBe(900);
    expect(envelope.values.find((v) => v.field_key === 'iptu_amount')?.amount).toBe(250);

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    assertEvidenceSlices(envelope.values, fixture.turnWindow);
  });

  it('CT-03: Venda e locação simultâneas', async () => {
    const fixture = getFixture('CT-03');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale_and_rent')).toBe(true);
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.capture_sale_and_rent');
    expect(envelope.values.find((v) => v.field_key === 'sale_asking_price')?.amount).toBe(950000);
    expect(envelope.values.find((v) => v.field_key === 'rent_asking_price')?.amount).toBe(4200);

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    assertEvidenceSlices(envelope.opportunities, fixture.turnWindow);
  });

  it('CT-04: Cônjuge respondendo', async () => {
    const fixture = getFixture('CT-04');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.participants[0].role_label).toBe('spouse_or_partner');
    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.capture_sale');

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    assertEvidenceSlices(envelope.participants, fixture.turnWindow);
  });

  it('CT-05: Indicação de familiar com contato do dono', async () => {
    const fixture = getFixture('CT-05');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.participants[0].role_label).toBe('family_member');
    expect(envelope.intents.some((i) => i.intent_label === 'intent.refer_third_party')).toBe(true);
    expect(envelope.relationships[0]?.referred_name).toBe('Carlos');
    expect(envelope.relationships[0]?.referred_phone).toBe('11 98888-7777');
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.owner_discovery');
    expect(envelope.actions[0].action_type).toBe('request_owner_contact');

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    expect(proposals[0].payload.recommended_action).toBe('request_owner_contact');
    assertEvidenceSlices(envelope.relationships, fixture.turnWindow);
  });

  it('CT-06: Número errado / terceiro sem relação', async () => {
    const fixture = getFixture('CT-06');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.participants[0].role_label).toBe('unrelated_third_party');
    expect(envelope.intents.some((i) => i.intent_label === 'intent.not_interested_general')).toBe(true);
    expect(envelope.opportunities).toHaveLength(0);

    expect(proposals).toHaveLength(1);
    expect(proposals[0].enrichment_action).toBe('INVALIDATE');
    expect(proposals[0].target_entity).toBe('contact');
    assertEvidenceSlices(envelope.participants, fixture.turnWindow);
  });

  it('CT-07: Opt-out explícito com bloqueio comercial', async () => {
    const fixture = getFixture('CT-07');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.do_not_contact).toBe(true);
    expect(envelope.intents.some((i) => i.intent_label === 'intent.do_not_contact')).toBe(true);
    expect(envelope.actions.some((a) => a.action_type === 'suppress_commercial_followup')).toBe(true);

    expect(proposals).toHaveLength(1);
    expect(proposals[0].enrichment_action).toBe('SUPPRESS');
    expect(proposals[0].target_entity).toBe('contact');
    expect(proposals[0].payload.do_not_contact).toBe(true);
    assertEvidenceSlices(envelope.intents, fixture.turnWindow);
  });

  it('CT-08: Recusa do principal e oferta de segundo imóvel comercial', async () => {
    const fixture = getFixture('CT-08');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.intents.some((i) => i.intent_label === 'intent.not_interested_property')).toBe(true);
    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_other_property')).toBe(true);
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.capture_sale');
    expect(envelope.opportunities[0].entity_key).toBe('property_secondary');

    const secVal = envelope.values.find((v) => v.target_entity_key === 'property_secondary');
    expect(secVal?.amount).toBe(380000);

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    expect(proposals[0].target_key).toBe('property_secondary');
    assertEvidenceSlices(envelope.opportunities, fixture.turnWindow);
  });

  it('CT-09: Recusa de venda com demanda de compra de casa', async () => {
    const fixture = getFixture('CT-09');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.intents.some((i) => i.intent_label === 'intent.not_interested_property')).toBe(true);
    expect(envelope.intents.some((i) => i.intent_label === 'intent.buy_demand')).toBe(true);
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.demand_buy');
    expect(envelope.values.find((v) => v.field_key === 'budget_max')?.amount).toBe(2000000);

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    expect(proposals[0].payload.recommended_action).toBe('open_buyer_search');
    assertEvidenceSlices(envelope.opportunities, fixture.turnWindow);
  });

  it('CT-10: Demanda condicionada à venda com link e proposta RELATE', async () => {
    const fixture = getFixture('CT-10');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.opportunities.some((o) => o.opportunity_type === 'real_estate.capture_sale')).toBe(true);
    expect(envelope.opportunities.some((o) => o.opportunity_type === 'real_estate.demand_buy')).toBe(true);
    expect(envelope.conditions.some((c) => c.condition_type === 'sale_before_purchase')).toBe(true);
    expect(envelope.actions.some((a) => a.action_type === 'link_conditional_opportunities')).toBe(true);

    const relate = proposals.find((p) => p.enrichment_action === 'RELATE');
    expect(relate).toBeDefined();
    expect(relate?.target_entity).toBe('relationship');
    assertEvidenceSlices(envelope.conditions, fixture.turnWindow);
  });

  it('CT-11: Interesse futuro com imóvel locado e proposta DEFER', async () => {
    const fixture = getFixture('CT-11');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.intents.some((i) => i.intent_label === 'intent.future_interest')).toBe(true);
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.future_nurture');
    expect(envelope.actions.some((a) => a.action_type === 'register_future_followup')).toBe(true);

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('DEFER');
    expect(proposals[0].payload.recommended_action).toBe('register_future_followup');
    assertEvidenceSlices(envelope.opportunities, fixture.turnWindow);
  });

  it('CT-12: Preços em formato coloquial pt-BR normalizados', async () => {
    const fixture = getFixture('CT-12');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);

    expect(envelope.values.some((v) => v.amount === 1200000)).toBe(true);
    expect(envelope.values.some((v) => v.amount === 850000)).toBe(true);
    expect(envelope.values.some((v) => v.amount === 3500 && v.field_key === 'rent_asking_price')).toBe(true);
    expect(envelope.values.some((v) => v.amount === 900 && v.field_key === 'condo_fee')).toBe(true);
    assertEvidenceSlices(envelope.values, fixture.turnWindow);
  });

  it('CT-13: Evolução de preço com superseded e proposta UPDATE', async () => {
    const fixture = getFixture('CT-13');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    const superseded = envelope.values.find((v) => v.epistemic_status === 'superseded');
    const active = envelope.values.find((v) => v.epistemic_status === 'declared');
    expect(superseded?.amount).toBe(1200000);
    expect(active?.amount).toBe(1350000);

    const update = proposals.find((p) => p.enrichment_action === 'UPDATE');
    expect(update).toBeDefined();
    expect(update?.target_entity).toBe('property');
    expect(update?.payload.amount).toBe(1350000);
    expect(update?.payload.superseded_amount).toBe(1200000);
  });

  it('CT-14: Corretor com exclusividade e parceria fifty-fifty', async () => {
    const fixture = getFixture('CT-14');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);

    expect(envelope.participants[0].role_label).toBe('broker_or_intermediary');
    expect(envelope.conditions.some((c) => c.condition_type === 'exclusivity_constraint')).toBe(true);
    expect(envelope.conditions.some((c) => c.condition_type === 'broker_commission_condition')).toBe(true);
    assertEvidenceSlices(envelope.conditions, fixture.turnWindow);
  });

  it('CT-15: Resposta curta Sim dependente de contexto outbound', async () => {
    const fixture = getFixture('CT-15');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);

    expect(envelope.intents.some((i) => i.intent_label === 'intent.ambiguous_or_open')).toBe(true);
    expect(envelope.actions.some((a) => a.action_type === 'qualify_property')).toBe(true);
    assertEvidenceSlices(envelope.intents, fixture.turnWindow);
  });

  it('CT-16: Resposta ambígua Depende da proposta', async () => {
    const fixture = getFixture('CT-16');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);

    expect(envelope.intents.some((i) => i.intent_label === 'intent.conditional_interest' || i.intent_label === 'intent.ambiguous_or_open')).toBe(true);
    expect(envelope.actions.some((a) => a.action_type === 'qualify_property')).toBe(true);
    assertEvidenceSlices(envelope.intents, fixture.turnWindow);
  });

  it('CT-17: Mensagens fragmentadas consolidadas na TurnWindow', async () => {
    const fixture = getFixture('CT-17');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);

    expect(envelope.participants[0].role_label).toBe('owner');
    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);
    expect(envelope.opportunities).toHaveLength(1);
    expect(envelope.values.find((v) => v.field_key === 'sale_asking_price')?.amount).toBe(980000);
    assertEvidenceSlices(envelope.opportunities, fixture.turnWindow);
  });

  it('CT-18: Entrega duplicada de webhook (idempotência)', async () => {
    const fixture = getFixture('CT-18');
    const pack = new RealEstateDomainPack();
    const engine = new UniversalInterpretationEngine(pack);

    const env1 = await engine.interpretTurn(fixture.turnWindow);
    expect(env1.duplicate).toBe(false);

    const env2 = await engine.interpretTurn(fixture.turnWindow);
    expect(env2.duplicate).toBe(true);
    expect(env2.opportunities).toHaveLength(0);
    expect(env2.actions).toHaveLength(0);

    const proposals = PilotCRMAdapter.toProposals(env2);
    expect(proposals).toHaveLength(0);
  });

  it('CT-19: Mensagem com anexo de mídia preservando evidência', async () => {
    const fixture = getFixture('CT-19');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);

    expect(envelope.media_results).toHaveLength(1);
    expect(envelope.media_results[0].linked_entity_key).toBe('property_primary');
    expect(envelope.media_results[0].attachment_id).toBe('att-ct-19');
    expect(envelope.media_results[0].evidence_refs.length).toBeGreaterThanOrEqual(1);
  });

  it('CT-20: Conflito conjugal e aprovação familiar com proposta REVIEW', async () => {
    const fixture = getFixture('CT-20');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.conditions.some((c) => c.condition_type === 'family_approval')).toBe(true);
    expect(envelope.review_required).toBe(true);
    expect(envelope.review_items.length).toBeGreaterThanOrEqual(1);
    expect(envelope.actions.some((a) => a.action_type === 'human_review')).toBe(true);

    const reviewProp = proposals.find((p) => p.enrichment_action === 'REVIEW');
    expect(reviewProp).toBeDefined();
    expect(reviewProp?.requires_human_review).toBe(true);
  });

  it('CT-21: Recusa educada de proprietário ao outbound de captação', async () => {
    const fixture = getFixture('CT-21');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);

    expect(envelope.participants[0].role_label).toBe('owner');
    expect(envelope.participants[0].epistemic_status).toBe('inferred');
    expect(envelope.participants[0].confidence).toBe(0.7);
    expect(envelope.intents.some((i) => i.intent_label === 'intent.not_interested_property')).toBe(true);
    expect(envelope.opportunities).toHaveLength(0);
    assertEvidenceSlices(envelope.participants, fixture.turnWindow);
    assertEvidenceSlices(envelope.intents, fixture.turnWindow);
  });

  it('CT-22: Recusa de venda com interesse em aluguel', async () => {
    const fixture = getFixture('CT-22');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.participants[0].role_label).toBe('owner');
    expect(envelope.participants[0].epistemic_status).toBe('inferred');
    expect(envelope.participants[0].confidence).toBe(0.8);
    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_rent')).toBe(true);
    expect(envelope.intents.some((i) => i.intent_label === 'intent.not_interested_property')).toBe(true);
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.capture_rent');

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    assertEvidenceSlices(envelope.intents, fixture.turnWindow);
  });

  it('CT-23: Familiar indica o titular com contato', async () => {
    const fixture = getFixture('CT-23');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.participants[0].role_label).toBe('family_member');
    expect(envelope.participants[0].confidence).toBe(0.9);
    expect(envelope.intents.some((i) => i.intent_label === 'intent.refer_third_party')).toBe(true);
    expect(envelope.relationships[0]?.referred_name).toBe('Ricardo');
    expect(envelope.relationships[0]?.referred_phone).toBe('11 98888-7777');
    expect(envelope.opportunities[0].opportunity_type).toBe('real_estate.owner_discovery');
    expect(envelope.actions[0].action_type).toBe('request_owner_contact');

    expect(proposals).toHaveLength(2);
    expect(proposals[0].enrichment_action).toBe('ADD');
    assertEvidenceSlices(envelope.relationships, fixture.turnWindow);
  });

  it('CT-24: Número sem relação com o titular', async () => {
    const fixture = getFixture('CT-24');
    const envelope = await interpretRealEstateTurn(fixture.turnWindow);
    const proposals = PilotCRMAdapter.toProposals(envelope);

    expect(envelope.participants[0].role_label).toBe('unrelated_third_party');
    expect(envelope.participants[0].confidence).toBe(0.9);
    expect(envelope.intents.some((i) => i.intent_label === 'intent.not_interested_general')).toBe(true);
    expect(envelope.opportunities).toHaveLength(0);

    expect(proposals).toHaveLength(1);
    expect(proposals[0].enrichment_action).toBe('INVALIDATE');
    expect(proposals[0].target_entity).toBe('contact');
    assertEvidenceSlices(envelope.participants, fixture.turnWindow);
    assertEvidenceSlices(envelope.intents, fixture.turnWindow);
  });

  it('Validates that 100% of proposals across all 20 golden cases pass PilotCRMEnrichmentActionSchema', async () => {
    for (const fixture of GOLDEN_CASE_FIXTURES) {
      const envelope = await interpretRealEstateTurn(fixture.turnWindow);
      const proposals = PilotCRMAdapter.toProposals(envelope);
      for (const p of proposals) {
        expect(PilotCRMEnrichmentActionSchema.parse(p.enrichment_action)).toBe(p.enrichment_action);
        expect(p.action).not.toBe('create_deal');
        expect(p.evidence_refs.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('QA-01 Architectural Boundary: src/packages/core contains zero real estate domain tokens and zero imports from domain packages (D-02)', () => {
    const coreDir = path.resolve(process.cwd(), 'src/packages/core');
    const files = fs.readdirSync(coreDir).filter((f) => f.endsWith('.ts'));
    const prohibitedTokens = [
      'iptu',
      'condo_fee',
      'bedrooms',
      'property_type',
      'matricula',
      'aluguel',
      'venda',
      'alugar',
      'vender',
      'locacao',
      'locação',
      'quartos',
      'inquilino',
      'corretor',
      'real_estate',
    ];

    for (const file of files) {
      const content = fs.readFileSync(path.join(coreDir, file), 'utf-8');
      // 1. Prohibited domain tokens
      for (const token of prohibitedTokens) {
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        const match = regex.test(content);
        expect(match, `Found prohibited domain token "${token}" in core file: ${file}`).toBe(false);
      }
      // 2. Prohibited imports from domain packages
      expect(content).not.toMatch(/from\s+['"].*domain-real-estate/);
    }
  });

  it('QA-01 Architectural Boundary: src/packages/mcp contains zero real estate domain vocabulary and zero imports from domain packages', () => {
    const mcpDir = path.resolve(process.cwd(), 'src/packages/mcp');
    const files = fs.readdirSync(mcpDir).filter((f) => f.endsWith('.ts'));
    const prohibitedTokens = [
      'iptu',
      'condo_fee',
      'bedrooms',
      'property_type',
      'matricula',
      'aluguel',
      'alugar',
      'locacao',
      'locação',
      'quartos',
      'inquilino',
      'corretor',
    ];

    for (const file of files) {
      const content = fs.readFileSync(path.join(mcpDir, file), 'utf-8');
      for (const token of prohibitedTokens) {
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        const match = regex.test(content);
        expect(match, `Found prohibited domain token "${token}" in MCP file: ${file}`).toBe(false);
      }
      expect(content).not.toMatch(/from\s+['"].*domain-real-estate/);
    }
  });

  it('QA-01 Quality Rule: all production files in src/packages/, src/app/api/, src/components/ have <= 350 lines (D-01)', () => {
    const roots = [
      path.resolve(process.cwd(), 'src/packages'),
      path.resolve(process.cwd(), 'src/app/api'),
      path.resolve(process.cwd(), 'src/components'),
    ];
    function getAllTsFiles(dir: string): string[] {
      if (!fs.existsSync(dir)) return [];
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(getAllTsFiles(fullPath));
        } else if ((item.endsWith('.ts') || item.endsWith('.tsx')) && !item.includes('.test.')) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const allTsFiles = roots.flatMap(getAllTsFiles);
    expect(allTsFiles.length).toBeGreaterThanOrEqual(15);

    for (const filePath of allTsFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const relative = path.relative(process.cwd(), filePath);
      expect(lines.length, `File ${relative} exceeded 350 lines limit (has ${lines.length} lines)`).toBeLessThanOrEqual(350);
    }
  });
});
