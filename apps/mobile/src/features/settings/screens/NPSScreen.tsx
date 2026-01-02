import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const NPSScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [score, setScore] = useState<number | null>(null);

  const handleSubmit = () => {
    if (score && score >= 9) {
      // Prompt for App Store review
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.closeBtn, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="close" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>How likely are you to recommend TravelMatch to a friend?</Text>

        <View style={styles.scoreGrid}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.scoreBtn, score === num && styles.scoreBtnActive]}
              onPress={() => setScore(num)}
            >
              <Text style={[styles.scoreText, score === num && styles.scoreTextActive]}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.labels}>
          <Text style={styles.label}>Not Likely</Text>
          <Text style={styles.label}>Very Likely</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, score === null && styles.disabledBtn]}
          disabled={score === null}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  closeBtn: { position: 'absolute', right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 40 },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 10 },
  scoreBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  scoreBtnActive: { backgroundColor: COLORS.brand.primary, borderColor: COLORS.brand.primary },
  scoreText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  scoreTextActive: { color: 'black' },
  labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 50 },
  label: { color: '#666', fontSize: 12 },
  submitBtn: { backgroundColor: 'white', padding: 18, borderRadius: 16, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#333' },
  submitText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});

export default NPSScreen;
