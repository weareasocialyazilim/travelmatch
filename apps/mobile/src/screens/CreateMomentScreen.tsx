// If a feature implementation exists, re-export it. Otherwise provide a minimal stub.
try {
  module.exports =
    require('@/features/moments/screens/CreateMomentScreen').default;
} catch {
  const React = require('react');
  module.exports = function CreateMomentScreen() {
    return React.createElement('RCTView', null, null);
  };
}
