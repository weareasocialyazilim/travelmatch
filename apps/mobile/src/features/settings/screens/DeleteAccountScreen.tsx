import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import { deleteAccountSchema, type DeleteAccountInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import { useConfirmation } from '../context/ConfirmationContext';
import { useToast } from '../context/ToastContext';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackNavigationProp } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type DeleteAccountScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DeleteAccount'
>;

interface DeleteAccountScreenProps {
  navigation: DeleteAccountScreenNavigationProp;
}

interface InfoItem {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

const INFO_ITEMS: InfoItem[] = [
  {
    id: '1',
    icon: 'account-remove',
    title: 'Profile removed',
    description:
      'Your profile and all travel moments will be permanently removed.',
  },
  {
    id: '2',
    icon: 'forum',
    title: 'Chats no longer visible',
    description:
      'Your messages and connections will no longer be visible to others.',
  },
  {
    id: '3',
    icon: 'headset' as IconName,
    title: 'Pending escrow',
    description:
      'Any pending escrow transactions will be handled by our support team.',
  },
];

export const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({
  navigation,
}) => {
  const toast = useToast();
  const { confirm } = useConfirmation();

  const {
    control,
    handleSubmit,
    formState,
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    mode: 'onChange',
    defaultValues: {
      confirmation: '',
    },
  });

  const onDelete = async (_data: DeleteAccountInput) => {
    const confirmed = await confirm({
      title: 'Delete Account',
      message:
        'Are you absolutely sure? This action cannot be undone. All your data, moments, and messages will be permanently deleted.',
      destructive: true,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      try {
        // Real API call for KVKK/GDPR compliant account deletion
        const { deleteAccount } = await import(
          '../services/supabaseAuthService'
        );
        const { error } = await deleteAccount();

        if (error) throw error;

        logger.info('[Account] Deletion request submitted');
        toast.showToast({
          message: 'Account scheduled for deletion. You will receive a confirmation email within 24 hours.',
          type: 'success',
        });
        navigation.navigate('Welcome');
      } catch (error) {
        logger.error('[Account] Deletion failed', error as Error);
        toast.showToast({
          message: 'Failed to delete account. Please contact support.',
          type: 'error',
        });
      }
    } else {
      toast.showToast({
        message: 'Account deletion cancelled',
        type: 'info',
      });
    }
  };

  const handleKeepAccount = () => {
    toast.showToast({ message: 'Great! Your account is safe.', type: 'success' });
    navigation.goBack();
  };

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
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete account</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Card */}
        <View style={styles.warningCard}>
          <MaterialCommunityIcons
            name={'alert' as IconName}
            size={24}
            color={COLORS.feedback.error}
            style={styles.warningIcon}
          />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>This action is permanent</Text>
            <Text style={styles.warningDescription}>
              You will permanently lose all your moments, messages, and wallet
              history.
            </Text>
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>What will happen?</Text>

        {/* Information List */}
        <View style={styles.infoList}>
          {INFO_ITEMS.map((item) => (
            <View key={item.id} style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={24}
                  color={COLORS.text.primary}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>{item.title}</Text>
                <Text style={styles.infoDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Confirmation Input */}
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationLabel}>Type DELETE to confirm</Text>
          <Controller
            control={control}
            name="confirmation"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  style={[
                    styles.confirmationInput,
                    error && styles.confirmationInputError,
                  ]}
                  placeholder="DELETE"
                  placeholderTextColor={COLORS.text.secondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="characters"
                />
                {error && (
                  <Text style={styles.errorText}>{error.message}</Text>
                )}
              </>
            )}
          />
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            !canSubmitForm({ formState }) && styles.deleteButtonDisabled,
          ]}
          onPress={handleSubmit(onDelete)}
          disabled={!canSubmitForm({ formState })}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete my account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.keepButton}
          onPress={handleKeepAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.keepButtonText}>Keep my account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.errorTransparent10,
    borderWidth: 1,
    borderColor: COLORS.errorTransparent20,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 16,
  },
  warningIcon: {
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  warningDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 32,
    marginBottom: 8,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 72,
    paddingVertical: 8,
    gap: 16,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  infoDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  confirmationContainer: {
    marginTop: 32,
    gap: 8,
  },
  confirmationLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  confirmationInput: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.bg.primary,
    paddingHorizontal: 12,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.primary,
  },
  confirmationInputError: {
    borderColor: COLORS.feedback.error,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.feedback.error,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: `${COLORS.bg.primary}F0`,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    gap: 12,
  },
  deleteButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.feedback.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
  keepButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});

export default DeleteAccountScreen;
