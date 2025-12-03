import type { ProofStory } from '../types/domain';

export const MOCK_PROOF_STORY: ProofStory = {
  id: '1',
  proofId: 'proof1',
  userId: 'user1',
  type: 'micro-kindness',
  title: 'Coffee for a Stranger',
  description:
    'Today I met an amazing person at Starbucks who was having a tough day. I bought them a coffee and we had a wonderful conversation about travel and kindness. Small gestures can make a big difference!',
  location: {
    lat: 37.7749,
    lng: -122.4194,
    city: 'San Francisco',
    country: 'USA',
  },
  images: [
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
  ],
  author: {
    id: 'user1',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    trustScore: 95,
  },
  stats: {
    views: 1234,
    likes: 456,
    shares: 78,
  },
  createdAt: new Date(Date.now() - 86400000).toISOString(),
};
