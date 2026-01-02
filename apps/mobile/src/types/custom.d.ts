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
  export type ImageContentFit =
    | 'cover'
    | 'contain'
    | 'fill'
    | 'none'
    | 'scale-down';

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
    view: RefObject<View | ViewShot | null> | View | number,
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
  export function deleteAssetsAsync(
    assets: Asset[] | string[],
  ): Promise<boolean>;
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

// react-native-calendars type declarations
declare module 'react-native-calendars' {
  import { ComponentType } from 'react';
  import { ViewStyle, StyleProp, TextStyle } from 'react-native';

  export interface DateData {
    year: number;
    month: number;
    day: number;
    timestamp: number;
    dateString: string;
  }

  export interface MarkedDates {
    [date: string]: {
      selected?: boolean;
      marked?: boolean;
      selectedColor?: string;
      dotColor?: string;
      activeOpacity?: number;
      disabled?: boolean;
      disableTouchEvent?: boolean;
      customStyles?: {
        container?: StyleProp<ViewStyle>;
        text?: StyleProp<TextStyle>;
      };
    };
  }

  export interface CalendarProps {
    current?: string;
    minDate?: string;
    maxDate?: string;
    markedDates?: MarkedDates;
    onDayPress?: (day: DateData) => void;
    onDayLongPress?: (day: DateData) => void;
    onMonthChange?: (month: DateData) => void;
    hideExtraDays?: boolean;
    disableMonthChange?: boolean;
    firstDay?: number;
    hideDayNames?: boolean;
    showWeekNumbers?: boolean;
    onPressArrowLeft?: (subtractMonth: () => void, month?: DateData) => void;
    onPressArrowRight?: (addMonth: () => void, month?: DateData) => void;
    hideArrows?: boolean;
    renderArrow?: (direction: 'left' | 'right') => React.ReactNode;
    disableArrowLeft?: boolean;
    disableArrowRight?: boolean;
    disableAllTouchEventsForDisabledDays?: boolean;
    enableSwipeMonths?: boolean;
    style?: StyleProp<ViewStyle>;
    theme?: Record<string, unknown>;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export const CalendarList: ComponentType<
    CalendarProps & { pastScrollRange?: number; futureScrollRange?: number }
  >;
  export const Agenda: ComponentType<any>;
}

// expo-camera type declarations
declare module 'expo-camera' {
  import { ComponentType } from 'react';
  import { ViewStyle, StyleProp, ViewProps } from 'react-native';

  export type CameraType = 'front' | 'back';
  export type FlashMode = 'off' | 'on' | 'auto' | 'torch';

  export interface CameraViewProps extends ViewProps {
    facing?: CameraType;
    flash?: FlashMode;
    zoom?: number;
    style?: StyleProp<ViewStyle>;
    onCameraReady?: () => void;
    onMountError?: (event: { message: string }) => void;
  }

  export interface CameraViewRef {
    takePictureAsync: (options?: {
      quality?: number;
      base64?: boolean;
      exif?: boolean;
      skipProcessing?: boolean;
    }) => Promise<{
      uri: string;
      width: number;
      height: number;
      base64?: string;
      exif?: Record<string, unknown>;
    }>;
    recordAsync: (options?: {
      maxDuration?: number;
      maxFileSize?: number;
      quality?: string;
      mute?: boolean;
    }) => Promise<{ uri: string }>;
    stopRecording: () => void;
  }

