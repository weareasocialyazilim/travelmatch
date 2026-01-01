import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';

type DietaryPreferencesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DietaryPreferences'
>;

interface DietaryPreferencesScreenProps {
  navigation: DietaryPreferencesScreenNavigationProp;
}

const PREFS = [
  { id: 'vegan', label: 'Vegan 🌿' },
  { id: 'vegetarian', label: 'Vegetarian 🥗' },
  { id: 'pescatarian', label: 'Pescatarian 🐟' },
  { id: 'gluten_free', label: 'Gluten Free 🌾' },
  { id: 'halal', label: 'Halal 🕌' },
  { id: 'kosher', label: 'Kosher 🕍' },
  { id: 'nut_free', label: 'Nut Free 🥜' },
  { id: 'dairy_free', label: 'Dairy Free 🥛' },
];

export const DietaryPreferencesScreen: React.FC<DietaryPreferencesScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(prev => prev.filter(i => i !== id));
    else setSelected(prev => [...prev, id]);
  };

  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dietary Preferences</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.desc}>
          Select your dietary requirements so hosts can choose appropriate venues.
        </Text>

        <View style={styles.grid}>
          {PREFS.map((item) => {
            const isActive = selected.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, isActive && styles.itemActive]}
                onPress={() => toggle(item.id)}
              >
                <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
                {isActive && <Ionicons name="checkmark-circle" size={20} color="black" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  saveText: { color: COLORS.brand.primary, fontWeight: 'bold', fontSize: 16 },
  content: { padding: 20 },
  desc: { color: COLORS.text.secondary, marginBottom: 30, fontSize: 15, lineHeight: 22 },
  grid: { gap: 12 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'transparent' },
  itemActive: { backgroundColor: COLORS.brand.primary, borderColor: COLORS.brand.primary },
  label: { color: 'white', fontSize: 16, fontWeight: '500' },
  labelActive: { color: 'black', fontWeight: 'bold' },
});

export default DietaryPreferencesScreen;
