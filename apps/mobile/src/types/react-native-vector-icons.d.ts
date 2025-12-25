// Type declarations for @expo/vector-icons
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';

declare module '@expo/vector-icons/MaterialCommunityIcons' {
  const Icon: React.ComponentType<
    React.ComponentProps<typeof MaterialCommunityIcons>
  >;
  export default Icon;
}

// Prop-types declaration
 
declare module 'prop-types' {
  export const string: any;
  export const number: any;
  export const bool: any;
  export const func: any;
  export const array: any;
  export const object: any;
  export const node: any;
  export const element: any;
  export const any: any;
  export const oneOf: (types: any[]) => any;
  export const oneOfType: (types: any[]) => any;
  export const arrayOf: (type: any) => any;
  export const objectOf: (type: any) => any;
  export const shape: (shape: any) => any;
  export const exact: (shape: any) => any;
}
 
