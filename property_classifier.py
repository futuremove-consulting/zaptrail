#!/usr/bin/env python3
"""Property Classifier - Multi-layer classification for PilotCRM/WhatsApp integration.

Identifies:
1. Contact relationship to property (owner, spouse, relative, friend, no relation)
2. Property intent (sell, rent, both, none) - SUPPLY
3. Property demand (buy for housing, buy for investment, rent for housing, rent for investment) - DEMAND
4. Property details extraction (price, rooms, city, occupancy, visit availability)
5. Additional property interest detection
6. Complete structured classification

80/20 Lean: Rule-based, deterministic, zero ML/AI. 7 classification layers.
"""

import re
from typing import Optional, Tuple, Dict, List, Any

# ============================================================
# Layer 1: Contact Relationship to Property
# ============================================================

RELATIONSHIP_PATTERNS = {
    "proprietario": re.compile(
        r'\b(sou o |sou a |eu sou |meu |minha )?(propriet|dono|donos|owner|imovei|l|casa|apartamento)\b',
        re.IGNORECASE
    ),
    "conjuge": re.compile(
        r'\b(esposa|marido|marido|esposo|esposa|c9njuge|namorado|namorada)\b',
        re.IGNORECASE
    ),
    "parente": re.compile(
        r'\b(parente|famil|m3e|pai|irma|irma|filho|filha|tio|tia|primo|prima|avo|av3|av4)\b',
        re.IGNORECASE
    ),
    "amigo": re.compile(
        r'\b(amigo|conhe7u|vizinho|conhe7o|conhe7o algu|rapaz|tio do|tio da)\b',
        re.IGNORECASE
    ),
    "nao_tem_relacao": re.compile(
        r'\b(n3o tem |n3o sou |n3o9 |nermero errado|errado |n3o9 meu|n3o pertence)\b',
        re.IGNORECASE
    ),
}

RELATIONSHIP_CONTEXT = {
    "proprietario": ["dono", "minha casa", "meu apartamento", "e meu", "de minha propriedade"],
    "conjuge": ["minha esposa", "meu marido", "minha esposo", "minha esposa", "conjuge"],
    "parente": ["minha mae", "meu pai", "minha irma", "meu irma", "da familia", "parente"],
    "amigo": ["meu amigo", "um amigo", "conheco", "vizinho"],
    "nao_tem_relacao": ["numero errado", "nao e o meu", "nao tem a ver", "erro de digicao"],
}


def detect_relationship(text: str) -> Tuple[Optional[str], List[str]]:
    """Layer 1: Detect contact relationship to property.

    Returns: (relationship_tag, matched_keywords)
    """
    if not text or not text.strip():
        return ("nao_tem_relacao", [])

    t = text.lower().strip()
    matched = []

    if RELATIONSHIP_PATTERNS["nao_tem_relacao"].search(t):
        matched.append("NAO_TEM_RELACAO")
        return ("nao_tem_relacao", matched)

    for tag, pattern in [
        ("conjuge", RELATIONSHIP_PATTERNS["conjuge"]),
        ("parente", RELATIONSHIP_PATTERNS["parente"]),
        ("amigo", RELATIONSHIP_PATTERNS["amigo"]),
        ("proprietario", RELATIONSHIP_PATTERNS["proprietario"]),
    ]:
        if pattern.search(t):
            matched.append(tag.upper())
            return (tag, matched)

    if any(kw in t for kw in ["imovel", "casa", "apartamento", "vender", "alugar"]):
        matched.append("INDECISO")
        return ("indeciso", matched)

    return ("desconhecido", matched)


# ============================================================
# Layer 2: Property Intent (Supply) Classification
# ============================================================

INTENT_PATTERNS = {
    "vender": re.compile(r'\b(vender|venda|vendo|a venda|em venda)\b', re.IGNORECASE),
    "alugar": re.compile(r'\b(alugar|para alugar|aluguel|locacao|irao alugar)\b', re.IGNORECASE),
    "ambos_explicitos": re.compile(r'\b(ambos|vender e alugar|venda e aluguel)\b', re.IGNORECASE),
    "nenhum": re.compile(r'\b(n3o (tenho |quero |interess|vim para)|sem interesse|n3o quero)\b', re.IGNORECASE),
}


