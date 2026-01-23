import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';
import { showLoginPrompt } from '@/stores/modalStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { useFeatureFlag } from '@/utils/featureFlags';

export const useKycAuthGuard = () => {
  const { isGuest } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { warning } = useToast();
  const kycEnabled = useFeatureFlag('kycEnabled');

  useEffect(() => {
    if (!kycEnabled) {
      warning(
        'KYC şu anda geçici olarak kapalı. Lütfen daha sonra tekrar deneyin.',
        4000,
      );

      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      navigation.navigate('Discover');
      return;
    }

    if (!isGuest) return;

    showLoginPrompt({ action: 'default' });

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Discover');
  }, [isGuest, kycEnabled, navigation, warning]);
};
