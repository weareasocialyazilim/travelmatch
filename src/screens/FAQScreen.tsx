import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/ui/EmptyState';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'What is TravelMatch?',
    answer:
      "TravelMatch is a platform that connects travelers who want to share their travel moments with generous people who want to help make those moments happen. It's about creating meaningful connections through shared experiences.",
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer:
      'Simply download the app, tap "Get Started", and sign up using your phone number or email. Complete your profile to get the best experience.',
  },
  {
    id: '3',
    category: 'Moments',
    question: 'What is a Moment?',
    answer:
      'A Moment is a travel experience or activity you want to do during your trip. It could be trying local food, visiting a landmark, or any memorable experience you want to share.',
  },
  {
    id: '4',
    category: 'Moments',
    question: 'How do I create a Moment?',
    answer:
      'Tap the "+" icon at the bottom of the screen, select your travel destination, add photos, describe your moment, and set the amount you need.',
  },
  {
    id: '5',
    category: 'Gifting',
    question: "How can I gift to someone's Moment?",
    answer:
      'Browse moments on the Home or Social tab, tap on a moment that interests you, and tap "Gift this moment". Choose your payment method and complete the transaction.',
  },
  {
    id: '6',
    category: 'Gifting',
    question: 'Is my payment secure?',
    answer:
      'Yes! All payments are processed through secure, encrypted payment gateways. We never store your full card details.',
  },
  {
    id: '7',
    category: 'Proof System',
    question: 'What is a Proof?',
    answer:
      'A Proof is evidence that you actually experienced the moment you were gifted. It includes photos, location data, and your story about the experience.',
  },
  {
    id: '8',
    category: 'Proof System',
    question: 'How do I upload a Proof?',
    answer:
      'After experiencing your moment, go to your profile, tap "Upload Proof", select the moment, add photos and your story, and submit for verification.',
  },
  {
    id: '9',
    category: 'Proof System',
    question: 'How long does verification take?',
    answer:
      "Our AI system verifies proofs instantly. Community verification typically takes 24-48 hours. You'll be notified once your proof is verified.",
  },
  {
    id: '10',
    category: 'Trust & Safety',
    question: 'What is Trust Score?',
    answer:
      'Trust Score is a rating from 0-100 that reflects your reliability on the platform. It increases when you upload verified proofs and decreases if proofs are rejected.',
  },
  {
    id: '11',
    category: 'Trust & Safety',
    question: 'How do I increase my Trust Score?',
    answer:
      'Upload genuine proofs of your moments, interact positively with the community, complete your profile, and maintain consistent activity.',
  },
  {
    id: '12',
    category: 'Trust & Safety',
    question: "What happens if I don't upload proof?",
    answer:
      "If you don't upload proof within the specified timeframe, your Trust Score will decrease and future moment creation may be restricted.",
  },
  {
    id: '13',
    category: 'Subscription',
    question: 'What are the membership tiers?',
    answer:
      'We have Free, Starter ($4.99/mo), Pro ($9.99/mo), and VIP ($19.99/mo) tiers. Each tier offers different benefits like lower fees, priority support, and exclusive features.',
  },
  {
    id: '14',
    category: 'Subscription',
    question: 'Can I cancel my subscription?',
    answer:
      'Yes, you can cancel anytime from your profile settings. Your benefits will remain active until the end of your billing period.',
  },
  {
    id: '15',
    category: 'Payments & Refunds',
    question: 'What payment methods do you accept?',
    answer:
      'We accept credit/debit cards, Apple Pay, Google Pay, and PayPal. More payment options are coming soon.',
  },
  {
    id: '16',
    category: 'Payments & Refunds',
    question: 'Can I get a refund?',
    answer:
      "Yes, we have a 14-day money-back guarantee. If the receiver doesn't upload proof or the proof is rejected, you'll receive a full refund automatically.",
  },
  {
    id: '17',
    category: 'Payments & Refunds',
    question: 'How do I request a refund?',
    answer:
      'Go to the transaction detail page, tap "Request Refund", select your reason, and submit. Eligible refunds are processed within 5-7 business days.',
  },
  {
    id: '18',
    category: 'Account',
    question: 'How do I change my profile information?',
    answer:
      'Go to your Profile tab, tap the edit icon, update your information, and save changes.',
  },
  {
    id: '19',
    category: 'Account',
    question: 'How do I delete my account?',
    answer:
      'Go to Settings > Account > Delete Account. Note that this action is permanent and cannot be undone.',
  },
  {
    id: '20',
    category: 'Technical',
    question: 'The app is not working properly. What should I do?',
    answer:
      'Try closing and reopening the app, ensure you have the latest version, check your internet connection, or contact support if the issue persists.',
  },
];

const CATEGORIES = Array.from(new Set(FAQ_DATA.map((item) => item.category)));

type FAQScreenProps = StackScreenProps<RootStackParamList, 'FAQ'>;

export const FAQScreen: React.FC<FAQScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = FAQ_DATA.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === null || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundLight]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => navigation.navigate('Support')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="face-agent"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={COLORS.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === null && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === null && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category &&
                    styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredFAQs.length === 0 ? (
            <EmptyState
              icon="help-circle-outline"
              title="No questions found"
              subtitle="Try a different search or category"
            />
          ) : (
            filteredFAQs.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.faqItem}
                onPress={() => toggleItem(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqHeaderLeft}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {item.category}
                      </Text>
                    </View>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                  </View>
                  <MaterialCommunityIcons
                    name={
                      expandedItems.has(item.id) ? 'chevron-up' : 'chevron-down'
                    }
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </View>
                {expandedItems.has(item.id) && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}

          {/* Still Need Help */}
          <View style={styles.helpCard}>
            <MaterialCommunityIcons
              name="lifebuoy"
              size={32}
              color={COLORS.primary}
            />
            <Text style={styles.helpTitle}>Still need help?</Text>
            <Text style={styles.helpSubtitle}>
              Our support team is here for you
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('Support')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.contactGradient}
              >
                <Text style={styles.contactText}>Contact Support</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color={COLORS.white}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...VALUES.shadow,
  },
  bottomPadding: {
    height: 32,
  },
  categoriesContent: {
    gap: 8,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: 8,
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  categoryChip: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  contactButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    width: '100%',
  },
  contactGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  contactText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  faqAnswer: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  faqAnswerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  faqHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faqHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  faqItem: {
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    marginBottom: 12,
    padding: 16,
    ...VALUES.shadow,
  },
  faqQuestion: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: 16,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  helpCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    marginBottom: 16,
    marginTop: 24,
    padding: 24,
    ...VALUES.shadow,
  },
  helpSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    marginTop: 4,
  },
  helpTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding,
    paddingTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    height: 48,
    marginBottom: 12,
    marginHorizontal: LAYOUT.padding,
    marginTop: 16,
    paddingHorizontal: 12,
    ...VALUES.shadow,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
  },
  supportButton: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...VALUES.shadow,
  },
});
