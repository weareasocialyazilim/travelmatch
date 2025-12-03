import React, { useState } from 'react';
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
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

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
  const [confirmationText, setConfirmationText] = useState('');

  const isDeleteEnabled = confirmationText.toUpperCase() === 'DELETE';

  const handleDelete = () => {
    // TODO: Implement account deletion
    logger.info('Deleting account...');
  };

  const handleKeepAccount = () => {
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
            color={COLORS.text}
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
            color={COLORS.error}
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
                  color={COLORS.text}
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
          <TextInput
            style={styles.confirmationInput}
            placeholder="DELETE"
            placeholderTextColor={COLORS.textSecondary}
            value={confirmationText}
            onChangeText={setConfirmationText}
            autoCapitalize="characters"
          />
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            !isDeleteEnabled && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={!isDeleteEnabled}
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
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  warningDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
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
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  confirmationContainer: {
    marginTop: 32,
    gap: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  confirmationInput: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: `${COLORS.background}F0`,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  deleteButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  keepButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default DeleteAccountScreen;
