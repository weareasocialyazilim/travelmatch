-- ============================================
-- Lovendo Trust Notes System
-- Migration: 20251229100000_trust_notes.sql
-- ============================================
--
-- Trust Notes: Alıcının göndericiye bıraktığı teşekkür notları
-- - Hediye alındıktan sonra yazılabilir
-- - Göndericinin profilinde görünür
-- - 280 karakter limit (tweet gibi)
-- ============================================

-- ============================================
-- 1. TRUST NOTES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS trust_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Taraflar
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,      -- Notu yazan (hediye ALAN)
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- Notu alan (hediye GÖNDEREN)

  -- İlişkili kayıtlar
  gift_id UUID REFERENCES gifts(id) ON DELETE SET NULL,
  moment_id UUID REFERENCES moments(id) ON DELETE SET NULL,
  escrow_id UUID REFERENCES escrow_transactions(id) ON DELETE SET NULL,

  -- Not içeriği
  note TEXT NOT NULL CHECK (char_length(note) >= 10 AND char_length(note) <= 280),

  -- Görünürlük
  is_public BOOLEAN DEFAULT TRUE,  -- Profilde görünsün mü?
  is_featured BOOLEAN DEFAULT FALSE, -- Öne çıkarılsın mı?

  -- Moderasyon
  is_approved BOOLEAN DEFAULT TRUE,  -- Auto-approve, flag edilirse false
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_reason TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Bir hediye için tek not
  CONSTRAINT unique_trust_note_per_gift UNIQUE (author_id, gift_id),
  -- Kendine not yazamaz
  CONSTRAINT no_self_notes CHECK (author_id != recipient_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trust_notes_author ON trust_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_trust_notes_recipient ON trust_notes(recipient_id);
CREATE INDEX IF NOT EXISTS idx_trust_notes_gift ON trust_notes(gift_id);
CREATE INDEX IF NOT EXISTS idx_trust_notes_public ON trust_notes(recipient_id, is_public, is_approved)
  WHERE is_public = TRUE AND is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_trust_notes_created ON trust_notes(created_at DESC);

-- Enable RLS
ALTER TABLE trust_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. RLS POLICIES
-- ============================================

-- Herkes public ve onaylı notları görebilir
CREATE POLICY "Public trust notes are viewable by all"
  ON trust_notes FOR SELECT
  USING (is_public = TRUE AND is_approved = TRUE);

-- Yazarlar kendi notlarını görebilir (public olmasa bile)
CREATE POLICY "Authors can view own notes"
  ON trust_notes FOR SELECT
  USING (auth.uid() = author_id);

-- Alıcılar kendilerine yazılan notları görebilir
CREATE POLICY "Recipients can view notes about them"
  ON trust_notes FOR SELECT
  USING (auth.uid() = recipient_id);

-- Sadece yazar not oluşturabilir (ve hediyeyi almış olmalı)
CREATE POLICY "Users can create notes for gifts they received"
  ON trust_notes FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM gifts g
      WHERE g.id = gift_id
      AND g.receiver_id = auth.uid()
      AND g.status = 'completed'
    )
  );

-- Yazarlar kendi notlarını güncelleyebilir (24 saat içinde)
CREATE POLICY "Authors can update own notes within 24 hours"
  ON trust_notes FOR UPDATE
  USING (
    auth.uid() = author_id
    AND created_at > NOW() - INTERVAL '24 hours'
  )
  WITH CHECK (auth.uid() = author_id);

-- Yazarlar kendi notlarını silebilir
CREATE POLICY "Authors can delete own notes"
  ON trust_notes FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Kullanıcının aldığı trust note sayısı
CREATE OR REPLACE FUNCTION get_user_trust_note_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COUNT(*)::INTEGER
  FROM trust_notes
  WHERE recipient_id = p_user_id
    AND is_public = TRUE
    AND is_approved = TRUE;
$$;

