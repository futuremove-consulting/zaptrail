import {
  TurnWindow,
  ConversationMessage,
  TurnWindowSchema,
} from '../core/types';
import { normalizeMessageText } from '../core/evidence';
import { SeededPropertyCandidate } from './types';

export interface CoalescerMessageInput {
  message_id: string;
  external_message_id?: string;
  tenant_id?: string;
  provider?: string;
  conversation_id?: string;
  direction?: 'inbound' | 'outbound';
  sender_id?: string;
  sender_name?: string;
  raw_text: string;
  normalized_text?: string;
  timestamp?: string | Date | number;
  attachments?: ConversationMessage['attachments'];
}

export type Message = ConversationMessage | CoalescerMessageInput;

export interface CoalesceTurnWindowParams {
  turn_id?: string;
  tenant_id: string;
  provider: string;
  conversation_id: string;
  raw_messages: Array<{
    message_id: string;
    external_message_id: string;
    direction?: 'inbound' | 'outbound';
    sender_id: string;
    sender_name?: string;
    raw_text: string;
    timestamp?: string;
    attachments?: ConversationMessage['attachments'];
  }>;
  prior_outbound_message?: ConversationMessage;
  existing_values?: TurnWindow['existing_values'];
  seeded_context?: Record<string, unknown>;
}

export function parseTimestamp(ts?: string | Date | number): number {
  if (!ts) return Date.now();
  if (typeof ts === 'number') return ts;
  if (ts instanceof Date) return ts.getTime();
  const parsed = Date.parse(ts);
  return isNaN(parsed) ? Date.now() : parsed;
}

export function toConversationMessage(
  m: Message,
  defaults?: { tenant_id?: string; provider?: string; conversation_id?: string }
): ConversationMessage {
  const tsNumber = parseTimestamp(m.timestamp);
  const isoTimestamp =
    typeof m.timestamp === 'string' && !isNaN(Date.parse(m.timestamp))
      ? m.timestamp
      : new Date(tsNumber).toISOString();

  const captionFallback = m.attachments?.find(
    (a) => a.caption && a.caption.trim().length > 0
  )?.caption;
  const effectiveRaw =
    m.raw_text && m.raw_text.trim().length > 0 ? m.raw_text : captionFallback ?? '';

  return {
    message_id: m.message_id,
    external_message_id: m.external_message_id ?? m.message_id,
    tenant_id: m.tenant_id ?? defaults?.tenant_id ?? 'tenant-default',
    provider: m.provider ?? defaults?.provider ?? 'whatsapp',
    conversation_id: m.conversation_id ?? defaults?.conversation_id ?? 'conv-default',
    direction: m.direction ?? 'inbound',
    sender_id: m.sender_id ?? 'user',
    sender_name: m.sender_name,
    raw_text: effectiveRaw,
    normalized_text: m.normalized_text ?? normalizeMessageText(effectiveRaw),
    timestamp: isoTimestamp,
    attachments: m.attachments ?? [],
  };
}

export function partitionMessagesByDebounce<T extends Message>(
  messages: T[],
  debounceSeconds = 120
): T[][] {
  if (messages.length === 0) return [];
  const sorted = [...messages].sort((a, b) => {
    const diff = parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp);
    if (diff !== 0) return diff;
    return (a.message_id || '').localeCompare(b.message_id || '');
  });

  const clusters: T[][] = [];
  let currentCluster: T[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const diffMs = Math.abs(parseTimestamp(curr.timestamp) - parseTimestamp(prev.timestamp));
    if (diffMs <= debounceSeconds * 1000) {
      currentCluster.push(curr);
    } else {
      clusters.push(currentCluster);
      currentCluster = [curr];
    }
  }
  clusters.push(currentCluster);
  return clusters;
}

function buildTurnWindowFromCluster(
  cluster: Message[],
  defaults?: Partial<TurnWindow>
): TurnWindow {
  const convMessages = cluster.map((m) =>
    toConversationMessage(m, {
      tenant_id: defaults?.tenant_id,
      provider: defaults?.provider,
      conversation_id: defaults?.conversation_id,
    })
  );

  const first = convMessages[0];
  const last = convMessages[convMessages.length - 1];
  const consolidated_text = convMessages
    .filter((m) => m.direction === 'inbound')
    .map((m) => m.normalized_text)
    .filter(Boolean)
    .join('\n');

  const turnId = defaults?.turn_id ?? `turn-${first.conversation_id}-${last.message_id}`;

  return TurnWindowSchema.parse({
    turn_id: turnId,
    tenant_id: defaults?.tenant_id ?? first.tenant_id,
    provider: defaults?.provider ?? first.provider,
    conversation_id: defaults?.conversation_id ?? first.conversation_id,
    messages: convMessages,
    prior_outbound_message: defaults?.prior_outbound_message,
    consolidated_text,
    existing_values: defaults?.existing_values,
    seeded_context: defaults?.seeded_context,
  });
}

/**
 * Coalesces consecutive messages into a single TurnWindow if within the debounce window.
 * If messages contain gaps > debounceSeconds, separates them and returns the latest active TurnWindow.
 * Automatically extracts the preceding outbound message as prior_outbound_message if not provided.
 */
