import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@/hooks/useNavigationHelpers';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const MIN_PASSWORD_LENGTH = 8;

export const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { changePassword } = useAuth();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): string | null => {
    if (!oldPass.trim()) {
      return 'Please enter your current password';
    }
    if (newPass.length < MIN_PASSWORD_LENGTH) {
      return `New password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (newPass !== confirmPass) {
      return 'New passwords do not match';
    }
    if (oldPass === newPass) {
      return 'New password must be different from current password';
    }
    return null;
  };

  const handleUpdate = async () => {
    Keyboard.dismiss();

    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword(oldPass, newPass);
      if (result.success) {
        Alert.alert('Success', 'Password updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update password');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = oldPass.trim() && newPass.length >= MIN_PASSWORD_LENGTH && newPass === confirmPass;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.group}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={oldPass}
            onChangeText={setOldPass}
            placeholder="••••••••"
            placeholderTextColor="#444"
            editable={!isLoading}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
            placeholder="••••••••"
            placeholderTextColor="#444"
            editable={!isLoading}
            autoCapitalize="none"
          />
          <Text style={styles.hint}>Minimum {MIN_PASSWORD_LENGTH} characters</Text>
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={confirmPass}
            onChangeText={setConfirmPass}
            placeholder="••••••••"
            placeholderTextColor="#444"
            editable={!isLoading}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, (!isFormValid || isLoading) && styles.disabledBtn]}
          onPress={handleUpdate}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.btnText}>Update Password</Text>
          )}
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
  group: { marginBottom: 24 },
  label: { color: COLORS.text.secondary, marginBottom: 10, fontSize: 12, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, color: 'white' },
  hint: { color: COLORS.text.secondary, fontSize: 12, marginTop: 8 },
  btn: { backgroundColor: COLORS.brand.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  disabledBtn: { backgroundColor: '#333', opacity: 0.5 },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
