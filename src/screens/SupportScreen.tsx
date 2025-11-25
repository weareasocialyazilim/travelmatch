import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

interface SupportOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

export const SupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@travelmatch.com?subject=Support Request');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/905551234567?text=Hello, I need help with TravelMatch');
  };

  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Live chat will be available soon!');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+905551234567');
  };

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Required Fields', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'Your support request has been submitted. We will get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  const supportOptions: SupportOption[] = [
    {
      id: '1',
      icon: 'email-outline',
      title: 'Email Support',
      description: 'support@travelmatch.com',
      action: handleEmailSupport,
    },
    {
      id: '2',
      icon: 'whatsapp',
      title: 'WhatsApp',
      description: 'Chat with us on WhatsApp',
      action: handleWhatsApp,
    },
    {
      id: '3',
      icon: 'chat-outline',
      title: 'Live Chat',
      description: 'Available 9 AM - 6 PM',
      action: handleLiveChat,
    },
    {
      id: '4',
      icon: 'phone-outline',
      title: 'Call Us',
      description: '+90 555 123 45 67',
      action: handleCallSupport,
    },
  ];

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
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support & Help</Text>
          <View style={styles.placeholder} />
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
                name="face-agent"
                size={64}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSubtitle}>
              We're here to assist you 24/7
            </Text>
          </View>

          {/* Quick Contact Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Contact</Text>
            <View style={styles.optionsGrid}>
              {supportOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionCard}
                  onPress={option.action}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionIcon}>
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={28}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit a Request */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submit a Request</Text>
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What do you need help with?"
                  placeholderTextColor={COLORS.textSecondary}
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your issue in detail..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{message.length}/500</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <Text style={styles.submitText}>Submitting...</Text>
                  ) : (
                    <>
                      <Text style={styles.submitText}>Submit Request</Text>
                      <MaterialCommunityIcons name="send" size={20} color="#FFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Link */}
          <TouchableOpacity
            style={styles.faqCard}
            onPress={() => navigation.navigate('FAQ')}
            activeOpacity={0.8}
          >
            <View style={styles.faqIcon}>
              <MaterialCommunityIcons
                name="frequently-asked-questions"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.faqContent}>
              <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
              <Text style={styles.faqSubtitle}>
                Find quick answers to common questions
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          {/* Response Time Info */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Average response time: <Text style={styles.infoBold}>2-4 hours</Text>
            </Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...VALUES.shadow,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...VALUES.shadow,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    ...VALUES.shadow,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    padding: 20,
    ...VALUES.shadow,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: VALUES.borderRadius,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    padding: 16,
    marginBottom: 16,
    ...VALUES.shadow,
  },
  faqIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faqContent: {
    flex: 1,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  faqSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: VALUES.borderRadius,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
  },
  infoBold: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomPadding: {
    height: 32,
  },
});
