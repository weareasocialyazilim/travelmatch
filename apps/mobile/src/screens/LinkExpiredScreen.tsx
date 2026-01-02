import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const LinkExpiredScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="link-variant-off" size={80} color="#FF4444" style={{ marginBottom: 20 }} />

      <Text style={styles.title}>Link Expired</Text>
      <Text style={styles.desc}>
        This link is no longer valid or has already been used.
        Don't worry, you can request a new one.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.btnText}>Request New Link</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.secondaryBtnText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary, alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  desc: { color: COLORS.text.secondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 40 },
  btn: { width: '100%', backgroundColor: 'white', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { padding: 12 },
  secondaryBtnText: { color: COLORS.text.secondary, fontWeight: '600' },
});
