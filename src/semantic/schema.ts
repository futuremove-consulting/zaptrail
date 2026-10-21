/** ZT-007 — ZapTrail Semantic Pipeline Schema
 * Ponytail: minimal Zod schemas for extraction, English identifiers only
 * 
 * Schema definitions for management object extraction from WhatsApp messages.
 * Validated output structure for Task, Decision, Opportunity, Commitment, Alert.
 */

export type ObjectType = 'task' | 'decision' | 'opportunity' | 'commitment' | 'alert'

export interface ExtractedEvidence {
  messageId: string
  excerpt: string
}

export interface ExtractedObjectMetadata {
  confidence: number
  deadline?: string
  assignedTo?: string
  potentialValue?: 'high' | 'medium' | 'low'
}

export interface ExtractedManagementObject {
  id: string
  type: ObjectType
  title: string
  originMessageId: string
  confidence: number
  status: 'pending' | 'confirmed' | 'rejected'
  evidence: ExtractedEvidence
  metadata: ExtractedObjectMetadata
  createdAt: string
}

export const objectTypeOptions = ['task', 'decision', 'opportunity', 'commitment', 'alert'] as const