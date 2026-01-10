-- =============================================================================
-- AI/ML Features Database Schema
--
-- Tables for:
-- - ML analytics and logging
-- - A/B experiments
-- - AI anomaly detection
-- - Recommendation feedback
-- - Chatbot conversations
-- =============================================================================

-- ML Analytics - Track all ML service calls
CREATE TABLE IF NOT EXISTS ml_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    latency_ms INTEGER NOT NULL,
    cached BOOLEAN DEFAULT FALSE,
    status_code INTEGER DEFAULT 200,
    error_message TEXT,
    request_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_ml_analytics_user_id ON ml_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_analytics_endpoint ON ml_analytics(endpoint);
CREATE INDEX IF NOT EXISTS idx_ml_analytics_created_at ON ml_analytics(created_at DESC);

-- AI Anomalies - Track detected anomalies
CREATE TABLE IF NOT EXISTS ai_anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('proof_fraud', 'fraud_pattern', 'gift_trend', 'price_anomaly', 'usage_spike', 'security')),
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    message TEXT NOT NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}',
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

-- Create indexes for anomaly queries
CREATE INDEX IF NOT EXISTS idx_ai_anomalies_type ON ai_anomalies(type);
CREATE INDEX IF NOT EXISTS idx_ai_anomalies_severity ON ai_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_ai_anomalies_resolved ON ai_anomalies(resolved);
CREATE INDEX IF NOT EXISTS idx_ai_anomalies_detected_at ON ai_anomalies(detected_at DESC);

-- A/B Experiments
CREATE TABLE IF NOT EXISTS ab_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'stopped')),
    variants JSONB NOT NULL DEFAULT '[]',
    target_metric TEXT NOT NULL DEFAULT 'conversion',
    min_sample_size INTEGER DEFAULT 1000,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    winner TEXT,
    statistical_significance DECIMAL(5,2),
    metadata JSONB DEFAULT '{}'
);

-- Create index for experiment queries
CREATE INDEX IF NOT EXISTS idx_ab_experiments_status ON ab_experiments(status);
CREATE INDEX IF NOT EXISTS idx_ab_experiments_created_at ON ab_experiments(created_at DESC);

-- A/B Experiment Assignments
CREATE TABLE IF NOT EXISTS ab_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    variant TEXT NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    conversion_value DECIMAL(12,2),
    UNIQUE(experiment_id, user_id)
);

-- Create indexes for assignment queries
CREATE INDEX IF NOT EXISTS idx_ab_assignments_experiment_id ON ab_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_user_id ON ab_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_variant ON ab_assignments(variant);

-- Recommendation Feedback - Track user feedback on recommendations
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('personalized', 'similar', 'trending', 'recipient')),
    action TEXT NOT NULL CHECK (action IN ('view', 'click', 'purchase', 'dismiss', 'save')),
    position INTEGER,
    session_id TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for feedback queries
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_moment_id ON recommendation_feedback(moment_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_created_at ON recommendation_feedback(created_at DESC);

-- Chatbot Conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    state TEXT DEFAULT 'active' CHECK (state IN ('active', 'resolved', 'escalated', 'abandoned')),
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5)
);

-- Create index for conversation queries
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_state ON chatbot_conversations(state);

-- Chatbot Messages
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    intent TEXT,
    confidence DECIMAL(4,3),
    entities JSONB DEFAULT '[]',
    suggestions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for message queries
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON chatbot_messages(created_at DESC);

-- Price Predictions Cache
CREATE TABLE IF NOT EXISTS price_predictions_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    predicted_price DECIMAL(12,2) NOT NULL,
    min_price DECIMAL(12,2) NOT NULL,
    max_price DECIMAL(12,2) NOT NULL,
    confidence DECIMAL(4,3) NOT NULL,
    factors JSONB DEFAULT '[]',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for cache lookup
CREATE INDEX IF NOT EXISTS idx_price_predictions_cache_key ON price_predictions_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_price_predictions_cache_expires ON price_predictions_cache(expires_at);

-- Demand Forecasts
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    location TEXT,
    forecast_date DATE NOT NULL,
    predicted_demand DECIMAL(10,2) NOT NULL,
    actual_demand DECIMAL(10,2),
    confidence DECIMAL(4,3) NOT NULL,
    factors JSONB DEFAULT '[]',
    model_version TEXT DEFAULT 'v1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, location, forecast_date)
);

-- Create indexes for forecast queries
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_category ON demand_forecasts(category);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_date ON demand_forecasts(forecast_date);

