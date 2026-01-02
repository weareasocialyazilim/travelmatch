import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3; // 3 column grid with 1px gaps

const MEDIA = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=300' },
  { id: '2', uri: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=300' },
  { id: '3', uri: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=300' },
  { id: '4', uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300' },
  { id: '5', uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=300' },
];

export const MediaGridScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: typeof MEDIA[0] }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ImageViewer', { imageUrl: item.uri })}
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.title}>Shared Media</Text>
        <View style={styles.spacer} />
      </View>

      <FlatList
        data={MEDIA}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  list: { padding: 0 },
  image: { width: ITEM_SIZE, height: ITEM_SIZE, margin: 0.5, backgroundColor: '#333' },
  spacer: { width: 24 },
});
