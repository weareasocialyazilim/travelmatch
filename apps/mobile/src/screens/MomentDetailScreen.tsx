try {
  module.exports =
    require('@/features/moments/screens/MomentDetailScreen').default;
} catch {
  const React = require('react');
  module.exports = function MomentDetailScreen() {
    return React.createElement('RCTView', null, null);
  };
}
