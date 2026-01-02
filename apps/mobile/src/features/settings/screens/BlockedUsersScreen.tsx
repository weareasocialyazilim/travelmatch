import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const BLOCKED_INIT = [
  { id: '1', name: 'Spam Account', handle: '@spam123', avatar: 'https://ui-avatars.com/api/?name=Spam' },
  { id: '2', name: 'Rude Guy', handle: '@rudeboy', avatar: 'https://ui-avatars.com/api/?name=Rude' },
];

export const BlockedUsersScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [blocked, setBlocked] = useState(BLOCKED_INIT);

  const handleUnblock = (id: string) => {
    setBlocked(prev => prev.filter(u => u.id !== id));
  };

  const renderItem = ({ item }: { item: typeof BLOCKED_INIT[0] }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.handle}>{item.handle}</Text>
      </View>
      <TouchableOpacity style={styles.unblockBtn} onPress={() => handleUnblock(item.id)}>
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={blocked}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="shield-checkmark-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>No blocked users. Good vibes only! ✨</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerSpacer: { width: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  list: { padding: 20 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 16, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  info: { flex: 1 },
  name: { color: 'white', fontWeight: 'bold' },
  handle: { color: COLORS.text.secondary, fontSize: 12 },
  unblockBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  unblockText: { color: 'white', fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.text.secondary, marginTop: 16, fontSize: 16 },
});
