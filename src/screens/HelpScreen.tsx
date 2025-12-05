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
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { radii } from '../constants/radii';
import { TYPOGRAPHY } from '../constants/typography';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface HelpCategory {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  screen?: keyof RootStackParamList;
  action?: () => void;
}

type HelpScreenProps = StackScreenProps<RootStackParamList, 'Help'>;

export const HelpScreen: React.FC<HelpScreenProps> = ({ navigation }) => {
  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      icon: 'rocket-launch-outline',
      title: 'Getting Started',
      description: 'Learn how to use TravelMatch',
      screen: 'FAQ',
    },
    {
      id: 'account',
      icon: 'account-circle-outline',
      title: 'Account & Profile',
      description: 'Manage your account settings',
      screen: 'Settings',
    },
    {
      id: 'moments',
      icon: 'image-multiple-outline',
      title: 'Moments & Gifting',
      description: 'How to create and gift moments',
      screen: 'FAQ',
    },
    {
      id: 'payments',
      icon: 'credit-card-outline',
      title: 'Payments & Wallet',
      description: 'Payment methods and transactions',
      screen: 'Wallet',
    },
    {
      id: 'escrow',
      icon: 'shield-check-outline',
      title: 'Escrow & Proofs',
      description: 'How escrow protection works',
      screen: 'HowEscrowWorks',
    },
    {
      id: 'safety',
      icon: 'security',
      title: 'Trust & Safety',
      description: 'Staying safe on TravelMatch',
      screen: 'Safety',
    },
  ];

  const quickLinks = [
    {
      id: 'faq',
      icon: 'frequently-asked-questions' as IconName,
      title: 'FAQ',
      screen: 'FAQ' as keyof RootStackParamList,
    },
    {
      id: 'contact',
      icon: 'headset' as IconName,
      title: 'Contact Us',
      screen: 'Contact' as keyof RootStackParamList,
    },
    {
      id: 'support',
      icon: 'lifebuoy' as IconName,
      title: 'Support',
      screen: 'Support' as keyof RootStackParamList,
    },
  ];

  const handleCategoryPress = (category: HelpCategory) => {
    if (category.screen) {
      // Type assertion needed due to dynamic screen navigation
      (navigation as { navigate: (screen: string) => void }).navigate(
        category.screen,
      );
    } else if (category.action) {
      category.action();
    }
  };

  const handleQuickLinkPress = (link: (typeof quickLinks)[0]) => {
    // Type assertion needed due to dynamic screen navigation
    (navigation as { navigate: (screen: string) => void }).navigate(
      link.screen,
    );
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
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
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
              name="help-circle-outline"
              size={48}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Browse help topics or contact our support team
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksContainer}>
          {quickLinks.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={styles.quickLinkButton}
              onPress={() => handleQuickLinkPress(link)}
              activeOpacity={0.7}
              accessibilityLabel={link.title}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name={link.icon}
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.quickLinkText}>{link.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Topic</Text>
          {helpCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
              accessibilityLabel={`${category.title}: ${category.description}`}
              accessibilityRole="button"
            >
              <View style={styles.categoryIconContainer}>
                <MaterialCommunityIcons
                  name={category.icon}
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={COLORS.textTertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Questions</Text>
          <TouchableOpacity
            style={styles.questionCard}
            onPress={() => navigation.navigate('FAQ')}
            accessibilityRole="button"
          >
            <Text style={styles.questionText}>
              How do I create my first moment?
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.questionCard}
            onPress={() => navigation.navigate('HowEscrowWorks')}
            accessibilityRole="button"
          >
            <Text style={styles.questionText}>
              How does escrow protection work?
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.questionCard}
            onPress={() => navigation.navigate('FAQ')}
            accessibilityRole="button"
          >
            <Text style={styles.questionText}>
              How do I withdraw my earnings?
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.questionCard}
            onPress={() => navigation.navigate('FAQ')}
            accessibilityRole="button"
          >
            <Text style={styles.questionText}>What is a Trust Score?</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Still Need Help */}
        <View style={styles.needHelpCard}>
          <MaterialCommunityIcons
            name="chat-question-outline"
            size={32}
            color={COLORS.primary}
          />
          <Text style={styles.needHelpTitle}>Still need help?</Text>
          <Text style={styles.needHelpText}>
            Our support team is here to assist you 24/7
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('Contact' as never)}
            activeOpacity={0.8}
            accessibilityLabel="Contact support"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="headset"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  quickLinkButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  quickLinkText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  categoryTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: spacing.xs / 2,
  },
  categoryDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  needHelpCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  needHelpTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  needHelpText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
});

export default HelpScreen;
