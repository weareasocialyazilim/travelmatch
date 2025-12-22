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
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

interface Section {
  id: string;
  title: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    id: '1',
    title: '1. Introduction',
    content:
      'Welcome to our proof-based social gifting platform for travel moments. These Terms of Service ("Terms") govern your use of our services, connecting travelers and supporters through escrow-protected, verified gestures. By accessing or using our platform, you agree to be bound by these Terms in full. If you disagree with any part of these terms, you must not use our services.',
  },
  {
    id: '2',
    title: '2. User Responsibilities',
    content:
      'You must be at least 18 years of age to create an account and use our services. You are solely responsible for any activity that occurs through your account and you agree not to sell, transfer, license, or assign your account or any account rights. You are also responsible for maintaining the confidentiality of your password.',
  },
  {
    id: '3',
    title: '3. Gifting & Escrow Rules',
    content:
      'All gifts contributed by supporters are held in a secure escrow account. Funds are released to the traveler only after they have provided valid proof of completing the specified travel moment. Our platform acts as a neutral third party to ensure the integrity of each transaction.',
  },
  {
    id: '4',
    title: '4. Proof Requirements',
    content:
      'Valid proof may include, but is not limited to, geotagged photos, videos, or other verifiable documentation as specified in the gift request. All submitted proof is subject to review by our team. The determination of whether proof is sufficient is at our sole discretion.',
  },
  {
    id: '5',
    title: '5. Wallet & Payments',
    content:
      "Our platform includes an in-app wallet for managing funds. All transactions are subject to processing fees, which will be clearly disclosed before you confirm any payment. Withdrawals from your wallet are subject to our payment provider's terms and may take several business days to process.",
  },
  {
    id: '6',
    title: '6. Account Suspension & Termination',
    content:
      'We reserve the right to suspend or terminate your account at any time, without notice, for conduct that we believe violates these Terms, is harmful to other users, or is otherwise in breach of applicable law.',
  },
  {
    id: '7',
    title: '7. Dispute Resolution',
    content:
      'In the event of a dispute between a traveler and a supporter, our team will act as a mediator. We will review all provided evidence and make a final, binding decision regarding the release or refund of escrowed funds.',
  },
  {
    id: '8',
    title: '8. Contact Information',
    content:
      'For any questions or legal inquiries regarding these Terms of Service, please contact us at legal@travelmatch.com.',
  },
];

import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type TermsOfServiceScreenProps = StackScreenProps<
  RootStackParamList,
  'TermsOfService'
>;

export default function TermsOfServiceScreen({
  navigation,
}: TermsOfServiceScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  sectionContent: {
    ...TYPOGRAPHY.bodyLarge,
    lineHeight: 26,
    color: COLORS.textSecondary,
  },
});
