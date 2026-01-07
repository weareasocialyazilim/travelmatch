/**
 * Production Monitoring Examples
 *
 * Real-world examples of how to use the monitoring service and hooks
 * throughout the TravelMatch application.
 */

import React, { useEffect, useState } from 'react';
import { View, Button, FlatList } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  useScreenTracking,
  useActionTracking,
  usePerformanceTracking,
  useErrorTracking,
  useApiTracking,
} from '../hooks/useMonitoring';
import { monitoringService } from '../services/monitoring';

// Types
interface Moment {
  id: string;
  category: string;
  location: string;
  price: number;
  images?: string[];
}

interface RouteParams {
  momentId: string;
  source?: string;
}

interface MomentDetailScreenProps {
  route: {
    params: RouteParams;
    name: string;
  };
}

interface MomentCardProps {
  moment: Moment;
}

interface BookingDetails {
  total: number;
}

interface ImageFile {
  size: number;
  format?: string;
}

// Mock database service for examples
const supabaseDb = {
  moments: {
    like: async (_id: string): Promise<void> => {},
    getAll: async (): Promise<{
      data: Moment[] | null;
      error: Error | null;
    }> => ({ data: [], error: null }),
    create: async (
      data: Partial<Moment>,
    ): Promise<{ data: Moment | null; error: Error | null }> => ({
      data: data as Moment,
      error: null,
    }),
  },
};

// ==========================================
// Example 1: Screen Tracking
// ==========================================

export function MomentDetailScreen({ route }: MomentDetailScreenProps) {
  const { momentId } = route.params;

  // Automatically track screen views
  useScreenTracking('MomentDetail', {
    moment_id: momentId,
    source: route.params.source || 'unknown',
  });

  return <View>{/* Screen content */}</View>;
}

// ==========================================
// Example 2: Action Tracking
// ==========================================

export function MomentCard({ moment }: MomentCardProps) {
  const trackAction = useActionTracking();

  // Track user actions
  const handleLike = trackAction(
    'moment_liked',
    async () => {
      await supabaseDb.moments.like(moment.id);
    },
    {
      moment_id: moment.id,
      category: moment.category,
      location: moment.location,
    },
  );

  const handleShare = trackAction(
    'moment_shared',
    async () => {
      await shareToSocial(moment);
    },
    {
      moment_id: moment.id,
      platform: 'instagram',
    },
  );

  return (
    <View>
      <Button title="Like" onPress={handleLike} />
      <Button title="Share" onPress={handleShare} />
    </View>
  );
}

// ==========================================
// Example 3: Performance Tracking
// ==========================================

export function MomentsListScreen() {
  const { startTiming, endTiming } =
    usePerformanceTracking('moments_feed_load');

  const { data: moments } = useQuery({
    queryKey: ['moments'],
    queryFn: async () => {
      startTiming();

      const result = await supabaseDb.moments.getAll();

      endTiming({
        count: result.data?.length || 0,
        has_filters: false,
      });

      return result.data;
    },
  });

  return (
    <FlatList
      data={moments}
      renderItem={({ item }) => <MomentCard moment={item} />}
      // Track list performance
      onEndReached={() => {
        monitoringService.trackAction('list_scrolled_to_end', {
          total_items: moments?.length,
        });
      }}
    />
  );
}

// ==========================================
// Example 4: Error Tracking
// ==========================================

export function CreateMomentScreen() {
  const trackError = useErrorTracking('moment_creation');

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Moment>) => {
      try {
        const result = await supabaseDb.moments.create(data);

        if (result.error) {
          throw result.error;
        }

        // Track success
        monitoringService.trackAction('moment_created', {
          category: data.category,
          location: data.location,
          price: data.price,
        });

        return result.data;
      } catch (error) {
        // Track error with context
        const err = error instanceof Error ? error : new Error(String(error));
        trackError(err, {
          form_data: {
            category: data.category,
            has_image: !!data.images?.length,
            location: data.location,
          },
        });
        throw error;
      }
    },
  });

  return <View>{/* Form */}</View>;
}

// ==========================================
// Example 5: API Call Tracking
// ==========================================

export function useSearchMoments(searchQuery: string, category?: string) {
  const trackApi = useApiTracking();

  return useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      const { start, success, error } = trackApi('GET', '/api/search');
      const resourceId = start({
        query: searchQuery,
        filters: { category },
      });

      try {
        const response = await fetch(`/api/search?q=${searchQuery}`);
        const responseData = await response.json();

        success(resourceId, {
          status: response.status,
          result_count: responseData.length,
        });

        return responseData;
      } catch (err) {
        const errObj = err instanceof Error ? err : new Error(String(err));
        error(resourceId, errObj);
        throw err;
      }
    },
  });
}

// ==========================================
// Example 6: Custom Timing
// ==========================================

