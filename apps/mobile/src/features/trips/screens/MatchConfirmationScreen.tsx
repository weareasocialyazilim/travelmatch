import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { COLORS } from '@/constants/colors';
import { RADII } from '../constants/radii';
import { SHADOWS } from '../constants/shadows';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { RouteProp, NavigationProp } from '@react-navigation/native';

type MatchConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  'MatchConfirmation'
>;

const MatchConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MatchConfirmationScreenRouteProp>();
  const { selectedGivers } = route.params;
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Discover');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && <LoadingState type="overlay" message="Confirming..." />}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Matches</Text>
        <View style={styles.headerRight} />
      </View>

      <FlashList
        data={selectedGivers}
        estimatedItemSize={100}
        renderItem={({ item }) => (
          <View style={styles.giverCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.giverInfo}>
              <Text style={styles.giverName}>{item.name}</Text>
              <Text style={styles.giverAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: RADII.full,
    height: 50,
    marginRight: SPACING.md,
    width: 50,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    padding: SPACING.md,
  },
  confirmButtonText: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.white,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    padding: SPACING.md,
  },
  giverAmount: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
  },
  giverCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    flexDirection: 'row',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  giverInfo: {
    flex: 1,
  },
  giverName: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  headerRight: {
    width: 24,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  listContent: {
    padding: SPACING.md,
  },
});

export default MatchConfirmationScreen;
