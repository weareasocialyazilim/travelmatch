import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image as _Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type HowEscrowWorksScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'HowEscrowWorks'
>;

interface HowEscrowWorksScreenProps {
  navigation: HowEscrowWorksScreenNavigationProp;
}

interface Step {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: '1',
    icon: 'arrow-up-circle',
    title: 'You send a gift',
    description:
      'Your money goes into a secure escrow balance, not directly to the traveler.',
  },
  {
    id: '2',
    icon: 'cloud-upload',
    title: 'Traveler uploads proof',
    description:
      'They provide a receipt, photo, or location check-in to verify the moment.',
  },
  {
    id: '3',
    icon: 'check-decagram',
    title: 'You approve & release',
    description:
      'Once you&apos;re happy with the proof, the money moves from escrow to their wallet.',
  },
];

export const HowEscrowWorksScreen: React.FC<HowEscrowWorksScreenProps> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How escrow works</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your gift is never blind.</Text>
          <Text style={styles.heroDescription}>
            Money is held in a protected balance until proof is approved.
          </Text>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <MaterialCommunityIcons
                name={'shield-check' as IconName}
                size={80}
                color={COLORS.primary}
              />
            </View>
          </View>
        </View>

        {/* Steps Section */}
        <View style={styles.stepsSection}>
          <Text style={styles.stepsTitle}>The 3-step loop</Text>

          <View style={styles.stepsList}>
            {STEPS.map((step) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepIconContainer}>
                  <MaterialCommunityIcons
                    name={step.icon}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Card */}
        <View style={styles.faqSection}>
          <View style={styles.faqCard}>
            <Text style={styles.faqTitle}>What if proof looks wrong?</Text>
            <Text style={styles.faqDescription}>
              You&apos;re in control. You can ask the traveler for more proof or
              clarification. If you&apos;re still not satisfied, you can open a
              dispute and our support team will help mediate.
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
    backgroundColor: COLORS.background,
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
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  heroDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    maxWidth: 320,
  },
  illustrationContainer: {
    paddingVertical: 24,
  },
  illustration: {
    width: 160,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
  },
  stepsSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  faqSection: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 48,
  },
  faqCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 24,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  faqDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
