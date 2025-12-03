import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const DisputeTransactionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [reason, setReason] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    'receipt_screenshot.png',
  ]);

  const maxChars = 1000;

  const handleFileUpload = () => {
    // In production, use expo-document-picker or expo-image-picker
    Alert.alert('File Upload', 'File picker would open here');
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (reason.trim().length < 20) {
      Alert.alert(
        'Error',
        'Please provide a detailed explanation (at least 20 characters)',
      );
      return;
    }
    navigation.navigate('Success', { type: 'dispute' });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Transaction</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Transaction Details Section */}
        <Text style={styles.sectionTitle}>Transaction Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gift Amount</Text>
            <Text style={styles.detailValueBold}>$50.00</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recipient</Text>
            <Text style={styles.detailValue}>Anna S.</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>Oct 12, 2023</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>TRX-1A2B3C4D5E</Text>
          </View>
        </View>

        {/* Reason Section */}
        <Text style={styles.sectionTitle}>Explain your reason for dispute</Text>
        <Text style={styles.helperText}>
          Describe the issue clearly. Why did the travel moment not meet the
          verified criteria?
        </Text>

        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Please provide a detailed explanation..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={6}
            value={reason}
            onChangeText={setReason}
            maxLength={maxChars}
            textAlignVertical="top"
          />
          <Text style={styles.charCounter}>
            {reason.length}/{maxChars}
          </Text>
        </View>

        {/* File Upload Section */}
        <Text style={styles.sectionTitle}>Supporting Evidence (Optional)</Text>
        <TouchableOpacity style={styles.uploadArea} onPress={handleFileUpload}>
          <MaterialCommunityIcons
            name={'cloud-upload' as IconName}
            size={48}
            color={`${COLORS.primary}80`}
          />
          <Text style={styles.uploadTitle}>Click to upload or drag & drop</Text>
          <Text style={styles.uploadSubtitle}>
            Max 5 files, 10MB each. JPG, PNG, PDF accepted.
          </Text>
        </TouchableOpacity>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <View style={styles.filesContainer}>
            {uploadedFiles.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <View style={styles.fileLeft}>
                  <MaterialCommunityIcons
                    name={'image' as IconName}
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.fileName}>{file}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                  <MaterialCommunityIcons
                    name={'close' as IconName}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Dispute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    paddingVertical: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primary}1A`,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.24,
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.24,
    marginTop: 24,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  detailsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.primary}1A`,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.primary}33`,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 144,
  },
  charCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${COLORS.primary}4D`,
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  filesContainer: {
    marginTop: 16,
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  bottomSpacer: {
    height: 160,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.primary}1A`,
    backgroundColor: COLORS.background,
    gap: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  cancelButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