def detect_intent(text: str) -> Tuple[str, List[str]]:
    """Layer 2: Detect property selling/renting intent (supply)."""
    if not text or not text.strip():
        return ("no_intent", [])

    t = text.lower().strip()
    matched = []

    if INTENT_PATTERNS["ambos_explicitos"].search(t):
        matched.append("EXPLICIT_BOTH")
        return ("sale_and_rent", matched)

    has_sale = bool(INTENT_PATTERNS["vender"].search(t))
    has_rent = bool(INTENT_PATTERNS["alugar"].search(t))

    if has_sale and has_rent:
        matched.append("IMPLICIT_BOTH")
        return ("sale_and_rent", matched)

    if has_sale and not has_rent:
        matched.append("SELL_INTENT")
        return ("available_for_sale", matched)

    if has_rent and not has_sale:
        matched.append("RENT_INTENT")
        return ("available_for_rent", matched)

    if INTENT_PATTERNS["nenhum"].search(t):
        matched.append("NO_INTENT_KEYWORDS")
        return ("no_intent", matched)

    matched.append("NO_PROPERTY_KEYWORDS")
    return ("no_intent", matched)


# ============================================================
# Layer 3: Property Details Extraction
# ============================================================

PROPERTY_DETAIL_PATTERNS = {
    "preco_venda": re.compile(r'R\$\s*[\d,.]+|\d{1,3}(?:\.\d{3})?(?:,\d{2})?\s*?(?:reais|R\$)?', re.IGNORECASE),
    "preco_aluguel": re.compile(r'R\$\s*[\d,.]+|\d{1,3}(?:\.\d{3})?(?:,\d{2})?\s*?(?:/m6s|mensalidade)', re.IGNORECASE),
    "quartos": re.compile(r'\b(\d+)\s*[Qq]uar(tos?|o|ula)\b', re.IGNORECASE),
    "banheiros": re.compile(r'\b(\d+)\s*[Bb]anheiro', re.IGNORECASE),
    "vagas_garagem": re.compile(r'\b(\d+)\s*[Vv]aga', re.IGNORECASE),
    "cidade": re.compile(r'\b(SP|Rio de Janeiro|Salvador|Belo Horizonte|Porto Alegre|Curitiba|Recife|Fortaleza)\b', re.IGNORECASE),
    "disponivel_visita": re.compile(r'\b(disponivel?\s*para\s*visita|visita|agendar)\b', re.IGNORECASE),
    "tempo": re.compile(r'\b(em\s+(j5|breve|curto|longo)\s*m6s|at6\s+\d+\s*m6s)\b', re.IGNORECASE),
    "oferta_ativa": re.compile(r'\b(anuncio|anun1o|divulgar|publicar|ativo)\b', re.IGNORECASE),
    "ocupado": re.compile(r'\b(ocupado|habitado|inquilino|morador|vazio|desocupado)\b', re.IGNORECASE),
}


def extract_property_details(text: str) -> Dict[str, Any]:
    """Layer 3: Extract property details when intent detected."""
    if not text or not text.strip():
        return {}

    t = text.lower().strip()
    details = {}

    for field, pattern in PROPERTY_DETAIL_PATTERNS.items():
        matches = pattern.findall(t)
        if matches:
            val = matches[0]
            if field in ["quartos", "banheiros", "vagas_garagem"]:
                try:
                    val = int(val) if isinstance(val, str) and val.isdigit() else val
                except:
                    pass
            details[field] = val

    return details


# ============================================================
# Layer 4: Additional Property Interest Detection
# ============================================================

OTHER_PROPERTY_PATTERNS = {
    "tem_outro": re.compile(
        r'\b(tem outro|outro im3vel|outro apartamento|possui outro|tenho outro|mais un)\b',
        re.IGNORECASE
    ),
    "vender_outro": re.compile(
        r'\b(vender6utro|outro6a6vender|vender6mais6um)\b',
        re.IGNORECASE
    ),
    "alugar_outro": re.compile(
        r'\b(alugar6utro|outro6a6alugar|alugar6mais6um)\b',
        re.IGNORECASE
    ),
}


def detect_other_property(text: str) -> Tuple[bool, Dict[str, Any]]:
    """Layer 4: Detect if contact has another property of interest."""
    if not text or not text.strip():
        return (False, {})

    t = text.lower().strip()
    has_other = False
    details = {}

    if OTHER_PROPERTY_PATTERNS["tem_outro"].search(t):
        has_other = True
        details = extract_property_details(text)

    return (has_other, details)


# ============================================================
# Layer 5: Property Demand Detection (Buying/Renting Needs)
# ============================================================

