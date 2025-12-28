// CRITICAL: gesture-handler MUST be imported FIRST before any other imports
// This ensures the native module is registered before any navigation or gesture code runs
import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
