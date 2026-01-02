import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';

const SCREENS = [
  { name: 'Onboarding', route: 'Onboarding' as const },
  { name: 'Auth: Login', route: 'Login' as const },
  { name: 'Auth: Register', route: 'Register' as const },
  { name: 'Main: Discover', route: 'Discover' as const },
  { name: 'Main: Inbox', route: 'Inbox' as const },
  { name: 'Main: Profile', route: 'Profile' as const },
  { name: 'Flow: Create Moment', route: 'CreateMoment' as const },
  { name: 'Flow: Checkout', route: 'Checkout' as const },
  { name: 'Detail: Chat', route: 'Chat' as const },
  { name: 'Detail: Wallet', route: 'Wallet' as const },
  { name: 'Detail: Gift Inbox', route: 'GiftInbox' as const },
  { name: 'Wallet: Withdraw', route: 'Withdraw' as const },
  { name: 'Settings: Privacy', route: 'PrivacyPolicy' as const },
  { name: 'Error: Link Not Found', route: 'LinkNotFound' as const },
  { name: 'Error: Maintenance', route: 'Maintenance' as const },
];

type Props = NativeStackScreenProps<RootStackParamList, 'DevMenu'>;

export const DevMenuScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Developer Menu</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {SCREENS.map((screen, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => (navigation as any).navigate(screen.route)}
          >
            <Text style={styles.itemText}>{screen.name}</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#111' },
  title: { color: COLORS.brand.primary, fontWeight: 'bold', fontSize: 20, fontFamily: 'monospace' },
  list: { padding: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  itemText: { color: 'white', fontFamily: 'monospace' },
  arrow: { color: '#666' },
});

export default DevMenuScreen;
