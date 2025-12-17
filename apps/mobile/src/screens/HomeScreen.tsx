try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  module.exports = require('@/features/home/screens/HomeScreen').default;
} catch (e) {
  const React = require('react');
  module.exports = function HomeScreen() {
    return React.createElement('RCTView', null, null);
  };
}
