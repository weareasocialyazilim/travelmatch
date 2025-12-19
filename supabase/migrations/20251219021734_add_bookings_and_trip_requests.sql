-- Migration: Add bookings and trip_requests tables

-- ============================================================================
-- BOOKINGS TABLE
-- Stores confirmed trip bookings
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'refunded')),
    total_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    cancelled_at TIMESTAMPTZ,
    UNIQUE(trip_id, user_id)
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ============================================================================
-- TRIP_REQUESTS TABLE
-- Stores trip join requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS trip_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    responded_by UUID REFERENCES users(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(trip_id, user_id)
);

-- Indexes for trip_requests
CREATE INDEX IF NOT EXISTS idx_trip_requests_trip_id ON trip_requests(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_requests_user_id ON trip_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_requests_status ON trip_requests(status);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_requests ENABLE ROW LEVEL SECURITY;

-- BOOKINGS policies
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Trip owners can view bookings" ON bookings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM trips WHERE trips.id = bookings.trip_id AND trips.user_id = auth.uid())
    );

CREATE POLICY "Users can create bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Trip owners can manage bookings" ON bookings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM trips WHERE trips.id = bookings.trip_id AND trips.user_id = auth.uid())
    );

-- TRIP_REQUESTS policies
CREATE POLICY "Users can view own requests" ON trip_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Trip owners can view requests" ON trip_requests
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_requests.trip_id AND trips.user_id = auth.uid())
    );

CREATE POLICY "Users can create requests" ON trip_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests" ON trip_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Trip owners can respond to requests" ON trip_requests
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_requests.trip_id AND trips.user_id = auth.uid())
    );

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trip_requests_updated_at ON trip_requests;
CREATE TRIGGER update_trip_requests_updated_at
    BEFORE UPDATE ON trip_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
