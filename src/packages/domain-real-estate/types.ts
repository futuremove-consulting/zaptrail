import { z } from 'zod';
import {
  EpistemicStatusSchema,
  EvidenceRefSchema,
} from '../core/types';

export const RealEstatePartyRoleSchema = z.enum([
  'owner',
  'co_owner',
  'spouse_or_partner',
  'family_member',
  'friend_or_acquaintance',
  'representative_or_advisor',
  'broker_or_intermediary',
  'tenant_or_occupant',
  'unrelated_third_party',
  'unknown',
]);
export type RealEstatePartyRole = z.infer<typeof RealEstatePartyRoleSchema>;

export const RealEstateIntentLabelSchema = z.enum([
  'intent.capture_for_sale',
  'intent.capture_for_rent',
  'intent.capture_for_sale_and_rent',
  'intent.not_interested_property',
  'intent.not_interested_general',
  'intent.do_not_contact',
  'intent.capture_other_property',
  'intent.buy_demand',
  'intent.rent_demand',
  'intent.investment_demand',
  'intent.conditional_interest',
  'intent.future_interest',
  'intent.refer_third_party',
  'intent.request_information',
  'intent.provide_information',
  'intent.schedule_or_availability',
  'intent.price_or_condition_update',
  'intent.ambiguous_or_open',
  'intent.noise_or_ack',
]);
export type RealEstateIntentLabel = z.infer<typeof RealEstateIntentLabelSchema>;

export const RealEstateConditionTypeSchema = z.enum([
  'sale_before_purchase',
  'minimum_net_proceeds',
  'tenant_vacating',
  'family_approval',
  'documentation_regularization',
  'reform_or_maintenance',
  'date_or_timeframe',
  'exclusivity_constraint',
  'broker_commission_condition',
  'custom_condition',
]);
export type RealEstateConditionType = z.infer<typeof RealEstateConditionTypeSchema>;

export const RealEstateOpportunityTypeSchema = z.enum([
  'real_estate.capture_sale',
  'real_estate.capture_rent',
  'real_estate.capture_sale_and_rent',
  'real_estate.demand_buy',
  'real_estate.demand_rent',
  'real_estate.demand_investment',
  'real_estate.owner_discovery',
  'real_estate.future_nurture',
]);
export type RealEstateOpportunityType = z.infer<typeof RealEstateOpportunityTypeSchema>;

export const RealEstateActionTypeSchema = z.enum([
  'qualify_property',
  'qualify_owner_role',
  'request_owner_contact',
  'request_property_details',
  'request_media',
  'schedule_visit_or_call',
  'register_future_followup',
  'open_buyer_search',
  'link_conditional_opportunities',
  'human_review',
  'suppress_commercial_followup',
]);
export type RealEstateActionType = z.infer<typeof RealEstateActionTypeSchema>;

export const RealEstatePropertyTypeSchema = z.enum([
  'apartment',
  'house',
  'commercial',
  'land',
  'other',
  'unknown',
]);
export type RealEstatePropertyType = z.infer<typeof RealEstatePropertyTypeSchema>;

export const RealEstateOccupancyStatusSchema = z.enum([
  'owner_occupied',
  'tenant_occupied',
  'vacant',
  'unknown',
]);
export type RealEstateOccupancyStatus = z.infer<typeof RealEstateOccupancyStatusSchema>;

export const RealEstatePropertyCandidateSchema = z.object({
  property_key: z.string(),
  origin_kind: z.enum(['seeded_primary', 'offered_alternative']),
  label: z.string(),
  property_type: RealEstatePropertyTypeSchema,
  occupancy_status: RealEstateOccupancyStatusSchema,
  bedrooms: z.number().int().optional(),
  area_m2: z.number().optional(),
  sale_asking_price: z.number().optional(),
  rent_asking_price: z.number().optional(),
  condo_fee: z.number().optional(),
  iptu_amount: z.number().optional(),
  media_attachment_ids: z.array(z.string()).default([]),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type RealEstatePropertyCandidate = z.infer<typeof RealEstatePropertyCandidateSchema>;

export const RealEstateDemandProfileSchema = z.object({
  demand_key: z.string(),
  demand_kind: z.enum(['buy', 'rent', 'investment']),
  property_types: z.array(RealEstatePropertyTypeSchema),
  bedrooms_min: z.number().int().optional(),
  budget_max: z.number().optional(),
  neighborhood_hint: z.string().optional(),
  linked_condition_ids: z.array(z.string()).default([]),
  epistemic_status: EpistemicStatusSchema,
  confidence: z.number().min(0).max(1),
  evidence_refs: z.array(EvidenceRefSchema).min(1),
});
export type RealEstateDemandProfile = z.infer<typeof RealEstateDemandProfileSchema>;

export const SeededPropertyCandidateSchema = z.object({
  external_property_id: z.string().optional(),
  address_line: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  listing_type: z.enum(['sale', 'rent', 'both']).optional(),
  expected_price: z.number().optional(),
  campaign_id: z.string().optional(),
  outbound_message_text: z.string().optional(),
  outbound_timestamp: z.string().optional(),
});
export type SeededPropertyCandidate = z.infer<typeof SeededPropertyCandidateSchema>;

export const RealEstateDomainEntitiesSchema = z.object({
  property_candidates: z.array(RealEstatePropertyCandidateSchema).default([]),
  demand_profiles: z.array(RealEstateDemandProfileSchema).default([]),
  seeded_candidates: z.array(SeededPropertyCandidateSchema).default([]),
});
export type RealEstateDomainEntities = z.infer<typeof RealEstateDomainEntitiesSchema>;

