import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { SuccessType } from '../types/success.types';

type SuccessConfig = {
  title: string;
  subtitle: string;
  buttonText: string;
  nextScreen?: keyof RootStackParamList | 'BACK';
};

const DEFAULT_SUCCESS: SuccessConfig = {
  title: 'Tamamlandı!',
  subtitle: 'İşlemin başarıyla tamamlandı.',
  buttonText: 'Devam Et',
  nextScreen: 'Discover',
};

const SUCCESS_CONFIG: Record<SuccessType, SuccessConfig> = {
  card_added: {
    title: 'Kart Eklendi',
    subtitle: 'Ödeme yöntemini dilediğin zaman kullanabilirsin.',
    buttonText: 'Tamam',
    nextScreen: 'BACK',
  },
  card_removed: {
    title: 'Kart Kaldırıldı',
    subtitle: 'Ödeme yöntemin listenden kaldırıldı.',
    buttonText: 'Tamam',
    nextScreen: 'BACK',
  },
  cache_cleared: {
    title: 'Temizlendi',
    subtitle: 'Veriler güncellendi.',
    buttonText: 'Tamam',
    nextScreen: 'BACK',
  },
  gift_sent: {
    title: 'Hediye Gönderildi',
    subtitle: 'Ödeme emanet hesabında. Kanıt onaylanınca alıcıya aktarılır.',
    buttonText: 'Keşfet',
    nextScreen: 'Discover',
  },
  withdraw: {
    title: 'Çekim Alındı',
    subtitle: 'Talebin işleme alındı. Onaylanınca hesabına geçer.',
    buttonText: 'Cüzdana Dön',
    nextScreen: 'Wallet',
  },
  withdrawal: {
    title: 'Çekim Başarılı',
    subtitle: 'Ödeme hesabına aktarıldı.',
    buttonText: 'Cüzdana Dön',
    nextScreen: 'Wallet',
  },
  payment: {
    title: 'LVND Yüklendi',
    subtitle:
      'Bakiyen anında güncellendi. Dilediğin anda jest gönderebilirsin.',
    buttonText: 'Keşfet',
    nextScreen: 'Discover',
  },
  review: {
    title: 'Teşekkürler',
    subtitle: 'Geri bildirimin bize ulaştı.',
    buttonText: 'Devam Et',
    nextScreen: 'Discover',
  },
  dispute: {
    title: 'Talebin Alındı',
    subtitle: 'İnceleme tamamlanınca bilgilendirileceksin.',
    buttonText: 'Tamam',
    nextScreen: 'Discover',
  },
  proof_uploaded: {
    title: 'Kanıtın Gönderildi',
    subtitle: 'Onaylandığında ödeme hesabına geçer.',
    buttonText: 'Tamam',
    nextScreen: 'Discover',
  },
  proof_approved: {
    title: 'Kanıt Onaylandı',
    subtitle: 'Ödeme hesabına geçti.',
    buttonText: 'Cüzdana Git',
    nextScreen: 'Wallet',
  },
  profile_complete: {
    title: 'Profil Tamamlandı',
    subtitle: 'Artık anlarını paylaşmaya hazırsın.',
    buttonText: 'Keşfet',
    nextScreen: 'Discover',
  },
  offer: {
    title: 'Teklif Gönderildi',
    subtitle: 'Yanıt geldiğinde bildirim alacaksın.',
    buttonText: 'Keşfet',
    nextScreen: 'Discover',
  },
  generic: DEFAULT_SUCCESS,
};

export const SuccessScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Success'>>();
  const params = route.params ?? { type: 'generic' };
  const type = (params.type ?? 'generic') as SuccessType;
  const config = SUCCESS_CONFIG[type] ?? DEFAULT_SUCCESS;
  const title = params.title ?? config.title;
  const subtitle = params.subtitle ?? config.subtitle;
  const buttonText =
    (params as { buttonText?: string }).buttonText ?? config.buttonText;
  const nextScreen =
    (params as { nextScreen?: string }).nextScreen ??
    config.nextScreen ??
    'Discover';

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (nextScreen === 'BACK') navigation.goBack();
    else
      navigation.reset({
        index: 0,
        routes: [{ name: nextScreen as keyof RootStackParamList }],
      });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <MaterialCommunityIcons name="check" size={60} color="black" />
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{subtitle}</Text>

      <TouchableOpacity style={styles.btn} onPress={handlePress}>
        <Text style={styles.btnText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 60,
  },
  btn: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  btnText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});

export default SuccessScreen;
