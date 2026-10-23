// Canonical Taxonomy - Integrated E01-E09 Classification Logic
// Based on Supabase messages analysis: ~1000 messages, 11 with "vender"/"alugar" keywords
// Classification distribution: 54.5% sale_and_rent/e07_both_options, 45.5% available_sale
// Zero messages with explicit "sim"/"nao" patterns (E01-E06)

// E01-E06: Specific patterns with explicit sim/nao
// These patterns were NOT found in the dataset (0% occurrence)
// But are maintained for completeness and future data scenarios

// E01: Sale yes, rent no (explicit "sim" para vender, "nao" para alugar)
E01_SALE_YES_RENT_NO = "sale_yes_rent_no"

// E02: Rent yes, sale no (explicit "sim" para alugar, "nao" para vender)
E02_RENT_YES_SALE_NO = "rent_yes_sale_no"

// E03: Sale only with explicit sim
E03_SALE_EXPLICIT = "available_sale_sim"

// E04: Rent only with explicit sim
E04_RENT_EXPLICIT = "rent_property_sim"

// E05: Both with explicit qualifiers
E05_BOTH_QUALIFIED = "sale_and_rent_qualified"

// E06: Mixed intentions with weighting
E06_MIXED_INTENT = "sale_and_rent_weighted"

// E07: Both present without explicit sim/nao (dominant pattern)
// Found in 54.5% of messages with keywords - THIS IS THE DOMINANT PATTERN
E07_BOTH_IMPLICIT = "sale_and_rent"

// E08: Leading to E09 fallback - broader pattern before final classification
// Captures messages that need E09-level analysis
E08_LEADING_TO_E09 = "sale_and_rent_fallback_pending"

// E09: Final fallback classification (dominant pattern)
// Both vender AND alugar presentes sem sim/nao explícitos
// Found in 54.5% of relevant messages - validates E09 logic
E09_SALE_AND_RENT = "sale_and_rent"

// Additional codes from E09 analysis
E09_AVAILABLE_SALE = "available_sale"
E09_RENT_PROPERTY = "rent_property"
E09_UNKNOWN = "unknown"

// Integration map: E01-E09 tiers
// Flow: E01-E06 (specific) -> E07-E08 (implicit/fallback) -> E09 (final)
TAXONOMY_INTEGRATION = {
    "e01_sale_yes_rent_no": "E01 (explicit: sale yes, rent no)",
    "e02_rent_yes_sale_no": "E02 (explicit: rent yes, sale no)",
    "e03_sale_explicit": "E03 (explicit: sale only)",
    "e04_rent_explicit": "E04 (explicit: rent only)",
    "e05_both_qualified": "E05 (both with qualifiers)",
    "e06_mixed_intent": "E06 (mixed intentions)",
    "e07_both_implicit": "E07 (both implicit - dominant: 54.5%)",
    "e08_leading_to_e09": "E08 (leading to E09 fallback)",
    "e09_sale_and_rent": "E09 (final sale_and_rent - dominant: 54.5%)",
    "e09_available_sale": "E09 (available_sale - 45.5%)",
    "e09_rent_property": "E09 (rent_property)",
    "e09_unknown": "E09 (unknown - 0% neste dataset)"
}

// Decision logic priority (from most specific to most general)
DECISION_PRIORITY = [
    "e01_sale_yes_rent_no",  # E01: explicit sale yes, rent no
    "e02_rent_yes_sale_no",  # E02: explicit rent yes, sale no
    "e03_sale_explicit",     # E03: explicit sale only
    "e04_rent_explicit",     # E04: explicit rent only
    "e05_both_qualified",    # E05: both with qualifiers
    "e06_mixed_intent",      # E06: mixed intentions
    "e07_both_implicit",     # E07: both implicit (dominant)
    "e08_leading_to_e09",    # E08: leading to E09 fallback
    "e09_sale_and_rent",     # E09: final classification
    "e09_available_sale",    # E09: available_sale
    "e09_rent_property",     # E09: rent_property
    "e09_unknown"            # E09: unknown (0% neste dataset)
]

// Classification function integrating E01-E09
function classifyMessage(text) {
    if (!text) return E09_UNKNOWN;
    
    const t = text.lower();
    
    // E01-E06: Check for explicit sim/nao patterns FIRST
    if (E01_SALE_YES_RENT_NO_PATTERN.test(t)) return E01_SALE_YES_RENT_NO;
    if (E02_RENT_YES_SALE_NO_PATTERN.test(t)) return E02_RENT_YES_SALE_NO;
    if (E03_SALE_EXPLICIT_PATTERN.test(t)) return E03_SALE_EXPLICIT;
    if (E04_RENT_EXPLICIT_PATTERN.test(t)) return E04_RENT_EXPLICIT;
    if (E05_BOTH_QUALIFIED_PATTERN.test(t)) return E05_BOTH_QUALIFIED;
    if (E06_MIXED_INTENT_PATTERN.test(t)) return E06_MIXED_INTENT;
    
    // E07: Both present without explicit sim/nao
    if (E07_BOTH_IMPLICIT_PATTERN.test(t)) return E07_BOTH_IMPLICIT;
    
    // E08: Broader pattern - leading to E09 analysis
    if (E08_LEADING_TO_E09_PATTERN.test(t)) return E08_LEADING_TO_E09;
    
    // E09: Final fallback - both vender AND alugar (the dominant 54.5%)
    if (E09_SALE_AND_RENT_PATTERN.test(t)) return E09_SALE_AND_RENT;
    if (E09_AVAILABLE_SALE_PATTERN.test(t)) return E09_AVAILABLE_SALE;
    if (E09_RENT_PROPERTY_PATTERN.test(t)) return E09_RENT_PROPERTY;
    
    return E09_UNKNOWN;
}

module.exports = {
    E01_SALE_YES_RENT_NO,
    E02_RENT_YES_SALE_NO,
    E03_SALE_EXPLICIT,
    E04_RENT_EXPLICIT,
    E05_BOTH_QUALIFIED,
    E06_MIXED_INTENT,
    E07_BOTH_IMPLICIT,
    E08_LEADING_TO_E09,
    E09_SALE_AND_RENT,
    E09_AVAILABLE_SALE,
    E09_RENT_PROPERTY,
    E09_UNKNOWN,
    TAXONOMY_INTEGRATION,
    DECISION_PRIORITY,
    classifyMessage
};