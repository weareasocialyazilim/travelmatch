/**
 * Lovendo - Proof Requirement UI Components
 *
 * Dynamic proof selection based on gift amount:
 * - 0-30 TL: Direct Pay (no proof)
 * - 30-100 TL: Optional (giver chooses)
 * - 100+ TL: Required (always proof)
 */

/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

// =============================================================================
// TYPES
// =============================================================================

export type ProofRequirement = 'none' | 'optional' | 'required';

export interface ProofTier {
  requirement: ProofRequirement;
  tierName: string;
  isDirectPay: boolean;
  descriptionTr: string;
  descriptionEn: string;
}

interface ProofRequirementBadgeProps {
  amount: number;
  currency: string;
  size?: 'small' | 'medium' | 'large';
}

interface ProofSelectionCardProps {
  amount: number;
  currency: string;
  onSelect: (requestProof: boolean | null) => void;
  selectedOption: boolean | null;
}

interface PaymentSummaryWithProofProps {
  amount: number;
  currency: string;
  commission: number;
  receiverGets: number;
  proofRequired: boolean;
  isDirectPay: boolean;
  receiverName: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getProofTier(amount: number): ProofTier {
  if (amount < 30) {
    return {
      requirement: 'none',
      tierName: 'direct',
      isDirectPay: true,
      descriptionTr: 'Küçük hediyeler anında iletilir',
      descriptionEn: 'Small gifts are delivered instantly',
    };
  } else if (amount < 100) {
    return {
      requirement: 'optional',
      tierName: 'optional',
      isDirectPay: false,
      descriptionTr: 'Kanıt talep edebilirsiniz',
      descriptionEn: 'You can request proof',
    };
  } else {
    return {
      requirement: 'required',
      tierName: 'required',
      isDirectPay: false,
      descriptionTr: 'Kanıt zorunludur',
      descriptionEn: 'Proof is required',
    };
  }
}

export function formatCurrency(amount: number, currency: string): string {
  const currencyMap: Record<string, string> = {
    TL: 'TRY',
    TRY: 'TRY',
    USD: 'USD',
    EUR: 'EUR',
  };
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currencyMap[currency] || 'TRY',
  }).format(amount);
}

// =============================================================================
// PROOF REQUIREMENT BADGE
// =============================================================================

export const ProofRequirementBadge: React.FC<ProofRequirementBadgeProps> = ({
  amount,
  currency: _currency,
  size = 'medium',
}) => {
  const tier = useMemo(() => getProofTier(amount), [amount]);

  const config = useMemo(() => {
    switch (tier.requirement) {
      case 'none':
        return {
          icon: 'flash',
          label: 'Anında',
          labelFull: 'Anında İletim',
          color: '#4CAF50',
          bgColor: '#E8F5E9',
        };
      case 'optional':
        return {
          icon: 'tune-variant',
          label: 'Opsiyonel',
          labelFull: 'Kanıt Opsiyonel',
          color: '#FF9800',
          bgColor: '#FFF3E0',
        };
      case 'required':
        return {
          icon: 'shield-check',
          label: 'Güvenli',
          labelFull: 'Kanıt Gerekli',
          color: '#2196F3',
          bgColor: '#E3F2FD',
        };
    }
  }, [tier.requirement]);

  const sizeStyles = {
    small: { paddingH: 6, paddingV: 3, iconSize: 12, fontSize: 10 },
    medium: { paddingH: 10, paddingV: 5, iconSize: 14, fontSize: 12 },
    large: { paddingH: 14, paddingV: 8, iconSize: 18, fontSize: 14 },
  };

  const s = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: s.paddingH,
          paddingVertical: s.paddingV,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon as any}
        size={s.iconSize}
        color={config.color}
      />
      <Text
        style={[
          styles.badgeText,
          { color: config.color, fontSize: s.fontSize },
        ]}
      >
        {size === 'small' ? config.label : config.labelFull}
      </Text>
    </View>
  );
};

// =============================================================================
// PROOF SELECTION CARD (for 30-100 TL range)
// =============================================================================

