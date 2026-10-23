#!/usr/bin/env python3
"""Workflow Router - Maps classification tags to deterministic next actions.

80/20 Lean: 4 max deterministic actions, mapped to 3 tags max, 100% regex-based.
"""

from typing import Optional, Dict, Any

ACTION_SEND_PROPOSAL = "send_proposal"
ACTION_SCHEDULE_VISIT = "schedule_visit"
ACTION_QUALIFY_REVERSE = "qualify_reverse_demand"
ACTION_NO_ACTION = "no_action"

TAG_TO_ACTION: Dict[str, str] = {
    "available_sale": ACTION_SEND_PROPOSAL,
    "rent_property": ACTION_SCHEDULE_VISIT,
    "sale_and_rent": ACTION_QUALIFY_REVERSE,
    "sem-intent": ACTION_NO_ACTION,
}

ACTION_TO_CRM_UPDATE = {
    ACTION_SEND_PROPOSAL: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "send_proposal",
        "tag_add": ["proposal_sent"],
        "tag_remove": ["interested_rent_only"],
    },
    ACTION_SCHEDULE_VISIT: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "schedule_visit",
        "tag_add": ["visit_scheduled"],
        "tag_remove": ["interest_sale_only"],
    },
    ACTION_QUALIFY_REVERSE: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "qualify_reverse",
        "tag_add": ["reverse_qualified", "sale_and_rent_interested"],
        "tag_remove": ["interest_sale_only", "interest_rent_only"],
    },
    ACTION_NO_ACTION: {
        "crud_operation": "update_contact",
        "custom_field": "last_action",
        "custom_value": "none",
        "tag_add": [],
        "tag_remove": [],
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
    }
    return descriptions.get(action, "Ação desconhecida")