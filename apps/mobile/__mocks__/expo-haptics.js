// Mock expo-haptics for tests
const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
};

const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
};

const SelectionAsync = jest.fn().mockResolvedValue(undefined);
const impactAsync = jest.fn().mockResolvedValue(undefined);
const notificationAsync = jest.fn().mockResolvedValue(undefined);
const selectionAsync = jest.fn().mockResolvedValue(undefined);

module.exports = {
  __esModule: true,
  default: {
    ImpactFeedbackStyle,
    NotificationFeedbackType,
    SelectionAsync,
    impactAsync,
    notificationAsync,
    selectionAsync,
  },
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  SelectionAsync,
  impactAsync,
  notificationAsync,
  selectionAsync,
};
