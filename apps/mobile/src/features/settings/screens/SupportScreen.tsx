import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import { contactSupportSchema, type ContactSupportInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';

interface SupportOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: () => void;
}

type SupportScreenProps = StackScreenProps<RootStackParamList, 'Support'>;

export const SupportScreen: React.FC<SupportScreenProps> = ({ navigation }) => {
    const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();
const { control, handleSubmit, formState, watch } = useForm<ContactSupportInput>({
    resolver: zodResolver(contactSupportSchema),
    mode: 'onChange',
    defaultValues: {
      subject: '',
      message: '',
      category: 'general',
    },
  });

  const message = watch('message');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: ContactSupportInput) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'Your support request has been submitted. We will get back to you within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }, 1500);
  };

  const isSubmitDisabled = !canSubmitForm({ formState } as any, {
    requireDirty: false,
    requireValid: true,
  });

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@travelmatch.com?subject=Support Request');
  };

  const handleWhatsApp = () => {
    Linking.openURL(
      'https://wa.me/905551234567?text=Hello, I need help with TravelMatch',
    );
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+905551234567');
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
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support & Help</Text>
          <View style={styles.spacer} />
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
              We&apos;re here to assist you 24/7
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
                      name={
                        option.icon as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={28}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
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
                <Controller
                  control={control}
                  name="subject"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                      <TextInput
                        style={styles.input}
                        placeholder="What do you need help with?"
                        placeholderTextColor={COLORS.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                      {error && <Text style={styles.errorText}>{error.message}</Text>}
                    </>
                  )}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message</Text>
                <Controller
                  control={control}
                  name="message"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your issue in detail..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                      />
                      <Text style={styles.charCount}>{value.length}/500</Text>
                      {error && <Text style={styles.errorText}>{error.message}</Text>}
                    </>
                  )}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (loading || isSubmitDisabled) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading || isSubmitDisabled}
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
                      <MaterialCommunityIcons
                        name="send"
                        size={20}
                        color={COLORS.white}
                      />
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
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.infoText}>
              Average response time:{' '}
              <Text style={styles.infoBold}>2-4 hours</Text>
            </Text>
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
  charCount: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
    marginTop: 4,
    textAlign: 'right',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  faqCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    ...VALUES.shadow,
  },
  faqContent: {
    flex: 1,
  },
  faqIcon: {
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  faqSubtitle: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.caption,
  },
  faqTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    marginBottom: 4,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    padding: 20,
    ...VALUES.shadow,
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
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    ...TYPOGRAPHY.bodySmall,
  },
  heroTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    marginBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: 16,
    width: 120,
    ...VALUES.shadow,
  },
  infoBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
  },
  infoText: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodySmall,
    marginLeft: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderWidth: 1,
    color: COLORS.text,
    ...TYPOGRAPHY.bodySmall,
    padding: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius,
    marginBottom: 16,
    padding: 16,
    width: '48%',
    ...VALUES.shadow,
  },
  optionDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
  },
  optionTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitText: {
    color: COLORS.white,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.coral,
    marginTop: 4,
  },
});
