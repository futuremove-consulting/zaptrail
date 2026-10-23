# ZapTrail - Technical Documentation

## Property Classifier - 7-Layer Multi-Modal Classification System

### Overview
ZapTrail's property classifier enables the CRM to identify both sides of a property transaction:
- **Supply detection** (property offering): contacts selling/renting assets
- **Demand detection** (property needs): contacts actively looking to buy/rent

### Version
7.1.0 (7-layer architecture + temporal factors enhancement in 7.1.0)

### Classification Layers

#### Layer 1: Contact Relationship to Property
Identifies the contact's relationship to the property mentioned:
- `proprietario` - Property owner
- `conjuge` - Spouse/partner
- `parente` - Relative
- `amigo` - Friend/acquaintance
- `nao_tem_relacao` - No relationship (wrong number, etc.)
- `indeciso` - Indecisive mention
- `desconhecido` - Unknown

**Patterns**: Brazilian Portuguese regex patterns tuned for WhatsApp messages
**Context**: Recognizes ownership phrases like "sou o proprietario", "minha casa", "de minha propriedade"

#### Layer 2: Property Intent (Supply)
Detects property selling/renting intent (what the contact is offering):
- `available_for_sale` - Contact selling property
- `available_for_rent` - Contact renting property
- `sale_and_rent` - Contact selling AND renting
- `no_intent` - No property intent detected

**Patterns**: Keywords like "vender", "alugar", "venda", "para alugar"
**Combined scenarios**: Supports contacts who both sell AND buy (upsize/downsize)

#### Layer 3: Property Details Extraction
Extracts concrete property details when intent or demand is detected:
- `preco_venda` - Sale price (R$ format)
- `preco_aluguel` - Monthly rent (R$ format)
- `quartos` - Number of bedrooms
- `banheiros` - Number of bathrooms
- `vagas_garagem` - Garage spots
- `cidade` - City (SP, RJ, BH, etc.)
- `disponivel_visita` - Available for visits
- `tempo` - Availability timeframe
- `oferta_ativa` - Active offer status
- `ocupado` - Occupancy status

**Formats**: Values extracted as strings, with numeric fields (quartos, banheiros, vagas) converted to integers

#### Layer 4: Additional Property Interest
Detects if contact has another property of interest:
- `tem_outro` - Mentions another property
- `vender_outro` - Intent to sell another property
- `alugar_outro` - Intent to rent another property

**Returns**: Tuple `(has_other: bool, details: dict)` - whether another property was mentioned and its extracted details

#### Layer 5: Property Demand Detection (Buying/Renting Needs)
**NEW** - Identifies contact's property demand/needs:
- `buying_for_housing` - Purchase for personal residency
- `buying_for_investment` - Purchase for rental income/appreciation
- `renting_for_housing` - Lease for personal residency
- `renting_for_investment` - Lease as investment strategy
- `no_demand` - No specific demand detected
- `no_demand_specific` - Demand mentioned but not specific type

**Patterns**: Optimized for Brazilian Portuguese WhatsApp messages
**Key patterns**:
- `comprar_para_moradia`: "comprar para morar", "aquisição para moradia"
- `comprar_para_investimento`: "comprar para investir", "rentabilidade", "ROI"
- `alugar_para_moradia`: "alugar para morar", "casa própria"
- `alugar_investimento`: "alugar como investimento", "rentabilidade como investimento"
- `busca_imobiliaria`: "procurando imóvel", "estou interessado em comprar"
- `imovel_especifico`: "apartamento para", "casa desde", "terreno com"

#### Layer 6: Comprehensive Classification
Returns structured result with ALL layers combined:
```python
{
    "relationship": "proprietario",        # Layer 1
    "intent": "available_for_sale",        # Layer 2
    "demand": "buying_for_housing",        # Layer 5
    "property_details": {...},              # Layer 3
    "other_property": (False, {}),          # Layer 4
    "raw_text": "Sou o proprietario do apartamento",
    "matched_keywords": ["PROPRIETARIO", "NO_PROPERTY_KEYWORDS"],
    "temporal_factors": {...}               # Layer 7 (NEW)
}
```

### Integration with CRM Workflow

#### classify_property_message() Function
```python
from property_classifier import classify_property_message

result = classify_property_message(whatsapp_message)

# CRM Update Example
crm.update_contact(
    contact_id=contact.id,
    tags=[result["relationship"], result["intent"], result["demand"]],
    property_interests={
        "supply": result["property_details"] if result["intent"] != "no_intent" else {},
        "demand": result["property_details"] if result["demand"] != "no_demand" else {}
    }
)
```

#### Supported CRM Actions
- `send_listings` → For buying/renting alerts (tags: `buying_for_housing`, `renting_for_investment`)
- `add_search_criteria` → Save property preferences (tags: `buying_for_investment`, `renting_for_investment`)
- `schedule_viewing` → Arrange property viewings (tags: `renting_for_housing`, `buying_for_housing`)
- `send_proposal` → Property sale proposals (tag: `available_for_sale`)
- `schedule_visit` → Property viewing for rental (tag: `available_for_rent`)

### Pattern Optimization
All regex patterns are:
- **Portuguese-optimized**: Tuned for Brazilian Portuguese WhatsApp messages
- **100% deterministic**: Rule-based, zero ML/AI
- **80/20 lean**: 80% coverage with 20% of the pattern complexity
- **Edge case aware**: Handles mixed messages like "vendo e quero comprar"

### CLI Test Suite
Run classifier tests:
```bash
python property_classifier.py
```

Test cases cover:
- Relationship detection (owner, spouse, relative, friend, no relation)
- Intent detection (sell, rent, both, none)
- Demand detection (buy for housing, buy for investment, rent for housing, rent for investment)
- Combined supply + demand scenarios
- Property details extraction
- Combined scenario: "Sou proprietario, vendo apartamento e procuro outro para comprar"