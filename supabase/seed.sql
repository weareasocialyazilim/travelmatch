-- ============================================
-- TRAVELMATCH SEED DATA
-- ============================================
-- Version: 2.1.0
-- Purpose: Comprehensive test data with edge cases
-- Edge Cases: Unicode, Long names, Special characters, Timezones

BEGIN;

-- ============================================
-- 0. CLEANUP: Delete existing test data (in reverse FK order)
-- ============================================
DELETE FROM favorites WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999');
DELETE FROM notifications WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999');
DELETE FROM reviews WHERE reviewer_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999');
DELETE FROM transactions WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999');
DELETE FROM messages WHERE sender_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999');
DELETE FROM conversations WHERE id IN ('convaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'convbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
DELETE FROM requests WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999');
DELETE FROM moments WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999');
DELETE FROM users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999');

-- ============================================
-- 1. TEST USERS (Diverse, Edge Cases)
-- ============================================
INSERT INTO users (id, email, full_name, bio, location, languages, interests, verified, balance, currency, created_at)
VALUES
  -- Regular user
  ('11111111-1111-1111-1111-111111111111', 'alice@travelmatch.test', 'Alice Johnson',
   'Coffee lover ☕ | Istanbul explorer', 'Istanbul, Turkey',
   ARRAY['en', 'tr'], ARRAY['food', 'culture'], true, 100.00, 'TRY', NOW() - INTERVAL '30 days'),

  -- Unicode edge case (Chinese name)
  ('22222222-2222-2222-2222-222222222222', 'wei@travelmatch.test', '王伟 (Wang Wei)',
   '我喜欢旅行 🌏', 'Beijing, China',
   ARRAY['zh', 'en'], ARRAY['adventure', 'nature'], true, 250.50, 'CNY', NOW() - INTERVAL '15 days'),

  -- Long name edge case
  ('33333333-3333-3333-3333-333333333333', 'maria@travelmatch.test',
   'María José García Hernández de la Cruz López',
   'Hola! Passionate about sharing local Spanish culture with travelers.',
   'Barcelona, Spain', ARRAY['es', 'en', 'ca'], ARRAY['food', 'art', 'music'], true, 0.00, 'EUR', NOW() - INTERVAL '60 days'),

  -- Emoji-heavy bio (mobile rendering test)
  ('44444444-4444-4444-4444-444444444444', 'yuki@travelmatch.test', 'ゆき Yuki',
   '🗾 Tokyo Native | 🍱 Foodie | 🎌 Cultural Guide | 🌸 Sakura Season Expert',
   'Tokyo, Japan', ARRAY['ja', 'en'], ARRAY['food', 'culture', 'nature'], false, 0.00, 'JPY', NOW() - INTERVAL '5 days'),

  -- Unverified new user (testing pending states)
  ('55555555-5555-5555-5555-555555555555', 'newuser@travelmatch.test', 'New User',
   NULL, 'New York, USA', ARRAY['en'], ARRAY[]::text[], false, 0.00, 'USD', NOW() - INTERVAL '1 hour'),

  -- Admin user for testing
  ('99999999-9999-9999-9999-999999999999', 'admin@travelmatch.test', 'Admin User',
   'TravelMatch Administrator', 'Remote', ARRAY['en'], ARRAY[]::text[], true, 0.00, 'USD', NOW());

-- ============================================
-- 2. MOMENTS (Various States & Edge Cases)
-- ============================================
INSERT INTO moments (id, user_id, title, description, category, location, date, price, currency, status, images, tags, created_at)
VALUES
  -- Active moment (happy path)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
   'Secret Rooftop Breakfast in Sultanahmet',
   'Join me for authentic Turkish breakfast with a stunning view of Hagia Sophia!',
   'food', 'Sultanahmet, Istanbul', NOW() + INTERVAL '7 days', 45.00, 'TRY', 'active',
   ARRAY['https://example.com/breakfast.jpg'], ARRAY['breakfast', 'rooftop', 'turkish'], NOW() - INTERVAL '2 days'),

  -- Unicode title (testing i18n)
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
   '长城徒步 Great Wall Hiking Adventure',
   '一起探索未修复的长城段落 Explore unrestored sections of the Great Wall',
   'adventure', 'Mutianyu, Beijing', NOW() + INTERVAL '14 days', 80.00, 'CNY', 'active',
   ARRAY['https://example.com/greatwall.jpg'], ARRAY['hiking', 'history', 'adventure'], NOW() - INTERVAL '5 days'),

  -- Completed moment (testing history)
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333',
   'Tapas Tour in Gothic Quarter',
   'Already happened! 5-stop tapas crawl through Barcelona''s oldest neighborhood.',
   'food', 'Gothic Quarter, Barcelona', NOW() - INTERVAL '3 days', 35.00, 'EUR', 'completed',
   ARRAY['https://example.com/tapas.jpg'], ARRAY['food', 'wine', 'culture'], NOW() - INTERVAL '10 days'),

  -- Free moment (price = 0 edge case)
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444',
   'Free Origami Workshop 🎨',
   'Teaching traditional Japanese paper folding for free! Bring your curiosity.',
   'culture', 'Shibuya, Tokyo', NOW() + INTERVAL '3 days', 0.00, 'JPY', 'active',
   ARRAY[]::text[], ARRAY['art', 'culture', 'free'], NOW() - INTERVAL '1 day'),

  -- Expensive moment (high price)
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111',
   'Private Bosphorus Yacht Dinner',
   'Luxury experience: Private yacht, 5-course dinner, live music.',
   'nightlife', 'Bosphorus, Istanbul', NOW() + INTERVAL '21 days', 500.00, 'TRY', 'active',
   ARRAY['https://example.com/yacht.jpg', 'https://example.com/yacht2.jpg'], ARRAY['luxury', 'dinner', 'yacht'], NOW()),

  -- Cancelled moment (testing cancelled state)
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222',
   'Cancelled Temple Visit',
   'This moment was cancelled due to weather.',
   'culture', 'Beijing, China', NOW() + INTERVAL '1 day', 20.00, 'CNY', 'cancelled',
   ARRAY[]::text[], ARRAY['temple', 'culture'], NOW() - INTERVAL '7 days'),

  -- Draft moment (unpublished)
  ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333',
   'Draft Flamenco Show',
   'Not yet published',
   'art', 'Seville, Spain', NOW() + INTERVAL '30 days', 40.00, 'EUR', 'draft',
   ARRAY[]::text[], ARRAY['flamenco', 'dance'], NOW());

