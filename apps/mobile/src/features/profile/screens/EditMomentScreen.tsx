import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import { COLORS } from '../constants/colors';
import { editMomentSchema, type EditMomentInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useToast } from '@/context/ToastContext';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type EditMomentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EditMoment'
>;
type EditMomentScreenRouteProp = RouteProp<RootStackParamList, 'EditMoment'>;

interface EditMomentScreenProps {
  navigation: EditMomentScreenNavigationProp;
  route: EditMomentScreenRouteProp;
}

export const EditMomentScreen: React.FC<EditMomentScreenProps> = ({
    const { showToast } = useToast();
navigation,
  route,
}) => {
  const { momentId } = route.params || {};

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState, setValue } = useForm<EditMomentInput>({
    resolver: zodResolver(editMomentSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      price: 0,
    },
  });

  useEffect(() => {
    const fetchMoment = async () => {
      if (!momentId) return;
      try {
        const { data, error } = await supabase
          .from('moments')
          .select('title, description, price')
          .eq('id', momentId)
          .single();

        if (error) throw error;
        if (data) {
          setValue('title', data.title);
          setValue('description', data.description || '');
          setValue('price', data.price || 0);
        }
      } catch (error) {
        logger.error('Error fetching moment', error as Error);
        showToast('Failed to load moment details', 'error');
      }
    };
    fetchMoment();
  }, [momentId, setValue]);

  const handleSave = async (data: EditMomentInput) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('moments')
        .update({
          title: data.title,
          description: data.description,
          price: data.price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', momentId);

      if (error) throw error;

      logger.info('Moment updated', { momentId });
      navigation.goBack();
    } catch (error) {
      logger.error('Error updating moment', error as Error);
      showToast('Failed to update moment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'close' as IconName}
            size={28}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Moment</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter moment title"
                placeholderTextColor={COLORS.textSecondary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
              {error && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}
            </View>
          )}
        />

        {/* Description Input */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, error && styles.inputError]}
                placeholder="Tell us about this moment"
                placeholderTextColor={COLORS.textSecondary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              {error && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}
            </View>
          )}
        />

        {/* Price Input */}
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Price</Text>
              <View style={styles.priceInputWrapper}>
                <MaterialCommunityIcons
                  name={'currency-usd' as IconName}
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.priceIcon}
                />
                <TextInput
                  style={[styles.input, styles.priceInput, error && styles.inputError]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value.toString()}
                  onChangeText={(text) => {
                    const num = parseFloat(text);
                    onChange(isNaN(num) ? 0 : num);
                  }}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                />
              </View>
              {error && (
                <Text style={styles.errorText}>{error.message}</Text>
              )}
            </View>
          )}
        />
      </ScrollView>

      {/* Sticky Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (loading || !canSubmitForm({ formState } as any)) && styles.saveButtonDisabled,
          ]}
          onPress={handleSubmit(handleSave)}
          disabled={loading || !canSubmitForm({ formState } as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    minWidth: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    paddingBottom: 16,
  },
  priceInputWrapper: {
    position: 'relative',
  },
  priceIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  priceInput: {
    paddingLeft: 44,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
