-- ============================================================
-- PLATINUM FIX MIGRATION v2
-- Date: 2025-12-18
-- Source: Supabase Linter Results (Complete)
-- ============================================================

-- ============================================================
-- 1. GÜVENLİK FIXLERİ: Mutable Search Path (DEFCON 1)
-- Sorun: Schema Hijacking riski
-- Çözüm: Tüm fonksiyonları güvenli şemaya sabitliyoruz.
-- ============================================================

-- Ödeme ve temizlik fonksiyonları
ALTER FUNCTION public.cleanup_old_payment_records() SET search_path = public, pg_temp;

-- Coğrafi ve arama fonksiyonları
ALTER FUNCTION public.search_moments_nearby(double precision, double precision, double precision, text, integer) SET search_path = public, pg_temp;

-- Trigger ve güncelleme fonksiyonları
ALTER FUNCTION public.update_conversation_last_message() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_moment_participants() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_proof_verifications_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_user_rating() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_uploaded_images_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.invalidate_cdn_manually(text, text[]) SET search_path = public, pg_temp;

-- ============================================================
-- 2. PostGIS: spatial_ref_sys - FALSE POSITIVE (see SECURITY_ARCHITECTURE.md)
-- ============================================================

-- ============================================================
-- 3. PERFORMANS FIXLERİ: RLS Optimizasyonu (DEFCON 2)
-- Sorun: auth.uid() her satır için tekrar hesaplanıyor
-- Çözüm: (select auth.uid()) ile önbellekleme
-- ============================================================

-- Reviews: Create Policy - Optimized
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews
FOR INSERT WITH CHECK (
  (select auth.uid()) = reviewer_id
);

-- Reviews: Update Policy - Optimized  
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews
FOR UPDATE USING (
  (select auth.uid()) = reviewer_id
);

-- Reviews: Delete Policy - Optimized
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews" ON public.reviews
FOR DELETE USING (
  (select auth.uid()) = reviewer_id
);

-- Reports: Create Policy - Optimized
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports" ON public.reports
FOR INSERT WITH CHECK (
  (select auth.uid()) = reporter_id
);

-- Reports: View Policy - Optimized
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports" ON public.reports
FOR SELECT USING (
  (select auth.uid()) = reporter_id
);

-- Favorites: View Policy - Optimized
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites" ON public.favorites
FOR SELECT USING (
  (select auth.uid()) = user_id
);

-- ============================================================
-- 4. PERFORMANS FIXLERİ: Missing Foreign Key Indexes
-- Sorun: JOIN sorgularını yavaşlatan eksik indeksler
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_id ON public.conversations(last_message_id);
CREATE INDEX IF NOT EXISTS idx_proof_quality_scores_reviewed_by ON public.proof_quality_scores(reviewed_by);

-- ============================================================
-- 5. PERFORMANS FIXLERİ: Unused/Duplicate Index Temizliği
-- ============================================================

-- Duplicate Index: GIN olanı tut, B-Tree sil
DROP INDEX IF EXISTS idx_conversations_participant_ids;

-- Unused Indexes: Hiç kullanılmamış indeksleri sil
DROP INDEX IF EXISTS idx_proof_verifications_created_at;
DROP INDEX IF EXISTS idx_proof_verifications_user_status;

-- ============================================================
-- 5. DOĞRULAMA
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Security: Mutable search_path fixed for trigger functions';
  RAISE NOTICE '⚪ Security: spatial_ref_sys skipped (PostGIS system table - see SECURITY_ARCHITECTURE.md)';
  RAISE NOTICE '✅ Performance: reviews RLS policies optimized with cached auth.uid()';
  RAISE NOTICE '✅ Performance: Duplicate index removed from conversations';
END $$;
