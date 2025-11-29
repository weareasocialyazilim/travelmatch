import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  const Icon: React.ComponentType<
    React.ComponentProps<typeof MaterialCommunityIcons>
  >;
  export default Icon;
}
