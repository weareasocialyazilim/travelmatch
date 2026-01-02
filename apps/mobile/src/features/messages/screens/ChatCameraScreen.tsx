import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, type CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

interface ChatCameraScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const ChatCameraScreen: React.FC<ChatCameraScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
  }, []);

  const toggleCameraType = () => {
    setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = () => {
    // Fotoğraf çekme mantığı
    navigation.goBack();
  };

  if (!permission || !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No Camera Permission</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        {/* Top Controls */}
        <View style={[styles.controlsTop, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="flash-off" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View
          style={[styles.controlsBottom, { paddingBottom: insets.bottom + 40 }]}
        >
          <TouchableOpacity style={styles.galleryBtn}>
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.flipBtn} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: { color: 'white' },
  camera: { flex: 1 },
  controlsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
  },

  controlsBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  galleryBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
  },
  flipBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
  },
});
