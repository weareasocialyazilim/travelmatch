import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackNavigationProp } from '@react-navigation/stack';

type GiftCardMarketScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'GiftCardMarket'
>;

interface GiftCardMarketScreenProps {
  navigation: GiftCardMarketScreenNavigationProp;
}

interface GiftCard {
  id: string;
  amount: number;
  color: readonly [string, string];
}

const CARDS: GiftCard[] = [
  { id: '1', amount: 25, color: ['#FF9966', '#FF5E62'] as const },
  { id: '2', amount: 50, color: ['#56CCF2', '#2F80ED'] as const },
  { id: '3', amount: 100, color: ['#11998e', '#38ef7d'] as const },
];

export const GiftCardMarketScreen: React.FC<GiftCardMarketScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: GiftCard }) => (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.8}>
      <LinearGradient
        colors={item.color}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.cardLogo}>TRAVELMATCH.</Text>
        <Text style={styles.amount}>${item.amount}</Text>
        <Text style={styles.giftText}>GIFT CARD</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gift Cards</Text>
        <View style={styles.spacer} />
      </View>

      <Text style={styles.sub}>Send instant travel vibes to friends.</Text>

      <FlatList
        data={CARDS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  sub: {
    color: COLORS.text.secondary,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  list: {
    padding: 20,
  },
  cardContainer: {
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    height: 180,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardLogo: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '900',
    letterSpacing: 1,
  },
  amount: {
    color: COLORS.white,
    fontSize: 48,
    fontWeight: 'bold',
  },
  giftText: {
    color: COLORS.white,
    alignSelf: 'flex-end',
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  spacer: {
    width: 24,
  },
});
