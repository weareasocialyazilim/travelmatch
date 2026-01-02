import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const _screenWidth = Dimensions.get('window').width;

const CHART_DATA = [40, 65, 30, 80, 55, 90, 70]; // Mock data for bar chart

export const EarningsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host Analytics</Text>
        <TouchableOpacity style={styles.periodBtn}>
          <Text style={styles.periodText}>This Month</Text>
          <Ionicons name="chevron-down" size={16} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Total Earnings Card */}
        <LinearGradient
          colors={[COLORS.brand.secondary, '#4a00e0']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>Total Earned</Text>
          <Text style={styles.heroValue}>$3,450.00</Text>
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up" size={16} color="white" />
            <Text style={styles.trendText}>+12% vs last month</Text>
          </View>
        </LinearGradient>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Performance</Text>
          <View style={styles.chartRow}>
            {CHART_DATA.map((value, index) => (
              <View key={index} style={styles.barWrapper}>
                <View style={[styles.bar, { height: value }]} />
                <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <BlurView intensity={20} style={styles.statBox}>
            <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.brand.primary} />
            <Text style={styles.statVal}>24</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </BlurView>
          <BlurView intensity={20} style={styles.statBox}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#FFD700" />
            <Text style={styles.statVal}>12h</Text>
            <Text style={styles.statLabel}>Avg. Response</Text>
          </BlurView>
        </View>

        {/* Recent Payouts */}
        <Text style={styles.sectionTitle}>Recent Payouts</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.payoutRow}>
            <View style={styles.payoutIcon}>
              <MaterialCommunityIcons name="bank-transfer" size={24} color="white" />
            </View>
            <View style={styles.payoutInfo}>
              <Text style={styles.payoutTitle}>Weekly Payout</Text>
              <Text style={styles.payoutDate}>Jan {20 - item}, 2026</Text>
            </View>
            <Text style={styles.payoutAmount}>+$450.00</Text>
          </View>
        ))}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  periodBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  periodText: { color: 'white', fontSize: 12, fontWeight: '600' },
  content: { padding: 20 },
  heroCard: { padding: 24, borderRadius: 24, marginBottom: 30, shadowColor: COLORS.brand.secondary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  heroValue: { color: 'white', fontSize: 42, fontWeight: '900', marginBottom: 12 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  trendText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  chartContainer: { marginBottom: 30 },
  chartTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingBottom: 10 },
  barWrapper: { alignItems: 'center', gap: 8 },
  bar: { width: 12, backgroundColor: COLORS.brand.primary, borderRadius: 6 },
  barLabel: { color: '#666', fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 20, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statVal: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 12 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 10, borderRadius: 16 },
  payoutIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  payoutInfo: { flex: 1 },
  payoutTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  payoutDate: { color: '#666', fontSize: 12 },
  payoutAmount: { color: COLORS.brand.primary, fontWeight: 'bold', fontSize: 16 },
});
