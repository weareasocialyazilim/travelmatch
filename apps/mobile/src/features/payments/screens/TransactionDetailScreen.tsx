import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { COLORS } from '@/constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { logger } from '@/utils/logger';

export const TransactionDetailScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          'TravelMatch Receipt: $150.00 for Dinner at Hotel Costes. Ref: #TM-8921',
      });
    } catch (error) {
      logger.error('Failed to share receipt', error as Error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="check" size={40} color="black" />
        </View>

        <Text style={styles.amount}>-$150.00</Text>
        <Text style={styles.status}>Success</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>To</Text>
            <View style={styles.rightGroup}>
              <Text style={styles.value}>Selin Y.</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>For</Text>
            <Text style={styles.value}>Dinner at Hotel Costes</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>Jan 2, 2026, 8:30 PM</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>Visa •••• 4242</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Reference ID</Text>
            <Text style={[styles.value, styles.monoValue]}>#TM-8921-X92</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.reportBtn}>
          <Text style={styles.reportText}>Report an Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { alignItems: 'center', padding: 20 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amount: { fontSize: 36, fontWeight: '900', color: 'white', marginBottom: 4 },
  status: { color: COLORS.brand.primary, fontWeight: '600', marginBottom: 40 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: { color: '#888', fontSize: 14 },
  value: { color: 'white', fontWeight: '600', fontSize: 14 },
  rightGroup: { flexDirection: 'row', alignItems: 'center' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  reportBtn: { marginTop: 40 },
  reportText: { color: '#666', fontSize: 14, fontWeight: '600' },
  monoValue: { fontFamily: 'monospace', fontSize: 12 },
});

export default TransactionDetailScreen;
