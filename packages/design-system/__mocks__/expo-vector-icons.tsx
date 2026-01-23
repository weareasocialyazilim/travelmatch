import React from 'react';
import { View, Text, ViewProps, StyleProp, ViewStyle } from 'react-native';

interface IconProps extends ViewProps {
  name?: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const IconMock = ({ name, size, color, style, ...props }: IconProps) => {
  return (
    <View
      {...props}
      style={[
        {
          width: size || 24,
          height: size || 24,
          backgroundColor: 'rgba(0,0,0,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 10, color: color || '#000' }}>{name}</Text>
    </View>
  );
};

export const createIconSet = () => IconMock;
export const AntDesign = IconMock;
export const Entypo = IconMock;
export const EvilIcons = IconMock;
export const Feather = IconMock;
export const FontAwesome = IconMock;
export const FontAwesome5 = IconMock;
export const FontAwesome6 = IconMock;
export const Fontisto = IconMock;
export const Foundation = IconMock;
export const Ionicons = IconMock;
export const MaterialCommunityIcons = IconMock;
export const MaterialIcons = IconMock;
export const Octicons = IconMock;
export const SimpleLineIcons = IconMock;
export const Zocial = IconMock;

export default IconMock;
