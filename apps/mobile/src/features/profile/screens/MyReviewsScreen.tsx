import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const REVIEWS = [
  { id: '1', user: 'Marc B.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100', rating: 5, text: 'Amazing host! Showed me the best hidden spots.', date: '2 days ago' },
  { id: '2', user: 'Elena K.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100', rating: 4, text: 'Great vibe, but we were a bit late.', date: '1 week ago' },
  { id: '3', user: 'John D.', avatar: 'https://ui-avatars.com/api/?name=John', rating: 5, text: 'Highly recommend!', date: '2 weeks ago' },
];

export const MyReviewsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const renderStars = (count: number) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Ionicons key={i} name={i < count ? "star" : "star-outline"} size={14} color="#FFD700" />
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: typeof REVIEWS[0] }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={styles.ratingBadge}>
          {renderStars(item.rating)}
        </View>
      </View>
      <Text style={styles.reviewText}>"{item.text}"</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summary}>
        <Text style={styles.bigScore}>4.8</Text>
        <View>
          {renderStars(5)}
          <Text style={styles.reviewCount}>Based on 45 reviews</Text>
        </View>
      </View>

      <FlatList
        data={REVIEWS}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  bigScore: { fontSize: 48, fontWeight: '900', color: 'white' },
  reviewCount: { color: '#888', fontSize: 12, marginTop: 4 },
  list: { padding: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  date: { color: '#666', fontSize: 12 },
  ratingBadge: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 8 },
  reviewText: { color: '#ccc', lineHeight: 20, fontStyle: 'italic' },
});
