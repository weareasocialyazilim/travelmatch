/**
 * Image Upload Hook
 * File upload with progress tracking
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import type { ImageAsset, UploadProgress } from '../utils/imageHandling';
import type { AxiosProgressEvent } from 'axios';

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

        // Upload with progress tracking
        const response = await axios.post<CloudinaryResponse>(
          uploadUrl,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              const total = progressEvent.total ?? 0;
              const loaded = progressEvent.loaded;
              const percentage =
                total > 0 ? Math.round((loaded * 100) / total) : 0;

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
 * Multiple images upload
 */
export function useMultiImageUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadState>>(new Map());

  const uploadImages = useCallback(
    async (
      images: ImageAsset[],
      uploadUrl: string,
      _options?: UploadOptions,
    ): Promise<string[]> => {
      const uploadPromises = images.map(async (image, index) => {
        const key = `${index}_${Date.now()}`;

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

        try {
          const formData = new FormData();
          const fileExtension = image.uri.split('.').pop() ?? 'jpg';
          const fileName =
            image.fileName ?? `image_${Date.now()}_${index}.${fileExtension}`;

          formData.append('file', {
            uri: image.uri,
            name: fileName,
            type: image.mimeType ?? `image/${fileExtension}`,
          } as unknown as Blob);

          const response = await axios.post<CloudinaryResponse>(
            uploadUrl,
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                const total = progressEvent.total ?? 0;
                const loaded = progressEvent.loaded;
                const percentage =
                  total > 0 ? Math.round((loaded * 100) / total) : 0;

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

          const uploadedUrl =
            response.data.url ?? response.data.secure_url ?? '';

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
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error('Upload failed');

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

          throw errorObj;
        }
      });

      const results = await Promise.all(uploadPromises);
      return results.filter((url): url is string => url !== undefined);
    },
    [],
  );

  return {
    uploads,
    uploadImages,
  };
}
