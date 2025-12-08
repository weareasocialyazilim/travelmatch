-- AI & ML Services Database Schema
-- Add tables for ML features, analytics, and AI validation

-- ============================================
-- AI Proof Validation
-- ============================================

CREATE TABLE IF NOT EXISTS proof_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  
  -- Validation results
  is_valid BOOLEAN NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Vision API analysis
  clarity_score DECIMAL(3,2),
  is_fake BOOLEAN DEFAULT false,
  is_inappropriate BOOLEAN DEFAULT false,
  
  -- Reasons
  reasons JSONB DEFAULT '[]',
  suggestions JSONB DEFAULT '[]',
  
  -- Metadata
  model_version TEXT DEFAULT 'gpt-4-vision-preview',
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proof_validations_proof_id ON proof_validations(proof_id);
CREATE INDEX idx_proof_validations_is_valid ON proof_validations(is_valid);
CREATE INDEX idx_proof_validations_created_at ON proof_validations(created_at DESC);

-- ============================================
-- ML Recommendations
-- ============================================

CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  
  -- Recommendation scores
  collaborative_score DECIMAL(5,4),
  content_score DECIMAL(5,4),
  final_score DECIMAL(5,4) NOT NULL,
  
  -- Metadata
  algorithm TEXT DEFAULT 'hybrid-collaborative-content',
  diversity_score DECIMAL(3,2),
  novelty_score DECIMAL(3,2),
  reason TEXT,
  
  -- User interaction
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_moment_id ON user_recommendations(moment_id);
CREATE INDEX idx_user_recommendations_final_score ON user_recommendations(final_score DESC);
CREATE INDEX idx_user_recommendations_shown_at ON user_recommendations(shown_at DESC);

-- ============================================
-- User Features (for ML models)
-- ============================================

