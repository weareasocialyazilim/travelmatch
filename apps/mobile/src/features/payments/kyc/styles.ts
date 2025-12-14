// Shared styles for KYC screens
import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

export const kycStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: COLORS.primary,
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
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  reviewDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
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
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementLabel: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  securityNoteText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: COLORS.primary,
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
    color: COLORS.text,
    flex: 1,
  },
  uploadSection: {
    gap: 12,
  },
  uploadLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
  },
  uploadCard: {
    height: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCardDone: {
    borderColor: COLORS.success,
    borderStyle: 'solid',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadPlaceholderText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  uploadedContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadedText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.success,
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
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovalMask: {
    width: 200,
    height: 260,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  feedbackText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.success,
  },
  reviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  reviewValue: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  editButton: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.primary,
  },
  docThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  selfieThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
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
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
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
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pendingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  pendingCardTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
  },
  pendingCardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
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
    color: COLORS.text,
    marginBottom: 2,
  },
  nextStepDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
