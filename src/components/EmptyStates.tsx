/**
 * Specific Empty State Components
 * Farklı senaryolar için hazır empty state component'leri
 */

import React from 'react';
import EmptyState from './EmptyState';

interface EmptyStateWithActionProps {
  onAction?: () => void;
}

/**
 * No Moments Found
 */
export const EmptyMoments: React.FC<EmptyStateWithActionProps> = ({
  onAction,
}) => (
  <EmptyState
    icon="image-off-outline"
    title="No Moments Yet"
    subtitle="Start creating memories by adding your first moment"
    actionLabel={onAction ? 'Create Moment' : undefined}
    onAction={onAction}
  />
);

/**
 * No Messages
 */
export const EmptyMessages: React.FC = () => (
  <EmptyState
    icon="message-off-outline"
    title="No Messages"
    subtitle="You don't have any conversations yet. Start exploring and connect with travelers!"
  />
);

/**
 * No Notifications
 */
export const EmptyNotifications: React.FC = () => (
  <EmptyState
    icon="bell-off-outline"
    title="No Notifications"
    subtitle="You're all caught up! Check back later for updates."
  />
);

/**
 * No Search Results
 */
interface EmptySearchProps {
  searchQuery?: string;
  onClear?: () => void;
}

export const EmptySearch: React.FC<EmptySearchProps> = ({
  searchQuery,
  onClear,
}) => (
  <EmptyState
    icon="magnify-close"
    title="No Results Found"
    subtitle={
      searchQuery
        ? `We couldn't find anything matching "${searchQuery}". Try different keywords.`
        : 'Try adjusting your search criteria'
    }
    actionLabel={onClear ? 'Clear Filters' : undefined}
    onAction={onClear}
  />
);

/**
 * No Favorites
 */
export const EmptyFavorites: React.FC<EmptyStateWithActionProps> = ({
  onAction,
}) => (
  <EmptyState
    icon="heart-off-outline"
    title="No Favorites"
    subtitle="Save your favorite moments to easily find them later"
    actionLabel={onAction ? 'Explore Moments' : undefined}
    onAction={onAction}
  />
);

/**
 * No Bookings
 */
export const EmptyBookings: React.FC<EmptyStateWithActionProps> = ({
  onAction,
}) => (
  <EmptyState
    icon="calendar-blank-outline"
    title="No Bookings"
    subtitle="You haven't booked any moments yet. Start your adventure today!"
    actionLabel={onAction ? 'Browse Moments' : undefined}
    onAction={onAction}
  />
);

/**
 * No Payment Methods
 */
export const EmptyPaymentMethods: React.FC<EmptyStateWithActionProps> = ({
  onAction,
}) => (
  <EmptyState
    icon="credit-card-off-outline"
    title="No Payment Methods"
    subtitle="Add a payment method to book moments and experiences"
    actionLabel={onAction ? 'Add Card' : undefined}
    onAction={onAction}
  />
);

/**
 * No Reviews
 */
export const EmptyReviews: React.FC = () => (
  <EmptyState
    icon="star-off-outline"
    title="No Reviews Yet"
    subtitle="This moment hasn't been reviewed yet. Be the first to share your experience!"
  />
);

/**
 * Network Error
 */
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => (
  <EmptyState
    icon="wifi-off"
    title="Connection Error"
    subtitle="Unable to connect to the internet. Please check your connection and try again."
    actionLabel={onRetry ? 'Retry' : undefined}
    onAction={onRetry}
  />
);

/**
 * Server Error
 */
export const ServerError: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => (
  <EmptyState
    icon="server-network-off"
    title="Something Went Wrong"
    subtitle="We're having trouble loading this content. Please try again later."
    actionLabel={onRetry ? 'Try Again' : undefined}
    onAction={onRetry}
  />
);

/**
 * Blocked Users
 */
export const EmptyBlockedUsers: React.FC = () => (
  <EmptyState
    icon="account-cancel-outline"
    title="No Blocked Users"
    subtitle="You haven't blocked anyone yet"
  />
);

/**
 * Transaction History
 */
export const EmptyTransactions: React.FC = () => (
  <EmptyState
    icon="receipt-text-outline"
    title="No Transactions"
    subtitle="Your transaction history will appear here"
  />
);

/**
 * Saved Places
 */
export const EmptySavedPlaces: React.FC<EmptyStateWithActionProps> = ({
  onAction,
}) => (
  <EmptyState
    icon="map-marker-off-outline"
    title="No Saved Places"
    subtitle="Save places you want to visit to easily find them later"
    actionLabel={onAction ? 'Explore Places' : undefined}
    onAction={onAction}
  />
);
