/**
 * Discover Screen Data Constants
 * Categories, Sort Options, Cities, Stories data
 */

import type { MaterialCommunityIcons } from '@expo/vector-icons';

// Categories for filter modal
export const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'tour', label: 'Tours', emoji: '🏛️' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌙' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'gift', label: 'Gifts', emoji: '🎁' },
];

export const SORT_OPTIONS: Array<{
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { id: 'nearest', label: 'Nearest', icon: 'map-marker' },
  { id: 'newest', label: 'Newest', icon: 'clock-outline' },
  { id: 'price_low', label: 'Price ↑', icon: 'arrow-up' },
  { id: 'price_high', label: 'Price ↓', icon: 'arrow-down' },
];

export const POPULAR_CITIES = [
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', emoji: '🇹🇷' },
  { id: 'paris', name: 'Paris', country: 'France', emoji: '🇫🇷' },
  { id: 'london', name: 'London', country: 'UK', emoji: '🇬🇧' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { id: 'newyork', name: 'New York', country: 'USA', emoji: '🇺🇸' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
];

export interface StoryItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  location: string;
  distance: string;
  price: number;
  time: string;
}

export interface UserStory {
  id: string;
  name: string;
  avatar: string;
  hasStory: boolean;
  isNew: boolean;
  stories: StoryItem[];
}

// User Stories Data with multiple moments per user
export const USER_STORIES: UserStory[] = [
  {
    id: '1',
    name: 'Anna',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    hasStory: true,
    isNew: true,
    stories: [
      {
        id: 's1-1',
        imageUrl:
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        title: 'Best Coffee in Town',
        description: 'Amazing latte art and cozy atmosphere',
        location: 'Brooklyn, NY',
        distance: '0.5 km',
        price: 15,
        time: '2h ago',
      },
      {
        id: 's1-2',
        imageUrl:
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        title: 'Vintage Cafe',
        description: 'Hidden gem with the best pastries',
        location: 'Brooklyn, NY',
        distance: '0.8 km',
        price: 20,
        time: '3h ago',
      },
    ],
  },
  {
    id: '2',
    name: 'Mike',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    hasStory: true,
    isNew: true,
    stories: [
      {
        id: 's2-1',
        imageUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        title: 'Rooftop Dinner',
        description: 'Best views of the city skyline',
        location: 'Manhattan, NY',
        distance: '2.3 km',
        price: 85,
        time: '4h ago',
      },
    ],
  },
  {
    id: '3',
    name: 'Sophie',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    hasStory: true,
    isNew: false,
    stories: [
      {
        id: 's3-1',
        imageUrl:
          'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=800',
        title: 'Art Gallery Tour',
        description: 'Contemporary art exhibition',
        location: 'Chelsea, NY',
        distance: '1.5 km',
        price: 45,
        time: '6h ago',
      },
    ],
  },
  {
    id: '4',
    name: 'James',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    hasStory: true,
    isNew: false,
    stories: [
      {
        id: 's4-1',
        imageUrl:
          'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800',
        title: 'Jazz Night',
        description: 'Live jazz at the Blue Note',
        location: 'Greenwich Village',
        distance: '3.0 km',
        price: 60,
        time: '8h ago',
      },
    ],
  },
  {
    id: '5',
    name: 'Emma',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    hasStory: true,
    isNew: false,
    stories: [
      {
        id: 's5-1',
        imageUrl:
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        title: 'Brunch Spot',
        description: 'Best avocado toast in town',
        location: 'SoHo, NY',
        distance: '1.8 km',
        price: 35,
        time: '1d ago',
      },
    ],
  },
];

export const STORY_DURATION = 5000; // 5 seconds per story