  export const CameraView: ComponentType<CameraViewProps>;
  export function useCameraPermissions(): [
    { granted: boolean; canAskAgain: boolean; status: string } | null,
    () => Promise<{ granted: boolean; canAskAgain: boolean; status: string }>,
  ];
}

// expo-clipboard type declarations
declare module 'expo-clipboard' {
  export function getStringAsync(): Promise<string>;
  export function setStringAsync(text: string): Promise<boolean>;
  export function hasStringAsync(): Promise<boolean>;
  export function getImageAsync(options?: {
    format?: 'png' | 'jpeg';
  }): Promise<{ data: string; size: { width: number; height: number } } | null>;
  export function setImageAsync(base64Image: string): Promise<void>;
  export function hasImageAsync(): Promise<boolean>;
  export function addClipboardListener(
    listener: (event: { contentTypes: string[] }) => void,
  ): { remove: () => void };
}

// react-native-maps type declarations
declare module 'react-native-maps' {
  import { Component, ComponentType } from 'react';
  import { ViewStyle, StyleProp, ViewProps } from 'react-native';

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface LatLng {
    latitude: number;
    longitude: number;
  }

  export interface MapViewProps extends ViewProps {
    region?: Region;
    initialRegion?: Region;
    onRegionChange?: (region: Region) => void;
    onRegionChangeComplete?: (region: Region) => void;
    onPress?: (event: { nativeEvent: { coordinate: LatLng } }) => void;
    onLongPress?: (event: { nativeEvent: { coordinate: LatLng } }) => void;
    onMarkerPress?: (event: any) => void;
    showsUserLocation?: boolean;
    followsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    showsCompass?: boolean;
    showsScale?: boolean;
    showsBuildings?: boolean;
    showsTraffic?: boolean;
    showsIndoors?: boolean;
    zoomEnabled?: boolean;
    zoomTapEnabled?: boolean;
    zoomControlEnabled?: boolean;
    rotateEnabled?: boolean;
    scrollEnabled?: boolean;
    pitchEnabled?: boolean;
    toolbarEnabled?: boolean;
    moveOnMarkerPress?: boolean;
    mapType?:
      | 'standard'
      | 'satellite'
      | 'hybrid'
      | 'terrain'
      | 'none'
      | 'mutedStandard';
    style?: StyleProp<ViewStyle>;
    customMapStyle?: object[];
    provider?: 'google' | null;
    minZoomLevel?: number;
    maxZoomLevel?: number;
    liteMode?: boolean;
    loadingEnabled?: boolean;
    loadingIndicatorColor?: string;
    loadingBackgroundColor?: string;
    cacheEnabled?: boolean;
    camera?: {
      center: LatLng;
      pitch?: number;
      heading?: number;
      altitude?: number;
      zoom?: number;
    };
  }

  export interface MarkerProps extends ViewProps {
    coordinate: LatLng;
    title?: string;
    description?: string;
    image?: any;
    icon?: any;
    pinColor?: string;
    anchor?: { x: number; y: number };
    centerOffset?: { x: number; y: number };
    calloutAnchor?: { x: number; y: number };
    flat?: boolean;
    identifier?: string;
    rotation?: number;
    draggable?: boolean;
    tracksViewChanges?: boolean;
    tracksInfoWindowChanges?: boolean;
    stopPropagation?: boolean;
    opacity?: number;
    onPress?: (event: any) => void;
    onSelect?: (event: any) => void;
    onDeselect?: (event: any) => void;
    onCalloutPress?: (event: any) => void;
    onDragStart?: (event: any) => void;
    onDrag?: (event: any) => void;
    onDragEnd?: (event: any) => void;
  }

  export default class MapView extends Component<MapViewProps> {
    animateToRegion(region: Region, duration?: number): void;
    animateCamera(camera: object, options?: { duration?: number }): void;
    fitToCoordinates(
      coordinates: LatLng[],
      options?: { edgePadding?: object; animated?: boolean },
    ): void;
    getCamera(): Promise<object>;
    setCamera(camera: object): void;
  }

  export const Marker: ComponentType<MarkerProps>;
  export const Callout: ComponentType<ViewProps>;
  export const Polygon: ComponentType<any>;
  export const Polyline: ComponentType<any>;
  export const Circle: ComponentType<any>;
  export const Overlay: ComponentType<any>;
  export const Heatmap: ComponentType<any>;
  export const Geojson: ComponentType<any>;

  export const PROVIDER_GOOGLE: 'google';
  export const PROVIDER_DEFAULT: null;
}
