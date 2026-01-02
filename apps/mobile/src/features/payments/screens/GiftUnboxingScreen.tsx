import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const GiftUnboxingScreen = () => {
  const navigation = useNavigation();
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // 1. Box Pops Up
    scale.value = withSpring(1);

    // 2. Shake Effect
    rotate.value = withDelay(500, withRepeat(withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    ), 3));

    // 3. Content Fade In
    opacity.value = withDelay(1500, withTiming(1, { duration: 800 }));
  }, []);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }]
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withSpring(opacity.value * 0) }]
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background.primary, '#1a0b2e']}
        style={styles.gradient}
      />

      {/* Animated Gift Box */}
      <Animated.View style={[styles.boxContainer, boxStyle]}>
        <MaterialCommunityIcons name="gift" size={150} color={COLORS.brand.accent} />
        <View style={styles.glow} />
      </Animated.View>

      {/* Reveal Content */}
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.congrats}>YOU GOT A VIBE!</Text>
        <Text style={styles.desc}>
          <Text style={styles.highlight}>Selin Y.</Text> gifted you the experience:
        </Text>

        <View style={styles.ticketCard}>
          <Text style={styles.ticketTitle}>Dinner at Hotel Costes</Text>
          <Text style={styles.ticketValue}>Value: $150</Text>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('ChatDetail', { chatId: 'new' })}
        >
          <Text style={styles.btnText}>Say Thanks & Chat</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' },
  gradient: { ...StyleSheet.absoluteFillObject },
  boxContainer: { marginBottom: 50, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.brand.accent, opacity: 0.3, zIndex: -1, transform: [{ scale: 1.5 }] },
  content: { alignItems: 'center', width: '100%', paddingHorizontal: 30 },
  congrats: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 16, textAlign: 'center', letterSpacing: 1 },
  desc: { color: COLORS.text.secondary, fontSize: 18, textAlign: 'center', marginBottom: 30 },
  highlight: { color: 'white', fontWeight: 'bold' },
  ticketCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 24, borderRadius: 20, width: '100%', alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  ticketTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  ticketValue: { color: COLORS.brand.primary, fontSize: 16, fontWeight: 'bold' },
  btn: { backgroundColor: 'white', paddingHorizontal: 32, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center' },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});
