import { z } from 'zod';
import {
  RealEstatePartyRoleSchema,
  RealEstateIntentLabelSchema,
  RealEstateConditionTypeSchema,
} from '../types';

export const RealEstateLLMDetectedRoleSchema = z.object({
  role: RealEstatePartyRoleSchema,
  confidence: z.number().min(0).max(1),
  exact_quote: z.string(),
});
export type RealEstateLLMDetectedRole = z.infer<typeof RealEstateLLMDetectedRoleSchema>;

export const RealEstateLLMIntentSchema = z.object({
  label: RealEstateIntentLabelSchema,
  confidence: z.number().min(0).max(1),
  exact_quote: z.string(),
});
export type RealEstateLLMIntent = z.infer<typeof RealEstateLLMIntentSchema>;

export const RealEstateLLMPropertySchema = z.object({
  property_index: z.number().int(),
  role: RealEstatePartyRoleSchema.optional(),
  intent: RealEstateIntentLabelSchema.optional(),
  sale_asking_price: z.number().optional(),
  rent_asking_price: z.number().optional(),
  condo_fee: z.number().optional(),
  iptu_amount: z.number().optional(),
  exact_quote: z.string(),
  address_hint: z.string().optional(),
});
export type RealEstateLLMProperty = z.infer<typeof RealEstateLLMPropertySchema>;

export const RealEstateLLMDemandProfileSchema = z.object({
  demand_type: z.enum(['buy', 'rent', 'invest']),
  max_budget: z.number().optional(),
  exact_quote: z.string(),
});
export type RealEstateLLMDemandProfile = z.infer<typeof RealEstateLLMDemandProfileSchema>;

export const RealEstateLLMConditionSchema = z.object({
  condition_type: RealEstateConditionTypeSchema,
  description: z.string(),
  exact_quote: z.string(),
});
export type RealEstateLLMCondition = z.infer<typeof RealEstateLLMConditionSchema>;

export const RealEstateLLMStructuredOutputSchema = z.object({
  detected_role: RealEstateLLMDetectedRoleSchema,
  intents: z.array(RealEstateLLMIntentSchema).default([]),
  properties: z.array(RealEstateLLMPropertySchema).default([]),
  demand_profile: RealEstateLLMDemandProfileSchema.optional(),
  conditions: z.array(RealEstateLLMConditionSchema).default([]),
  summary: z.string(),
});
export type RealEstateLLMStructuredOutput = z.infer<typeof RealEstateLLMStructuredOutputSchema>;
