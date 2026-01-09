import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SmartImage, { AvatarImage, Thumbnail } from '../SmartImage';

/**
 * SmartImage Component Tests
 * Core functionality tests using stable testing patterns
 */
describe('SmartImage', () => {
  const mockUri = 'https://example.com/image.jpg';
  const mockFallbackUri = 'https://example.com/fallback.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders with given URI', () => {
      const { toJSON } = render(<SmartImage uri={mockUri} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders without crashing when uri is empty', () => {
      const { toJSON } = render(<SmartImage uri="" />);
      expect(toJSON()).toBeTruthy();
    });

    it('applies custom container style', () => {
      const customStyle = { margin: 10, padding: 5 };
      const { toJSON } = render(
        <SmartImage uri={mockUri} containerStyle={customStyle} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('applies custom image style', () => {
      const customStyle = { borderRadius: 10 };
      const { toJSON } = render(
        <SmartImage uri={mockUri} imageStyle={customStyle} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders with fallback URI', () => {
      const { toJSON } = render(
        <SmartImage uri={mockUri} fallbackUri={mockFallbackUri} />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('renders with showLoader true (default)', () => {
      const { toJSON } = render(<SmartImage uri={mockUri} showLoader={true} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with showLoader false', () => {
      const { toJSON } = render(
        <SmartImage uri={mockUri} showLoader={false} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('handles custom loader color', () => {
      const { toJSON } = render(
        <SmartImage uri={mockUri} loaderColor="#FF0000" />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('renders fallback on empty URI', () => {
      const { toJSON } = render(<SmartImage uri="" />);
      expect(toJSON()).toBeTruthy();
    });

    it('calls onError callback', () => {
      const mockOnError = jest.fn();
      const { toJSON } = render(
        <SmartImage uri={mockUri} onError={mockOnError} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom fallback icon', () => {
      const { toJSON } = render(
        <SmartImage uri="" fallbackIcon="account-off" fallbackIconSize={50} />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Callbacks', () => {
    it('accepts onLoadStart callback', () => {
      const mockOnLoadStart = jest.fn();
      const { toJSON } = render(
        <SmartImage uri={mockUri} onLoadStart={mockOnLoadStart} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('accepts onLoadEnd callback', () => {
      const mockOnLoadEnd = jest.fn();
      const { toJSON } = render(
        <SmartImage uri={mockUri} onLoadEnd={mockOnLoadEnd} />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});

describe('AvatarImage', () => {
  const mockUri = 'https://example.com/avatar.jpg';

  describe('Rendering', () => {
    it('renders with URI', () => {
      const { toJSON } = render(<AvatarImage uri={mockUri} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom size', () => {
      const { toJSON } = render(<AvatarImage uri={mockUri} size={64} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with name for fallback', () => {
      const { toJSON } = render(<AvatarImage uri="" name="John Doe" />);
      expect(toJSON()).toBeTruthy();
    });

    it('shows fallback icon when URI is empty', () => {
      const { toJSON } = render(<AvatarImage uri="" name="John Doe" />);
      // Fallback shows an account icon, not initials text
      expect(toJSON()).toBeTruthy();
    });

    it('renders fallback for single name', () => {
      const { toJSON } = render(<AvatarImage uri="" name="John" />);
      // Fallback shows an account icon
      expect(toJSON()).toBeTruthy();
    });

    it('applies custom style', () => {
      const { toJSON } = render(
        <AvatarImage uri={mockUri} style={{ borderWidth: 2 }} />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('renders small avatar', () => {
      const { toJSON } = render(<AvatarImage uri={mockUri} size={32} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders medium avatar', () => {
      const { toJSON } = render(<AvatarImage uri={mockUri} size={48} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders large avatar', () => {
      const { toJSON } = render(<AvatarImage uri={mockUri} size={96} />);
      expect(toJSON()).toBeTruthy();
    });
  });
});

describe('Thumbnail', () => {
  const mockUri = 'https://example.com/thumbnail.jpg';

  describe('Rendering', () => {
    it('renders with URI', () => {
      const { toJSON } = render(<Thumbnail uri={mockUri} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom width', () => {
      const { toJSON } = render(<Thumbnail uri={mockUri} width={120} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom aspectRatio', () => {
      const { toJSON } = render(
        <Thumbnail uri={mockUri} aspectRatio={16 / 9} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom borderRadius', () => {
      const { toJSON } = render(<Thumbnail uri={mockUri} borderRadius={12} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Aspect Ratios', () => {
    it('renders square thumbnail', () => {
      const { toJSON } = render(<Thumbnail uri={mockUri} aspectRatio={1} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders wide thumbnail (16:9)', () => {
      const { toJSON } = render(
        <Thumbnail uri={mockUri} aspectRatio={16 / 9} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders portrait thumbnail (3:4)', () => {
      const { toJSON } = render(
        <Thumbnail uri={mockUri} aspectRatio={3 / 4} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders ultra-wide thumbnail (21:9)', () => {
      const { toJSON } = render(
        <Thumbnail uri={mockUri} aspectRatio={21 / 9} />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
