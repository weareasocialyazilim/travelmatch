import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type TermsOfServiceScreenProps = StackScreenProps<
  RootStackParamList,
  'TermsOfService'
>;

export default function TermsOfServiceScreen({
  navigation,
}: TermsOfServiceScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: Jan 2026</Text>

        <Text style={styles.section}>1. Introduction</Text>
        <Text style={styles.para}>Welcome to TravelMatch. By using our app, you agree to these terms. We connect travelers with local experiences through a gifting mechanism.</Text>

        <Text style={styles.section}>2. User Conduct</Text>
        <Text style={styles.para}>You agree to treat all users with respect. Harassment, hate speech, and fraudulent activities will result in an immediate ban.</Text>

        <Text style={styles.section}>3. Payments & Refunds</Text>
        <Text style={styles.para}>All payments are held in escrow. Refunds are available up to 24 hours before the scheduled moment. After that, payments are non-refundable.</Text>

        <Text style={styles.section}>4. Safety</Text>
        <Text style={styles.para}>While we verify users, you are responsible for your own safety. Please read our Safety Tips section before meeting anyone.</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 24 },
  lastUpdated: { color: '#666', fontSize: 12, marginBottom: 20 },
  section: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  para: { color: COLORS.text.secondary, fontSize: 15, lineHeight: 24 },
});