-- ============================================
-- 3. REQUESTS (Various States)
-- ============================================
INSERT INTO requests (id, moment_id, user_id, message, status, created_at)
VALUES
  -- Pending request
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrr01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '55555555-5555-5555-5555-555555555555',
   'Hi! I''m visiting Istanbul next week. Would love to join!', 'pending', NOW() - INTERVAL '6 hours'),

  -- Accepted request
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrr02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '11111111-1111-1111-1111-111111111111',
   'I''ve always wanted to visit the Great Wall!', 'accepted', NOW() - INTERVAL '2 days'),

  -- Rejected request
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrr03', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '55555555-5555-5555-5555-555555555555',
   'Sounds amazing!', 'rejected', NOW() - INTERVAL '5 days'),

  -- Completed request
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrr04', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111',
   'Thanks for accepting!', 'completed', NOW() - INTERVAL '3 days'),

  -- Cancelled request
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrr05', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '44444444-4444-4444-4444-444444444444',
   'Sorry, I have to cancel.', 'cancelled', NOW() - INTERVAL '1 day');

-- ============================================
-- 4. CONVERSATIONS (Chat History)
-- ============================================
INSERT INTO conversations (id, participant_ids, moment_id, created_at, updated_at)
VALUES
  ('convaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '55555555-5555-5555-5555-555555555555'::uuid],
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hour'),

  ('convbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   ARRAY['22222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid],
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day');

-- ============================================
-- 5. MESSAGES (Chat Content)
-- ============================================
INSERT INTO messages (id, conversation_id, sender_id, content, type, created_at)
VALUES
  ('msgaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'convaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '55555555-5555-5555-5555-555555555555', 'Hi! Is this breakfast still available?', 'text', NOW() - INTERVAL '6 hours'),

  ('msgaaaab-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'convaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   '11111111-1111-1111-1111-111111111111', 'Yes! I''d be happy to host you.', 'text', NOW() - INTERVAL '5 hours'),

  ('msgbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'convbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   '11111111-1111-1111-1111-111111111111', 'Looking forward to the Great Wall hike!', 'text', NOW() - INTERVAL '2 days');

-- ============================================
-- 6. TRANSACTIONS (Payment History)
-- ============================================
INSERT INTO transactions (id, user_id, moment_id, type, amount, currency, status, description, created_at)
VALUES
  -- Completed gift
  ('tttttttt-tttt-tttt-tttt-tttttttttt01', '11111111-1111-1111-1111-111111111111',
   'cccccccc-cccc-cccc-cccc-cccccccccccc', 'gift', 35.00, 'EUR', 'completed',
   'Gift for Tapas Tour', NOW() - INTERVAL '3 days'),

  -- Pending withdrawal
  ('tttttttt-tttt-tttt-tttt-tttttttttt02', '33333333-3333-3333-3333-333333333333',
   NULL, 'withdrawal', 100.00, 'EUR', 'pending',
   'Withdrawal to bank account', NOW() - INTERVAL '1 day'),

  -- Completed deposit
  ('tttttttt-tttt-tttt-tttt-tttttttttt03', '11111111-1111-1111-1111-111111111111',
   NULL, 'deposit', 100.00, 'TRY', 'completed',
   'Deposit via Stripe', NOW() - INTERVAL '30 days'),

  -- Refunded transaction
  ('tttttttt-tttt-tttt-tttt-tttttttttt04', '55555555-5555-5555-5555-555555555555',
   'ffffffff-ffff-ffff-ffff-ffffffffffff', 'refund', 20.00, 'CNY', 'completed',
   'Refund for cancelled moment', NOW() - INTERVAL '6 days');

-- ============================================
-- 7. REVIEWS (Trust Building)
-- ============================================
INSERT INTO reviews (id, moment_id, reviewer_id, reviewed_id, rating, comment, created_at)
VALUES
  ('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv01', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
   5, 'María was an amazing guide! Best tapas tour ever! 🍷', NOW() - INTERVAL '2 days'),

  ('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvv02', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
   '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   5, 'Alice was a wonderful guest! Very respectful and fun.', NOW() - INTERVAL '2 days');

-- ============================================
-- 8. NOTIFICATIONS (Testing Push)
-- ============================================
INSERT INTO notifications (id, user_id, type, title, body, data, read, created_at)
VALUES
  ('nnnnnnn1-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'new_request', 'New Request!', 'New User requested to join your breakfast moment.',
   '{"momentId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', false, NOW() - INTERVAL '6 hours'),

  ('nnnnnnn2-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555',
   'request_accepted', 'Request Accepted!', 'Alice accepted your request.',
   '{"momentId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true, NOW() - INTERVAL '5 hours');

-- ============================================
-- 9. FAVORITES (Bookmarks)
-- ============================================
INSERT INTO favorites (id, user_id, moment_id, created_at)
VALUES
  ('ffffffff-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555',
   'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW() - INTERVAL '1 day'),

  ('ffffffff-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '3 days');

COMMIT;

-- ============================================
-- 10. HELPER: Verify Seed Data
-- ============================================
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM moments) as total_moments,
  (SELECT COUNT(*) FROM requests) as total_requests,
  (SELECT COUNT(*) FROM conversations) as total_conversations,
  (SELECT COUNT(*) FROM messages) as total_messages,
  (SELECT COUNT(*) FROM transactions) as total_transactions,
  (SELECT COUNT(*) FROM reviews) as total_reviews,
  (SELECT COUNT(*) FROM notifications) as total_notifications,
  (SELECT COUNT(*) FROM favorites) as total_favorites;

-- Expected output:
-- total_users: 6
-- total_moments: 7
-- total_requests: 5
-- total_conversations: 2
-- total_messages: 3
-- total_transactions: 4
-- total_reviews: 2
-- total_notifications: 2
-- total_favorites: 2
