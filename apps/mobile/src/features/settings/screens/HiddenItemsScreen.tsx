import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import { profileApi } from '@/features/profile/services/profileApi';
import { logger } from '@/utils/logger';

interface HiddenItem {
  id: string;
  type: 'gift' | 'moment';
  title: string;
  subtitle: string;
  avatar: string;
  hiddenAt: string;
}

export const HiddenItemsScreen: React.FC = () => {
  const { showToast } = useToast();
  const { showConfirmation: _showConfirmation } = useConfirmation();
  const navigation = useNavigation();

  const [hiddenItems, setHiddenItems] = useState<HiddenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHiddenItems = useCallback(async () => {
    try {
      const items = await profileApi.getHiddenItems();
      setHiddenItems(items);
    } catch (error) {
      logger.error('Failed to fetch hidden items', error);
      showToast('Failed to load hidden items', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchHiddenItems();
  }, [fetchHiddenItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHiddenItems();
  }, [fetchHiddenItems]);

  const handleUnhide = (id: string) => {
    Alert.alert('Unhide Item', 'This item will be restored to your inbox.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unhide',
        onPress: async () => {
          try {
            await profileApi.unhideItem(id);
            setHiddenItems((prev) => prev.filter((item) => item.id !== id));
            showToast('Item has been restored to your inbox.', 'success');
          } catch (error) {
            logger.error('Failed to unhide item', error);
            showToast('Failed to unhide item', 'error');
          }
        },
      },
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Permanently?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await profileApi.deleteHiddenItem(id);
            setHiddenItems((prev) => prev.filter((item) => item.id !== id));
            showToast('Item has been permanently deleted.', 'info');
          } catch (error) {
            logger.error('Failed to delete hidden item', error);
            showToast('Failed to delete item', 'error');
          }
        },
      },
    ]);
  };

  const renderItem = (item: HiddenItem) => (
    <View key={item.id} style={styles.itemCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        <Text style={styles.itemDate}>Hidden {item.hiddenAt}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.unhideButton}
          onPress={() => handleUnhide(item.id)}
        >
          <MaterialCommunityIcons name="eye" size={20} color={COLORS.brand.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <MaterialCommunityIcons
            name="delete"
            size={20}
            color={COLORS.feedback.error}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hidden Items</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
        </View>
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {hiddenItems.length > 0 ? (
          <>
            <Text style={styles.sectionInfo}>
              Items you&apos;ve hidden will appear here. You can unhide them or
              delete them permanently.
            </Text>
            {hiddenItems.map(renderItem)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="eye-off-outline"
              size={64}
              color={COLORS.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No hidden items</Text>
            <Text style={styles.emptySubtitle}>
              Items you hide from your inbox will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionInfo: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  itemSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  itemDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unhideButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.errorRedLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default HiddenItemsScreen;
