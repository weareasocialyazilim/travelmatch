import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

export const PromoCodeScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const scale = useSharedValue(1);

  const handleApply = () => {
    Keyboard.dismiss();
    if (code.toUpperCase() === 'TRAVEL2026') {
      scale.value = withSequence(withSpring(1.2), withSpring(1));
      Alert.alert('Success! 🎉', '$20 Credit added to your wallet.', [
        { text: 'Awesome', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Invalid Code', 'Please check the code and try again.');
    }
  };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Add Promo Code</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="ticket-percent-outline" size={80} color={COLORS.brand.primary} />
        </View>

        <Text style={styles.title}>Have a Gift Code?</Text>
        <Text style={styles.desc}>Enter your promo code below to redeem exclusive rewards or wallet credit.</Text>

        <TextInput
          style={styles.input}
          placeholder="ENTER CODE"
          placeholderTextColor="#666"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          maxLength={12}
        />

        <Animated.View style={[styles.btnWrapper, btnStyle]}>
          <TouchableOpacity
            style={[styles.applyBtn, !code && styles.disabledBtn]}
            disabled={!code}
            onPress={handleApply}
          >
            <Text style={styles.btnText}>Redeem Code</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  iconBox: { marginBottom: 30, padding: 20, backgroundColor: 'rgba(204, 255, 0, 0.1)', borderRadius: 50 },
  title: { fontSize: 24, fontWeight: '900', color: 'white', marginBottom: 12 },
  desc: { color: COLORS.text.secondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 40 },
  input: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', height: 60, borderRadius: 16, textAlign: 'center', color: 'white', fontSize: 20, fontWeight: 'bold', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 30, letterSpacing: 2 },
  btnWrapper: { width: '100%' },
  applyBtn: { backgroundColor: COLORS.brand.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#333' },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  spacer: { width: 28 },
});

export default PromoCodeScreen;
