import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export const ImageViewerScreen = ({ navigation, route }: any) => {
  const { imageUrl } = route.params || { imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de' }; // Fallback for dev
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />

      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 20 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  image: { width, height },
  closeBtn: { position: 'absolute', right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
});
