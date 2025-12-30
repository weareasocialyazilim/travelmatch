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
import { TrustScoreCircle, type TrustFactor } from '@/components/ui';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { UserProfile } from '@/services/userService';
import type { NavigationProp } from '@react-navigation/native';

const TrustGardenDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
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

  // Turkish level names
  const getLevelTurkish = (score: number) => {
    if (score >= 91) return 'Çiçek Açan';
    if (score >= 71) return 'Büyüyen';
    if (score >= 41) return 'Gelişen';
    return 'Filiz';
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
        name: 'Kimlik',
        value:
          user?.kyc === 'Verified' ? 30 : user?.kyc === 'Pending' ? 15 : 0,
        maxValue: 30,
        color: primitives.emerald[500],
        icon: 'shield-check',
      },
      {
        id: '2',
        name: 'Sosyal',
        value: socialScore,
        maxValue: 15,
        color: primitives.blue[500],
        icon: 'link-variant',
      },
      {
        id: '3',
        name: 'Deneyim',
        value: Math.min(userProfile?.momentCount || 0, 30),
        maxValue: 30,
        color: primitives.magenta[500],
        icon: 'check-circle',
      },
      {
        id: '4',
        name: 'Yanıt',
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
        name: 'Puan',
        value: Math.round((userProfile?.rating || 0) * 2),
        maxValue: 10,
        color: primitives.purple[500],
        icon: 'star',
      },
    ],
    [user, userProfile, socialScore]
  );

  // Detailed factors for the list below
  const detailedFactors = [
    {
      id: '1',
      name: 'Kimlik Doğrulama',
      description: 'KYC doğrulama durumu',
      icon: 'shield-check',
      value: user?.kyc === 'Verified' ? 100 : user?.kyc === 'Pending' ? 50 : 0,
      maxValue: 100,
      color: primitives.emerald[500],
      tips: [
        'Kimlik belgesi doğrulaması yap',
        'Adres belgesi ekle',
        'Tam KYC tamamla',
      ],
      onPress: () => navigation.navigate('Security'),
    },
    {
      id: '2',
      name: 'Sosyal Bağlantılar',
      description: 'Bağlı sosyal hesaplar',
      icon: 'link-variant',
      value: socialScore,
      maxValue: 15,
      color: primitives.blue[500],
      tips: ['Instagram bağla (+5)', 'Twitter bağla (+5)', 'Website ekle (+5)'],
      onPress: () => navigation.navigate('ConnectedAccounts'),
    },
    {
      id: '3',
      name: 'Tamamlanan Deneyimler',
      description: 'Başarılı moment sayısı',
      icon: 'check-circle',
      value: userProfile?.momentCount || 0,
      maxValue: 30,
      color: primitives.magenta[500],
      tips: [
        'Daha fazla moment tamamla',
        'Yüksek puan al',
        'Hızlı yanıt ver',
      ],
      onPress: () => navigation.navigate('MyMoments'),
    },
    {
      id: '4',
      name: 'Yanıt Oranı',
      description: 'Taleplere hızlı yanıt',
      icon: 'message-reply',
      value: TRUST_GARDEN_DEFAULTS.RESPONSE_RATE_PERCENTAGE,
      maxValue: TRUST_GARDEN_DEFAULTS.MAX_SCORE,
      color: primitives.amber[500],
      tips: [
        '2 saat içinde yanıt ver',
        'Talepleri hızlıca kabul et',
        'Takviminizi güncel tut',
      ],
    },
    {
      id: '5',
      name: 'Alınan Puanlar',
      description: 'Ortalama değerlendirme puanı',
      icon: 'star',
      value: userProfile?.rating || 0,
      maxValue: 5,
      color: primitives.purple[500],
      tips: [
        'Özgün deneyimler sun',
        'Net iletişim kur',
        'Beklentilerin ötesine geç',
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
        <Text style={styles.headerTitle}>Güven Bahçesi</Text>
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
          level={getLevelTurkish(trustScore)}
          factors={trustFactors}
          animated
        />

        {/* Trust Factors Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GÜVEN FAKTÖRLERİ</Text>

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
                  <Text style={styles.tipsTitle}>Nasıl geliştirilir:</Text>
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
          <Text style={styles.sectionTitle}>GÜVEN SEVİYELERİ</Text>

          <View style={styles.levelsCard}>
            {[
              {
                name: 'Filiz',
                range: '0-40 puan',
                color: primitives.magenta[500],
              },
              {
                name: 'Gelişen',
                range: '41-70 puan',
                color: primitives.amber[500],
              },
              {
                name: 'Büyüyen',
                range: '71-90 puan',
                color: primitives.emerald[500],
              },
              {
                name: 'Çiçek Açan',
                range: '91-100 puan',
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
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.surface,
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
