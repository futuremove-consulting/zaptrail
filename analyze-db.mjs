// @type module
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://ipvfualdiesjykocgoqq.supabase.co",
  "sb_publishable_0oN3zPTXZ5TrFwHlHz5S5g_BAlcKW4N"
);

async function runAnalysis() {
  console.log("\n=== EXTRAINDO MENSAGENS COM 'VENDER' OU 'ALUGAR' ===\n");
  
  // Query: mensagens com vender OU alugar
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*, conversations!inner(tenant_id)')
    .or("message_text.ilike.%vender%,message_text.ilike.%alugar%")
    .limit(2000);
  
  if (error) {
    console.error("Erro Supabase:", error);
    return;
  }
  
  console.log(`\nTotal extraídas: ${messages?.length || 0}\n`);
  
  if (!messages || messages.length === 0) {
    console.log("Nenhuma mensagem encontrada. Verificando estrutura...");
    return;
  }
  
  // Classificador simples baseado na lógica E09 do canonical-taxonomy
  const classify = (text) => {
    if (!text) return 'unknown';
    const t = text.toLowerCase();
    
    // E09: ambos presentes sem sim/nao
    const hasVender = /\b(vender|venda|pra vender|vendo)\b/.test(t);
    const hasAlugar = /\b(alugar|aluguel|locacao|loco|pra alugar)\b/.test(t);
    
    if (hasVender && hasAlugar) {
      // Verificar se tem "sim" ou "nao"
      if (/sim/.test(t) && !/nao/.test(t)) return 'sale_yes_rent_no';
      if (!/sim/.test(t) && /nao/.test(t)) return 'sale_and_rent';
      if (/sim/.test(t) && /nao/.test(t)) {
        if (/vender.*sim.*alugar|alugar.*sim.*vender/.test(t)) return 'sale_and_rent';
        return 'unknown'; // contradictório
      }
      return 'sale_and_rent'; // fallback E09
    }
    
    if (hasVender) return 'available_sale';
    if (hasAlugar) return 'rent_property';
    
    return 'unknown';
  };
  
  // Classificar
  const results = [];
  for (const m of messages) {
    const text = m.message_text || m.raw_text || '';
    const code = classify(text);
    results.push({ text: text.substring(0,80), code });
  }
  
  // Resumo
  const total = results.length;
  const byCode = {};
  for (const r of results) {
    byCode[r.code] = (byCode[r.code] || 0) + 1;
  }
  
  console.log("\n=== RESUMO CLASSIFICACAO ===");
  console.log(`Total: ${total}`);
  for (const [code, count] of Object.entries(byCode)) {
    console.log(`  ${code}: ${count} (${(count/total*100).toFixed(1)}%)`);
  }
  
  // Top textos unknown
  console.log("\n=== TOP 10 TEXTOS 'unknown' ===");
  results.filter(r => r.code === 'unknown').slice(0,10).forEach((r,i) => {
    console.log(`${i+1}. "${r.text}"`);
  });
  
  // Top textos sale_and_rent
  console.log("\n=== TOP 10 TEXTOS 'sale_and_rent' ===");
  results.filter(r => r.code === 'sale_and_rent').slice(0,10).forEach((r,i) => {
    console.log(`${i+1}. "${r.text}"`);
  });
}

runAnalysis();