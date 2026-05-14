-- ============================================================================
-- 055_reinforce_direct_messages.sql
-- Makes the existing conversations/messages schema usable for real inbox
-- folders and direct-message threads.
-- ============================================================================

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_conversations_metadata_folder
ON public.conversations ((metadata->>'folder'));

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_active
ON public.conversation_participants(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON public.messages(conversation_id, created_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_select_participant" ON public.conversations;
CREATE POLICY "conversations_select_participant" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
        AND cp.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "conversation_participants_select_own_conversations" ON public.conversation_participants;
CREATE POLICY "conversation_participants_select_own_conversations" ON public.conversation_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.conversation_participants own_cp
      WHERE own_cp.conversation_id = conversation_participants.conversation_id
        AND own_cp.user_id = auth.uid()
        AND own_cp.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "message_reads_select_own_conversations" ON public.message_reads;
CREATE POLICY "message_reads_select_own_conversations" ON public.message_reads
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.messages m
      JOIN public.conversation_participants cp
        ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_reads.message_id
        AND cp.user_id = auth.uid()
        AND cp.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "message_reads_insert_own" ON public.message_reads;
CREATE POLICY "message_reads_insert_own" ON public.message_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

INSERT INTO db_version (version, description)
VALUES (55, 'Reinforced direct message conversations, metadata folders, and RLS policies')
ON CONFLICT (version) DO NOTHING;
