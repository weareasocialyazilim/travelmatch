/**
 * TrustConstellation Component
 *
 * Kullanıcının güven ağını temsil eden "Takımyıldızı".
 * SVG tabanlı ve neon parlamalı dinamik görselleştirme.
 *
 * Features:
 * - Radial gradient glow on nodes
 * - Dashed connection lines from center
 * - Color-coded nodes for trust levels
 * - Awwwards "WOW" aesthetic
 *
 * Part of TravelMatch "Cinematic Trust Jewelry" Design System.
 */

import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Line,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { COLORS, primitives } from '../../constants/colors';

interface TrustNode {
  x: number;
  y: number;
  r: number;
  color: string;
}

interface TrustConstellationProps {
  /** Size of the constellation (default: 300) */
  size?: number;
  /** Custom nodes (optional - uses default if not provided) */
  nodes?: TrustNode[];
  /** Center node color */
  centerColor?: string;
}

/**
 * TrustConstellation - Awwwards "WOW" Component
 *
 * Visualizes user's social trust network as a constellation.
 * Premium gradient and animation-ready structure.
 */
export const TrustConstellation: React.FC<TrustConstellationProps> = memo(
  ({ size = 300, nodes: customNodes, centerColor }) => {
    // Default constellation nodes
    const defaultNodes: TrustNode[] = useMemo(
      () => [
        { x: 150, y: 150, r: 8, color: centerColor || COLORS.brand.primary }, // Center (You)
        { x: 80, y: 100, r: 5, color: primitives.emerald[500] },
        { x: 220, y: 80, r: 4, color: primitives.amber[400] },
        { x: 250, y: 200, r: 6, color: primitives.purple[500] },
        { x: 100, y: 230, r: 4, color: primitives.magenta[400] },
        { x: 50, y: 180, r: 3, color: COLORS.brand.primary },
      ],
      [centerColor],
    );

    const nodes = customNodes || defaultNodes;
    const centerNode = nodes[0];

    // Scale factor for different sizes
    const scale = size / 300;

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox="0 0 300 300">
          <Defs>
            {/* Radial gradient for node glow */}
            <RadialGradient id="nodeGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop
                offset="0%"
                stopColor={COLORS.brand.primary}
                stopOpacity="0.6"
              />
              <Stop
                offset="100%"
                stopColor={COLORS.brand.primary}
                stopOpacity="0"
              />
            </RadialGradient>

            {/* Secondary glow for outer nodes */}
            <RadialGradient id="nodeGlowSecondary" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop
                offset="0%"
                stopColor={primitives.emerald[500]}
                stopOpacity="0.5"
              />
              <Stop
                offset="100%"
                stopColor={primitives.emerald[500]}
                stopOpacity="0"
              />
            </RadialGradient>
          </Defs>

          {/* Connection Lines - Dashed from center to each node */}
          {nodes.map(
            (node, i) =>
              i > 0 && (
                <Line
                  key={`line-${i}`}
                  x1={centerNode.x}
                  y1={centerNode.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={COLORS.border.subtle}
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                  opacity={0.6}
                />
              ),
          )}

          {/* Nodes with glow effect */}
          {nodes.map((node, i) => (
            <React.Fragment key={`node-${i}`}>
              {/* Glow Effect */}
              <Circle
                cx={node.x}
                cy={node.y}
                r={node.r * 2.5}
                fill={i === 0 ? 'url(#nodeGlow)' : 'url(#nodeGlowSecondary)'}
                opacity={i === 0 ? 0.5 : 0.3}
              />
              {/* Main Node */}
              <Circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={node.color}
                stroke={COLORS.bg.primary}
                strokeWidth="2"
              />
            </React.Fragment>
          ))}
        </Svg>
      </View>
    );
  },
);

TrustConstellation.displayName = 'TrustConstellation';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TrustConstellation;
