import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/routeParams';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'ImageViewer'>;

export const ImageViewerScreen = ({ route, navigation }: Props) => {
  const { imageUrl } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>

      {/* Image */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Actions (Optional - Save/Share) */}
      <View style={[styles.actionBar, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="download-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(50,50,50,0.5)',
    borderRadius: 20,
  },
  imageContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: width, height: height },
  actionBar: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 20,
    alignSelf: 'center',
  },
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(50,50,50,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
