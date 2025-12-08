import { getStorybookUI } from '@storybook/react-native';

import './storybook.requires';

const StorybookUIRoot = getStorybookUI({
  // Enable asyncStorage for Storybook state persistence
  asyncStorage: require('@react-native-async-storage/async-storage').default,
});

export default StorybookUIRoot;
