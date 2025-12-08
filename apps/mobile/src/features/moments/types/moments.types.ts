/**
 * Moments Feature Types
 */

export interface Moment {
  id: string;
  userId: string;
  user: MomentUser;
  caption: string;
  media: MomentMedia[];
  location?: MomentLocation;
  tags: string[];
  privacy: 'public' | 'connections' | 'private';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MomentUser {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

export interface MomentMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  cloudflareId?: string;
  thumbnail?: string;
  width: number;
  height: number;
  duration?: number; // for videos
  order: number;
}

export interface MomentLocation {
  name: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MomentComment {
  id: string;
  momentId: string;
  userId: string;
  user: MomentUser;
  content: string;
  parentId?: string; // for replies
  likesCount: number;
  isLiked: boolean;
  createdAt: Date;
  replies?: MomentComment[];
}

export interface CreateMomentInput {
  caption: string;
  media: MomentMediaInput[];
  location?: MomentLocation;
  tags?: string[];
  privacy?: 'public' | 'connections' | 'private';
}

export interface MomentMediaInput {
  uri: string;
  type: 'photo' | 'video';
  width: number;
  height: number;
  duration?: number;
}

export interface MomentsFeed {
  moments: Moment[];
  hasMore: boolean;
  cursor?: string;
}

export interface MomentLike {
  id: string;
  momentId: string;
  userId: string;
  user: MomentUser;
  createdAt: Date;
}

export interface MomentInteraction {
  type: 'like' | 'comment' | 'share' | 'bookmark';
  momentId: string;
  timestamp: Date;
}
