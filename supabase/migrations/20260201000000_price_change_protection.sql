-- ============================================
// Price Change Protection
// Prevents moment price changes after gifts exist
// ============================================

-- Create trigger function to prevent price changes
CREATE OR REPLACE FUNCTION prevent_price_change_with_gifts()
RETURNS TRIGGER AS $
DECLARE
  v_gift_count INTEGER;
BEGIN
  -- Only check if price is actually changing
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    -- Count existing non-cancelled/non-refunded gifts
    SELECT COUNT(*) INTO v_gift_count
    FROM gifts
    WHERE moment_id = NEW.id
    AND status NOT IN ('cancelled', 'refunded');

    -- If gifts exist, prevent price change
    IF v_gift_count > 0 THEN
      RAISE EXCEPTION 'PRICE_CHANGE_NOT_ALLOWED_AFTER_GIFTS';
    END IF;

    -- Log the price change for audit
    IF NEW.updated_at IS DISTINCT FROM OLD.updated_at THEN
      INSERT INTO audit_logs (
        admin_id,
        action,
        resource_type,
        resource_id,
        details
      )
      VALUES (
        auth.uid(),
        'moment_price_changed',
        'moment',
        NEW.id,
        jsonb_build_object(
          'old_price', OLD.price,
          'new_price', NEW.price,
          'change_made', NOW()
        )
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trg_prevent_price_change ON moments;
CREATE TRIGGER trg_prevent_price_change
  BEFORE UPDATE ON moments
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price)
  EXECUTE FUNCTION prevent_price_change_with_gifts();

-- ============================================
// Get moment pricing history
-- For audit and transparency
-- ============================================

CREATE OR REPLACE FUNCTION get_moment_price_history(p_moment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $
DECLARE
  v_history JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'moment_id', id,
      'old_price', price,
      'changed_at', updated_at,
      'change_type', 'price_update'
    )
    ORDER BY updated_at DESC
  ), '[]'::jsonb) INTO v_history
  FROM (
    SELECT DISTINCT ON (date_trunc('day', updated_at)) *
    FROM moments
    WHERE id = p_moment_id
    ORDER BY date_trunc('day', updated_at), updated_at DESC
  ) price_history;

  RETURN jsonb_build_object(
    'success', true,
    'moment_id', p_moment_id,
    'price_history', v_history
  );
END;
$;

COMMENT ON FUNCTION prevent_price_change_with_gifts IS 'Prevents moment price changes after gifts exist. Raises exception if change is attempted.';
COMMENT ON FUNCTION get_moment_price_history IS 'Returns price change history for a moment for audit purposes.';
