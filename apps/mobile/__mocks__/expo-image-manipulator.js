/**
 * Mock for expo-image-manipulator
 * Provides stub implementations for image manipulation
 */

const manipulateAsync = jest
  .fn()
  .mockImplementation(async (uri, actions = [], options = {}) => ({
    uri: uri || 'mock://manipulated-image.jpg',
    width: 100,
    height: 100,
  }));

const SaveFormat = {
  JPEG: 'jpeg',
  PNG: 'png',
  WEBP: 'webp',
};

const FlipType = {
  Horizontal: 'horizontal',
  Vertical: 'vertical',
};

const ImageManipulator = {
  manipulate: jest.fn().mockReturnValue({
    resize: jest.fn().mockReturnThis(),
    crop: jest.fn().mockReturnThis(),
    flip: jest.fn().mockReturnThis(),
    rotate: jest.fn().mockReturnThis(),
    renderAsync: jest.fn().mockResolvedValue({
      uri: 'mock://manipulated-image.jpg',
      width: 100,
      height: 100,
    }),
    saveAsync: jest.fn().mockResolvedValue({
      uri: 'mock://saved-image.jpg',
      width: 100,
      height: 100,
    }),
  }),
};

const useImageManipulator = jest.fn().mockReturnValue({
  manipulate: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  crop: jest.fn().mockReturnThis(),
  flip: jest.fn().mockReturnThis(),
  rotate: jest.fn().mockReturnThis(),
  render: jest.fn().mockResolvedValue({
    uri: 'mock://manipulated-image.jpg',
    width: 100,
    height: 100,
  }),
});

module.exports = {
  manipulateAsync,
  SaveFormat,
  FlipType,
  ImageManipulator,
  useImageManipulator,
};
