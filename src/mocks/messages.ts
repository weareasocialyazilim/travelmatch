import type { Message } from '../types/domain';

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'user2',
    text: 'Hi! Thanks for approving my offer! 😊',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isMine: false,
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Thank you so much! I really appreciate your kindness!',
    timestamp: new Date(Date.now() - 3480000).toISOString(),
    isMine: true,
  },
  {
    id: '3',
    senderId: 'user2',
    text: 'When would be a good time to meet?',
    timestamp: new Date(Date.now() - 3420000).toISOString(),
    isMine: false,
  },
  {
    id: '4',
    senderId: 'me',
    text: 'How about tomorrow at 3 PM at the coffee shop?',
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    isMine: true,
  },
  {
    id: '5',
    senderId: 'user2',
    text: 'Perfect! See you there! ☕',
    timestamp: new Date(Date.now() - 3240000).toISOString(),
    isMine: false,
  },
  {
    id: '6',
    senderId: 'me',
    text: 'Great! Looking forward to it!',
    timestamp: new Date(Date.now() - 3180000).toISOString(),
    isMine: true,
  },
  {
    id: '7',
    senderId: 'user2',
    text: 'Just sent you the location 📍',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    isMine: false,
    proofId: 'proof1',
  },
  {
    id: '8',
    senderId: 'me',
    text: 'Got it! Thanks! 🙏',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    isMine: true,
  },
];
