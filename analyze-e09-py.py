#!/usr/bin/env python3
import json, sys, os, re, urllib.request, urllib.parse
SUPABASE_URL="https://ipvfualdiesjykocgoqq.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_GZiZqbnB1PgKcB5HEZ68WQ_Lc2p7d-X"  # Service role key bypasses RLS
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
def c(t):
    if not t: return "unknown"
    t=t.lower()
    if re.search(r'vender.*sim.*alugar.*nao|venda.*sim.*aluguel.*nao',t): return "sale_yes_rent_no"
    if re.search(r'alugar.*sim.*vender.*nao|aluguel.*sim.*venda.*nao',t): return "rent_yes_sale_no"
    hv=bool(re.search(r'\bvender|venda|pra vender|vendo\b',t))
    ha=bool(re.search(r'\balugar|aluguel|locacao|loco|pra alugar\b',t))
    if hv and ha: return "sale_and_rent"
    if hv: return "available_sale"
    if ha: return "rent_property"
    return "unknown"
def main():
    print("="*60)
    print("E09 ANALYSIS - Larger Sample")
    print("="*60)
    print("\n1. Extracting messages (larger sample)...")
    ms=q({"select":"*","limit":"10000"})
    n=len(ms) if ms else 0
    print(f"   Total messages fetched: {n}")
    if not ms: print("   No messages found"); return
    # Filter for keywords in Python using 'content' field
    kw_ms=[m for m in ms if (m.get("content") or "").lower().find("vender")>=0 or (m.get("content") or "").lower().find("alugar")>=0]
    print(f"   After content keyword filter: {len(kw_ms)}")
    if not kw_ms: print("   No messages with keywords 'vender' or 'alugar'"); return
    # Classify
    rs=[]
    for im in kw_ms:
        tx=im.get("content") or ""
        if not tx.strip(): continue
        rs.append({"text":tx[:150],"code":c(tx)})
    total=len(rs)
    bc={}
    for r in rs: bc[r["code"]]=bc.get(r["code"],0)+1
    print(f"\nTotal classified: {total}")
    print("Distribution:")
    for code,cnt in sorted(bc.items(),key=lambda x:-x[1]): p=(cnt/total*100)if total else 0; print(f"  {code}: {cnt} ({p:.1f}%)")
    sar=bc.get("sale_and_rent",0);syrn=bc.get("sale_yes_rent_no",0);ryn=bc.get("rent_yes_sale_no",0);u=bc.get("unknown",0)
    print(f"\nsale_and_rent (E09 fallback): {sar} ({(sar/total*100):.1f}%)")
    print(f"sale_yes_rent_no (vender sim, alugar nao): {syrn} ({(syrn/total*100):.1f}%)")
    print(f"rent_yes_sale_no (alugar sim, vender nao): {ryn} ({(ryn/total*100):.1f}%)")
    print(f"unknown: {u} ({(u/total*100):.1f}%)")
    # Top unknown
    uts=[r for r in rs if r["code"]=="unknown"][:15]
    print("\nTop 15 unknown texts:")
    for r in uts: print(f"  '{r['text']}'")
    # Top sale_and_rent
    sats=[r for r in rs if r["code"]=="sale_and_rent"][:20]
    print("\nTop 20 sale_and_rent texts (E09 edge cases):")
    for r in sats: print(f"  '{r['text']}'")
    # Save
    with open("analysis-results-large.json","w",encoding="utf-8") as f: json.dump({"total":total,"byCode":bc,"results":rs},f,ensure_ascii=False,indent=2)
    print("\nSaved: analysis-results-large.json")
    print("\n"+"="*60)

if __name__=="__main__": main()