DEMAND_PATTERNS = {
    "comprar_para_moradia": re.compile(
        r'\b(comprar|aquisicao|compra)\s*(para|para moradia|para morar)\b',
        re.IGNORECASE
    ),
    "comprar_para_investimento": re.compile(
        r'\b(comprar|aquisicao|compra)\s*(para investir|investimento|rentabilidade|roi)\b',
        re.IGNORECASE
    ),
    "alugar_para_moradia": re.compile(
        r'\b(alugar|locar)\s*(para|para moradia|para morar|casa pr3pia)\b',
        re.IGNORECASE
    ),
    "alugar_investimento": re.compile(
        r'\b(alugar|locar)\s*(investimento|para investir|rentabilidade|como investimento)\b',
        re.IGNORECASE
    ),
    "busca_imobiliaria": re.compile(
        r'\b(procurando|buscando|procurando im3vel|estou interessad|vim comprar|vim alugar)\b',
        re.IGNORECASE
    ),
    "imovel_especifico": re.compile(
        r'\b(apartamento|casa|terreno|cobertura|studio)\s*(para|com|desde)\b',
        re.IGNORECASE
    ),
}


def detect_demand(text: str) -> Tuple[str, List[str]]:
    """Layer 5: Detect contact's property demand (buying/renting needs)."""
    if not text or not text.strip():
        return ("no_demand", [])

    t = text.lower().strip()
    matched = []

    comp_moradia = DEMAND_PATTERNS["comprar_para_moradia"].search(t)
    comp_invest = DEMAND_PATTERNS["comprar_para_investimento"].search(t)
    alug_moradia = DEMAND_PATTERNS["alugar_para_moradia"].search(t)
    alug_invest = DEMAND_PATTERNS["alugar_investimento"].search(t)
    busca = DEMAND_PATTERNS["busca_imobiliaria"].search(t)
    espec = DEMAND_PATTERNS["imovel_especifico"].search(t)

    if comp_moradia:
        matched.append("BUY_HOUSING_PATTERN")
        return ("buying_for_housing", matched)

    if comp_invest:
        matched.append("BUY_INVESTMENT_PATTERN")
        return ("buying_for_investment", matched)

    if alug_moradia:
        matched.append("RENT_HOUSING_PATTERN")
        return ("renting_for_housing", matched)

    if alug_invest:
        matched.append("RENT_INVESTMENT_PATTERN")
        return ("renting_for_investment", matched)

    if busca:
        matched.append("EXPLICIT_SEARCH_PATTERN")
        if comp_moradia or espec:
            return ("buying_for_housing", matched)
        if comp_invest:
            return ("buying_for_investment", matched)
        if alug_moradia:
            return ("renting_for_housing", matched)
        if alug_invest:
            return ("renting_for_investment", matched)
        return ("no_demand_specific", matched)

    if espec:
        matched.append("PROPERTY_SPECIFIED")
        return ("no_demand_specific", matched)

    matched.append("NO_DEMAND_KEYWORDS")
    return ("no_demand", matched)


# ============================================================
# Layer 6: Comprehensive Classification
# ============================================================

CLASSIFICATION_RESULT = Dict[str, Any]


