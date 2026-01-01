import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';

const RULES = [
  { icon: 'hand-heart', title: 'Be Respectful', desc: 'Treat everyone with kindness. Harassment or hate speech is zero tolerance.' },
  { icon: 'shield-check', title: 'Stay Safe', desc: 'Keep communication inside the app until you meet. Trust your instincts.' },
  { icon: 'camera-off', title: 'Respect Privacy', desc: 'Ask for permission before taking photos of others or sharing private info.' },
  { icon: 'clock-outline', title: 'Be Reliable', desc: 'If you commit to a moment, show up. Cancellations affect your trust score.' },
];

export const CommunityGuidelinesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Guidelines</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hero}>The Vibe Code</Text>
        <Text style={styles.sub}>How we keep TravelMatch safe and fun.</Text>

        {RULES.map((rule, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name={rule.icon as any} size={28} color={COLORS.brand.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{rule.title}</Text>
              <Text style={styles.cardDesc}>{rule.desc}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.agreeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.agreeText}>I Agree & Understand</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  hero: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 8 },
  sub: { color: COLORS.text.secondary, fontSize: 16, marginBottom: 40 },
  card: { flexDirection: 'row', marginBottom: 24 },
  iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cardContent: { flex: 1, paddingTop: 4 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  cardDesc: { color: '#888', lineHeight: 20 },
  agreeBtn: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.1)', padding: 18, borderRadius: 16, alignItems: 'center' },
  agreeText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
