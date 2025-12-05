/**
 * useImageUpload Hook Tests
 * Testing image upload functionality
 */

import { renderHook, act } from '@testing-library/react-native';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock ToastContext
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
};

jest.mock('../../context/ToastContext', () => ({
  useToast: () => mockToast,
}));

import { useImageUpload } from '../useImageUpload';

describe('useImageUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockReset();
  });

  const mockImage = {
    uri: 'file://path/to/image.jpg',
    fileName: 'test-image.jpg',
    mimeType: 'image/jpeg',
    width: 800,
    height: 600,
  };

  const uploadUrl = 'https://api.example.com/upload';

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toEqual({
      loaded: 0,
      total: 0,
      percentage: 0,
    });
    expect(result.current.error).toBeNull();
    expect(result.current.uploadedUrl).toBeNull();
  });

  it('should have uploadImage and reset functions', () => {
    const { result } = renderHook(() => useImageUpload());

    expect(typeof result.current.uploadImage).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should set isUploading to true during upload', async () => {
    mockedAxios.post.mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves - simulates pending upload
        }),
    );

    const { result } = renderHook(() => useImageUpload());

    act(() => {
      result.current.uploadImage(mockImage, uploadUrl);
    });

    expect(result.current.isUploading).toBe(true);
  });

  it('should upload image successfully', async () => {
    const mockUrl = 'https://cdn.example.com/uploaded-image.jpg';
    mockedAxios.post.mockResolvedValue({ data: { url: mockUrl } });

    const { result } = renderHook(() => useImageUpload());

    let uploadedUrl: string | undefined;
    await act(async () => {
      uploadedUrl = await result.current.uploadImage(mockImage, uploadUrl);
    });

    expect(uploadedUrl).toBe(mockUrl);
    expect(result.current.uploadedUrl).toBe(mockUrl);
    expect(result.current.isUploading).toBe(false);
    expect(mockToast.success).toHaveBeenCalledWith(
      'Image uploaded successfully',
    );
  });

  it('should handle secure_url response', async () => {
    const mockUrl = 'https://res.cloudinary.com/uploaded.jpg';
    mockedAxios.post.mockResolvedValue({ data: { secure_url: mockUrl } });

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await result.current.uploadImage(mockImage, uploadUrl);
    });

    expect(result.current.uploadedUrl).toBe(mockUrl);
  });

  it('should handle upload error', async () => {
    const mockError = new Error('Network error');
    mockedAxios.post.mockRejectedValue(mockError);

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      try {
        await result.current.uploadImage(mockImage, uploadUrl);
      } catch {
        // Expected error
      }
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.uploadedUrl).toBeNull();
    expect(mockToast.error).toHaveBeenCalledWith('Image upload failed');
  });

  it('should call onSuccess callback on successful upload', async () => {
    const mockUrl = 'https://cdn.example.com/image.jpg';
    mockedAxios.post.mockResolvedValue({ data: { url: mockUrl } });

    const onSuccess = jest.fn();

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await result.current.uploadImage(mockImage, uploadUrl, { onSuccess });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockUrl);
  });

  it('should call onError callback on failed upload', async () => {
    const mockError = new Error('Upload failed');
    mockedAxios.post.mockRejectedValue(mockError);

    const onError = jest.fn();

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      try {
        await result.current.uploadImage(mockImage, uploadUrl, { onError });
      } catch {
        // Expected error
      }
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should reset state correctly', async () => {
    const mockUrl = 'https://cdn.example.com/image.jpg';
    mockedAxios.post.mockResolvedValue({ data: { url: mockUrl } });

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await result.current.uploadImage(mockImage, uploadUrl);
    });

    expect(result.current.uploadedUrl).toBe(mockUrl);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toEqual({
      loaded: 0,
      total: 0,
      percentage: 0,
    });
    expect(result.current.error).toBeNull();
    expect(result.current.uploadedUrl).toBeNull();
  });

  it('should create FormData with correct structure', async () => {
    mockedAxios.post.mockResolvedValue({ data: { url: 'test' } });

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await result.current.uploadImage(mockImage, uploadUrl);
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      uploadUrl,
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  });

  it('should handle non-Error objects in catch', async () => {
    mockedAxios.post.mockRejectedValue('String error');

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      try {
        await result.current.uploadImage(mockImage, uploadUrl);
      } catch {
        // Expected error
      }
    });

    expect(result.current.error?.message).toBe('Upload failed');
  });

  it('should track upload progress', async () => {
    let progressCallback:
      | ((event: { loaded: number; total: number }) => void)
      | undefined;

    mockedAxios.post.mockImplementation((_url, _data, config) => {
      progressCallback = config?.onUploadProgress;
      return Promise.resolve({ data: { url: 'test' } });
    });

    const onProgress = jest.fn();
    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await result.current.uploadImage(mockImage, uploadUrl, { onProgress });
    });

    // Simulate progress events
    if (progressCallback) {
      progressCallback({ loaded: 50, total: 100 });
    }

    expect(onProgress).toHaveBeenCalled();
  });
});
