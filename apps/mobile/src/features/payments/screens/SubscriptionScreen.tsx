import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
import { formatCurrency } from '@/utils/currencyFormatter';
import { showAlert } from '@/stores/modalStore';
import type { SubscriptionPlan } from '../constants/plans';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';
import type { ComponentProps } from 'react';
import type { CurrencyCode } from '@/constants/currencies';

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
  const allowedPlanIds = React.useMemo(
    () => new Set(PLANS.map((plan) => plan.id)),
    [],
  );

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await subscriptionsService.getPlans();
        if (!error && data && data.length > 0) {
          // Map API plans to SubscriptionPlan structure
          const mappedPlans: SubscriptionPlan[] = data
            .map((apiPlan: any) => {
              // Find matching static plan for features/limits
              const staticPlan = PLANS.find((p) => p.id === apiPlan.id);
              const apiFeatures = Array.isArray(apiPlan.features)
                ? apiPlan.features
                    .map((feature: any) => {
                      if (typeof feature === 'string') {
                        return { text: feature, included: true };
                      }
                      return {
                        text: feature?.text || feature?.title || '',
                        included: feature?.included ?? true,
                      };
                    })
                    .filter((feature: any) => feature.text)
                : undefined;
              return {
                id: apiPlan.id,
                name: apiPlan.name,
                tagline: staticPlan?.tagline || apiPlan.description || '',
                price: Number(apiPlan.price) || 0,
                currency: apiPlan.currency || 'USD',
                interval: apiPlan.interval || 'month',
                features: apiFeatures || staticPlan?.features || [],
                limits: staticPlan?.limits || {
                  momentsPerMonth: 3,
                  messagesPerDay: 20,
                  giftsPerMonth: 1,
                  savedMoments: 10,
                  photoPerMoment: 5,
                },
                popular: apiPlan.is_popular || false,
                icon: apiPlan.icon || staticPlan?.icon || 'star-four-points',
                color:
                  apiPlan.color || staticPlan?.color || COLORS.brand.primary,
              };
            })
            .filter((plan) => allowedPlanIds.has(plan.id));

          setPlans(mappedPlans.length > 0 ? mappedPlans : PLANS);
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

    showAlert({
      title: 'Üyelik satın alma',
      message: 'Üyelik satın alma akışı şu anda kapalı. Yakında aktif olacak.',
      buttons: [{ text: 'Tamam' }],
    });
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    const planColor = plan.color || COLORS.brand.primary;
    const isFree = plan.price === 0;
    const priceLabel = isFree
      ? 'Ücretsiz'
      : formatCurrency(plan.price, plan.currency as CurrencyCode);
    const intervalLabel =
      plan.interval === 'year' ? '/yıl' : plan.interval ? '/ay' : '';

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
            <Text style={styles.popularText}>EN POPÜLER</Text>
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
          <Text style={styles.priceText}>{priceLabel}</Text>
          {!!intervalLabel && (
            <Text style={styles.interval}>{intervalLabel}</Text>
          )}
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.slice(0, 6).map((feature, index) => (
            <View key={`${plan.id}-${index}`} style={styles.featureRow}>
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
                {feature.text || ''}
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
                {isSelected ? `${plan.name} Seçili` : 'Planı Seç'}
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
    color: COLORS.text.onLight,
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
    color: COLORS.text.onLightSecondary,
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
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: LAYOUT.padding,
  },
  featureText: {
    color: COLORS.text.onLight,
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    marginLeft: LAYOUT.padding,
  },
  featureDisabled: {
    color: COLORS.text.onLightSecondary,
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
    color: COLORS.text.onLightSecondary,
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
    color: COLORS.text.onLightSecondary,
    ...TYPOGRAPHY.caption,
    fontWeight: '400',
    lineHeight: 18,
  },
  infoTitle: {
    color: COLORS.text.onLight,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 4,
  },
  interval: {
    alignSelf: 'flex-end',
    color: COLORS.text.onLightSecondary,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    marginBottom: LAYOUT.padding / 2,
  },
  priceText: {
    color: COLORS.text.onLight,
    fontSize: 34,
    fontWeight: '800',
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
    color: COLORS.text.onLight,
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
  priceContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: LAYOUT.padding / 2,
    gap: 6,
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
