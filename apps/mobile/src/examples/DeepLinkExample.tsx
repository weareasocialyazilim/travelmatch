/**
 * Example: Deep Link Navigation Handler
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { deepLinkTracker, DeepLinkType, ConversionGoal } from '../services/deepLinkTracker';
import { logger } from '../utils/logger';

export function AppNavigator() {
  const navigationRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Initialize deep link tracking
    deepLinkTracker.initialize();

    // Subscribe to deep link events
    const unsubscribe = deepLinkTracker.subscribe((event) => {
      logger.info('[Navigation] Deep link received:', event.type);

      // Navigate based on deep link type
      switch (event.type) {
        case DeepLinkType.PROFILE:
          const profileId = event.params.id || event.url.split('/').pop();
          navigationRef.current?.navigate('Profile', { userId: profileId });
          deepLinkTracker.trackNavigation('Profile');
          break;

        case DeepLinkType.MOMENT:
          const momentId = event.params.id || event.url.split('/').pop();
          navigationRef.current?.navigate('MomentDetail', { momentId });
          deepLinkTracker.trackNavigation('MomentDetail');
          break;

        case DeepLinkType.MATCH:
          navigationRef.current?.navigate('Matches');
          deepLinkTracker.trackNavigation('Matches');
          break;

        case DeepLinkType.MESSAGE:
          const matchId = event.params.matchId;
          navigationRef.current?.navigate('Chat', { matchId });
          deepLinkTracker.trackNavigation('Chat');
          break;

        default:
          navigationRef.current?.navigate('Home');
          deepLinkTracker.trackNavigation('Home');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        // Track screen changes
        const currentRoute = navigationRef.current?.getCurrentRoute();
        if (currentRoute) {
          deepLinkTracker.trackNavigation(currentRoute.name);
        }
      }}
    >
      {/* Your navigation structure */}
    </NavigationContainer>
  );
}

// Example: Track conversion when user follows someone
export function FollowButton({ userId }: { userId: string }) {
  const handleFollow = async () => {
    await userService.followUser(userId);
    
    // Track conversion
    deepLinkTracker.trackConversion(ConversionGoal.FOLLOW_USER, {
      target_user_id: userId,
    });
  };

  return <Button title="Follow" onPress={handleFollow} />;
}

// Example: Generate shareable deep link
export function ShareProfileButton({ userId, userName }: { userId: string; userName: string }) {
  const handleShare = () => {
    const deepLink = DeepLinkTracker.generateDeepLink(
      DeepLinkType.PROFILE,
      userId,
      {
        source: AttributionSource.IN_APP,
        campaign: 'profile_share',
        content: userName,
      }
    );

    // Share link (using React Native Share API)
    Share.share({
      message: `Check out ${userName}'s profile on TravelMatch: ${deepLink}`,
      url: deepLink,
    });
  };

  return <Button title="Share Profile" onPress={handleShare} />;
}
