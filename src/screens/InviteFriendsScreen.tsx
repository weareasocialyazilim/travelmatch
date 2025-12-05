import React, { useState } from 'react';
import { logger } from '../utils/logger';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Clipboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type InviteFriendsScreenProps = StackScreenProps<
  RootStackParamList,
  'InviteFriends'
>;

export default function InviteFriendsScreen({
  navigation,
}: InviteFriendsScreenProps) {
  const [inviteCode] = useState('TM-KEMAL23');
  const [friendsJoined] = useState(5);
  const [momentsGifted] = useState(2);

  const handleCopyCode = () => {
    Clipboard.setString(inviteCode);
    // You can add a toast notification here
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Join me on TravelMatch! Use my invite code: ${inviteCode}`,
      });
    } catch (error) {
      logger.error('Share failed:', error);
    }
  };

  const handleShareMessages = () => {
    // Implement SMS sharing
  };

  const handleShareInstagram = () => {
    // Implement Instagram sharing
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite friends</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
            }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title and Description */}
        <Text style={styles.mainTitle}>Share TravelMatch</Text>
        <Text style={styles.description}>
          Invite people who care about real moments.
        </Text>

        {/* Invite Code Card */}
        <View style={styles.inviteCodeCard}>
          <Text style={styles.codeLabel}>Your invite code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleShareLink}
          >
            <MaterialCommunityIcons
              name="link"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.primaryButtonText}>Share Invite Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShareMessages}
          >
            <MaterialCommunityIcons
              name="message-text"
              size={20}
              color={COLORS.text}
            />
            <Text style={styles.secondaryButtonText}>Share via Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShareInstagram}
          >
            <MaterialCommunityIcons
              name="share"
              size={20}
              color={COLORS.text}
            />
            <Text style={styles.secondaryButtonText}>Share on Instagram</Text>
          </TouchableOpacity>
        </View>

        {/* Your Impact Section */}
        <View style={styles.impactSection}>
          <Text style={styles.impactTitle}>Your impact</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Friends joined</Text>
              <Text style={styles.statValue}>{friendsJoined}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Moments gifted via invites</Text>
              <Text style={styles.statValue}>{momentsGifted}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  heroContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  inviteCodeCard: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mintTransparentLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  impactSection: {
    padding: 16,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  statsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  statDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  bottomSpacer: {
    height: 96,
  },
});
