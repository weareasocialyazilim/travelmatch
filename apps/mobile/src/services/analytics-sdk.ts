import { eventTracking } from './event-tracking';

/**
 * React Native Analytics SDK
 * 
 * Auto-tracking with hooks and HOCs
 */

import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

let sessionId: string | null = null;
let sessionStartTime = 0;
let lastActiveTime = 0;

/**
 * Initialize analytics
 */
export async function initializeAnalytics(userId?: string) {
  // Start session
  startSession();

  // Identify user
  if (userId) {
    await identifyUser(userId);
  }

  // Track app lifecycle
  AppState.addEventListener('change', handleAppStateChange);

  // Track network changes
  NetInfo.addEventListener(state => {
    trackEvent('network_changed', {
      type: state.type,
      connected: state.isConnected,
    });
  });
}

/**
 * Track event
 */
export async function trackEvent(
  event: string,
  properties?: Record<string, any>
) {
  const context = await getContext();
  
  await eventTracking.track({
    event,
    properties,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Identify user
 */
export async function identifyUser(
  userId: string,
  traits?: Record<string, any>
) {
  const deviceInfo = await getDeviceInfo();
  
  await eventTracking.identify(userId, {
    ...traits,
    ...deviceInfo,
  });
}

/**
 * Track screen view
 */
export async function trackScreen(
  screenName: string,
  properties?: Record<string, any>
) {
  await trackEvent('screen_viewed', {
    screen_name: screenName,
    ...properties,
  });
}

/**
 * Get event context (device, app, location)
 */
async function getContext() {
  const [device, app, network] = await Promise.all([
    getDeviceInfo(),
    getAppInfo(),
    getNetworkInfo(),
  ]);

  return {
    device,
    app,
    network,
    session: {
      id: sessionId,
      duration: Date.now() - sessionStartTime,
    },
  };
}

/**
 * Get device information
 */
async function getDeviceInfo() {
  return {
    type: await DeviceInfo.getDeviceType() as 'mobile' | 'tablet' | 'desktop',
    os: await DeviceInfo.getSystemName(),
    osVersion: await DeviceInfo.getSystemVersion(),
    model: await DeviceInfo.getModel(),
    manufacturer: await DeviceInfo.getManufacturer(),
    brand: await DeviceInfo.getBrand(),
  };
}

/**
 * Get app information
 */
async function getAppInfo() {
  return {
    version: await DeviceInfo.getVersion(),
    build: await DeviceInfo.getBuildNumber(),
    name: await DeviceInfo.getApplicationName(),
  };
}

/**
 * Get network information
 */
async function getNetworkInfo() {
  const netInfo = await NetInfo.fetch();
  
  return {
    wifi: netInfo.type === 'wifi',
    bluetooth: false, // Not available via NetInfo
  };
}

/**
 * Start new session
 */
function startSession() {
  sessionId = generateSessionId();
  sessionStartTime = Date.now();
  lastActiveTime = Date.now();
  
  trackEvent('session_started', {
    session_id: sessionId,
  });
}

/**
 * End session
 */
function endSession() {
  if (!sessionId) return;
  
  const duration = Date.now() - sessionStartTime;
  
  trackEvent('session_ended', {
    session_id: sessionId,
    duration_ms: duration,
    duration_seconds: Math.floor(duration / 1000),
  });
  
  sessionId = null;
}

/**
 * Handle app state changes
 */
function handleAppStateChange(nextAppState: AppStateStatus) {
  const now = Date.now();
  const timeSinceLastActive = now - lastActiveTime;
  
  if (nextAppState === 'active') {
    // App came to foreground
    
    // Start new session if inactive for >30 minutes
    if (timeSinceLastActive > 30 * 60 * 1000) {
      startSession();
    } else {
      trackEvent('app_foregrounded', {
        time_since_last_active: timeSinceLastActive,
      });
    }
  } else if (nextAppState === 'background') {
    // App went to background
    trackEvent('app_backgrounded');
  } else if (nextAppState === 'inactive') {
    // App is transitioning (ignore)
  }
  
  lastActiveTime = now;
}

/**
 * Generate session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// ============================================
// REACT HOOKS
// ============================================

/**
 * Auto-track screen views
 */
export function useScreenTracking(
  screenName: string,
  properties?: Record<string, any>
) {
  useEffect(() => {
    trackScreen(screenName, properties);
  }, [screenName]);
}

/**
 * Track event on mount
 */
export function useEventOnMount(
  event: string,
  properties?: Record<string, any>
) {
  useEffect(() => {
    trackEvent(event, properties);
  }, []);
}

/**
 * Track user interaction
 */
export function useInteractionTracking(
  element: string,
  action = 'clicked'
) {
  return () => {
    trackEvent(`${element}_${action}`, {
      element,
      action,
    });
  };
}

/**
 * Track time spent
 */
export function useTimeTracking(
  eventName: string,
  properties?: Record<string, any>
) {
  const startTimeRef = useRef(Date.now());
  
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    return () => {
      const timeSpent = Date.now() - startTimeRef.current;
      trackEvent(eventName, {
        ...properties,
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.floor(timeSpent / 1000),
      });
    };
  }, [eventName]);
}

// ============================================
// AUTO-TRACKING DECORATORS
// ============================================

/**
 * Auto-track component renders
 */
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return (props: P) => {
    useEventOnMount('component_rendered', {
      component: componentName,
    });
    
    return React.createElement(Component, props);
  };
}

