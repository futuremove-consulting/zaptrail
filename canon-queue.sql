DO $$
DECLARE t uuid := gen_random_uuid(); m uuid := gen_random_uuid(); c uuid := gen_random_uuid();
  qid uuid; qstatus text; qgen bigint;
BEGIN
  INSERT INTO public.contacts (id) VALUES (c);
  INSERT INTO public.conversation_engine_queue (tenant_id, conversation_id, status, generation, run_after)
  VALUES (t, c, 'pending', 1, now()) RETURNING id INTO qid;
  PERFORM public.enqueue_conversation_engine_job();
  SELECT status, generation INTO qstatus, qgen FROM public.conversation_engine_queue WHERE id = qid;
  RAISE NOTICE 'fila manual: status=% generation=%', qstatus, qgen;
END $$;
