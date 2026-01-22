import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface HomeWelcomeCardProps {
  userName?: string;
  onSetupProfile?: () => void;
  onExplore?: () => void;
}

/**
 * HomeWelcomeCard - Empty state for new users on the Home Screen
 *
 * Design Guidelines (Adrian K / DESIGNME):
 * - Home screen must address empty state (when users have no content)
 * - Include a clear call-to-action guiding users to the app's primary function
 * - Personalized information and quick access to main features
 */
export const HomeWelcomeCard: React.FC<HomeWelcomeCardProps> = ({
  userName = '',
  onSetupProfile,
  onExplore,
}) => {
  const firstName = userName.trim().split(' ')[0];
  const titleText = firstName ? `Welcome, ${firstName}!` : 'Welcome!';

  return (
    <View style={styles.container}>
      {/* Welcome Card */}
      <LinearGradient
        colors={[COLORS.brand.primary, COLORS.mint]}
        style={styles.welcomeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.welcomeContent}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="gift-outline"
              size={32}
              color={COLORS.utility.white}
            />
          </View>
          <Text style={styles.welcomeTitle}>{titleText}</Text>
          <Text style={styles.welcomeSubtitle}>
            İpeksi anları keşfetmeye hazır mısın? Unique moments and gifts await
            you.
          </Text>
        </View>

        {/* Decorative circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Get Started</Text>

        {/* Setup Profile Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onSetupProfile}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Complete your profile"
          accessibilityHint="Add a photo and bio to connect with hosts"
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: COLORS.brand.secondaryTransparent },
            ]}
          >
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={24}
              color={COLORS.brand.secondary}
            />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Complete Your Profile</Text>
            <Text style={styles.actionDescription}>
              Add a photo and bio to connect with hosts
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>

        {/* Explore Card */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={onExplore}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Explore nearby"
          accessibilityHint="Discover experiences shared by locals"
        >
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: COLORS.mintTransparent },
            ]}
          >
            <MaterialCommunityIcons
              name="compass-outline"
              size={24}
              color={COLORS.mint}
            />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Explore Nearby</Text>
            <Text style={styles.actionDescription}>
              Discover experiences shared by locals
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Quick Tips</Text>
        <View style={styles.tipsGrid}>
          <View style={styles.tipCard}>
            <MaterialCommunityIcons
              name="gift-outline"
              size={20}
              color={COLORS.feedback.success}
            />
            <Text style={styles.tipText}>
              Hediye göndermeden önce anıyı incele
            </Text>
          </View>
          <View style={styles.tipCard}>
            <MaterialCommunityIcons
              name="card-text-outline"
              size={20}
              color={COLORS.feedback.info}
            />
            <Text style={styles.tipText}>İpeksi teşekkür kartları oluştur</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  welcomeContent: {
    zIndex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.utility.white,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -30,
    right: -30,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -20,
    right: 40,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.text.secondary,
  },
  tipsContainer: {
    marginBottom: 16,
  },
  tipsGrid: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});

export default HomeWelcomeCard;
