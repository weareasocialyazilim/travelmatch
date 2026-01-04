import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

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
              accessibilityLabel={`${link.label}: ${link.count}. Tap to view`}
              accessibilityRole="button"
            >
              <View style={styles.quickLinkLeft}>
                <MaterialCommunityIcons
                  name={link.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={22}
                  color={link.color}
                />
                <Text style={styles.quickLinkText}>{link.label}</Text>
              </View>
              <View style={styles.quickLinkRight}>
                <Text style={styles.quickLinkCount}>{link.count}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.text.secondary}
                />
              </View>
            </TouchableOpacity>
            {index < links.length - 1 && <View style={styles.quickLinkDivider} />}
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
    backgroundColor: COLORS.utility.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  quickLinkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickLinkCount: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  quickLinkDivider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginLeft: 50,
  },
});

export default QuickLinks;
