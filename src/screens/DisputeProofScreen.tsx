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
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { RouteProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type DisputeProofScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DisputeProof'
>;
type DisputeProofScreenRouteProp = RouteProp<
  RootStackParamList,
  'DisputeProof'
>;

interface DisputeProofScreenProps {
  navigation: DisputeProofScreenNavigationProp;
  route: DisputeProofScreenRouteProp;
}

export const DisputeProofScreen: React.FC<DisputeProofScreenProps> = ({
  navigation,
  route,
}) => {
  const { proofId } = route.params || {};
  const [explanation, setExplanation] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<number>(0);

  const isSubmitEnabled = explanation.trim().length > 0;

  const handleSubmit = () => {
    // TODO: Implement dispute submission
    logger.info('Submitting dispute', { proofId, explanation, uploadedFiles });
  };

  const handleFileUpload = () => {
    if (uploadedFiles < 3) {
      setUploadedFiles(uploadedFiles + 1);
    }
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
        <Text style={styles.headerTitle}>Dispute Proof</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Moment Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryTitle}>Sunrise at Haleakalā</Text>
              <Text style={styles.summaryMeta}>$50 in Escrow</Text>
            </View>
            <View style={styles.rejectedBadge}>
              <Text style={styles.rejectedBadgeText}>Rejected</Text>
            </View>
          </View>
        </View>

        {/* Information Text */}
        <Text style={styles.infoText}>
          This is your opportunity to provide more context or evidence for a
          manual review. Please explain your perspective clearly and factually.
        </Text>

        {/* Explanation Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Explain the situation</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe why you believe the decision was incorrect and provide as much detail as possible."
            placeholderTextColor={COLORS.textSecondary}
            value={explanation}
            onChangeText={setExplanation}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* File Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadTitle}>
            Add Supporting Evidence ({uploadedFiles}/3)
          </Text>
          <View style={styles.uploadGrid}>
            {[0, 1, 2].map((index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.uploadBox,
                  index >= uploadedFiles && styles.uploadBoxDisabled,
                ]}
                onPress={handleFileUpload}
                disabled={index !== uploadedFiles}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={'image-plus' as IconName}
                  size={40}
                  color={
                    index >= uploadedFiles
                      ? `${COLORS.textSecondary}80`
                      : COLORS.textSecondary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isSubmitEnabled && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isSubmitEnabled}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Dispute</Text>
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
    width: 40,
    height: 40,
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
  summaryCard: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryTextContainer: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryMeta: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  rejectedBadge: {
    backgroundColor: COLORS.errorTransparent10,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rejectedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 144,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  uploadSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  uploadGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadBox: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxDisabled: {
    opacity: 0.5,
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
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default DisputeProofScreen;
