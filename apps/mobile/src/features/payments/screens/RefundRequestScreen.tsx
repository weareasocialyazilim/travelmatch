import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';

export const RefundRequestScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  // route.params?.transactionId normalde burada kullanılır
  const [reason, setReason] = useState('');

  const REASONS = [
    'Event Cancelled',
    'Host did not show up',
    'Experience was different than described',
    'Accidental Purchase'
  ];
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleSubmit = () => {
    navigation.goBack();
    // Show success toast
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Request Refund</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.txSummary}>
          <Text style={styles.txLabel}>Transaction #TM-8921</Text>
          <Text style={styles.txAmount}>$150.00</Text>
        </View>

        <Text style={styles.label}>Select Reason</Text>
        <View style={styles.reasons}>
          {REASONS.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.reasonChip, selectedReason === r && styles.activeReason]}
              onPress={() => setSelectedReason(r)}
            >
              <Text style={[styles.reasonText, selectedReason === r && styles.activeReasonText]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Details</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Please explain what happened..."
          placeholderTextColor="#666"
          value={reason}
          onChangeText={setReason}
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.brand.primary} />
          <Text style={styles.infoText}>Refunds are processed within 3-5 business days if approved.</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, !selectedReason && styles.disabledBtn]}
          disabled={!selectedReason}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 24 },
  txSummary: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 30 },
  txLabel: { color: '#888', marginBottom: 4 },
  txAmount: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  label: { color: 'white', fontWeight: 'bold', marginBottom: 16, fontSize: 16 },
  reasons: { gap: 10, marginBottom: 30 },
  reasonChip: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  activeReason: { borderColor: COLORS.brand.primary, backgroundColor: 'rgba(204, 255, 0, 0.1)' },
  reasonText: { color: '#ccc' },
  activeReasonText: { color: 'white', fontWeight: 'bold' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, color: 'white', height: 120, textAlignVertical: 'top', marginBottom: 24 },
  infoBox: { flexDirection: 'row', backgroundColor: 'rgba(204, 255, 0, 0.1)', padding: 16, borderRadius: 12, gap: 12, marginBottom: 30 },
  infoText: { color: COLORS.brand.primary, flex: 1, fontSize: 13, lineHeight: 18 },
  submitBtn: { backgroundColor: COLORS.brand.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#333' },
  submitText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
