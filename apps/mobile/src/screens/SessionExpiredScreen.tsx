import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackParamList } from '@/navigation/routeParams';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionExpired'>;

export const SessionExpiredScreen = ({ navigation }: Props) => {
  const handleLogin = () => {
    // Reset navigation to Auth stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'UnifiedAuth' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons
          name="timer-off-outline"
          size={60}
          color="black"
        />
      </View>

      <Text style={styles.title}>Session Timed Out</Text>
      <Text style={styles.desc}>
        For your security, we've logged you out due to inactivity. Please sign
        in again to continue your journey.
      </Text>

      <TouchableOpacity onPress={handleLogin} style={styles.touchable}>
        <LinearGradient
          colors={[COLORS.brand.primary, COLORS.brand.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          <Text style={styles.btnText}>Sign In Again</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  touchable: { width: '100%' },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: { fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 12 },
  desc: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 50,
  },
  btn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
