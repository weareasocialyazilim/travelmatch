/**
 * TrustGardenDetailScreen - Premium Trust Score Visualization
 *
 * Implements UX best practices:
 * - Circular progress visualization (like cycle tracking apps)
 * - Color-coded trust factors
 * - Clear stats cards
 * - Premium "jewelry" aesthetic
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, primitives } from '@/constants/colors';
import { TRUST_GARDEN_DEFAULTS } from '@/constants/defaultValues';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { logger } from '@/utils/logger';
import { useTranslation } from '@/hooks/useTranslation';
import { TrustScoreCircle, type TrustFactor } from '@/components/ui';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { UserProfile } from '@/services/userService';
import type { NavigationProp } from '@react-navigation/native';

const TrustGardenDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { user: profile } = await userService.getCurrentUser();
        setUserProfile(profile);
      } catch (error) {
        logger.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, []);

  const trustScore = user?.trustScore || 0;

  // Translated level names
  const getLevelName = (score: number) => {
    if (score >= 91) return t('trust.garden.levels.blooming');
    if (score >= 71) return t('trust.garden.levels.growing');
    if (score >= 41) return t('trust.garden.levels.developing');
    return t('trust.garden.levels.sprout');
  };

  const socialScore =
    (userProfile?.instagram ? 5 : 0) +
    (userProfile?.twitter ? 5 : 0) +
    (userProfile?.website ? 5 : 0);

  // Trust factors for the circular visualization
  const trustFactors: TrustFactor[] = useMemo(
    () => [
      {
        id: '1',
        name: t('trust.factors.identity'),
        value:
          user?.kyc === 'Verified' ? 30 : user?.kyc === 'Pending' ? 15 : 0,
        maxValue: 30,
        color: primitives.emerald[500],
        icon: 'shield-check',
      },
      {
        id: '2',
        name: t('trust.factors.social'),
        value: socialScore,
        maxValue: 15,
        color: primitives.blue[500],
        icon: 'link-variant',
      },
      {
        id: '3',
        name: t('trust.factors.experience'),
        value: Math.min(userProfile?.momentCount || 0, 30),
        maxValue: 30,
        color: primitives.magenta[500],
        icon: 'check-circle',
      },
      {
        id: '4',
        name: t('trust.factors.response'),
        value: Math.round(
          TRUST_GARDEN_DEFAULTS.RESPONSE_RATE_PERCENTAGE *
            (TRUST_GARDEN_DEFAULTS.MAX_SCORE / 100)
        ),
        maxValue: 15,
        color: primitives.amber[500],
        icon: 'message-reply',
      },
      {
        id: '5',
        name: t('trust.factors.score'),
        value: Math.round((userProfile?.rating || 0) * 2),
        maxValue: 10,
        color: primitives.purple[500],
        icon: 'star',
      },
    ],
    [user, userProfile, socialScore, t]
  );

  // Detailed factors for the list below
  const detailedFactors = [
    {
      id: '1',
      name: t('trust.garden.identityVerification'),
      description: t('trust.garden.identityDesc'),
      icon: 'shield-check',
      value: user?.kyc === 'Verified' ? 100 : user?.kyc === 'Pending' ? 50 : 0,
      maxValue: 100,
      color: primitives.emerald[500],
      tips: [
        t('trust.garden.tips.verifyId'),
        t('trust.garden.tips.addAddress'),
        t('trust.garden.tips.completeKyc'),
      ],
      onPress: () => navigation.navigate('Security'),
    },
    {
      id: '2',
      name: t('trust.garden.socialConnections'),
      description: t('trust.garden.socialDesc'),
      icon: 'link-variant',
      value: socialScore,
      maxValue: 15,
      color: primitives.blue[500],
      tips: [t('trust.garden.tips.connectInstagram'), t('trust.garden.tips.connectTwitter'), t('trust.garden.tips.addWebsite')],
      onPress: () => navigation.navigate('ConnectedAccounts'),
    },
    {
      id: '3',
      name: t('trust.garden.completedExperiences'),
      description: t('trust.garden.experienceDesc'),
      icon: 'check-circle',
      value: userProfile?.momentCount || 0,
      maxValue: 30,
      color: primitives.magenta[500],
      tips: [
        t('trust.garden.tips.completeMoments'),
        t('trust.garden.tips.getHighRatings'),
        t('trust.garden.tips.respondQuickly'),
      ],
      onPress: () => navigation.navigate('MyMoments'),
    },
    {
      id: '4',
      name: t('trust.garden.responseRate'),
      description: t('trust.garden.responseDesc'),
      icon: 'message-reply',
      value: TRUST_GARDEN_DEFAULTS.RESPONSE_RATE_PERCENTAGE,
      maxValue: TRUST_GARDEN_DEFAULTS.MAX_SCORE,
      color: primitives.amber[500],
      tips: [
        t('trust.garden.tips.respondIn2h'),
        t('trust.garden.tips.acceptQuickly'),
        t('trust.garden.tips.keepCalendarUpdated'),
      ],
    },
    {
      id: '5',
      name: t('trust.garden.receivedRatings'),
      description: t('trust.garden.ratingsDesc'),
      icon: 'star',
      value: userProfile?.rating || 0,
      maxValue: 5,
      color: primitives.purple[500],
      tips: [
        t('trust.garden.tips.offerUnique'),
        t('trust.garden.tips.clearCommunication'),
        t('trust.garden.tips.exceedExpectations'),
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('trust.garden.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Trust Score Circle */}
        <TrustScoreCircle
          score={trustScore}
          level={getLevelName(trustScore)}
          factors={trustFactors}
          animated
        />

        {/* Trust Factors Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('trust.garden.factorsTitle')}</Text>

          {detailedFactors.map((factor) => (
            <TouchableOpacity
              key={factor.id}
              style={styles.factorCard}
              onPress={factor.onPress}
              disabled={!factor.onPress}
              activeOpacity={factor.onPress ? 0.7 : 1}
            >
              <View style={styles.factorHeader}>
                <View
                  style={[
                    styles.factorIcon,
                    { backgroundColor: `${factor.color}15` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      factor.icon as React.ComponentProps<
                        typeof MaterialCommunityIcons
                      >['name']
                    }
                    size={20}
                    color={factor.color}
                  />
                </View>
                <View style={styles.factorInfo}>
                  <Text style={styles.factorName}>{factor.name}</Text>
                  <Text style={styles.factorDesc}>{factor.description}</Text>
                </View>
                <View style={styles.factorValueContainer}>
                  <View style={styles.factorValue}>
                    <Text style={[styles.factorValueText, { color: factor.color }]}>
                      {factor.id === '5'
                        ? factor.value.toFixed(1)
                        : factor.value}
                    </Text>
                    <Text style={styles.factorMaxText}>
                      /
                      {factor.id === '5'
                        ? factor.maxValue.toFixed(1)
                        : factor.maxValue}
                    </Text>
                  </View>
                  {factor.onPress && (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color={COLORS.text.secondary}
                    />
                  )}
                </View>
              </View>

              <View style={styles.factorProgressBar}>
                <View
                  style={[
                    styles.factorProgressFill,
                    {
                      width: `${(factor.value / factor.maxValue) * 100}%`,
                      backgroundColor: factor.color,
                    },
                  ]}
                />
              </View>

              {factor.value < factor.maxValue && (
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>{t('trust.garden.howToImprove')}</Text>
                  {factor.tips.slice(0, 2).map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={14}
                        color={factor.color}
                      />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Trust Levels Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('trust.garden.levelsTitle')}</Text>

          <View style={styles.levelsCard}>
            {[
              {
                name: t('trust.garden.levels.sprout'),
                range: `0-40 ${t('trust.garden.points')}`,
                color: primitives.magenta[500],
              },
              {
                name: t('trust.garden.levels.developing'),
                range: `41-70 ${t('trust.garden.points')}`,
                color: primitives.amber[500],
              },
              {
                name: t('trust.garden.levels.growing'),
                range: `71-90 ${t('trust.garden.points')}`,
                color: primitives.emerald[500],
              },
              {
                name: t('trust.garden.levels.blooming'),
                range: `91-100 ${t('trust.garden.points')}`,
                color: primitives.purple[500],
              },
            ].map((level, index) => (
              <View key={index} style={styles.levelRow}>
                <View
                  style={[styles.levelDot, { backgroundColor: level.color }]}
                />
                <View style={styles.levelInfo}>
                  <Text style={styles.levelTitle}>{level.name}</Text>
                  <Text style={styles.levelRange}>{level.range}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.surface.base,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Factor Card
  factorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  factorInfo: {
    flex: 1,
  },
  factorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  factorDesc: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  factorValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  factorValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  factorValueText: {
    fontSize: 20,
    fontWeight: '700',
  },
  factorMaxText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  factorProgressBar: {
    height: 6,
    backgroundColor: primitives.stone[100],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  factorProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  tipsContainer: {
    backgroundColor: primitives.stone[50],
    borderRadius: 12,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.text.primary,
  },

  // Levels Card
  levelsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  levelInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  levelRange: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default TrustGardenDetailScreen;
