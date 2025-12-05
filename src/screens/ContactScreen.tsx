import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { radii } from '../constants/radii';
import { TYPOGRAPHY } from '../constants/typography';
import { useToast } from '../context/ToastContext';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface ContactMethod {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  action: () => void;
  color: string;
}

type ContactScreenProps = StackScreenProps<RootStackParamList, 'Contact'>;

export const ContactScreen: React.FC<ContactScreenProps> = ({ navigation }) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@travelmatch.com?subject=Support Request');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+905551234567');
  };

  const handleWhatsAppPress = () => {
    Linking.openURL(
      'https://wa.me/905551234567?text=Hello, I need help with TravelMatch',
    );
  };

  const handleTwitterPress = () => {
    Linking.openURL('https://twitter.com/travelmatch');
  };

  const contactMethods: ContactMethod[] = [
    {
      id: 'email',
      icon: 'email-outline',
      title: 'Email Us',
      subtitle: 'support@travelmatch.com',
      action: handleEmailPress,
      color: COLORS.primary,
    },
    {
      id: 'phone',
      icon: 'phone-outline',
      title: 'Call Us',
      subtitle: '+90 555 123 45 67',
      action: handlePhonePress,
      color: COLORS.success,
    },
    {
      id: 'whatsapp',
      icon: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat with us instantly',
      action: handleWhatsAppPress,
      color: COLORS.whatsapp,
    },
    {
      id: 'twitter',
      icon: 'twitter',
      title: 'Twitter',
      subtitle: '@travelmatch',
      action: handleTwitterPress,
      color: COLORS.twitter,
    },
  ];

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter your message');
      return;
    }
    if (message.trim().length < 20) {
      toast.error('Message must be at least 20 characters');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success(
        'Message sent successfully! We&apos;ll get back to you soon.',
      );
      // Clear form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="headset"
                size={48}
                color={COLORS.white}
              />
            </View>
            <Text style={styles.heroTitle}>We&apos;re here to help</Text>
            <Text style={styles.heroSubtitle}>
              Have a question or need assistance? Reach out to us through any of
              these channels.
            </Text>
          </View>

          {/* Quick Contact Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Contact</Text>
            <View style={styles.contactGrid}>
              {contactMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={styles.contactCard}
                  onPress={method.action}
                  activeOpacity={0.7}
                  accessibilityLabel={`Contact via ${method.title}`}
                  accessibilityRole="button"
                >
                  <View
                    style={[
                      styles.contactIconContainer,
                      { backgroundColor: method.color },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={method.icon}
                      size={24}
                      color={COLORS.white}
                    />
                  </View>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send us a message</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                accessibilityLabel="Your name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Email address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="How can we help?"
                placeholderTextColor={COLORS.textTertiary}
                value={subject}
                onChangeText={setSubject}
                accessibilityLabel="Subject"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us more about your inquiry..."
                placeholderTextColor={COLORS.textTertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                accessibilityLabel="Message"
              />
              <Text style={styles.charCount}>{message.length}/500</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              {loading ? (
                <Text style={styles.submitButtonText}>Sending...</Text>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="send"
                    size={20}
                    color={COLORS.white}
                  />
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Office Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Office Hours</Text>
            <View style={styles.hoursCard}>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Monday - Friday</Text>
                <Text style={styles.hoursTime}>9:00 AM - 6:00 PM (GMT+3)</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Saturday</Text>
                <Text style={styles.hoursTime}>10:00 AM - 4:00 PM (GMT+3)</Text>
              </View>
              <View style={styles.hoursRow}>
                <Text style={styles.hoursDay}>Sunday</Text>
                <Text style={styles.hoursTime}>Closed</Text>
              </View>
            </View>
          </View>

          {/* Response Time */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="clock-fast"
              size={24}
              color={COLORS.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Average Response Time</Text>
              <Text style={styles.infoText}>
                We typically respond within 24 hours on business days.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  contactCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginHorizontal: '1%',
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  contactTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: spacing.xs / 2,
  },
  contactSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: radii.md,
    padding: spacing.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 120,
    paddingTop: spacing.md,
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs / 2,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
  hoursCard: {
    backgroundColor: COLORS.card,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  hoursDay: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  hoursTime: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text,
    marginBottom: spacing.xs / 2,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});

export default ContactScreen;
