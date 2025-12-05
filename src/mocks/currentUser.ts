/**
 * Mock Current User Data
 *
 * Bu dosya, giriş yapmış kullanıcının mock verilerini içerir.
 * Tüm ekranlar bu merkezi kaynağı kullanmalı.
 *
 * kyc: Identity Verification (KYC) durumu - 'Unverified' | 'Pending' | 'Verified'
 *      Bu tek kaynak verified badge ve settings durumunu belirler.
 *
 * NOT: Gerçek uygulamada bu veriler AuthContext veya API'den gelecek
 */

import type { KYCStatus } from '../types/core';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  location: string;
  bio: string;
  role: 'Traveler' | 'Local';

  // KYC is the single source of truth for verification
  kyc: KYCStatus; // 'Unverified' | 'Pending' | 'Verified'

  // Stats
  trustScore: number;
  momentsCount: number;
  exchangesCount: number;
  responseRate: number;
  activeMoments: number;
  completedMoments: number;

  // Wallet & Activity
  walletBalance: number;
  giftsSentCount: number;
  savedCount: number;

  // Dates
  memberSince: string;
}

/**
 * Mock current user - SINGLE SOURCE OF TRUTH
 *
 * Test için kyc değerini değiştirin:
 * - kyc: 'Unverified' → Verify butonu, avatar'da badge YOK, düşük ProofScore
 * - kyc: 'Pending'    → Pending durumu, avatar'da badge YOK
 * - kyc: 'Verified'   → Verified ✓ badge HER YERDE, yüksek ProofScore
 */
export const CURRENT_USER: CurrentUser = {
  id: 'current-user',
  name: 'Sophia Carter',
  email: 'sophia@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
  location: 'San Francisco, CA',
  bio: 'Travel enthusiast exploring the world one city at a time.',
  role: 'Traveler',

  // KYC Status - TEK KAYNAK
  // Değiştirmek için: 'Unverified' | 'Pending' | 'Verified'
  kyc: 'Verified',

  // Stats - KYC verified ise yüksek, değilse düşük olmalı
  trustScore: 92, // Bu değer kyc durumuna göre hesaplanmalı
  momentsCount: 28,
  exchangesCount: 156,
  responseRate: 98,
  activeMoments: 5,
  completedMoments: 23,

  // Wallet & Activity
  walletBalance: 1250.0,
  giftsSentCount: 12,
  savedCount: 8,

  // Dates
  memberSince: 'March 2024',
};

/**
 * Helper: KYC durumunu kontrol et
 * Bu helper'ları tüm ekranlarda kullan!
 */
export const isKYCVerified = (user: CurrentUser): boolean => {
  return user.kyc === 'Verified';
};

export const isKYCPending = (user: CurrentUser): boolean => {
  return user.kyc === 'Pending';
};

export const needsKYC = (user: CurrentUser): boolean => {
  return user.kyc === 'Unverified';
};

/**
 * isVerified - Avatar badge ve diğer yerlerde kullanmak için
 * KYC verified ise true, değilse false
 */
export const isVerified = (user: CurrentUser): boolean => {
  return user.kyc === 'Verified';
};

/**
 * ProofScore hesaplama - KYC durumuna göre
 */
export const getProofScore = (user: CurrentUser): number => {
  if (user.kyc === 'Verified') return user.trustScore;
  if (user.kyc === 'Pending') return Math.floor(user.trustScore * 0.7);
  return Math.floor(user.trustScore * 0.5); // Unverified
};
