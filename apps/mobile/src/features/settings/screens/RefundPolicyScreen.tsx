import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type RefundPolicyScreenProps = StackScreenProps<
  RootStackParamList,
  'RefundPolicy'
>;

export const RefundPolicyScreen: React.FC<RefundPolicyScreenProps> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Icon name="cash-refund" size={64} color={COLORS.mint} />
          <Text style={styles.heroTitle}>14-Day Money-Back Guarantee</Text>
          <Text style={styles.heroSubtitle}>
            We&apos;re committed to your satisfaction. If you&apos;re not happy
            with your experience, we&apos;ll make it right.
          </Text>
        </View>

        {/* Policy Sections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="shield-check" size={24} color={COLORS.mint} />
            <Text style={styles.sectionTitle}>Our Commitment</Text>
          </View>
          <Text style={styles.paragraph}>
            TravelMatch stands behind every gesture made on our platform. We
            offer a comprehensive 14-day money-back guarantee to ensure trust
            and satisfaction for all users.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="check-circle" size={24} color={COLORS.coral} />
            <Text style={styles.sectionTitle}>Eligible for Refund</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                Gesture not delivered within agreed timeframe
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                Proof of gesture not provided within 14 days
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                Gesture significantly differs from description
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                Verified issues with gesture quality or authenticity
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                Technical payment errors or duplicates
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="close-circle" size={24} color={COLORS.gray[400]} />
            <Text style={styles.sectionTitle}>Not Eligible for Refund</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                Change of mind after gesture is delivered
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                Refund requests made after 14-day window
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                Verified gestures with valid proof submitted
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon
                name="circle-small"
                size={24}
                color={COLORS.textSecondary}
              />
              <Text style={styles.bulletText}>
                User violations of TravelMatch terms of service
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="clock-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Refund Process</Text>
          </View>
          <View style={styles.steps}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Submit Request</Text>
                <Text style={styles.stepDescription}>
                  Go to transaction details and tap &quot;Request Refund&quot;
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Review Period</Text>
                <Text style={styles.stepDescription}>
                  Our team reviews your request within 2-3 business days
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Decision Notice</Text>
                <Text style={styles.stepDescription}>
                  You&apos;ll receive email notification of our decision
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Refund Processed</Text>
                <Text style={styles.stepDescription}>
                  Approved refunds processed within 5-7 business days
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information" size={24} color={COLORS.coral} />
            <Text style={styles.sectionTitle}>Important Notes</Text>
          </View>
          <Text style={styles.paragraph}>
            • Refunds are issued to the original payment method{'\n'}•
            Processing times may vary by payment provider{'\n'}• Partial refunds
            may be offered for partial delivery{'\n'}• All refund decisions are
            final and at TravelMatch&apos;s discretion{'\n'}• Contact
            support@travelmatch.com for assistance
          </Text>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Icon name="headset" size={32} color={COLORS.mint} />
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>
            Our support team is here to help you with any refund questions or
            concerns.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Icon name="message-text" size={20} color={COLORS.white} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bottomSpacer: {
    height: 40,
  },
  bulletItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  bulletList: {
    gap: 12,
  },
  bulletText: {
    color: COLORS.text,
    flex: 1,
    ...TYPOGRAPHY.body,
    lineHeight: 22,
  },
  contactButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  contactButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
  contactSection: {
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 32,
  },
  contactText: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    marginBottom: 20,
    textAlign: 'center',
  },
  contactTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
  hero: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginBottom: 16,
    padding: 32,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.body,
    lineHeight: 22,
    textAlign: 'center',
  },
  heroTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  paragraph: {
    color: COLORS.text,
    ...TYPOGRAPHY.body,
    lineHeight: 22,
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepNumberText: {
    color: COLORS.white,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
  },
  stepTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    marginBottom: 4,
  },
  steps: {
    gap: 20,
  },
});
