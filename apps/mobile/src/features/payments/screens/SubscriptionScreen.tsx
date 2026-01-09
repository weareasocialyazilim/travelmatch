import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import type { SubscriptionPlan } from '../constants/plans';
import type { RootStackParamList } from '@/navigation/routeParams';
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await subscriptionsService.getPlans();
        if (!error && data && data.length > 0) {
          // Map API plans to SubscriptionPlan structure
          const mappedPlans: SubscriptionPlan[] = data.map((apiPlan: any) => {
            // Find matching static plan for features/limits
            const staticPlan = PLANS.find((p) => p.id === apiPlan.id);
            return {
              id: apiPlan.id,
              name: apiPlan.name,
              tagline: staticPlan?.tagline || apiPlan.description || '',
              price: Number(apiPlan.price) || 0,
              currency: apiPlan.currency || 'USD',
              interval: apiPlan.interval || 'month',
              features: apiPlan.features || staticPlan?.features || [],
              limits: staticPlan?.limits || {
                momentsPerMonth: 3,
                messagesPerDay: 20,
                giftsPerMonth: 1,
                savedMoments: 10,
                photoPerMoment: 5,
              },
              popular: apiPlan.is_popular || false,
              icon: apiPlan.icon || staticPlan?.icon || 'star-four-points',
              color: apiPlan.color || staticPlan?.color || COLORS.brand.primary,
            };
          });
          setPlans(mappedPlans);
        } else {
          // Fallback to static plans if API fails
          logger.debug('Using static plans (API returned empty or error)');
          setPlans(PLANS);
        }
      } catch (error) {
        logger.error('Failed to fetch plans:', error);
        setPlans(PLANS);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    if (plan.price === 0) {
      // Free plan - no payment needed
      logger.debug('Selected free plan', { planId });
      return;
    }

    // Navigate to checkout with selected plan
    navigation.navigate('Checkout', {
      momentId: planId, // Use momentId for plan identifier
      title: plan.name,
      amount: plan.price,
    });
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    const planColor = plan.color || COLORS.brand.primary;
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
          <Icon
            name={plan.icon as IconName}
            size={32}
            color={COLORS.utility.white}
          />
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
                color={feature.included ? planColor : COLORS.text.secondary}
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
        colors={[COLORS.brand.primary, COLORS.brand.accent]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.utility.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Plans</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Daha fazla bağlantı, daha fazla hediye, daha fazla an 💝
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.brand.primary} />
            <Text style={styles.loadingText}>Planlar yükleniyor...</Text>
          </View>
        ) : (
          plans.map(renderPlanCard)
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={24} color={COLORS.feedback.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Flexible Billing</Text>
            <Text style={styles.infoText}>
              Cancel anytime. All plans include 14-day money-back guarantee.
            </Text>
          </View>
        </View>

        {/* Benefits Summary */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Neden Yükselt? 💎</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon name="crown" size={20} color={COLORS.feedback.success} />
              <Text style={styles.benefitText}>
                Platinum üyeler listelerde gümüş parıltılı görünür ✨
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon
                name="map-marker-radius"
                size={20}
                color={COLORS.feedback.success}
              />
              <Text style={styles.benefitText}>
                Mesafe limitini 500km'ye kadar aç
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="gift" size={20} color={COLORS.feedback.success} />
              <Text style={styles.benefitText}>
                Sınırsız hediye gönder ve al
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon
                name="shield-check"
                size={20}
                color={COLORS.feedback.success}
              />
              <Text style={styles.benefitText}>
                Öncelikli Escrow koruması ve hızlı ödeme
              </Text>
            </View>
          </View>
        </View>

        {/* Plan Comparison Table */}
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Plan Comparison</Text>

          {/* Table Header */}
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonCell, styles.comparisonFeature]}>
              Feature
            </Text>
            <Text style={[styles.comparisonCell, styles.comparisonHeader]}>
              Momentum
            </Text>
            <Text style={[styles.comparisonCell, styles.comparisonHeader]}>
              Premium
            </Text>
            <Text
              style={[
                styles.comparisonCell,
                styles.comparisonHeader,
                styles.comparisonPlatinum,
              ]}
            >
              Platinum
            </Text>
          </View>

          {/* Moments per month */}
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonCell, styles.comparisonFeature]}>
              Moments/month
            </Text>
            <Text style={styles.comparisonCell}>3</Text>
            <Text style={styles.comparisonCell}>10</Text>
            <Text style={[styles.comparisonCell, styles.comparisonPlatinum]}>
              ∞
            </Text>
          </View>

          {/* Gifts per month */}
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonCell, styles.comparisonFeature]}>
              Gifts/month
            </Text>
            <Text style={styles.comparisonCell}>5</Text>
            <Text style={styles.comparisonCell}>25</Text>
            <Text style={[styles.comparisonCell, styles.comparisonPlatinum]}>
              ∞
            </Text>
          </View>

          {/* Verified badge */}
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonCell, styles.comparisonFeature]}>
              Verified badge
            </Text>
            <Text style={styles.comparisonCell}>—</Text>
            <Text style={styles.comparisonCell}>✓</Text>
            <Text style={[styles.comparisonCell, styles.comparisonPlatinum]}>
              ✓
            </Text>
          </View>

          {/* Priority support */}
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonCell, styles.comparisonFeature]}>
              Priority support
            </Text>
            <Text style={styles.comparisonCell}>—</Text>
            <Text style={styles.comparisonCell}>✓</Text>
            <Text style={[styles.comparisonCell, styles.comparisonPlatinum]}>
              ✓
            </Text>
          </View>

          {/* Offer above price */}
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonCell, styles.comparisonFeature]}>
              Offer above price
            </Text>
            <Text style={styles.comparisonCell}>—</Text>
            <Text style={styles.comparisonCell}>—</Text>
            <Text style={[styles.comparisonCell, styles.comparisonPlatinum]}>
              ✓
            </Text>
          </View>

          {/* Silver shimmer */}
          <View style={[styles.comparisonRow, styles.comparisonLastRow]}>
            <Text style={[styles.comparisonCell, styles.comparisonFeature]}>
              Silver shimmer
            </Text>
            <Text style={styles.comparisonCell}>—</Text>
            <Text style={styles.comparisonCell}>—</Text>
            <Text style={[styles.comparisonCell, styles.comparisonPlatinum]}>
              ✓
            </Text>
          </View>
        </View>

        {/* Biometric Payment Hint */}
        <View style={styles.biometricHint}>
          <Icon
            name={Platform.OS === 'ios' ? 'face-recognition' : 'fingerprint'}
            size={24}
            color={COLORS.brand.primary}
          />
          <View style={styles.biometricContent}>
            <Text style={styles.biometricTitle}>Quick & Secure Checkout</Text>
            <Text style={styles.biometricText}>
              Use {Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint'} for fast
              payment verification
            </Text>
          </View>
        </View>

        {/* FAQ Link */}
        <TouchableOpacity
          style={styles.faqButton}
          onPress={() => navigation.navigate('FAQ')}
        >
          <Icon name="help-circle" size={20} color={COLORS.brand.primary} />
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
    backgroundColor: COLORS.bg.primary,
    flex: 1,
  },
  currency: {
    color: COLORS.text.primary,
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
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  planTagline: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
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
    color: COLORS.text.primary,
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
    color: COLORS.text.primary,
    flex: 1,
  },
  comparisonCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding * 2,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  comparisonTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: LAYOUT.padding * 1.5,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    paddingVertical: LAYOUT.padding,
  },
  comparisonLastRow: {
    borderBottomWidth: 0,
  },
  comparisonCell: {
    flex: 1,
    textAlign: 'center',
    ...TYPOGRAPHY.caption,
    color: COLORS.text.primary,
  },
  comparisonFeature: {
    flex: 1.5,
    textAlign: 'left',
    fontWeight: '500',
  },
  comparisonHeader: {
    fontWeight: '700',
    color: COLORS.text.secondary,
  },
  comparisonPlatinum: {
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
  biometricHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding * 2,
    gap: LAYOUT.padding,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  biometricContent: {
    flex: 1,
  },
  biometricTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: LAYOUT.padding / 4,
  },
  biometricText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  faqButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  faqText: {
    color: COLORS.brand.primary,
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
    color: COLORS.text.primary,
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    marginLeft: LAYOUT.padding,
  },
  featureDisabled: {
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
  },
  featuresContainer: {
    marginBottom: LAYOUT.padding * 2,
  },
  freeButton: {
    backgroundColor: COLORS.border.default,
  },
  freeButtonInner: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  freeButtonText: {
    color: COLORS.text.secondary,
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
    color: COLORS.utility.white,
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: COLORS.feedback.info + '20',
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
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.caption,
    fontWeight: '400',
    lineHeight: 18,
  },
  infoTitle: {
    color: COLORS.text.primary,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 4,
  },
  interval: {
    alignSelf: 'flex-end',
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    marginBottom: LAYOUT.padding / 2,
  },
  planCard: {
    backgroundColor: COLORS.utility.white,
    borderColor: COLORS.border.default,
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
    color: COLORS.text.primary,
    ...TYPOGRAPHY.h2,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
  },
  popularBadge: {
    backgroundColor: COLORS.brand.accent,
    borderRadius: VALUES.borderRadius / 2,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    position: 'absolute',
    right: LAYOUT.padding * 2,
    top: -10,
  },
  popularText: {
    color: COLORS.utility.white,
    fontSize: 10,
    fontWeight: '800',
  },
  price: {
    color: COLORS.text.primary,
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
    borderColor: COLORS.brand.primary,
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
    color: COLORS.utility.white,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 4,
  },
  loadingText: {
    color: COLORS.text.secondary,
    marginTop: LAYOUT.padding,
    ...TYPOGRAPHY.bodyMedium,
  },
});
