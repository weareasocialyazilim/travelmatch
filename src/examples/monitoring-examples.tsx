/**
 * Production Monitoring Examples
 * 
 * Real-world examples of how to use the monitoring service and hooks
 * throughout the TravelMatch application.
 */

import React, { useEffect } from 'react';
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
import { supabaseDb } from '../services/supabaseDbService';

// ==========================================
// Example 1: Screen Tracking
// ==========================================

export function MomentDetailScreen({ route }) {
  const { momentId } = route.params;

  // Automatically track screen views
  useScreenTracking('MomentDetail', {
    moment_id: momentId,
    source: route.params.source || 'unknown',
  });

  return (
    <View>
      {/* Screen content */}
    </View>
  );
}

// ==========================================
// Example 2: Action Tracking
// ==========================================

export function MomentCard({ moment }) {
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
    }
  );

  const handleShare = trackAction(
    'moment_shared',
    async () => {
      await shareToSocial(moment);
    },
    {
      moment_id: moment.id,
      platform: 'instagram',
    }
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
  const { startTiming, endTiming } = usePerformanceTracking('moments_feed_load');

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
    mutationFn: async (data) => {
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
        trackError(error, {
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

export function useSearchMoments() {
  const trackApi = useApiTracking();

  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const { start, success, error } = trackApi('GET', '/api/search');
      const resourceId = start({
        query,
        filters: { category, location },
      });

      try {
        const response = await fetch(`/api/search?q=${query}`);
        
        success(resourceId, {
          status: response.status,
          result_count: data.length,
        });
        
        const data = await response.json();
        return data;
      } catch (err) {
        error(resourceId, err);
        throw err;
      }
    },
  });
}

// ==========================================
// Example 6: Custom Timing
// ==========================================

export function ImageUploadComponent() {
  const handleUpload = async (image) => {
    const startTime = Date.now();

    try {
      // Compress image
      const compressed = await compressImage(image);
      monitoringService.addTiming('image_compression', Date.now() - startTime, {
        original_size: image.size,
        compressed_size: compressed.size,
        reduction_percent: ((1 - compressed.size / image.size) * 100).toFixed(2),
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
      monitoringService.trackError(error, {
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

  // Step 1: Select moment
  const handleSelectMoment = trackAction('booking_step_1_moment_selected', (moment) => {
    setSelectedMoment(moment);
  });

  // Step 2: Fill details
  const handleFillDetails = trackAction('booking_step_2_details_filled', (details) => {
    setBookingDetails(details);
  });

  // Step 3: Payment
  const handlePayment = trackAction(
    'booking_step_3_payment_initiated',
    async (paymentMethod) => {
      const startTime = Date.now();

      try {
        const result = await processPayment(paymentMethod);

        monitoringService.addTiming('payment_processing', Date.now() - startTime, {
          method: paymentMethod,
          amount: bookingDetails.total,
          success: true,
        });

        monitoringService.trackAction('booking_completed', {
          moment_id: selectedMoment.id,
          payment_method: paymentMethod,
          total_amount: bookingDetails.total,
          duration_minutes: Math.floor((Date.now() - startTime) / 60000),
        });

        return result;
      } catch (error) {
        monitoringService.trackError(error, {
          context: 'payment_processing',
          payment_method: paymentMethod,
          amount: bookingDetails.total,
        });
        throw error;
      }
    }
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
    const updateUserContext = (user) => {
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

export class MonitoredErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track React errors
    monitoringService.trackError(error, {
      context: 'react_error_boundary',
      component_stack: errorInfo.componentStack,
      error_boundary: this.constructor.name,
    });
  }

  render() {
    return this.props.children;
  }
}

// ==========================================
// Helper Functions
// ==========================================

async function shareToSocial(moment: any) {
  // Implementation
}

async function compressImage(image: any) {
  // Implementation
}

async function uploadToSupabase(image: any) {
  // Implementation
}

async function processPayment(method: string) {
  // Implementation
}

function getTimeSpent() {
  return 0;
}
