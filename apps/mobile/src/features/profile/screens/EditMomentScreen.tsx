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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';

export const EditMomentScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  // Mock Data (Normalde route.params ile gelir)
  const [title, setTitle] = useState('Dinner at Hotel Costes');
  const [price, setPrice] = useState('150');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600');

  const handleSave = () => {
    Alert.alert('Changes Saved', 'Your moment has been updated successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: image }} style={styles.bgImage} blurRadius={10}>
        <View style={styles.overlay} />

        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Moment</Text>
          <TouchableOpacity onPress={handleSave} style={styles.iconBtn}>
            <Ionicons name="checkmark" size={24} color={COLORS.brand.primary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.imagePreviewContainer}>
            <ImageBackground source={{ uri: image }} style={styles.imagePreview} imageStyle={{ borderRadius: 20 }}>
              <TouchableOpacity style={styles.changePhotoBtn}>
                <MaterialCommunityIcons name="camera-flip" size={24} color="white" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </ImageBackground>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>TITLE</Text>
              <TextInput
                style={styles.inputTitle}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PRICE ($)</Text>
              <TextInput
                style={styles.inputPrice}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>
                Major changes (like title or image) will require re-approval from our team.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Update Moment</Text>
          </TouchableOpacity>

        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },

  imagePreviewContainer: { alignItems: 'center', marginBottom: 30 },
  imagePreview: { width: '100%', height: 250, justifyContent: 'center', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  changePhotoBtn: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8 },
  changePhotoText: { color: 'white', fontWeight: '600' },

  form: { gap: 24 },
  inputGroup: { gap: 8 },
  label: { color: COLORS.brand.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  inputTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 8 },
  inputPrice: { fontSize: 32, fontWeight: '900', color: 'white', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 8 },

  infoBox: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, alignItems: 'center' },
  infoText: { color: COLORS.text.secondary, fontSize: 12, flex: 1, lineHeight: 18 },

  saveBtn: { backgroundColor: COLORS.brand.primary, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  saveBtnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
