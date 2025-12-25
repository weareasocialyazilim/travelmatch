try {
  module.exports = require('@/features/home/screens/HomeScreen').default;
} catch {
  const React = require('react');
  module.exports = function HomeScreen() {
    return React.createElement('RCTView', null, null);
  };
}
