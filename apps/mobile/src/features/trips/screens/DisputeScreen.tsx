import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';

export const DisputeScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const ISSUES = [
    'Service not as described',
    'Host/Guest behavior',
    'Safety concern',
    'Payment issue'
  ];

  const handleSubmit = () => {
    Alert.alert('Dispute Filed', 'Case #9281 opened. Our trust & safety team will review it within 48 hours.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Open Dispute</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="shield-alert" size={24} color="#FF4444" />
          <Text style={styles.warningText}>Please attempt to resolve the issue with the user via chat before opening a dispute.</Text>
        </View>

        <Text style={styles.label}>What went wrong?</Text>
        {ISSUES.map((issue) => (
          <TouchableOpacity
            key={issue}
            style={[styles.option, selectedIssue === issue && styles.optionActive]}
            onPress={() => setSelectedIssue(issue)}
          >
            <Text style={[styles.optionText, selectedIssue === issue && styles.optionTextActive]}>{issue}</Text>
            {selectedIssue === issue && <Ionicons name="radio-button-on" size={20} color={COLORS.brand.primary} />}
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Evidence</Text>
        <TouchableOpacity style={styles.uploadBtn}>
          <Ionicons name="images-outline" size={24} color="white" />
          <Text style={styles.uploadText}>Upload Screenshots / Photos</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Additional Details</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Provide specific timestamps and details..."
          placeholderTextColor="#666"
        />

        <TouchableOpacity
          style={[styles.submitBtn, !selectedIssue && styles.disabledBtn]}
          disabled={!selectedIssue}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Submit Dispute</Text>
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
  warningBox: { flexDirection: 'row', backgroundColor: 'rgba(255, 68, 68, 0.1)', padding: 16, borderRadius: 12, gap: 12, marginBottom: 30, alignItems: 'center' },
  warningText: { color: '#FF8888', flex: 1, fontSize: 13, lineHeight: 18 },
  label: { color: 'white', fontWeight: 'bold', marginBottom: 12, marginTop: 10, fontSize: 16 },
  option: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 10, borderRadius: 12, alignItems: 'center' },
  optionActive: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: COLORS.brand.primary, borderWidth: 1 },
  optionText: { color: '#ccc' },
  optionTextActive: { color: 'white', fontWeight: 'bold' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 16, marginBottom: 20 },
  uploadText: { color: 'white', fontWeight: '600' },
  textArea: { height: 120, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, color: 'white', textAlignVertical: 'top', marginBottom: 40 },
  submitBtn: { backgroundColor: '#FF4444', padding: 18, borderRadius: 16, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#333' },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
