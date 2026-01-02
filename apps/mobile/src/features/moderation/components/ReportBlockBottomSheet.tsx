import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { logger } from '../utils/logger';

interface ReportBlockBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (action: string, reason?: string, details?: string) => void;
  targetType?: 'user' | 'moment';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ReportReason = 'scam' | 'hate' | 'inappropriate' | 'other';

export const ReportBlockBottomSheet: React.FC<ReportBlockBottomSheetProps> = ({
  visible,
  onClose,
  onSubmit,
  targetType = 'user',
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<ReportReason>('scam');
  const [details, setDetails] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setExpandedSection(null);
      setSelectedReason('scam');
      setDetails('');
    }
  }, [visible]);

  logger.debug(
    'ReportBlockBottomSheet render - visible:',
    visible,
    'expandedSection:',
    expandedSection,
  );

  const handleReportUser = () => {
    setExpandedSection('reason');
  };

  const handleBlockUser = () => {
    onSubmit('block');
    onClose();
  };

  const handleHideMoment = () => {
    onSubmit('hide');
    onClose();
  };

  const handleSubmit = () => {
    const reasonText =
      selectedReason === 'scam'
        ? 'Scam or fake story'
        : selectedReason === 'hate'
        ? 'Hate / harassment'
        : selectedReason === 'inappropriate'
        ? 'Inappropriate content'
        : 'Other';
    onSubmit('report', reasonText, details);
    onClose();
  };

  const handleCancel = () => {
    setSelectedReason('scam');
    setDetails('');
    setExpandedSection(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <SafeAreaView edges={['bottom']} style={styles.container}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Report or block</Text>
              <Text style={styles.subtitle}>
                Help us keep TravelMatch safe.
              </Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Show main menu when not in report mode */}
              {expandedSection !== 'reason' && (
                <View style={styles.menuContainer}>
                  {/* Action Options */}
                  <TouchableOpacity
                    style={styles.actionItem}
                    onPress={handleReportUser}
                  >
                    <View style={styles.actionLeft}>
                      <View style={styles.actionIcon}>
                        <MaterialCommunityIcons
                          name="flag"
                          size={20}
                          color={COLORS.text.primary}
                        />
                      </View>
                      <Text style={styles.actionText}>Report {targetType}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={COLORS.text.secondary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionItemLarge}
                    onPress={handleBlockUser}
                  >
                    <View style={styles.actionLeft}>
                      <View style={styles.actionIconLarge}>
                        <MaterialCommunityIcons
                          name="account-cancel"
                          size={24}
                          color={COLORS.text.primary}
                        />
                      </View>
                      <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTextBold}>
                          Block{' '}
                          {targetType === 'moment' ? 'author' : targetType}
                        </Text>
                        <Text style={styles.actionTextSubtitle}>
                          You won&apos;t see each other
                        </Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color={COLORS.text.secondary}
                    />
                  </TouchableOpacity>

                  {targetType === 'moment' && (
                    <TouchableOpacity
                      style={styles.actionItem}
                      onPress={handleHideMoment}
                    >
                      <View style={styles.actionLeft}>
                        <View style={styles.actionIcon}>
                          <MaterialCommunityIcons
                            name="eye-off"
                            size={20}
                            color={COLORS.text.primary}
                          />
                        </View>
                        <Text style={styles.actionText}>Hide this moment</Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color={COLORS.text.secondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Expandable Reason Section - Only show when user clicked Report */}
              {expandedSection === 'reason' && (
                <View style={styles.reportContainer}>
                  <TouchableOpacity
                    style={styles.expandableHeader}
                    onPress={() => setExpandedSection(null)}
                  >
                    <Text style={styles.expandableTitle}>
                      Why are you reporting?
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-up"
                      size={20}
                      color={COLORS.text.primary}
                    />
                  </TouchableOpacity>

                  {/* Radio Options */}
                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      selectedReason === 'scam' && styles.radioOptionSelected,
                    ]}
                    onPress={() => setSelectedReason('scam')}
                  >
                    <Text style={styles.radioLabel}>Scam or fake story</Text>
                    <View style={styles.radioCircle}>
                      {selectedReason === 'scam' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      selectedReason === 'hate' && styles.radioOptionSelected,
                    ]}
                    onPress={() => setSelectedReason('hate')}
                  >
                    <Text style={styles.radioLabel}>Hate / harassment</Text>
                    <View style={styles.radioCircle}>
                      {selectedReason === 'hate' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      selectedReason === 'inappropriate' &&
                        styles.radioOptionSelected,
                    ]}
                    onPress={() => setSelectedReason('inappropriate')}
                  >
                    <Text style={styles.radioLabel}>Inappropriate content</Text>
                    <View style={styles.radioCircle}>
                      {selectedReason === 'inappropriate' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioOption,
                      selectedReason === 'other' && styles.radioOptionSelected,
                    ]}
                    onPress={() => setSelectedReason('other')}
                  >
                    <Text style={styles.radioLabel}>Other</Text>
                    <View style={styles.radioCircle}>
                      {selectedReason === 'other' && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Details Textarea */}
                  <TextInput
                    style={styles.textarea}
                    placeholder="Please describe the issue"
                    placeholderTextColor={COLORS.text.secondary}
                    value={details}
                    onChangeText={setDetails}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>
              )}
            </ScrollView>

            {/* Action Buttons - Only show when reporting */}
            {expandedSection === 'reason' && (
              <View style={styles.footerContainer}>
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay.heavy,
  },
  modalContent: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {},
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  reportContainer: {
    paddingHorizontal: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  actionItemLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.mintBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconLarge: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.mintBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    color: COLORS.text.primary,
    flex: 1,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTextBold: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  actionTextSubtitle: {
    fontSize: 14,
    color: COLORS.mintDark,
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.mintBorder,
    marginTop: 8,
  },
  expandableTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    marginTop: 12,
  },
  radioOptionSelected: {
    borderColor: COLORS.brand.primary,
    borderWidth: 2,
    backgroundColor: COLORS.brand.primary + '10',
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.brand.primary,
  },
  textarea: {
    minHeight: 144,
    backgroundColor: COLORS.bg.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.text.primary,
    marginTop: 16,
  },
  footerContainer: {
    backgroundColor: COLORS.bg.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  submitButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.bg.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});
