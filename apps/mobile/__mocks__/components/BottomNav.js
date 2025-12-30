/**
 * Mock for BottomNav component
 * Used in Jest tests to provide a testable version of the navigation component
 * with proper i18n support (English translations as default)
 */
const React = require('react');
const { View, Text, TouchableOpacity, Pressable } = require('react-native');
const { MaterialCommunityIcons } = require('@expo/vector-icons');

// English translations (fallback language)
const translations = {
  'navigation.discover': 'Moments',
  'navigation.requests': 'Gifts',
  'navigation.messages': 'Messages',
  'navigation.profile': 'Profile',
  'navigation.createMoment': 'Create new moment',
  'navigation.discoverTab': 'Moments tab',
  'navigation.requestsTab': 'Gifts tab',
  'navigation.messagesTab': 'Messages tab',
  'navigation.profileTab': 'Profile tab',
};

const t = (key) => translations[key] || key;

const TAB_CONFIGS = [
  {
    name: 'Discover',
    label: t('navigation.discover'),
    accessibilityLabel: t('navigation.discoverTab'),
    icon: 'gift-outline',
    iconActive: 'gift',
  },
  {
    name: 'Requests',
    label: t('navigation.requests'),
    accessibilityLabel: t('navigation.requestsTab'),
    icon: 'heart-outline',
    iconActive: 'heart',
  },
  {
    name: 'Messages',
    label: t('navigation.messages'),
    accessibilityLabel: t('navigation.messagesTab'),
    icon: 'chat-outline',
    iconActive: 'chat',
  },
  {
    name: 'Profile',
    label: t('navigation.profile'),
    accessibilityLabel: t('navigation.profileTab'),
    icon: 'account-outline',
    iconActive: 'account',
  },
];

const MockBottomNav = (props) => {
  const { activeTab, requestsBadge = 0, messagesBadge = 0 } = props;

  const getBadge = (tabName) => {
    if (tabName === 'Requests') return requestsBadge;
    if (tabName === 'Messages') return messagesBadge;
    return undefined;
  };

  const formatBadge = (count) => {
    return count > 9 ? '9+' : String(count);
  };

  const handlePress = (screen) => {
    // Access global test navigation mock
    if (global.__TEST_NAVIGATION__) {
      global.__TEST_NAVIGATION__.navigate(screen);
    }
  };

  const renderTab = (tab) => {
    const badge = getBadge(tab.name);
    const showBadge = badge && badge > 0;

    return React.createElement(
      Pressable,
      {
        key: tab.name,
        testID: `nav-${tab.name.toLowerCase()}-tab`,
        accessibilityRole: 'tab',
        accessibilityState: { selected: activeTab === tab.name },
        accessibilityLabel: tab.accessibilityLabel,
        onPress: () => handlePress(tab.name),
      },
      React.createElement(
        View,
        null,
        React.createElement(MaterialCommunityIcons, {
          name: activeTab === tab.name ? tab.iconActive : tab.icon,
          size: 24,
        }),
        showBadge
          ? React.createElement(
              View,
              { testID: `badge-${tab.name.toLowerCase()}` },
              React.createElement(Text, null, formatBadge(badge))
            )
          : null,
        React.createElement(Text, null, tab.label)
      )
    );
  };

  const createButton = React.createElement(
    TouchableOpacity,
    {
      key: 'create',
      testID: 'nav-create-tab',
      accessibilityRole: 'button',
      accessibilityLabel: t('navigation.createMoment'),
      onPress: () => handlePress('CreateMoment'),
    },
    React.createElement(MaterialCommunityIcons, { name: 'plus', size: 28 })
  );

  // Build children array properly
  const children = [
    renderTab(TAB_CONFIGS[0]), // Discover
    renderTab(TAB_CONFIGS[1]), // Requests
    createButton,
    renderTab(TAB_CONFIGS[2]), // Messages
    renderTab(TAB_CONFIGS[3]), // Profile
  ];

  return React.createElement(View, { testID: 'bottom-nav' }, children);
};

module.exports = MockBottomNav;
module.exports.default = MockBottomNav;
