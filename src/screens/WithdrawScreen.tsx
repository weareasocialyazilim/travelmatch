import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type WithdrawScreenProps = StackScreenProps<RootStackParamList, 'Withdraw'>;

export default function WithdrawScreen({ navigation }: WithdrawScreenProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const availableBalance = 1250.0;
  const pendingEscrow = 500.0;

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    // Navigate to success screen with withdrawal details
    navigation.navigate('Success', { 
      type: 'withdraw',
      details: {
        amount: parseFloat(amount),
        destination: 'Bank Account (••• 4242)',
        estimatedArrival: '1-3 business days',
        referenceId: 'WD-' + Date.now().toString().slice(-8),
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
            }}
            style={styles.balanceImage}
          />
          <View style={styles.balanceOverlay}>
            <Text style={styles.balanceLabel}>Available to withdraw</Text>
            <Text style={styles.balanceAmount}>
              ${availableBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Pending Escrow */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pending in escrow</Text>
          <Text style={styles.infoValue}>${pendingEscrow.toFixed(2)}</Text>
        </View>

        {/* Payout Account Section */}
        <Text style={styles.sectionTitle}>Payout account</Text>
        <View style={styles.accountCard}>
          <View style={styles.accountInfo}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="bank"
                size={24}
                color={COLORS.text}
              />
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountNumber}>•••• 1234</Text>
              <Text style={styles.accountBank}>Bank of America</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={() => navigation.navigate('PaymentMethods')}
            activeOpacity={0.7}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <Text style={styles.sectionTitle}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="$0.00"
          placeholderTextColor={COLORS.textSecondary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        {/* Note Input */}
        <TextInput
          style={styles.input}
          placeholder="Note (optional)"
          placeholderTextColor={COLORS.textSecondary}
          value={note}
          onChangeText={setNote}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Payouts typically arrive in 1-3 business days
        </Text>
        <TouchableOpacity style={styles.confirmButton} onPress={handleWithdraw}>
          <Text style={styles.confirmButtonText}>Confirm withdraw</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  balanceImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  balanceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  balanceLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  accountBank: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  changeButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.text,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bottomSpacer: {
    height: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
