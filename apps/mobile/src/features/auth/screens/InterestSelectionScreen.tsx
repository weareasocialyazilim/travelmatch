import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';

const INTERESTS = [
  { id: 'coffee', label: 'Coffee ☕️' },
  { id: 'dining', label: 'Fine Dining 🍽️' },
  { id: 'party', label: 'Nightlife 🪩' },
  { id: 'art', label: 'Art & Museums 🎨' },
  { id: 'nature', label: 'Hiking 🌲' },
  { id: 'photo', label: 'Photography 📸' },
  { id: 'wine', label: 'Wine Tasting 🍷' },
  { id: 'tech', label: 'Tech Talks 💻' },
  { id: 'yoga', label: 'Yoga 🧘‍♀️' },
  { id: 'music', label: 'Live Music 🎸' },
  { id: 'fashion', label: 'Fashion 👗' },
  { id: 'gaming', label: 'Gaming 🎮' },
];

export const InterestSelectionScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(prev => prev.filter(i => i !== id));
    else setSelected(prev => [...prev, id]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.step}>STEP 3/3</Text>
        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Discover' }] })}>
           <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What's your vibe?</Text>
        <Text style={styles.subtitle}>Select at least 3 interests to get better moment recommendations.</Text>

        <View style={styles.grid}>
          {INTERESTS.map((item) => {
            const isActive = selected.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.bubble, isActive && styles.bubbleActive]}
                onPress={() => toggle(item.id)}
              >
                <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, selected.length < 3 && styles.disabledBtn]}
          disabled={selected.length < 3}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Discover' }] })}
        >
          <Text style={styles.btnText}>Finish Setup</Text>
          <Ionicons name="arrow-forward" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, alignItems: 'center' },
  step: { color: COLORS.brand.primary, fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  skip: { color: '#666', fontSize: 14, fontWeight: '600' },
  content: { padding: 24 },
  title: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 12 },
  subtitle: { color: '#888', fontSize: 16, marginBottom: 40, lineHeight: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  bubble: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' },
  bubbleActive: { backgroundColor: COLORS.brand.primary, borderColor: COLORS.brand.primary },
  label: { color: 'white', fontWeight: '600' },
  labelActive: { color: 'black' },
  footer: { padding: 24 },
  nextBtn: { backgroundColor: COLORS.brand.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  disabledBtn: { backgroundColor: '#333', opacity: 0.5 },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