CREATE TABLE IF NOT EXISTS user_features (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Demographic features
  account_age_days INTEGER,
  kyc_verified BOOLEAN DEFAULT false,
  trust_score DECIMAL(3,2) DEFAULT 0,
  
  -- Engagement features
  total_moments INTEGER DEFAULT 0,
  total_gifts_given INTEGER DEFAULT 0,
  total_gifts_received INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  days_active INTEGER DEFAULT 0,
  
  -- Behavioral features
  preferred_categories JSONB DEFAULT '[]',
  avg_gift_amount DECIMAL(10,2) DEFAULT 0,
  response_rate DECIMAL(3,2) DEFAULT 0,
  completion_rate DECIMAL(3,2) DEFAULT 0,
  
  -- Temporal features
  last_active_at TIMESTAMPTZ,
  peak_activity_hours JSONB DEFAULT '[]', -- [9, 13, 19]
  
  -- Social features
  total_connections INTEGER DEFAULT 0,
  trust_notes_received INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_features_trust_score ON user_features(trust_score DESC);
CREATE INDEX idx_user_features_last_active_at ON user_features(last_active_at DESC);

-- ============================================
-- Moment Features (for recommendations)
-- ============================================

CREATE TABLE IF NOT EXISTS moment_features (
  moment_id UUID PRIMARY KEY REFERENCES moments(id) ON DELETE CASCADE,
  
  -- Basic features
  category TEXT,
  amount DECIMAL(10,2),
  currency TEXT,
  
  -- Performance features
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  gifts INTEGER DEFAULT 0,
  completion_rate DECIMAL(3,2) DEFAULT 0,
  
  -- Content embeddings (for semantic search)
  title_embedding vector(1536), -- OpenAI ada-002 embedding
  description_embedding vector(1536),
  
  -- Temporal features
  created_at TIMESTAMPTZ,
  trending_score DECIMAL(10,4) DEFAULT 0,
  
  -- Social features
  creator_trust_score DECIMAL(3,2),
  receiver_rating DECIMAL(3,2),
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moment_features_category ON moment_features(category);
CREATE INDEX idx_moment_features_trending_score ON moment_features(trending_score DESC);
CREATE INDEX idx_moment_features_created_at ON moment_features(created_at DESC);

-- Enable vector similarity search (requires pgvector extension)
-- CREATE INDEX idx_moment_features_title_embedding ON moment_features 
--   USING ivfflat (title_embedding vector_cosine_ops);

-- ============================================
-- Smart Notifications
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL, -- 'gift_received', 'moment_liked', 'proof_verified', etc.
  channel TEXT NOT NULL, -- 'push', 'email', 'sms'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  
  -- Content
  content JSONB NOT NULL, -- { title, body, data }
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'sent', 'failed', 'clicked'
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);

-- ============================================
-- Analytics Events
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User context
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id UUID,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'page_view', 'moment_view', 'gift_click', etc.
  event_data JSONB DEFAULT '{}',
  
  -- Device & location
  device_type TEXT, -- 'ios', 'android', 'web'
  os_version TEXT,
  app_version TEXT,
  country_code TEXT,
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- Partition by month for better performance
-- ALTER TABLE analytics_events PARTITION BY RANGE (created_at);

-- ============================================
-- User Interactions (for collaborative filtering)
-- ============================================

CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  
  -- Interaction type
  type TEXT NOT NULL, -- 'view', 'like', 'gift', 'share', 'save'
  
  -- Context
  session_id UUID,
  source TEXT, -- 'home_feed', 'search', 'recommendation', 'profile'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_moment_id ON user_interactions(moment_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(type);
CREATE INDEX idx_user_interactions_created_at ON user_interactions(created_at DESC);

-- Composite index for collaborative filtering
CREATE INDEX idx_user_interactions_user_moment ON user_interactions(user_id, moment_id);

-- ============================================
-- Churn Prediction
-- ============================================

CREATE TABLE IF NOT EXISTS churn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Prediction
  churn_probability DECIMAL(3,2) NOT NULL,
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high'
  
  -- Contributing factors
  factors JSONB DEFAULT '[]', -- ['low_engagement', 'no_gifts_received']
  
  -- Model metadata
  model_version TEXT,
  prediction_date DATE DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_churn_predictions_user_id ON churn_predictions(user_id);
CREATE INDEX idx_churn_predictions_risk_level ON churn_predictions(risk_level);
CREATE INDEX idx_churn_predictions_prediction_date ON churn_predictions(prediction_date DESC);

-- ============================================
-- Fraud Detection
-- ============================================

CREATE TABLE IF NOT EXISTS fraud_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Target
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Score
  fraud_score DECIMAL(3,2) NOT NULL CHECK (fraud_score >= 0 AND fraud_score <= 1),
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  
  -- Flags
  flags JSONB DEFAULT '[]', -- ['velocity_check', 'unusual_amount', 'new_device']
  
  -- Action taken
  action TEXT, -- 'allowed', 'manual_review', 'blocked'
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_scores_user_id ON fraud_scores(user_id);
CREATE INDEX idx_fraud_scores_transaction_id ON fraud_scores(transaction_id);
CREATE INDEX idx_fraud_scores_risk_level ON fraud_scores(risk_level);
CREATE INDEX idx_fraud_scores_created_at ON fraud_scores(created_at DESC);

-- ============================================
-- Functions for automatic feature updates
-- ============================================

-- Update user features on new moment
CREATE OR REPLACE FUNCTION update_user_features_on_moment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_features (user_id, total_moments)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_moments = user_features.total_moments + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_features_on_moment
AFTER INSERT ON moments
FOR EACH ROW
EXECUTE FUNCTION update_user_features_on_moment();

-- Update moment features on interaction
CREATE OR REPLACE FUNCTION update_moment_features_on_interaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO moment_features (moment_id, views, likes, gifts)
  VALUES (
    NEW.moment_id,
    CASE WHEN NEW.type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN NEW.type = 'like' THEN 1 ELSE 0 END,
    CASE WHEN NEW.type = 'gift' THEN 1 ELSE 0 END
  )
  ON CONFLICT (moment_id) DO UPDATE
  SET 
    views = moment_features.views + CASE WHEN NEW.type = 'view' THEN 1 ELSE 0 END,
    likes = moment_features.likes + CASE WHEN NEW.type = 'like' THEN 1 ELSE 0 END,
    gifts = moment_features.gifts + CASE WHEN NEW.type = 'gift' THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_moment_features_on_interaction
AFTER INSERT ON user_interactions
FOR EACH ROW
EXECUTE FUNCTION update_moment_features_on_interaction();

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE proof_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_scores ENABLE ROW LEVEL SECURITY;

-- Proof validations: Users can view their own proof validations
CREATE POLICY "Users can view own proof validations"
  ON proof_validations FOR SELECT
  USING (
    proof_id IN (
      SELECT id FROM proofs WHERE user_id = auth.uid()
    )
  );

-- User recommendations: Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
  ON user_recommendations FOR SELECT
  USING (user_id = auth.uid());

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Analytics events: Users can insert their own events
CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- User interactions: Users can insert their own interactions
CREATE POLICY "Users can insert own interactions"
  ON user_interactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Service role can do everything
CREATE POLICY "Service role has full access to all tables"
  ON proof_validations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to recommendations"
  ON user_recommendations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role has full access to notifications"
  ON notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
