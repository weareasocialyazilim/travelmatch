/**
 * Core Types
 * Fundamental domain types used across the application
 */

import type { KYCStatus } from './enums';

export type Role = 'Traveler' | 'Local';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: Role;
  kyc_status: KYCStatus;
  bio?: string;
  languages?: string[];
  location?: UserLocation;
  member_since: string;
  total_gifts_given: number;
  total_gifts_received: number;
  trust_score: number;
  created_at: string;
  updated_at: string;
}

export interface GiftItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  typical_price: number;
  description?: string;
}

export interface Gesture {
  id: string;
  moment_id: string;
  giver_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded';
  message?: string;
  created_at: string;
  completed_at?: string;
}

export interface Place {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

/**
 * Moment types
 */
export interface MomentLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  venue_name?: string;
}

export interface MomentUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  role?: Role;
  trust_score?: number;
}

export interface Moment {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  category?: string;
  location?: MomentLocation;
  start_time?: string;
  end_time?: string;
  max_participants?: number;
  current_participants?: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  images?: string[];
  tags?: string[];
  creator?: MomentUser;
  created_at: string;
  updated_at: string;
}
