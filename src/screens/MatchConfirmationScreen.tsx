import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { radii } from '../constants/radii';
import { TYPOGRAPHY } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';
import Loading from '../components/Loading';

type MatchConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  'MatchConfirmation'
>;

const MatchConfirmationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MatchConfirmationScreenRouteProp>();
  const { selectedGivers } = route.params;
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Home');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && <Loading text="Confirming..." mode="overlay" />}
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

      <FlatList
        data={selectedGivers}
        renderItem={({ item }) => (
          <View style={styles.giverCard}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.giverInfo}>
              <Text style={styles.giverName}>{item.name}</Text>
              <Text style={styles.giverAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
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
    borderRadius: radii.full,
    height: 50,
    marginRight: spacing.md,
    width: 50,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  confirmButtonText: {
    ...TYPOGRAPHY.h3,
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
    padding: spacing.md,
  },
  giverAmount: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  giverCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: radii.md,
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
    ...SHADOWS.sm,
  },
  giverInfo: {
    flex: 1,
  },
  giverName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    ...SHADOWS.sm,
  },
  headerRight: {
    width: 24,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
  },
  listContent: {
    padding: spacing.md,
  },
});

export default MatchConfirmationScreen;
