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
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { getTrustNotesForUser, TrustNote } from '@/services/trustNotesService';
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

// Digital Jewelry gradient colors - each note gets a unique premium gradient
const JEWELRY_GRADIENTS: [string, string][] = [
  ['rgba(245, 158, 11, 0.08)', 'rgba(236, 72, 153, 0.08)'], // Amber to Magenta
  ['rgba(16, 185, 129, 0.08)', 'rgba(59, 130, 246, 0.08)'], // Emerald to Blue
  ['rgba(139, 92, 246, 0.08)', 'rgba(236, 72, 153, 0.08)'], // Purple to Magenta
  ['rgba(59, 130, 246, 0.08)', 'rgba(16, 185, 129, 0.08)'], // Blue to Emerald
  ['rgba(236, 72, 153, 0.08)', 'rgba(245, 158, 11, 0.08)'], // Magenta to Amber
];

const ACCENT_COLORS = [
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#EC4899', // Magenta
];

const getGradientColors = (index: number): [string, string] => {
  return JEWELRY_GRADIENTS[index % JEWELRY_GRADIENTS.length];
};

const getAccentColor = (index: number): string => {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
};

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
            Destekçilerinizden gelen kısa notlar profilinizde sosyal kanıt
            olarak görünür.
          </Text>
        </View>

        {/* Notes List - Digital Jewelry Design */}
        {notes.length > 0 ? (
          <View style={styles.notesList}>
            {notes.map((note, index) => (
              <View key={note.id} style={styles.noteCardWrapper}>
                {/* Blurhash-style gradient background from moment */}
                <LinearGradient
                  colors={getGradientColors(index)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.noteCardGradient}
                />
                <View style={styles.noteCard}>
                  {/* Quote icon - jewelry accent */}
                  <View style={styles.quoteIconContainer}>
                    <MaterialCommunityIcons
                      name="format-quote-open"
                      size={24}
                      color={getAccentColor(index)}
                    />
                  </View>
                  <Text style={styles.noteText}>"{note.note}"</Text>
                  <View style={styles.noteFooter}>
                    <View style={styles.writerInfo}>
                      <MaterialCommunityIcons
                        name="account-circle"
                        size={16}
                        color={COLORS.text.secondary}
                      />
                      <Text style={styles.writerName}>{note.writerName}</Text>
                    </View>
                    {note.momentTitle && (
                      <View style={styles.momentInfo}>
                        <MaterialCommunityIcons
                          name="gift-outline"
                          size={14}
                          color={getAccentColor(index)}
                        />
                        <Text
                          style={[
                            styles.momentTitle,
                            { color: getAccentColor(index) },
                          ]}
                        >
                          {note.momentTitle}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
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
  // Digital Jewelry Card Styles
  noteCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  noteCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    margin: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quoteIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.5,
  },
  noteText: {
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'italic',
    color: COLORS.text.primary,
    lineHeight: 26,
    marginBottom: 16,
    paddingRight: 24, // Space for quote icon
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingTop: 12,
  },
  writerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  writerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  momentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  momentTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
});
