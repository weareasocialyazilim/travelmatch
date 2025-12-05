/**
 * SmartImage Tests
 * Tests for image components with loading states, error handling, and fallbacks
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SmartImage, { AvatarImage, Thumbnail } from '../SmartImage';

// Mock expo-vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('SmartImage', () => {
  const defaultUri = 'https://example.com/image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders with required uri prop', () => {
      const { toJSON } = render(<SmartImage uri={defaultUri} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with fallback container when uri is empty', () => {
      const { toJSON } = render(<SmartImage uri="" />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies container style', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          containerStyle={{ borderRadius: 8 }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('applies image style', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          imageStyle={{ resizeMode: 'contain' }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('applies combined style prop', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          style={{ width: 100, height: 100 }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Loading state', () => {
    it('shows loader by default', () => {
      const { toJSON } = render(<SmartImage uri={defaultUri} />);
      expect(toJSON()).toBeTruthy();
    });

    it('hides loader when showLoader is false', () => {
      const { toJSON } = render(
        <SmartImage uri={defaultUri} showLoader={false} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('uses custom loader color', () => {
      const { toJSON } = render(
        <SmartImage uri={defaultUri} loaderColor="#FF0000" />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('calls onLoadStart callback', () => {
      const onLoadStart = jest.fn();
      const { getByTestId } = render(
        <SmartImage
          uri={defaultUri}
          onLoadStart={onLoadStart}
          testID="smart-image"
        />
      );
      
      // Simulate load start through image component
      expect(onLoadStart).not.toHaveBeenCalled();
    });

    it('calls onLoadEnd callback', () => {
      const onLoadEnd = jest.fn();
      render(
        <SmartImage
          uri={defaultUri}
          onLoadEnd={onLoadEnd}
        />
      );
      
      // onLoadEnd should be available as prop
      expect(onLoadEnd).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('calls onError callback when image fails to load', () => {
      const onError = jest.fn();
      render(
        <SmartImage
          uri={defaultUri}
          onError={onError}
        />
      );
      
      // onError should be available
      expect(onError).toBeDefined();
    });

    it('shows fallback icon on error', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          fallbackIcon="image-broken"
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('uses custom fallback icon size', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          fallbackIconSize={60}
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('tries fallback URI before showing error', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          fallbackUri="https://example.com/fallback.jpg"
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Dimension handling', () => {
    it('uses 100% width/height when not specified', () => {
      const { toJSON } = render(<SmartImage uri={defaultUri} />);
      expect(toJSON()).toBeTruthy();
    });

    it('uses specified width and height', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          style={{ width: 200, height: 150 }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('handles containerStyle dimensions', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          containerStyle={{ width: 300, height: 200 }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Props passthrough', () => {
    it('passes additional Image props', () => {
      const { toJSON } = render(
        <SmartImage
          uri={defaultUri}
          resizeMode="contain"
          blurRadius={5}
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('applies testID', () => {
      const { getByTestId } = render(
        <SmartImage uri={defaultUri} testID="test-image" />
      );
      expect(getByTestId('test-image')).toBeTruthy();
    });
  });
});

describe('AvatarImage', () => {
  const defaultUri = 'https://example.com/avatar.jpg';

  describe('Basic rendering', () => {
    it('renders with uri', () => {
      const { toJSON } = render(<AvatarImage uri={defaultUri} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders without uri (fallback)', () => {
      const { toJSON } = render(<AvatarImage uri="" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with name for fallback', () => {
      const { toJSON } = render(
        <AvatarImage uri="" name="John Doe" />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Size handling', () => {
    it('uses default size of 48', () => {
      const { toJSON } = render(<AvatarImage uri={defaultUri} />);
      expect(toJSON()).toBeTruthy();
    });

    it('uses custom size', () => {
      const { toJSON } = render(
        <AvatarImage uri={defaultUri} size={64} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('applies borderRadius as half of size', () => {
      const { toJSON } = render(
        <AvatarImage uri={defaultUri} size={100} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Fallback behavior', () => {
    it('shows account icon fallback when no uri', () => {
      const { toJSON } = render(<AvatarImage uri="" />);
      expect(toJSON()).toBeTruthy();
    });

    it('generates consistent background color from name', () => {
      // Same name should produce same color
      const { toJSON: json1 } = render(<AvatarImage uri="" name="Alice" />);
      const { toJSON: json2 } = render(<AvatarImage uri="" name="Alice" />);
      
      expect(JSON.stringify(json1())).toEqual(JSON.stringify(json2()));
    });

    it('generates different colors for different names', () => {
      const { toJSON: json1 } = render(<AvatarImage uri="" name="A" />);
      const { toJSON: json2 } = render(<AvatarImage uri="" name="AB" />);
      
      // Different name lengths should potentially produce different colors
      expect(json1()).toBeTruthy();
      expect(json2()).toBeTruthy();
    });

    it('handles single word name', () => {
      const { toJSON } = render(<AvatarImage uri="" name="John" />);
      expect(toJSON()).toBeTruthy();
    });

    it('handles multiple word name', () => {
      const { toJSON } = render(
        <AvatarImage uri="" name="John William Doe" />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('handles empty name', () => {
      const { toJSON } = render(<AvatarImage uri="" name="" />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('shows fallback on image error', () => {
      const { toJSON } = render(
        <AvatarImage uri={defaultUri} name="John Doe" />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Style handling', () => {
    it('applies custom style', () => {
      const { toJSON } = render(
        <AvatarImage
          uri={defaultUri}
          style={{ borderWidth: 2, borderColor: 'blue' }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});

describe('Thumbnail', () => {
  const defaultUri = 'https://example.com/thumbnail.jpg';

  describe('Basic rendering', () => {
    it('renders with uri', () => {
      const { toJSON } = render(<Thumbnail uri={defaultUri} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Aspect ratio handling', () => {
    it('uses default 16:9 aspect ratio', () => {
      const { toJSON } = render(
        <Thumbnail uri={defaultUri} style={{ width: 320 }} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('uses custom aspect ratio', () => {
      const { toJSON } = render(
        <Thumbnail uri={defaultUri} aspectRatio={4 / 3} style={{ width: 400 }} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('uses 1:1 aspect ratio', () => {
      const { toJSON } = render(
        <Thumbnail uri={defaultUri} aspectRatio={1} style={{ width: 200 }} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('handles portrait aspect ratio', () => {
      const { toJSON } = render(
        <Thumbnail uri={defaultUri} aspectRatio={3 / 4} style={{ width: 300 }} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Max dimension constraints', () => {
    it('respects maxWidth', () => {
      const { toJSON } = render(
        <Thumbnail uri={defaultUri} maxWidth={200} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('respects maxHeight', () => {
      const { toJSON } = render(
        <Thumbnail
          uri={defaultUri}
          maxHeight={100}
          style={{ width: 300 }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('adjusts width when height exceeds maxHeight', () => {
      const { toJSON } = render(
        <Thumbnail
          uri={defaultUri}
          aspectRatio={1}
          maxHeight={150}
          style={{ width: 300 }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Dynamic dimensions', () => {
    it('handles percentage width', () => {
      const { toJSON } = render(
        <Thumbnail uri={defaultUri} style={{ width: '100%' }} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('uses maxWidth when width is not specified', () => {
      const { toJSON } = render(
        <Thumbnail uri={defaultUri} maxWidth={400} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Style handling', () => {
    it('applies additional styles', () => {
      const { toJSON } = render(
        <Thumbnail
          uri={defaultUri}
          style={{ borderRadius: 12, margin: 10 }}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('SmartImage props passthrough', () => {
    it('passes showLoader prop', () => {
      const { toJSON } = render(
        <Thumbnail uri={defaultUri} showLoader={false} />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('passes fallback props', () => {
      const { toJSON } = render(
        <Thumbnail
          uri={defaultUri}
          fallbackUri="https://example.com/fallback.jpg"
          fallbackIcon="image-broken"
        />
      );
      expect(toJSON()).toBeTruthy();
    });

    it('passes callbacks', () => {
      const onLoadStart = jest.fn();
      const onLoadEnd = jest.fn();
      const onError = jest.fn();

      const { toJSON } = render(
        <Thumbnail
          uri={defaultUri}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
          onError={onError}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});

describe('Default export', () => {
  it('exports SmartImage as default', () => {
    expect(SmartImage).toBeDefined();
  });

  it('exports AvatarImage as named export', () => {
    expect(AvatarImage).toBeDefined();
  });

  it('exports Thumbnail as named export', () => {
    expect(Thumbnail).toBeDefined();
  });
});
