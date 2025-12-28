/**
 * Shared react-native-svg mock for Jest tests
 * This mock is used by all packages in the monorepo
 */
const React = require('react');

const createComponent = (name) => {
  const Component = (props) => {
    return React.createElement(name, props);
  };
  Component.displayName = name;
  return Component;
};

module.exports = {
  Svg: createComponent('Svg'),
  Circle: createComponent('Circle'),
  Ellipse: createComponent('Ellipse'),
  G: createComponent('G'),
  Text: createComponent('SvgText'),
  TSpan: createComponent('TSpan'),
  TextPath: createComponent('TextPath'),
  Path: createComponent('Path'),
  Polygon: createComponent('Polygon'),
  Polyline: createComponent('Polyline'),
  Line: createComponent('Line'),
  Rect: createComponent('Rect'),
  Use: createComponent('Use'),
  Image: createComponent('SvgImage'),
  Symbol: createComponent('Symbol'),
  Defs: createComponent('Defs'),
  LinearGradient: createComponent('LinearGradient'),
  RadialGradient: createComponent('RadialGradient'),
  Stop: createComponent('Stop'),
  ClipPath: createComponent('ClipPath'),
  Pattern: createComponent('Pattern'),
  Mask: createComponent('Mask'),
  default: createComponent('Svg'),
};
