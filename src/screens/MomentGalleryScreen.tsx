import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { RouteProp } from '@react-navigation/native';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type MomentGalleryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MomentGallery'
>;
type MomentGalleryScreenRouteProp = RouteProp<
  RootStackParamList,
  'MomentGallery'
>;

interface MomentGalleryScreenProps {
  navigation: MomentGalleryScreenNavigationProp;
  route: MomentGalleryScreenRouteProp;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock images - replace with actual data
const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
];

export const MomentGalleryScreen: React.FC<MomentGalleryScreenProps> = ({
  navigation,
  route,
}) => {
  const _momentId = route.params?.momentId || '';
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < GALLERY_IMAGES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{ uri: GALLERY_IMAGES[currentIndex] }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Top Bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={'arrow-left' as IconName}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <MaterialCommunityIcons
              name={'dots-horizontal' as IconName}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          {/* Page Indicators */}
          <View style={styles.pageIndicators}>
            {GALLERY_IMAGES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pageIndicator,
                  index === currentIndex
                    ? styles.pageIndicatorActive
                    : styles.pageIndicatorInactive,
                ]}
              />
            ))}
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>Sunrise coffee at Galata</Text>
          <Text style={styles.description}>Swipe to see the full story</Text>
        </View>

        {/* Touch Areas for Navigation */}
        <TouchableOpacity
          style={[styles.touchArea, styles.touchAreaLeft]}
          onPress={handlePrevious}
          activeOpacity={1}
        />
        <TouchableOpacity
          style={[styles.touchArea, styles.touchAreaRight]}
          onPress={handleNext}
          activeOpacity={1}
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'space-between',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
    zIndex: 10,
  },
  pageIndicators: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  pageIndicator: {
    height: 6,
    borderRadius: 3,
  },
  pageIndicatorActive: {
    width: 24,
    backgroundColor: COLORS.white,
  },
  pageIndicatorInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
  },
  touchAreaLeft: {
    left: 0,
  },
  touchAreaRight: {
    right: 0,
  },
});
