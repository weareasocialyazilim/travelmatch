-- Migration: Add feed_delta table for incremental sync
-- Description: Tracks changes to feed items for efficient delta synchronization

-- Create feed_delta table
CREATE TABLE IF NOT EXISTS public.feed_delta (
  version BIGSERIAL PRIMARY KEY,                    -- Auto-incrementing version number
  operation TEXT NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
  item_type TEXT NOT NULL CHECK (item_type IN ('moment', 'match', 'message', 'notification')),
  item_id UUID NOT NULL,                            -- ID of the changed item
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB,                                       -- Full item data (NULL for delete operations)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_feed_delta_version ON public.feed_delta(version);
CREATE INDEX IF NOT EXISTS idx_feed_delta_user_version ON public.feed_delta(user_id, version);
CREATE INDEX IF NOT EXISTS idx_feed_delta_user_created ON public.feed_delta(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_delta_item ON public.feed_delta(item_type, item_id);

-- Enable Row Level Security
ALTER TABLE public.feed_delta ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own delta changes
DROP POLICY IF EXISTS "Users can view their own feed delta" ON public.feed_delta;
CREATE POLICY "Users can view their own feed delta"
  ON public.feed_delta
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert delta records
DROP POLICY IF EXISTS "Service role can insert feed delta" ON public.feed_delta;
CREATE POLICY "Service role can insert feed delta"
  ON public.feed_delta
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE public.feed_delta IS 'Tracks changes to feed items for incremental synchronization';
COMMENT ON COLUMN public.feed_delta.version IS 'Auto-incrementing version number for ordering changes';
COMMENT ON COLUMN public.feed_delta.operation IS 'Type of change: insert, update, or delete';
COMMENT ON COLUMN public.feed_delta.item_type IS 'Type of item: moment, match, message, notification';
COMMENT ON COLUMN public.feed_delta.data IS 'Full item data (NULL for delete operations)';
