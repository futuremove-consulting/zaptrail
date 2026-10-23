#!/usr/bin/env python3
"""Workflow Router - Maps classification tags to deterministic next actions.

80/20 Lean: 4 max deterministic actions, mapped to 3 tags max, 100% regex-based.
"""

from typing import Optional, Dict, Any

ACTION_SEND_PROPOSAL = "send_proposal"
ACTION_SCHEDULE_VISIT = "schedule_visit"
ACTION_QUALIFY_REVERSE = "qualify_reverse_demand"
ACTION_NO_ACTION = "no_action"
ACTION_SEND_LISTINGS = "send_listings"
ACTION_ADD_SEARCH_CRITERIA = "add_search_criteria"
ACTION_SCHEDULE_VIEWING = "schedule_viewing"


TAG_TO_ACTION: Dict[str, str] = {
    "available_sale": ACTION_SEND_PROPOSAL,
    "available_for_rent": ACTION_SCHEDULE_VISIT,
    "sale_and_rent": ACTION_QUALIFY_REVERSE,
    "sem-intent": ACTION_NO_ACTION,
    # Demand-side actions
    "buying_for_housing": ACTION_SEND_LISTINGS,
    "buying_for_investment": ACTION_ADD_SEARCH_CRITERIA,
    "renting_for_housing": ACTION_SCHEDULE_VIEWING,
    "renting_for_investment": ACTION_ADD_SEARCH_CRITERIA,
}


ACTION_TO_CRM_UPDATE = {
    ACTION_SEND_PROPOSAL: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "send_proposal",
        "tag_add": ["proposal_sent"],
        "tag_remove": ["interested_rent_only"],
        "temporal_update": {
            "urgency_level": "alta",  # Can be overridden based on classification
        },
    },
    ACTION_SCHEDULE_VISIT: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "schedule_visit",
        "tag_add": ["visit_scheduled"],
        "tag_remove": ["interest_sale_only"],
        "temporal_update": {
            "visit_availability": "disponível para visita",
        },
    },
    ACTION_QUALIFY_REVERSE: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "qualify_reverse",
        "tag_add": ["reverse_qualified", "sale_and_rent_interested"],
        "tag_remove": ["interest_sale_only", "interest_rent_only"],
        "temporal_update": {
            "timeframe": "prazo definido na conversa",
        },
    },
    ACTION_NO_ACTION: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "none",
        "tag_add": [],
        "tag_remove": [],
        "temporal_update": {},
    },
    # Demand-side CRM updates
    ACTION_SEND_LISTINGS: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "send_listings",
        "tag_add": ["buyer_interested", "demand_detected"],
        "tag_remove": ["rental_interest_only"],
        "temporal_update": {
            "urgency_level": "urgency_level",  # Will be populated from classification
            "timeframe": "timeframe",  # Will be populated from classification
        },
    },
    ACTION_ADD_SEARCH_CRITERIA: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "add_search_criteria",
        "tag_add": ["search_criteria_saved", "demand_detected"],
        "tag_remove": [" buyer_interested"],
        "temporal_update": {
            "urgency_level": "urgency_level",  # Will be populated from classification
            "lease_term": "lease_term",  # For rental investment contexts
        },
    },
    ACTION_SCHEDULE_VIEWING: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "schedule_viewing",
        "tag_add": ["viewing_scheduled", "demand_detected"],
        "tag_remove": ["interest_sale_only"],
        "temporal_update": {
            "visit_availability": "visit_availability",  # Will be populated from classification
        },
    },
}


def route_action(tag: str) -> Optional[Dict[str, Any]]:
    """Get deterministic next action and CRM update mapping for a classification tag."""
    action_name = TAG_TO_ACTION.get(tag)
    if action_name is None:
        return None
    crud = ACTION_TO_CRM_UPDATE.get(action_name, {})
    return {
        "tag": tag,
        "action": action_name,
        "crud_operation": crud.get("crud_operation", "update_contact"),
        "custom_field": crud.get("custom_field"),
        "custom_value": crud.get("custom_value"),
        "tag_add": crud.get("tag_add", []),
        "tag_remove": crud.get("tag_remove", []),
    }


def get_action_description(tag: str) -> str:
    """Human-readable action description for the given tag."""
    action = route_action(tag)
    if action is None:
        return f"Unknown tag: {tag}"
    descriptions = {
        ACTION_SEND_PROPOSAL: "Enviar proposta de propriedade para venda",
        ACTION_SCHEDULE_VISIT: "Agendar visita de propriedades para aluguel",
        ACTION_QUALIFY_REVERSE: "Qualificar demanda reversa (opções de venda e aluguel)",
        ACTION_NO_ACTION: "Nenhuma ação comercial; recontato posterior",
        ACTION_SEND_LISTINGS: "Enviar alertas de imóveis para compra/aluguel",
        ACTION_ADD_SEARCH_CRITERIA: "Salvar critérios de busca do contato",
        ACTION_SCHEDULE_VIEWING: "Agendar visita de propriedade",
    }
    return descriptions.get(action, "Ação desconhecida")


def apply_temporal_to_crm(classification_result: Dict[str, Any], crm_update: Dict[str, Any]) -> Dict[str, Any]:
    """
    NEW: Apply temporal factors from classification to CRM update.
    
    Takes the classification result (which includes temporal_factors)
    and merges the temporal data into the CRM update dict.
    
    Returns the updated CRM update with temporal fields added.
    """
    temporal_factors = classification_result.get("temporal_factors", {})
    if not temporal_factors:
        return crm_update
    
    temporal_update = crm_update.get("temporal_update", {})
    
    # Map temporal factors from classification to CRM update fields
    mapping = {
        "urgency_level": temporal_factors.get("urgency_level"),
        "timeframe": temporal_factors.get("timeframe"),
        "visit_availability": temporal_factors.get("visit_availability"),
        "lease_term": temporal_factors.get("lease_term"),
        "deadline": temporal_factors.get("deadline"),
    }
    
    # Only add non-None values
    for key, value in mapping.items():
        if value is not None:
            temporal_update[key] = value
    
    # Update the CRM update with the merged temporal data
    result = crm_update.copy()
    result["temporal_update"] = temporal_update
    
    return result