import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [confirmText, setConfirmText] = useState('');
  const CONFIRMATION_KEY = "DELETE";

  const handleDelete = () => {
    if (confirmText !== CONFIRMATION_KEY) return;
    Keyboard.dismiss();

    Alert.alert(
      "Final Goodbye",
      "Your account and all associated data will be permanently deleted. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] })
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.warningBox}>
          <MaterialCommunityIcons name="alert-decagram" size={48} color="#FF4444" />
          <Text style={styles.warningTitle}>Warning: Irreversible Action</Text>
          <Text style={styles.warningDesc}>
            Deleting your account will remove all your moments, matches, chats, and wallet history.
            Any remaining balance in your wallet will be forfeited if not withdrawn.
          </Text>
        </View>

        <Text style={styles.label}>To confirm, type "{CONFIRMATION_KEY}" below:</Text>

        <TextInput
          style={styles.input}
          placeholder={CONFIRMATION_KEY}
          placeholderTextColor="#666"
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={[styles.deleteBtn, confirmText !== CONFIRMATION_KEY && styles.disabledBtn]}
          disabled={confirmText !== CONFIRMATION_KEY}
          onPress={handleDelete}
        >
          <Text style={styles.deleteText}>Permanently Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>I changed my mind, keep it.</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 24, alignItems: 'center' },
  warningBox: { backgroundColor: 'rgba(255, 68, 68, 0.1)', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)' },
  warningTitle: { color: '#FF4444', fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  warningDesc: { color: '#FF8888', textAlign: 'center', lineHeight: 22 },
  label: { color: 'white', fontSize: 16, marginBottom: 12 },
  input: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', height: 60, borderRadius: 12, textAlign: 'center', color: 'white', fontSize: 20, fontWeight: 'bold', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 40 },
  deleteBtn: { width: '100%', backgroundColor: '#FF4444', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  disabledBtn: { backgroundColor: '#333', opacity: 0.5 },
  deleteText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12 },
  cancelText: { color: COLORS.text.secondary, fontWeight: '600' },
});

export default DeleteAccountScreen;
