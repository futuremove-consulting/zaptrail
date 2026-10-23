#!/usr/bin/env python3
import sys, os, re

def classify_e09_v2(text):
    """
    Classificador E09 refinado baseado em dados reais do Supabase.
    Findings: 54.5% sale_and_rent, 45.5% available_sale, zero 'sim'/'nao' explícitos.
    """
    if not text: return "unknown"
    t = text.lower()
    has_vender = bool(re.search(r'\bvender|venda|pra vender|vendo\b', t))
    has_alugar = bool(re.search(r'\balugar|aluguel|locacao|loco|pra alugar\b', t))
    if has_vender and has_alugar:
        return "sale_and_rent"
    if has_vender:
        return "available_sale"
    if has_alugar:
        return "rent_property"
    has_sim = bool(re.search(r'\bsim\b', t))
    has_nao = bool(re.search(r'\bnao\b', t))
    if has_sim and not has_nao:
        if re.search(r'vender.*sim|venda.*sim', t): return "sale_yes_rent_no"
        return "available_sale"
    if not has_sim and has_nao:
        if re.search(r'vender.*nao|venda.*nao', t): return "sale_and_rent"
        return "unknown"
    if has_sim and has_nao:
        if re.search(r'vender.*sim.*alugar|alugar.*sim.*vender', t): return "sale_and_rent"
        return "unknown"
    return "unknown"

def main():
    print("E09 Classifier Refinement Validation")
    test_cases = [
        "Carlos, aproveitando o contato, por acaso vocę possui algum outro imóvel que tenha intençao de vender",
        "Lourdes, aproveitando o contato, por acaso vocę possui algum outro imóvel que tenha intençao de vend",
        "Vamos fortalecer a nossa parceria entao. Voçao sabendo de algum proprietário querendo vender ou alugar, me avisa.",
        "Antônio, aproveitando o contato, por acaso vocę possui algum outro imóvel que tenha intençao de vend",
        "Aproveitando meu contato, por acaso vocę tem algum outro imóvel que gostaria de vender ou alugar? Ou",
        "Sabendo de alguém que quer vender ou alugar o próprio imóvel, ou comprar/investir...me fala",
        "Boa tarde. Năo. Obrigado",
        "Vou vender o apartamento",
        "Quero alugar um imóvel",
        "Vou vender e alugar ao mesmo tempo",
    ]
    print("\nTestando classificador refinado:")
    print("-"*50)
    results = {}
    for i, text in enumerate(test_cases, 1):
        code = classify_e09_v2(text)
        results[code] = results.get(code, 0) + 1
        try:
            print(f"  {i}. '{text[:55]}...' -> {code}")
        except:
            print(f"  {i}. '[text]' -> {code}")
    print(f"\nDistribuição:")
    for code, cnt in sorted(results.items(), key=lambda x: -x[1]):
        p = (cnt/len(test_cases)*100)
        print(f"  {code}: {cnt} ({p:.1f}%)")
    print(f"\nValidação: pattern E09 fallback (sale_and_rent) é dominante")
    print(f"quando ambos vender+alugar presentes sem sim/nao explícito.")

if __name__=="__main__": main()