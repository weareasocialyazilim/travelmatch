-- supabase/migrations/20260120000004_gdpr_cleanup.sql

CREATE OR REPLACE FUNCTION public.handle_full_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Kullanıcının videolarını ve görsellerini Storage'dan işaretle (Soft Delete for audit/recovery if needed before vacuum)
    -- Note: Real storage deletion usually happens via Storage API or a separate cron, but flagging helps.
    -- Assuming a column 'is_deleted' exists or we just rely on cascade for metadata.
    -- If 'uploaded_images' is a table tracking storage items:
    UPDATE public.uploaded_images SET is_deleted = TRUE WHERE user_id = OLD.id;
    
    -- 2. İlişkili verileri temizle (Cascade triggers usually handle FKs, but explicit cleanup ensures safety)
    DELETE FROM public.moments WHERE user_id = OLD.id;
    DELETE FROM public.gifts WHERE sender_id = OLD.id OR recipient_id = OLD.id;
    DELETE FROM public.wallets WHERE user_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow idempotency
DROP TRIGGER IF EXISTS on_user_deleted_cleanup ON auth.users;

CREATE TRIGGER on_user_deleted_cleanup
    BEFORE DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_full_user_deletion();
