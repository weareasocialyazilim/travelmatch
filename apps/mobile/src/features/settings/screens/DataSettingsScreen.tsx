import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const DataSettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [dataSaver, setDataSaver] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const handleClearCache = () => {
    showAlert({
      title: 'Clear Cache?',
      message: 'This will free up 145 MB. No personal data will be deleted.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => showAlert({ title: 'Cache Cleared!' }),
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data & Storage</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Media</Text>

        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={styles.label}>Data Saver Mode</Text>
            <Text style={styles.desc}>Reduce image quality to save data</Text>
          </View>
          <Switch
            trackColor={{ false: '#3e3e3e', true: COLORS.brand.primary }}
            onValueChange={() => setDataSaver(!dataSaver)}
            value={dataSaver}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.textCol}>
            <Text style={styles.label}>Autoplay Videos</Text>
            <Text style={styles.desc}>Play videos automatically on Wi-Fi</Text>
          </View>
          <Switch
            trackColor={{ false: '#3e3e3e', true: COLORS.brand.primary }}
            onValueChange={() => setAutoPlay(!autoPlay)}
            value={autoPlay}
          />
        </View>

        <Text style={styles.sectionTitle}>Storage</Text>

        <View style={styles.storageCard}>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>App Size</Text>
            <Text style={styles.usageVal}>45 MB</Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Documents & Data</Text>
            <Text style={styles.usageVal}>145 MB</Text>
          </View>

          <TouchableOpacity style={styles.clearBtn} onPress={handleClearCache}>
            <Text style={styles.clearText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerSpacer: { width: 24 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  sectionTitle: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  textCol: { flex: 1, marginRight: 20 },
  label: { color: 'white', fontSize: 16, fontWeight: '500', marginBottom: 4 },
  desc: { color: '#666', fontSize: 13 },
  storageCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  usageLabel: { color: '#ccc' },
  usageVal: { color: 'white', fontWeight: 'bold' },
  clearBtn: {
    marginTop: 20,
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  clearText: { color: 'white', fontWeight: '600' },
});

export default DataSettingsScreen;
