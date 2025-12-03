// Mock Users Data
export const MOCK_USERS = [
  {
    id: 'user-1',
    name: 'Sarah Jenkins',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    role: 'traveler' as const,
    verified: true,
    proofScore: 98,
    location: 'San Francisco, CA',
    bio: 'Coffee enthusiast, street food explorer. Discovering hidden gems around the world.',
    memberSince: 'January 2024',
    totalReceived: 1250,
    totalGifted: 300,
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    role: 'traveler' as const,
    verified: true,
    proofScore: 95,
    location: 'New York, NY',
    bio: 'Adventure seeker and photography lover.',
    memberSince: 'March 2024',
    totalReceived: 850,
    totalGifted: 420,
  },
  {
    id: 'user-3',
    name: 'Emma Wilson',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    role: 'local' as const,
    verified: true,
    proofScore: 100,
    location: 'Barcelona, Spain',
    bio: 'Local guide sharing authentic experiences.',
    memberSince: 'February 2024',
    totalReceived: 2100,
    totalGifted: 150,
  },
  {
    id: 'user-4',
    name: 'James Rodriguez',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    role: 'traveler' as const,
    verified: false,
    proofScore: 87,
    location: 'London, UK',
    bio: 'Digital nomad exploring Asia.',
    memberSince: 'May 2024',
    totalReceived: 420,
    totalGifted: 680,
  },
];

// Mock Moments Data
export const MOCK_MOMENTS = [
  {
    id: 'moment-1',
    title: 'Sunrise at Machu Picchu',
    description:
      'Witnessing the ancient Incan city emerge from morning mist is an unforgettable experience.',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
    category: {
      id: 'adventure',
      label: 'Adventure',
      emoji: '🏔️',
    },
    location: {
      name: 'Machu Picchu',
      city: 'Cusco',
      country: 'Peru',
    },
    date: '2024-07-24',
    price: 50,
    status: 'active' as const,
    userId: 'user-1',
    proofRequired: 'photo' as const,
    escrowStatus: 'held' as const,
  },
  {
    id: 'moment-2',
    title: 'Snorkeling in the Great Barrier Reef',
    description:
      'Exploring the vibrant underwater world of the largest coral reef system.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    category: {
      id: 'adventure',
      label: 'Adventure',
      emoji: '🏔️',
    },
    location: {
      name: 'Great Barrier Reef',
      city: 'Queensland',
      country: 'Australia',
    },
    date: '2024-07-15',
    price: 75,
    status: 'active' as const,
    userId: 'user-2',
    proofRequired: 'photo' as const,
    escrowStatus: 'held' as const,
  },
  {
    id: 'moment-3',
    title: 'Authentic Paella Experience',
    description:
      'Learning to cook traditional paella with a local family in Valencia.',
    image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800',
    category: {
      id: 'food',
      label: 'Food & Drink',
      emoji: '🍽️',
    },
    location: {
      name: 'Local Home',
      city: 'Valencia',
      country: 'Spain',
    },
    date: '2024-08-10',
    price: 35,
    status: 'active' as const,
    userId: 'user-3',
    proofRequired: 'photo' as const,
    escrowStatus: 'pending' as const,
  },
  {
    id: 'moment-4',
    title: 'Coffee Tour in Kyoto',
    description:
      'Discovering hidden coffee gems in the ancient streets of Kyoto.',
    image: 'https://images.unsplash.com/photo-1545665277-5937489579f2?w=800',
    category: {
      id: 'coffee',
      label: 'Coffee',
      emoji: '☕',
    },
    location: {
      name: 'Gion District',
      city: 'Kyoto',
      country: 'Japan',
    },
    date: '2024-09-01',
    price: 25,
    status: 'active' as const,
    userId: 'user-1',
    proofRequired: 'photo' as const,
    escrowStatus: 'released' as const,
  },
];

