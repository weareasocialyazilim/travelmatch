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
import { COLORS } from '../constants/colors';
import { logger } from '@/utils/logger';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type ReportUserScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ReportUser'
>;

type ReportUserScreenRouteProp = RouteProp<RootStackParamList, 'ReportUser'>;

interface ReportUserScreenProps {
  navigation: ReportUserScreenNavigationProp;
  route: ReportUserScreenRouteProp;
}

type ReportReason = 'scam' | 'hate' | 'fake' | 'inappropriate' | 'other';

interface ReportOption {
  id: ReportReason;
  label: string;
}

const REPORT_OPTIONS: ReportOption[] = [
  { id: 'scam', label: 'Scam or payment issue' },
  { id: 'hate', label: 'Hate, threats or harassment' },
  { id: 'fake', label: 'Fake identity or fake trip' },
  { id: 'inappropriate', label: 'Inappropriate messages' },
  { id: 'other', label: 'Other' },
];

export const ReportUserScreen: React.FC<ReportUserScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) return;
    // Handle report submission
    logger.info('Report submitted', {
      userId,
      selectedReason,
      additionalDetails,
    });
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
        <Text style={styles.headerTitle}>Report User</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Appleseed</Text>
            <Text style={styles.userRole}>Traveler / Local</Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>What&apos;s the issue?</Text>

        {/* Report Options */}
        <View style={styles.optionsList}>
          {REPORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                selectedReason === option.id && styles.optionItemSelected,
              ]}
              onPress={() => setSelectedReason(option.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <View
                style={[
                  styles.radio,
                  selectedReason === option.id && styles.radioSelected,
                ]}
              >
                {selectedReason === option.id && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Details */}
        <View style={styles.textFieldContainer}>
          <Text style={styles.textFieldLabel}>Add details (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Please provide more information..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={additionalDetails}
            onChangeText={setAdditionalDetails}
          />
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedReason && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedReason}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Send report</Text>
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
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  optionsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  optionItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: `${COLORS.border}CC`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  textFieldContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  textFieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 144,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: `${COLORS.background}F5`,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
