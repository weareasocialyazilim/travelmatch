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

interface Stat {
  value: string;
  label: string;
}

interface Tag {
  id: string;
  text: string;
  color: string;
}

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  momentTitle: string;
}

const STATS: Stat[] = [
  { value: '14', label: 'Supporters' },
  { value: '3', label: 'Repeat supporters' },
  { value: '28', label: 'Verified moments' },
];

const TAGS: Tag[] = [
  { id: '1', text: 'Always sends proof', color: COLORS.success },
  { id: '2', text: 'Great storyteller', color: COLORS.coral },
  { id: '3', text: 'Creative updates', color: COLORS.success },
  { id: '4', text: 'Trustworthy', color: COLORS.coral },
  { id: '5', text: 'Adventurous', color: COLORS.success },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote:
      'The photos from Kyoto were absolutely breathtaking! So glad I could contribute.',
    author: 'Sarah J.',
    momentTitle: 'Coffee in Kyoto',
  },
  {
    id: '2',
    quote:
      'Following the hike up Machu Picchu through your updates felt like I was there. Amazing job!',
    author: 'Mike R.',
    momentTitle: 'Machu Picchu Sunrise',
  },
  {
    id: '3',
    quote:
      'Loved the recommendation for the gelato place in Rome. Thanks for sharing the moment!',
    author: 'Chloe L.',
    momentTitle: 'Gelato in Rome',
  },
];

import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type ReputationScreenProps = StackScreenProps<RootStackParamList, 'Reputation'>;

export default function ReputationScreen({
  navigation,
}: ReputationScreenProps) {
  const isEmpty = false; // Set to true to show empty state

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
        <Text style={styles.headerTitle}>Reputation</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {STATS.map((stat, index) => (
            <React.Fragment key={index}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              {index < STATS.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {!isEmpty ? (
          <>
            {/* What people say Section */}
            <Text style={styles.sectionTitle}>What people say</Text>
            <View style={styles.tagsContainer}>
              {TAGS.map((tag) => (
                <View
                  key={tag.id}
                  style={[styles.tag, { backgroundColor: tag.color + '33' }]}
                >
                  <Text style={[styles.tagText, { color: tag.color }]}>
                    {tag.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Testimonials Section */}
            <Text style={styles.sectionTitle}>Short notes from supporters</Text>
            <View style={styles.testimonialsContainer}>
              {TESTIMONIALS.map((testimonial) => (
                <View key={testimonial.id} style={styles.testimonialCard}>
                  <Text style={styles.testimonialQuote}>
                    &quot;{testimonial.quote}&quot;
                  </Text>
                  <Text style={styles.testimonialAuthor}>
                    From {testimonial.author} for &apos;
                    {testimonial.momentTitle}&apos;
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          // Empty State
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="star-circle"
                size={64}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>Your Reputation is Growing</Text>
            <Text style={styles.emptyDescription}>
              Complete a verified moment to start receiving feedback and build
              trust with supporters.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  tag: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  testimonialsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  testimonialCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  testimonialQuote: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 24,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
    marginTop: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.mintTransparentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 24,
  },
});
