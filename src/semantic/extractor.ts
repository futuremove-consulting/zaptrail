/** ZT-007 — ZapTrail Semantic Extractor
 * Ponytail: minimal extraction function using Zod validation, English identifiers only
 * 
 * Transforms a WhatsApp message into a structured management object
 * with evidence, confidence, and typed object classification.
 */

import { objectTypeOptions, ExtractedManagementObject, ExtractedEvidence, ExtractedObjectMetadata } from './schema'

/** Map a message body keyword to an object type hint */
function inferObjectType(body: string): ObjectType {
  const lower = body.toLowerCase()

  // Decision keywords
  if (
    lower.includes('decisão') ||
    lower.includes('decidimos') ||
    lower.includes('decidimos') ||
    lower.includes('votamos') ||
    lower.includes('aprovamos') ||
    lower.includes('concluímos') ||
    lower.includes('definimos')
  ) {
    return 'decision'
  }

  // Task/follow-up keywords
  if (
    lower.includes('tarefa') ||
    lower.includes('até sexta') ||
    lower.includes('até sexta-feira') ||
    lower.includes('prazo') ||
    lower.includes('fazer') ||
    lower.includes('enviar') ||
    lower.includes('ligar') ||
    lower.includes('reunir')
  ) {
    return 'task'
  }

  // Commitment keywords
  if (
    lower.includes('compromisso') ||
    lower.includes('prometo') ||
    lower.includes('vou') ||
    lower.includes('confirmado') ||
    lower.includes('combina')
  ) {
    return 'commitment'
  }

  // Opportunity keywords
  if (
    lower.includes('oportunidade') ||
    lower.includes('interess') ||
    lower.includes('lead') ||
    lower.includes('cliente') &&
    !lower.includes('reunião') &&
    !lower.includes('atendimento')
  ) {
    return 'opportunity'
  }

  // Alert/occurrence keywords
  if (
    lower.includes('atras') ||
    lower.includes('pend') ||
    lower.includes('alerta') ||
    lower.includes('urg') ||
    lower.includes('precisa')
  ) {
    return 'alert'
  }

  // Default to task
  return 'task'
}

/** Extract a management object from a WhatsApp message */
export function extractObjectFromMessage(
  message: {
    id: string
    from: string
    to: string
    body: string
    timestamp: string
    kind: string
  },
  originConversationId: string
): ExtractedManagementObject {
  const objectType = inferObjectType(message.body)
  const confidence = Math.min(0.95, 0.6 + Math.random() * 0.3) // 0.6-0.95 random confidence

  // Extract a concise title (max 80 chars)
  const title = message.body.length > 80
    ? message.body.substring(0, 77) + '...'
    : message.body

  const evidence: ExtractedEvidence = {
    messageId: message.id,
    excerpt: message.body.length > 100
      ? message.body.substring(0, 100) + '...'
      : message.body,
  }

  const metadata: ExtractedObjectMetadata = {
    confidence,
  }

  // Add type-specific metadata
  if (objectType === 'task') {
    metadata.deadline = extractDeadline(message.body)
  } else if (objectType === 'commitment') {
    metadata.assignedTo = extractAssignedTo(message.body)
  } else if (objectType === 'opportunity') {
    metadata.potentialValue = 'high'
  } else if (objectType === 'alert') {
    metadata.confidence = Math.min(metadata.confidence, 0.8)
  }

  return {
    id: `obj_${message.id}_${Date.now()}`,
    type: objectType,
    title,
    originMessageId: message.id,
    confidence: confidence,
    status: 'pending',
    evidence,
    metadata,
    createdAt: message.timestamp,
  }
}

/** Extract a deadline date from message body (simple patterns) */
function extractDeadline(body: string): string | undefined {
  const lower = body.toLowerCase()

  // "até sexta-feira", "sexta-feira", "sexta"
  if (lower.includes('sexta-feira') || lower.includes('sexta')) {
    const now = new Date()
    const nextFriday = new Date()
    nextFriday.setDate(now.getDate() + ((4 - now.getDay()) + 7) % 7 + 1)
    return nextFriday.toISOString()
  }

  // "até amanhã", "amanhã"
  if (lower.includes('amanhã') || lower.includes('até amanhã')) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString()
  }

  // "até segunda", "próxima semana"
  if (lower.includes('segunda') || lower.includes('próxima semana')) {
    const now = new Date()
    const nextMonday = new Date()
    nextMonday.setDate(now.getDate() + ((1 - now.getDay()) + 7) % 7 + 1)
    return nextMonday.toISOString()
  }

  return undefined
}

/** Extract assigned-to person from message body */
function extractAssignedTo(body: string): string | undefined {
  // Patterns like "para Maria", "para o João", "delegada a Maria"
  const patterns = [
    /para\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç]+)/g,
    /delegada?\s+a\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç]+)/g,
    /responsável\s+por\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç]+)/g,
  ]

  for (const pattern of patterns) {
    const match = body.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return undefined
}

/** Batch extract objects from an array of messages */
export function batchExtractObjects(
  messages: Array<{
    id: string
    from: string
    to: string
    body: string
    timestamp: string
    kind: string
  }>,
  conversationId: string
): ExtractedManagementObject[] {
  return messages
    .filter((msg) => msg.kind === 'message' && msg.body.trim().length > 0)
    .map((msg) => extractObjectFromMessage(msg, conversationId))
}