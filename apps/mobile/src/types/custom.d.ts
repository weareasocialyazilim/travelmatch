// Local module shims to aid local type-checking.
// These are minimal stubs to unblock the type-check; replace with real
// types or upstream @types packages where available.

declare module 'expo-image' {
  import { ComponentType } from 'react';
  import { ImageProps } from 'react-native';

  export const Image: ComponentType<
    ImageProps & {
      contentFit?: any;
      placeholder?: any;
      transition?: number;
      priority?: string;
      cachePolicy?: string;
    }
  >;
  export type ImageContentFit = string;

  const ExpoImage: ComponentType<ImageProps>;
  export default ExpoImage;
}

declare module 'posthog-react-native' {
  export function posthogInit(apiKey: string, opts?: any): void;
  export function capture(event: string, props?: any): void;
  const posthog: any;
  export default posthog;
}

// Fallback for any other untyped native modules used in the app
declare module '*-native' {
  const v: any;
  export default v;
}

// Some small global helpers used in older codepaths — prefer importing
// real helpers; these are only to avoid TS noise while we fix calls.
declare const showToast: (msg: string, opts?: any) => void;
declare const secretKey: string;
