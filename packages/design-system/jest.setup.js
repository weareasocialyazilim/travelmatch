// Jest setup for design-system package
// Compatible with React Native 0.76+

// Global test timeout
jest.setTimeout(10000);

// Performance monitoring for tests
global.beforeEach(() => {
  global.__testStartTime = Date.now();
  global.__renderCount = 0;
});

global.afterEach(() => {
  const duration = Date.now() - global.__testStartTime;
  if (duration > 5000) {
    console.warn(`⚠️  Test took ${duration}ms (should be < 5000ms)`);
  }
});

// Suppress specific warnings
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render') ||
     message.includes('Warning: useLayoutEffect'))
  ) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    message.includes('Warning: An update to')
  ) {
    return;
  }
  originalError(...args);
};
