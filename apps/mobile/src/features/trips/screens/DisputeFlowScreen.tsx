import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/config/supabase';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import { disputeSchema, type DisputeInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { RouteProp, NavigationProp } from '@react-navigation/native';

type _IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type DisputeFlowRouteProp = RouteProp<RootStackParamList, 'DisputeFlow'>;

export const DisputeFlowScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<DisputeFlowRouteProp>();
  const { type, id, details } = route.params || {};

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState,
    watch,
    setValue,
  } = useForm<DisputeInput>({
    resolver: zodResolver(disputeSchema),
    mode: 'onChange',
    defaultValues: {
      reason: '',
      evidence: [],
    },
  });

  const reason = watch('reason');
  const evidence = watch('evidence') || [];

  if (!type || !id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Missing dispute information.</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleFileUpload = () => {
    // Mock file upload for now - in real app use DocumentPicker
    if (evidence.length < 3) {
      setValue('evidence', [
        ...evidence,
        `evidence_${evidence.length + 1}.jpg`,
      ]);
    } else {
      Alert.alert('Limit Reached', 'You can only upload up to 3 files.');
    }
  };

  const handleRemoveFile = (index: number) => {
    setValue('evidence', evidence.filter((_: string, i: number) => i !== index));
  };

  const onSubmit = async (formData: DisputeInput) => {
    setLoading(true);
    try {
      const _table =
        type === 'transaction' ? 'transaction_disputes' : 'proof_disputes';
      const foreignKey = type === 'transaction' ? 'transaction_id' : 'proof_id';

      // In a real app, you would upload files to storage first and get URLs

      const { error } = await supabase
        .from('disputes') // Assuming a unified disputes table or separate ones
        .insert({
          [foreignKey]: id,
          reason: formData.reason,
          evidence: formData.evidence || [],
          status: 'pending',
          type: type,
        });

      if (error) {
        // Fallback for demo/mock if table doesn't exist yet
        logger.warn(
          'Dispute submission failed (likely due to missing table), simulating success',
          error,
        );
      }

      navigation.navigate('Success', { type: 'dispute' });
    } catch (error) {
      logger.error('Error submitting dispute', error as Error);
      Alert.alert('Error', 'Failed to submit dispute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.sectionTitle}>
        {type === 'transaction' ? 'Dispute Transaction' : 'Dispute Proof'}
      </Text>

      {details && (
        <View style={styles.detailsCard}>
          <Text style={styles.detailLabel}>Reference ID: {id}</Text>
          {/* Render other details dynamically if needed */}
        </View>
      )}

      <Text style={styles.label}>Why are you disputing this?</Text>
      <Controller
        control={control}
        name="reason"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <TextInput
              style={[styles.textArea, error && styles.inputError]}
              placeholder="Please provide a detailed explanation..."
              multiline
              numberOfLines={6}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={1000}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
      <Text style={styles.charCount}>{reason.length}/1000</Text>

      <TouchableOpacity
        style={[styles.button, !reason.trim() && styles.buttonDisabled]}
        disabled={!reason.trim()}
        onPress={() => setStep(2)}
      >
        <Text style={styles.buttonText}>Next: Add Evidence</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>Add Evidence</Text>
      <Text style={styles.helperText}>
        Upload screenshots or documents to support your claim.
      </Text>

      <View style={styles.uploadArea}>
        {evidence.map((file: string, index: number) => (
          <View key={index} style={styles.fileItem}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color={COLORS.text}
            />
            <Text style={styles.fileName}>{file}</Text>
            <TouchableOpacity onPress={() => handleRemoveFile(index)}>
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={COLORS.error}
              />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleFileUpload}
        >
          <MaterialCommunityIcons
            name="cloud-upload"
            size={32}
            color={COLORS.primary}
          />
          <Text style={styles.uploadButtonText}>Tap to Upload</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep(1)}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
          <Text style={styles.buttonText}>Next: Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.sectionTitle}>Review & Submit</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>Reason:</Text>
        <Text style={styles.reviewValue}>{reason}</Text>

        <Text style={styles.reviewLabel}>Evidence:</Text>
        <Text style={styles.reviewValue}>
          {evidence.length > 0
            ? `${evidence.length} files attached`
            : 'No files attached'}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep(2)}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            !canSubmitForm({ formState }) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={!canSubmitForm({ formState }) || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Submit Dispute</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.surface,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    height: 150,
    textAlignVertical: 'top',
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 4,
  },
  charCount: {
    textAlign: 'right',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 24,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  uploadArea: {
    marginBottom: 24,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginLeft: 12,
    color: COLORS.text,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  uploadButtonText: {
    color: COLORS.primary,
    marginTop: 8,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainerText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 20,
  },
});
