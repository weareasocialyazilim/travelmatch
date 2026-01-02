import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '@/constants/colors';
import { Skeleton } from '@/components/ui/Skeleton';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type TicketScreenRouteProp = RouteProp<RootStackParamList, 'Ticket'>;

interface TicketData {
  id: string;
  momentTitle: string;
  momentImage: string;
  date: string;
  time: string;
  hostName: string;
  guestName: string;
  status: 'pending' | 'paid' | 'used' | 'expired';
  confirmationCode: string;
  qrValue: string;
}

// Mock ticket data - in production this would come from API
const getMockTicket = (bookingId: string): TicketData => ({
  id: bookingId,
  momentTitle: 'Dinner at Hotel Costes',
  momentImage:
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=500',
  date: 'Today',
  time: '20:00',
  hostName: 'Selin Y.',
  guestName: 'Kemal A.',
  status: 'paid',
  confirmationCode: 'TM-' + bookingId.toUpperCase().slice(0, 4) + '-XK',
  qrValue: `travelmatch-ticket-${bookingId}`,
});

export const TicketScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<TicketScreenRouteProp>();
  const { bookingId } = route.params;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTicket(getMockTicket(bookingId));
      setLoading(false);
    }, 500);
  }, [bookingId]);

  const getStatusColor = (status: TicketData['status']) => {
    switch (status) {
      case 'paid':
        return COLORS.feedback.success;
      case 'pending':
        return COLORS.feedback.warning;
      case 'used':
        return COLORS.text.secondary;
      case 'expired':
        return COLORS.feedback.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusLabel = (status: TicketData['status']) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'used':
        return 'Used';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text.onDark}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <View style={styles.ticketContainer}>
            <Skeleton width="100%" height={200} borderRadius={0} />
            <View style={styles.ticketBottom}>
              <Skeleton width={150} height={150} borderRadius={8} />
              <Skeleton width={120} height={24} style={styles.skeletonMarginTop} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="ticket-outline"
          size={64}
          color={COLORS.text.secondary}
        />
        <Text style={styles.errorText}>Ticket not found</Text>
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
            color={COLORS.text.onDark}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Your Vibe Pass</Text>

        <View style={styles.ticketContainer}>
          {/* Top Part: Image */}
          <View style={styles.ticketTop}>
            <Image source={{ uri: ticket.momentImage }} style={styles.image} />
            <View style={styles.overlay}>
              <Text style={styles.momentTitle}>{ticket.momentTitle}</Text>
              <Text style={styles.date}>
                {ticket.date}, {ticket.time}
              </Text>
            </View>
          </View>

          {/* Middle Part: Dashed Line with circles */}
          <View style={styles.ripLine}>
            <View style={styles.circleLeft} />
            <View style={styles.dashContainer}>
              {Array.from({ length: 20 }).map((_, index) => (
                <View key={index} style={styles.dashSegment} />
              ))}
            </View>
            <View style={styles.circleRight} />
          </View>

          {/* Bottom Part: QR */}
          <View style={styles.ticketBottom}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={ticket.qrValue}
                size={150}
                backgroundColor="white"
                color={COLORS.text.primary}
              />
            </View>
            <Text style={styles.codeText}>{ticket.confirmationCode}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Host</Text>
                <Text style={styles.val}>{ticket.hostName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Guest</Text>
                <Text style={styles.val}>{ticket.guestName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Status</Text>
                <Text
                  style={[styles.val, { color: getStatusColor(ticket.status) }]}
                >
                  {getStatusLabel(ticket.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brand.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.onDark,
    marginTop: 16,
  },
  errorButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.utility.white,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brand.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text.primary,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  ticketContainer: {
    width: width * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.utility.white,
    // Shadow for iOS
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    // Elevation for Android
    elevation: 10,
  },
  ticketTop: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  momentTitle: {
    color: COLORS.utility.white,
    fontWeight: 'bold',
    fontSize: 20,
  },
  date: {
    color: COLORS.brand.primary,
    fontWeight: '600',
    marginTop: 4,
    fontSize: 14,
  },
  ripLine: {
    height: 40,
    backgroundColor: COLORS.utility.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  circleLeft: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.brand.primary,
    marginLeft: -15,
  },
  circleRight: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.brand.primary,
    marginRight: -15,
  },
  dashContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    gap: 4,
  },
  dashSegment: {
    width: 8,
    height: 1,
    backgroundColor: COLORS.border.default,
  },
  ticketBottom: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: COLORS.utility.white,
    borderRadius: 8,
  },
  codeText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: COLORS.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  infoItem: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
  },
  val: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.text.primary,
    marginTop: 4,
  },
  skeletonMarginTop: {
    marginTop: 16,
  },
});

// Wrap with ScreenErrorBoundary
const TicketScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <TicketScreen />
  </ScreenErrorBoundary>
);

export default TicketScreenWithErrorBoundary;
