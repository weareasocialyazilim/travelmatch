import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { COLORS, GRADIENTS } from '@/constants/colors';

const STEPS = [
  { id: 'name', title: 'Adın ne?', placeholder: 'Selin Yılmaz', icon: 'person-outline' as const },
  { id: 'email', title: 'E-postan?', placeholder: 'selin@ornek.com', icon: 'mail-outline' as const },
  { id: 'password', title: 'Bir şifre belirle', placeholder: '••••••••', icon: 'lock-closed-outline' as const, secure: true },
];

type FormData = {
  name: string;
  email: string;
  password: string;
};

export const RegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Registration complete
      try {
        setIsLoading(true);
        const result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        if (result.success) {
          showToast('Hesap oluşturuldu!', 'success');
          navigation.reset({ index: 0, routes: [{ name: 'Discover' }] });
        } else {
          showToast(result.error || 'Kayıt başarısız. Lütfen tekrar deneyin.', 'error');
        }
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : 'Kayıt başarısız. Lütfen tekrar deneyin.',
          'error'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const isCurrentStepValid = () => {
    const step = STEPS[currentStep];
    const value = formData[step.id as keyof FormData];

    if (!value || value.trim() === '') return false;

    if (step.id === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (step.id === 'password') {
      return value.length >= 8;
    }

    return value.length >= 2;
  };

  const activeStepData = STEPS[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1286' }}
        style={styles.bgImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', COLORS.background.primary]}
          style={styles.gradient}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.content, { paddingTop: insets.top }]}
        >

          {/* Header */}
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Progress Dots */}
          <View style={styles.progressContainer}>
            {STEPS.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index <= currentStep && styles.activeDot]}
              />
            ))}
          </View>

          {/* Form Wizard */}
          <Animated.View
            key={activeStepData.id}
            entering={FadeInRight}
            exiting={FadeOutLeft}
            style={styles.formContainer}
          >
            <Text style={styles.stepTitle}>{activeStepData.title}</Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name={activeStepData.icon}
                size={24}
                color={COLORS.brand.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={activeStepData.placeholder}
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry={activeStepData.secure}
                autoFocus
                value={formData[activeStepData.id as keyof FormData]}
                onChangeText={(text) => setFormData(prev => ({ ...prev, [activeStepData.id]: activeStepData.id === 'email' ? text.toLowerCase() : text }))}
                keyboardType={activeStepData.id === 'email' ? 'email-address' : 'default'}
                autoCapitalize={activeStepData.id === 'email' ? 'none' : activeStepData.id === 'name' ? 'words' : 'none'}
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </Animated.View>

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.nextButton, (!isCurrentStepValid() || isLoading) && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isCurrentStepValid() || isLoading}
          >
            <LinearGradient
              colors={isCurrentStepValid() && !isLoading ? GRADIENTS.gift : GRADIENTS.disabled}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Text style={styles.btnText}>
                {isLoading
                  ? 'Yükleniyor...'
                  : currentStep === STEPS.length - 1
                    ? 'Maceraya Başla'
                    : 'Devam Et'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.textPrimary} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeDot: {
    backgroundColor: COLORS.brand.primary,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
  nextButton: {
    marginBottom: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  btnGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
