/**
 * Discover Feature Types
 */

export interface Profile {
  id: string;
  userId: string;
  name: string;
  age: number;
  bio: string;
  photos: ProfilePhoto[];
  location: Location;
  interests: string[];
  verified: boolean;
  trustScore: number;
  currentTrip?: Trip;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  cloudflareId?: string;
  order: number;
  isProfile: boolean;
}

export interface Location {
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
}

export interface DiscoverFilters {
  ageRange: [number, number];
  distance: number;
  gender: string[];
  interests: string[];
  travelDates?: [Date, Date];
  destinations?: string[];
  verified?: boolean;
  minTrustScore?: number;
}

export interface SwipeAction {
  type: 'like' | 'pass' | 'super-like';
  profileId: string;
  timestamp: Date;
}

export interface Match {
  id: string;
  userId: string;
  profile: Profile;
  matchedAt: Date;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
}

export interface DiscoverFeed {
  profiles: Profile[];
  hasMore: boolean;
  cursor?: string;
}

export interface SwipeResult {
  success: boolean;
  matched?: boolean;
  match?: Match;
}
