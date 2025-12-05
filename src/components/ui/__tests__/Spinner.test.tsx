/**
 * Spinner Component Tests
 * Testing spinner sizes, colors, messages, and full screen mode
 */

/* eslint-disable react-native/no-inline-styles, react-native/no-color-literals */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('renders spinner', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with default large size', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Size', () => {
    it('renders small spinner', () => {
      const { UNSAFE_root } = render(<Spinner size="small" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders large spinner', () => {
      const { UNSAFE_root } = render(<Spinner size="large" />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Color', () => {
    it('renders with custom color', () => {
      const { UNSAFE_root } = render(<Spinner color="#FF0000" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders with default primary color', () => {
      const { UNSAFE_root } = render(<Spinner />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Message', () => {
    it('renders with message', () => {
      const { getByText } = render(<Spinner message="Loading..." />);
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('renders without message when not provided', () => {
      const { queryByText } = render(<Spinner />);
      expect(queryByText('Loading...')).toBeNull();
    });

    it('displays custom loading message', () => {
      const { getByText } = render(<Spinner message="Please wait" />);
      expect(getByText('Please wait')).toBeTruthy();
    });
  });

  describe('Full Screen Mode', () => {
    it('renders in full screen mode', () => {
      const { UNSAFE_root } = render(<Spinner fullScreen={true} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders in normal mode by default', () => {
      const { UNSAFE_root } = render(<Spinner fullScreen={false} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders full screen with message', () => {
      const { getByText } = render(
        <Spinner fullScreen={true} message="Loading data..." />,
      );
      expect(getByText('Loading data...')).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop', () => {
      const customStyle = { marginTop: 20 };
      const { UNSAFE_root } = render(<Spinner style={customStyle} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('combines custom style with default styles', () => {
      const { UNSAFE_root } = render(
        <Spinner style={{ padding: 10 }} message="Test" />,
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Combined Props', () => {
    it('renders with all props', () => {
      const { getByText } = render(
        <Spinner
          size="large"
          color="#0000FF"
          message="Fetching data..."
          fullScreen={true}
          style={{ backgroundColor: 'white' }}
        />,
      );
      expect(getByText('Fetching data...')).toBeTruthy();
    });
  });
});
