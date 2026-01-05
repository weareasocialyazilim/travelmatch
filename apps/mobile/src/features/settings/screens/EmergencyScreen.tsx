import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type EmergencyScreenProps = StackScreenProps<RootStackParamList, 'Emergency'>;

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  navigation,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    showAlert({
      title: 'SOS Triggered',
      message: 'Your location has been sent to emergency contacts.',
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="close" size={28} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>EMERGENCY SOS</Text>
      <Text style={styles.desc}>
        Hold the button for 3 seconds to share your live location with trusted
        contacts and support.
      </Text>

      <Animated.View style={[styles.btnContainer, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handlePressOut}
          delayLongPress={3000}
        >
          <LinearGradient colors={['#FF4444', '#cc0000']} style={styles.sosBtn}>
            <MaterialCommunityIcons
              name="alert-octagram"
              size={64}
              color="white"
            />
            <Text style={styles.sosText}>HOLD FOR HELP</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.contactsList}>
        <Text style={styles.label}>Notifying:</Text>
        <View style={styles.contactChip}>
          <Text style={styles.contactName}>Mom</Text>
        </View>
        <View style={styles.contactChip}>
          <Text style={styles.contactName}>TravelMatch Support</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0505',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF4444',
    marginBottom: 16,
    letterSpacing: 2,
  },
  desc: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 60,
  },
  btnContainer: {
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  sosBtn: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sosText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  contactsList: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  label: {
    color: '#888',
    marginRight: 10,
  },
  contactChip: {
    backgroundColor: 'rgba(255,68,68,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.4)',
  },
  contactName: {
    color: '#FF8888',
    fontWeight: '600',
  },
});

export default EmergencyScreen;
