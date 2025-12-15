/**
 * Global type declarations for React Native
 */

// React Native global __DEV__ constant
declare const __DEV__: boolean;

// Extend globalThis for test environments
declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean;
  
  namespace NodeJS {
    interface Global {
      __DEV__: boolean;
    }
  }
}

// React Native Video module
declare module 'react-native-video' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface VideoProperties {
    source: { uri: string } | number;
    style?: ViewStyle;
    resizeMode?: 'contain' | 'cover' | 'stretch';
    paused?: boolean;
    muted?: boolean;
    repeat?: boolean;
    onLoad?: (data: { duration: number }) => void;
    onProgress?: (data: { currentTime: number }) => void;
    onEnd?: () => void;
    onError?: (error: { error: { errorString: string } }) => void;
    poster?: string;
    posterResizeMode?: 'contain' | 'cover' | 'stretch';
    controls?: boolean;
    volume?: number;
    rate?: number;
  }

  export default class Video extends Component<VideoProperties> {}
}

// React Native Image Picker module
declare module 'react-native-image-picker' {
  export interface ImagePickerResponse {
    assets?: Array<{
      uri: string;
      width: number;
      height: number;
      fileName?: string;
      fileSize?: number;
      type?: string;
    }>;
    didCancel?: boolean;
    errorCode?: string;
    errorMessage?: string;
  }

  export interface ImagePickerOptions {
    mediaType?: 'photo' | 'video' | 'mixed';
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    includeBase64?: boolean;
    selectionLimit?: number;
  }

  export function launchImageLibrary(
    options: ImagePickerOptions,
    callback?: (response: ImagePickerResponse) => void
  ): Promise<ImagePickerResponse>;

  export function launchCamera(
    options: ImagePickerOptions,
    callback?: (response: ImagePickerResponse) => void
  ): Promise<ImagePickerResponse>;
}

// Design system tokens
declare module '@travelmatch/design-system/tokens' {
  export const colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    [key: string]: string;
  };
  
  export const spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    [key: string]: number;
  };
  
  export const typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
}

// Expo Sharing module
declare module 'expo-sharing' {
  export function isAvailableAsync(): Promise<boolean>;
  export function shareAsync(
    url: string,
    options?: {
      mimeType?: string;
      dialogTitle?: string;
      UTI?: string;
    }
  ): Promise<void>;
}

// Note: expo-crypto types are provided by the package itself
// Removed manual declaration to use official types

// React Native Fast Image
declare module 'react-native-fast-image' {
  import { Component } from 'react';
  import { ImageStyle, StyleProp } from 'react-native';

  export interface FastImageSource {
    uri: string;
    headers?: { [key: string]: string };
    priority?: 'low' | 'normal' | 'high';
    cache?: 'immutable' | 'web' | 'cacheOnly';
  }

  export interface FastImageProps {
    source: FastImageSource | number;
    style?: StyleProp<ImageStyle>;
    resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
    onLoadStart?: () => void;
    onProgress?: (event: { nativeEvent: { loaded: number; total: number } }) => void;
    onLoad?: (event: { nativeEvent: { width: number; height: number } }) => void;
    onError?: () => void;
    onLoadEnd?: () => void;
    fallback?: boolean;
    tintColor?: string;
  }

  export default class FastImage extends Component<FastImageProps> {
    static resizeMode: {
      contain: 'contain';
      cover: 'cover';
      stretch: 'stretch';
      center: 'center';
    };
    static priority: {
      low: 'low';
      normal: 'normal';
      high: 'high';
    };
    static cacheControl: {
      immutable: 'immutable';
      web: 'web';
      cacheOnly: 'cacheOnly';
    };
    static preload(sources: FastImageSource[]): void;
    static clearMemoryCache(): Promise<void>;
    static clearDiskCache(): Promise<void>;
  }
}

// React Native Firebase Analytics
declare module '@react-native-firebase/analytics' {
  export interface FirebaseAnalyticsTypes {
    logEvent(name: string, params?: { [key: string]: unknown }): Promise<void>;
    setUserId(id: string | null): Promise<void>;
    setUserProperty(name: string, value: string | null): Promise<void>;
    setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;
    logScreenView(params: {
      screen_name: string;
      screen_class?: string;
    }): Promise<void>;
  }

  function analytics(): FirebaseAnalyticsTypes;
  export default analytics;
}

// TanStack Query Persist Client modules
declare module '@tanstack/query-async-storage-persister' {
  import { AsyncStorage } from '@react-native-async-storage/async-storage';
  
  export interface AsyncStoragePersisterOptions {
    storage: typeof AsyncStorage;
    key?: string;
    throttleTime?: number;
    serialize?: (data: unknown) => string;
    deserialize?: (data: string) => unknown;
  }

  export function createAsyncStoragePersister(
    options: AsyncStoragePersisterOptions
  ): unknown;
}

declare module '@tanstack/react-query-persist-client' {
  import { QueryClient } from '@tanstack/react-query';
  import { ReactNode } from 'react';

  export interface PersistQueryClientProviderProps {
    client: QueryClient;
    persistOptions: {
      persister: unknown;
      maxAge?: number;
      hydrateOptions?: unknown;
      dehydrateOptions?: unknown;
    };
    children: ReactNode;
  }

  export function PersistQueryClientProvider(
    props: PersistQueryClientProviderProps
  ): JSX.Element;
}
