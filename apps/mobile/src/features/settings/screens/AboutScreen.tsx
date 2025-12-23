import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const AboutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const appInfo = [
    { icon: 'information' as IconName, label: 'Version', value: '1.0.2' },
    { icon: 'hammer-wrench' as IconName, label: 'Build', value: '245' },
    {
      icon: 'calendar-month' as IconName,
      label: 'Build Date',
      value: 'October 26, 2023',
    },
    {
      icon: 'copyright' as IconName,
      label: 'Copyright',
      value: '© 2023 TravelMatch Inc.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>About TravelMatch</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name={'airplane' as IconName}
              size={40}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.appName}>TravelMatch</Text>
          <Text style={styles.tagline}>
            A proof-based social gifting platform built for real moments.
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
        </View>

        {/* Information List */}
        <View style={styles.infoList}>
          {appInfo.map((item) => (
            <View key={item.label} style={styles.infoItem}>
              <View style={styles.infoLeft}>
                <View style={styles.infoIconContainer}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </View>
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  headerSpacer: {
    width: 48,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    ...TYPOGRAPHY.display2,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 8,
  },
  tagline: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 336,
  },
  dividerContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  divider: {
    width: '100%',
    maxWidth: 448,
    height: 1,
    backgroundColor: COLORS.border,
  },
  infoList: {
    paddingVertical: 24,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.text,
  },
  legalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 32,
  },
  legalLink: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.primary,
  },
});
