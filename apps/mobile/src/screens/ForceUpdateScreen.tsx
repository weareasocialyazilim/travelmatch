import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const ForceUpdateScreen = () => {
  const handleUpdate = () => {
    // Open App Store / Play Store
    Linking.openURL('https://apps.apple.com/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="rocket-launch" size={60} color="black" />
      </View>

      <Text style={styles.title}>Time for an Upgrade</Text>
      <Text style={styles.desc}>
        We've added new features and fixed some bugs.
        Please update TravelMatch to continue vibing.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
        <Text style={styles.btnText}>Update Now</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Current: v1.0 • Required: v2.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.brand.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: 'white', textAlign: 'center', marginBottom: 16 },
  desc: { color: COLORS.text.secondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 50 },
  btn: { width: '100%', backgroundColor: 'white', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
  version: { color: '#444', marginTop: 30, fontSize: 12 },
});
