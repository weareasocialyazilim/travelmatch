/**
 * Mock for @expo/vector-icons
 * All icon components return a simple View for testing
 */
const React = require('react');
const { View, Text } = require('react-native');

const createIconSetMock = (name) => {
  const IconComponent = ({
    name: iconName,
    size,
    color,
    style,
    testID,
    ...props
  }) => {
    return React.createElement(View, {
      testID: testID || `${name}-icon`,
      style: [{ width: size || 24, height: size || 24 }, style],
      accessibilityLabel: iconName,
      ...props,
    });
  };
  IconComponent.displayName = name;
  return IconComponent;
};

module.exports = {
  MaterialCommunityIcons: createIconSetMock('MaterialCommunityIcons'),
  Ionicons: createIconSetMock('Ionicons'),
  FontAwesome: createIconSetMock('FontAwesome'),
  FontAwesome5: createIconSetMock('FontAwesome5'),
  MaterialIcons: createIconSetMock('MaterialIcons'),
  Feather: createIconSetMock('Feather'),
  AntDesign: createIconSetMock('AntDesign'),
  Entypo: createIconSetMock('Entypo'),
  EvilIcons: createIconSetMock('EvilIcons'),
  Foundation: createIconSetMock('Foundation'),
  Octicons: createIconSetMock('Octicons'),
  SimpleLineIcons: createIconSetMock('SimpleLineIcons'),
  Zocial: createIconSetMock('Zocial'),
  createIconSet: () => createIconSetMock('CustomIcon'),
  createIconSetFromFontello: () => createIconSetMock('FontelloIcon'),
  createIconSetFromIcoMoon: () => createIconSetMock('IcoMoonIcon'),
};
