import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const AboutScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="compass-rose" size={60} color="black" />
        </View>
        <Text style={styles.appName}>TravelMatch</Text>
        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('TermsOfService')}>
            <Text style={styles.itemText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.itemText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.flexSpacer} />

        <Text style={styles.footer}>Made with ⚡️ in Istanbul</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 30, alignItems: 'center' },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.brand.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  appName: { fontSize: 24, fontWeight: '900', color: 'white', marginBottom: 4 },
  version: { color: '#666', marginBottom: 50 },
  menu: { width: '100%' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemText: { color: 'white', fontSize: 16, fontWeight: '500' },
  footer: { color: '#444', marginBottom: 20, fontSize: 12 },
  headerSpacer: { width: 24 },
  flexSpacer: { flex: 1 },
});
