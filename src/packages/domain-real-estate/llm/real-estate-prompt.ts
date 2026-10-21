import { TurnWindow } from '../../core/types';
import { SeededPropertyCandidate } from '../types';

/**
 * Builds the system prompt for Portuguese real estate structured semantic extraction.
 * Enforces strict literal exact_quote requirement to prevent LLM hallucinations.
 */
export function buildRealEstateLlmSystemPrompt(): string {
  return `Você é um extrator semântico estruturado especializado no mercado imobiliário brasileiro (pt-BR).
Sua missão é analisar o turno de mensagens trocadas no WhatsApp e extrair entidades, papéis, intenções, valores e condições.

DIRETRIZ CRÍTICA DE ANTI-ALUCINAÇÃO (REGRA DE CITAÇÃO LITERAL):
- Para CADA entidade ou atributo extraído (detected_role, cada intent, cada property, demand_profile, cada condition), o campo 'exact_quote' DEVE ser uma substring EXATA e LITERAL do texto enviado pelo usuário.
- NUNCA invente, resuma, parafraseie ou combine trechos em 'exact_quote'.
- Se o usuário disse "vou ver com a patroa", exact_quote DEVE ser "vou ver com a patroa".
- Qualquer citação que não for encontrada literalmente no texto será sumariamente rejeitada pelo validador determinístico como alucinação.

TAXONOMIA DE PAPÉIS (detected_role.role):
- owner: Proprietário direto do imóvel.
- co_owner: Co-proprietário ou sócio do imóvel.
- spouse_or_partner: Cônjuge ou parceiro(a) do proprietário.
- family_member: Familiar (irmão, pai, mãe, filho, sobrinho) que não é proprietário direto.
- broker_or_intermediary: Corretor de imóveis ou imobiliária parceira.
- tenant_or_occupant: Inquilino ou morador atual.
- unrelated_third_party: Engano, número errado, sem relação com o imóvel.
- unknown: Papel não identificado ou ambíguo.

TAXONOMIA DE INTENÇÕES (intents.label):
- intent.capture_for_sale: Intenção de disponibilizar o imóvel para venda.
- intent.capture_for_rent: Intenção de disponibilizar o imóvel para locação.
- intent.capture_for_sale_and_rent: Intenção simultânea de venda e locação.
- intent.not_interested_property: Não tem interesse em negociar o imóvel específico.
- intent.not_interested_general: Não tem imóveis para negociar em geral / engano.
- intent.do_not_contact: Solicitação expressa de opt-out (pare de mandar mensagem).
- intent.capture_other_property: Recusa ou finaliza o imóvel atual, mas oferece outro imóvel.
- intent.buy_demand: Procura comprar um imóvel.
- intent.rent_demand: Procura alugar um imóvel.
- intent.conditional_interest: Interesse condicionado a proposta ou evento.
- intent.future_interest: Interesse em negociar em data futura.
- intent.refer_third_party: Indica o contato do proprietário real.
- intent.price_or_condition_update: Atualização de preço, condomínio ou IPTU.
- intent.ambiguous_or_open: Resposta ambígua ou que necessita de qualificação.

TAXONOMIA DE CONDIÇÕES (conditions.condition_type):
- sale_before_purchase: Só compra se vender o imóvel atual antes.
- family_approval: Decisão depende de aprovação do cônjuge/família.
- tenant_vacating: Imóvel está locado e aguarda saída do inquilino.
- documentation_regularization: Inventário, pendência em cartório ou escritura.
- date_or_timeframe: Janela temporal (ex: só após março).
- exclusivity_constraint: Exclusividade de venda com corretor.
- broker_commission_condition: Condição de divisão de comissão (parceria).
- custom_condition: Outra condição específica.

MÚLTIPLOS IMÓVEIS:
Se o interlocutor recusar o imóvel abordado ("esse não vendo") mas ofertar outro imóvel ("tenho um nos Jardins por 1M"):
- Crie um item de propriedade para cada um:
  - property_index 0: Imóvel abordado (intent: intent.not_interested_property).
  - property_index 1: Imóvel alternativo (intent: intent.capture_other_property, sale_asking_price, address_hint).`;
}

/**
 * Builds the user prompt for the real estate LLM extraction, providing conversation context
 * and any seeded campaign candidate information.
 */
export function buildRealEstateLlmUserPrompt(turn: TurnWindow): string {
  const parts: string[] = [];

  const seeds =
    (turn.seeded_context?.seeded_property_candidates as SeededPropertyCandidate[]) || [];
  if (seeds.length > 0) {
    parts.push('### CONTEXTO DE CAMPANHA ATIVA (IMÓVEIS PRÉ-CADASTRADOS):');
    seeds.forEach((seed, idx) => {
      const details = [
        seed.address_line ? `Endereço: ${seed.address_line}` : null,
        seed.neighborhood ? `Bairro: ${seed.neighborhood}` : null,
        seed.city ? `Cidade: ${seed.city}` : null,
        seed.listing_type ? `Modalidade da abordagem: ${seed.listing_type}` : null,
        seed.expected_price ? `Valor esperado: R$ ${seed.expected_price}` : null,
      ]
        .filter(Boolean)
        .join(', ');
      parts.push(`[Imóvel Semeado #${idx + 1}] ${details}`);
    });
    parts.push('');
  }

  if (turn.prior_outbound_message) {
    parts.push('### MENSAGEM OUTBOUND ANTERIOR (ENVIADA PELA IMOBILIÁRIA):');
    parts.push(`"${turn.prior_outbound_message.raw_text}"`);
    parts.push('');
  }

  parts.push('### MENSAGENS RECEBIDAS NO TURNO DO USUÁRIO (WHATSAPP):');
  turn.messages.forEach((msg, idx) => {
    parts.push(`[Mensagem ${idx + 1} | ID: ${msg.message_id} | ${msg.direction}]`);
    parts.push(`"${msg.raw_text}"`);
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach((att) => {
        parts.push(`  - [Anexo: ${att.media_kind} (${att.mime_type}) | Legenda: ${att.caption ?? 'sem legenda'}]`);
      });
    }
  });

  parts.push('');
  parts.push('### INSTRUÇÃO:');
  parts.push(
    'Extraia a estrutura semântica em formato JSON respeitando rigorosamente o schema e a regra de exatidão das citações (exact_quote).'
  );

  return parts.join('\n');
}
