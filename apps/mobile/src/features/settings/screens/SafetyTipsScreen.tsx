import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SafetyTip {
  icon: IconName;
  title: string;
  desc: string;
}

const TIPS: SafetyTip[] = [
  { icon: 'map-marker-star', title: 'Meet in Public', desc: 'Always meet your match in a busy, public place like a cafe or restaurant. Never at a private residence for the first time.' },
  { icon: 'wallet-off', title: 'Keep Payments In-App', desc: 'Never send cash or wire transfers. TravelMatch protects your payments only if they happen within the app.' },
  { icon: 'share-variant', title: 'Share Your Plans', desc: 'Tell a friend or family member where you are going and who you are meeting.' },
  { icon: 'alert-decagram', title: 'Trust Your Gut', desc: 'If something feels off, leave. Your safety is more important than politeness.' },
];

type SafetyTipsScreenProps = StackScreenProps<RootStackParamList, 'SafetyTips'>;

export const SafetyTipsScreen: React.FC<SafetyTipsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Travel Safe</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hero}>Your safety is our #1 priority.</Text>

        {TIPS.map((tip, index) => (
          <View key={index} style={styles.card}>
             <View style={styles.iconBox}>
                <MaterialCommunityIcons name={tip.icon} size={32} color={COLORS.brand.primary} />
             </View>
             <View style={styles.cardContent}>
               <Text style={styles.cardTitle}>{tip.title}</Text>
               <Text style={styles.cardDesc}>{tip.desc}</Text>
             </View>
          </View>
        ))}

        <TouchableOpacity style={styles.sosBtn}>
           <Text style={styles.sosText}>Emergency Contacts</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  hero: { fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 30, lineHeight: 34 },
  card: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, marginBottom: 16 },
  iconBox: { marginRight: 16, marginTop: 4 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  cardDesc: { color: COLORS.text.secondary, lineHeight: 22 },
  sosBtn: { marginTop: 20, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#FF4444', alignItems: 'center' },
  sosText: { color: '#FF4444', fontWeight: 'bold', fontSize: 16 },
});

export default SafetyTipsScreen;
