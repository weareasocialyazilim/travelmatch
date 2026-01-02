import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const PayoutSettingsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Payout Methods</Text>
        <TouchableOpacity><Ionicons name="add" size={24} color={COLORS.brand.primary} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.desc}>Manage where your earnings are sent.</Text>

        {/* Bank Account */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="bank" size={24} color="white" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Chase Bank</Text>
            <Text style={styles.cardSub}>**** 8829 • USD</Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.brand.primary} />
        </TouchableOpacity>

        {/* Crypto Wallet */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="bitcoin" size={24} color="white" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Coinbase Wallet</Text>
            <Text style={styles.cardSub}>0x12...8f92 • USDC</Text>
          </View>
          <View style={styles.radio} />
        </TouchableOpacity>

        {/* Wise / TransferWise */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="earth" size={24} color="white" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Wise</Text>
            <Text style={styles.cardSub}>selin@travelmatch.app</Text>
          </View>
          <View style={styles.radio} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  desc: { color: '#888', marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, marginBottom: 12 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardInfo: { flex: 1 },
  cardTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cardSub: { color: '#888', fontSize: 13, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#666' },
});
