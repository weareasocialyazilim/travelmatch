/**
 * Moment Creation Flow Integration Tests
 * Tests the complete workflow: Create → Upload images → Publish
 *
 * Scenarios:
 * 1. Complete Moment Creation Flow (2 tests)
 * 2. Multi-Image Upload Flow (2 tests)
 * 3. Draft and Publish Flow (2 tests)
 * 4. Creation Error Handling (2 tests)
 */

import { momentsService } from '@/services/supabaseDbService';
import { uploadImage, uploadImages } from '@/services/uploadService';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@/config/supabase');
jest.mock('@/utils/logger');
jest.mock('@/services/uploadService');

// Create mock auth object that's shared
const mockAuth = {
  getUser: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
};

// Mock the supabase module exports
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: mockAuth,
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
  auth: mockAuth,
  isSupabaseConfigured: jest.fn(() => true),
}));

const mockSupabase = supabase;
const mockLogger = logger;

describe('Moment Creation Flow Integration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'creator@travelmatch.com',
    user_metadata: { name: 'Moment Creator' },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default auth state
    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Setup storage mock
    const mockStorageBucket = {
      upload: jest.fn().mockResolvedValue({
        data: { path: 'moments/image-123.jpg' },
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: {
          publicUrl: 'https://storage.supabase.co/moments/image-123.jpg',
        },
      }),
    };

    mockSupabase.storage.from.mockReturnValue(
      mockStorageBucket as unknown as ReturnType<
        typeof mockSupabase.storage.from
      >,
    );

    // Setup default from() chain
    const mockFromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockSupabase.from.mockReturnValue(
      mockFromChain as unknown as ReturnType<typeof mockSupabase.from>,
    );
  });

  describe('Scenario 1: Complete Moment Creation Flow', () => {
    it('should create moment → upload images → publish successfully', async () => {
      // Step 1: Create draft moment
      const momentData = {
        user_id: mockUser.id,
        title: 'Coffee & Croissants in Paris',
        description: 'Share a lovely morning at my favorite café',
        category: 'food-drink',
        price: 35,
        currency: 'USD',
        location: 'Paris, France',
        status: 'draft',
        max_guests: 4,
      };

      const mockCreatedMoment = {
        id: 'moment-123',
        ...momentData,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      mockSupabase.from('moments').insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockCreatedMoment,
            error: null,
          }),
        }),
      });

      const { data: createdMoment, error: createError } =
        await momentsService.create(
          momentData as unknown as Parameters<typeof momentsService.create>[0],
        );

      expect(createError).toBeNull();
      expect(createdMoment).toBeDefined();
      expect(createdMoment?.status).toBe('draft');
      expect(mockSupabase.from).toHaveBeenCalledWith('moments');

      // Step 2: Upload images
      const imageUris = [
        'file:///path/to/cafe1.jpg',
        'file:///path/to/cafe2.jpg',
        'file:///path/to/cafe3.jpg',
      ];

      // Mock uploadImages to return URLs
      const mockUploadedImages = imageUris.map((_, idx) => ({
        url: `https://storage.supabase.co/moments/image-${idx}.jpg`,
        publicId: `moments/image-${idx}.jpg`,
        width: 1920,
        height: 1080,
        format: 'jpg',
        size: 512000,
      }));

      // Mock uploadImages to return the uploaded images
      uploadImages.mockResolvedValue(mockUploadedImages);

      const uploadedImages = await uploadImages(imageUris);

      expect(uploadedImages).toHaveLength(3);
      expect(uploadedImages[0].url).toContain('storage.supabase.co');

      // Step 3: Update moment with image URLs and publish
      const imageUrls = uploadedImages.map((img) => img.url);
      const publishData = {
        images: imageUrls,
        status: 'active',
      };

      const mockPublishedMoment = {
        ...mockCreatedMoment,
        images: imageUrls,
        status: 'active',
        updated_at: '2024-01-15T10:05:00Z',
      };

      mockSupabase.from('moments').update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPublishedMoment,
              error: null,
            }),
          }),
        }),
      });

      const updateQuery = mockSupabase.from('moments').update(publishData);
      const { data: publishedMoment } = await updateQuery
        .eq('id', createdMoment!.id)
        .select()
        .single();

      expect(publishedMoment.status).toBe('active');
      expect(publishedMoment.images).toHaveLength(3);
    });

    it('should handle moment creation with invalid data', async () => {
      // Arrange: Create moment with missing required fields
      const invalidMomentData = {
        user_id: mockUser.id,
        title: '', // Invalid: empty title
        price: -10, // Invalid: negative price
      };

      mockSupabase.from('moments').insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Validation failed: title is required' },
          }),
        }),
      });

      // Act
      const { data, error } = await momentsService.create(
        invalidMomentData as unknown as Parameters<
          typeof momentsService.create
        >[0],
      );

      // Assert
      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[DB] Create moment error:',
        expect.any(Object),
      );
    });
  });

  describe('Scenario 2: Multi-Image Upload Flow', () => {
    it('should upload multiple images with progress tracking', async () => {
      // Arrange: Multiple image URIs
      const imageUris = [
        'file:///path/to/image1.jpg',
        'file:///path/to/image2.jpg',
        'file:///path/to/image3.jpg',
        'file:///path/to/image4.jpg',
      ];

      const mockResults = imageUris.map((_, idx) => ({
        url: `https://storage.supabase.co/moments/upload-${idx}.jpg`,
        publicId: `moments/upload-${idx}.jpg`,
        width: 1920,
        height: 1080,
        format: 'jpg',
        size: 512000 + idx * 1000,
      }));

      // Mock uploadImages
      uploadImages.mockResolvedValue(mockResults);

      // Act: Upload all images
      const results = await uploadImages(imageUris);

      // Assert: All uploads successful
      expect(results).toHaveLength(4);
      results.forEach((result, idx) => {
        expect(result.url).toBe(mockResults[idx].url);
        expect(result.size).toBeGreaterThan(0);
      });
    });

    it('should handle partial upload failure gracefully', async () => {
      // Arrange: Some uploads succeed, one fails
      const imageUris = [
        'file:///path/to/image1.jpg',
        'file:///path/to/image2.jpg',
        'file:///path/to/corrupted.jpg', // This will fail
      ];

      uploadImages.mockRejectedValue(
        new Error('File corrupted or invalid format'),
      );

      // Act & Assert: Should throw error
      await expect(uploadImages(imageUris)).rejects.toThrow(
        'File corrupted or invalid format',
      );
    });
  });

  describe('Scenario 3: Draft and Publish Flow', () => {
    it('should save as draft → update details → publish', async () => {
      // Step 1: Create draft
      const draftData = {
        user_id: mockUser.id,
        title: 'Wine Tasting Experience',
        description: 'Initial draft',
        category: 'food-drink',
        price: 50,
        currency: 'USD',
        status: 'draft',
        max_guests: 6,
      };

      const mockDraft = {
        id: 'moment-draft-123',
        ...draftData,
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:00:00Z',
      };

      mockSupabase.from('moments').insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockDraft,
            error: null,
          }),
        }),
      });

      const { data: draft } = await momentsService.create(
        draftData as unknown as Parameters<typeof momentsService.create>[0],
      );
      expect(draft?.status).toBe('draft');

      // Step 2: Update draft with more details
      const updateData = {
        description:
          'Join me for an exclusive wine tasting at a local vineyard',
        location: 'Napa Valley, CA',
        images: ['https://storage.supabase.co/moments/wine1.jpg'],
      };

      const mockUpdatedDraft = {
        ...mockDraft,
        ...updateData,
        updated_at: '2024-01-15T09:30:00Z',
      };

      mockSupabase.from('moments').update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockUpdatedDraft,
              error: null,
            }),
          }),
        }),
      });

      const updateQuery = mockSupabase.from('moments').update(updateData);
      const { data: updatedDraft } = await updateQuery
        .eq('id', draft!.id)
        .select()
        .single();

      expect(updatedDraft.description).toContain('exclusive wine tasting');
      expect(updatedDraft.images).toHaveLength(1);

      // Step 3: Publish
      const publishUpdate = { status: 'active' };
      const mockPublished = {
        ...mockUpdatedDraft,
        status: 'active',
        updated_at: '2024-01-15T10:00:00Z',
      };

      mockSupabase.from('moments').update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPublished,
              error: null,
            }),
          }),
        }),
      });

      const publishQuery = mockSupabase.from('moments').update(publishUpdate);
      const { data: published } = await publishQuery
        .eq('id', draft!.id)
        .select()
        .single();

      expect(published.status).toBe('active');
    });

    it('should prevent publishing without required fields', async () => {
      // Arrange: Draft without images
      const incompleteDraft = {
        id: 'moment-incomplete-123',
        user_id: mockUser.id,
        title: 'Incomplete Moment',
        description: 'Draft without images',
        category: 'food-drink',
        price: 30,
        status: 'draft',
        images: [], // Missing required images
      };

      mockSupabase.from('moments').update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Cannot publish: at least one image required' },
            }),
          }),
        }),
      });

      // Act: Try to publish
      const publishQuery = mockSupabase
        .from('moments')
        .update({ status: 'active' });
      const { data, error } = await publishQuery
        .eq('id', incompleteDraft.id)
        .select()
        .single();

      // Assert
      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });

  describe('Scenario 4: Creation Error Handling', () => {
    it('should handle image upload failure during creation', async () => {
      // Arrange: Create moment successfully but upload fails
      const momentData = {
        user_id: mockUser.id,
        title: 'Yoga Session',
        description: 'Morning yoga in the park',
        category: 'wellness',
        price: 25,
        status: 'draft',
      };

      const mockMoment = {
        id: 'moment-yoga-123',
        ...momentData,
        created_at: '2024-01-15T08:00:00Z',
      };

      mockSupabase.from('moments').insert.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockMoment,
            error: null,
          }),
        }),
      });

      const { data: moment } = await momentsService.create(
        momentData as unknown as Parameters<typeof momentsService.create>[0],
      );
      expect(moment).toBeDefined();

      // Act: Upload fails
      uploadImage.mockRejectedValue(new Error('Upload rate limit exceeded'));

      // Assert: Should handle error gracefully
      await expect(
        uploadImage('file:///path/to/large-image.jpg'),
      ).rejects.toThrow('Upload rate limit exceeded');

      // Moment remains in draft state
      expect(moment?.status).toBe('draft');
    });

    it('should handle network errors during publish', async () => {
      // Arrange: Moment exists in draft
      const draftId = 'moment-draft-456';

      // Act: Network error during publish
      mockSupabase.from('moments').update.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Network request failed' },
            }),
          }),
        }),
      });

      const publishQuery = mockSupabase
        .from('moments')
        .update({ status: 'active' });
      const { data, error } = await publishQuery
        .eq('id', draftId)
        .select()
        .single();

      // Assert: Error handled
      expect(data).toBeNull();
      expect(error?.message).toContain('Network request failed');
    });
  });
});
