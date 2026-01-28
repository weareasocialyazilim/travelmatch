/**
 * Wallet Feature - Barrel Exports
 *
 * Manages user wallet, bank transfers, and payment methods.
 * Part of the Lovendo financial system.
 */

// ===================================
// SCREENS
// ===================================
export { default as WalletScreen } from './screens/WalletScreen';
export { default as BankTransferScreen } from './screens/BankTransferScreen';
export { BankTransferSuccessScreen } from './screens/BankTransferSuccessScreen';
export { default as CoinStoreScreen } from './screens/CoinStoreScreen';

// ===================================
// COMPONENTS
// ===================================
export { WalletOptionsModal } from './components/WalletOptionsModal';
export { WalletConfigModal } from './components/WalletConfigModal';
export { WalletListItem } from './components/WalletListItem';
export { WalletConnectButton } from './components/WalletConnectButton';