export function ImageUploadComponent() {
  const handleUpload = async (image: ImageFile) => {
    const startTime = Date.now();

    try {
      // Compress image
      const compressed = await compressImage(image);
      monitoringService.addTiming('image_compression', Date.now() - startTime, {
        original_size: image.size,
        compressed_size: compressed.size,
        reduction_percent: ((1 - compressed.size / image.size) * 100).toFixed(
          2,
        ),
      });

      // Upload
      const uploadStart = Date.now();
      await uploadToSupabase(compressed);
      monitoringService.addTiming('image_upload', Date.now() - uploadStart, {
        size: compressed.size,
        format: compressed.format,
      });

      // Track complete flow
      monitoringService.addTiming('image_upload_total', Date.now() - startTime);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      monitoringService.trackError(err, {
        context: 'image_upload',
        image_size: image.size,
      });
    }
  };

  return <View>{/* Upload UI */}</View>;
}

// ==========================================
// Example 7: User Journey Tracking
// ==========================================

export function BookingFlow() {
  const trackAction = useActionTracking();
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null,
  );

  // Step 1: Select moment
  const handleSelectMoment = trackAction(
    'booking_step_1_moment_selected',
    (moment: Moment) => {
      setSelectedMoment(moment);
    },
  );

  // Step 2: Fill details
  const handleFillDetails = trackAction(
    'booking_step_2_details_filled',
    (details: BookingDetails) => {
      setBookingDetails(details);
    },
  );

  // Step 3: Payment
  const handlePayment = trackAction(
    'booking_step_3_payment_initiated',
    async (paymentMethod: string) => {
      const startTime = Date.now();

      try {
        const result = await processPayment(paymentMethod);

        monitoringService.addTiming(
          'payment_processing',
          Date.now() - startTime,
          {
            method: paymentMethod,
            amount: bookingDetails?.total,
            success: true,
          },
        );

        monitoringService.trackAction('booking_completed', {
          moment_id: selectedMoment?.id,
          payment_method: paymentMethod,
          total_amount: bookingDetails?.total,
          duration_minutes: Math.floor((Date.now() - startTime) / 60000),
        });

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        monitoringService.trackError(err, {
          context: 'payment_processing',
          payment_method: paymentMethod,
          amount: bookingDetails?.total,
        });
        throw error;
      }
    },
  );

  return <View>{/* Booking steps */}</View>;
}

// ==========================================
// Example 8: Manual Monitoring
// ==========================================

export function AdvancedFeature() {
  useEffect(() => {
    // Start a custom view
    monitoringService.startView('AdvancedFeature', {
      feature_flag: 'new_ui_enabled',
      user_tier: 'premium',
    });

    // Track feature usage
    monitoringService.trackAction('advanced_feature_accessed', {
      entry_point: 'settings',
    });

    // Cleanup
    return () => {
      monitoringService.stopView({
        time_spent_seconds: getTimeSpent(),
      });
    };
  }, []);

  return <View>{/* Feature content */}</View>;
}

// ==========================================
// Example 9: Global Context
// ==========================================

interface User {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  subscription_tier: string;
}

export function AppWithMonitoring() {
  useEffect(() => {
    // Add global attributes
    monitoringService.addGlobalContext({
      app_version: '1.0.0',
      build_number: 42,
      feature_flags: {
        new_ui: true,
        ai_recommendations: false,
      },
      user_segment: 'power_user',
    });

    // Update on user changes
    const updateUserContext = (user: User) => {
      monitoringService.setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
        subscription: user.subscription_tier,
      });

      monitoringService.addGlobalContext({
        user_verified: user.verified,
        user_subscription: user.subscription_tier,
      });
    };

    return () => {
      // Cleanup on unmount
      monitoringService.clearUser();
    };
  }, []);

  return <View>{/* App */}</View>;
}

// ==========================================
// Example 10: Error Boundary Integration
// ==========================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class MonitoredErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track React errors
    monitoringService.trackError(error, {
      context: 'react_error_boundary',
      component_stack: errorInfo.componentStack,
      error_boundary: this.constructor.name,
    });
  }

  render() {
    if (this.state.hasError) {
      return <View>{/* Error fallback UI */}</View>;
    }
    return this.props.children;
  }
}

// ==========================================
// Helper Functions
// ==========================================

async function shareToSocial(_moment: Moment): Promise<void> {
  // Implementation
}

async function compressImage(image: ImageFile): Promise<ImageFile> {
  // Implementation - return compressed image
  return { size: image.size * 0.7, format: 'jpeg' };
}

async function uploadToSupabase(_image: ImageFile): Promise<void> {
  // Implementation
}

async function processPayment(_method: string): Promise<{ success: boolean }> {
  // Implementation
  return { success: true };
}

function getTimeSpent(): number {
  return 0;
}
