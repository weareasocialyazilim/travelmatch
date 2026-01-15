import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { RADII as radii } from '@/constants/radii';
import { SPACING as spacing } from '@/constants/spacing';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SafetyTip {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

interface SafetyResource {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  action: () => void;
}

type SafetyScreenProps = StackScreenProps<RootStackParamList, 'Safety'>;

export const SafetyScreen: React.FC<SafetyScreenProps> = ({ navigation }) => {
  const safetyTips: SafetyTip[] = [
    {
      id: 'verify',
      icon: 'shield-check',
      title: 'Verify Profiles',
      description:
        'Look for verified badges on profiles. Verified users have confirmed their identity through our verification process.',
    },
    {
      id: 'public',
      icon: 'account-group',
      title: 'Meet in Public',
      description:
        'For first-time meetings, always choose public places with plenty of people around. Avoid isolated locations.',
    },
    {
      id: 'share',
      icon: 'share-variant',
      title: 'Share Your Plans',
      description:
        'Let a friend or family member know your travel plans, including who you are meeting and where.',
    },
    {
      id: 'trust',
      icon: 'star-check',
      title: 'Check Trust Scores',
      description:
        'Review the Trust Score of users before engaging. Higher scores indicate more reliable platform members.',
    },
    {
      id: 'payment',
      icon: 'credit-card-check',
      title: 'Use Platform Payments',
      description:
        "Always use Lovendo's payment system. Never send money outside the platform or share financial details.",
    },
    {
      id: 'report',
      icon: 'flag-outline',
      title: 'Report Concerns',
      description:
        'If something feels wrong, trust your instincts. Report suspicious behavior immediately through the app.',
    },
  ];

  const safetyResources: SafetyResource[] = [
    {
      id: 'guidelines',
      icon: 'book-open-outline',
      title: 'Community Guidelines',
      subtitle: 'Rules for a safe community',
      action: () => navigation.navigate('TermsOfService'),
    },
    {
      id: 'privacy',
      icon: 'lock-outline',
      title: 'Privacy Settings',
      subtitle: 'Control your data',
      action: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: 'blocked',
      icon: 'account-cancel',
      title: 'Blocked Users',
      subtitle: 'Manage blocked accounts',
      action: () => navigation.navigate('BlockedUsers'),
    },
    {
      id: 'support',
      icon: 'headset',
      title: 'Safety Support',
      subtitle: '24/7 assistance',
      action: () => navigation.navigate('Support'),
    },
  ];

  const handleEmergencyPress = () => {
    Linking.openURL('tel:112');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trust & Safety</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="shield-account"
              size={48}
              color={COLORS.utility.white}
            />
          </View>
          <Text style={styles.heroTitle}>Your Safety Matters</Text>
          <Text style={styles.heroSubtitle}>
            Lovendo is committed to keeping you safe. Follow these guidelines
            for a secure experience.
          </Text>
        </View>

        {/* Emergency Card */}
        <TouchableOpacity
          style={styles.emergencyCard}
          onPress={handleEmergencyPress}
          activeOpacity={0.8}
          accessibilityLabel="Call emergency services"
          accessibilityRole="button"
        >
          <View style={styles.emergencyIconContainer}>
            <MaterialCommunityIcons
              name="phone-alert"
              size={28}
              color={COLORS.utility.white}
            />
          </View>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>Emergency?</Text>
            <Text style={styles.emergencyText}>
              If you&apos;re in immediate danger, call emergency services
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={COLORS.utility.white}
          />
        </TouchableOpacity>

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          {safetyTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <MaterialCommunityIcons
                  name={tip.icon}
                  size={24}
                  color={COLORS.brand.primary}
                />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Escrow Protection */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowHeader}>
            <MaterialCommunityIcons
              name="shield-lock"
              size={32}
              color={COLORS.feedback.success}
            />
            <Text style={styles.escrowTitle}>Escrow Protection</Text>
          </View>
          <Text style={styles.escrowText}>
            For transactions over $100, funds are held in secure escrow until
            proof of the moment is verified. This protects both travelers and
            gift givers.
          </Text>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => navigation.navigate('HowEscrowWorks')}
            accessibilityLabel="Learn more about escrow"
            accessibilityRole="button"
          >
            <Text style={styles.learnMoreText}>Learn How It Works</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={COLORS.brand.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Safety Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Resources</Text>
          {safetyResources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.resourceCard}
              onPress={resource.action}
              activeOpacity={0.7}
              accessibilityLabel={`${resource.title}: ${resource.subtitle}`}
              accessibilityRole="button"
            >
              <View style={styles.resourceIconContainer}>
                <MaterialCommunityIcons
                  name={resource.icon}
                  size={24}
                  color={COLORS.brand.primary}
                />
              </View>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceSubtitle}>{resource.subtitle}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.text.tertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Report Section */}
        <View style={styles.reportSection}>
          <Text style={styles.reportTitle}>See Something Wrong?</Text>
          <Text style={styles.reportText}>
            Help us keep the community safe by reporting any suspicious activity
            or behavior.
          </Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => navigation.navigate('Support')}
            activeOpacity={0.8}
            accessibilityLabel="Report an issue"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="flag-outline"
              size={20}
              color={COLORS.utility.white}
            />
            <Text style={styles.reportButtonText}>Report an Issue</Text>
          </TouchableOpacity>
        </View>

        {/* Trust System Info */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={COLORS.brand.primary}
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Trust Score System</Text>
            <Text style={styles.infoText}>
              Our Trust Score system helps identify reliable community members
              based on verified identity, completed moments, and community
              feedback.
            </Text>
          </View>
        </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.feedback.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.feedback.error,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.whiteOverlay20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  emergencyTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.utility.white,
    marginBottom: spacing.xs / 2,
  },
  emergencyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.subtitle,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface.base,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: COLORS.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  tipTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.primary,
    marginBottom: spacing.xs / 2,
  },
  tipDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  escrowCard: {
    backgroundColor: COLORS.successLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  escrowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  escrowTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginLeft: spacing.sm,
  },
  escrowText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    ...TYPOGRAPHY.label,
    color: COLORS.brand.primary,
    marginRight: spacing.xs,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resourceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: COLORS.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  resourceTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.primary,
    marginBottom: spacing.xs / 2,
  },
  resourceSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  reportSection: {
    backgroundColor: COLORS.warningLight,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  reportTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: spacing.xs,
  },
  reportText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  reportButton: {
    backgroundColor: COLORS.feedback.warning,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reportButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.utility.white,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.brand.primaryLight,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.primary,
    marginBottom: spacing.xs / 2,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});

export default SafetyScreen;