-- Kullanıcının aldığı trust notları
CREATE OR REPLACE FUNCTION get_user_trust_notes(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  author_name TEXT,
  author_avatar TEXT,
  note TEXT,
  moment_title TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    tn.id,
    u.full_name AS author_name,
    u.avatar_url AS author_avatar,
    tn.note,
    m.title AS moment_title,
    tn.created_at
  FROM trust_notes tn
  JOIN users u ON u.id = tn.author_id
  LEFT JOIN moments m ON m.id = tn.moment_id
  WHERE tn.recipient_id = p_user_id
    AND tn.is_public = TRUE
    AND tn.is_approved = TRUE
  ORDER BY tn.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- Trust note oluştur (validasyonlu)
CREATE OR REPLACE FUNCTION create_trust_note(
  p_gift_id UUID,
  p_note TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_gift RECORD;
  v_note_id UUID;
BEGIN
  -- Gift'i kontrol et
  SELECT g.*, m.id AS moment_id
  INTO v_gift
  FROM gifts g
  LEFT JOIN moments m ON m.id = g.moment_id
  WHERE g.id = p_gift_id;

  IF v_gift IS NULL THEN
    RAISE EXCEPTION 'Gift not found';
  END IF;

  IF v_gift.receiver_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only leave notes for gifts you received';
  END IF;

  IF v_gift.status != 'completed' THEN
    RAISE EXCEPTION 'Gift must be completed before leaving a note';
  END IF;

  -- Zaten not var mı kontrol et
  IF EXISTS (SELECT 1 FROM trust_notes WHERE author_id = auth.uid() AND gift_id = p_gift_id) THEN
    RAISE EXCEPTION 'You already left a note for this gift';
  END IF;

  -- Notu oluştur
  INSERT INTO trust_notes (
    author_id,
    recipient_id,
    gift_id,
    moment_id,
    escrow_id,
    note
  ) VALUES (
    auth.uid(),
    v_gift.giver_id,
    p_gift_id,
    v_gift.moment_id,
    v_gift.escrow_id,
    p_note
  )
  RETURNING id INTO v_note_id;

  -- Göndericiye bildirim
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (
    v_gift.giver_id,
    'trust_note_received',
    'Yeni Trust Note aldın! 💝',
    (SELECT full_name FROM users WHERE id = auth.uid()) || ' sana bir teşekkür notu bıraktı.',
    jsonb_build_object(
      'note_id', v_note_id,
      'gift_id', p_gift_id,
      'author_id', auth.uid()
    )
  );

  RETURN v_note_id;
END;
$$;

-- ============================================
-- 4. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_trust_notes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trust_notes_updated_at ON trust_notes;
CREATE TRIGGER trust_notes_updated_at
  BEFORE UPDATE ON trust_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_notes_updated_at();

-- ============================================
-- 5. ADD TRUST NOTE COUNT TO USERS (not profiles - profiles table doesn't exist)
-- ============================================

-- Add trust_note_count column to users if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'trust_note_count') THEN
    ALTER TABLE users ADD COLUMN trust_note_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Trigger to update count
CREATE OR REPLACE FUNCTION update_user_trust_note_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users
    SET trust_note_count = COALESCE(trust_note_count, 0) + 1
    WHERE id = NEW.recipient_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users
    SET trust_note_count = GREATEST(0, COALESCE(trust_note_count, 0) - 1)
    WHERE id = OLD.recipient_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS update_trust_note_count_trigger ON trust_notes;
CREATE TRIGGER update_trust_note_count_trigger
  AFTER INSERT OR DELETE ON trust_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_trust_note_count();

-- ============================================
-- 6. COMMENTS
-- ============================================

COMMENT ON TABLE trust_notes IS
'Trust notes that gift receivers leave for gift senders.
Displayed on sender profiles as social proof.';

COMMENT ON COLUMN trust_notes.author_id IS 'The user who wrote the note (gift receiver)';
COMMENT ON COLUMN trust_notes.recipient_id IS 'The user who receives the note (gift sender)';
COMMENT ON COLUMN trust_notes.is_public IS 'Whether the note appears on the recipient profile';
COMMENT ON COLUMN trust_notes.is_featured IS 'Admin can feature exceptional notes';
