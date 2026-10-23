DO $$
DECLARE t uuid := gen_random_uuid(); c uuid := gen_random_uuid(); m uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.contacts (id) VALUES (c);
  INSERT INTO public.conversations (id, tenant_id, account_type, session_id, external_chat_id) VALUES (c, t, 'business', 'business', 'chat-1');
  INSERT INTO public.messages (id, tenant_id, session_id, source_provider, external_message_id) VALUES (m, t, 'business', 'baileys', 'ext-1');
  INSERT INTO public.contact_timeline_events (tenant_id, contact_id, conversation_id, message_id, account_type, event_type, event_code, title, idempotency_key, occurred_at)
  VALUES (t, c, c, m, 'business', 'signal', 'SIG_TEST', 'Sinal teste', 'key-1', now());
  BEGIN
    INSERT INTO public.contact_timeline_events (tenant_id, contact_id, conversation_id, message_id, account_type, event_type, event_code, title, idempotency_key, occurred_at)
    VALUES (t, c, c, m, 'business', 'signal', 'SIG_TEST', 'Sinal teste', 'key-1', now());
    RAISE EXCEPTION 'idempotencia da timeline falhou: duplicata aceita';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'timeline idempotente OK';
  END;
  BEGIN
    INSERT INTO public.messages (tenant_id, session_id, source_provider, external_message_id) VALUES (t, 'business', 'baileys', 'ext-1');
    RAISE EXCEPTION 'idempotencia de mensagem falhou: duplicata aceita';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'mensagem idempotente OK';
  END;
  INSERT INTO public.whatsapp_raw_messages (tenant_id, account_type, session_id, processing_status) VALUES (t, 'personal', 'personal', 'pending_contact_policy');
  INSERT INTO public.whatsapp_raw_messages (tenant_id, account_type, session_id, processing_status) VALUES (t, 'personal', 'personal', 'ignored_personal_policy');
  BEGIN
    INSERT INTO public.whatsapp_raw_messages (tenant_id, processing_status) VALUES (t, 'bogus');
    RAISE EXCEPTION 'check de status falhou: status invalido aceito';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'check de status OK';
  END;
  INSERT INTO public.conversation_engine_queue (tenant_id, conversation_id) VALUES (t, c) ON CONFLICT (conversation_id) DO NOTHING;
  PERFORM public.enqueue_conversation_engine_job() FROM (SELECT t AS tenant_id, c AS conversation_id) AS NEW;
  RAISE NOTICE 'trigger de enqueue OK';
END $$;
