-- Achievement Unlock Trigger
-- Automatically unlocks achievements based on user actions
-- 
-- ADR: Database-level achievement tracking ensures consistency
-- and prevents frontend manipulation of achievements

-- ============================================
-- USER ACHIEVEMENTS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(user_id, achievement_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id 
  ON public.user_achievements(user_id);

-- ============================================
-- ACHIEVEMENT DEFINITIONS
-- ============================================
-- These are stored in code, not database, for flexibility
-- Achievement IDs:
-- - first_gift_sent: First gift sent
-- - generous_giver_5: 5 gifts sent
-- - generous_giver_10: 10 gifts sent
-- - proof_master_5: 5 proofs verified
-- - trust_builder: Trust score reached 80+
-- - moment_creator: Created first moment
-- - super_host_50: 50 successful moments hosted

-- ============================================
-- ACHIEVEMENT UNLOCK FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION handle_achievement_unlock()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_gift_count INT;
  v_proof_count INT;
  v_moment_count INT;
BEGIN
  -- Determine which table triggered this
  CASE TG_TABLE_NAME
    -- Gift completed - check gift milestones
    WHEN 'gifts' THEN
      IF NEW.status = 'completed' THEN
        v_user_id := NEW.sender_id;
        
        -- Count completed gifts for this user
        SELECT COUNT(*) INTO v_gift_count
        FROM public.gifts
        WHERE sender_id = v_user_id AND status = 'completed';
        
        -- First gift achievement
        IF v_gift_count = 1 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
          VALUES (v_user_id, 'first_gift_sent', jsonb_build_object('gift_id', NEW.id))
          ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
        
        -- 5 gifts milestone
        IF v_gift_count = 5 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
          VALUES (v_user_id, 'generous_giver_5', jsonb_build_object('total_gifts', 5))
          ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
        
        -- 10 gifts milestone
        IF v_gift_count = 10 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
          VALUES (v_user_id, 'generous_giver_10', jsonb_build_object('total_gifts', 10))
          ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
      END IF;

    -- Proof verified - check proof milestones
    WHEN 'proofs' THEN
      IF NEW.status = 'verified' AND (OLD IS NULL OR OLD.status != 'verified') THEN
        v_user_id := NEW.submitted_by;
        
        -- Count verified proofs for this user
        SELECT COUNT(*) INTO v_proof_count
        FROM public.proofs
        WHERE submitted_by = v_user_id AND status = 'verified';
        
        -- 5 proofs verified milestone
        IF v_proof_count = 5 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
          VALUES (v_user_id, 'proof_master_5', jsonb_build_object('total_proofs', 5))
          ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
      END IF;

    -- Moment created - check moment milestones
    WHEN 'moments' THEN
      IF TG_OP = 'INSERT' THEN
        v_user_id := NEW.host_id;
        
        -- Count moments for this user
        SELECT COUNT(*) INTO v_moment_count
        FROM public.moments
        WHERE host_id = v_user_id;
        
        -- First moment achievement
        IF v_moment_count = 1 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
          VALUES (v_user_id, 'moment_creator', jsonb_build_object('moment_id', NEW.id))
          ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
        
        -- Super host milestone (50 moments)
        IF v_moment_count = 50 THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
          VALUES (v_user_id, 'super_host_50', jsonb_build_object('total_moments', 50))
          ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
      END IF;

    -- Trust score update
    WHEN 'user_trust_scores' THEN
      IF NEW.trust_score >= 80 AND (OLD IS NULL OR OLD.trust_score < 80) THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, metadata)
        VALUES (NEW.user_id, 'trust_builder', jsonb_build_object('trust_score', NEW.trust_score))
        ON CONFLICT (user_id, achievement_id) DO NOTHING;
      END IF;

  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS FOR ACHIEVEMENT TRACKING
-- ============================================

-- Gift completion trigger
DROP TRIGGER IF EXISTS trigger_gift_achievement ON public.gifts;
CREATE TRIGGER trigger_gift_achievement
  AFTER INSERT OR UPDATE OF status ON public.gifts
  FOR EACH ROW
  EXECUTE FUNCTION handle_achievement_unlock();

-- Proof verification trigger
DROP TRIGGER IF EXISTS trigger_proof_achievement ON public.proofs;
CREATE TRIGGER trigger_proof_achievement
  AFTER INSERT OR UPDATE OF status ON public.proofs
  FOR EACH ROW
  EXECUTE FUNCTION handle_achievement_unlock();

-- Moment creation trigger
DROP TRIGGER IF EXISTS trigger_moment_achievement ON public.moments;
CREATE TRIGGER trigger_moment_achievement
  AFTER INSERT ON public.moments
  FOR EACH ROW
  EXECUTE FUNCTION handle_achievement_unlock();

-- Trust score trigger (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_trust_scores') THEN
    DROP TRIGGER IF EXISTS trigger_trust_achievement ON public.user_trust_scores;
    CREATE TRIGGER trigger_trust_achievement
      AFTER INSERT OR UPDATE OF trust_score ON public.user_trust_scores
      FOR EACH ROW
      EXECUTE FUNCTION handle_achievement_unlock();
  END IF;
END $$;

-- ============================================
-- NOTIFICATION ON ACHIEVEMENT UNLOCK
-- ============================================
CREATE OR REPLACE FUNCTION notify_achievement_unlock()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for user
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    data,
    read
  ) VALUES (
    NEW.user_id,
    'achievement_unlocked',
    'Yeni Başarı Kazandın! 🏆',
    'Tebrikler! Bir rozet kazandın.',
    jsonb_build_object(
      'achievement_id', NEW.achievement_id,
      'unlocked_at', NEW.unlocked_at
    ),
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_achievement_notification ON public.user_achievements;
CREATE TRIGGER trigger_achievement_notification
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_unlock();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can read their own achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert/update achievements (via triggers)
CREATE POLICY "System can manage achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (false); -- Prevents direct inserts from users

COMMENT ON TABLE public.user_achievements IS 'Tracks user achievements and badges earned through platform activities';
COMMENT ON FUNCTION handle_achievement_unlock() IS 'Automatically unlocks achievements based on user milestones';
