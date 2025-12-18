import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator as _ActivityIndicator,
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
import type { Plan } from '../constants/plans';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type SubscriptionScreenProps = StackScreenProps<
  RootStackParamList,
  'Subscription'
>;

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  navigation,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>(
    'month',
  );
  const [_plans, _setPlans] = useState<Plan[]>(PLANS);
  const [_loading, _setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      _setLoading(true);
      const { data } = await subscriptionsService.getPlans();
      if (data && data.length > 0) {
        const mappedPlans: Plan[] = data.map((p: { id: string; name: string; price: number; currency?: string; interval: 'month' | 'year'; features?: Array<{ text: string; included: boolean }>; is_popular?: boolean }) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          currency: p.currency || 'USD',
          interval: p.interval,
          features: p.features || [],
          popular: p.is_popular,
        }));
        _setPlans(mappedPlans);
      }
      _setLoading(false);
    };
    fetchPlans();
  }, []);

  const handleSubscribe = (planId: string) => {
    // Implement subscription logic
    logger.debug('Subscribe to plan', { planId });
  };

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedPlan === plan.id;
    const displayPrice =
      billingInterval === 'year' ? plan.price * 10 : plan.price;
    const planColor = plan.popular ? COLORS.primary : COLORS.mint;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[styles.planCard, isSelected && styles.selectedPlan]}
        onPress={() => setSelectedPlan(plan.id)}
        activeOpacity={0.8}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        <View style={[styles.planIcon, { backgroundColor: planColor }]}>
          <Icon name="crown" size={32} color={COLORS.white} />
        </View>

        <Text style={styles.planName}>{plan.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.price}>{displayPrice}</Text>
          <Text style={styles.interval}>/{billingInterval}</Text>
        </View>

        {billingInterval === 'year' && plan.price > 0 && (
          <Text style={styles.savings}>Save 20%</Text>
        )}

        <View style={styles.featuresContainer}>
          {plan.features.map((feature) => (
            <View key={`${plan.id}-${feature.text}`} style={styles.featureRow}>
              <Icon name={feature.included ? "check-circle" : "close-circle"} size={16} color={feature.included ? COLORS.success : COLORS.textSecondary} />
              <Text style={[styles.featureText, !feature.included && styles.featureDisabled]}>{feature.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            plan.id === 'free' && styles.freeButton,
          ]}
          onPress={() => handleSubscribe(plan.id)}
          activeOpacity={0.8}
        >
          {plan.id === 'free' ? (
            <View style={styles.freeButtonInner}>
              <Text style={styles.freeButtonText}>Current Plan</Text>
            </View>
          ) : (
            <LinearGradient
              colors={[planColor, planColor + '80']}
              style={styles.subscribeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.subscribeText}>
                {isSelected ? 'Subscribe' : 'Select Plan'}
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

      {/* Billing Toggle */}
      <View style={styles.billingToggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            billingInterval === 'month' && styles.activeToggle,
          ]}
          onPress={() => setBillingInterval('month')}
        >
          <Text
            style={[
              styles.toggleText,
              billingInterval === 'month' && styles.activeToggleText,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            billingInterval === 'year' && styles.activeToggle,
          ]}
          onPress={() => setBillingInterval('year')}
        >
          <Text
            style={[
              styles.toggleText,
              billingInterval === 'year' && styles.activeToggleText,
            ]}
          >
            Yearly
          </Text>
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>-20%</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PLANS.map(renderPlanCard)}

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
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  activeToggleText: {
    color: COLORS.white,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  billingToggle: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginHorizontal: LAYOUT.padding * 2,
    marginVertical: LAYOUT.padding * 2,
    padding: LAYOUT.padding / 2,
    ...VALUES.shadow,
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
  savings: {
    color: COLORS.success,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginBottom: LAYOUT.padding * 1.5,
  },
  savingsBadge: {
    backgroundColor: COLORS.success,
    borderRadius: VALUES.borderRadius / 4,
    marginLeft: LAYOUT.padding / 2,
    paddingHorizontal: LAYOUT.padding / 2,
    paddingVertical: LAYOUT.padding / 4,
  },
  savingsText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
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
  toggleButton: {
    alignItems: 'center',
    borderRadius: VALUES.borderRadius / 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding,
  },
  toggleText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
});
