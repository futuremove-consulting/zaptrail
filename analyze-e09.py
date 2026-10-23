#!/usr/bin/env python3
import sys, os, json, re, urllib.request, urllib.parse
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "pilotcrm-main/pilotcrm/apps/pilotcrm/src"))

SUPABASE_URL = "https://ipvfualdiesjykocgoqq.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_0oN3zPTXZ5TrFwHlHz5S5g_BAlcKW4N"

def supabase_request(method, endpoint, params=None):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    if params: qs = urllib.parse.urlencode(params); url += "?" + qs if "?" not in url else "&" + qs
    req = urllib.request.Request(url, method=method)
    req.add_header("apikey", SUPABASE_ANON_KEY)
    req.add_header("Authorization", f"Bearer {SUPABASE_ANON_KEY}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"Erro: {e}"); return None

def classify_text(text):
    if not text: return "unknown"
    t = text.lower()
    has_vender = bool(re.search(r"\b(vender|venda|pra vender|vendo)\b", t))
    has_alugar = bool(re.search(r"\b(alugar|aluguel|locacao|loco|pra alugar)\b", t))
    if has_vender and has_alugar:
        has_sim = bool(re.search(r"\bsim\b", t))
        has_nao = bool(re.search(r"\bnao\b", t))
        if has_sim and not has_nao:
            if re.search(r"vender.*sim.*alugar|alugar.*sim.*vender", t): return "sale_and_rent"
            return "sale_and_rent"
        elif not has_sim and has_nao:
            if re.search(r"vender.*nao", t): return "sale_yes_rent_no"
            return "unknown"
        elif has_sim and has_nao:
            if re.search(r"vender.*sim.*alugar", t): return "sale_and_rent"
            if re.search(r"alugar.*sim.*vender", t): return "sale_and_rent"
            return "unknown"
        return "sale_and_rent"
    if has_vender: return "available_sale"
    if has_alugar: return "rent_property"
    return "unknown"

def fetch_messages(limit=2000):
    params = {"or": "message_text.ilike.%vender%,message_text.ilike.%alugar%", "limit": str(limit), "select": "*"}
    return supabase_request("GET", "messages", params) or []

def main():
    print("=" * 60)
    print("ANÁLISE E09 - Vender + Alugar no Supabase")
    print("=" * 60)
    print("\nBuscando mensagens com 'vender' ou 'alugar'...")
    messages = fetch_messages(2000)
    print(f"Extraídas: {len(messages)}")
    if not messages: return
    print("Classificando mensagens...")
    results = []
    for m in messages:
        text = m.get("message_text") or m.get("raw_text") or ""
        if not text.strip(): continue
        code = classify_text(text)
        results.append({"text": text[:80], "code": code})
    total = len(results)
    by_code = {}
    for r in results:
        by_code[r["code"]] = by_code.get(r["code"], 0) + 1
    print(f"\nTotal: {total}")
    print("Distribuição:")
    for code, count in sorted(by_code.items(), key=lambda x: -x[1]):
        pct = (count/total*100) if total else 0
        print(f"  {code}: {count} ({pct:.1f}%)")
    sar = by_code.get("sale_and_rent", 0)
    unk = by_code.get("unknown", 0)
    print(f"\nsale_and_rent: {sar} ({(sar/total*100):.1f}%)")
    print(f"unknown: {unk} ({(unk/total*100):.1f}%)")
    unknown_texts = [r for r in results if r["code"] == "unknown"][:10]
    print("\nTop textos 'unknown':")
    for r in unknown_texts: print(f"  '{r['text']}'")
    sar_texts = [r for r in results if r["code"] == "sale_and_rent"][:10]
    print("\nTop textos 'sale_and_rent':")
    for r in sar_texts: print(f"  '{r['text']}'")
    with open("analysis-results.json", "w", encoding="utf-8") as f:
        json.dump({"total": total, "by_code": by_code, "results": results}, f, ensure_ascii=False, indent=2)
    print("\nSalvo: analysis-results.json")

if __name__ == "__main__": main()