-- Deep Link Events Table
CREATE TABLE IF NOT EXISTS deep_link_events (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL, -- profile, moment, match, message, etc.
    source TEXT NOT NULL, -- instagram, facebook, twitter, etc.
    url TEXT NOT NULL,
    params JSONB DEFAULT '{}'::jsonb,
    session_id TEXT NOT NULL,
    
    -- UTM parameters
    campaign TEXT,
    medium TEXT,
    term TEXT,
    content TEXT,
    
    -- Navigation tracking
    landing_screen TEXT,
    target_screen TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    drop_off_screen TEXT,
    
    -- Performance metrics
    time_to_land INTEGER, -- milliseconds from click to app open
    time_to_complete INTEGER, -- milliseconds from open to conversion
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_deep_link_events_user_id ON deep_link_events(user_id);
CREATE INDEX IF NOT EXISTS idx_deep_link_events_type ON deep_link_events(type);
CREATE INDEX IF NOT EXISTS idx_deep_link_events_source ON deep_link_events(source);
CREATE INDEX IF NOT EXISTS idx_deep_link_events_campaign ON deep_link_events(campaign);
CREATE INDEX IF NOT EXISTS idx_deep_link_events_session_id ON deep_link_events(session_id);
CREATE INDEX IF NOT EXISTS idx_deep_link_events_created_at ON deep_link_events(created_at DESC);

-- RLS policies
ALTER TABLE deep_link_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own events
CREATE POLICY "Users can read own deep link events"
    ON deep_link_events FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert events (from app)
CREATE POLICY "Service can insert deep link events"
    ON deep_link_events FOR INSERT
    WITH CHECK (true);

-- Users can update their own events
CREATE POLICY "Users can update own deep link events"
    ON deep_link_events FOR UPDATE
    USING (auth.uid() = user_id);

-- Proof Quality Scores Table
CREATE TABLE IF NOT EXISTS proof_quality_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    proof_type TEXT NOT NULL, -- selfie_with_id, passport, drivers_license, national_id
    image_url TEXT NOT NULL,
    score JSONB NOT NULL, -- Full QualityScore object
    approved BOOLEAN DEFAULT FALSE,
    
    -- Manual review
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    review_status TEXT, -- approved, rejected, pending
    review_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proof_quality_scores_user_id ON proof_quality_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_proof_quality_scores_approved ON proof_quality_scores(approved);
CREATE INDEX IF NOT EXISTS idx_proof_quality_scores_review_status ON proof_quality_scores(review_status);
CREATE INDEX IF NOT EXISTS idx_proof_quality_scores_created_at ON proof_quality_scores(created_at DESC);

-- RLS policies
ALTER TABLE proof_quality_scores ENABLE ROW LEVEL SECURITY;

-- Users can read their own scores
CREATE POLICY "Users can read own quality scores"
    ON proof_quality_scores FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert scores (from ML service)
CREATE POLICY "Service can insert quality scores"
    ON proof_quality_scores FOR INSERT
    WITH CHECK (true);

-- Only moderators can update scores (manual review) - DISABLED (user_roles table not implemented)
-- CREATE POLICY "Moderators can update quality scores"
--     ON proof_quality_scores FOR UPDATE
--     USING (
--         EXISTS (
--             SELECT 1 FROM users
--             WHERE id = auth.uid()
--             AND role IN ('moderator', 'admin')
--         )
--     );

-- Analytics Views

-- Deep link conversion funnel
CREATE OR REPLACE VIEW deep_link_conversion_funnel AS
SELECT
    type,
    source,
    campaign,
    COUNT(*) as total_clicks,
    COUNT(CASE WHEN landing_screen IS NOT NULL THEN 1 END) as landed,
    COUNT(CASE WHEN completed THEN 1 END) as converted,
    ROUND(
        100.0 * COUNT(CASE WHEN completed THEN 1 END) / NULLIF(COUNT(*), 0),
        2
    ) as conversion_rate,
    AVG(time_to_land) as avg_time_to_land,
    AVG(time_to_complete) as avg_time_to_complete
FROM deep_link_events
GROUP BY type, source, campaign;

-- Deep link attribution report
CREATE OR REPLACE VIEW deep_link_attribution AS
SELECT
    source,
    campaign,
    medium,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as clicks,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN completed THEN 1 END) as conversions,
    ROUND(
        100.0 * COUNT(CASE WHEN completed THEN 1 END) / NULLIF(COUNT(*), 0),
        2
    ) as conversion_rate
FROM deep_link_events
GROUP BY source, campaign, medium, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Proof quality statistics
CREATE OR REPLACE VIEW proof_quality_stats AS
SELECT
    proof_type,
    COUNT(*) as total_submissions,
    COUNT(CASE WHEN approved THEN 1 END) as auto_approved,
    COUNT(CASE WHEN NOT approved THEN 1 END) as needs_review,
    ROUND(AVG((score->>'overall')::numeric), 2) as avg_score,
    ROUND(
        100.0 * COUNT(CASE WHEN approved THEN 1 END) / NULLIF(COUNT(*), 0),
        2
    ) as auto_approval_rate,
    DATE_TRUNC('day', created_at) as date
FROM proof_quality_scores
GROUP BY proof_type, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_deep_link_events_updated_at
    BEFORE UPDATE ON deep_link_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proof_quality_scores_updated_at
    BEFORE UPDATE ON proof_quality_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE deep_link_events IS 'Tracks deep link clicks and conversions for attribution';
COMMENT ON TABLE proof_quality_scores IS 'AI quality scores for profile verification photos';
COMMENT ON VIEW deep_link_conversion_funnel IS 'Conversion funnel by type, source, and campaign';
COMMENT ON VIEW deep_link_attribution IS 'Attribution report by source and campaign';
COMMENT ON VIEW proof_quality_stats IS 'Quality score statistics by proof type';
