import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import {
  getTrustNotesForUser,
  TrustNote,
} from '@/services/trustNotesService';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackNavigationProp } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type TrustNotesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TrustNotes'
>;

interface TrustNotesScreenProps {
  navigation: TrustNotesScreenNavigationProp;
}

export const TrustNotesScreen: React.FC<TrustNotesScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<TrustNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!user?.id) return;

    try {
      const fetchedNotes = await getTrustNotesForUser(user.id);
      setNotes(fetchedNotes);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNotes();
  }, [loadNotes]);

  const renderEmptyState = () => (
    <EmptyState
      icon="forum"
      title="Henüz not yok"
      description="Destekçilerinizden gelen notlar burada görünecek."
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={'arrow-left' as IconName}
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Güven Notları</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Güven Notları</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.brand.primary]}
          />
        }
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Destekçilerinizden gelen kısa notlar profilinizde sosyal kanıt olarak görünür.
          </Text>
        </View>

        {/* Notes List */}
        {notes.length > 0 ? (
          <View style={styles.notesList}>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteText}>"{note.note}"</Text>
                <Text style={styles.noteMeta}>
                  {note.writerName} • {note.momentTitle || 'Genel'}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  infoBanner: {
    padding: 16,
    paddingBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  notesList: {
    padding: 16,
    gap: 16,
  },
  noteCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 8,
  },
  noteText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  noteMeta: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});
