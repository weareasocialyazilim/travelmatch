/**
 * Mock for @react-native-community/datetimepicker
 */
const React = require('react');

const DateTimePicker = React.forwardRef((props, ref) => {
  const { value, onChange, mode, display, testID, ...otherProps } = props;

  return React.createElement('RCTDateTimePicker', {
    ...otherProps,
    testID: testID || 'dateTimePicker',
    value: value?.toISOString(),
    mode: mode || 'date',
    display: display || 'default',
    onChange: onChange,
    ref,
  });
});

DateTimePicker.displayName = 'DateTimePicker';

module.exports = DateTimePicker;
module.exports.default = DateTimePicker;
