/**
 * KYCDocumentTypeScreen - Awwwards Edition
 *
 * Premium document selection with interactive glass cards.
 * Features Twilight Zinc dark theme with neon accents.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { GlassCard } from '@/components/ui/GlassCard';
import { KYCProgressBar } from './KYCProgressBar';
import {
  KYC_COLORS,
  KYC_TYPOGRAPHY,
  KYC_SPACING,
  KYC_SPRINGS,
  KYC_DOCUMENT_TYPES,
} from './theme';
import type { DocumentType, VerificationData } from './types';
import type { StackNavigationProp } from '@react-navigation/stack';

type RouteParams = {
  KYCDocumentType: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCDocumentCapture: { data: VerificationData };
}>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface DocumentCardProps {
  doc: typeof KYC_DOCUMENT_TYPES[number];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  isSelected,
  onSelect,
  index,
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const borderProgress = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      borderProgress.value = withSpring(1, KYC_SPRINGS.snappy);
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      borderProgress.value = withSpring(0, KYC_SPRINGS.gentle);
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isSelected, borderProgress, glowOpacity]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, KYC_SPRINGS.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, KYC_SPRINGS.bouncy);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 100).springify()}
      style={cardStyle}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.cardContainer}>
          {/* Neon glow layer */}
          {isSelected && (
            <Animated.View style={[styles.cardGlow, glowStyle]} />
          )}

          <GlassCard
            intensity={isSelected ? 25 : 12}
            style={[
              styles.documentCard,
              isSelected && styles.documentCardSelected,
            ]}
            padding={0}
          >
            <View style={styles.cardContent}>
              {/* Icon Container */}
              <View
                style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name={doc.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={28}
                  color={isSelected ? KYC_COLORS.neon.lime : KYC_COLORS.text.secondary}
                />
              </View>

              {/* Text Content */}
              <View style={styles.textContent}>
                <Text
                  style={[
                    styles.cardTitle,
                    isSelected && styles.cardTitleSelected,
                  ]}
                >
                  {doc.title}
                </Text>
                <Text style={styles.cardDescription}>{doc.description}</Text>
              </View>

              {/* Selection Indicator */}
              <View style={styles.selectionIndicator}>
                {isSelected ? (
                  <View style={styles.checkCircle}>
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={KYC_COLORS.background.primary}
                    />
                  </View>
                ) : (
                  <View style={styles.emptyCircle} />
                )}
              </View>
            </View>
          </GlassCard>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const KYCDocumentTypeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCDocumentType'>>();
  const { data } = route.params;

  const [selectedType, setSelectedType] = useState<DocumentType | null>(
    data.documentType,
  );

  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(0.5);

  useEffect(() => {
    buttonOpacity.value = withSpring(selectedType ? 1 : 0.5, KYC_SPRINGS.gentle);
  }, [selectedType, buttonOpacity]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const handleContinue = () => {
    if (!selectedType) return;

    navigation.navigate('KYCDocumentCapture', {
      data: {
        ...data,
        documentType: selectedType,
      },
    });
  };

  const handlePressIn = () => {
    if (selectedType) {
      buttonScale.value = withSpring(0.96, KYC_SPRINGS.snappy);
    }
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, KYC_SPRINGS.bouncy);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={KYC_COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kimlik Belgesi</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* Progress Bar */}
        <KYCProgressBar currentStep="document" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Text style={styles.title}>Hangi belgeyi kullanacaksın?</Text>
            <Text style={styles.subtitle}>
              Lütfen yanındaki geçerli bir resmi belgeyi seç.
            </Text>
          </Animated.View>

          {/* Document Options */}
          <View style={styles.optionsList}>
            {KYC_DOCUMENT_TYPES.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isSelected={selectedType === doc.id}
                onSelect={() => setSelectedType(doc.id as DocumentType)}
                index={index}
              />
            ))}
          </View>
        </ScrollView>

        {/* Footer with CTA */}
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          style={styles.footer}
        >
          <AnimatedTouchable
            style={[styles.primaryButton, buttonAnimatedStyle]}
            onPress={handleContinue}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!selectedType}
            activeOpacity={1}
          >
            <LinearGradient
              colors={KYC_COLORS.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Devam Et</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={KYC_COLORS.background.primary}
              />
            </LinearGradient>
          </AnimatedTouchable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: KYC_COLORS.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: KYC_SPACING.screenPadding,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: KYC_COLORS.glass.backgroundMedium,
  },
  headerTitle: {
    ...KYC_TYPOGRAPHY.cardTitle,
    color: KYC_COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: KYC_SPACING.screenPadding,
    paddingBottom: 24,
  },

  // Title
  title: {
    ...KYC_TYPOGRAPHY.pageTitle,
    color: KYC_COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...KYC_TYPOGRAPHY.body,
    color: KYC_COLORS.text.secondary,
    marginBottom: 32,
  },

  // Options
  optionsList: {
    gap: 16,
  },
  cardContainer: {
    position: 'relative',
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: KYC_COLORS.neon.lime,
    ...Platform.select({
      ios: {
        shadowColor: KYC_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {},
    }),
  },
  documentCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: KYC_COLORS.glass.border,
  },
  documentCardSelected: {
    borderColor: KYC_COLORS.neon.lime,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconContainer: {
    width: KYC_SPACING.iconSize,
    height: KYC_SPACING.iconSize,
    borderRadius: KYC_SPACING.iconRadius,
    backgroundColor: KYC_COLORS.glass.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: `${KYC_COLORS.neon.lime}15`,
  },
  textContent: {
    flex: 1,
  },
  cardTitle: {
    ...KYC_TYPOGRAPHY.cardTitle,
    color: KYC_COLORS.text.primary,
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: KYC_COLORS.neon.lime,
  },
  cardDescription: {
    ...KYC_TYPOGRAPHY.cardDesc,
    color: KYC_COLORS.text.secondary,
  },
  selectionIndicator: {
    marginLeft: 8,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: KYC_COLORS.neon.lime,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: KYC_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: KYC_COLORS.glass.borderActive,
  },

  // Footer
  footer: {
    paddingHorizontal: KYC_SPACING.screenPadding,
    paddingBottom: 24,
    paddingTop: 16,
  },
  primaryButton: {
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: KYC_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: KYC_COLORS.background.primary,
    letterSpacing: 0.3,
  },
});

export default withErrorBoundary(KYCDocumentTypeScreen, {
  fallbackType: 'generic',
  displayName: 'KYCDocumentTypeScreen',
});
