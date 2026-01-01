import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

interface Contact {
  id: string;
  name: string;
  phone: string;
  hasApp: boolean;
  avatar?: string;
}

const CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Alice M.',
    phone: '+1 555 0101',
    hasApp: true,
    avatar: 'https://ui-avatars.com/api/?name=Alice',
  },
  { id: '2', name: 'Bob K.', phone: '+1 555 0102', hasApp: false },
  { id: '3', name: 'Charlie', phone: '+1 555 0103', hasApp: false },
];

type InviteContactsScreenProps = StackScreenProps<
  RootStackParamList,
  'InviteContacts'
>;

export default function InviteContactsScreen({
  navigation,
}: InviteContactsScreenProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return CONTACTS;
    const query = search.toLowerCase();
    return CONTACTS.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.includes(query)
    );
  }, [search]);

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.row}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Text style={styles.initials}>{item.name[0]}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <TouchableOpacity
        style={[styles.actionBtn, item.hasApp ? styles.addBtn : styles.inviteBtn]}
      >
        <Text
          style={[
            styles.btnText,
            item.hasApp ? styles.addBtnText : styles.inviteBtnText,
          ]}
        >
          {item.hasApp ? 'Add' : 'Invite'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textInverse} />
        </TouchableOpacity>
        <Text style={styles.title}>Find Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Search contacts..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textInverse,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentDarker,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.textInverse,
  },
  list: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  placeholderAvatar: {
    backgroundColor: COLORS.backgroundDarkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    color: COLORS.textInverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  phone: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtn: {
    backgroundColor: COLORS.brand.primary,
  },
  inviteBtn: {
    backgroundColor: COLORS.whiteTransparentDarker,
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  addBtnText: {
    color: COLORS.textPrimary,
  },
  inviteBtnText: {
    color: COLORS.textInverse,
  },
});
