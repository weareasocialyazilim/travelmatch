import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof Icon>['name'];

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  color: string;
  icon: IconName;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    color: COLORS.textSecondary,
    icon: 'gift',
    features: [
      '3 gestures per month',
      'Basic proof verification',
      'Community access',
      'Profile with Trust Score',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 10,
    interval: 'month',
    color: COLORS.primary,
    icon: 'rocket',
    features: [
      '10 gestures per month',
      'Priority proof verification',
      'Advanced analytics',
      'Badge & recognition',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    interval: 'month',
    popular: true,
    color: COLORS.accent,
    icon: 'star',
    features: [
      'Unlimited gestures',
      'Instant verification',
      'Premium analytics',
      'Featured profile',
      'Priority support',
      'API access',
      'Custom branding',
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 50,
    interval: 'month',
    color: COLORS.warning,
    icon: 'crown',
    features: [
      'All Pro features',
      'Dedicated account manager',
      'White-label solution',
      'Custom integrations',
      'Enterprise support',
      'Exclusive events access',
      'Partnership opportunities',
    ],
  },
];

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

  const handleSubscribe = (planId: string) => {
    // Implement subscription logic
    console.log('Subscribe to plan', { planId });
  };

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedPlan === plan.id;
    const displayPrice =
      billingInterval === 'year' ? plan.price * 10 : plan.price;

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

        <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
          <Icon name={plan.icon} size={32} color={COLORS.white} />
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
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.featureText}>{feature}</Text>
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
              colors={[plan.color, plan.color + '80']}
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
    fontSize: 24,
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '500',
    marginLeft: LAYOUT.padding,
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
    fontSize: 16,
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
    fontSize: 20,
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
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  infoTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 4,
  },
  interval: {
    alignSelf: 'flex-end',
    color: COLORS.textSecondary,
    fontSize: 16,
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
    fontSize: 24,
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
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '600',
  },
});
