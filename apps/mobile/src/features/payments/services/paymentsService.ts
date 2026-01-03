import { supabase } from '@/config/supabase';

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
  tripId?: string;
  metadata?: Record<string, any>;
}

/**
 * Payments API Service
 *
 * Ödeme, wallet ve KYC yönetimi için API çağrıları
 */
export const paymentsApi = {
  /**
   * Wallet bilgilerini getir
   */
  getWallet: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('wallets')
      .select(
        `
        id,
        user_id,
        balance,
        currency,
        status,
        created_at,
        updated_at
      `,
      )
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Transaction geçmişi
   */
  getTransactions: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // SECURITY: Explicit column selection - never use select('*')
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        id,
        type,
        amount,
        currency,
        status,
        description,
        created_at,
        metadata,
        moment_id
      `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Transaction detayı
   */
  getTransactionById: async (transactionId: string) => {
    // Get current user for ownership verification
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // SECURITY: Explicit column selection - never use select('*')
    // Note: sender_id/receiver_id removed - these columns don't exist in transactions table
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        id,
        type,
        amount,
        currency,
        status,
        description,
        created_at,
        metadata,
        moment_id,
        user_id
      `,
      )
      .eq('id', transactionId)
      .eq('user_id', user.id) // SECURITY: Add ownership check (defense in depth beyond RLS)
      .maybeSingle(); // Use maybeSingle to handle not found gracefully

    if (error) throw error;
    if (!data) throw new Error('Transaction not found');

    return data;
  },

  /**
   * Payment methods listesi
   */
  getPaymentMethods: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // SECURITY: Explicit column selection
    const { data, error } = await supabase
      .from('payment_methods')
      .select(
        `
        id,
        user_id,
        type,
        provider,
        last_four,
        brand,
        exp_month,
        exp_year,
        is_default,
        is_active,
        created_at
      `,
      )
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  /**
   * Payment intent oluştur (Stripe)
   */
  createPaymentIntent: async (paymentData: CreatePaymentIntentDto) => {
    const { data, error } = await supabase.functions.invoke(
      'create-payment-intent',
      {
        body: paymentData,
      },
    );

    if (error) throw error;
    return data;
  },

  /**
   * Para çekme işlemi
   */
  withdraw: async (amount: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke(
      'process-withdrawal',
      {
        body: { amount },
      },
    );

    if (error) throw error;
    return data;
  },

  /**
   * KYC durumu sorgula
   */
  getKYCStatus: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // SECURITY: Explicit column selection
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select(
        `
        id,
        user_id,
        status,
        verification_type,
        document_type,
        submitted_at,
        verified_at,
        rejection_reason,
        created_at,
        updated_at
      `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  /**
   * KYC belgeleri gönder
   */
  submitKYC: async (documents: FormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upload documents to storage
    // SECURITY: Store paths, not URLs. Use signed URLs only when needed for viewing.
    const documentPaths: string[] = [];
    const uploadedPaths: string[] = []; // Track for cleanup on failure

    const frontImage = documents.get('front') as File;
    const backImage = documents.get('back') as File;
    const selfie = documents.get('selfie') as File;

    try {
      for (const [key, file] of [
        ['front', frontImage],
        ['back', backImage],
        ['selfie', selfie],
      ]) {
        if (file && file instanceof File) {
          // Validate file type for security
          const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(
              `Invalid file type for ${key}. Allowed: JPEG, PNG, WebP`,
            );
          }

          // Validate file size (max 10MB)
          const maxSize = 10 * 1024 * 1024;
          if (file.size > maxSize) {
            throw new Error(`File ${key} is too large. Maximum size: 10MB`);
          }

          const fileName = `${user.id}-${key}-${Date.now()}.${file.name
            .split('.')
            .pop()}`;
          const filePath = `kyc/${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('kyc-documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          uploadedPaths.push(filePath);
          // Store file path, not public URL (SECURITY: KYC docs should never be public)
          documentPaths.push(filePath);
        }
      }

      // Create KYC record with paths (not URLs)
      // Note: Using type assertion as table schema may not be fully typed
      const insertData = {
        user_id: user.id,
        provider: 'manual',
        document_type: documents.get('documentType') as string,
        document_paths: documentPaths, // Store paths, not public URLs
        status: 'pending',
        verification_type: 'document',
        submitted_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('kyc_verifications')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        // Cleanup uploaded files if database insert fails
        await Promise.all(
          uploadedPaths.map((path) =>
            supabase.storage.from('kyc-documents').remove([path]),
          ),
        );
        throw error;
      }

      return data;
    } catch (error) {
      // Cleanup any uploaded files on error
      if (uploadedPaths.length > 0) {
        await Promise.all(
          uploadedPaths.map((path) =>
            supabase.storage
              .from('kyc-documents')
              .remove([path])
              .catch(() => {
                // Ignore cleanup errors, log for investigation
              }),
          ),
        );
      }
      throw error;
    }
  },

  /**
   * Aktif abonelik bilgisi
   */
  getSubscription: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Yeni abonelik oluştur
   */
  createSubscription: async (planId: string) => {
    const { data, error } = await supabase.functions.invoke(
      'create-subscription',
      {
        body: { planId },
      },
    );

    if (error) throw error;
    return data;
  },

  /**
   * Abonelik iptal et
   */
  cancelSubscription: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('status', 'active')
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Gift gönder
   */
  sendGift: async (recipientId: string, amount: number, message?: string) => {
    const { data, error } = await supabase.functions.invoke('send-gift', {
      body: { recipientId, amount, message },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Gift geçmişi
   */
  getGifts: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('gifts')
      .select(
        '*, sender:profiles!sender_id(*), recipient:profiles!recipient_id(*)',
      )
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Refund talebi oluştur
   */
  requestRefund: async (transactionId: string, reason: string) => {
    const { data, error } = await supabase
      .from('refund_requests')
      .insert({
        transaction_id: transactionId,
        reason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
