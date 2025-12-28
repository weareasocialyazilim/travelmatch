import React from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import type { MomentDetailNavigation, ActionLoadingState } from './types';

interface MomentHeaderProps {
  navigation: MomentDetailNavigation;
  isOwner: boolean;
  isSaved: boolean;
  actionLoading: ActionLoadingState;
  momentId: string;
  momentStatus?: string;
  onSave: () => void;
  onDelete: () => void;
  onShare: () => void;
  onEdit: () => void;
  onReport: () => void;
}

export const MomentHeader: React.FC<MomentHeaderProps> = React.memo(
  ({
    navigation,
    isOwner,
    isSaved,
    actionLoading,
    momentStatus,
    onSave,
    onDelete,
    onShare,
    onEdit,
    onReport,
  }) => {
    return (
      <View style={styles.headerOverlay}>
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              {/* Save Button - Guest only */}
              {!isOwner && (
                <TouchableOpacity
                  style={styles.headerIconButton}
                  activeOpacity={0.7}
                  onPress={onSave}
                  disabled={actionLoading === 'save'}
                  accessibilityLabel={isSaved ? 'Unsave' : 'Save'}
                  accessibilityRole="button"
                >
                  {actionLoading === 'save' ? (
                    <ActivityIndicator size="small" color={COLORS.brand.primary} />
                  ) : (
                    <MaterialCommunityIcons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={22}
                      color={isSaved ? COLORS.brand.primary : COLORS.text.primary}
                    />
                  )}
                </TouchableOpacity>
              )}

              {/* Edit Button - Owner only, not completed */}
              {isOwner && momentStatus !== 'completed' && (
                <TouchableOpacity
                  style={styles.headerIconButton}
                  activeOpacity={0.7}
                  onPress={onEdit}
                  accessibilityLabel="Edit moment"
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={22}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              )}

              {/* Delete Button - Owner only */}
              {isOwner && (
                <TouchableOpacity
                  style={styles.headerIconButton}
                  activeOpacity={0.7}
                  onPress={onDelete}
                  disabled={actionLoading === 'delete'}
                  accessibilityLabel="Delete moment"
                  accessibilityRole="button"
                >
                  {actionLoading === 'delete' ? (
                    <ActivityIndicator size="small" color={COLORS.feedback.error} />
                  ) : (
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={22}
                      color={COLORS.feedback.error}
                    />
                  )}
                </TouchableOpacity>
              )}

              {/* Share Button */}
              <TouchableOpacity
                style={styles.headerIconButton}
                activeOpacity={0.7}
                onPress={onShare}
                accessibilityLabel="Share moment"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="share-variant-outline"
                  size={22}
                  color={COLORS.text.primary}
                />
              </TouchableOpacity>

              {/* Report Button - Guest only */}
              {!isOwner && (
                <TouchableOpacity
                  style={styles.headerIconButton}
                  activeOpacity={0.7}
                  onPress={onReport}
                  accessibilityLabel="Report moment"
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name="flag-outline"
                    size={22}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  },
);

MomentHeader.displayName = 'MomentHeader';

const styles = StyleSheet.create({
  headerOverlay: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentLight,
    borderColor: COLORS.whiteTransparentLight,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentLight,
    borderColor: COLORS.whiteTransparentLight,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
