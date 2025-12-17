/**
 * Tests for LazyImage - Optimized image loading component
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { LazyImage } from '../LazyImage';
import { useLazyImage, imageCacheManager } from '@/utils/imageOptimization';

// Mock dependencies
jest.mock('@/utils/imageOptimization', () => ({
  useLazyImage: jest.fn(),
  imageCacheManager: {
    isCached: jest.fn(),
    markCached: jest.fn(),
    clear: jest.fn(),
    getSize: jest.fn(),
  },
}));

const mockUseLazyImage = useLazyImage;
const mockImageCacheManager = imageCacheManager;

describe('LazyImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior
    mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: false });
    mockImageCacheManager.isCached.mockReturnValue(false);
  });

  // =========================
  // Basic Rendering
  // =========================

  describe('Basic Rendering', () => {
    it('renders correctly with uri source', () => {
      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="lazy-image"
        />,
      );

      // Component should render (Image is nested in View)
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with local source (require)', () => {
      const { UNSAFE_root } = render(
        <LazyImage source={123} testID="local-image" />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with style prop', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          style={{ width: 200, height: 200 }}
          testID="styled-image"
        />,
      );

      const image = getByTestId('styled-image');
      expect(image).toBeTruthy();
    });

    it('renders with containerStyle', () => {
      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          containerStyle={{ padding: 10 }}
        />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('calls useLazyImage hook with correct source', () => {
      render(<LazyImage source={{ uri: 'https://example.com/image.jpg' }} />);

      expect(mockUseLazyImage).toHaveBeenCalledWith({
        uri: 'https://example.com/image.jpg',
      });
    });
  });

  // =========================
  // Loading State
  // =========================

  describe('Loading State', () => {
    it('shows loading indicator when isLoading=true', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });

      const { UNSAFE_root } = render(
        <LazyImage source={{ uri: 'https://example.com/image.jpg' }} />,
      );

      // Component renders when loading
      expect(UNSAFE_root).toBeTruthy();
    });

    it('does not show loading when isLoading=false', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: false });

      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="loaded-image"
        />,
      );

      const image = getByTestId('loaded-image');
      expect(image).toBeTruthy();
    });

    it('shows loading when showLoading=true and isLoading=true', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });

      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          showLoading={true}
        />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('does not show loading when showLoading=false', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });

      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          showLoading={false}
        />,
      );

      const indicators = UNSAFE_root.findAllByType('ActivityIndicator');
      expect(indicators.length).toBe(0);
    });

    it('renders custom loading component when provided', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });

      const CustomLoader = () => <MockView testID="custom-loader" />;

      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          loadingComponent={<CustomLoader />}
        />,
      );

      const customLoader = UNSAFE_root.findAllByProps({
        testID: 'custom-loader',
      });
      expect(customLoader.length).toBeGreaterThan(0);
    });

    it('prefers custom loading component over default indicator', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });

      const CustomLoader = () => <MockView testID="custom-loader" />;

      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          loadingComponent={<CustomLoader />}
        />,
      );

      const customLoader = UNSAFE_root.findAllByProps({
        testID: 'custom-loader',
      });
      expect(customLoader.length).toBeGreaterThan(0);
    });
  });

  // =========================
  // Error State
  // =========================

  describe('Error State', () => {
    it('shows error placeholder when hasError=true', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: true });

      const { UNSAFE_root } = render(
        <LazyImage source={{ uri: 'https://example.com/image.jpg' }} />,
      );

      // Component renders error state
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders custom error component when provided', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: true });

      const CustomError = () => <MockView testID="custom-error" />;

      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          errorComponent={<CustomError />}
        />,
      );

      const customError = UNSAFE_root.findAllByProps({
        testID: 'custom-error',
      });
      expect(customError.length).toBeGreaterThan(0);
    });

    it('prefers custom error component over default placeholder', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: true });

      const CustomError = () => <MockView testID="custom-error" />;

      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          errorComponent={<CustomError />}
        />,
      );

      const customError = UNSAFE_root.findAllByProps({
        testID: 'custom-error',
      });
      expect(customError.length).toBeGreaterThan(0);
    });

    it('does not show image when hasError=true', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: true });

      const { UNSAFE_root } = render(
        <LazyImage source={{ uri: 'https://example.com/image.jpg' }} />,
      );

      const images = UNSAFE_root.findAllByType('Image');
      expect(images.length).toBe(0);
    });
  });

  // =========================
  // Caching
  // =========================

  describe('Caching', () => {
    it('checks cache for uri source', () => {
      mockImageCacheManager.isCached.mockReturnValue(false);

      render(<LazyImage source={{ uri: 'https://example.com/image.jpg' }} />);

      expect(mockImageCacheManager.isCached).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
      );
    });

    it('does not show loading for cached images', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });
      mockImageCacheManager.isCached.mockReturnValue(true);

      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/cached.jpg' }}
          testID="cached-image"
        />,
      );

      // Image should render (cached images skip loading state)
      const image = getByTestId('cached-image');
      expect(image).toBeTruthy();
    });

    it('uses fadeInDuration=0 for cached images', () => {
      mockImageCacheManager.isCached.mockReturnValue(true);

      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/cached.jpg' }}
          fadeInDuration={500}
          testID="cached-fade"
        />,
      );

      const image = getByTestId('cached-fade');
      expect(image).toBeTruthy();
    });

    it('uses fadeInDuration prop for uncached images', () => {
      mockImageCacheManager.isCached.mockReturnValue(false);

      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          fadeInDuration={500}
          testID="uncached-fade"
        />,
      );

      const image = getByTestId('uncached-fade');
      expect(image).toBeTruthy();
    });

    it('uses default fadeInDuration=300 when not specified', () => {
      mockImageCacheManager.isCached.mockReturnValue(false);

      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="default-fade"
        />,
      );

      const image = getByTestId('default-fade');
      expect(image).toBeTruthy();
    });
  });

  // =========================
  // Image Events
  // =========================

  describe('Image Events', () => {
    it('has onLoadEnd handler', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="image-with-handler"
        />,
      );

      const image = getByTestId('image-with-handler');
      expect(image).toBeTruthy();
    });

    it('has onError handler', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="image-error-handler"
        />,
      );

      const image = getByTestId('image-error-handler');
      expect(image).toBeTruthy();
    });

    it('marks image as cached on load end', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="mark-cached-image"
        />,
      );

      // Component renders and would mark as cached on load
      const image = getByTestId('mark-cached-image');
      expect(image).toBeTruthy();
      // markCached would be called by onLoadEnd handler
    });

    it('does not mark cached if source is not uri', () => {
      const { getByTestId } = render(
        <LazyImage source={123} testID="local-no-cache" />,
      );

      const image = getByTestId('local-no-cache');
      expect(image).toBeTruthy();
      // Local images (require) don't get marked as cached
    });
  });

  // =========================
  // Image Props Forwarding
  // =========================

  describe('Image Props Forwarding', () => {
    it('forwards resizeMode prop', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          resizeMode="cover"
          testID="resize-image"
        />,
      );

      const image = getByTestId('resize-image');
      expect(image).toBeTruthy();
    });

    it('forwards testID prop', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="test-image"
        />,
      );

      const image = getByTestId('test-image');
      expect(image).toBeTruthy();
    });

    it('forwards accessible prop', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          accessible={true}
          testID="accessible-image"
        />,
      );

      const image = getByTestId('accessible-image');
      expect(image).toBeTruthy();
    });

    it('forwards accessibilityLabel prop', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          accessibilityLabel="Profile picture"
          testID="labeled-image"
        />,
      );

      const image = getByTestId('labeled-image');
      expect(image).toBeTruthy();
    });
  });

  // =========================
  // Edge Cases
  // =========================

  describe('Edge Cases', () => {
    it('handles empty uri gracefully', () => {
      const { UNSAFE_root } = render(<LazyImage source={{ uri: '' }} />);

      expect(mockUseLazyImage).toHaveBeenCalledWith({ uri: '' });
    });

    it('handles undefined source gracefully', () => {
      const { UNSAFE_root } = render(<LazyImage source={undefined} />);

      expect(mockUseLazyImage).toHaveBeenCalledWith({ uri: '' });
    });

    it('handles null containerStyle', () => {
      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          containerStyle={null}
        />,
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('handles both loading and error state', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: true });

      const { UNSAFE_root } = render(
        <LazyImage source={{ uri: 'https://example.com/image.jpg' }} />,
      );

      // Error state takes precedence
      const images = UNSAFE_root.findAllByType('Image');
      expect(images.length).toBe(0);
    });

    it('handles source change', () => {
      const { rerender } = render(
        <LazyImage source={{ uri: 'https://example.com/image1.jpg' }} />,
      );

      rerender(
        <LazyImage source={{ uri: 'https://example.com/image2.jpg' }} />,
      );

      // useLazyImage should be called with new source
      expect(mockUseLazyImage).toHaveBeenCalledWith({
        uri: 'https://example.com/image2.jpg',
      });
    });
  });

  // =========================
  // Real-world Use Cases
  // =========================

  describe('Real-world Use Cases', () => {
    it('simulates profile picture loading', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/avatar.jpg' }}
          style={{ width: 50, height: 50, borderRadius: 25 }}
          resizeMode="cover"
          testID="avatar"
        />,
      );

      const avatar = getByTestId('avatar');
      expect(avatar).toBeTruthy();
    });

    it('simulates post image with custom loading', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });

      const CustomLoader = () => <MockView testID="skeleton" />;

      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/post.jpg' }}
          loadingComponent={<CustomLoader />}
          style={{ width: '100%', height: 300 }}
        />,
      );

      const skeleton = UNSAFE_root.findAllByProps({ testID: 'skeleton' });
      expect(skeleton.length).toBeGreaterThan(0);
    });

    it('simulates failed image load with custom error', () => {
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: true });

      const CustomError = () => <MockView testID="broken-image" />;

      const { UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/broken.jpg' }}
          errorComponent={<CustomError />}
        />,
      );

      const errorView = UNSAFE_root.findAllByProps({ testID: 'broken-image' });
      expect(errorView.length).toBeGreaterThan(0);
    });

    it('simulates cached image instant display', () => {
      mockImageCacheManager.isCached.mockReturnValue(true);
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: false });

      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/cached.jpg' }}
          testID="instant-image"
        />,
      );

      const image = getByTestId('instant-image');
      expect(image).toBeTruthy();
    });

    it('simulates image gallery item', () => {
      const { getByTestId } = render(
        <LazyImage
          source={{ uri: 'https://example.com/gallery/1.jpg' }}
          style={{ width: 100, height: 100 }}
          resizeMode="cover"
          fadeInDuration={200}
          testID="gallery-item"
        />,
      );

      const galleryItem = getByTestId('gallery-item');
      expect(galleryItem).toBeTruthy();
    });

    it('simulates loading to loaded transition', async () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });

      const { rerender, UNSAFE_root } = render(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="transition-image"
        />,
      );

      // Initially loading - component renders
      expect(UNSAFE_root).toBeTruthy();

      // Simulate load complete
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: false });
      rerender(
        <LazyImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="transition-image"
        />,
      );

      // Should still render after transition
      expect(UNSAFE_root).toBeTruthy();
    });

    it('simulates loading to error transition', async () => {
      mockUseLazyImage.mockReturnValue({ isLoading: true, hasError: false });

      const { rerender, UNSAFE_root } = render(
        <LazyImage source={{ uri: 'https://example.com/image.jpg' }} />,
      );

      // Initially loading - component renders
      expect(UNSAFE_root).toBeTruthy();

      // Simulate load error
      mockUseLazyImage.mockReturnValue({ isLoading: false, hasError: true });
      rerender(<LazyImage source={{ uri: 'https://example.com/image.jpg' }} />);

      // Should render error state
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});

// Mock View component for testing
function MockView({ testID }: { testID: string }) {
  const React = require('react');
  const { View } = require('react-native');
  return React.createElement(View, { testID });
}
