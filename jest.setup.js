require('react-native-gesture-handler/jestSetup');

// Suppress React act() warnings from provider initialization (Phase 1 fix)
const originalError = console.error;
console.error = (...args) => {
  // Suppress AuthProvider initialization warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: An update to AuthProvider') ||
     args[0].includes('Warning: An update to') && args[0].includes('was not wrapped in act'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Set environment variables for tests
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-constants', () => ({
  manifest: {
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
}));

// Mock Supabase client globally
jest.mock('./apps/mobile/src/config/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(() => Promise.resolve('SUBSCRIBED')),
      unsubscribe: jest.fn(() => Promise.resolve('UNSUBSCRIBED')),
    })),
  },
}));

// Mock ThemeContext to avoid async AsyncStorage loading (mobile app only)
// This mock is only active when running tests from apps/mobile
try {
  jest.mock('./apps/mobile/src/context/ThemeContext', () => {
    const React = require('react');
    
    return {
      ThemeProvider: ({ children }) => {
        // Return children directly without async loading
        return React.createElement(React.Fragment, null, children);
      },
      useTheme: () => ({
        colors: {},
        mode: 'light',
        isDark: false,
        setMode: jest.fn(),
      }),
    };
  });
} catch (e) {
  // ThemeContext doesn't exist in non-mobile packages, ignore
}

// Mock SafeAreaContext for react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  
  const MockIcon = (props) => React.createElement(Text, props, props.name || 'icon');
  
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    MaterialCommunityIcons: MockIcon,
    FontAwesome: MockIcon,
    FontAwesome5: MockIcon,
    Feather: MockIcon,
    AntDesign: MockIcon,
    Entypo: MockIcon,
  };
});
