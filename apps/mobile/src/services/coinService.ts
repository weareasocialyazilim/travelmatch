import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import { supabase } from '@/config/supabase';

// Helper for type safety if needed
export type CoinPackage = PurchasesPackage;

class CoinService {
  private static instance: CoinService;
  private initialized = false;

  private constructor() {}

  static getInstance(): CoinService {
    if (!CoinService.instance) {
      CoinService.instance = new CoinService();
    }
    return CoinService.instance;
  }

  async init() {
    if (this.initialized) return;

    try {
      const apiKey = Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
      });

      if (!apiKey) {
        logger.warn('RevenueCat API Key not found');
        return;
      }

      await Purchases.configure({ apiKey });
      this.initialized = true;
      logger.info('CoinService initialized');
    } catch (error) {
      logger.error('Failed to init CoinService', error);
    }
  }

  async getPackages(): Promise<PurchasesPackage[]> {
    try {
      // Ensure initialized
      if (!this.initialized) await this.init();

      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        return offerings.current.availablePackages;
      }
      return [];
    } catch (error) {
      logger.error('Error fetching coin packages', error);
      return [];
    }
  }

  async purchasePackage(
    pack: PurchasesPackage,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);

      // RevenueCat should trigger a webhook to our backend
      // Our backend updates the user's coin balance
      // We can poll the user's balance or trust the webhook speed

      return { success: true };
    } catch (error: any) {
      if (!error.userCancelled) {
        logger.error('Purchase failed', error);
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Cancelled' };
    }
  }

  async restorePurchases() {
    try {
      await Purchases.restorePurchases();
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const coinService = CoinService.getInstance();
