import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';

const SCREENS = [
  { name: 'Onboarding', route: 'Onboarding' },
  { name: 'Auth: Login', route: 'Login' },
  { name: 'Auth: Register', route: 'Register' },
  { name: 'Main: Discover', route: 'Discover' },
  { name: 'Main: Inbox', route: 'Inbox' },
  { name: 'Main: Profile', route: 'Profile' },
  { name: 'Flow: Create Moment', route: 'CreateMoment' },
  { name: 'Flow: Checkout', route: 'Checkout' },
  { name: 'Detail: Chat', route: 'Chat' },
  { name: 'Detail: Wallet', route: 'Wallet' },
  { name: 'Detail: Gift Inbox', route: 'GiftInbox' },
  { name: 'Wallet: Withdraw', route: 'Withdraw' },
  { name: 'Settings: Privacy', route: 'PrivacyPolicy' },
  { name: 'Error: Link Not Found', route: 'LinkNotFound' },
  { name: 'Error: Maintenance', route: 'Maintenance' },
];

export const DevMenuScreen = ({ navigation }: any) => {
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
            onPress={() => navigation.navigate(screen.route)}
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
