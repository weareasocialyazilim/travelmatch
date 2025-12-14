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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Transaction geçmişi
   */
  getTransactions: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Transaction detayı
   */
  getTransactionById: async (transactionId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Payment methods listesi
   */
  getPaymentMethods: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  /**
   * Payment intent oluştur (Stripe)
   */
  createPaymentIntent: async (paymentData: CreatePaymentIntentDto) => {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: paymentData,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Para çekme işlemi
   */
  withdraw: async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('process-withdrawal', {
      body: { amount },
    });

    if (error) throw error;
    return data;
  },

  /**
   * KYC durumu sorgula
   */
  getKYCStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Upload documents to storage
    const documentUrls: string[] = [];
    
    const frontImage = documents.get('front') as File;
    const backImage = documents.get('back') as File;
    const selfie = documents.get('selfie') as File;

    for (const [key, file] of [['front', frontImage], ['back', backImage], ['selfie', selfie]]) {
      if (file && file instanceof File) {
        const fileName = `${user.id}-${key}-${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `kyc/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('kyc-documents')
          .getPublicUrl(filePath);

        documentUrls.push(data.publicUrl);
      }
    }

    // Create KYC record
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: user.id,
        document_type: documents.get('documentType'),
        document_urls: documentUrls,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Aktif abonelik bilgisi
   */
  getSubscription: async () => {
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: { planId },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Abonelik iptal et
   */
  cancelSubscription: async () => {
    const { data: { user } } = await supabase.auth.getUser();
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('gifts')
      .select('*, sender:profiles!sender_id(*), recipient:profiles!recipient_id(*)')
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
