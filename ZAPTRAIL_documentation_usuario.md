# ZapTrail - User Guide

## Welcome to ZapTrail Property Classifier

ZapTrail helps your CRM identify both sides of property transactions - who's selling/renting AND who's looking to buy/rent.

### What's New
- **7-layer property classification** (was 5 layers before)
- **Demand detection** - identifies buying/renting needs in addition to supply detection
- **Temporal factors** - detects urgency, timeframe, and deadlines from messages
- **Portuguese-optimized patterns** for Brazilian WhatsApp messages
- **Combined scenario support** - contacts who both sell AND buy

### Quick Start

#### 1. Classify a WhatsApp Message
```python
from property_classifier import classify_property_message

message = "Procurando apartamento para comprar para morar"
result = classify_property_message(message)

print(f"Relationship: {result['relationship']}")
print(f"Intent (Supply): {result['intent']}")
print(f"Demand (Needs): {result['demand']}")
print(f"Property Details: {result['property_details']}")
```

#### 2. Common Message Classifications

| Message | Relationship | Intent | Demand |
|---------|-------------|--------|--------|
| "Sou o proprietario do apartamento" | proprietario | available_for_sale | no_demand |
| "Quero alugar casa em SP" | amigu | available_for_rent | no_demand |
| "Procurando apartamento para comprar" | indeciso | no_intent | buying_for_housing |
| "Vendo apartamento e compro outro" | proprietario | sale_and_rent | buying_for_housing |
| "Nao tenho interesse" | nao_tem_relacao | no_intent | no_demand |

#### 3. CRM Integration
The classifier result can be used to update your CRM:

```python
result = classify_property_message(whatsapp_message)

# Add tags to contact
tags = [result["relationship"], result["intent"], result["demand"]]

# Update property interests
property_interests = {
    "supply": result["property_details"] if result["intent"] != "no_intent" else {},
    "demand": result["property_details"] if result["demand"] != "no_demand" else {}
}

crm.update_contact(
    contact_id=contact.id,
    tags=tags,
    property_interests=property_interests
)
```

### Classification Scenarios

#### Supply Only (Contact Selling/Renting)
- "Vendo meu apartamento" → `available_for_sale`, `no_demand`
- "Alugo casa em SP" → `available_for_rent`, `no_demand`
- "Vendo e alugo ao mesmo tempo" → `sale_and_rent`, `no_demand`

#### Demand Only (Contact Looking to Buy/Rent)
- "Procurando apartamento para comprar" → `no_intent`, `buying_for_housing`
- "Quero alugar apartamento" → `no_intent`, `renting_for_housing`
- "Comprar para investir" → `no_intent`, `buying_for_investment`

#### Combined Supply + Demand (Most Common)
- "Sou proprietario, vendo apartamento e procuro outro para comprar" → `proprietario`, `available_for_sale`, `buying_for_housing`
- "Quero vender meu imovel e comprar outro maior" → `no_intent`, `sale_and_rent`, `buying_for_housing`
- "Minha esposa quer alugar casa e eu vendo" → `conjuge`, `sale_and_rent`, `no_demand`

### Tips & Best Practices

#### Message Quality
- WhatsApp messages with clear intent/keywords classify best
- Mixed messages (sell+buy) are fully supported
- Portuguese abbreviations and informal speech are handled

#### CRM Workflow
- Always check `demand` field alongside `intent` and `relationship`
- Use `property_details` for saving property preferences
- The `other_property` field detects if contact has additional properties of interest

#### Pattern Coverage
Current patterns cover:
- **Relationship**: 5 main tags + indeciso + desconhecido
- **Intent**: 4 main tags (sale, rent, both, none)
- **Demand**: 5 main tags (buy housing, buy investment, rent housing, rent investment, none)
- **Property details**: 10+ extractable fields (price, rooms, city, etc.)

### Version & Support
- **Version**: 7.0.0
- **Maintainer**: PilotCRM Team
- **License**: Internal business use
- **Support**: For pattern issues or integration help, contact the development team

### Need Help?
- Check the technical documentation for pattern details
- Test with `python property_classifier.py` to see test results
- Contact team for custom pattern additions