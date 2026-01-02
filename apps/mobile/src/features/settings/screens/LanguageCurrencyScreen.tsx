import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const LANGUAGES = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const CURRENCIES = [
  { id: 'USD', label: 'US Dollar', symbol: '$' },
  { id: 'EUR', label: 'Euro', symbol: '€' },
  { id: 'TRY', label: 'Turkish Lira', symbol: '₺' },
  { id: 'GBP', label: 'British Pound', symbol: '£' },
];

export const LanguageCurrencyScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'lang' | 'curr'>('lang');
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedCurr, setSelectedCurr] = useState('USD');

  const renderItem = ({ item }: { item: any }) => {
    const isLang = activeTab === 'lang';
    const isSelected = isLang ? selectedLang === item.id : selectedCurr === item.id;

    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.itemActive]}
        onPress={() => isLang ? setSelectedLang(item.id) : setSelectedCurr(item.id)}
      >
        <View style={styles.itemLeft}>
          <Text style={styles.itemIcon}>{isLang ? item.flag : item.symbol}</Text>
          <Text style={[styles.itemLabel, isSelected && styles.itemLabelActive]}>{item.label}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.brand.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.title}>Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lang' && styles.activeTab]}
          onPress={() => setActiveTab('lang')}
        >
          <Text style={[styles.tabText, activeTab === 'lang' && styles.activeTabText]}>Language</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'curr' && styles.activeTab]}
          onPress={() => setActiveTab('curr')}
        >
          <Text style={[styles.tabText, activeTab === 'curr' && styles.activeTabText]}>Currency</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'lang' ? LANGUAGES : CURRENCIES}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerSpacer: { width: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  tabContainer: { flexDirection: 'row', margin: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: COLORS.text.secondary, fontWeight: '600' },
  activeTabText: { color: 'white' },
  list: { paddingHorizontal: 20 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'transparent' },
  itemActive: { borderColor: COLORS.brand.primary, backgroundColor: 'rgba(204, 255, 0, 0.05)' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIcon: { fontSize: 24, fontWeight: 'bold', color: 'white', width: 30, textAlign: 'center' },
  itemLabel: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  itemLabelActive: { color: 'white', fontWeight: 'bold' },
});