// Mock Transactions Data
export const MOCK_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'incoming' as const,
    title: 'Gift from Sarah',
    description: 'Sunrise at Machu Picchu',
    amount: 50,
    date: '2024-11-30',
    status: 'completed' as const,
    proofLoopVerified: true,
    userId: 'user-1',
    momentId: 'moment-1',
  },
  {
    id: 'tx-2',
    type: 'outgoing' as const,
    title: 'Gift to Michael',
    description: 'Great Barrier Reef Adventure',
    amount: 75,
    date: '2024-11-28',
    status: 'pending' as const,
    proofLoopVerified: false,
    userId: 'user-2',
    momentId: 'moment-2',
  },
  {
    id: 'tx-3',
    type: 'incoming' as const,
    title: 'Gift from Emma',
    description: 'Paella Cooking Class',
    amount: 35,
    date: '2024-11-25',
    status: 'completed' as const,
    proofLoopVerified: true,
    userId: 'user-3',
    momentId: 'moment-3',
  },
  {
    id: 'tx-4',
    type: 'withdrawal' as const,
    title: 'Withdrawal to Bank',
    description: 'Bank of America ****1234',
    amount: 150,
    date: '2024-11-20',
    status: 'completed' as const,
    proofLoopVerified: false,
    userId: 'user-1',
  },
];

// Mock Inbox Messages
export const MOCK_MESSAGES = [
  {
    id: 'msg-1',
    type: 'message' as const,
    userId: 'user-1',
    title: 'Sarah Jenkins',
    subtitle: 'Hey, I just funded your Kyoto trip! So excited for you!',
    time: '10:45 AM',
    unreadCount: 2,
    section: 'today' as const,
  },
  {
    id: 'msg-2',
    type: 'activity' as const,
    icon: 'check-decagram' as const,
    iconBg: 'mintTransparent',
    iconColor: 'success',
    title: "Proof approved for 'Galata coffee'",
    subtitle: 'Funds have been released to your wallet.',
    time: '9:32 AM',
    section: 'today' as const,
  },
  {
    id: 'msg-3',
    type: 'message' as const,
    userId: 'user-4',
    title: 'James Rodriguez',
    subtitle: "Let's plan our trip! Can you send over some ideas?",
    time: 'Yesterday',
    hasUnread: true,
    section: 'yesterday' as const,
  },
  {
    id: 'msg-4',
    type: 'activity' as const,
    icon: 'gift' as const,
    iconBg: 'mintTransparent',
    iconColor: 'text',
    title: 'Emma Wilson funded your moment',
    subtitle: "A new gift for 'Himalayan Trek' is waiting.",
    time: 'Yesterday',
    hasUnread: true,
    section: 'yesterday' as const,
  },
];

// Mock Proofs Data
export const MOCK_PROOFS = [
  {
    id: 'proof-1',
    userId: 'user-1',
    userName: 'Sarah Jenkins',
    userAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    momentId: 'moment-1',
    momentTitle: 'Sunrise at Machu Picchu',
    location: 'Cusco, Peru',
    date: '24 July 2024',
    escrowAmount: 50,
    status: 'pending' as const,
    timeAgo: '2h ago',
    isProofLoopProtected: true,
    imageUrl:
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
  },
  {
    id: 'proof-2',
    userId: 'user-2',
    userName: 'Michael Chen',
    userAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    momentId: 'moment-2',
    momentTitle: 'Snorkeling in the Great Barrier Reef',
    location: 'Queensland, Australia',
    date: '15 July 2024',
    escrowAmount: 75,
    status: 'pending' as const,
    timeAgo: '8h ago',
    isProofLoopProtected: true,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
  },
];

// Categories
export const CATEGORIES = [
  { id: 'coffee', label: 'Coffee', emoji: '☕', icon: 'coffee' },
  { id: 'meal', label: 'Meal', emoji: '🍽️', icon: 'silverware-fork-knife' },
  { id: 'ticket', label: 'Ticket', emoji: '🎟️', icon: 'ticket' },
  { id: 'transport', label: 'Transport', emoji: '🚗', icon: 'car' },
  { id: 'experience', label: 'Experience', emoji: '✨', icon: 'star' },
  { id: 'other', label: 'Other', emoji: '🎁', icon: 'gift' },
];

// Helper function to get user by ID
export const getUserById = (userId: string) => {
  return MOCK_USERS.find((user) => user.id === userId);
};

// Helper function to get moment by ID
export const getMomentById = (momentId: string) => {
  return MOCK_MOMENTS.find((moment) => moment.id === momentId);
};

// Helper function to get transactions for a user
export const getTransactionsForUser = (userId: string) => {
  return MOCK_TRANSACTIONS.filter((tx) => tx.userId === userId);
};
