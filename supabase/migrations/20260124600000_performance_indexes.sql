-- Migration: Performance Indexes
-- Description: Add indexes for frequently queried columns to improve performance at scale.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users USING GIN (full_name gin_trgm_ops); -- Fuzzy search optimization

-- Moments indexes
CREATE INDEX IF NOT EXISTS idx_moments_user_id ON public.moments(user_id);
CREATE INDEX IF NOT EXISTS idx_moments_category ON public.moments(category);
CREATE INDEX IF NOT EXISTS idx_moments_location ON public.moments USING GIST(coordinates); -- Spatial index
CREATE INDEX IF NOT EXISTS idx_moments_status ON public.moments(status);
CREATE INDEX IF NOT EXISTS idx_moments_date ON public.moments(date);

-- Requests indexes
CREATE INDEX IF NOT EXISTS idx_requests_moment_id ON public.requests(moment_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);

-- Messages & Conversations
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations USING GIN(participant_ids);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_moment_id ON public.reviews(moment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
