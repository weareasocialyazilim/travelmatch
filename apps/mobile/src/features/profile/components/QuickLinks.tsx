import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Profile dark theme colors
const QUICKLINK_COLORS = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
  },
};

interface QuickLink {
  icon: string;
  color: string;
  label: string;
  count: number;
  onPress: () => void;
}

interface QuickLinksProps {
  links: QuickLink[];
}

const QuickLinks: React.FC<QuickLinksProps> = memo(
  ({ links }) => {
    return (
      <View style={styles.quickLinks}>
        {links.map((link, index) => (
          <React.Fragment key={link.label}>
            <TouchableOpacity
              style={styles.quickLink}
              onPress={link.onPress}
              accessibilityLabel={`${link.label}: ${link.count}. Görmek için dokun`}
              accessibilityRole="button"
            >
              <View style={styles.quickLinkLeft}>
                <MaterialCommunityIcons
                  name={
                    link.icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={20}
                  color={link.color}
                />
                <Text style={styles.quickLinkText}>{link.label}</Text>
              </View>
              <View style={styles.quickLinkRight}>
                <Text style={styles.quickLinkCount}>{link.count}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color={QUICKLINK_COLORS.text.secondary}
                />
              </View>
            </TouchableOpacity>
            {index < links.length - 1 && (
              <View style={styles.quickLinkDivider} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  },
  (prevProps, nextProps) =>
    JSON.stringify(prevProps.links.map((l) => l.count)) ===
    JSON.stringify(nextProps.links.map((l) => l.count)),
);

QuickLinks.displayName = 'QuickLinks';

const styles = StyleSheet.create({
  quickLinks: {
    backgroundColor: QUICKLINK_COLORS.background,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: QUICKLINK_COLORS.border,
    overflow: 'hidden',
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  quickLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: QUICKLINK_COLORS.text.primary,
  },
  quickLinkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickLinkCount: {
    fontSize: 14,
    fontWeight: '600',
    color: QUICKLINK_COLORS.text.secondary,
  },
  quickLinkDivider: {
    height: 1,
    backgroundColor: QUICKLINK_COLORS.divider,
    marginLeft: 48,
  },
});

export default QuickLinks;
