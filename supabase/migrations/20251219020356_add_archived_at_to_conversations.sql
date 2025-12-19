-- Add archived_at column to conversations table for soft archiving functionality
-- This allows users to archive conversations without deleting them

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT NULL;

-- Add index for efficient querying of archived/non-archived conversations
CREATE INDEX IF NOT EXISTS idx_conversations_archived_at 
ON public.conversations(archived_at) 
WHERE archived_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.conversations.archived_at IS 'Timestamp when the conversation was archived. NULL means not archived.';