export const ProofSelectionCard: React.FC<ProofSelectionCardProps> = ({
  amount,
  currency,
  onSelect,
  selectedOption,
}) => {
  const tier = useMemo(() => getProofTier(amount), [amount]);

  // Only show for optional tier
  if (tier.requirement !== 'optional') {
    return null;
  }

  const options = [
    {
      id: 'direct',
      requestProof: false,
      icon: 'flash',
      title: 'Anında Gönder',
      subtitle: 'Hediye hemen alıcıya ulaşır',
      description: 'Kanıt beklenmez, para direkt aktarılır.',
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      pros: ['⚡ Anında teslim', '🎁 Sürpriz etkisi'],
    },
    {
      id: 'proof',
      requestProof: true,
      icon: 'shield-check',
      title: 'Kanıt İste',
      subtitle: 'Güvence altında gönder',
      description:
        'Alıcı deneyimi gerçekleştirip kanıt yükleyene kadar para güvende tutulur.',
      color: '#2196F3',
      bgColor: '#E3F2FD',
      pros: ['🔒 Para güvende', '📸 Deneyim kanıtı'],
    },
  ];

  return (
    <View style={styles.selectionContainer}>
      <View style={styles.selectionHeader}>
        <Text style={styles.selectionTitle}>Nasıl göndermek istersin?</Text>
        <Text style={styles.selectionSubtitle}>
          {formatCurrency(amount, currency)} tutarındaki hediye için seçim
          yapabilirsin
        </Text>
      </View>

      <View style={styles.optionsRow}>
        {options.map((option) => {
          const isSelected = selectedOption === option.requestProof;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected
                    ? option.bgColor
                    : COLORS.utility.white,
                  borderColor: isSelected
                    ? option.color
                    : COLORS.border.default,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => onSelect(option.requestProof)}
              activeOpacity={0.7}
            >
              {/* Selection indicator */}
              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor: isSelected
                      ? option.color
                      : COLORS.border.default,
                  },
                ]}
              >
                {isSelected && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: option.color },
                    ]}
                  />
                )}
              </View>

              {/* Icon */}
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: option.bgColor },
                ]}
              >
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={28}
                  color={option.color}
                />
              </View>

              {/* Title */}
              <Text style={styles.optionTitle}>{option.title}</Text>

              {/* Subtitle */}
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>

              {/* Pros */}
              <View style={styles.prosContainer}>
                {option.pros.map((pro, idx) => (
                  <Text
                    key={idx}
                    style={[styles.proText, { color: option.color }]}
                  >
                    {pro}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Info text based on selection */}
      {selectedOption !== null && (
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: selectedOption ? '#E3F2FD' : '#E8F5E9',
            },
          ]}
        >
          <MaterialCommunityIcons
            name={selectedOption ? 'information' : 'flash'}
            size={18}
            color={selectedOption ? '#2196F3' : '#4CAF50'}
          />
          <Text
            style={[
              styles.infoText,
              { color: selectedOption ? '#1565C0' : '#2E7D32' },
            ]}
          >
            {selectedOption
              ? 'Para, alıcı deneyimi kanıtlayana kadar güvenli şekilde tutulur. 7 gün içinde kanıt yüklenmezse iade edilir.'
              : 'Ödeme tamamlandığında para direkt alıcıya aktarılır. Geri alma imkanı yoktur.'}
          </Text>
        </View>
      )}
    </View>
  );
};

// =============================================================================
// DIRECT PAY INDICATOR
// =============================================================================

interface DirectPayIndicatorProps {
  amount: number;
  currency: string;
}

