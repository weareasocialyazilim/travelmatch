import { User } from './core';

export interface Moment {
  id: string;
  user: User;
  title: string;
  story: string;
  imageUrl: string;
  image?: string; // for backward compatibility
  price: number;
  location: {
    name: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  availability: string;
  place?: string;
  giftCount?: number;
  category?: {
    id: string;
    label: string;
    emoji: string;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface MomentData extends Omit<Moment, 'user'> {
  user: {
    name: string;
    avatar: string;
    type: 'traveler' | 'local';
    location: string;
    travelDays?: number;
    isVerified: boolean;
    visitingUntil?: string;
  };
}

export interface SelectedGiver {
  id: string;
  name: string;
  avatar: string;
  amount: number;
}
