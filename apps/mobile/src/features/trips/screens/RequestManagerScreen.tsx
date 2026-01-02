import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';
import { withErrorBoundary } from '@/components/withErrorBoundary';


interface RequestUser {
  name: string;
  avatar: string;
  score: number;
}

interface Request {
  id: string;
  user: RequestUser;
  offer: string;
  message: string;
  type: 'gift' | 'split';
}

const REQUESTS: Request[] = [
  {
    id: '1',
    user: {
      name: 'Marc B.',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
      score: 98,
    },
    offer: 'Full Gift ($150)',
    message: 'Hey! I love Hotel Costes. Let me treat you.',
    type: 'gift',
  },
  {
    id: '2',
    user: {
      name: 'Elena K.',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
      score: 85,
    },
    offer: 'Split Bill',
    message: 'Would love to join! Can we split?',
    type: 'split',
  },
];

const RequestManagerScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [requests, setRequests] = useState<Request[]>(REQUESTS);

  const handleAction = (id: string, action: 'accept' | 'reject') => {
    // API Call here
    const request = requests.find((r) => r.id === id);
    setRequests((prev) => prev.filter((req) => req.id !== id));
    if (action === 'accept' && request) {
      // Navigate to chat with a complete user object
      navigation.navigate('Chat', {
        otherUser: {
          id: id,
          name: request.user.name,
          avatar: request.user.avatar,
          role: 'Traveler' as const,
          kyc: 'Verified' as const,
          location: { lat: 0, lng: 0 },
        },
        conversationId: `new_chat_${id}`,
      });
    }
  };

  const renderRequest = ({
    item,
    index,
  }: {
    item: Request;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100)}
      layout={Layout.springify()}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userSection}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{item.user.name}</Text>
            <View style={styles.scoreBadge}>
              <MaterialCommunityIcons
                name="shield-check"
                size={12}
                color={COLORS.black}
              />
              <Text style={styles.scoreText}>{item.user.score}% Trust</Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.typeBadge,
            item.type === 'gift' ? styles.badgeGift : styles.badgeSplit,
          ]}
        >
          <Text style={styles.typeText}>{item.offer}</Text>
        </View>
      </View>

      <Text style={styles.message}>"{item.message}"</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleAction(item.id, 'reject')}
        >
          <Ionicons name="close" size={24} color={COLORS.error} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => handleAction(item.id, 'accept')}
        >
          <Text style={styles.acceptText}>Accept & Chat</Text>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={COLORS.black}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Requests</Text>
        <Text style={styles.subtitle}>{requests.length} Pending</Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No requests yet. Stay tuned!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.backgroundDark,
  },
  backBtn: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    color: COLORS.brand.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userSection: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  scoreBadge: {
    flexDirection: 'row',
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  scoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
  },
  badgeGift: {
    backgroundColor: 'rgba(204, 255, 0, 0.2)',
  },
  badgeSplit: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  message: {
    color: COLORS.gray[400],
    fontStyle: 'italic',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.black,
  },
  empty: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: COLORS.gray[500],
    fontSize: 16,
  },
});

export default withErrorBoundary(RequestManagerScreen, {
  fallbackType: 'generic',
  displayName: 'RequestManagerScreen',
});
