import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

type BookingDetailScreenProps = RouteProp<RootStackParamList, 'BookingDetail'>;

interface BookingData {
  id: string;
  momentTitle: string;
  momentImage: string;
  hostName: string;
  hostAvatar: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  paymentMethod: string;
  guestCount: number;
  notes?: string;
  confirmationCode: string;
}

// Mock booking data
const getMockBooking = (bookingId: string): BookingData => ({
  id: bookingId,
  momentTitle: 'Coffee Tour Experience',
  momentImage:
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
  hostName: 'Sarah Johnson',
  hostAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  date: 'December 15, 2024',
  time: '10:00 AM',
  location: 'Brooklyn, New York',
  status: 'confirmed',
  amount: 45.0,
  paymentMethod: '•••• 4242',
  guestCount: 2,
  notes: 'Please meet at the main entrance of the coffee shop.',
  confirmationCode: 'TM-' + bookingId.toUpperCase().slice(0, 6),
});

export const BookingDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<BookingDetailScreenProps>();
  const { bookingId } = route.params;
  const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBooking(getMockBooking(bookingId));
      setLoading(false);
    }, 500);
  }, [bookingId]);

  const getStatusColor = (status: BookingData['status']) => {
    switch (status) {
      case 'pending':
        return COLORS.softOrange;
      case 'confirmed':
        return COLORS.mint;
      case 'completed':
        return COLORS.primary;
      case 'cancelled':
        return COLORS.coral;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: BookingData['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending Confirmation';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleContactHost = () => {
    if (booking) {
      navigation.navigate('Chat', {
        otherUser: {
          id: 'host-1',
          name: booking.hostName,
          avatar: booking.hostAvatar,
          role: 'Local',
          kyc: 'Verified',
          location: '',
        },
      });
    }
  };

  const handleCancelBooking = () => {
    showConfirmation({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      type: 'danger',
      icon: 'close-circle',
      confirmText: 'Cancel Booking',
      cancelText: 'Keep Booking',
      onConfirm: () => {
        showToast('Your booking has been cancelled.', 'info');
        navigation.goBack();
      },
    });
  };

  const handleAddToCalendar = () => {
    showToast('This booking has been added to your calendar.', 'success');
  };

  const handleGetDirections = () => {
    showToast('Opening maps for directions...', 'info');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color={COLORS.coral}
        />
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: getStatusColor(booking.status) + '20' },
          ]}
        >
          <MaterialCommunityIcons
            name={
              booking.status === 'confirmed' ? 'check-circle' : 'clock-outline'
            }
            size={20}
            color={getStatusColor(booking.status)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(booking.status) },
            ]}
          >
            {getStatusLabel(booking.status)}
          </Text>
        </View>

        {/* Confirmation Code */}
        <View style={styles.confirmationCard}>
          <Text style={styles.confirmationLabel}>Confirmation Code</Text>
          <Text style={styles.confirmationCode}>
            {booking.confirmationCode}
          </Text>
        </View>

        {/* Moment Card */}
        <View style={styles.momentCard}>
          <Image
            source={{ uri: booking.momentImage }}
            style={styles.momentImage}
          />
          <View style={styles.momentInfo}>
            <Text style={styles.momentTitle}>{booking.momentTitle}</Text>
            <View style={styles.hostInfo}>
              <Image
                source={{ uri: booking.hostAvatar }}
                style={styles.hostAvatar}
              />
              <Text style={styles.hostName}>Hosted by {booking.hostName}</Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{booking.date}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{booking.time}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{booking.location}</Text>
            </View>
            <TouchableOpacity onPress={handleGetDirections}>
              <MaterialCommunityIcons
                name="directions"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Guests</Text>
              <Text style={styles.detailValue}>
                {booking.guestCount}{' '}
                {booking.guestCount === 1 ? 'person' : 'people'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Host Notes</Text>
            <View style={styles.notesCard}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount</Text>
              <Text style={styles.paymentValue}>
                ${booking.amount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <Text style={styles.paymentValue}>{booking.paymentMethod}</Text>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentTotalLabel}>Total Paid</Text>
              <Text style={styles.paymentTotalValue}>
                ${booking.amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAddToCalendar}
          >
            <MaterialCommunityIcons
              name="calendar-plus"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.actionButtonText}>Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleContactHost}
          >
            <MaterialCommunityIcons
              name="message-text"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.actionButtonText}>Contact Host</Text>
          </TouchableOpacity>

          {booking.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelBooking}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={COLORS.coral}
              />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel Booking
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Support Link */}
        <TouchableOpacity
          style={styles.supportLink}
          onPress={() => navigation.navigate('Support')}
        >
          <MaterialCommunityIcons
            name="help-circle"
            size={18}
            color={COLORS.textSecondary}
          />
          <Text style={styles.supportText}>Need help? Contact Support</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  errorButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmationCard: {
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  confirmationLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  confirmationCode: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
    letterSpacing: 2,
  },
  momentCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  momentImage: {
    width: 100,
    height: 100,
  },
  momentInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  hostName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  detailsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 2,
  },
  notesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  notesCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  paymentSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  cancelButton: {
    borderColor: COLORS.coral + '30',
    backgroundColor: COLORS.coral + '10',
  },
  cancelButtonText: {
    color: COLORS.coral,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 24,
  },
  supportText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  bottomSpacer: {
    height: 32,
  },
});

// Wrap with ScreenErrorBoundary for critical booking functionality
const BookingDetailScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <BookingDetailScreen />
  </ScreenErrorBoundary>
);

export default BookingDetailScreenWithErrorBoundary;
