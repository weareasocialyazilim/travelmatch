import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { supabase } from '@/config/supabase';
import { useNavigation } from '@react-navigation/native';
import { logger } from '@/utils/logger';

interface OfferBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  dropId: string;
  templateId?: string; // Optional if generic offer
  receiverId: string;
  minTier?: number;
}

export const OfferBottomSheet: React.FC<OfferBottomSheetProps> = ({
  visible,
  onClose,
  dropId,
  templateId,
  receiverId,
  minTier = 0,
}) => {
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState(minTier || 100); // Default start
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toggles
  const [isRemote, setIsRemote] = useState(false);
  const [isStoryWorthy, setIsStoryWorthy] = useState(false);

  // Fetch Balance
  useEffect(() => {
    if (visible) {
      fetchBalance();
    }
  }, [visible]);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('users') 
        .select('coins_balance')
        .eq('id', user.id)
        .single();
      
      setBalance(data?.coins_balance || 0);
    } catch (e) {
      logger.error('Failed to fetch balance', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async () => {
    if (amount > balance) {
      Alert.alert(
        'Insufficient Balance',
        'You need more coins to send this offer.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Coins', onPress: () => {
              onClose();
              navigation.navigate('CoinStore');
            }
          }
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('create_offer_request', {
        p_receiver_id: receiverId,
        p_amount_credits: amount,
        p_message: message,
        p_drop_id: dropId,
        p_template_id: templateId,
        p_metadata: {
          is_remote: isRemote,
          is_story_worthy: isStoryWorthy
        }
      });

      if (error) throw error;

      Alert.alert('Success', 'Offer sent successfully!');
      onClose();
    } catch (error: any) {
      logger.error('Offer failed:', error);
      Alert.alert('Error', error.message || 'Failed to send offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Send Offer</Text>
          
          {/* Balance Info */}
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Your Balance:</Text>
            <View style={styles.coinBadge}>
              <MaterialCommunityIcons name="star-four-points" size={16} color={COLORS.brand.secondary} />
              <Text style={styles.balanceText}>{loading ? '...' : balance}</Text>
            </View>
          </View>

          {/* Amount Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Offer Amount (Credits)</Text>
            <View style={styles.amountSelector}>
              <TouchableOpacity 
                style={styles.amountButton} 
                onPress={() => setAmount(Math.max(minTier, amount - 50))}
              >
                <MaterialCommunityIcons name="minus" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.amountDisplay}>{amount}</Text>
              <TouchableOpacity 
                style={styles.amountButton} 
                onPress={() => setAmount(amount + 50)}
              >
                <MaterialCommunityIcons name="plus" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              {minTier > 0 ? `Minimum ${minTier} credits required` : 'Higher amounts get faster responses'}
            </Text>
          </View>

          {/* Message Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Message (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a nice note..."
              placeholderTextColor={COLORS.text.tertiary}
              multiline
              maxLength={140}
              value={message}
              onChangeText={setMessage}
            />
          </View>

          {/* New Toggles (Sprint 2) */}
          <View style={styles.section}>
            {/* Remote Support Toggle */}
            <TouchableOpacity 
              style={styles.toggleRow} 
              onPress={() => setIsRemote(!isRemote)}
            >
              <View>
                <Text style={styles.toggleTitle}>Uzaktan Destek (Remote)</Text>
                <Text style={styles.toggleDesc}>Fiziksel katilim gerektirmez</Text>
              </View>
              <View style={[styles.toggleSwitch, isRemote && styles.toggleSwitchActive]}>
                <View style={[styles.toggleThumb, isRemote && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Story Worthy Toggle */}
            <TouchableOpacity 
              style={styles.toggleRow} 
              onPress={() => setIsStoryWorthy(!isStoryWorthy)}
            >
              <View>
                <Text style={styles.toggleTitle}>Hikayelik (Story-worthy)</Text>
                <Text style={styles.toggleDesc}>Aniya donusturulebilir deneyim</Text>
              </View>
              <View style={[styles.toggleSwitch, isStoryWorthy && styles.toggleSwitchActive]}>
                <View style={[styles.toggleThumb, isStoryWorthy && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.sendButton, submitting && styles.disabledButton]} 
            onPress={handleSendOffer}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send Offer • {amount}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  balanceLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  balanceText: {
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  amountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 12,
    padding: 8,
  },
  amountButton: {
    padding: 12,
    backgroundColor: COLORS.bg.primary,
    borderRadius: 8,
  },
  amountDisplay: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text.primary,
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
