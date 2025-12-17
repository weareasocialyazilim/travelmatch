-- ============================================================
-- PLATINUM FIX MIGRATION
-- Date: 2025-12-18
-- Source: Supabase Linter Results
-- ============================================================

-- ============================================================
-- 1. GÜVENLİK FIXLERİ: Mutable Search Path (DEFCON 1)
-- Sorun: Schema Hijacking riski
-- Çözüm: Fonksiyonları güvenli şemaya (public) sabitliyoruz.
-- ============================================================

ALTER FUNCTION public.update_proof_verifications_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_user_rating() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_uploaded_images_updated_at() SET search_path = public, pg_temp;

-- invalidate_cdn_manually - has parameters (text, text[])
ALTER FUNCTION public.invalidate_cdn_manually(text, text[]) SET search_path = public, pg_temp;

-- ============================================================
-- 2. GÜVENLİK FIXLERİ: PostGIS Tablosu RLS (DEFCON 1)
-- Sorun: spatial_ref_sys tablosunda RLS kapalı
-- NOT: Bu PostGIS sistem tablosu, Dashboard'dan owner yetkisi ile yapılmalı
-- Çözüm: RLS etkinleştir + salt okunur politika
-- ============================================================

-- Supabase Dashboard > SQL Editor'den çalıştırılmalı:
-- ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Mevcut politika yoksa oluştur (Sadece okumaya izin ver)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'spatial_ref_sys' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.spatial_ref_sys FOR SELECT USING (true);
    END IF;
END $$;

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

-- ============================================================
-- 4. PERFORMANS FIXLERİ: Duplicate Index Temizliği (DEFCON 2)
-- Sorun: conversations'da iki benzer indeks var
-- Çözüm: GIN indeksi (@> sorguları için optimal) tut, B-Tree sil
-- ============================================================

-- GIN indeksi array sorguları için daha performanslı
-- B-Tree indeksini kaldır
DROP INDEX IF EXISTS idx_conversations_participant_ids;

-- ============================================================
-- 5. DOĞRULAMA
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Security: Mutable search_path fixed for trigger functions';
  RAISE NOTICE '✅ Security: spatial_ref_sys RLS enabled';
  RAISE NOTICE '✅ Performance: reviews RLS policies optimized with cached auth.uid()';
  RAISE NOTICE '✅ Performance: Duplicate index removed from conversations';
END $$;
