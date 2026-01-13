-- Add missing columns to users table for admin analytics
-- Migration: 20260120000003_add_analytics_columns.sql

-- Add city column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'city'
  ) THEN
    ALTER TABLE users ADD COLUMN city TEXT;
    CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
  END IF;
END $$;

-- Add acquisition_source column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'acquisition_source'
  ) THEN
    ALTER TABLE users ADD COLUMN acquisition_source TEXT DEFAULT 'organic';
    CREATE INDEX IF NOT EXISTS idx_users_acquisition_source ON users(acquisition_source);
  END IF;
END $$;

-- Add trust_score column to users table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'trust_score'
  ) THEN
    ALTER TABLE users ADD COLUMN trust_score DECIMAL(5,2) DEFAULT 100.00;
    CREATE INDEX IF NOT EXISTS idx_users_trust_score ON users(trust_score);
  END IF;
END $$;

-- Update RPC function to handle missing columns gracefully
CREATE OR REPLACE FUNCTION get_admin_analytics_charts(period_days INTEGER DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  start_date := now() - (period_days || ' days')::INTERVAL;
  
  result := jsonb_build_object(
    'dailyActiveUsers', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'date', to_char(d::DATE, 'DD/MM'),
          'dau', COALESCE((
            SELECT COUNT(DISTINCT user_id) 
            FROM user_activity_logs 
            WHERE created_at::DATE = d::DATE
          ), 0),
          'mau', COALESCE((
            SELECT COUNT(DISTINCT user_id) 
            FROM user_activity_logs 
            WHERE created_at >= d::DATE - INTERVAL '30 days' AND created_at < d::DATE + INTERVAL '1 day'
          ), 0)
        ) ORDER BY d
      ), '[]'::JSONB)
      FROM generate_series(start_date::DATE, now()::DATE, '1 day'::INTERVAL) d
    ),
    'revenueData', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'date', to_char(d::DATE, 'DD/MM'),
          'revenue', COALESCE((
            SELECT SUM(amount) FROM transactions WHERE created_at::DATE = d::DATE
          ), 0),
          'transactions', COALESCE((
            SELECT COUNT(*) FROM transactions WHERE created_at::DATE = d::DATE
          ), 0)
        ) ORDER BY d
      ), '[]'::JSONB)
      FROM generate_series(start_date::DATE, now()::DATE, '1 day'::INTERVAL) d
    ),
    'userAcquisition', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'source', COALESCE(acquisition_source, 'organic'),
          'count', cnt
        )
      ), '[]'::JSONB)
      FROM (
        SELECT COALESCE(acquisition_source, 'organic') as acquisition_source, COUNT(*) as cnt
        FROM users
        WHERE created_at >= start_date
        GROUP BY COALESCE(acquisition_source, 'organic')
        ORDER BY cnt DESC
        LIMIT 10
      ) sub
    ),
    'geoDistribution', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'city', city,
          'count', cnt
        )
      ), '[]'::JSONB)
      FROM (
        SELECT COALESCE(city, 'Bilinmiyor') as city, COUNT(*) as cnt
        FROM users
        WHERE created_at >= start_date
        GROUP BY COALESCE(city, 'Bilinmiyor')
        ORDER BY cnt DESC
        LIMIT 10
      ) sub
    )
  );
  
  RETURN result;
END;
$$;
