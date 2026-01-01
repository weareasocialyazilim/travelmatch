import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

export const SuccessScreen = ({ navigation, route }: any) => {
  const { title = 'Success!', message = 'Operation completed successfully.', buttonText = 'Continue', nextScreen = 'Discover' } = route.params || {};

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = () => {
    if (nextScreen === 'BACK') navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: nextScreen }] });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <MaterialCommunityIcons name="check" size={60} color="black" />
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity style={styles.btn} onPress={handlePress}>
        <Text style={styles.btnText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.brand.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 16, textAlign: 'center' },
  message: { color: COLORS.text.secondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 60 },
  btn: { width: '100%', backgroundColor: 'white', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});

export default SuccessScreen;
