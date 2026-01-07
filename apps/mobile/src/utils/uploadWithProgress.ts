/**
 * Upload with Progress Tracking
 * Native XMLHttpRequest-based upload utility to replace axios
 * Saves ~45 KB from bundle by removing axios dependency
 */

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  headers?: Record<string, string>;
  onUploadProgress?: (progress: UploadProgressEvent) => void;
  timeout?: number;
}

export interface UploadResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Upload file with progress tracking using XMLHttpRequest
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', file);
 *
 * const response = await uploadWithProgress<CloudinaryResponse>(
 *   'https://api.cloudinary.com/upload',
 *   formData,
 *   {
 *     headers: { 'Content-Type': 'multipart/form-data' },
 *     onUploadProgress: (progress) => {
 *       console.log(`Upload: ${progress.percentage}%`);
 *     },
 *   }
 * );
 * ```
 */
export function uploadWithProgress<T = unknown>(
  url: string,
  data: FormData,
  options?: UploadOptions,
): Promise<UploadResponse<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Set timeout if provided
    if (options?.timeout) {
      xhr.timeout = options.timeout;
    }

    // Progress handler
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && options?.onUploadProgress) {
        const loaded = event.loaded;
        const total = event.total;
        const percentage = Math.round((loaded * 100) / total);

        options.onUploadProgress({
          loaded,
          total,
          percentage,
        });
      }
    });

    // Success handler
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const responseData = JSON.parse(xhr.responseText) as T;
          resolve({
            data: responseData,
            status: xhr.status,
            statusText: xhr.statusText,
          });
        } catch (error) {
          reject(
            new Error(
              `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ),
          );
        }
      } else {
        reject(
          new Error(
            `Upload failed with status ${xhr.status}: ${xhr.statusText}`,
          ),
        );
      }
    });

    // Error handler
    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during upload'));
    });

    // Abort handler
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'));
    });

    // Timeout handler
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out'));
    });

    // Open connection
    xhr.open('POST', url);

    // Set headers
    if (options?.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        // Skip Content-Type for FormData - browser sets it automatically with boundary
        if (key.toLowerCase() !== 'content-type') {
          xhr.setRequestHeader(key, value);
        }
      });
    }

    // Send request
    xhr.send(data);
  });
}

/**
 * Axios-compatible upload function
 * Drop-in replacement for axios.post with upload progress
 *
 * @example
 * ```typescript
 * // Before (with axios):
 * const response = await axios.post(url, formData, {
 *   headers: { 'Content-Type': 'multipart/form-data' },
 *   onUploadProgress: (event) => { ... }
 * });
 *
 * // After (with this utility):
 * const response = await post(url, formData, {
 *   headers: { 'Content-Type': 'multipart/form-data' },
 *   onUploadProgress: (event) => { ... }
 * });
 * ```
 */
export const post = uploadWithProgress;

/**
 * Export default for convenience
 */
export default { post, uploadWithProgress };
