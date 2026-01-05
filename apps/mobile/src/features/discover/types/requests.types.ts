export interface Person {
  id: string;
  name: string;
  age: number;
  avatar: string;
  rating: number;
  isVerified: boolean;
  tripCount: number;
  city: string;
}

export interface RequestItem {
  id: string;
  person: Person;
  momentTitle: string;
  momentEmoji: string;
  amount: number;
  message: string;
  createdAt: string;
  timeAgo: string;
  isNew: boolean;
  proofRequired: boolean;
  proofUploaded: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'new_request' | 'accepted' | 'completed' | 'review' | 'payment';
  title: string;
  body: string;
  avatar?: string;
  timeAgo: string;
  isRead: boolean;
  targetType?: 'request' | 'moment' | 'wallet' | 'profile';
  momentId?: string;
  targetData?: {
    momentId?: string;
    userId?: string;
    reviewerId?: string;
    reviewerName?: string;
    reviewRating?: number;
  };
  metadata?: {
    momentId?: string;
    guestName?: string;
    momentTitle?: string;
    guestId?: string;
    rating?: number;
    message?: string;
    amount?: number;
    avatar?: string;
  };
}

export type TabType = 'pending' | 'notifications';
