-- ============================================================================
// Stories Moderation Pipeline
// Integrates with existing AWS Rekognition pattern
// ============================================================================

-- Add moderation columns
ALTER TABLE stories ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (
  moderation_status IN ('pending', 'approved', 'rejected', 'flagged')
);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS moderation_score JSONB DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS rekognition_result JSONB DEFAULT '{}';

-- Update default moderation status for new stories
ALTER TABLE stories ALTER COLUMN moderation_status SET DEFAULT 'pending';

-- Index for moderation queries
CREATE INDEX IF NOT EXISTS idx_stories_moderation_status ON stories(moderation_status) WHERE moderation_status IN ('pending', 'flagged');

-- Function to update moderation status
CREATE OR REPLACE FUNCTION update_story_moderation(
  p_story_id UUID,
  p_status VARCHAR(20),
  p_notes TEXT DEFAULT NULL,
  p_score JSONB DEFAULT '{}',
  p_rekognition_result JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE stories
  SET
    moderation_status = p_status,
    moderation_notes = p_notes,
    moderated_at = NOW(),
    moderation_score = p_score,
    rekognition_result = p_rekognition_result
  WHERE id = p_story_id;
END;
$$;

-- Function to automatically approve stories that pass moderation
CREATE OR REPLACE FUNCTION auto_approve_story(p_story_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rekognition JSONB;
  v_labels JSONB;
  v_safe BOOLEAN;
BEGIN
  -- Get rekognition result
  SELECT rekognition_result INTO v_rekognition
  FROM stories WHERE id = p_story_id;

  IF v_rekognition IS NULL THEN
    -- No rekognition result yet
    RETURN;
  END IF;

  -- Check if content is safe (no explicit content detected)
  v_labels := v_rekognition->'Labels';

  -- Simple check: if no labels with explicit content, approve
  v_safe := v_rekognition->'isSafeContent' = 'true'
            OR v_rekognition->'ModerationLabels' = '[]'
            OR NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements(v_rekognition->'ModerationLabels') AS ml
              WHERE (ml->>'Confidence')::FLOAT > 80
            );

  IF v_safe THEN
    UPDATE stories
    SET moderation_status = 'approved', moderated_at = NOW()
    WHERE id = p_story_id;
  ELSE
    UPDATE stories
    SET moderation_status = 'flagged', moderated_at = NOW()
    WHERE id = p_story_id;
  END IF;
END;
$$;

-- Stories are only visible if approved
DROP POLICY IF EXISTS stories_select_active ON stories;
CREATE POLICY "stories_select_active"
  ON stories
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE
    AND expires_at > NOW()
    AND moderation_status = 'approved'
  );

-- View for moderation queue
CREATE OR REPLACE VIEW moderation_queue AS
SELECT
  s.id,
  s.user_id,
  s.image_url,
  s.video_url,
  s.created_at,
  s.expires_at,
  s.moderation_status,
  s.moderation_score,
  s.rekognition_result,
  u.username,
  u.avatar_url
FROM stories s
JOIN users u ON s.user_id = u.id
WHERE s.moderation_status IN ('pending', 'flagged')
ORDER BY s.created_at ASC;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_story_moderation TO authenticated;
GRANT EXECUTE ON FUNCTION auto_approve_story TO service_role;
GRANT SELECT ON moderation_queue TO authenticated;

COMMENT ON COLUMN stories.moderation_status IS 'pending=awaiting review, approved=visible, rejected=hidden, flagged=needs human review';
