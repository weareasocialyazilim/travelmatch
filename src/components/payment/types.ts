/**
 * Payment Component Types
 * Shared types for payment components
 */

export interface SavedCard {
  id: string;
  brand: string;
  lastFour: string;
  isDefault: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  status: string;
}

export interface WalletSettings {
  isDefaultPayment: boolean;
  requireAuth: boolean;
  enableNotifications: boolean;
}
