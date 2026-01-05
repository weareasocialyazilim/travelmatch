/**
 * Wallet Feature - Barrel Exports
 *
 * Manages user wallet, withdrawals, and payment methods.
 * Part of the TravelMatch financial system.
 */

// ===================================
// SCREENS
// ===================================
export { default as WalletScreen } from './screens/WalletScreen';
export { default as WithdrawScreen } from './screens/WithdrawScreen';
export { WithdrawSuccessScreen } from './screens/WithdrawSuccessScreen';

// ===================================
// COMPONENTS
// ===================================
export { WalletOptionsModal } from './components/WalletOptionsModal';
export { WalletConfigModal } from './components/WalletConfigModal';
export { WalletListItem } from './components/WalletListItem';
export { WalletConnectButton } from './components/WalletConnectButton';