export const DirectPayIndicator: React.FC<DirectPayIndicatorProps> = ({
  amount,
  currency: _currency,
}) => {
  const tier = useMemo(() => getProofTier(amount), [amount]);

  if (!tier.isDirectPay && tier.requirement !== 'none') {
    return null;
  }

  return (
    <LinearGradient
      colors={['#43A047', '#66BB6A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.directPayBanner}
    >
      <MaterialCommunityIcons name="flash" size={20} color="#fff" />
      <View style={styles.directPayTextContainer}>
        <Text style={styles.directPayTitle}>Anında İletim</Text>
        <Text style={styles.directPaySubtitle}>
          30 TL altı hediyeler anında alıcıya ulaşır
        </Text>
      </View>
    </LinearGradient>
  );
};

// =============================================================================
// PROOF REQUIRED INDICATOR
// =============================================================================

interface ProofRequiredIndicatorProps {
  amount: number;
  currency: string;
}

export const ProofRequiredIndicator: React.FC<ProofRequiredIndicatorProps> = ({
  amount,
  currency: _currency,
}) => {
  const tier = useMemo(() => getProofTier(amount), [amount]);

  if (tier.requirement !== 'required') {
    return null;
  }

  return (
    <View style={styles.proofRequiredBanner}>
      <MaterialCommunityIcons name="shield-check" size={20} color="#1976D2" />
      <View style={styles.proofRequiredTextContainer}>
        <Text style={styles.proofRequiredTitle}>Kanıt Zorunlu</Text>
        <Text style={styles.proofRequiredSubtitle}>
          100 TL ve üzeri hediyeler için alıcının deneyimi kanıtlaması gerekir
        </Text>
      </View>
    </View>
  );
};

// =============================================================================
// PAYMENT SUMMARY WITH PROOF INFO
// =============================================================================

export const PaymentSummaryWithProof: React.FC<
  PaymentSummaryWithProofProps
> = ({
  amount,
  currency,
  commission,
  receiverGets,
  proofRequired: _proofRequired,
  isDirectPay,
  receiverName,
}) => {
  return (
    <View style={styles.summaryCard}>
      {/* Amount breakdown */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hediye tutarı</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(amount, currency)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Platform ücreti</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(commission, currency)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Toplam ödeme</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(amount + commission, currency)}
          </Text>
        </View>
      </View>

      {/* Receiver gets */}
      <View style={styles.receiverSection}>
        <View style={styles.receiverRow}>
          <MaterialCommunityIcons name="gift" size={20} color="#43A047" />
          <Text style={styles.receiverLabel}>{receiverName} alacak:</Text>
          <Text style={styles.receiverValue}>
            {formatCurrency(receiverGets, currency)}
          </Text>
        </View>
      </View>

      {/* Delivery method */}
      <View
        style={[
          styles.deliverySection,
          { backgroundColor: isDirectPay ? '#E8F5E9' : '#E3F2FD' },
        ]}
      >
        <MaterialCommunityIcons
          name={isDirectPay ? 'flash' : 'shield-check'}
          size={24}
          color={isDirectPay ? '#43A047' : '#1976D2'}
        />
        <View style={styles.deliveryTextContainer}>
          <Text
            style={[
              styles.deliveryTitle,
              { color: isDirectPay ? '#2E7D32' : '#1565C0' },
            ]}
          >
            {isDirectPay ? 'Anında İletim' : 'Güvenli İletim'}
          </Text>
          <Text
            style={[
              styles.deliverySubtitle,
              { color: isDirectPay ? '#388E3C' : '#1976D2' },
            ]}
          >
            {isDirectPay
              ? `Ödeme sonrası ${receiverName} hemen alacak`
              : `${receiverName} kanıt yükleyince aktarılacak`}
          </Text>
        </View>
        {!isDirectPay && (
          <View style={styles.escrowBadge}>
            <MaterialCommunityIcons name="lock" size={12} color="#1976D2" />
            <Text style={styles.escrowText}>Escrow</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// =============================================================================
// AMOUNT INPUT WITH TIER PREVIEW
// =============================================================================

interface AmountInputWithTierProps {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  minAmount?: number;
  maxAmount?: number;
}

export const AmountInputWithTier: React.FC<AmountInputWithTierProps> = ({
  value,
  onChange,
  currency,
  minAmount: _minAmount = 10,
  maxAmount: _maxAmount = 10000,
}) => {
  const amount = parseFloat(value) || 0;
  const tier = useMemo(() => getProofTier(amount), [amount]);

  // Quick amount buttons
  const quickAmounts = [25, 50, 100, 250, 500];

  return (
    <View style={styles.amountContainer}>
      {/* Tier indicator */}
      <View style={styles.tierPreview}>
        <View style={styles.tierDots}>
          {(['none', 'optional', 'required'] as ProofRequirement[]).map((t) => (
            <View
              key={t}
              style={[
                styles.tierDot,
                {
                  backgroundColor:
                    tier.requirement === t
                      ? t === 'none'
                        ? '#4CAF50'
                        : t === 'optional'
                          ? '#FF9800'
                          : '#2196F3'
                      : COLORS.border.default,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.tierLabels}>
          <Text
            style={[
              styles.tierLabel,
              {
                color:
                  tier.requirement === 'none'
                    ? '#4CAF50'
                    : COLORS.text.tertiary,
              },
            ]}
          >
            0-30
          </Text>
          <Text
            style={[
              styles.tierLabel,
              {
                color:
                  tier.requirement === 'optional'
                    ? '#FF9800'
                    : COLORS.text.tertiary,
              },
            ]}
          >
            30-100
          </Text>
          <Text
            style={[
              styles.tierLabel,
              {
                color:
                  tier.requirement === 'required'
                    ? '#2196F3'
                    : COLORS.text.tertiary,
              },
            ]}
          >
            100+
          </Text>
        </View>
      </View>

      {/* Current tier info */}
      {amount > 0 && (
        <View
          style={[
            styles.currentTierInfo,
            {
              backgroundColor:
                tier.requirement === 'none'
                  ? '#E8F5E9'
                  : tier.requirement === 'optional'
                    ? '#FFF3E0'
                    : '#E3F2FD',
            },
          ]}
        >
          <ProofRequirementBadge
            amount={amount}
            currency={currency}
            size="small"
          />
          <Text
            style={[
              styles.currentTierText,
              {
                color:
                  tier.requirement === 'none'
                    ? '#2E7D32'
                    : tier.requirement === 'optional'
                      ? '#E65100'
                      : '#1565C0',
              },
            ]}
          >
            {tier.descriptionTr}
          </Text>
        </View>
      )}

      {/* Quick amounts */}
      <View style={styles.quickAmounts}>
        {quickAmounts.map((qa) => {
          const qaTier = getProofTier(qa);
          return (
            <TouchableOpacity
              key={qa}
              style={[
                styles.quickAmountBtn,
                {
                  backgroundColor:
                    amount === qa ? COLORS.primary : COLORS.utility.white,
                  borderColor:
                    amount === qa ? COLORS.primary : COLORS.border.default,
                },
              ]}
              onPress={() => onChange(qa.toString())}
            >
              <Text
                style={[
                  styles.quickAmountText,
                  { color: amount === qa ? '#fff' : COLORS.text.primary },
                ]}
              >
                {qa}
              </Text>
              {qaTier.isDirectPay && (
                <MaterialCommunityIcons
                  name="flash"
                  size={10}
                  color={amount === qa ? '#fff' : '#4CAF50'}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontWeight: '600',
  },

  // Selection Card
  selectionContainer: {
    marginVertical: 16,
  },
  selectionHeader: {
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  selectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  radioOuter: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  optionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: 12,
  },
  prosContainer: {
    alignItems: 'center',
  },
  proText: {
    fontSize: 11,
    marginBottom: 2,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 18,
  },

  // Direct Pay Banner
  directPayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
    gap: 12,
  },
  directPayTextContainer: {
    flex: 1,
  },
  directPayTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  directPaySubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },

  // Proof Required Banner
  proofRequiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
    marginVertical: 12,
    gap: 12,
  },
  proofRequiredTextContainer: {
    flex: 1,
  },
  proofRequiredTitle: {
    color: '#1565C0',
    fontSize: 15,
    fontWeight: '700',
  },
  proofRequiredSubtitle: {
    color: '#1976D2',
    fontSize: 12,
    marginTop: 2,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summarySection: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.tertiary,
  },
  summaryValue: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  receiverSection: {
    backgroundColor: '#E8F5E9',
    padding: 12,
  },
  receiverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiverLabel: {
    color: '#2E7D32',
    ...TYPOGRAPHY.bodyMedium,
    flex: 1,
  },
  receiverValue: {
    color: '#1B5E20',
    fontSize: 16,
    fontWeight: '700',
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '700',
  },
  deliverySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: 2,
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 118, 210, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  escrowText: {
    color: '#1976D2',
    fontSize: 11,
    fontWeight: '600',
  },

  // Amount Input with Tier
  amountContainer: {
    marginVertical: 16,
  },
  tierPreview: {
    marginBottom: 12,
  },
  tierDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  currentTierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  currentTierText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAmountBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  quickAmountText: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
  },
});

export default {
  ProofRequirementBadge,
  ProofSelectionCard,
  DirectPayIndicator,
  ProofRequiredIndicator,
  PaymentSummaryWithProof,
  AmountInputWithTier,
  getProofTier,
  formatCurrency,
};
