/**
 * Navigation States - Storybook Stories
 *
 * Interactive examples of all navigation state variations
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  EmptyState,
  OfflineState,
  ErrorState,
  LoadingState,
  NavigationStateType,
} from './NavigationStates';

export default {
  title: 'Components/NavigationStates',
  component: EmptyState,
};

// ============================================================================
// EMPTY STATE STORIES
// ============================================================================

export const AllEmptyStates = () => {
  const types: NavigationStateType[] = [
    'empty',
    'no-results',
    'no-matches',
    'no-messages',
    'no-trips',
    'no-notifications',
    'no-favorites',
  ];

  return (
    <ScrollView style={styles.scrollView}>
      {types.map((type) => (
        <View key={type} style={styles.storyContainer}>
          <EmptyState type={type} style={styles.story} />
        </View>
      ))}
    </ScrollView>
  );
};

export const EmptyStateWithAction = () => (
  <EmptyState
    type="no-matches"
    actionLabel="Explore Profiles"
    onAction={() => alert('Action pressed!')}
  />
);

export const EmptyStateWithSecondaryAction = () => (
  <EmptyState
    type="no-results"
    actionLabel="Clear Filters"
    onAction={() => alert('Primary action pressed!')}
    secondaryActionLabel="Browse All"
    onSecondaryAction={() => alert('Secondary action pressed!')}
  />
);

export const EmptyStateCompact = () => (
  <EmptyState type="empty" compact style={styles.compactContainer} />
);

export const EmptyStateCustom = () => (
  <EmptyState
    icon="rocket-launch-outline"
    title="Ready to explore?"
    description="Start your journey by creating your first trip"
    actionLabel="Create Trip"
    onAction={() => alert('Create trip pressed!')}
  />
);

// ============================================================================
// OFFLINE STATE STORIES
// ============================================================================

export const OfflineFullScreen = () => (
  <OfflineState onRetry={() => alert('Retrying...')} />
);

export const OfflineBanner = () => (
  <View style={styles.bannerDemoContainer}>
    <OfflineState
      showBanner
      message="No internet connection"
      onRetry={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert('Connected!');
      }}
    />
    <View style={styles.contentPlaceholder} />
  </View>
);

export const OfflineWithoutRetry = () => <OfflineState />;

export const OfflineCustomMessage = () => (
  <OfflineState
    message="Connection lost"
    onRetry={() => alert('Retrying...')}
  />
);

// ============================================================================
// ERROR STATE STORIES
// ============================================================================

export const ErrorDefault = () => (
  <ErrorState onRetry={() => alert('Retrying...')} />
);

export const ErrorWithCustomMessage = () => (
  <ErrorState
    title="Failed to load trips"
    description="We couldn't load your trips. Please check your connection and try again."
    onRetry={() => alert('Retrying...')}
  />
);

export const ErrorWithReport = () => (
  <ErrorState
    title="Unexpected error"
    description="Something went wrong. You can report this issue to help us fix it."
    onRetry={() => alert('Retrying...')}
    onReport={() => alert('Report sent!')}
  />
);

export const ErrorFromException = () => (
  <ErrorState
    error={new Error('Network request failed: 500 Internal Server Error')}
    onRetry={() => alert('Retrying...')}
    onReport={() => alert('Report sent!')}
  />
);

export const ErrorWithoutRetry = () => (
  <ErrorState
    title="Access denied"
    description="You don't have permission to view this content."
  />
);

// ============================================================================
// LOADING STATE STORIES
// ============================================================================

export const LoadingDefault = () => <LoadingState />;

export const LoadingWithMessage = () => (
  <LoadingState message="Loading trips..." />
);

export const LoadingSmall = () => (
  <View style={styles.smallLoadingContainer}>
    <LoadingState size="small" message="Refreshing..." />
  </View>
);

export const LoadingWithoutMessage = () => <LoadingState message="" />;

// ============================================================================
// COMBINED EXAMPLE
// ============================================================================

export const RealWorldExample = () => {
  const [state, setState] = React.useState<
    'loading' | 'empty' | 'error' | 'offline' | 'content'
  >('loading');

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setState('empty');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = async () => {
    setState('loading');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setState('content');
  };

  if (state === 'loading') {
    return <LoadingState message="Loading your trips..." />;
  }

  if (state === 'offline') {
    return <OfflineState onRetry={handleRetry} />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        title="Failed to load trips"
        description="Something went wrong while loading your trips."
        onRetry={handleRetry}
      />
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        type="no-trips"
        actionLabel="Create Your First Trip"
        onAction={() => setState('content')}
        secondaryActionLabel="Simulate Error"
        onSecondaryAction={() => setState('error')}
      />
    );
  }

  return (
    <View style={styles.contentContainer}>
      <View style={styles.contentPlaceholder} />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  storyContainer: {
    height: 400,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  story: {
    flex: 1,
  },
  compactContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  bannerDemoContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentPlaceholder: {
    flex: 1,
    backgroundColor: '#f9fafb',
    margin: 16,
    borderRadius: 8,
  },
  smallLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 32,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
});
