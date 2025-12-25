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

// Some small global helpers used in older codepaths — prefer importing
// real helpers; these are only to avoid TS noise while we fix calls.
declare const showToast: (msg: string, opts?: any) => void;
declare const secretKey: string;
