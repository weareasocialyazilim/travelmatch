/**
 * Empty State Illustration Component
 * SVG-based illustrations for empty states
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { COLORS } from '@/constants/colors';

export type IllustrationType =
  | 'no_moments'
  | 'no_messages'
  | 'no_notifications'
  | 'no_results'
  | 'no_gifts'
  | 'no_matches';

interface EmptyStateIllustrationProps {
  type: IllustrationType;
  size?: number;
}

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  type,
  size = 200,
}) => {
  const renderIllustration = () => {
    switch (type) {
      case 'no_moments':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.2"
                />
                <Stop
                  offset="100%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.05"
                />
              </LinearGradient>
            </Defs>
            {/* Camera body */}
            <Rect
              x="50"
              y="70"
              width="100"
              height="80"
              rx="8"
              fill="url(#grad1)"
              stroke={COLORS.brand.primary}
              strokeWidth="2"
            />
            {/* Lens */}
            <Circle
              cx="100"
              cy="110"
              r="25"
              fill="none"
              stroke={COLORS.brand.primary}
              strokeWidth="3"
            />
            <Circle cx="100" cy="110" r="15" fill={COLORS.primaryMuted} />
            {/* Flash */}
            <Rect
              x="130"
              y="80"
              width="10"
              height="10"
              rx="2"
              fill={COLORS.brand.primary}
            />
            {/* Viewfinder */}
            <Circle cx="75" cy="85" r="3" fill={COLORS.brand.primary} />
            {/* Sparkles */}
            <Path
              d="M40 50 L42 55 L37 53 Z"
              fill={COLORS.brand.primary}
              opacity="0.4"
            />
            <Path
              d="M160 45 L163 52 L157 49 Z"
              fill={COLORS.brand.primary}
              opacity="0.4"
            />
          </Svg>
        );

      case 'no_messages':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.2"
                />
                <Stop
                  offset="100%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.05"
                />
              </LinearGradient>
            </Defs>
            {/* Chat bubble */}
            <Path
              d="M50 60 Q50 50 60 50 L140 50 Q150 50 150 60 L150 120 Q150 130 140 130 L80 130 L60 145 L60 130 Q50 130 50 120 Z"
              fill="url(#grad2)"
              stroke={COLORS.brand.primary}
              strokeWidth="2"
            />
            {/* Chat lines */}
            <Rect
              x="70"
              y="70"
              width="60"
              height="4"
              rx="2"
              fill={COLORS.brand.primary}
              opacity="0.5"
            />
            <Rect
              x="70"
              y="85"
              width="45"
              height="4"
              rx="2"
              fill={COLORS.brand.primary}
              opacity="0.5"
            />
            <Rect
              x="70"
              y="100"
              width="50"
              height="4"
              rx="2"
              fill={COLORS.brand.primary}
              opacity="0.5"
            />
            {/* Dots */}
            <Circle
              cx="75"
              cy="115"
              r="3"
              fill={COLORS.brand.primary}
              opacity="0.6"
            />
            <Circle
              cx="85"
              cy="115"
              r="3"
              fill={COLORS.brand.primary}
              opacity="0.6"
            />
            <Circle
              cx="95"
              cy="115"
              r="3"
              fill={COLORS.brand.primary}
              opacity="0.6"
            />
          </Svg>
        );

      case 'no_notifications':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.2"
                />
                <Stop
                  offset="100%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.05"
                />
              </LinearGradient>
            </Defs>
            {/* Bell body */}
            <Path
              d="M100 50 Q85 50 85 65 L85 95 Q85 110 70 120 L130 120 Q115 110 115 95 L115 65 Q115 50 100 50"
              fill="url(#grad3)"
              stroke={COLORS.brand.primary}
              strokeWidth="2"
            />
            {/* Bell top */}
            <Rect
              x="95"
              y="45"
              width="10"
              height="8"
              rx="2"
              fill={COLORS.brand.primary}
            />
            {/* Bell bottom */}
            <Path
              d="M90 120 Q90 130 100 130 Q110 130 110 120"
              fill="none"
              stroke={COLORS.brand.primary}
              strokeWidth="2"
            />
            {/* Slash (muted) */}
            <Path
              d="M140 45 L60 155"
              stroke={COLORS.brand.secondary}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'no_results':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.2"
                />
                <Stop
                  offset="100%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.05"
                />
              </LinearGradient>
            </Defs>
            {/* Magnifying glass */}
            <Circle
              cx="85"
              cy="85"
              r="35"
              fill="url(#grad4)"
              stroke={COLORS.brand.primary}
              strokeWidth="3"
            />
            <Path
              d="M110 110 L135 135"
              stroke={COLORS.brand.primary}
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* X mark inside */}
            <Path
              d="M70 70 L100 100 M100 70 L70 100"
              stroke={COLORS.brand.secondary}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'no_gifts':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.2"
                />
                <Stop
                  offset="100%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.05"
                />
              </LinearGradient>
            </Defs>
            {/* Gift box */}
            <Rect
              x="60"
              y="90"
              width="80"
              height="60"
              rx="4"
              fill="url(#grad5)"
              stroke={COLORS.brand.primary}
              strokeWidth="2"
            />
            {/* Ribbon vertical */}
            <Rect
              x="95"
              y="90"
              width="10"
              height="60"
              fill={COLORS.brand.primary}
              opacity="0.5"
            />
            {/* Ribbon horizontal */}
            <Rect
              x="60"
              y="105"
              width="80"
              height="10"
              fill={COLORS.brand.primary}
              opacity="0.5"
            />
            {/* Bow */}
            <Path
              d="M80 75 Q90 65 100 75 Q110 65 120 75"
              fill="none"
              stroke={COLORS.brand.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Circle cx="100" cy="75" r="5" fill={COLORS.brand.primary} />
            {/* Sparkles */}
            <Path d="M50 60 L52 65 L47 63 Z" fill={COLORS.gold} opacity="0.6" />
            <Path
              d="M145 55 L148 62 L142 59 Z"
              fill={COLORS.gold}
              opacity="0.6"
            />
          </Svg>
        );

      case 'no_matches':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <LinearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.2"
                />
                <Stop
                  offset="100%"
                  stopColor={COLORS.brand.primary}
                  stopOpacity="0.05"
                />
              </LinearGradient>
            </Defs>
            {/* People silhouettes */}
            <G opacity="0.6">
              {/* Person 1 */}
              <Circle
                cx="75"
                cy="80"
                r="15"
                fill="url(#grad6)"
                stroke={COLORS.brand.primary}
                strokeWidth="2"
              />
              <Path
                d="M55 120 Q55 95 75 95 Q95 95 95 120"
                fill="url(#grad6)"
                stroke={COLORS.brand.primary}
                strokeWidth="2"
              />
              {/* Person 2 */}
              <Circle
                cx="125"
                cy="80"
                r="15"
                fill="url(#grad6)"
                stroke={COLORS.brand.primary}
                strokeWidth="2"
              />
              <Path
                d="M105 120 Q105 95 125 95 Q145 95 145 120"
                fill="url(#grad6)"
                stroke={COLORS.brand.primary}
                strokeWidth="2"
              />
            </G>
            {/* Broken connection */}
            <Path
              d="M90 100 L95 100"
              stroke={COLORS.brand.secondary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2,2"
            />
            <Path
              d="M105 100 L110 100"
              stroke={COLORS.brand.secondary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2,2"
            />
          </Svg>
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderIllustration()}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
