-- TravelMatch Seed Data
-- Version: 1.0.0
-- Description: Sample data for development and testing
-- WARNING: Only run this in development environment!

-- Note: This seed file is for local development only.
-- It creates sample data that can be used for testing.

-- Sample categories (for reference)
-- Categories: food, culture, adventure, nightlife, sports, nature, art, music, shopping, wellness

-- To use this seed file, run:
-- supabase db reset (this will run migrations and seed)
-- OR
-- psql -f supabase/seed.sql

-- Sample users will be created via Supabase Auth
-- After creating auth users, you can insert profile data here

-- Example:
/*
INSERT INTO users (id, email, full_name, bio, location, languages, interests, verified)
VALUES 
  ('user-uuid-1', 'traveler@example.com', 'Test Traveler', 'Love exploring new places!', 'Istanbul', ARRAY['en', 'tr'], ARRAY['food', 'culture', 'adventure'], true),
  ('user-uuid-2', 'guide@example.com', 'Local Guide', 'Sharing the best local experiences', 'Istanbul', ARRAY['tr', 'en', 'de'], ARRAY['culture', 'food', 'history'], true);

INSERT INTO moments (user_id, title, description, category, location, date, price, max_participants, status)
VALUES
  ('user-uuid-2', 'Hidden Gems of Istanbul', 'Discover secret spots that only locals know', 'culture', 'Istanbul', NOW() + INTERVAL '7 days', 50.00, 4, 'active'),
  ('user-uuid-2', 'Traditional Turkish Breakfast', 'Enjoy authentic Turkish breakfast at a local spot', 'food', 'Istanbul', NOW() + INTERVAL '3 days', 25.00, 6, 'active');
*/

-- Placeholder for actual seed data
SELECT 'Seed file ready. Uncomment sections as needed.' AS message;
