// KYC Document Type Selection Screen - Awwwards standard glass cards
// Featuring silky glass effects and neon selection highlights
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { HapticManager } from '@/services/HapticManager';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { SPACING, RADIUS } from '@/constants/spacing';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { KYCHeader } from './KYCHeader';
import { KYCProgressBar } from './KYCProgressBar';
import { useKycAuthGuard } from './useKycAuthGuard';
import type { DocumentType, VerificationData } from './types';
import type { StackNavigationProp } from '@react-navigation/stack';

type RouteParams = {
  KYCDocumentType: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCDocumentCapture: { data: VerificationData };
}>;

// Enhanced document options with descriptions
const DOCUMENT_OPTIONS = [
  {
    id: 'passport' as DocumentType,
    label: 'Pasaport',
    description: 'Uluslararası seyahat belgesi',
    icon: 'passport' as const,
    accentColor: COLORS.primary,
  },
  {
    id: 'id_card' as DocumentType,
    label: 'TC Kimlik Kartı',
    description: 'Yeni nesil çipli kimlik',
    icon: 'card-account-details' as const,
    accentColor: COLORS.secondary,
  },
  {
    id: 'drivers_license' as DocumentType,
    label: 'Ehliyet',
    description: 'Fotoğraflı sürücü belgesi',
    icon: 'car' as const,
    accentColor: COLORS.accent.primary,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DocumentCardProps {
  option: (typeof DOCUMENT_OPTIONS)[0];
  isSelected: boolean;
  onSelect: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(isSelected ? 1 : 0);

  // Update border animation when selection changes
  React.useEffect(() => {
    borderOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected, borderOpacity]);

  const triggerHaptic = useCallback(() => {
    HapticManager.buttonPress();
  }, []);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePress = useCallback(() => {
    runOnJS(triggerHaptic)();
    onSelect();
  }, [onSelect, triggerHaptic]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <GlassCard
        intensity={isSelected ? 30 : 15}
        tint="light"
        style={styles.documentCard}
        borderRadius={RADIUS.xl}
        padding={0}
        showBorder={false}
      >
        {/* Selection border overlay */}
        <Animated.View
          style={[
            styles.selectionBorder,
            { borderColor: option.accentColor },
            borderStyle,
          ]}
        />

        <View style={styles.cardContent}>
          {/* Icon container with glow */}
          <View
            style={[
              styles.iconContainer,
              isSelected && { backgroundColor: `${option.accentColor}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={28}
              color={isSelected ? option.accentColor : COLORS.text.secondary}
            />
          </View>

          {/* Text content */}
          <View style={styles.textContent}>
            <Text
              style={[
                styles.cardTitle,
                isSelected && { color: option.accentColor },
              ]}
            >
              {option.label}
            </Text>
            <Text style={styles.cardDescription}>{option.description}</Text>
          </View>

          {/* Selection indicator */}
          <View
            style={[
              styles.selectionIndicator,
              isSelected && styles.selectionIndicatorActive,
              isSelected && { borderColor: option.accentColor },
            ]}
          >
            {isSelected && (
              <MaterialCommunityIcons
                name="check"
                size={14}
                color={option.accentColor}
              />
            )}
          </View>
        </View>

        {/* Neon accent line */}
        {isSelected && (
          <View
            style={[styles.accentLine, { backgroundColor: option.accentColor }]}
          />
        )}
      </GlassCard>
    </AnimatedPressable>
  );
};

const KYCDocumentTypeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCDocumentType'>>();
  const insets = useSafeAreaInsets();
  const { data } = route.params;

  const [selectedType, setSelectedType] = useState<DocumentType | null>(
    data.documentType,
  );
  useKycAuthGuard();

  const handleContinue = () => {
    if (!selectedType) return;

    HapticManager.primaryAction();
    navigation.navigate('KYCDocumentCapture', {
      data: {
        ...data,
        documentType: selectedType,
      },
    });
  };

  return (
    <View style={styles.container}>
      <KYCHeader title="Belge Seçimi" />
      <KYCProgressBar currentStep="document" variant="ceremony" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Belge Türünü Seç</Text>
          <Text style={styles.description}>
            Kimlik doğrulama için kullanmak istediğin resmi belgeyi seç.
          </Text>
        </View>

        {/* Document Options */}
        <View style={styles.optionsContainer}>
          {DOCUMENT_OPTIONS.map((option) => (
            <DocumentCard
              key={option.id}
              option={option}
              isSelected={selectedType === option.id}
              onSelect={() => setSelectedType(option.id)}
            />
          ))}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={16}
            color={COLORS.trust.primary}
          />
          <Text style={styles.securityText}>
            Belgelerin 256-bit şifreleme ile korunur
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}
      >
        <Button
          title="Devam Et"
          variant="primary"
          onPress={handleContinue}
          size="lg"
          disabled={!selectedType}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING['2xl'],
  },
  titleSection: {
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  description: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  documentCard: {
    position: 'relative',
    overflow: 'hidden',
  },
  selectionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderRadius: RADIUS.xl,
    pointerEvents: 'none',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.base,
    backgroundColor: COLORS.surface.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.base,
  },
  textContent: {
    flex: 1,
  },
  cardTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  cardDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorActive: {
    backgroundColor: 'transparent',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.base,
    backgroundColor: `${COLORS.trust.primary}10`,
    borderRadius: RADIUS.md,
  },
  securityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.trust.primary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.base,
    backgroundColor: COLORS.bg.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  continueButton: {
    height: 56,
  },
});

export default withErrorBoundary(KYCDocumentTypeScreen, {
  fallbackType: 'generic',
  displayName: 'KYCDocumentTypeScreen',
});
