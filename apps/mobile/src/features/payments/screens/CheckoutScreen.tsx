import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';

type CheckoutRouteProp = RouteProp<RootStackParamList, 'Checkout'>;
type CheckoutNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

export const CheckoutScreen = () => {
  const navigation = useNavigation<CheckoutNavigationProp>();
  const route = useRoute<CheckoutRouteProp>();

  // Get moment info from route params with defaults
  const {
    title = 'Dinner at Hotel Costes',
    price = 150,
    fee = 5,
  } = route.params || {};

  const total = price + fee;

  const handlePay = () => {
    navigation.navigate('Messages');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.handle} />

        <Text style={styles.title}>Confirm Gift</Text>
        <Text style={styles.subtitle}>You're about to make someone's day!</Text>

        {/* Receipt */}
        <View style={styles.receipt}>
          <View style={styles.row}>
            <Text style={styles.label}>{title}</Text>
            <Text style={styles.value}>${price}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Platform Fee</Text>
            <Text style={styles.value}>${fee}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <TouchableOpacity style={styles.paymentMethod}>
          <View style={styles.methodLeft}>
            <MaterialCommunityIcons name="apple" size={24} color="white" />
            <Text style={styles.methodText}>Apple Pay</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[500]} />
        </TouchableOpacity>

        {/* Pay Button */}
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <LinearGradient
            colors={[COLORS.brand.primary, '#A2FF00']}
            style={styles.gradient}
          >
            <MaterialCommunityIcons
              name="face-recognition"
              size={24}
              color="black"
            />
            <Text style={styles.payText}>Double Click to Pay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.overlay.dark,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray[500],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 24,
  },
  receipt: {
    backgroundColor: COLORS.whiteTransparentDarkest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: COLORS.text.secondary,
  },
  value: {
    color: COLORS.white,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.hairlineLight,
    marginVertical: 8,
  },
  totalLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    color: COLORS.brand.primary,
    fontWeight: '900',
    fontSize: 18,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.hairlineLight,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  payText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
});

export default CheckoutScreen;
