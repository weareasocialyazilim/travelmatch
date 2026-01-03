import type { RootStackParamList } from '../../navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

export interface MomentUser {
  id?: string;
  name: string;
  avatar?: string;
  photoUrl?: string;
  type?: string;
  isVerified?: boolean;
  location?: string | { city?: string; country?: string };
  travelDays?: number;
}

export interface MomentLocation {
  name?: string;
  city?: string;
  country?: string;
}

export interface MomentCategory {
  id?: string;
  label?: string;
  emoji?: string;
}

export interface MomentData {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  currency?: string; // Multi-currency support
  story?: string;
  status?: string;
  availability?: string;
  date?: string;
  dateRange?: { start: Date; end: Date };
  category?: MomentCategory;
  location?: MomentLocation;
  user?: MomentUser;
  creator?: MomentUser;
}

export interface PendingRequest {
  id: string;
  name: string;
  avatar: string;
  message: string;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
}

export type MomentDetailNavigation = NavigationProp<RootStackParamList>;

export type ActionLoadingState = 'like' | 'save' | 'delete' | null;
