// Shared styles for KYC screens
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

export const kycStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  reviewDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  requirementsList: {
    gap: 16,
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  requirementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.brand.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementLabel: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  securityNoteText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    gap: 12,
  },
  optionCardSelected: {
    borderColor: COLORS.brand.primary,
    backgroundColor: `${COLORS.brand.primary}08`,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  optionLabelSelected: {
    color: COLORS.brand.primary,
  },
  guidelinesList: {
    gap: 12,
    marginBottom: 24,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guidelineText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
    flex: 1,
  },
  uploadSection: {
    gap: 12,
  },
  uploadLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 8,
  },
  uploadCard: {
    height: 160,
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCardDone: {
    borderColor: COLORS.feedback.success,
    borderStyle: 'solid',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadPlaceholderText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  uploadedContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadedText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.feedback.success,
  },
  selfieContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  selfieHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  cameraPlaceholder: {
    width: 250,
    height: 320,
    backgroundColor: COLORS.bg.primaryDark,
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovalMask: {
    width: 200,
    height: 260,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.utility.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  feedbackText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.feedback.success,
  },
  reviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  reviewCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  reviewValue: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  editButton: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.brand.primary,
  },
  docThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.bg.primary,
  },
  selfieThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  checkboxLabel: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  pendingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 32,
  },
  pendingHeader: {
    alignItems: 'center',
  },
  pendingIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${COLORS.brand.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pendingCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    gap: 12,
  },
  pendingCardTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  pendingCardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  nextStepsSection: {
    gap: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  nextStepDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});
