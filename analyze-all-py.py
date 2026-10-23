#!/usr/bin/env python3
import json, sys, os, re, urllib.request, urllib.parse
SUPABASE_URL="https://ipvfualdiesjykocgoqq.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_REPLACE_ME"  # Service role key - replace with actual key for production (removed for GH protection)
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
    if not t: return "unknown"
    t=t.lower()
    if re.search(r'\bvender.*sim|venda.*sim\b', t): return "e01_sale_yes"
    if re.search(r'\balugar.*sim|aluguel.*sim\b', t): return "e02_rent_yes"
    if re.search(r'\bvender.*nao|venda.*nao\b', t): return "e03_sale_no"
    if re.search(r'\balugar.*nao|aluguel.*nao\b', t): return "e04_rent_no"
    if re.search(r'vender.*obrigado|venda certa\b', t): return "e05_sale_qualified"
    if re.search(r'alugar.*interessado|aluguel interesse\b', t): return "e06_rent_qualified"
    if re.search(r'vender.*ou.*alugar|ou.*vender.*ou.*alugar', t): return "e07_both_options"
    if re.search(r'\bvender.*alugar|venda.*aluguel', t): return "e08_leading_to_e09"
    return "unknown"
def main():
    print("="*60)
    print("E09 ANALYSIS - ALL Messages (NO Keyword Filter)")
    print("="*60)
    print("\n1. Extracting ALL messages (no keyword filter)...")
    ms=q({"select":"*","limit":"10000"})
    n=len(ms) if ms else 0
    print(f"   Total messages fetched: {n}")
    if not ms: print("   No messages found"); return
    # NO keyword filter - process ALL messages
    print(f"   Processing ALL {n} messages (NO keyword filter applied)")
    # Classify ALL messages
    rs=[]
    for im in ms:
        tx=im.get("content") or im.get("message_text") or im.get("raw_text") or ""
        # Try multiple field names
        if not tx.strip():
            # Try other common field names
            for field in ["text","body","content","message","raw_text","msg"]:
                if im.get(field): 
                    tx=im.get(field); break
        if not tx.strip(): continue
        rs.append({"text":tx[:200],"e09_code":c_e09(tx),"e01_08_code":c_e01_a08(tx)})
    total=len(rs)
    # E09 Distribution
    e09_bc={}
    e01_08_bc={}
    for r in rs:
        e09_bc[r["e09_code"]]=e09_bc.get(r["e09_code"],0)+1
        e01_08_bc[r["e01_08_code"]]=e01_08_bc.get(r["e01_08_code"],0)+1
    print(f"\n=== E09 CLASSIFICATION (all messages) ===")
    print(f"Total classified: {total}")
    print("Distribution:")
    for code,cnt in sorted(e09_bc.items(),key=lambda x:-x[1]): p=(cnt/total*100)if total else 0; print(f"  {code}: {cnt} ({p:.1f}%)")
    print(f"\n=== E01-E08 CLASSIFICATION (all messages) ===")
    print("Distribution:")
    for code,cnt in sorted(e01_08_bc.items(),key=lambda x:-x[1]): p=(cnt/total*100)if total else 0; print(f"  {code}: {cnt} ({p:.1f}%)")
    # Summary
    e09_sar=e09_bc.get("sale_and_rent",0)
    e09_syrn=e09_bc.get("sale_yes_rent_no",0)
    e09_ryn=e09_bc.get("rent_yes_sale_no",0)
    e09_avail=e09_bc.get("available_sale",0)
    e09_rent=e09_bc.get("rent_property",0)
    e09_unk=e09_bc.get("unknown",0)
    print(f"\n=== SUMMARY ===")
    print(f"E09 sale_and_rent: {e09_sar} ({(e09_sar/total*100):.1f}%)")
    print(f"E09 sale_yes_rent_no: {e09_syrn} ({(e09_syrn/total*100):.1f}%)")
    print(f"E09 rent_yes_sale_no: {e09_ryn} ({(e09_ryn/total*100):.1f}%)")
    print(f"E09 available_sale: {e09_avail} ({(e09_avail/total*100):.1f}%)")
    print(f"E09 rent_property: {e09_rent} ({(e09_rent/total*100):.1f}%)")
    print(f"E09 unknown: {e09_unk} ({(e09_unk/total*100):.1f}%)")
    # Top texts by code
    e09_sar_msgs=[r for r in rs if r["e09_code"]=="sale_and_rent"][:10]
    print(f"\nTop 10 sale_and_rent texts (from ALL messages):")
    for r in e09_sar_msgs: print(f"  '{r['text'][:80]}...' -> {r['e09_code']}")
    # Save
    with open("analysis-results-all-messages.json","w",encoding="utf-8") as f: json.dump({"total":total,"e09_byCode":e09_bc,"e01_08_byCode":e01_08_bc,"results":rs},f,ensure_ascii=False,indent=2)
    print(f"\nSaved: analysis-results-all-messages.json")
    print(f"\nNote: No initial keyword filter - ALL messages processed.")
    print("="*60)

if __name__=="__main__": main()