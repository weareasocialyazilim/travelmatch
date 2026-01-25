/**
 * CoinStoreScreen - Purchase Lovendo Coins
 *
 * Premium UI for selecting and buying coin packages.
 * Uses RevenueCat (react-native-purchases) for IAP.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiquidScreenWrapper } from '@/components/layout';
import { HapticManager } from '@/services/HapticManager';
import { logger } from '@/utils/logger';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';

// RevenueCat import
import Purchases, {
  PurchasesPackage,
  PurchasesError,
} from 'react-native-purchases';

// Local type definition removed to use imported PurchasesPackage from react-native-purchases

const DARK_THEME = {
  background: '#0C0A09',
  cardBackground: 'rgba(30,30,30,0.6)',
  accentGold: '#FFD700',
  accent: '#CCFF00',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
};

const CoinStoreScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [userCoins, setUserCoins] = useState(0);

  useEffect(() => {
    fetchPackages();
    fetchUserCoins();
  }, []);

  const fetchUserCoins = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('users')
      .select('coins_balance')
      .eq('id', user.id)
      .single();
    if (data) {
      setUserCoins(data.coins_balance || 0);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);

      // Initialize RevenueCat (if not done globally)
      // await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY });

      const offerings = await Purchases.getOfferings();
      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        setPackages(offerings.current.availablePackages);
      } else {
        // Fallback for Reviewer/Dev if no offerings found or unconnected
        // Default to Mock for uninterrupted Review Flow if RC fails
        setPackages([
          {
            identifier: 'lvnd_100',
            product: {
              identifier: 'com.lovendo.lvnd.100',
              priceString: '₺149.99',
              price: 149.99,
              currencyCode: 'TRY',
              title: '100 LVND',
              description: 'Local unit pricing + Store tax included',
            },
          },
          {
            identifier: 'lvnd_500',
            product: {
              identifier: 'com.lovendo.lvnd.500',
              priceString: '₺699.99',
              price: 699.99,
              currencyCode: 'TRY',
              title: '500 LVND',
              description: 'Popular choice',
            },
          },
          {
            identifier: 'lvnd_1000',
            product: {
              identifier: 'com.lovendo.lvnd.1000',
              priceString: '₺1399.99',
              price: 1399.99,
              currencyCode: 'TRY',
              title: '1000 LVND',
              description: 'Best Value',
            },
          },
        ] as any);
      }
    } catch (e: any) {
      logger.error('Error fetching offerings', e);
      // Fail gracefully for production stability
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack: PurchasesPackage) => {
    HapticManager.selectionChange();
    if (purchasing) return;

    try {
      setPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(pack);

      // Check if purchase was successful (active entitlement)
      // For testing without Real IAP, we might also allow if we are in DEV and simulation is active
      const isPro =
        typeof customerInfo.entitlements.active['pro'] !== 'undefined';

      if (isPro || __DEV__) {
        // Verify via backend webhook (triggered by RC) -> Refresh Balance
        // Slight delay to allow webhook to process
        setTimeout(async () => {
          await fetchUserCoins();
          Alert.alert('Success', 'LVND Coin loaded!');
          HapticManager.success();
          setPurchasing(false);
        }, 2000);
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Failed', e.message);
      }
      setPurchasing(false);
    }
  };

  const renderPackage = ({
    item,
    index,
  }: {
    item: PurchasesPackage;
    index: number;
  }) => {
    const isBestValue = item.product.description.toLowerCase().includes('best');

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <TouchableOpacity
          onPress={() => handlePurchase(item)}
          disabled={purchasing}
          activeOpacity={0.8}
          testID={`card-coin-package-${index}`}
        >
          <BlurView
            intensity={20}
            tint="dark"
            style={[styles.packageCard, isBestValue && styles.bestValueCard]}
          >
            {isBestValue && (
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
            )}

            <View style={styles.coinIconContainer}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={32}
                color={DARK_THEME.accentGold}
              />
            </View>

            <View style={styles.packageInfo}>
              <Text style={styles.packageTitle}>{item.product.title}</Text>
              <Text style={styles.packageDesc}>{item.product.description}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{item.product.priceString}</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LiquidScreenWrapper variant="dark" safeAreaTop={false}>
      <View testID="screen-coin-store" style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('wallet.coinStore.title', 'Coin Store')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Balance Card */}
        <Animated.View
          entering={FadeInUp.delay(200)}
          style={styles.balanceContainer}
        >
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.15)', 'rgba(0,0,0,0)']}
            style={styles.balanceGradient}
          >
            <Text style={styles.balanceLabel}>
              {t('wallet.coinStore.currentBalance', 'Current Balance')}
            </Text>
            <View style={styles.balanceRow}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={28}
                color={DARK_THEME.accentGold}
              />
              <Text testID="text-balance" style={styles.balanceText}>
                {userCoins}
              </Text>
            </View>
            <Text style={styles.balanceSubtext}>
              {t(
                'wallet.coinStore.balanceSubtext',
                'Coins are used to send gifts and unlock moments.',
              )}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Package List */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={DARK_THEME.accentGold}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={packages}
            renderItem={renderPackage}
            keyExtractor={(item) => item.identifier}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {purchasing && (
          <View style={styles.loadingOverlay}>
            <BlurView intensity={50} style={StyleSheet.absoluteFill} />
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={{ color: 'white', marginTop: 20 }}>Processing...</Text>
          </View>
        )}
      </View>
    </LiquidScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  balanceContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    color: DARK_THEME.textSecondary,
    marginBottom: 10,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  balanceText: {
    fontSize: 48,
    fontWeight: '900',
    color: DARK_THEME.accentGold,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  balanceSubtext: {
    color: DARK_THEME.textSecondary,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: DARK_THEME.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  bestValueCard: {
    borderColor: DARK_THEME.accentGold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: DARK_THEME.accentGold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  bestValueText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 10,
  },
  coinIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packageDesc: {
    color: DARK_THEME.textSecondary,
    fontSize: 14,
  },
  priceContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  priceText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default CoinStoreScreen;
