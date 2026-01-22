import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { showLoginPrompt } from '@/stores/modalStore';
import { EmptyState } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';

const TOGGLES = [
  {
    id: 'requests',
    label: 'New Requests',
    desc: 'When someone wants to join your moment',
  },
  {
    id: 'messages',
    label: 'Chat Messages',
    desc: 'Direct messages from other travelers',
  },
  {
    id: 'marketing',
    label: 'Offers & Updates',
    desc: 'News about Lovendo features',
  },
  { id: 'reminders', label: 'Reminders', desc: 'Upcoming moment alerts' },
];

export const NotificationSettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user, isGuest } = useAuth();
  const [settings, setSettings] = useState({
    requests: true,
    messages: true,
    marketing: false,
    reminders: true,
  });

  useEffect(() => {
    if (isGuest || !user) {
      showLoginPrompt({ action: 'default' });
    }
  }, [isGuest, user]);

  const toggle = (id: string) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

  if (isGuest || !user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EmptyState
          title={t('settings.loginRequiredTitle', 'Giriş gerekli')}
          description={t(
            'settings.loginRequiredMessage',
            'Ayarları görmek için giriş yapmanız gerekir.',
          )}
          actionLabel={t('settings.loginNow', 'Giriş Yap')}
          onAction={() => showLoginPrompt({ action: 'default' })}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {TOGGLES.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.textCol}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
            <Switch
              trackColor={{ false: '#3e3e3e', true: COLORS.brand.primary }}
              thumbColor={
                settings[item.id as keyof typeof settings] ? '#000' : '#f4f3f4'
              }
              onValueChange={() => toggle(item.id)}
              value={settings[item.id as keyof typeof settings]}
            />
          </View>
        ))}
      </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  textCol: { flex: 1, marginRight: 20 },
  label: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  desc: { color: '#666', fontSize: 13, lineHeight: 18 },
});
