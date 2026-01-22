// apps/mobile/index.js

console.log('STEP 0: index.js start');

// 0) TextEncoder/TextDecoder (Supabase)
import 'text-encoding-polyfill';
console.log('STEP 1: text-encoding-polyfill ok');

// 0.5) Buffer Polyfill
global.Buffer = global.Buffer || require('buffer').Buffer;
console.log('STEP 1.5: buffer-polyfill ok');

// 1) URL polyfill
import 'react-native-url-polyfill/auto';
console.log('STEP 2: url-polyfill ok');

// 2) crypto.getRandomValues
import 'react-native-get-random-values';
console.log('STEP 3: get-random-values ok');

// 3) gesture handler (navigation için)
import 'react-native-gesture-handler';
console.log('STEP 4: gesture-handler ok');

// App importunu EN SONA bırakıyoruz
import { registerRootComponent } from 'expo';
console.log('STEP 5: expo registerRootComponent ok');

// IMPORTANT: App importunu en sona al
import App from './App';
console.log('STEP 6: App module ok');

registerRootComponent(App);
console.log('STEP 7: registerRootComponent called');
