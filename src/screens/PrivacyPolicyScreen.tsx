import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface Section {
  id: string;
  title: string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    id: '1',
    title: 'Data We Collect',
    content:
      'We collect information you provide directly to us, such as when you create an account, create or share content, and communicate with us. This may include your name, email address, phone number, and payment information. We also collect device information and usage data automatically.',
  },
  {
    id: '2',
    title: 'Location Use',
    content:
      "To verify your travel moments, we require access to your device's location data. This information is used solely for the purpose of confirming that you are at the location you claim to be, which is essential for the proof-based nature of our platform. We do not track your location in the background or share this data with third parties for marketing purposes.",
  },
  {
    id: '3',
    title: 'Photos & Proof Data',
    content:
      'When you upload photos or other media as proof of a travel moment, we store this data securely. This content is used to validate your experience and is shared with your designated supporters. We do not use your photos for any purpose other than the core functionality of the app without your explicit consent.',
  },
  {
    id: '4',
    title: 'Payments & Security',
    content:
      'We use a secure third-party payment processor to handle all transactions. Your payment information is encrypted and transmitted directly to the processor; we do not store your full credit card details on our servers. All funds are held in a secure escrow system until the travel moment is successfully verified.',
  },
  {
    id: '5',
    title: 'Data Retention',
    content:
      'We retain your personal data for as long as your account is active or as needed to provide you services. We will also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.',
  },
  {
    id: '6',
    title: 'User Rights',
    content:
      'You have the right to access, correct, or update your personal information at any time through your account settings. You may also request a copy of your data or ask for its deletion, subject to legal and contractual restrictions.',
  },
  {
    id: '7',
    title: 'Deleting Your Data',
    content:
      'You can request the deletion of your account and associated personal data by contacting our support team. Upon receiving a request, we will delete your information from our active databases, although some data may be retained in our backups for a limited period before being permanently erased.',
  },
  {
    id: '8',
    title: 'Contact Us',
    content:
      'If you have any questions or concerns about this Privacy Policy, please contact us at privacy@travelmatch.com.',
  },
];

import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type PrivacyPolicyScreenProps = StackScreenProps<
  RootStackParamList,
  'PrivacyPolicy'
>;

export default function PrivacyPolicyScreen({
  navigation,
}: PrivacyPolicyScreenProps) {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <Text style={styles.lastUpdated}>Last Updated: October 26, 2023</Text>

        {/* Introduction */}
        <Text style={styles.introduction}>
          Welcome to our proof-based social gifting platform. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you use our mobile application. Please read this
          privacy policy carefully. If you do not agree with the terms of this
          privacy policy, please do not access the application.
        </Text>

        {/* Sections */}
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  lastUpdated: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingTop: 16,
    marginBottom: 24,
  },
  introduction: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 28,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.textSecondary,
  },
});
