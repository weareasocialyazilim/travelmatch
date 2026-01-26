const React = require('react');
const { View, Text } = require('react-native');

const IconMock = ({ name, size, color, style, ...props }) => {
  return React.createElement(
    View,
    {
      ...props,
      style: [
        {
          width: size || 24,
          height: size || 24,
          backgroundColor: 'rgba(0,0,0,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ],
    },
    React.createElement(Text, { style: { fontSize: 10, color: color || '#000' } }, name)
  );
};

exports.createIconSet = () => IconMock;
exports.AntDesign = IconMock;
exports.Entypo = IconMock;
exports.EvilIcons = IconMock;
exports.Feather = IconMock;
exports.FontAwesome = IconMock;
exports.FontAwesome5 = IconMock;
exports.FontAwesome6 = IconMock;
exports.Fontisto = IconMock;
exports.Foundation = IconMock;
exports.Ionicons = IconMock;
exports.MaterialCommunityIcons = IconMock;
exports.MaterialIcons = IconMock;
exports.Octicons = IconMock;
exports.SimpleLineIcons = IconMock;
exports.Zocial = IconMock;

exports.default = IconMock;
