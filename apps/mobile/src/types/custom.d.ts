// Local module shims to aid local type-checking.
// These are minimal stubs to unblock the type-check; replace with real
// types or upstream @types packages where available.

declare module '@shopify/flash-list' {
  import { Component, ReactElement } from 'react';
  import {
    ViewStyle,
    StyleProp,
    ScrollViewProps,
    ViewabilityConfig,
    ViewToken,
    FlatListProps,
  } from 'react-native';

  export interface FlashListRenderItemInfo<T> {
    item: T;
    index: number;
    target: string;
    extraData?: unknown;
  }

  export type ListRenderItem<T> = (
    info: FlashListRenderItemInfo<T>,
  ) => ReactElement | null;

  export interface FlashListProps<T> extends Omit<
    FlatListProps<T>,
    'renderItem'
  > {
    renderItem: ListRenderItem<T>;
    estimatedItemSize?: number;
    data: T[] | null | undefined;
    extraData?: unknown;
    horizontal?: boolean;
    numColumns?: number;
    keyExtractor?: (item: T, index: number) => string;
    contentContainerStyle?: StyleProp<ViewStyle>;
    onEndReached?: ((info: { distanceFromEnd: number }) => void) | null;
    onEndReachedThreshold?: number | null;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    scrollEnabled?: boolean;
    refreshControl?: ReactElement;
    refreshing?: boolean;
    onRefresh?: (() => void) | null;
    ListHeaderComponent?: ReactElement | (() => ReactElement) | null;
    ListFooterComponent?: ReactElement | (() => ReactElement) | null;
    ListEmptyComponent?: ReactElement | (() => ReactElement) | null;
    ItemSeparatorComponent?: ReactElement | (() => ReactElement) | null;
    viewabilityConfig?: ViewabilityConfig;
    onViewableItemsChanged?:
      | ((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void)
      | null;
    getItemType?: (item: T, index: number) => string | number | undefined;
    overrideItemLayout?: (
      layout: { span?: number; size?: number },
      item: T,
      index: number,
    ) => void;
    inverted?: boolean;
    drawDistance?: number;
    estimatedListSize?: { height: number; width: number };
    maintainVisibleContentPosition?: { minIndexForVisible: number };
    initialScrollIndex?: number;
    onScroll?: ScrollViewProps['onScroll'];
    scrollEventThrottle?: number;
    onMomentumScrollEnd?: ScrollViewProps['onMomentumScrollEnd'];
    onScrollBeginDrag?: ScrollViewProps['onScrollBeginDrag'];
    onScrollEndDrag?: ScrollViewProps['onScrollEndDrag'];
    testID?: string;
    style?: StyleProp<ViewStyle>;
  }

  export interface FlashListRef<_T> {
    scrollToIndex: (params: {
      index: number;
      animated?: boolean;
      viewPosition?: number;
      viewOffset?: number;
    }) => void;
    scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
    scrollToEnd: (params?: { animated?: boolean }) => void;
    getScrollableNode: () => any;
    prepareForLayoutAnimationRender: () => void;
    recordInteraction: () => void;
  }

  export class FlashList<T> extends Component<FlashListProps<T>> {
    scrollToIndex: FlashListRef<T>['scrollToIndex'];
    scrollToOffset: FlashListRef<T>['scrollToOffset'];
    scrollToEnd: FlashListRef<T>['scrollToEnd'];
    getScrollableNode: FlashListRef<T>['getScrollableNode'];
    prepareForLayoutAnimationRender: FlashListRef<T>['prepareForLayoutAnimationRender'];
    recordInteraction: FlashListRef<T>['recordInteraction'];
  }
}

declare module 'expo-image' {
  import { ComponentType } from 'react';
  import { ImageProps, StyleProp, ViewStyle, ImageStyle } from 'react-native';

  export interface ExpoImageProps extends Omit<ImageProps, 'style'> {
    contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    placeholder?: string | { uri: string } | number;
    transition?: number;
    priority?: 'low' | 'normal' | 'high';
    cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
    style?: StyleProp<ViewStyle | ImageStyle>;
  }

  export const Image: ComponentType<ExpoImageProps>;
  export type ImageContentFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

