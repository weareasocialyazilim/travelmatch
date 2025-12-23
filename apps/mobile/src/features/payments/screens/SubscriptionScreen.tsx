import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator as _ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { LAYOUT } from '@/constants/layout';
import { PLANS } from '../constants/plans';
import { VALUES } from '@/constants/values';
import { subscriptionsService } from '@/services/supabase';
import { logger } from '@/utils/logger';
import type { Plan, SubscriptionPlan } from '../constants/plans';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Icon>['name'];

/**
 * SubscriptionScreen - Membership plans selection
 *
 * Design Guidelines (Adrian K / DESIGNME):
 * - Clearly show available plans, pricing, and features
 * - Highlight the most popular option
 * - Briefly describe benefits and include a clear call to action
 * - Keep the process simple
 * - Implement biometric authentication for quick verification
 */

type SubscriptionScreenProps = StackScreenProps<
  RootStackParamList,
  'Subscription'
>;

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('first_class');
  const [plans, setPlans] = useState<SubscriptionPlan[]>(PLANS);
  const [_loading, _setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      _setLoading(true);
      const { data } = await subscriptionsService.getPlans();
      if (data && data.length > 0) {
        // Map API plans to our structure if needed
        // For now, use static plans
        setPlans(PLANS);
      }
      _setLoading(false);
    };
    fetchPlans();
  }, []);

  const handleSubscribe = (planId: string) => {
    // Implement subscription logic
    logger.debug('Subscribe to plan', { planId });
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    const planColor = plan.color || COLORS.primary;
    const isFree = plan.price === 0;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlan,
          isSelected && { borderColor: planColor },
        ]}
        onPress={() => setSelectedPlan(plan.id)}
        activeOpacity={0.8}
      >
        {plan.popular && (
          <View style={[styles.popularBadge, { backgroundColor: planColor }]}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        <View style={[styles.planIcon, { backgroundColor: planColor }]}>
          <Icon name={plan.icon as IconName} size={32} color={COLORS.white} />
        </View>

        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planTagline}>{plan.tagline}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.price}>{plan.price}</Text>
          <Text style={styles.interval}>/month</Text>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.slice(0, 6).map((feature) => (
            <View key={`${plan.id}-${feature.text}`} style={styles.featureRow}>
              <Icon
                name={feature.included ? 'check-circle' : 'close-circle'}
                size={16}
                color={feature.included ? planColor : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.featureText,
                  !feature.included && styles.featureDisabled,
                ]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
          {plan.features.length > 6 && (
            <Text style={[styles.moreFeatures, { color: planColor }]}>
              +{plan.features.length - 6} more features
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, isFree && styles.freeButton]}
          onPress={() => handleSubscribe(plan.id)}
          activeOpacity={0.8}
        >
          {isFree ? (
            <View style={styles.freeButtonInner}>
              <Text style={styles.freeButtonText}>Current Plan</Text>
            </View>
          ) : (
            <LinearGradient
              colors={[planColor, planColor + 'CC']}
              style={styles.subscribeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.subscribeText}>
                {isSelected ? 'Get ' + plan.name : 'Select Plan'}
              </Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Plans</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Choose the plan that fits your travel style
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {plans.map(renderPlanCard)}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={24} color={COLORS.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Flexible Billing</Text>
            <Text style={styles.infoText}>
              Cancel anytime. All plans include 14-day money-back guarantee.
            </Text>
          </View>
        </View>

        {/* Benefits Summary */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Why Upgrade?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon name="compass" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Create more moments & share experiences</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="message-text" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Unlimited messaging with travelers</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="gift" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Send more gifts & show appreciation</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="shield-check" size={20} color={COLORS.success} />
              <Text style={styles.benefitText}>Get verified badge & build trust</Text>
            </View>
          </View>
        </View>

        {/* Biometric Payment Hint */}
        <View style={styles.biometricHint}>
          <Icon
            name={Platform.OS === 'ios' ? 'face-recognition' : 'fingerprint'}
            size={24}
            color={COLORS.primary}
          />
          <View style={styles.biometricContent}>
            <Text style={styles.biometricTitle}>Quick & Secure Checkout</Text>
            <Text style={styles.biometricText}>
              Use {Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint'} for fast payment verification
            </Text>
          </View>
        </View>

        {/* FAQ Link */}
        <TouchableOpacity
          style={styles.faqButton}
          onPress={() => navigation.navigate('FAQ')}
        >
          <Icon name="help-circle" size={20} color={COLORS.primary} />
          <Text style={styles.faqText}>View Frequently Asked Questions</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  currency: {
    color: COLORS.text,
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    marginRight: LAYOUT.padding / 4,
  },
  subtitleContainer: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  planTagline: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.padding,
  },
  moreFeatures: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginTop: LAYOUT.padding / 2,
  },
  benefitsCard: {
    backgroundColor: COLORS.mintTransparent,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding * 2,
  },
  benefitsTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
  },
  benefitsList: {
    gap: LAYOUT.padding,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.padding,
  },
  benefitText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  biometricHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding * 2,
    gap: LAYOUT.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  biometricContent: {
    flex: 1,
  },
  biometricTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: LAYOUT.padding / 4,
  },
  biometricText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  faqButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  faqText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: LAYOUT.padding,
  },
  featureText: {
    color: COLORS.text,
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    marginLeft: LAYOUT.padding,
  },
  featureDisabled: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  featuresContainer: {
    marginBottom: LAYOUT.padding * 2,
  },
  freeButton: {
    backgroundColor: COLORS.border,
  },
  freeButtonInner: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  freeButtonText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 2,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: COLORS.info + '20',
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 2,
    padding: LAYOUT.padding * 1.5,
  },
  infoContent: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  infoText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    fontWeight: '400',
    lineHeight: 18,
  },
  infoTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 4,
  },
  interval: {
    alignSelf: 'flex-end',
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    marginBottom: LAYOUT.padding / 2,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    marginBottom: LAYOUT.padding * 2,
    padding: LAYOUT.padding * 2,
    position: 'relative',
    ...VALUES.shadow,
  },
  planIcon: {
    alignItems: 'center',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: LAYOUT.padding * 1.5,
    width: 64,
  },
  planName: {
    color: COLORS.text,
    ...TYPOGRAPHY.h2,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
  },
  popularBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: VALUES.borderRadius / 2,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    position: 'absolute',
    right: LAYOUT.padding * 2,
    top: -10,
  },
  popularText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  price: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '800',
  },
  priceContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: LAYOUT.padding / 2,
  },
  scrollContent: {
    paddingBottom: LAYOUT.padding * 4,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  scrollView: {
    flex: 1,
  },
  selectedPlan: {
    borderColor: COLORS.primary,
  },
  subscribeButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  subscribeGradient: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  subscribeText: {
    color: COLORS.white,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
});
