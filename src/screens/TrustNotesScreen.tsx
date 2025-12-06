import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type TrustNotesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TrustNotes'
>;

interface TrustNotesScreenProps {
  navigation: TrustNotesScreenNavigationProp;
}

interface TrustNote {
  id: string;
  note: string;
  from: string;
  moment: string;
}

const TRUST_NOTES: TrustNote[] = [
  {
    id: '1',
    note: '"Felt like I was there."',
    from: 'Marco',
    moment: 'Galata coffee moment',
  },
  {
    id: '2',
    note: '"An incredible and authentic experience!"',
    from: 'Sarah',
    moment: 'Sunset in Santorini',
  },
];

export const TrustNotesScreen: React.FC<TrustNotesScreenProps> = ({
  navigation,
}) => {
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name={'forum' as IconName}
          size={32}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.emptyTextContainer}>
        <Text style={styles.emptyTitle}>No notes yet</Text>
        <Text style={styles.emptyDescription}>
          Notes from supporters will appear here once they are left.
        </Text>
      </View>
    </View>
  );

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
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trust notes</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Short notes from supporters appear on the traveler&apos;s profile as
            social proof.
          </Text>
        </View>

        {/* Notes List */}
        {TRUST_NOTES.length > 0 ? (
          <View style={styles.notesList}>
            {TRUST_NOTES.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteText}>{note.note}</Text>
                <Text style={styles.noteMeta}>
                  From {note.from} • {note.moment}
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    color: COLORS.text,
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
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  notesList: {
    padding: 16,
    gap: 16,
  },
  noteCard: {
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
    lineHeight: 24,
  },
  noteMeta: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingTop: 64,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTextContainer: {
    alignItems: 'center',
    maxWidth: 320,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
