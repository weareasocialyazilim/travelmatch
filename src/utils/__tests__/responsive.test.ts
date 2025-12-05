/**
 * Responsive Utils Tests
 * Testing responsive design utilities
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';
import {
  getDeviceDimensions,
  getDeviceType,
  isTablet,
  isSmallDevice,
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
  DEVICE_SIZES,
} from '../responsive';

// Mock Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    isPad: false,
  },
  PixelRatio: {
    roundToNearestPixel: jest.fn((size: number) => Math.round(size)),
  },
}));

const mockDimensions = Dimensions as jest.Mocked<typeof Dimensions>;
const mockPixelRatio = PixelRatio as jest.Mocked<typeof PixelRatio>;

describe('DEVICE_SIZES', () => {
  it('should have correct mobile sizes', () => {
    expect(DEVICE_SIZES.MOBILE_S).toBe(320);
    expect(DEVICE_SIZES.MOBILE_M).toBe(375);
    expect(DEVICE_SIZES.MOBILE_L).toBe(425);
  });

  it('should have correct tablet sizes', () => {
    expect(DEVICE_SIZES.TABLET).toBe(768);
    expect(DEVICE_SIZES.TABLET_L).toBe(1024);
  });

  it('should have desktop size', () => {
    expect(DEVICE_SIZES.DESKTOP).toBe(1440);
  });
});

describe('getDeviceDimensions', () => {
  it('should return window and screen dimensions', () => {
    mockDimensions.get.mockImplementation((type) => {
      if (type === 'window') return { width: 375, height: 812 };
      return { width: 375, height: 812 };
    });

    const result = getDeviceDimensions();

    expect(result.window).toEqual({ width: 375, height: 812 });
    expect(result.screen).toBeDefined();
  });
});

describe('getDeviceType', () => {
  it('should return mobile for small screens', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

    expect(getDeviceType()).toBe('mobile');
  });

  it('should return tablet for medium screens', () => {
    mockDimensions.get.mockReturnValue({ width: 800, height: 1200 });

    expect(getDeviceType()).toBe('tablet');
  });

  it('should return desktop for large screens', () => {
    mockDimensions.get.mockReturnValue({ width: 1500, height: 900 });

    expect(getDeviceType()).toBe('desktop');
  });
});

describe('isTablet', () => {
  beforeEach(() => {
    (Platform as unknown as { isPad: boolean }).isPad = false;
  });

  it('should return false for mobile dimensions', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

    expect(isTablet()).toBe(false);
  });

  it('should return true for tablet dimensions with correct aspect ratio', () => {
    mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });

    expect(isTablet()).toBe(true);
  });

  it('should return true when Platform.isPad is true', () => {
    (Platform as unknown as { isPad: boolean }).isPad = true;
    mockDimensions.get.mockReturnValue({ width: 768, height: 1024 });

    expect(isTablet()).toBe(true);
  });
});

describe('isSmallDevice', () => {
  it('should return true for devices smaller than MOBILE_M', () => {
    mockDimensions.get.mockReturnValue({ width: 320, height: 568 });

    expect(isSmallDevice()).toBe(true);
  });

  it('should return false for standard mobile devices', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

    expect(isSmallDevice()).toBe(false);
  });
});

describe('responsiveWidth', () => {
  it('should scale width based on device width', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

    // 375/375 * 100 = 100
    expect(responsiveWidth(100)).toBe(100);
  });

  it('should scale up for larger devices', () => {
    mockDimensions.get.mockReturnValue({ width: 414, height: 896 });

    // 414/375 * 100 = 110.4
    const result = responsiveWidth(100);
    expect(result).toBeGreaterThan(100);
  });

  it('should scale down for smaller devices', () => {
    mockDimensions.get.mockReturnValue({ width: 320, height: 568 });

    // 320/375 * 100 = 85.33
    const result = responsiveWidth(100);
    expect(result).toBeLessThan(100);
  });
});

describe('responsiveHeight', () => {
  it('should scale height based on device height', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });

    // 812/812 * 100 = 100
    expect(responsiveHeight(100)).toBe(100);
  });

  it('should scale for different heights', () => {
    mockDimensions.get.mockReturnValue({ width: 414, height: 896 });

    // 896/812 * 100 = 110.34
    const result = responsiveHeight(100);
    expect(result).toBeGreaterThan(100);
  });
});

describe('responsiveFontSize', () => {
  it('should return scaled font size', () => {
    mockDimensions.get.mockReturnValue({ width: 375, height: 812 });
    mockPixelRatio.roundToNearestPixel.mockImplementation((size) =>
      Math.round(size),
    );

    const result = responsiveFontSize(16);

    expect(result).toBe(16);
  });

  it('should scale font for larger devices', () => {
    mockDimensions.get.mockReturnValue({ width: 414, height: 896 });
    mockPixelRatio.roundToNearestPixel.mockImplementation((size) =>
      Math.round(size),
    );

    const result = responsiveFontSize(16);

    expect(result).toBeGreaterThanOrEqual(16);
  });
});
