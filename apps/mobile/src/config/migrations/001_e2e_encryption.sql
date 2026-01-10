-- Migration: E2E Encryption Support
-- Version: 001
-- Date: 2026-01-10
-- Description: Adds E2E encryption fields to users and messages tables

-- Add public_key to users table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'public_key'
  ) THEN
    ALTER TABLE users ADD COLUMN public_key TEXT;
    COMMENT ON COLUMN users.public_key IS 'E2E Encryption public key (Curve25519, Base64 encoded)';
  END IF;
END $$;

-- Add sender_public_key to messages table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'sender_public_key'
  ) THEN
    ALTER TABLE messages ADD COLUMN sender_public_key TEXT;
    COMMENT ON COLUMN messages.sender_public_key IS 'Sender public key for E2E decryption (Base64)';
  END IF;
END $$;

-- Ensure nonce column exists in messages (for encryption)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'nonce'
  ) THEN
    ALTER TABLE messages ADD COLUMN nonce TEXT;
    COMMENT ON COLUMN messages.nonce IS 'E2E Encryption nonce (Base64)';
  END IF;
END $$;

-- Add comment to content column
COMMENT ON COLUMN messages.content IS 'Message content - encrypted (Base64) when nonce is present, plaintext otherwise';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_users_public_key ON users(id) WHERE public_key IS NOT NULL;