export function coalesceTurnWindowWithDebounce(
  messages: Message[],
  debounceSeconds = 120,
  defaults?: Partial<TurnWindow>
): TurnWindow {
  if (!messages || messages.length === 0) {
    throw new Error('coalesceTurnWindowWithDebounce requires at least one message.');
  }

  const sorted = [...messages].sort((a, b) => {
    const diff = parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp);
    if (diff !== 0) return diff;
    return (a.message_id || '').localeCompare(b.message_id || '');
  });

  const clusters = partitionMessagesByDebounce(sorted, debounceSeconds);
  const activeCluster = clusters[clusters.length - 1];

  let priorOutbound = defaults?.prior_outbound_message;
  let inboundMessages = activeCluster;

  if (!priorOutbound) {
    const outboundInCluster = activeCluster.filter((m) => m.direction === 'outbound');
    const inboundInCluster = activeCluster.filter((m) => (m.direction ?? 'inbound') === 'inbound');

    if (outboundInCluster.length > 0 && inboundInCluster.length > 0) {
      priorOutbound = toConversationMessage(outboundInCluster[outboundInCluster.length - 1]);
      inboundMessages = inboundInCluster;
    } else {
      const earlierOutbounds = sorted.filter(
        (m) =>
          m.direction === 'outbound' &&
          parseTimestamp(m.timestamp) < parseTimestamp(activeCluster[0].timestamp)
      );
      if (earlierOutbounds.length > 0) {
        priorOutbound = toConversationMessage(earlierOutbounds[earlierOutbounds.length - 1]);
      }
    }
  }

  return buildTurnWindowFromCluster(inboundMessages, {
    ...defaults,
    prior_outbound_message: priorOutbound,
  });
}

/**
 * Splits messages into multiple TurnWindows based on debounce gaps.
 */
export function coalesceMultipleTurnWindows(
  messages: Message[],
  debounceSeconds = 120,
  defaults?: Partial<TurnWindow>
): TurnWindow[] {
  const clusters = partitionMessagesByDebounce(messages, debounceSeconds);
  return clusters.map((c) => buildTurnWindowFromCluster(c, defaults));
}

/**
 * Legacy TurnWindow coalescer preserved for backward compatibility.
 */
export function coalesceTurnWindow(params: CoalesceTurnWindowParams): TurnWindow {
  const turnId = params.turn_id ?? `turn-${params.conversation_id}-${Date.now()}`;
  const messages: ConversationMessage[] = params.raw_messages.map((m) => ({
    message_id: m.message_id,
    external_message_id: m.external_message_id,
    tenant_id: params.tenant_id,
    provider: params.provider,
    conversation_id: params.conversation_id,
    direction: m.direction ?? 'inbound',
    sender_id: m.sender_id,
    sender_name: m.sender_name,
    raw_text: m.raw_text ?? '',
    normalized_text: normalizeMessageText(m.raw_text ?? ''),
    timestamp: m.timestamp ?? new Date().toISOString(),
    attachments: m.attachments ?? [],
  }));

  const consolidated_text = messages
    .filter((m) => m.direction === 'inbound')
    .map((m) => m.normalized_text)
    .filter(Boolean)
    .join('\n');

  return {
    turn_id: turnId,
    tenant_id: params.tenant_id,
    provider: params.provider,
    conversation_id: params.conversation_id,
    messages,
    prior_outbound_message: params.prior_outbound_message,
    consolidated_text,
    existing_values: params.existing_values,
    seeded_context: params.seeded_context,
  };
}

/**
 * Binds outbound campaign seeded property candidates to a TurnWindow.
 * If the primary seed includes outbound message text, synthesizes prior_outbound_message
 * if one was not already present.
 */
export function bindSeededPropertyCandidates(
  window: TurnWindow,
  seeds: SeededPropertyCandidate[]
): TurnWindow {
  const existingSeeded =
    (window.seeded_context?.seeded_property_candidates as SeededPropertyCandidate[]) || [];
  const mergedSeeds = [...existingSeeded, ...seeds];

  let priorOutbound = window.prior_outbound_message;
  const s0 = seeds[0];
  const outboundText = s0?.outbound_message_text;
  if (!priorOutbound && outboundText) {
    priorOutbound = {
      message_id: `outbound-seed-${s0.campaign_id ?? 'campaign'}`,
      external_message_id: `ext-seed-${s0.campaign_id ?? 'campaign'}`,
      tenant_id: window.tenant_id,
      provider: window.provider,
      conversation_id: window.conversation_id,
      direction: 'outbound',
      sender_id: 'campaign_system',
      sender_name: 'Campanha Outbound',
      raw_text: outboundText,
      normalized_text: normalizeMessageText(outboundText),
      timestamp: s0.outbound_timestamp ?? new Date().toISOString(),
      attachments: [],
    };
  }

  return TurnWindowSchema.parse({
    ...window,
    prior_outbound_message: priorOutbound,
    seeded_context: {
      ...window.seeded_context,
      seeded_property_candidates: mergedSeeds,
    },
  });
}
