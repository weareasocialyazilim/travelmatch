import type { GiverSlot } from '../types/domain';

export const MOCK_SLOTS: GiverSlot[] = [
  {
    id: '1',
    position: 1,
    giver: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      trustScore: 95,
    },
    amount: 25,
    message: 'Would love to help with your coffee moment!',
    timestamp: '2 min ago',
  },
  {
    id: '2',
    position: 2,
    giver: {
      id: 'user2',
      name: 'Mike Wilson',
      avatar: 'https://i.pravatar.cc/150?img=2',
      trustScore: 88,
    },
    amount: 15,
    message: 'Happy to contribute to this kind gesture',
    timestamp: '5 min ago',
  },
  {
    id: '3',
    position: 3,
    giver: {
      id: 'user3',
      name: 'Emily Chen',
      avatar: 'https://i.pravatar.cc/150?img=3',
      trustScore: 98,
    },
    amount: 10,
    message: 'Supporting fellow travelers!',
    timestamp: '8 min ago',
  },
  {
    id: '4',
    position: 4,
    giver: {
      id: 'user4',
      name: 'David Park',
      avatar: 'https://i.pravatar.cc/150?img=4',
      trustScore: 92,
    },
    amount: 20,
    message: 'Let me help make this happen ✨',
    timestamp: '12 min ago',
  },
];
