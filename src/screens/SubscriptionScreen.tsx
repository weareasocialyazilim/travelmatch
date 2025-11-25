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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  color: string;
  icon: string;
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

export const SubscriptionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const handleSubscribe = (planId: string) => {
    // Implement subscription logic
    console.log('Subscribe to:', planId);
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 2,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 40,
  },
  billingToggle: {
    flexDirection: 'row',
    marginHorizontal: LAYOUT.padding * 2,
    marginVertical: LAYOUT.padding * 2,
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding / 2,
    ...VALUES.shadow,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding,
    borderRadius: VALUES.borderRadius / 2,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeToggleText: {
    color: COLORS.white,
  },
  savingsBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: LAYOUT.padding / 2,
    paddingVertical: LAYOUT.padding / 4,
    borderRadius: VALUES.borderRadius / 4,
    marginLeft: LAYOUT.padding / 2,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 4,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding * 2,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    ...VALUES.shadow,
  },
  selectedPlan: {
    borderColor: COLORS.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: LAYOUT.padding * 2,
    backgroundColor: COLORS.accent,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: VALUES.borderRadius / 2,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  planIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.padding * 1.5,
  },
  planName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.padding / 2,
  },
  currency: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: LAYOUT.padding / 4,
  },
  price: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text,
  },
  interval: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
    marginBottom: LAYOUT.padding / 2,
  },
  savings: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: LAYOUT.padding * 1.5,
  },
  featuresContainer: {
    marginBottom: LAYOUT.padding * 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.padding,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: LAYOUT.padding,
    flex: 1,
  },
  subscribeButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: LAYOUT.padding * 1.5,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  freeButton: {
    backgroundColor: COLORS.border,
  },
  freeButtonInner: {
    paddingVertical: LAYOUT.padding * 1.5,
    alignItems: 'center',
  },
  freeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '20',
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding * 2,
  },
  infoContent: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding / 4,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  faqText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: LAYOUT.padding / 2,
  },
});
