/**
 * Upload Service Tests (Simplified)
 * Tests for file validation, security, and upload tracking
 * Target Coverage: 70%+
 */

import * as FileSystem from 'expo-file-system';

// Mock dependencies BEFORE imports
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/services/supabaseStorageService', () => ({
  uploadFile: jest.fn(),
}));

// NOW import modules that depend on mocks
import { uploadService } from '@/services/uploadService';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

describe('uploadService - Basic Functionality', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock rate limit check (default: allowed)
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockGte = jest.fn().mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    supabase.from.mockReturnValue({
      select: mockSelect,
      insert: jest.fn().mockResolvedValue({ error: null }),
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ gte: mockGte });

    // Mock fetch for file info
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue({
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg',
      }),
    }) as unknown as { blob: () => Promise<{ size: number; type: string }> };

    // Mock FileSystem (still needed for some functions)
    FileSystem.getInfoAsync.mockResolvedValue({
      exists: true,
      size: 1024 * 1024,
      uri: 'file:///tmp/test.jpg',
      modificationTime: Date.now(),
      isDirectory: false,
    });
  });

  it('should have uploadImage function', () => {
    expect(uploadService.uploadImage).toBeDefined();
    expect(typeof uploadService.uploadImage).toBe('function');
  });

  it('should have uploadImages function', () => {
    expect(uploadService.uploadImages).toBeDefined();
    expect(typeof uploadService.uploadImages).toBe('function');
  });

  it('should reject upload when not authenticated', async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(
      uploadService.uploadImage('file:///tmp/test.jpg', { folder: 'avatars' }),
    ).rejects.toThrow('Not authenticated');
  });

  it('should check rate limits before upload', async () => {
    const storageService = require('@/services/supabaseStorageService');
    storageService.uploadFile.mockResolvedValue({
      url: 'https://example.com/test.jpg',
      path: 'test.jpg',
      error: null,
    });

    await uploadService.uploadImage('file:///tmp/test.jpg', {
      folder: 'avatars',
    });

    expect(supabase.from).toHaveBeenCalledWith('file_uploads');
  });

  it('should reject upload when rate limit exceeded', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockGte = jest.fn().mockResolvedValue({
      data: Array(10).fill({}),
      count: 10,
      error: null,
    });

    supabase.from.mockReturnValue({
      select: mockSelect,
      insert: jest.fn().mockResolvedValue({ error: null }),
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ gte: mockGte });

    await expect(
      uploadService.uploadImage('file:///tmp/test.jpg', { folder: 'avatars' }),
    ).rejects.toThrow('rate limit');
  });

  it('should track upload attempts', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockGte = jest.fn().mockResolvedValue({
      data: [],
      count: 0,
      error: null,
    });

    supabase.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ gte: mockGte });

    const storageService = require('@/services/supabaseStorageService');
    storageService.uploadFile.mockResolvedValue({
      url: 'https://example.com/test.jpg',
      path: 'test.jpg',
      error: null,
    });

    await uploadService.uploadImage('file:///tmp/test.jpg', {
      folder: 'avatars',
    });

    expect(mockInsert).toHaveBeenCalled();
  });

  it('should handle file not found', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('File not found'));

    await expect(
      uploadService.uploadImage('file:///tmp/missing.jpg', {
        folder: 'avatars',
      }),
    ).rejects.toThrow();
  });

  it('should reject files over size limit', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue({
        size: 5 * 1024 * 1024, // 5MB - over 2MB avatar limit
        type: 'image/jpeg',
      }),
    }) as unknown as { blob: () => Promise<{ size: number; type: string }> };

    await expect(
      uploadService.uploadImage('file:///tmp/large.jpg', { folder: 'avatars' }),
    ).rejects.toThrow();
  });

  it('should upload multiple images', async () => {
    const storageService = require('@/services/supabaseStorageService');
    let count = 0;
    storageService.uploadFile.mockImplementation(() => {
      count++;
      return Promise.resolve({
        url: `https://example.com/test-${count}.jpg`,
        path: `test-${count}.jpg`,
        error: null,
      });
    });

    const results = await uploadService.uploadImages(
      ['file:///tmp/1.jpg', 'file:///tmp/2.jpg'],
      { folder: 'moments' },
    );

    expect(results).toHaveLength(2);
    expect(results[0].url).toBeTruthy();
    expect(results[1].url).toBeTruthy();
  });

  it('should handle empty array in uploadImages', async () => {
    const results = await uploadService.uploadImages([], { folder: 'moments' });
    expect(results).toEqual([]);
  });

  it('should log errors appropriately', async () => {
    const storageService = require('@/services/supabaseStorageService');
    storageService.uploadFile.mockResolvedValue({
      url: null,
      path: null,
      error: new Error('Upload failed'),
    });

    await expect(
      uploadService.uploadImage('file:///tmp/test.jpg', { folder: 'avatars' }),
    ).rejects.toThrow();

    expect(logger.error).toHaveBeenCalled();
  });
});
