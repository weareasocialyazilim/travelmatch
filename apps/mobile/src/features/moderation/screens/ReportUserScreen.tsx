import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import { useToast } from '@/context/ToastContext';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type ReportUserScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ReportUser'
>;

type ReportUserScreenRouteProp = RouteProp<RootStackParamList, 'ReportUser'>;

interface ReportUserScreenProps {
  navigation: ReportUserScreenNavigationProp;
  route: ReportUserScreenRouteProp;
}

const REASONS = [
  'Inappropriate Content',
  'Spam or Scam',
  'Fake Profile',
  'Did not show up (No-show)',
  'Rude behavior',
  'Other',
];

export const ReportUserScreen: React.FC<ReportUserScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [desc, setDesc] = useState('');

  const handleSubmit = useCallback(() => {
    if (!selectedReason) return;
    Keyboard.dismiss();

    logger.info('Report submitted', {
      userId,
      selectedReason,
      additionalDetails: desc,
    });

    navigation.goBack();
    showToast({
      message: 'Report submitted successfully',
      type: 'success',
    });
  }, [userId, selectedReason, desc, navigation, showToast]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          testID="report-user-close-button"
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Report User</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.helperText}>
          Why are you reporting this user? Your report is anonymous.
        </Text>

        <View style={styles.reasonsContainer}>
          {REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonRow,
                selectedReason === reason && styles.activeReason,
              ]}
              onPress={() => setSelectedReason(reason)}
              testID={`report-reason-${reason.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Text
                style={[
                  styles.reasonText,
                  selectedReason === reason && styles.activeReasonText,
                ]}
              >
                {reason}
              </Text>
              {selectedReason === reason && (
                <Ionicons name="checkmark-circle" size={20} color="black" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Additional Details (Optional)</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Provide more context..."
          placeholderTextColor="#666"
          value={desc}
          onChangeText={setDesc}
          testID="report-user-details-input"
        />

        <TouchableOpacity
          style={[styles.submitBtn, !selectedReason && styles.disabledBtn]}
          disabled={!selectedReason}
          onPress={handleSubmit}
          testID="report-user-submit-button"
        >
          <Text style={styles.submitText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerSpacer: {
    width: 24,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 24,
  },
  helperText: {
    color: COLORS.text.secondary,
    marginBottom: 24,
    fontSize: 16,
  },
  reasonsContainer: {
    marginBottom: 30,
  },
  reasonRow: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeReason: {
    backgroundColor: COLORS.brand.primary,
  },
  reasonText: {
    color: 'white',
    fontWeight: '500',
  },
  activeReasonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  label: {
    color: '#888',
    marginBottom: 10,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 30,
  },
  submitBtn: {
    backgroundColor: '#FF4444',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#333',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
