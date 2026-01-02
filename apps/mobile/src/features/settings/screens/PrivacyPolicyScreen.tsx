import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const PrivacyPolicyScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>1. Data Collection</Text>
        <Text style={styles.para}>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</Text>

        <Text style={styles.section}>2. Location Information</Text>
        <Text style={styles.para}>When you use the Services for transportation or delivery, we collect precise location data about the trip from the TravelMatch app used by the Host.</Text>

        <Text style={styles.section}>3. Use of Information</Text>
        <Text style={styles.para}>We may use the information we collect about you to provide, maintain, and improve our Services, such as processing payments and facilitating payments.</Text>

        <Text style={styles.section}>4. Sharing of Information</Text>
        <Text style={styles.para}>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing.</Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerSpacer: { width: 24 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 24 },
  section: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  para: { color: COLORS.text.secondary, fontSize: 15, lineHeight: 24 },
  bottomSpacer: { height: 40 },
});

export default PrivacyPolicyScreen;
