import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { COLORS_DARK } from '@/theme/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type WithdrawScreenProps = StackScreenProps<RootStackParamList, 'Withdraw'>;

function WithdrawScreen({ navigation }: WithdrawScreenProps) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const BALANCE = 1240.50;

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (val > BALANCE) {
      Alert.alert('Insufficient Funds', 'You cannot withdraw more than your balance.');
      return;
    }
    Alert.alert('Success', 'Funds are on the way to your bank account! 💸', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Available Balance</Text>
        <Text style={styles.balance}>${BALANCE.toFixed(2)}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.2)"
            autoFocus
          />
        </View>

        {/* Bank Selection */}
        <View style={styles.bankCard}>
          <View style={styles.bankIcon}>
            <Ionicons name="business" size={24} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankName}>Chase Bank</Text>
            <Text style={styles.bankAccount}>**** 8829</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity
            style={[styles.btn, !amount && styles.disabledBtn]}
            onPress={handleWithdraw}
            disabled={!amount}
          >
            <Text style={styles.btnText}>Confirm Withdraw</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_DARK.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  label: {
    color: COLORS_DARK.text.secondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balance: {
    color: COLORS_DARK.brand.primary,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  currency: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
    marginRight: 4,
  },
  input: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
    minWidth: 100,
  },
  bankCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: {
    color: 'white',
    fontWeight: 'bold',
  },
  bankAccount: {
    color: '#888',
    fontSize: 12,
  },
  changeText: {
    color: COLORS_DARK.brand.primary,
    fontWeight: '600',
  },
  btn: {
    width: '100%',
    backgroundColor: COLORS_DARK.brand.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledBtn: {
    backgroundColor: '#333',
  },
  btnText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

// Wrap with ScreenErrorBoundary and NetworkGuard for critical withdrawal functionality
const WithdrawScreenWithErrorBoundary = (props: WithdrawScreenProps) => (
  <ScreenErrorBoundary>
    <NetworkGuard offlineMessage="Para çekme işlemi için internet bağlantısı gerekli.">
      <WithdrawScreen {...props} />
    </NetworkGuard>
  </ScreenErrorBoundary>
);

export default WithdrawScreenWithErrorBoundary;
