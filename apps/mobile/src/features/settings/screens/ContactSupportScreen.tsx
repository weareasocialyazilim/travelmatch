import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const ContactSupportScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    Keyboard.dismiss();
    Alert.alert('Message Sent', 'Our team will get back to you within 24 hours.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Topic</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Payment Issue"
          placeholderTextColor="#666"
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your issue in detail..."
          placeholderTextColor="#666"
          multiline
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.uploadBtn}>
          <MaterialCommunityIcons name="paperclip" size={20} color={COLORS.brand.primary} />
          <Text style={styles.uploadText}>Attach Screenshot</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, (!subject || !message) && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={!subject || !message}
        >
          <Text style={styles.submitText}>Send Message</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerSpacer: { width: 28 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 24 },
  label: { color: 'white', fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, color: 'white', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  textArea: { height: 150, textAlignVertical: 'top' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, padding: 12 },
  uploadText: { color: COLORS.brand.primary, fontWeight: '600' },
  submitBtn: { marginTop: 40, backgroundColor: COLORS.brand.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#333', opacity: 0.5 },
  submitText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
