#!/usr/bin/env python3
import json, sys, os, re, urllib.request, urllib.parse
SUPABASE_URL="https://ipvfualdiesjykocgoqq.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_REPLACE_ME"  # Service role key - replaced for GH protection
def q(p=None):
    u=f"{SUPABASE_URL}/rest/v1/messages"
    if p:u+="?"+urllib.parse.urlencode(p) if "?" not in u else "&"+urllib.parse.urlencode(p)
    r=urllib.request.Request(u,method="GET")
    r.add_header("apikey",SUPABASE_SECRET_KEY)
    r.add_header("Authorization",f"Bearer {SUPABASE_SECRET_KEY}")
    r.add_header("Content-Type","application/json")
    try:
        with urllib.request.urlopen(r,timeout=60) as resp: return json.loads(resp.read().decode())
    except Exception as e: print(f"Erro: {e}"); return None
def c_e09(t):
    if not t: return "unknown"
    t=t.lower()
    hv=bool(re.search(r'\bvender|venda|pra vender|vendo\b',t))
    ha=bool(re.search(r'\balugar|aluguel|locacao|loco|pra alugar\b',t))
    if hv and ha: return "sale_and_rent"
    if hv: return "available_sale"
    if ha: return "rent_property"
    return "unknown"
def c_e01_a08(t):
    """
    Classificador para E01-E08 tiers.
    Diferencial: patterns mais específicos por tier.
    """
    if not t: return "unknown"
    t=t.lower()
    # Patterns E01-E04: Classificationes explícitas sim/nao
    if re.search(r'\bvender.*sim|venda.*sim\b', t): return "e01_sale_yes"
    if re.search(r'\balugar.*sim|aluguel.*sim\b', t): return "e02_rent_yes"
    if re.search(r'\bvender.*nao|venda.*nao\b', t): return "e03_sale_no"
    if re.search(r'\balugar.*nao|aluguel.*nao\b', t): return "e04_rent_no"
    # Patterns E05-E07: Patterns mistos e qualificadores
    if re.search(r'vender.*obrigado|venda certa\b', t): return "e05_sale_qualified"
    if re.search(r'alugar.*interessado|aluguel interesse\b', t): return "e06_rent_qualified"
    if re.search(r'vender.*ou.*alugar|ou.*vender.*ou.*alugar', t): return "e07_both_options"
    # E08: Fallback para patterns E09
    if re.search(r'\bvender.*alugar|venda.*aluguel', t): return "e08_leading_to_e09"
    return "unknown"
def main():
    print("="*60)
    print("E01-E08 ANALYSIS - Similar to E09 Pattern")
    print("="*60)
    print("\n1. Extracting messages...")
    ms=q({"select":"*","limit":"10000"})
    n=len(ms) if ms else 0
    print(f"   Total messages fetched: {n}")
    if not ms: print("   No messages found"); return
    # Filter for keywords
    kw_ms=[m for m in ms if (m.get("content") or "").lower().find("vender")>=0 or (m.get("content") or "").lower().find("alugar")>=0]
    print(f"   After keyword filter: {len(kw_ms)}")
    if not kw_ms: print("   No messages with keywords"); return
    # Classify using E01-E08 logic
    rs=[]
    for im in kw_ms:
        tx=im.get("content") or ""
        if not tx.strip(): continue
        rs.append({"text":tx[:120],"code":c_e01_a08(tx)})
    total=len(rs)
    bc={}
    for r in rs: bc[r["code"]]=bc.get(r["code"],0)+1
    print(f"\nTotal classified: {total}")
    print("Distribution by E01-E08:")
    for code,cnt in sorted(bc.items(),key=lambda x:-x[1]): p=(cnt/total*100)if total else 0; print(f"  {code}: {cnt} ({p:.1f}%)")
    # Summary
    codes=list(bc.keys())
    print(f"\nCodes found: {codes}")
    e09_like=[c for c in codes if 'e08' in c or 'sale_and_rent' in c or 'both' in c.lower()]
    print(f"Codes similar to E09 fallback: {e09_like}")
    # Save
    with open("analysis-results-e01-to-e08.json","w",encoding="utf-8") as f: json.dump({"total":total,"byCode":bc,"results":rs},f,ensure_ascii=False,indent=2)
    print(f"\nSaved: analysis-results-e01-to-e08.json")
    print("\n"+"="*60)

if __name__=="__main__": main()