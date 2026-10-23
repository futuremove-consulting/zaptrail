SELECT to_regclass('public.contact_timeline_events') AS timeline_tbl,
  to_regclass('public.conversations_canonical_chat_key') AS conv_key,
  to_regclass('public.messages_canonical_external_key') AS msg_key,
  to_regclass('public.enrichment_proposals_idempotency_key') AS enrich_key;
SELECT conname FROM pg_constraint WHERE conname IN ('conversations_account_type_check','messages_account_type_check','whatsapp_raw_messages_processing_status_check','contact_timeline_events_unique_key') ORDER BY 1;
SELECT proname FROM pg_proc WHERE proname = 'enqueue_conversation_engine_job';