// ============================================
// COMMON EVENT HELPERS
// ============================================

export const Analytics = {
  // User events
  signup: (method: string, properties?: Record<string, any>) =>
    trackEvent('signup', { method, ...properties }),
  
  login: (method: string, properties?: Record<string, any>) =>
    trackEvent('login', { method, ...properties }),
  
  logout: () =>
    trackEvent('logout'),
  
  // Content events
  momentCreated: (momentId: string, properties?: Record<string, any>) =>
    trackEvent('moment_created', { moment_id: momentId, ...properties }),
  
  momentViewed: (momentId: string, properties?: Record<string, any>) =>
    trackEvent('moment_viewed', { moment_id: momentId, ...properties }),
  
  momentLiked: (momentId: string) =>
    trackEvent('moment_liked', { moment_id: momentId }),
  
  momentShared: (momentId: string, platform: string) =>
    trackEvent('moment_shared', { moment_id: momentId, platform }),
  
  // Social events
  matchMade: (matchId: string, properties?: Record<string, any>) =>
    trackEvent('match_made', { match_id: matchId, ...properties }),
  
  messageSent: (recipientId: string, messageLength: number) =>
    trackEvent('message_sent', { recipient_id: recipientId, length: messageLength }),
  
  giftSent: (recipientId: string, amount: number) =>
    trackEvent('gift_sent', { recipient_id: recipientId, amount }),
  
  // Search events
  searchPerformed: (query: string, filters?: Record<string, any>) =>
    trackEvent('search_performed', { query, filters }),
  
  searchResultClicked: (query: string, resultId: string, position: number) =>
    trackEvent('search_result_clicked', { query, result_id: resultId, position }),
  
  // Monetization events
  premiumViewed: (source: string) =>
    trackEvent('premium_viewed', { source }),
  
  premiumPurchased: (plan: string, amount: number, currency: string) =>
    trackEvent('premium_purchased', { plan, amount, currency }),
  
  // Errors
  error: (errorType: string, message: string, stack?: string) =>
    trackEvent('error', { error_type: errorType, message, stack }),
  
  // Performance
  performance: (metric: string, value: number, unit = 'ms') =>
    trackEvent('performance_metric', { metric, value, unit }),
};

// ============================================
// EXPORT
// ============================================

export default {
  initialize: initializeAnalytics,
  track: trackEvent,
  identify: identifyUser,
  screen: trackScreen,
  Analytics,
  
  // Hooks
  useScreenTracking,
  useEventOnMount,
  useInteractionTracking,
  useTimeTracking,
  
  // HOC
  withAnalytics,
};
