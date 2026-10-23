import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://ipvfualdiesjykocgoqq.supabase.co",
  "sb_publishable_0oN3zPTXZ5TrFwHlHz5S5g_BAlcKW4N"
);

async function analyzeConversations() {
  console.log("\n=== Analisando conversas reais do banco ===\n");
  
  // 1. Extrair mensagens com "vender" ou "alugar"
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .or("message_text.ilike.%vender%,message_text.ilike.%alugar%")
    .limit(2000);
  
  if (error) {
    console.error("Erro ao extrair:", error.message);
    return;
  }
  
  console.log(`Mensagens extraídas: ${messages?.length || 0}`);
  
  // 2. Classificador simplificado baseado na lógica do canonical-taxonomy
  const classifyText = (text) => {
    if (!text) return { decisionCode: 'unknown', matched: [] };
    const t = text.toLowerCase();
    
    // E09: vender sim, alugar não
    if (/vender.*sim.*alugar.*nao/.test(t) || /venda.*sim.*aluguel.*nao/.test(t)) {
      return { decisionCode: 'sale_yes_rent_no', matched: ['COMPOSITIONAL_SALE_ONLY'] };
    }
    
    // E09: alugar sim, vender não
    if (/alugar.*sim.*vender.*nao/.test(t) || /aluguel.*sim.*venda.*nao/.test(t)) {
      return { decisionCode: 'rent_yes_sale_no', matched: ['COMPOSITIONAL_RENT_ONLY'] };
    }
    
    // E09 Fallback: ambos presentes sem sim/nao
    const hasVender = /\bvender|venda|pra vender|vendo\b/.test(t);
    const hasAlugar = /\balugar|aluguel|locacao|loco|pra alugar\b/.test(t);
    if (hasVender && hasAlugar) {
      return { decisionCode: 'sale_and_rent', matched: ['E09_FALLBACK'] };
    }
    
    if (hasVender) return { decisionCode: 'available_sale', matched: ['SALE_PATTERNS'] };
    if (hasAlugar) return { decisionCode: 'rent_property', matched: ['RENT_PATTERNS'] };
    
    return { decisionCode: 'unknown', matched: [] };
  };
  
  // 3. Classificar todas
  const results = [];
  for (const msg of messages || []) {
    const text = msg.message_text || msg.raw_text || '';
    if (!text.trim()) continue;
    const classification = classifyText(text);
    results.push({
      id: msg.id,
      text: text.substring(0, 100),
      decisionCode: classification.decisionCode,
      matchedPatterns: classification.matched,
    });
  }
  
  // 4. Relatório
  const total = results.length;
  const byCode = {};
  for (const r of results) {
    byCode[r.decisionCode] = (byCode[r.decisionCode] || 0) + 1;
  }
  
  console.log("\n=== RELATÓRIO DE COBERTURA ===");
  console.log(`Total analisado: ${total}`);
  console.log("\nDistribuição de decisionCodes:");
  for (const [code, count] of Object.entries(byCode)) {
    console.log(`  ${code}: ${count} (${(count/total*100).toFixed(1)}%)`);
  }
  
  const unknown = byCode['unknown'] || 0;
  const saleAndRent = byCode['sale_and_rent'] || 0;
  const saleYesRentNo = byCode['sale_yes_rent_no'] || 0;
  const rentYesSaleNo = byCode['rent_yes_sale_no'] || 0;
  
  console.log("\n=== INSIGHTS E09 ===");
  console.log(`sale_and_rent (ambos sem sim/nao): ${saleAndRent} (${(saleAndRent/total*100).toFixed(1)}%)`);
  console.log(`sale_yes_rent_no (vender sim, alugar nao): ${saleYesRentNo} (${(saleYesRentNo/total*100).toFixed(1)}%)`);
  console.log(`rent_yes_sale_no (alugar sim, vender nao): ${rentYesSaleNo} (${(rentYesSaleNo/total*100).toFixed(1)}%)`);
  console.log(`unknown: ${unknown} (${(unknown/total*100).toFixed(1)}%)`);
  
  // 5. Top textos unknown
  console.log("\n=== TOP 20 TEXTOS NAO CLASSIFICADOS ===");
  results.filter(r => r.decisionCode === 'unknown').slice(0, 20).forEach((r, i) => {
    console.log(`${i+1}. "${r.text}"`);
  });
  
  // 6. Top textos sale_and_rent
  console.log("\n=== TEXTOS sale_and_rent (E09 Edge Cases) ===");
  results.filter(r => r.decisionCode === 'sale_and_rent').slice(0, 20).forEach((r, i) => {
    console.log(`[${i+1}] "${r.text}"`);
  });
}

analyzeConversations();
