import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';

export const RefundPolicyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Icon name="cash-refund" size={64} color={COLORS.mint} />
          <Text style={styles.heroTitle}>14-Day Money-Back Guarantee</Text>
          <Text style={styles.heroSubtitle}>
            We're committed to your satisfaction. If you're not happy with your experience, we'll
            make it right.
          </Text>
        </View>

        {/* Policy Sections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="shield-check" size={24} color={COLORS.mint} />
            <Text style={styles.sectionTitle}>Our Commitment</Text>
          </View>
          <Text style={styles.paragraph}>
            TravelMatch stands behind every gesture made on our platform. We offer a comprehensive
            14-day money-back guarantee to ensure trust and satisfaction for all users.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="check-circle" size={24} color={COLORS.coral} />
            <Text style={styles.sectionTitle}>Eligible for Refund</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>
                Gesture not delivered within agreed timeframe
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>
                Proof of gesture not provided within 14 days
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>Gesture significantly differs from description</Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>
                Verified issues with gesture quality or authenticity
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>Technical payment errors or duplicates</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="close-circle" size={24} color={COLORS.gray} />
            <Text style={styles.sectionTitle}>Not Eligible for Refund</Text>
          </View>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>Change of mind after gesture is delivered</Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>
                Refund requests made after 14-day window
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>Verified gestures with valid proof submitted</Text>
            </View>
            <View style={styles.bulletItem}>
              <Icon name="circle-small" size={24} color={COLORS.textSecondary} />
              <Text style={styles.bulletText}>
                User violations of TravelMatch terms of service
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="clock-outline" size={24} color={COLORS.purple} />
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
                  Go to transaction details and tap "Request Refund"
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
                  You'll receive email notification of our decision
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
            • Refunds are issued to the original payment method{'\n'}
            • Processing times may vary by payment provider{'\n'}
            • Partial refunds may be offered for partial delivery{'\n'}
            • All refund decisions are final and at TravelMatch's discretion{'\n'}
            • Contact support@travelmatch.com for assistance
          </Text>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Icon name="headset" size={32} color={COLORS.mint} />
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>
            Our support team is here to help you with any refund questions or concerns.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Icon name="message-text" size={20} color={COLORS.white} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
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
  content: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  steps: {
    gap: 20,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.gray,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.mint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
