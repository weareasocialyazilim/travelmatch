import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';

interface TrustFactor {
  id: string;
  name: string;
  description: string;
  icon: string;
  value: number;
  maxValue: number;
  tips: string[];
}

const TrustGardenDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Mock trust data
  const trustData = {
    level: 'Blooming' as 'Sprout' | 'Growing' | 'Blooming',
    score: 92,
    rank: 'Top 5%',
    nextLevel: 'Flourishing',
    pointsToNext: 8,
  };

  const trustFactors: TrustFactor[] = [
    {
      id: '1',
      name: 'Identity Verification',
      description: 'KYC verification status',
      icon: 'shield-check',
      value: 100,
      maxValue: 100,
      tips: ['Complete full KYC verification', 'Verify your ID document', 'Add proof of address'],
    },
    {
      id: '2',
      name: 'Social Connections',
      description: 'Connected social accounts',
      icon: 'link-variant',
      value: 10,
      maxValue: 15,
      tips: ['Connect Instagram (+5%)', 'Connect X/Twitter (+5%)', 'Connect Facebook (+5%)'],
    },
    {
      id: '3',
      name: 'Completed Moments',
      description: 'Successfully fulfilled requests',
      icon: 'check-circle',
      value: 23,
      maxValue: 30,
      tips: ['Complete more moment requests', 'Maintain high ratings', 'Respond quickly to requests'],
    },
    {
      id: '4',
      name: 'Response Rate',
      description: 'Reply to requests promptly',
      icon: 'message-reply',
      value: 95,
      maxValue: 100,
      tips: ['Reply within 2 hours', 'Accept or decline requests quickly', 'Keep your calendar updated'],
    },
    {
      id: '5',
      name: 'Ratings Received',
      description: 'Average rating from travelers',
      icon: 'star',
      value: 4.8,
      maxValue: 5,
      tips: ['Provide authentic experiences', 'Communicate clearly', 'Go above expectations'],
    },
  ];

  const getFactorNavigation = (factorId: string) => {
    switch (factorId) {
      case '1': // Identity Verification
        return () => navigation.navigate('Security');
      case '2': // Social Connections
        return () => navigation.navigate('ConnectedAccounts');
      case '3': // Completed Moments
        return () => navigation.navigate('MyMoments');
      default:
        return undefined;
    }
  };

  const getLevelColor = () => {
    switch (trustData.level) {
      case 'Blooming': return COLORS.mint;
      case 'Growing': return COLORS.softOrange;
      default: return COLORS.coral;
    }
  };

  const getLevelDescription = () => {
    switch (trustData.level) {
      case 'Blooming':
        return 'You have established strong trust in the community. Keep up the great work!';
      case 'Growing':
        return 'You are building trust. Complete more verifications to level up.';
      default:
        return 'Start your trust journey by verifying your identity and connecting accounts.';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trust Garden</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trust Overview Card */}
        <View style={[styles.overviewCard, { borderColor: getLevelColor() }]}>
          <View style={[styles.levelIcon, { backgroundColor: `${getLevelColor()}20` }]}>
            <MaterialCommunityIcons name="flower" size={32} color={getLevelColor()} />
          </View>
          
          <Text style={[styles.levelName, { color: getLevelColor() }]}>{trustData.level}</Text>
          <Text style={styles.levelRank}>{trustData.rank} of all users</Text>
          
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{trustData.score}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>
          
          <Text style={styles.levelDescription}>{getLevelDescription()}</Text>

          {/* Progress to Next Level */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next Level: {trustData.nextLevel}</Text>
              <Text style={styles.progressPoints}>{trustData.pointsToNext} points needed</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((trustData.score) / (trustData.score + trustData.pointsToNext)) * 100}%`,
                    backgroundColor: getLevelColor() 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Trust Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRUST FACTORS</Text>
          
          {trustFactors.map((factor) => {
            const onPress = getFactorNavigation(factor.id);
            const FactorWrapper = onPress ? TouchableOpacity : View;
            
            return (
            <FactorWrapper 
              key={factor.id} 
              style={styles.factorCard}
              onPress={onPress}
              activeOpacity={onPress ? 0.7 : 1}
            >
              <View style={styles.factorHeader}>
                <View style={[styles.factorIcon, { backgroundColor: COLORS.mintTransparent }]}>
                  <MaterialCommunityIcons
                    name={factor.icon as any}
                    size={20}
                    color={COLORS.mint}
                  />
                </View>
                <View style={styles.factorInfo}>
                  <Text style={styles.factorName}>{factor.name}</Text>
                  <Text style={styles.factorDesc}>{factor.description}</Text>
                </View>
                <View style={styles.factorValueContainer}>
                  <View style={styles.factorValue}>
                    <Text style={styles.factorValueText}>
                      {factor.id === '5' ? factor.value.toFixed(1) : factor.value}
                    </Text>
                    <Text style={styles.factorMaxText}>
                      /{factor.id === '5' ? factor.maxValue.toFixed(1) : factor.maxValue}
                    </Text>
                  </View>
                  {onPress && (
                    <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textSecondary} />
                  )}
                </View>
              </View>
              
              <View style={styles.factorProgressBar}>
                <View 
                  style={[
                    styles.factorProgressFill, 
                    { width: `${(factor.value / factor.maxValue) * 100}%` }
                  ]} 
                />
              </View>
              
              {factor.value < factor.maxValue && (
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>How to improve:</Text>
                  {factor.tips.slice(0, 2).map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <MaterialCommunityIcons name="arrow-right" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </FactorWrapper>
          );
          })}
        </View>

        {/* Trust Levels Explained */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRUST LEVELS</Text>
          
          <View style={styles.levelsCard}>
            <View style={styles.levelRow}>
              <View style={[styles.levelDot, { backgroundColor: COLORS.coral }]} />
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Sprout</Text>
                <Text style={styles.levelRange}>0-40 points</Text>
              </View>
            </View>
            
            <View style={styles.levelRow}>
              <View style={[styles.levelDot, { backgroundColor: COLORS.softOrange }]} />
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Growing</Text>
                <Text style={styles.levelRange}>41-70 points</Text>
              </View>
            </View>
            
            <View style={styles.levelRow}>
              <View style={[styles.levelDot, { backgroundColor: COLORS.mint }]} />
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Blooming</Text>
                <Text style={styles.levelRange}>71-90 points</Text>
              </View>
            </View>
            
            <View style={styles.levelRow}>
              <View style={[styles.levelDot, { backgroundColor: '#6366F1' }]} />
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Flourishing</Text>
                <Text style={styles.levelRange}>91-100 points</Text>
              </View>
            </View>
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Overview Card
  overviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  levelIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  levelName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  levelRank: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text,
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  levelDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  progressSection: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPoints: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  factorInfo: {
    flex: 1,
  },
  factorName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  factorDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.mint,
  },
  factorMaxText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  factorProgressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  factorProgressFill: {
    height: '100%',
    backgroundColor: COLORS.mint,
    borderRadius: 3,
  },
  tipsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
    color: COLORS.text,
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
    gap: 16,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    color: COLORS.text,
  },
  levelRange: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default TrustGardenDetailScreen;
