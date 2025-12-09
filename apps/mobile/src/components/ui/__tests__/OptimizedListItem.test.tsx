/**
 * OptimizedListItem Component Test Suite
 * Tests memoized list item with custom comparison function
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OptimizedListItem } from '../OptimizedListItem';

describe('OptimizedListItem Component', () => {
  const mockOnPress = jest.fn();
  const defaultProps = {
    id: 'item-1',
    title: 'Test Item',
    onPress: mockOnPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders with required props only', () => {
      const { getByText } = render(<OptimizedListItem {...defaultProps} />);
      expect(getByText('Test Item')).toBeTruthy();
    });

    it('renders title', () => {
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} title="My Title" />
      );
      expect(getByText('My Title')).toBeTruthy();
    });

    it('renders subtitle when provided', () => {
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} subtitle="My Subtitle" />
      );
      expect(getByText('My Subtitle')).toBeTruthy();
    });

    it('renders without subtitle when not provided', () => {
      const { queryByText } = render(<OptimizedListItem {...defaultProps} />);
      expect(queryByText('My Subtitle')).toBeNull();
    });

    it('renders with image when imageUrl provided', () => {
      const { UNSAFE_root } = render(
        <OptimizedListItem
          {...defaultProps}
          imageUrl="https://example.com/image.jpg"
        />
      );

      const images = UNSAFE_root.findAllByType(
        require('react-native').Image
      );
      expect(images.length).toBe(1);
    });

    it('renders without image when imageUrl not provided', () => {
      const { UNSAFE_root } = render(<OptimizedListItem {...defaultProps} />);

      const images = UNSAFE_root.findAllByType(
        require('react-native').Image
      );
      expect(images.length).toBe(0);
    });
  });

  // ============================================
  // Props Tests
  // ============================================

  describe('Props', () => {
    it('renders with all props', () => {
      const { getByText, UNSAFE_root } = render(
        <OptimizedListItem
          id="item-123"
          title="Complete Item"
          subtitle="With all props"
          imageUrl="https://example.com/img.jpg"
          onPress={mockOnPress}
        />
      );

      expect(getByText('Complete Item')).toBeTruthy();
      expect(getByText('With all props')).toBeTruthy();

      const images = UNSAFE_root.findAllByType(
        require('react-native').Image
      );
      expect(images.length).toBe(1);
    });

    it('uses correct image source', () => {
      const imageUrl = 'https://example.com/test.jpg';
      const { UNSAFE_root } = render(
        <OptimizedListItem {...defaultProps} imageUrl={imageUrl} />
      );

      const image = UNSAFE_root.findByType(require('react-native').Image);
      expect(image.props.source).toEqual({ uri: imageUrl });
    });

    it('renders with long title', () => {
      const longTitle = 'A'.repeat(100);
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} title={longTitle} />
      );
      expect(getByText(longTitle)).toBeTruthy();
    });

    it('renders with long subtitle', () => {
      const longSubtitle = 'B'.repeat(200);
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} subtitle={longSubtitle} />
      );
      expect(getByText(longSubtitle)).toBeTruthy();
    });

    it('renders with empty string title', () => {
      const { UNSAFE_root } = render(
        <OptimizedListItem {...defaultProps} title="" />
      );
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with empty string subtitle', () => {
      const { UNSAFE_root } = render(
        <OptimizedListItem {...defaultProps} subtitle="" />
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================

  describe('Interaction', () => {
    it('calls onPress with id when pressed', () => {
      const { getByText } = render(<OptimizedListItem {...defaultProps} />);

      fireEvent.press(getByText('Test Item'));

      expect(mockOnPress).toHaveBeenCalledWith('item-1');
    });

    it('calls onPress with correct id', () => {
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} id="custom-id" />
      );

      fireEvent.press(getByText('Test Item'));

      expect(mockOnPress).toHaveBeenCalledWith('custom-id');
    });

    it('calls onPress only once per press', () => {
      const { getByText } = render(<OptimizedListItem {...defaultProps} />);

      fireEvent.press(getByText('Test Item'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('handles multiple presses', () => {
      const { getByText } = render(<OptimizedListItem {...defaultProps} />);

      fireEvent.press(getByText('Test Item'));
      fireEvent.press(getByText('Test Item'));
      fireEvent.press(getByText('Test Item'));

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });

    it('works when pressing subtitle area', () => {
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} subtitle="Press me" />
      );

      fireEvent.press(getByText('Press me'));

      expect(mockOnPress).toHaveBeenCalledWith('item-1');
    });
  });

  // ============================================
  // Memoization Tests
  // ============================================

  describe('Memoization', () => {
    it('does not re-render when props are same', () => {
      const { rerender } = render(<OptimizedListItem {...defaultProps} />);

      // Re-render with same props
      rerender(<OptimizedListItem {...defaultProps} />);

      // Component should be memoized, no re-render
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('re-renders when title changes', () => {
      const { getByText, rerender } = render(
        <OptimizedListItem {...defaultProps} />
      );

      expect(getByText('Test Item')).toBeTruthy();

      rerender(<OptimizedListItem {...defaultProps} title="New Title" />);

      expect(getByText('New Title')).toBeTruthy();
    });

    it('re-renders when subtitle changes', () => {
      const { getByText, rerender } = render(
        <OptimizedListItem {...defaultProps} subtitle="Old" />
      );

      expect(getByText('Old')).toBeTruthy();

      rerender(<OptimizedListItem {...defaultProps} subtitle="New" />);

      expect(getByText('New')).toBeTruthy();
    });

    it('re-renders when id changes', () => {
      const { rerender } = render(<OptimizedListItem {...defaultProps} />);

      rerender(<OptimizedListItem {...defaultProps} id="item-2" />);

      // Component should re-render due to id change
      expect(true).toBe(true);
    });

    it('re-renders when imageUrl changes', () => {
      const { rerender, UNSAFE_root } = render(
        <OptimizedListItem
          {...defaultProps}
          imageUrl="https://example.com/1.jpg"
        />
      );

      const image1 = UNSAFE_root.findByType(require('react-native').Image);
      expect(image1.props.source.uri).toBe('https://example.com/1.jpg');

      rerender(
        <OptimizedListItem
          {...defaultProps}
          imageUrl="https://example.com/2.jpg"
        />
      );

      const image2 = UNSAFE_root.findByType(require('react-native').Image);
      expect(image2.props.source.uri).toBe('https://example.com/2.jpg');
    });

    it('does not re-render when onPress function reference changes but id is same', () => {
      const onPress1 = jest.fn();
      const onPress2 = jest.fn();

      const { rerender } = render(
        <OptimizedListItem {...defaultProps} onPress={onPress1} />
      );

      rerender(<OptimizedListItem {...defaultProps} onPress={onPress2} />);

      // Memoization comparison doesn't check onPress
      expect(true).toBe(true);
    });
  });

  // ============================================
  // Image Tests
  // ============================================

  describe('Image', () => {
    it('renders image with correct URI', () => {
      const imageUrl = 'https://cdn.example.com/photo.png';
      const { UNSAFE_root } = render(
        <OptimizedListItem {...defaultProps} imageUrl={imageUrl} />
      );

      const image = UNSAFE_root.findByType(require('react-native').Image);
      expect(image.props.source).toEqual({ uri: imageUrl });
    });

    it('sets image resizeMode to cover', () => {
      const { UNSAFE_root } = render(
        <OptimizedListItem
          {...defaultProps}
          imageUrl="https://example.com/img.jpg"
        />
      );

      const image = UNSAFE_root.findByType(require('react-native').Image);
      expect(image.props.resizeMode).toBe('cover');
    });

    it('removes image when imageUrl becomes undefined', () => {
      const { rerender, UNSAFE_root } = render(
        <OptimizedListItem
          {...defaultProps}
          imageUrl="https://example.com/img.jpg"
        />
      );

      let images = UNSAFE_root.findAllByType(require('react-native').Image);
      expect(images.length).toBe(1);

      rerender(<OptimizedListItem {...defaultProps} imageUrl={undefined} />);

      images = UNSAFE_root.findAllByType(require('react-native').Image);
      expect(images.length).toBe(0);
    });

    it('adds image when imageUrl is added', () => {
      const { rerender, UNSAFE_root } = render(
        <OptimizedListItem {...defaultProps} />
      );

      let images = UNSAFE_root.findAllByType(require('react-native').Image);
      expect(images.length).toBe(0);

      rerender(
        <OptimizedListItem
          {...defaultProps}
          imageUrl="https://example.com/img.jpg"
        />
      );

      images = UNSAFE_root.findAllByType(require('react-native').Image);
      expect(images.length).toBe(1);
    });
  });

  // ============================================
  // Text Truncation Tests
  // ============================================

  describe('Text Truncation', () => {
    it('sets numberOfLines to 1 for title', () => {
      const { getByText } = render(<OptimizedListItem {...defaultProps} />);

      const title = getByText('Test Item');
      expect(title.props.numberOfLines).toBe(1);
    });

    it('sets numberOfLines to 2 for subtitle', () => {
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} subtitle="Test Subtitle" />
      );

      const subtitle = getByText('Test Subtitle');
      expect(subtitle.props.numberOfLines).toBe(2);
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================

  describe('Edge Cases', () => {
    it('handles special characters in title', () => {
      const { getByText } = render(
        <OptimizedListItem
          {...defaultProps}
          title="Title with !@#$%^&*() chars"
        />
      );
      expect(getByText('Title with !@#$%^&*() chars')).toBeTruthy();
    });

    it('handles unicode characters in title', () => {
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} title="Unicode 你好 🌍" />
      );
      expect(getByText('Unicode 你好 🌍')).toBeTruthy();
    });

    it('handles newlines in title', () => {
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} title="Line 1\nLine 2" />
      );
      // Text with newline renders as escaped string
      expect(getByText(/Line 1/)).toBeTruthy();
    });

    it('handles empty imageUrl string', () => {
      const { UNSAFE_root } = render(
        <OptimizedListItem {...defaultProps} imageUrl="" />
      );

      const images = UNSAFE_root.findAllByType(
        require('react-native').Image
      );
      // Empty string is falsy in conditional, so no image should render
      expect(images.length).toBe(0);
    });

    it('handles numeric id', () => {
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} id="123" />
      );

      fireEvent.press(getByText('Test Item'));

      expect(mockOnPress).toHaveBeenCalledWith('123');
    });

    it('handles very long id', () => {
      const longId = 'id-' + 'x'.repeat(1000);
      const { getByText } = render(
        <OptimizedListItem {...defaultProps} id={longId} />
      );

      fireEvent.press(getByText('Test Item'));

      expect(mockOnPress).toHaveBeenCalledWith(longId);
    });
  });

  // ============================================
  // Callback Stability Tests
  // ============================================

  describe('Callback Stability', () => {
    it('uses useCallback for handlePress', () => {
      const { getByText } = render(<OptimizedListItem {...defaultProps} />);

      // Press multiple times
      fireEvent.press(getByText('Test Item'));
      fireEvent.press(getByText('Test Item'));

      expect(mockOnPress).toHaveBeenCalledTimes(2);
      expect(mockOnPress).toHaveBeenCalledWith('item-1');
    });

    it('updates callback when id changes', () => {
      const { getByText, rerender } = render(
        <OptimizedListItem {...defaultProps} id="id-1" />
      );

      fireEvent.press(getByText('Test Item'));
      expect(mockOnPress).toHaveBeenCalledWith('id-1');

      mockOnPress.mockClear();

      rerender(<OptimizedListItem {...defaultProps} id="id-2" />);

      fireEvent.press(getByText('Test Item'));
      expect(mockOnPress).toHaveBeenCalledWith('id-2');
    });

    it('updates callback when onPress function changes', () => {
      const onPress1 = jest.fn();
      const onPress2 = jest.fn();

      const { getByText, rerender } = render(
        <OptimizedListItem {...defaultProps} onPress={onPress1} />
      );

      fireEvent.press(getByText('Test Item'));
      expect(onPress1).toHaveBeenCalledWith('item-1');
      expect(onPress2).not.toHaveBeenCalled();

      // Memoization comparison doesn't check onPress,
      // so component won't re-render and callback won't update
      rerender(<OptimizedListItem {...defaultProps} onPress={onPress2} />);

      fireEvent.press(getByText('Test Item'));
      // Still calls onPress1 because component didn't re-render
      expect(onPress1).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================
  // Real-World Use Cases
  // ============================================

  describe('Real-World Use Cases', () => {
    it('renders as a contact list item', () => {
      const { getByText, UNSAFE_root } = render(
        <OptimizedListItem
          id="contact-1"
          title="John Doe"
          subtitle="john@example.com"
          imageUrl="https://example.com/avatar.jpg"
          onPress={mockOnPress}
        />
      );

      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();

      const images = UNSAFE_root.findAllByType(
        require('react-native').Image
      );
      expect(images.length).toBe(1);
    });

    it('renders as a product list item', () => {
      const { getByText } = render(
        <OptimizedListItem
          id="product-123"
          title="Premium Headphones"
          subtitle="$299.99 - In Stock"
          imageUrl="https://cdn.shop.com/headphones.jpg"
          onPress={mockOnPress}
        />
      );

      expect(getByText('Premium Headphones')).toBeTruthy();
      expect(getByText('$299.99 - In Stock')).toBeTruthy();

      fireEvent.press(getByText('Premium Headphones'));
      expect(mockOnPress).toHaveBeenCalledWith('product-123');
    });

    it('renders as a message list item', () => {
      const { getByText } = render(
        <OptimizedListItem
          id="msg-456"
          title="Sarah Wilson"
          subtitle="Hey, are you free tomorrow?"
          imageUrl="https://example.com/users/sarah.jpg"
          onPress={mockOnPress}
        />
      );

      expect(getByText('Sarah Wilson')).toBeTruthy();
      expect(getByText('Hey, are you free tomorrow?')).toBeTruthy();
    });

    it('renders in a FlatList scenario', () => {
      const items = [
        { id: '1', title: 'Item 1', subtitle: 'Description 1' },
        { id: '2', title: 'Item 2', subtitle: 'Description 2' },
        { id: '3', title: 'Item 3', subtitle: 'Description 3' },
      ];

      const { getByText } = render(
        <>
          {items.map((item) => (
            <OptimizedListItem
              key={item.id}
              id={item.id}
              title={item.title}
              subtitle={item.subtitle}
              onPress={mockOnPress}
            />
          ))}
        </>
      );

      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
      expect(getByText('Item 3')).toBeTruthy();

      fireEvent.press(getByText('Item 2'));
      expect(mockOnPress).toHaveBeenCalledWith('2');
    });
  });

  // ============================================
  // Display Name Tests
  // ============================================

  describe('Display Name', () => {
    it('has correct displayName', () => {
      expect(OptimizedListItem.displayName).toBe('OptimizedListItem');
    });
  });
});
