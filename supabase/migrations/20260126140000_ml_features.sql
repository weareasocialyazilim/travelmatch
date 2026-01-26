-- Migration: ML Features Storage
-- Created: 2026-01-26
-- Purpose: Store ML model outputs (intent scores, trust scores, health metrics)

-- Intent scores table
CREATE TABLE IF NOT EXISTS user_intent_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  grade VARCHAR(10) NOT NULL CHECK (grade IN ('hot', 'warm', 'cold')),
  factors JSONB NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  insights TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_intent_scores_user_id ON user_intent_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_intent_scores_grade ON user_intent_scores(grade);
CREATE INDEX IF NOT EXISTS idx_user_intent_scores_updated ON user_intent_scores(updated_at DESC);

-- Trust scores table
CREATE TABLE IF NOT EXISTS trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  grade VARCHAR(10) NOT NULL CHECK (grade IN ('excellent', 'good', 'average', 'low', 'risk')),
  components JSONB NOT NULL,
  risk_factors TEXT[],
  trust_level VARCHAR(20) NOT NULL CHECK (trust_level IN ('high', 'medium', 'low', 'flagged')),
  recommendation TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_trust_scores_user_id ON trust_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_scores_level ON trust_scores(trust_level);
CREATE INDEX IF NOT EXISTS idx_trust_scores_updated ON trust_scores(updated_at DESC);

-- Gift outcomes table (for ML training)
CREATE TABLE IF NOT EXISTS gift_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL,
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('reply', 'meetup', 'none')),
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_outcomes_gift_id ON gift_outcomes(gift_id);
CREATE INDEX IF NOT EXISTS idx_gift_outcomes_outcome ON gift_outcomes(outcome);

-- Gift effectiveness stats (aggregated)
CREATE TABLE IF NOT EXISTS gift_effectiveness_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_type_id UUID NOT NULL,
  total_sent INTEGER DEFAULT 0,
  conversation_start_rate NUMERIC DEFAULT 0,
  sustain_rate NUMERIC DEFAULT 0,
  meetup_rate NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gift_type_id)
);

-- Conversation health logs
CREATE TABLE IF NOT EXISTS conversation_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL,
  overall_score INTEGER NOT NULL,
  health_grade VARCHAR(20) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  flags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_health_chat ON conversation_health_logs(chat_id);
CREATE INDEX IF NOT EXISTS idx_conversation_health_risk ON conversation_health_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_conversation_health_analyzed ON conversation_health_logs(analyzed_at DESC);

-- Function to update gift effectiveness stats
CREATE OR REPLACE FUNCTION update_gift_effectiveness_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- This would be called by a cron job or materialization
  RETURN NEW;
END;
$$;

-- Function to calculate daily health metrics
CREATE OR REPLACE FUNCTION calculate_conversation_health_metrics()
RETURNS TABLE (
  avg_score NUMERIC,
  healthy_count BIGINT,
  warning_count BIGINT,
  critical_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(overall_score)::NUMERIC,
    COUNT(*) FILTER (WHERE health_grade = 'healthy')::BIGINT,
    COUNT(*) FILTER (WHERE health_grade = 'warning')::BIGINT,
    COUNT(*) FILTER (WHERE health_grade IN ('concern', 'critical'))::BIGINT
  FROM conversation_health_logs
  WHERE DATE(analyzed_at) = CURRENT_DATE;
END;
$$;
