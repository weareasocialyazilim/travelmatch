try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  module.exports = require('@/features/moments/screens/MomentDetailScreen').default;
} catch (e) {
  const React = require('react');
  module.exports = function MomentDetailScreen() {
    return React.createElement('RCTView', null, null);
  };
}
