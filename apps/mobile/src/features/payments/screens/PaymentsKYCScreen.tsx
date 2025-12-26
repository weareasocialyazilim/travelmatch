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
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

interface InfoItem {
  id: string;
  title: string;
  description: string;
}

const INFO_ITEMS: InfoItem[] = [
  {
    id: '1',
    title: 'Escrow Protection',
    description:
      'All gift funds are held securely in an escrow account. Funds are only released to the traveler after their proof is approved.',
  },
  {
    id: '2',
    title: 'Proof Requirements',
    description:
      "To unlock funds, travelers must submit specific proof as outlined in the gift's terms (e.g., geo-tagged photos, ticket stubs).",
  },
  {
    id: '3',
    title: 'Identity Verification (KYC)',
    description:
      'For security and compliance, travelers must complete a one-time identity check before their first withdrawal.',
  },
  {
    id: '4',
    title: 'Secure Payments',
    description:
      'We do not store your full card numbers. All transactions are processed by a PCI-compliant payment provider.',
  },
  {
    id: '5',
    title: 'KYC Checks May Include',
    description:
      'Verification of a government-issued photo ID (e.g., passport) and a selfie for biometric comparison.',
  },
];

import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type PaymentsKYCScreenProps = StackScreenProps<
  RootStackParamList,
  'PaymentsKYC'
>;

export default function PaymentsKYCScreen({
  navigation,
}: PaymentsKYCScreenProps) {
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
            color={COLORS.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments & KYC</Text>
        <View style={styles.backButton} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title */}
        <Text style={styles.mainTitle}>Payments, Escrow & Verification</Text>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Please note: This is placeholder text for illustrative purposes. It
          will be replaced with official compliance and legal information from
          our payment and verification partners.
        </Text>

        {/* Info Items List */}
        <View style={styles.itemsList}>
          {INFO_ITEMS.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.bullet} />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}:</Text>
                <Text style={styles.itemDescription}> {item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brownDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.brownDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.whiteTransparentDarkest,
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
    color: COLORS.white,
    textAlign: 'center',
    paddingRight: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },
  mainTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
  },
  disclaimer: {
    ...TYPOGRAPHY.bodySmall,
    lineHeight: 20,
    color: COLORS.brownGray,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  itemsList: {
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.orangeBright,
    marginTop: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.white,
    lineHeight: 24,
  },
  itemDescription: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.white,
    lineHeight: 24,
  },
});
