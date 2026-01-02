import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const BADGES = [
  { id: '1', title: 'Early Adopter', desc: 'Joined in 2026', icon: 'https://cdn-icons-png.flaticon.com/512/5778/5778393.png', unlocked: true },
  { id: '2', title: 'Super Host', desc: 'Hosted 10+ Moments', icon: 'https://cdn-icons-png.flaticon.com/512/3112/3112946.png', unlocked: true },
  { id: '3', title: 'Globetrotter', desc: 'Visited 5 Countries', icon: 'https://cdn-icons-png.flaticon.com/512/921/921490.png', unlocked: false },
  { id: '4', title: 'Vibe Master', desc: '5 Star Rating avg.', icon: 'https://cdn-icons-png.flaticon.com/512/1426/1426735.png', unlocked: false },
];

export const AchievementsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: typeof BADGES[0] }) => (
    <View style={[styles.card, !item.unlocked && styles.lockedCard]}>
      <Image source={{ uri: item.icon }} style={[styles.icon, !item.unlocked && styles.lockedIcon]} />
      <View style={styles.info}>
        <Text style={[styles.badgeTitle, !item.unlocked && { color: '#666' }]}>{item.title}</Text>
        <Text style={styles.badgeDesc}>{item.desc}</Text>
      </View>
      {item.unlocked ? (
        <Ionicons name="checkmark-circle" size={24} color={COLORS.brand.primary} />
      ) : (
        <Ionicons name="lock-closed" size={20} color="#444" />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Ionicons name="arrow-back" size={24} color="white" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={BADGES}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  list: { padding: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  lockedCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'transparent' },
  icon: { width: 50, height: 50, marginRight: 16 },
  lockedIcon: { opacity: 0.3, tintColor: 'gray' },
  info: { flex: 1 },
  badgeTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  badgeDesc: { color: '#888', fontSize: 12 },
});
