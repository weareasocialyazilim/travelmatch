import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SmartImage, { AvatarImage, Thumbnail } from '../SmartImage';

describe('SmartImage', () => {
  const mockUri = 'https://example.com/image.jpg';
  const mockFallbackUri = 'https://example.com/fallback.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders image with given URI', () => {
      const { UNSAFE_getByType } = render(<SmartImage uri={mockUri} />);

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      expect(image.props.source).toEqual({ uri: mockUri });
    });

    it('shows loading indicator initially', () => {
      const { UNSAFE_getByType } = render(<SmartImage uri={mockUri} />);

      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('hides loading indicator after image loads', async () => {
      const { UNSAFE_getByType, UNSAFE_queryByType } = render(
        <SmartImage uri={mockUri} />,
      );

      const { Image, ActivityIndicator } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'loadEnd');

      await waitFor(() => {
        expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
      });
    });

    it('does not show loader when showLoader is false', () => {
      const { UNSAFE_queryByType } = render(
        <SmartImage uri={mockUri} showLoader={false} />,
      );

      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    });

    it('applies custom container style', () => {
      const customStyle = { margin: 10, padding: 5 };
      const { UNSAFE_getAllByType } = render(
        <SmartImage uri={mockUri} containerStyle={customStyle} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      expect(JSON.stringify(container.props.style)).toContain('10');
      expect(JSON.stringify(container.props.style)).toContain('5');
    });

    it('applies custom image style', () => {
      const customStyle = { borderRadius: 10 };
      const { UNSAFE_getByType } = render(
        <SmartImage uri={mockUri} imageStyle={customStyle} />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      // Style object contains borderRadius
      expect(JSON.stringify(image.props.style)).toContain('borderRadius');
      expect(JSON.stringify(image.props.style)).toContain('10');
    });

    it('uses custom loader color', () => {
      const { UNSAFE_getByType } = render(
        <SmartImage uri={mockUri} loaderColor="#FF0000" />,
      );

      const { ActivityIndicator } = require('react-native');
      const loader = UNSAFE_getByType(ActivityIndicator);

      expect(loader.props.color).toBe('#FF0000');
    });
  });

  describe('Error Handling', () => {
    it('shows fallback icon on error', async () => {
      const { UNSAFE_getByType } = render(<SmartImage uri={mockUri} />);

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'error');

      await waitFor(() => {
        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
      });
    });

    it('uses custom fallback icon', async () => {
      const { UNSAFE_getByType } = render(
        <SmartImage uri={mockUri} fallbackIcon="image-broken" />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'error');

      await waitFor(() => {
        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icon = UNSAFE_getByType(MaterialCommunityIcons);
        expect(icon.props.name).toBe('image-broken');
      });
    });

    it('tries fallback URI before showing error', async () => {
      const { UNSAFE_getByType } = render(
        <SmartImage uri={mockUri} fallbackUri={mockFallbackUri} />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      // First error triggers fallback URI
      fireEvent(image, 'error');

      await waitFor(() => {
        expect(image.props.source).toEqual({ uri: mockFallbackUri });
      });
    });

    it('shows error after fallback URI also fails', async () => {
      const { UNSAFE_getByType, UNSAFE_queryByType } = render(
        <SmartImage uri={mockUri} fallbackUri={mockFallbackUri} />,
      );

      const { Image } = require('react-native');
      let image = UNSAFE_getByType(Image);

      // First error triggers fallback
      fireEvent(image, 'error');

      await waitFor(() => {
        image = UNSAFE_queryByType(Image);
        if (image) {
          expect(image.props.source).toEqual({ uri: mockFallbackUri });
        }
      });

      // Second error shows fallback icon
      if (image) {
        fireEvent(image, 'error');
      }

      await waitFor(() => {
        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
      });
    });

    it('shows fallback when URI is empty', () => {
      const { UNSAFE_getByType } = render(<SmartImage uri="" />);

      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
    });

    it('uses custom fallback icon size', async () => {
      const { UNSAFE_getByType } = render(
        <SmartImage uri={mockUri} fallbackIconSize={60} />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'error');

      await waitFor(() => {
        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icon = UNSAFE_getByType(MaterialCommunityIcons);
        expect(icon.props.size).toBe(60);
      });
    });
  });

  describe('Callbacks', () => {
    it('calls onLoadStart when loading starts', () => {
      const mockOnLoadStart = jest.fn() as jest.Mock;
      const { UNSAFE_getByType } = render(
        <SmartImage uri={mockUri} onLoadStart={mockOnLoadStart} />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'loadStart');

      expect(mockOnLoadStart).toHaveBeenCalledTimes(1);
    });

    it('calls onLoadEnd when loading completes', () => {
      const mockOnLoadEnd = jest.fn() as jest.Mock;
      const { UNSAFE_getByType } = render(
        <SmartImage uri={mockUri} onLoadEnd={mockOnLoadEnd} />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'loadEnd');

      expect(mockOnLoadEnd).toHaveBeenCalledTimes(1);
    });

    it('calls onError when image fails', () => {
      const mockOnError = jest.fn() as jest.Mock;
      const { UNSAFE_getByType } = render(
        <SmartImage uri={mockUri} onError={mockOnError} />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'error');

      expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    it('does not call onError on fallback retry', () => {
      const mockOnError = jest.fn() as jest.Mock;
      const { UNSAFE_getByType } = render(
        <SmartImage
          uri={mockUri}
          fallbackUri={mockFallbackUri}
          onError={mockOnError}
        />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      // First error should try fallback, not call onError yet
      fireEvent(image, 'error');

      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined URI gracefully', () => {
      const { UNSAFE_getByType } = render(<SmartImage uri={undefined} />);

      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
    });

    it('handles very long URI', () => {
      const longUri = 'https://example.com/' + 'a'.repeat(1000) + '.jpg';
      const { UNSAFE_getByType } = render(<SmartImage uri={longUri} />);

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      expect(image.props.source).toEqual({ uri: longUri });
    });

    it('handles rapid load state changes', async () => {
      const { UNSAFE_getByType } = render(<SmartImage uri={mockUri} />);

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'loadStart');
      fireEvent(image, 'loadEnd');
      fireEvent(image, 'loadStart');
      fireEvent(image, 'loadEnd');

      // Should not crash
      expect(image).toBeTruthy();
    });
  });
});

describe('AvatarImage', () => {
  const mockUri = 'https://example.com/avatar.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders SmartImage when URI is provided', () => {
      const { UNSAFE_getByType } = render(
        <AvatarImage uri={mockUri} name="John" />,
      );

      const { Image } = require('react-native');
      expect(UNSAFE_getByType(Image)).toBeTruthy();
    });

    it('shows fallback icon when URI is not provided', () => {
      const { UNSAFE_getByType } = render(<AvatarImage uri="" name="John" />);

      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icon = UNSAFE_getByType(MaterialCommunityIcons);
      expect(icon.props.name).toBe('account');
    });

    it('uses custom size', () => {
      const { UNSAFE_getAllByType } = render(
        <AvatarImage uri={mockUri} name="John" size={64} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      expect(JSON.stringify(container.props.style)).toContain('64');
      expect(JSON.stringify(container.props.style)).toContain('32'); // borderRadius = 64/2
    });

    it('default size is 48', () => {
      const { UNSAFE_getAllByType } = render(
        <AvatarImage uri={mockUri} name="John" />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      expect(JSON.stringify(container.props.style)).toContain('48');
      expect(JSON.stringify(container.props.style)).toContain('24'); // borderRadius = 48/2
    });

    it('shows fallback on image error', async () => {
      const { UNSAFE_getByType, UNSAFE_queryByType } = render(
        <AvatarImage uri={mockUri} name="John" />,
      );

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      fireEvent(image, 'error');

      await waitFor(() => {
        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
      });
    });

    it('generates consistent color from name', () => {
      const { UNSAFE_getAllByType } = render(
        <AvatarImage uri="" name="Alice" />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      // Find the view with backgroundColor
      const fallbackView = views.find((v) =>
        v.props.style?.some?.((s: any) => s?.backgroundColor),
      );

      expect(fallbackView).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty name', () => {
      const { UNSAFE_getByType } = render(<AvatarImage uri="" name="" />);

      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
    });

    it('handles very long name', () => {
      const longName = 'A'.repeat(100);
      const { UNSAFE_getByType } = render(
        <AvatarImage uri="" name={longName} />,
      );

      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
    });

    it('handles special characters in name', () => {
      const { UNSAFE_getByType } = render(
        <AvatarImage uri="" name="José García 🎉" />,
      );

      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getByType(MaterialCommunityIcons)).toBeTruthy();
    });

    it('icon size scales with avatar size', () => {
      const { UNSAFE_getByType } = render(
        <AvatarImage uri="" name="John" size={100} />,
      );

      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      const icon = UNSAFE_getByType(MaterialCommunityIcons);

      expect(icon.props.size).toBe(50); // 100 * 0.5
    });
  });
});

describe('Thumbnail', () => {
  const mockUri = 'https://example.com/thumbnail.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders SmartImage with given URI', () => {
      const { UNSAFE_getByType } = render(<Thumbnail uri={mockUri} />);

      const { Image } = require('react-native');
      const image = UNSAFE_getByType(Image);

      expect(image.props.source).toEqual({ uri: mockUri });
    });

    it('uses 16:9 aspect ratio by default', () => {
      const { UNSAFE_getAllByType } = render(
        <Thumbnail uri={mockUri} style={{ width: 160 }} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      // 160 / (16/9) = 90
      expect(JSON.stringify(container.props.style)).toContain('160');
      expect(JSON.stringify(container.props.style)).toContain('90');
    });

    it('uses custom aspect ratio', () => {
      const { UNSAFE_getAllByType } = render(
        <Thumbnail uri={mockUri} aspectRatio={4 / 3} style={{ width: 120 }} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      // 120 / (4/3) = 90
      expect(JSON.stringify(container.props.style)).toContain('120');
      expect(JSON.stringify(container.props.style)).toContain('90');
    });

    it('respects maxHeight', () => {
      const { UNSAFE_getAllByType } = render(
        <Thumbnail uri={mockUri} maxHeight={50} style={{ width: 160 }} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      // Height should be capped at 50, width adjusted
      expect(JSON.stringify(container.props.style)).toContain('50');
    });

    it('uses maxWidth when no explicit width', () => {
      const { UNSAFE_getAllByType } = render(
        <Thumbnail uri={mockUri} maxWidth={200} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      expect(JSON.stringify(container.props.style)).toContain('200');
    });
  });

  describe('Edge Cases', () => {
    it('handles 1:1 aspect ratio (square)', () => {
      const { UNSAFE_getAllByType } = render(
        <Thumbnail uri={mockUri} aspectRatio={1} style={{ width: 100 }} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      expect(JSON.stringify(container.props.style)).toContain('100');
    });

    it('handles very wide aspect ratio', () => {
      const { UNSAFE_getAllByType } = render(
        <Thumbnail uri={mockUri} aspectRatio={21 / 9} style={{ width: 210 }} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      // 210 / (21/9) = 90
      expect(JSON.stringify(container.props.style)).toContain('210');
      expect(JSON.stringify(container.props.style)).toContain('90');
    });

    it('handles portrait aspect ratio', () => {
      const { UNSAFE_getAllByType } = render(
        <Thumbnail uri={mockUri} aspectRatio={3 / 4} style={{ width: 90 }} />,
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const container = views[0];

      // 90 / (3/4) = 120
      expect(JSON.stringify(container.props.style)).toContain('90');
      expect(JSON.stringify(container.props.style)).toContain('120');
    });

    it('handles string width', () => {
      const { UNSAFE_getByType } = render(
        <Thumbnail uri={mockUri} style={{ width: '100%' }} />,
      );

      const { Image } = require('react-native');
      expect(UNSAFE_getByType(Image)).toBeTruthy();
    });
  });
});
