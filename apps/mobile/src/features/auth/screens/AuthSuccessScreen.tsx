/**
 * Auth Success Screen (Kayıt Sonrası Başarı Ekranı)
 *
 * DEPRECATED: PATCH-005
 * This screen uses the SuccessCeremony component which is now
 * available in the unified SuccessScreen with type='registration'.
 *
 * @deprecated Use SuccessScreen with { type: 'registration' } instead
 * @see SuccessScreen
 *
 * Kapanış döngüsü - Registration completion ceremony.
 * Uses the universal SuccessCeremony component to reward users
 * with a silky, premium celebration experience.
 *
 * Flow: Register → Verify → AuthSuccess → MainTabs
 */
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { SuccessCeremony } from '../../../components/ui/SuccessCeremony';
import type { RootStackParamList } from '../../../navigation/routeParams';

export const AuthSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleStartExploring = () => {
    // Navigate to MainTabs and reset the navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SuccessCeremony
      title="Kapılar Açıldı!"
      message="Hesabın başarıyla oluşturuldu. Artık Lovendo dünyasının seçkin bir üyesisin."
      buttonText="Keşfetmeye Başla"
      onPress={handleStartExploring}
      icon="door-open"
      testID="auth-success-screen"
    />
  );
};

export default AuthSuccessScreen;
