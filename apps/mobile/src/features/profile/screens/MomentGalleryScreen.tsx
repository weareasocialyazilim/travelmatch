import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/config/supabase';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

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

export const MomentGalleryScreen: React.FC<MomentGalleryScreenProps> = ({
  navigation,
  route,
}) => {
  const momentId = route.params?.momentId || '';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      if (!momentId) return;
      try {
        const { data } = await supabase
          .from('moments')
          .select('images')
          .eq('id', momentId)
          .single();

        if (data?.images && Array.isArray(data.images)) {
          setImages(data.images);
        }
      } catch (error) {
        logger.error('Error fetching gallery', error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [momentId]);

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>No images found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{ uri: images[currentIndex] }}
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
            {images.map((_, index) => (
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.white,
  },
  goBackButton: {
    marginTop: 20,
  },
  goBackText: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.overlay50,
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
    backgroundColor: COLORS.overlay30,
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
    backgroundColor: COLORS.whiteTransparentLight,
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
    color: COLORS.textWhite80,
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
