import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

const FAQS = [
  {
    id: 1,
    q: 'How do payments work?',
    a: 'Payments are held in escrow until the moment is completed. Once you meet, funds are released.',
  },
  {
    id: 2,
    q: 'Can I cancel a booking?',
    a: 'Yes, you can cancel up to 24 hours before the scheduled time for a full refund.',
  },
  {
    id: 3,
    q: 'Is ID verification mandatory?',
    a: "For hosts, yes. For guests, it's recommended to increase trust.",
  },
];

type HelpCenterScreenProps = StackScreenProps<RootStackParamList, 'HelpCenter'>;

export const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heroTitle}>How can we help you?</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for issues..."
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked</Text>

        {FAQS.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={[styles.faqItem, expandedId === faq.id && styles.faqItemActive]}
            onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.question}>{faq.q}</Text>
              <Ionicons
                name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.text.secondary}
              />
            </View>
            {expandedId === faq.id && (
              <Animated.View entering={FadeIn}>
                <Text style={styles.answer}>{faq.a}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => navigation.navigate('Support')}
          activeOpacity={0.8}
        >
          <Text style={styles.contactText}>Contact Support</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  answer: {
    color: COLORS.text.tertiary,
    lineHeight: 20,
    marginTop: 12,
  },
  contactBtn: {
    alignItems: 'center',
    borderColor: COLORS.border.default,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 30,
    padding: 16,
  },
  contactText: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: COLORS.bg.primary,
    flex: 1,
  },
  content: {
    padding: 24,
  },
  faqHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faqItem: {
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    padding: 16,
  },
  faqItemActive: {
    backgroundColor: COLORS.surface.elevated,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: COLORS.text.primary,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
  },
  question: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    flexDirection: 'row',
    height: 50,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  sectionTitle: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  spacer: {
    width: 24,
  },
});