def classify_property_message(text: str) -> CLASSIFICATION_RESULT:
    """Layer 6: Complete multi-layer classification.

    Returns structured result with ALL layers:
    {
        "relationship": tag,                    # proprietario, conjuge, parente, amigo, nao_tem_relacao,indeciso, desconhecido
        "intent": tag,                          # available_for_sale, available_for_rent, sale_and_rent, no_intent
        "demand": tag,                          # buying_for_housing, buying_for_investment, renting_for_housing, renting_for_investment, no_demand
        "property_details": dict,               # extracted details when intent or demand exists
        "other_property": (bool, dict),         # (has_other, details) if mentions another property
        "raw_text": str,
        "matched_keywords": list,               # all matched patterns across ALL layers
        "ocupado_status": str|None              # ocupado_pelo_proprietario, vazio, or None
    }
    """
    if not text or not text.strip():
        return {
            "relationship": "nao_tem_relacao",
            "intent": "no_intent",
            "demand": "no_demand",
            "property_details": {},
            "other_property": (False, {}),
            "raw_text": text or "",
            "matched_keywords": [],
            "ocupado_status": None,
        }

    t = text.lower().strip()
    all_matched = []

    # Layer 1: Relationship
    relationship, rel_matched = detect_relationship(t)
    all_matched.extend(rel_matched)

    # Layer 2: Intent (Supply - property offering)
    intent, intent_matched = detect_intent(t)
    all_matched.extend(intent_matched)

    # Layer 5: Demand (Buying/Renting needs)
    demand, demand_matched = detect_demand(t)
    all_matched.extend(demand_matched)

    # Layer 3: Property details (when intent OR demand detected)
    property_details = {}
    if intent in ["available_for_sale", "available_for_rent", "sale_and_rent"] or demand in [
        "buying_for_housing",
        "buying_for_investment",
        "renting_for_housing",
        "renting_for_investment",
    ]:
        property_details = extract_property_details(t)

    # Determine occupancy status
    ocupado = property_details.get("ocupado", None)
    if ocupado is None:
        if re.search(r'\b(ocupado|habitado|inquilino|morador)\b', t):
            ocupado = "ocupado_pelo_proprietario"
        elif re.search(r'\b(vazio|desocupado|disponivel)\b', t):
            ocupado = "vazio"

    # Layer 4: Other property interest
    has_other, other_details = detect_other_property(t)
    other_property_result = (has_other, other_details)
    if has_other:
        all_matched.append("OUTRO_IMOVEL")

    result: CLASSIFICATION_RESULT = {
        "relationship": relationship,
        "intent": intent,
        "demand": demand,
        "property_details": property_details,
        "other_property": other_property_result,
        "raw_text": text,
        "matched_keywords": all_matched,
        "ocupado_status": ocupado,
    }

    return result


# ============================================================
# CLI Test Section
# ============================================================

if __name__ == "__main__":
    print("=" * 70)
    print("PROPERTY CLASSIFIER TEST SUITE (7 layers, 100% regex)")
    print("=" * 70)

    # Test cases covering supply (intent) and demand
    test_cases = [
        # (text, expected_relationship, expected_intent, expected_demand)
        ("Sou o proprietario do apartamento", "proprietario", "available_for_sale", "no_demand"),
        ("Minha esposa quer alugar casa", "conjuge", "available_for_rent", "no_demand"),
        ("Meu primo quer vender imovel", "parente", "available_for_sale", "no_demand"),
        ("Sou amigo, vizinho tem imovel", "amigo", "no_intent", "no_demand"),
        ("Nao e o meu numero, erro", "nao_tem_relacao", "no_intent", "no_demand"),
        ("Quero vender e alugar ao mesmo tempo", "indeciso", "sale_and_rent", "no_demand"),
        # DEMAND TEST CASES
        ("Procurando apartamento para comprar para morar", "indeciso", "no_intent", "buying_for_housing"),
        ("Quero comprar apartamento para investir", "no_intent", "buying_for_investment"),
        ("Estou buscando casa para alugar", "no_intent", "renting_for_housing"),
        ("Preciso alugar apartamento como investimento", "no_intent", "renting_for_investment"),
        ("Quero comprar casa propria", "no_intent", "buying_for_housing"),
        # COMBINED SUPPLY + DEMAND
        ("Sou proprietario, vendo apartamento e procuro outro para comprar", "proprietario", "available_for_sale", "buying_for_housing"),
        ("Quero vender meu imovel e comprar outro maior", "no_intent", "sale_and_rent", "buying_for_housing"),
    ]

    all_pass = True
    for text, expected_rel, expected_intent, expected_demand in test_cases:
        result = classify_property_message(text)

        rel_ok = result["relationship"] == expected_rel
        intent_ok = result["intent"] == expected_intent
        demand_ok = result["demand"] == expected_demand
        ok = rel_ok and intent_ok and demand_ok

        if not (rel_ok and intent_ok and demand_ok):
            all_pass = False

        status = "OK" if ok else "FAIL"
        print(f"\n{status}: '{text[:60]}'")
        print(f"  Relationship: {result['relationship']} (expected: {expected_rel}) {'OK' if rel_ok else 'FAIL'}")
        print(f"  Intent (Supply): {result['intent']} (expected: {expected_intent}) {'OK' if intent_ok else 'FAIL'}")
        print(f"  Demand (Needs): {result['demand']} (expected: {expected_demand}) {'OK' if demand_ok else 'FAIL'}")
        print(f"  Matched keywords: {result['matched_keywords']}")
        print(f"  Property details: {result['property_details']}")
        print(f"  Ocupado status: {result['ocupado_status']}")

    print("\n" + "=" * 70)
    if all_pass:
        print("ALL TESTS PASSED")
    else:
        print("SOME TESTS FAILED - review pattern logic")
    print("=" * 70)