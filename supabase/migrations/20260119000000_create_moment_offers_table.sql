-- Migration: Create moment_offers table for Counter Offer feature
-- This table stores counter offers from Premium/Platinum subscribers

-- Create moment_offers table
CREATE TABLE IF NOT EXISTS moment_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Moment reference
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,

  -- User references
  subscriber_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Offer details
  offer_amount DECIMAL(12, 2) NOT NULL CHECK (offer_amount > 0),
  original_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  message TEXT,

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),

  -- Subscription tier that made the offer (for analytics)
  subscription_tier VARCHAR(20) NOT NULL
    CHECK (subscription_tier IN ('premium', 'platinum')),

  -- Response tracking
  responded_at TIMESTAMPTZ,
  response_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

  -- Constraints
  CONSTRAINT different_users CHECK (subscriber_id != host_id),
  CONSTRAINT valid_offer CHECK (offer_amount <= original_amount * 0.8), -- Max 20% discount
  CONSTRAINT single_pending_offer UNIQUE (moment_id, subscriber_id, status)
    WHERE status = 'pending' -- Only one pending offer per user per moment
);

-- Indexes for performance
CREATE INDEX idx_moment_offers_moment ON moment_offers(moment_id);
CREATE INDEX idx_moment_offers_subscriber ON moment_offers(subscriber_id);
CREATE INDEX idx_moment_offers_host ON moment_offers(host_id);
CREATE INDEX idx_moment_offers_status ON moment_offers(status);
CREATE INDEX idx_moment_offers_expires ON moment_offers(expires_at) WHERE status = 'pending';

-- Trigger for updated_at
CREATE TRIGGER update_moment_offers_updated_at
  BEFORE UPDATE ON moment_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE moment_offers ENABLE ROW LEVEL SECURITY;

-- Subscribers can view and create their own offers
CREATE POLICY "subscribers_view_own_offers"
  ON moment_offers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = subscriber_id);

CREATE POLICY "subscribers_create_offers"
  ON moment_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = subscriber_id);

CREATE POLICY "subscribers_cancel_own_offers"
  ON moment_offers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = subscriber_id AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- Hosts can view and respond to offers on their moments
CREATE POLICY "hosts_view_offers"
  ON moment_offers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "hosts_respond_to_offers"
  ON moment_offers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id AND status = 'pending')
  WITH CHECK (status IN ('accepted', 'declined'));

-- Function to auto-expire old offers
CREATE OR REPLACE FUNCTION expire_old_moment_offers()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE moment_offers
  SET
    status = 'expired',
    updated_at = NOW()
  WHERE
    status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Comment for documentation
COMMENT ON TABLE moment_offers IS 'Counter offers from Premium/Platinum subscribers to moment hosts';
COMMENT ON COLUMN moment_offers.offer_amount IS 'The counter offer amount (must be less than original)';
COMMENT ON COLUMN moment_offers.subscription_tier IS 'The subscription level when offer was made';
