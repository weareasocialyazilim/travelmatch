export interface Wallet {
  id: string;
  name: string;
  status: string;
}

export interface SavedCard {
  id: string;
  brand: string;
  lastFour: string;
  isDefault: boolean;
}

export interface WalletSettings {
  isDefaultPayment: boolean;
  requireAuth: boolean;
  enableNotifications: boolean;
}

export interface CardFormData {
  expiry: string;
  cvv: string;
}
