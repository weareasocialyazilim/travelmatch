import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SafetyTip {
  icon: IconName;
  title: string;
  desc: string;
}

const TIPS: SafetyTip[] = [
  {
    icon: 'gift-outline',
    title: 'Safe Gifting',
    desc: 'All gift transactions are secured through our escrow system. Funds are only released after proof of experience is verified.',
  },
  {
    icon: 'cash-lock',
    title: 'Keep Payments In-App',
    desc: 'Never send money outside the app. Your payments are protected by PayTR escrow only when made through Moment.',
  },
  {
    icon: 'camera-enhance',
    title: 'Share Your Moments',
    desc: 'Document your experiences with photos. This protects both gifters and receivers in the escrow process.',
  },
  {
    icon: 'shield-check',
    title: 'Verified Profiles',
    desc: 'Look for verified badges on profiles. Complete your own verification to build trust in the community.',
  },
];

type SafetyTipsScreenProps = StackScreenProps<RootStackParamList, 'SafetyTips'>;

export const SafetyTipsScreen: React.FC<SafetyTipsScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safe Gifting</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hero}>Your gift is protected with escrow.</Text>

        {TIPS.map((tip, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={tip.icon}
                size={32}
                color={COLORS.brand.primary}
              />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerSpacer: { width: 28 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  hero: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 30,
    lineHeight: 34,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  iconBox: { marginRight: 16, marginTop: 4 },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  cardDesc: { color: COLORS.text.secondary, lineHeight: 22 },
  sosBtn: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF4444',
    alignItems: 'center',
  },
  sosText: { color: '#FF4444', fontWeight: 'bold', fontSize: 16 },
});

export default SafetyTipsScreen;
