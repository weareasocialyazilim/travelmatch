import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface MomentCardProps {
  title: string;
  description: string;
  price: number;
  currency?: string;
  imageUrl: string;
  hostName: string;
  hostAvatar: string;
  rating?: number;
  saves?: number;
  onPress?: () => void;
  onSave?: () => void;
}

const MomentCard = ({
  title,
  description,
  price,
  currency = 'USD',
  imageUrl,
  hostName,
  hostAvatar,
  rating = 0,
  saves = 0,
  onPress,
  onSave,
}: MomentCardProps) => {
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveIcon}>{isSaved ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.host}>
            <Image source={{ uri: hostAvatar }} style={styles.avatar} />
            <Text style={styles.hostName}>{hostName}</Text>
          </View>

          <View style={styles.stats}>
            {rating > 0 && (
              <View style={styles.stat}>
                <Text style={styles.statText}>⭐ {rating.toFixed(1)}</Text>
              </View>
            )}
            {saves > 0 && (
              <View style={styles.stat}>
                <Text style={styles.statText}>❤️ {saves}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {currency === 'USD' ? '$' : '₺'}
            {price}
          </Text>
          <Text style={styles.perGuest}>per guest</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveIcon: {
    fontSize: 20,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  host: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  hostName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  perGuest: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
});

const meta: Meta<typeof MomentCard> = {
  title: 'Components/MomentCard',
  component: MomentCard,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5', paddingVertical: 20 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof MomentCard>;

export const Default: Story = {
  args: {
    title: 'Sunset Yacht Experience',
    description: 'Join us for an unforgettable evening sailing along the beautiful Mediterranean coast',
    price: 120,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    hostName: 'Maria Santos',
    hostAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4.8,
    saves: 142,
  },
};

export const TurkishLira: Story = {
  args: {
    title: 'İstanbul Food Tour',
    description: 'Discover authentic Turkish cuisine with a local guide through historic neighborhoods',
    price: 1500,
    currency: 'TRY',
    imageUrl: 'https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=800',
    hostName: 'Ahmet Yılmaz',
    hostAvatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5.0,
    saves: 89,
  },
};

export const NoRating: Story = {
  args: {
    title: 'Mountain Hiking Adventure',
    description: 'Explore breathtaking mountain trails with experienced guides',
    price: 75,
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    hostName: 'John Davis',
    hostAvatar: 'https://i.pravatar.cc/150?img=8',
    saves: 23,
  },
};

export const NewMoment: Story = {
  args: {
    title: 'Cooking Class in Tuscany',
    description: 'Learn to make authentic Italian pasta from scratch in a beautiful countryside villa',
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    hostName: 'Giuseppe Rossi',
    hostAvatar: 'https://i.pravatar.cc/150?img=15',
  },
};

export const HighDemand: Story = {
  args: {
    title: 'Private Northern Lights Tour',
    description: 'Chase the aurora borealis with expert photographers in Iceland',
    price: 250,
    imageUrl: 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=800',
    hostName: 'Erik Magnusson',
    hostAvatar: 'https://i.pravatar.cc/150?img=20',
    rating: 4.9,
    saves: 456,
  },
};
