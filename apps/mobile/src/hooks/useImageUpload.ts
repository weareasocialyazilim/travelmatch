/**
 * Image Upload Hook
 * File upload with progress tracking
 * Uses native XMLHttpRequest instead of axios (saves ~45 KB)
 */

import { useState, useCallback } from 'react';
import { uploadWithProgress } from '../utils/uploadWithProgress';
import type { UploadProgressEvent } from '../utils/uploadWithProgress';
import { useToast } from '../context/ToastContext';
import type { ImageAsset, UploadProgress } from '../utils/imageHandling';

interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UploadState {
  isUploading: boolean;
  progress: UploadProgress;
  error: Error | null;
  uploadedUrl: string | null;
}

interface CloudinaryResponse {
  url?: string;
  secure_url?: string;
}

export function useImageUpload() {
  const toast = useToast();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: { loaded: 0, total: 0, percentage: 0 },
    error: null,
    uploadedUrl: null,
  });

  const uploadImage = useCallback(
    async (
      image: ImageAsset,
      uploadUrl: string,
      options?: UploadOptions,
    ): Promise<string> => {
      setState({
        isUploading: true,
        progress: { loaded: 0, total: 0, percentage: 0 },
        error: null,
        uploadedUrl: null,
      });

      try {
        // Create form data
        const formData = new FormData();

        // For React Native, we need to format the file correctly
        const fileExtension = image.uri.split('.').pop() || 'jpg';
        const fileName =
          image.fileName || `image_${Date.now()}.${fileExtension}`;

        formData.append('file', {
          uri: image.uri,
          name: fileName,
          type: image.mimeType || `image/${fileExtension}`,
        } as unknown as Blob);

        // Upload with progress tracking (using native XMLHttpRequest)
        const response = await uploadWithProgress<CloudinaryResponse>(
          uploadUrl,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: UploadProgressEvent) => {
              const { loaded, total, percentage } = progressEvent;

              const progress: UploadProgress = {
                loaded,
                total,
                percentage,
              };

              setState((prev) => ({
                ...prev,
                progress,
              }));

              options?.onProgress?.(progress);
            },
          },
        );

        const uploadedUrl = response.data.url ?? response.data.secure_url ?? '';

        setState({
          isUploading: false,
          progress: { loaded: 100, total: 100, percentage: 100 },
          error: null,
          uploadedUrl,
        });

        options?.onSuccess?.(uploadedUrl);
        toast.success('Image uploaded successfully');

        return uploadedUrl;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('Upload failed');

        setState({
          isUploading: false,
          progress: { loaded: 0, total: 0, percentage: 0 },
          error: errorObj,
          uploadedUrl: null,
        });

        options?.onError?.(errorObj);
        toast.error('Image upload failed');

        throw errorObj;
      }
    },
    [toast],
  );

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: { loaded: 0, total: 0, percentage: 0 },
      error: null,
      uploadedUrl: null,
    });
  }, []);

  return {
    ...state,
    uploadImage,
    reset,
  };
}

/**
 * Result of batch image upload
 */
interface MultiUploadResult {
  /** Successfully uploaded URLs */
  successful: string[];
  /** Failed uploads with their original image index */
  failed: Array<{ index: number; error: Error }>;
  /** Total images attempted */
  total: number;
}

/**
 * Multiple images upload with resilient error handling
 * Uses Promise.allSettled so partial failures don't lose successful uploads
 */
export function useMultiImageUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

  const uploadImages = useCallback(
    async (
      images: ImageAsset[],
      uploadUrl: string,
      _options?: UploadOptions,
    ): Promise<MultiUploadResult> => {
      const keys: string[] = [];

      const uploadPromises = images.map(async (image, index) => {
        const key = `${index}_${Date.now()}`;
        keys[index] = key;

        setUploads((prev) => {
          const next = new Map(prev);
          next.set(key, {
            isUploading: true,
            progress: { loaded: 0, total: 0, percentage: 0 },
            error: null,
            uploadedUrl: null,
          });
          return next;
        });

        const formData = new FormData();
        const fileExtension = image.uri.split('.').pop() ?? 'jpg';
        const fileName =
          image.fileName ?? `image_${Date.now()}_${index}.${fileExtension}`;

        formData.append('file', {
          uri: image.uri,
          name: fileName,
          type: image.mimeType ?? `image/${fileExtension}`,
        } as unknown as Blob);

        const response = await uploadWithProgress<CloudinaryResponse>(
          uploadUrl,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent: UploadProgressEvent) => {
              const { loaded, total, percentage } = progressEvent;

              setUploads((prev) => {
                const next = new Map(prev);
                const current = next.get(key);
                if (current) {
                  next.set(key, {
                    ...current,
                    progress: { loaded, total, percentage },
                  });
                }
                return next;
              });
            },
          },
        );

        const uploadedUrl = response.data.url ?? response.data.secure_url ?? '';

        setUploads((prev) => {
          const next = new Map(prev);
          next.set(key, {
            isUploading: false,
            progress: { loaded: 100, total: 100, percentage: 100 },
            error: null,
            uploadedUrl,
          });
          return next;
        });

        return uploadedUrl;
      });

      // Use Promise.allSettled for resilient uploads
      const results = await Promise.allSettled(uploadPromises);

      const successful: string[] = [];
      const failed: Array<{ index: number; error: Error }> = [];

      results.forEach((result, index) => {
        const key = keys[index];

        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          const errorObj =
            result.reason instanceof Error
              ? result.reason
              : new Error('Upload failed');

          failed.push({ index, error: errorObj });

          // Update state for failed uploads
          setUploads((prev) => {
            const next = new Map(prev);
            next.set(key, {
              isUploading: false,
              progress: { loaded: 0, total: 0, percentage: 0 },
              error: errorObj,
              uploadedUrl: null,
            });
            return next;
          });
        }
      });

      return {
        successful,
        failed,
        total: images.length,
      };
    },
    [],
  );

  return {
    uploads,
    uploadImages,
  };
}
