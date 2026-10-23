#!/usr/bin/env python3
"""Classify Message - Minimal viable classification for PilotCRM/WhatsApp integration.

80/20 Lean: 3 tags max via regex, 100% deterministic, zero ML/AI.
"""

import re
from typing import Optional, Tuple

# --- Classification Patterns (3 tags maximum) ---

SALE_PATTERN = re.compile(r'\b(vender|venda|vendo)\b', re.IGNORECASE)
RENT_PATTERN = re.compile(r'\b(alugar|aluguel|para alugar)\b', re.IGNORECASE)
BOTH_PATTERN = re.compile(r'\b(ambos|vender e alugar)\b', re.IGNORECASE)


def classify_message(text: str) -> Tuple[Optional[str], list]:
    """Classify message into one of 3 tags: available_sale, rent_property, sale_and_rent, or sem-intent."""
    if not text or not text.strip():
        return ("sem-intent", [])

    t = text.lower().strip()
    matched = []

    # 1. Explicit "ambos" pattern
    if BOTH_PATTERN.search(t):
        matched.append("EXPLICIT_BOTH")
        return ("sale_and_rent", matched)

    # 2. Both sale AND rent keywords present
    has_sale = bool(SALE_PATTERN.search(t))
    has_rent = bool(RENT_PATTERN.search(t))

    if has_sale and has_rent:
        matched.append("IMPLICIT_BOTH")
        return ("sale_and_rent", matched)

    # 3. Only sale
    if has_sale and not has_rent:
        matched.append("SALE_PATTERN")
        return ("available_sale", matched)

    # 4. Only rent
    if has_rent and not has_sale:
        matched.append("RENT_PATTERN")
        return ("rent_property", matched)

    # 5. No property intent
    matched.append("NO_PROPERTY_KEYWORDS")
    return ("sem-intent", matched)


def get_match_details(text: str) -> dict:
    """Get detailed match info for observability."""
    if not text or not text.strip():
        return {"tag": "sem-intent", "matched": [], "raw_text": text or ""}

    t = text.lower().strip()
    has_sale = bool(SALE_PATTERN.search(t))
    has_rent = bool(RENT_PATTERN.search(t))
    both_match = BOTH_PATTERN.search(t)

    if both_match:
        tag = "sale_and_rent"
    elif has_sale and has_rent:
        tag = "sale_and_rent"
    elif has_sale:
        tag = "available_sale"
    elif has_rent:
        tag = "rent_property"
    else:
        tag = "sem-intent"

    matched = []
    if both_match:
        matched.append(f"'{both_match.group()}' explicit Ambos")
    if has_sale:
        sale = SALE_PATTERN.findall(t)
        matched.append(f"Sale: {sale[:3]}")
    if has_rent:
        rent = RENT_PATTERN.findall(t)
        matched.append(f"Rent: {rent[:3]}")

    return {"tag": tag, "matched": matched, "raw_text": text}


if __name__ == "__main__":
    test_cases = [
        ("Quer vender meu apartamento", "available_sale"),
        ("Quero alugar casa em SP", "rent_property"),
        ("Quero vender e alugar ao mesmo tempo", "sale_and_rent"),
        ("Nao tenho interesse em imoveis", "sem-intent"),
        ("Ambos, quero vender e alugar", "sale_and_rent"),
        ("Imovel disponivel para venda", "available_sale"),
        ("Procuro apartamento para alugar", "rent_property"),
        ("", "sem-intent"),
    ]

    print("=" * 60)
    print("CLASSIFICATION TEST SUITE (3 tags max, 100% regex)")
    print("=" * 60)

    all_pass = True
    for text, expected in test_cases:
        tag, matched = classify_message(text)
        status = "PASS" if tag == expected else "FAIL"
        if tag != expected:
            all_pass = False
        print(status + " '" + text[:50] + "' -> Tag:" + tag + " Exp:" + expected)
        if matched:
            print(f"  Matched: {matched}")
        print()

    print("=" * 60)
    if all_pass:
        print("ALL TESTS PASSED")
    else:
        print("SOME TESTS FAILED - review pattern logic")
    print("=" * 60)