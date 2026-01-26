-- ============================================================================
// Story Reports and Block Integration
// ============================================================================

-- Story reports table
CREATE TABLE IF NOT EXISTS story_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (
    reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')
  ),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, reporter_id)
);

-- Index for reports
CREATE INDEX idx_story_reports_story ON story_reports(story_id);
CREATE INDEX idx_story_reports_reporter ON story_reports(reporter_id);
CREATE INDEX idx_story_reports_created ON story_reports(created_at DESC);

-- RLS for story reports
ALTER TABLE story_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports for themselves
CREATE POLICY "Users can create story reports" ON story_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own story reports" ON story_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all story reports" ON story_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Function to handle report and auto-flag story
CREATE OR REPLACE FUNCTION create_story_report(
  p_story_id UUID,
  p_reason VARCHAR(50),
  p_details TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report_id UUID;
  v_report_count INTEGER;
BEGIN
  -- Check if already reported by this user
  IF EXISTS (
    SELECT 1 FROM story_reports
    WHERE story_id = p_story_id AND reporter_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You have already reported this story'
    );
  END IF;

  -- Create report
  INSERT INTO story_reports (story_id, reporter_id, reason, details)
  VALUES (p_story_id, auth.uid(), p_reason, p_details)
  RETURNING id INTO v_report_id;

  -- Check if story should be auto-flagged (3+ reports)
  SELECT COUNT(*) INTO v_report_count
  FROM story_reports
  WHERE story_id = p_story_id;

  IF v_report_count >= 3 THEN
    UPDATE stories
    SET moderation_status = 'flagged'
    WHERE id = p_story_id;

    -- Create admin alert
    INSERT INTO moderation_alerts (
      resource_type, resource_id, alert_type, metadata
    ) VALUES (
      'story', p_story_id, 'auto_flagged',
      jsonb_build_object('reportCount', v_report_count)
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reportId', v_report_id,
    'reportCount', v_report_count
  );
END;
$$;

-- Blocked users cannot view creator stories
CREATE OR REPLACE FUNCTION can_view_story(p_story_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_id UUID;
  v_is_blocked BOOLEAN;
BEGIN
  -- Get story creator
  SELECT user_id INTO v_creator_id FROM stories WHERE id = p_story_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Check if user is blocked by creator
  SELECT EXISTS (
    SELECT 1 FROM blocks
    WHERE blocker_id = v_creator_id AND blocked_id = p_user_id
  ) INTO v_is_blocked;

  IF v_is_blocked THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Update stories view policy to check blocks
CREATE OR REPLACE POLICY "stories_select_active"
  ON stories
  FOR SELECT
  TO authenticated
  USING (
    is_active = TRUE
    AND expires_at > NOW()
    AND moderation_status = 'approved'
    AND can_view_story(id, auth.uid()) = TRUE
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_story_report TO authenticated;
GRANT EXECUTE ON FUNCTION can_view_story TO authenticated;

COMMENT ON TABLE story_reports IS 'User reports for stories with auto-flagging on repeated reports';
COMMENT ON FUNCTION can_view_story IS 'Returns false if user is blocked by story creator';
