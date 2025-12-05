import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';

interface HiddenItem {
  id: string;
  type: 'gift' | 'moment';
  title: string;
  subtitle: string;
  avatar: string;
  hiddenAt: string;
}

export const HiddenItemsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [hiddenItems, setHiddenItems] = useState<HiddenItem[]>([
    {
      id: '1',
      type: 'gift',
      title: 'Gift from Emma',
      subtitle: '☕ Coffee · $10',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      hiddenAt: '2 days ago',
    },
    {
      id: '2',
      type: 'gift',
      title: 'Gift from John',
      subtitle: '🍕 Lunch · $25',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      hiddenAt: '1 week ago',
    },
  ]);

  const handleUnhide = (id: string) => {
    Alert.alert('Unhide Item', 'This item will be restored to your inbox.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unhide',
        onPress: () => {
          setHiddenItems((prev) => prev.filter((item) => item.id !== id));
          Alert.alert('Done', 'Item has been restored to your inbox.');
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
        onPress: () => {
          setHiddenItems((prev) => prev.filter((item) => item.id !== id));
          Alert.alert('Deleted', 'Item has been permanently deleted.');
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
          <MaterialCommunityIcons name="eye" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <MaterialCommunityIcons
            name="delete"
            size={20}
            color={COLORS.error}
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
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hidden Items</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
              color={COLORS.textTertiary}
            />
            <Text style={styles.emptyTitle}>No hidden items</Text>
            <Text style={styles.emptySubtitle}>
              Items you hide from your inbox will appear here.
            </Text>
          </View>
        )}
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
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unhideButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
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
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default HiddenItemsScreen;