  const ExpoImage: ComponentType<ExpoImageProps>;
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

// expo-tracking-transparency stub for ATT (App Tracking Transparency)
declare module 'expo-tracking-transparency' {
  export type PermissionStatus =
    | 'granted'
    | 'denied'
    | 'undetermined'
    | 'restricted';

  export interface TrackingPermissionResponse {
    status: PermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
    expires: 'never' | number;
  }

  export function getTrackingPermissionsAsync(): Promise<TrackingPermissionResponse>;
  export function requestTrackingPermissionsAsync(): Promise<TrackingPermissionResponse>;
  export function isAvailable(): boolean;
}

// react-native-view-shot type declarations
declare module 'react-native-view-shot' {
  import { Component, RefObject } from 'react';
  import { ViewProps, View } from 'react-native';

  export interface CaptureOptions {
    format?: 'png' | 'jpg' | 'webm' | 'raw';
    quality?: number;
    result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
    snapshotContentContainer?: boolean;
    width?: number;
    height?: number;
  }

  export interface ViewShotProperties extends ViewProps {
    options?: CaptureOptions;
    captureMode?: 'mount' | 'continuous' | 'update';
    onCapture?: (uri: string) => void;
    onCaptureFailure?: (error: Error) => void;
  }

  export function captureRef(
    view: RefObject<View> | View | number,
    options?: CaptureOptions,
  ): Promise<string>;

  export function captureScreen(options?: CaptureOptions): Promise<string>;

  export function releaseCapture(uri: string): void;

  export default class ViewShot extends Component<ViewShotProperties> {
    capture(): Promise<string>;
  }
}

// react-native-confetti-cannon type declarations
declare module 'react-native-confetti-cannon' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  export interface ConfettiCannonProps {
    count?: number;
    origin?: { x: number; y: number };
    explosionSpeed?: number;
    fallSpeed?: number;
    fadeOut?: boolean;
    colors?: string[];
    autoStart?: boolean;
    autoStartDelay?: number;
    onAnimationStart?: () => void;
    onAnimationStop?: () => void;
    onAnimationResume?: () => void;
    onAnimationEnd?: () => void;
    style?: StyleProp<ViewStyle>;
  }

  export default class ConfettiCannon extends Component<ConfettiCannonProps> {
    start(): void;
    stop(): void;
    resume(): void;
  }
}

// expo-media-library type declarations
declare module 'expo-media-library' {
  export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

  export interface PermissionResponse {
    status: PermissionStatus;
    granted: boolean;
    canAskAgain: boolean;
    expires: 'never' | number;
  }

  export interface Asset {
    id: string;
    filename: string;
    uri: string;
    mediaType: 'photo' | 'video' | 'audio' | 'unknown';
    width: number;
    height: number;
    creationTime: number;
    modificationTime: number;
    duration: number;
    albumId?: string;
  }

  export interface Album {
    id: string;
    title: string;
    assetCount: number;
    type?: 'album' | 'smartAlbum';
  }

  export interface AssetInfo extends Asset {
    localUri?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    exif?: Record<string, unknown>;
    isFavorite?: boolean;
  }

  export function requestPermissionsAsync(): Promise<PermissionResponse>;
  export function getPermissionsAsync(): Promise<PermissionResponse>;
  export function saveToLibraryAsync(localUri: string): Promise<Asset>;
  export function createAssetAsync(localUri: string): Promise<Asset>;
  export function getAssetInfoAsync(
    asset: Asset | string,
    options?: { shouldDownloadFromNetwork?: boolean },
  ): Promise<AssetInfo>;
  export function deleteAssetsAsync(assets: Asset[] | string[]): Promise<boolean>;
  export function getAlbumsAsync(): Promise<Album[]>;
  export function getAlbumAsync(title: string): Promise<Album | null>;
  export function createAlbumAsync(
    albumName: string,
    asset?: Asset,
    copyAsset?: boolean,
  ): Promise<Album>;
  export function addAssetsToAlbumAsync(
    assets: Asset[] | string[],
    album: Album | string,
    copy?: boolean,
  ): Promise<boolean>;
}

// Some small global helpers used in older codepaths — prefer importing
// real helpers; these are only to avoid TS noise while we fix calls.
declare const showToast: (msg: string, opts?: any) => void;
declare const secretKey: string;
