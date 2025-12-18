// Mock @expo/vector-icons for design-system tests
const React = require('react');

const createIconMock = (name) => {
  const Icon = (props) => {
    return React.createElement('Text', {
      ...props,
      children: props.name || name,
    });
  };
  Icon.displayName = name;
  return Icon;
};

module.exports = {
  MaterialCommunityIcons: createIconMock('MaterialCommunityIcons'),
  MaterialIcons: createIconMock('MaterialIcons'),
  Ionicons: createIconMock('Ionicons'),
  FontAwesome: createIconMock('FontAwesome'),
  FontAwesome5: createIconMock('FontAwesome5'),
  Feather: createIconMock('Feather'),
  AntDesign: createIconMock('AntDesign'),
  Entypo: createIconMock('Entypo'),
  EvilIcons: createIconMock('EvilIcons'),
  Foundation: createIconMock('Foundation'),
  Octicons: createIconMock('Octicons'),
  SimpleLineIcons: createIconMock('SimpleLineIcons'),
  Zocial: createIconMock('Zocial'),
  createIconSet: () => createIconMock('CustomIcon'),
  createIconSetFromFontello: () => createIconMock('FontelloIcon'),
  createIconSetFromIcoMoon: () => createIconMock('IcoMoonIcon'),
};
