import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';

type Props = NativeStackScreenProps<RootStackParamList, 'NotFound'>;

export const NotFoundScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="ghost"
        size={80}
        color="rgba(255,255,255,0.2)"
        style={styles.icon}
      />
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Vibe Not Found</Text>
      <Text style={styles.desc}>
        The moment you are looking for might have expired, been deleted, or
        never existed in this timeline.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      >
        <Text style={styles.btnText}>Back to Discovery</Text>
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
    padding: 40,
  },
  icon: { marginBottom: 20 },
  code: {
    fontSize: 80,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.05)',
    position: 'absolute',
    top: 100,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 16 },
  desc: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },
  btn: {
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