-- User Preference Vectors (for recommendations)
CREATE TABLE IF NOT EXISTS user_preference_vectors (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    category_preferences JSONB DEFAULT '{}',
    location_preferences JSONB DEFAULT '{}',
    price_range JSONB DEFAULT '{}',
    feature_preferences JSONB DEFAULT '{}',
    interaction_history JSONB DEFAULT '[]',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Enable Row Level Security
-- =============================================================================

ALTER TABLE ml_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_predictions_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preference_vectors ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS Policies
-- =============================================================================

-- ML Analytics: Service role only
CREATE POLICY "ml_analytics_service_only" ON ml_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- AI Anomalies: Admins can view and resolve
CREATE POLICY "ai_anomalies_admin_select" ON ai_anomalies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email') AND is_active = TRUE)
    );

CREATE POLICY "ai_anomalies_admin_update" ON ai_anomalies
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email') AND is_active = TRUE)
    );

CREATE POLICY "ai_anomalies_service_insert" ON ai_anomalies
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- A/B Experiments: Admins can manage
CREATE POLICY "ab_experiments_admin_all" ON ab_experiments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email') AND is_active = TRUE)
        OR auth.role() = 'service_role'
    );

-- A/B Assignments: Users can view their own, service role can manage all
CREATE POLICY "ab_assignments_user_select" ON ab_assignments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ab_assignments_service_all" ON ab_assignments
    FOR ALL USING (auth.role() = 'service_role');

-- Recommendation Feedback: Users can manage their own
CREATE POLICY "recommendation_feedback_user_all" ON recommendation_feedback
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "recommendation_feedback_service_all" ON recommendation_feedback
    FOR ALL USING (auth.role() = 'service_role');

-- Chatbot Conversations: Users can view their own
CREATE POLICY "chatbot_conversations_user_select" ON chatbot_conversations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "chatbot_conversations_service_all" ON chatbot_conversations
    FOR ALL USING (auth.role() = 'service_role');

-- Chatbot Messages: Users can view their own conversation messages
CREATE POLICY "chatbot_messages_user_select" ON chatbot_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chatbot_conversations
            WHERE id = chatbot_messages.conversation_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "chatbot_messages_service_all" ON chatbot_messages
    FOR ALL USING (auth.role() = 'service_role');

-- Price Predictions Cache: Service role only
CREATE POLICY "price_predictions_cache_service_only" ON price_predictions_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Demand Forecasts: Admins can view, service role can manage
CREATE POLICY "demand_forecasts_admin_select" ON demand_forecasts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email') AND is_active = TRUE)
    );

CREATE POLICY "demand_forecasts_service_all" ON demand_forecasts
    FOR ALL USING (auth.role() = 'service_role');

-- User Preference Vectors: Users can view their own
CREATE POLICY "user_preference_vectors_user_select" ON user_preference_vectors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_preference_vectors_service_all" ON user_preference_vectors
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- Functions
-- =============================================================================

-- Function to clean up old analytics (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ml_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM ml_analytics
    WHERE created_at < NOW() - INTERVAL '30 days';

    DELETE FROM price_predictions_cache
    WHERE expires_at < NOW();
END;
$$;

-- Function to update user preference vectors
CREATE OR REPLACE FUNCTION update_user_preferences(
    p_user_id UUID,
    p_category TEXT,
    p_action TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_prefs JSONB;
    v_category_count INTEGER;
BEGIN
    -- Get current preferences
    SELECT category_preferences INTO v_current_prefs
    FROM user_preference_vectors
    WHERE user_id = p_user_id;

    IF v_current_prefs IS NULL THEN
        v_current_prefs := '{}';
    END IF;

    -- Update category count
    v_category_count := COALESCE((v_current_prefs->>p_category)::INTEGER, 0);

    IF p_action = 'view' THEN
        v_category_count := v_category_count + 1;
    ELSIF p_action = 'purchase' THEN
        v_category_count := v_category_count + 5;
    END IF;

    v_current_prefs := jsonb_set(v_current_prefs, ARRAY[p_category], to_jsonb(v_category_count));

    -- Upsert preferences
    INSERT INTO user_preference_vectors (user_id, category_preferences, last_updated)
    VALUES (p_user_id, v_current_prefs, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        category_preferences = v_current_prefs,
        last_updated = NOW();
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION update_user_preferences TO authenticated;

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE ml_analytics IS 'Tracks all ML service API calls for monitoring and debugging';
COMMENT ON TABLE ai_anomalies IS 'Stores detected anomalies from AI models';
COMMENT ON TABLE ab_experiments IS 'A/B testing experiment definitions';
COMMENT ON TABLE ab_assignments IS 'User assignments to A/B test variants';
COMMENT ON TABLE recommendation_feedback IS 'User feedback on AI recommendations';
COMMENT ON TABLE chatbot_conversations IS 'AI chatbot conversation sessions';
COMMENT ON TABLE chatbot_messages IS 'Individual messages in chatbot conversations';
COMMENT ON TABLE price_predictions_cache IS 'Cached price predictions for performance';
COMMENT ON TABLE demand_forecasts IS 'Demand forecasting predictions and actuals';
COMMENT ON TABLE user_preference_vectors IS 'User preferences for recommendation engine';
