// Discover Screen Constants
import type { Category, SortOption, City, UserStory } from './types';

export const CATEGORIES: Category[] = [
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

export const SORT_OPTIONS: SortOption[] = [
  { id: 'nearest', label: 'Nearest', icon: 'map-marker' },
  { id: 'newest', label: 'Newest', icon: 'clock-outline' },
  { id: 'price_low', label: 'Price ↑', icon: 'arrow-up' },
  { id: 'price_high', label: 'Price ↓', icon: 'arrow-down' },
];

export const POPULAR_CITIES: City[] = [
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', emoji: '🇹🇷' },
  { id: 'paris', name: 'Paris', country: 'France', emoji: '🇫🇷' },
  { id: 'london', name: 'London', country: 'UK', emoji: '🇬🇧' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { id: 'newyork', name: 'New York', country: 'USA', emoji: '🇺🇸' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
];

export const STORY_DURATION = 5000; // 5 seconds per story

export const USER_STORIES: UserStory[] = [
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
        description: 'Stunning sunset views with amazing food',
        location: 'Manhattan, NY',
        distance: '2.1 km',
        price: 85,
        time: '1h ago',
      },
    ],
  },
  {
    id: '3',
    name: 'Sara',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    hasStory: true,
    isNew: false,
    stories: [
      {
        id: 's3-1',
        imageUrl:
          'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800',
        title: 'Street Art Tour',
        description: 'Discover hidden murals and graffiti art',
        location: 'Bushwick, NY',
        distance: '3.2 km',
        price: 25,
        time: '5h ago',
      },
      {
        id: 's3-2',
        imageUrl:
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
        title: 'Gallery Opening',
        description: 'Contemporary art exhibition',
        location: 'Chelsea, NY',
        distance: '4.0 km',
        price: 0,
        time: '6h ago',
      },
      {
        id: 's3-3',
        imageUrl:
          'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800',
        title: 'Photography Walk',
        description: 'Capture the best spots in the city',
        location: 'SoHo, NY',
        distance: '1.5 km',
        price: 30,
        time: '8h ago',
      },
    ],
  },
  {
    id: '4',
    name: 'John',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    hasStory: true,
    isNew: false,
    stories: [
      {
        id: 's4-1',
        imageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        title: 'Food Market Tour',
        description: 'Taste the best local cuisines',
        location: 'Queens, NY',
        distance: '5.0 km',
        price: 45,
        time: '4h ago',
      },
    ],
  },
  {
    id: '5',
    name: 'Emma',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    hasStory: true,
    isNew: true,
    stories: [
      {
        id: 's5-1',
        imageUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        title: 'Sunrise Yoga',
        description: 'Start your day with peace and energy',
        location: 'Central Park, NY',
        distance: '1.0 km',
        price: 20,
        time: '30m ago',
      },
      {
        id: 's5-2',
        imageUrl:
          'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
        title: 'Meditation Session',
        description: 'Find your inner calm',
        location: 'Bryant Park, NY',
        distance: '0.7 km',
        price: 15,
        time: '1h ago',
      },
    ],
  },
  {
    id: '6',
    name: 'Chris',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    hasStory: true,
    isNew: false,
    stories: [
      {
        id: 's6-1',
        imageUrl:
          'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        title: 'Jazz Night',
        description: 'Live music at the best jazz club',
        location: 'Harlem, NY',
        distance: '6.0 km',
        price: 35,
        time: '3h ago',
      },
    ],
  },
  {
    id: '7',
    name: 'Lisa',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    hasStory: true,
    isNew: true,
    stories: [
      {
        id: 's7-1',
        imageUrl:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        title: 'Vintage Shopping',
        description: 'Best thrift stores in the city',
        location: 'Williamsburg, NY',
        distance: '2.5 km',
        price: 0,
        time: '2h ago',
      },
      {
        id: 's7-2',
        imageUrl:
          'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800',
        title: 'Boutique Tour',
        description: 'Discover unique local designers',
        location: 'Nolita, NY',
        distance: '1.8 km',
        price: 10,
        time: '4h ago',
      },
    ],
  },
];

export const DEFAULT_FILTERS = {
  category: 'all',
  sortBy: 'nearest',
  maxDistance: 50,
  priceRange: { min: 0, max: 500 },
  location: 'San Francisco, CA',
};

export const DEFAULT_RECENT_LOCATIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
];
