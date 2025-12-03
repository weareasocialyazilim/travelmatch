import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { logger } from '@/utils/logger';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { RouteProp } from '@react-navigation/native';

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
  navigation,
  route,
}) => {
  const { momentId } = route.params || {};

  // Dummy data - replace with actual data fetching
  const [title, setTitle] = useState('Eiffel Tower Visit');
  const [description, setDescription] = useState(
    'Amazing experience visiting the iconic Eiffel Tower. The view from the top was breathtaking!',
  );
  const [price, setPrice] = useState('25');

  const handleSave = () => {
    // TODO: Implement save logic
    logger.info('Saving moment', { momentId, title, description, price });
    navigation.goBack();
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
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter moment title"
            placeholderTextColor={COLORS.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about this moment"
            placeholderTextColor={COLORS.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Price Input */}
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
              style={[styles.input, styles.priceInput]}
              placeholder="0.00"
              placeholderTextColor={COLORS.textSecondary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save changes</Text>
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
