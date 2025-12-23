// If a feature implementation exists, re-export it. Otherwise provide a minimal stub.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  module.exports = require('@/features/moments/screens/CreateMomentScreen').default;
} catch (e) {
  const React = require('react');
  module.exports = function CreateMomentScreen() {
    return React.createElement('RCTView', null, null);
  };
}
