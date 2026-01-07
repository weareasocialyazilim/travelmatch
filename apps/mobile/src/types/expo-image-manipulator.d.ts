/**
 * Type declarations for expo-image-manipulator
 *
 * Expo Image Manipulator provides functions to modify image dimensions,
 * crop, rotate, and convert images.
 *
 * To install: pnpm add expo-image-manipulator
 */

declare module 'expo-image-manipulator' {
  export interface ImageResult {
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }

  export interface ActionResize {
    resize: {
      width?: number;
      height?: number;
    };
  }

  export interface ActionRotate {
    rotate: number;
  }

  export interface ActionFlip {
    flip: 'horizontal' | 'vertical';
  }

  export interface ActionCrop {
    crop: {
      originX: number;
      originY: number;
      width: number;
      height: number;
    };
  }

  export type Action = ActionResize | ActionRotate | ActionFlip | ActionCrop;

  export interface SaveOptions {
    compress?: number;
    format?: 'jpeg' | 'png' | 'webp';
    base64?: boolean;
  }

  export function manipulateAsync(
    uri: string,
    actions?: Action[],
    saveOptions?: SaveOptions,
  ): Promise<ImageResult>;

  export const SaveFormat: {
    JPEG: 'jpeg';
    PNG: 'png';
    WEBP: 'webp';
  };
}
