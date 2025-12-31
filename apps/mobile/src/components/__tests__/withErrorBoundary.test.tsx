/**
 * withErrorBoundary HOC Test Suite
 * Tests higher-order component for wrapping components with error boundaries
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  withErrorBoundary,
  withNetworkErrorBoundary,
  withGenericErrorBoundary,
  withCriticalErrorBoundary,
} from '../withErrorBoundary';

// Mock ErrorBoundary - using require to avoid hoisting issues
jest.mock('../ErrorBoundary', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ScreenErrorBoundary: ({ children, fallbackType }: any) =>
      React.createElement(
        View,
        { testID: `error-boundary-${fallbackType || 'default'}` },
        children,
      ),
  };
});

describe('withErrorBoundary HOC', () => {
  // Test component
  const TestComponent: React.FC<{ message?: string }> = ({
    message = 'Test Component',
  }) => <Text testID="test-component">{message}</Text>;
  TestComponent.displayName = 'TestComponent';

  // ============================================
  // Basic Functionality Tests
  // ============================================

  describe('Basic Functionality', () => {
    it('wraps component with error boundary', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('error-boundary-default')).toBeTruthy();
      expect(getByTestId('test-component')).toBeTruthy();
    });

    it('renders wrapped component with props', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      const { getByText } = render(
        <WrappedComponent message="Custom Message" />,
      );

      expect(getByText('Custom Message')).toBeTruthy();
    });

    it('passes all props to wrapped component', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      const { getByText } = render(<WrappedComponent message="Prop Test" />);

      expect(getByText('Prop Test')).toBeTruthy();
    });

    it('wraps component without options', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('test-component')).toBeTruthy();
    });
  });

  // ============================================
  // Fallback Type Tests
  // ============================================

  describe('Fallback Types', () => {
    it('wraps component with network fallback type', () => {
      const WrappedComponent = withErrorBoundary(TestComponent, {
        fallbackType: 'network',
      });
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('error-boundary-network')).toBeTruthy();
    });

    it('wraps component with generic fallback type', () => {
      const WrappedComponent = withErrorBoundary(TestComponent, {
        fallbackType: 'generic',
      });
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('error-boundary-generic')).toBeTruthy();
    });

    it('wraps component with critical fallback type', () => {
      const WrappedComponent = withErrorBoundary(TestComponent, {
        fallbackType: 'critical',
      });
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('error-boundary-critical')).toBeTruthy();
    });

    it('uses default fallback when type not specified', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('error-boundary-default')).toBeTruthy();
    });
  });

  // ============================================
  // Display Name Tests
  // ============================================

  describe('Display Names', () => {
    it('sets display name with component name', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      expect(WrappedComponent.displayName).toBe(
        'withErrorBoundary(TestComponent)',
      );
    });

    it('sets display name with custom display name option', () => {
      const WrappedComponent = withErrorBoundary(TestComponent, {
        displayName: 'CustomName',
      });
      expect(WrappedComponent.displayName).toBe(
        'withErrorBoundary(CustomName)',
      );
    });

    it('sets display name for anonymous component', () => {
      const AnonymousComponent = () => <Text>Anonymous</Text>;
      const WrappedComponent = withErrorBoundary(AnonymousComponent);
      expect(WrappedComponent.displayName).toMatch(/withErrorBoundary/);
    });

    it('uses Component displayName if available', () => {
      const ComponentWithDisplayName: React.FC = () => <Text>Test</Text>;
      ComponentWithDisplayName.displayName = 'MyDisplayName';
      const WrappedComponent = withErrorBoundary(ComponentWithDisplayName);
      expect(WrappedComponent.displayName).toBe(
        'withErrorBoundary(MyDisplayName)',
      );
    });
  });

  // ============================================
  // Convenience Functions Tests
  // ============================================

  describe('Convenience Functions', () => {
    it('withNetworkErrorBoundary wraps with network fallback', () => {
      const WrappedComponent = withNetworkErrorBoundary(TestComponent);
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('error-boundary-network')).toBeTruthy();
      expect(getByTestId('test-component')).toBeTruthy();
    });

    it('withGenericErrorBoundary wraps with generic fallback', () => {
      const WrappedComponent = withGenericErrorBoundary(TestComponent);
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('error-boundary-generic')).toBeTruthy();
      expect(getByTestId('test-component')).toBeTruthy();
    });

    it('withCriticalErrorBoundary wraps with critical fallback', () => {
      const WrappedComponent = withCriticalErrorBoundary(TestComponent);
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('error-boundary-critical')).toBeTruthy();
      expect(getByTestId('test-component')).toBeTruthy();
    });

    it('convenience functions pass props correctly', () => {
      const WrappedComponent = withNetworkErrorBoundary(TestComponent);
      const { getByText } = render(
        <WrappedComponent message="Network Error Test" />,
      );

      expect(getByText('Network Error Test')).toBeTruthy();
    });
  });

  // ============================================
  // Navigation Props Tests
  // ============================================

  describe('Navigation Props', () => {
    it('extracts and passes navigation prop', () => {
      const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
      const WrappedComponent = withErrorBoundary(TestComponent);

      const { getByTestId } = render(
        <WrappedComponent
          navigation={
            mockNavigation as unknown as {
              navigate?: (...args: unknown[]) => void;
              goBack?: () => void;
              reset?: (...args: unknown[]) => void;
            }
          }
        />,
      );

      expect(getByTestId('test-component')).toBeTruthy();
    });

    it('works without navigation prop', () => {
      const WrappedComponent = withErrorBoundary(TestComponent);
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('test-component')).toBeTruthy();
    });

    it('passes navigation alongside other props', () => {
      const mockNavigation = { navigate: jest.fn() };
      const WrappedComponent = withErrorBoundary(TestComponent);

      const { getByText } = render(
        <WrappedComponent
          navigation={
            mockNavigation as unknown as {
              navigate?: (...args: unknown[]) => void;
              goBack?: () => void;
              reset?: (...args: unknown[]) => void;
            }
          }
          message="With Navigation"
        />,
      );

      expect(getByText('With Navigation')).toBeTruthy();
    });
  });

  // ============================================
  // Multiple Wrapping Tests
  // ============================================

  describe('Multiple Wrapping', () => {
    it('can wrap same component multiple times with different options', () => {
      const Wrapped1 = withErrorBoundary(TestComponent, {
        fallbackType: 'network',
      });
      const Wrapped2 = withErrorBoundary(TestComponent, {
        fallbackType: 'generic',
      });

      const { getByTestId: getById1 } = render(<Wrapped1 />);
      const { getByTestId: getById2 } = render(<Wrapped2 />);

      expect(getById1('error-boundary-network')).toBeTruthy();
      expect(getById2('error-boundary-generic')).toBeTruthy();
    });

    it('creates independent wrapped instances', () => {
      const Wrapped1 = withNetworkErrorBoundary(TestComponent);
      const Wrapped2 = withCriticalErrorBoundary(TestComponent);

      expect(Wrapped1).not.toBe(Wrapped2);
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================

  describe('Edge Cases', () => {
    it('handles component with no props', () => {
      const NoPropsComponent = () => <Text>No Props</Text>;
      const WrappedComponent = withErrorBoundary(NoPropsComponent);

      const { getByText } = render(<WrappedComponent />);
      expect(getByText('No Props')).toBeTruthy();
    });

    it('handles component with many props', () => {
      const ManyPropsComponent: React.FC<any> = (props) => (
        <Text>{JSON.stringify(props)}</Text>
      );
      const WrappedComponent = withErrorBoundary(ManyPropsComponent);

      render(<WrappedComponent prop1="a" prop2="b" prop3="c" prop4="d" />);
    });

    it('works with class components', () => {
      class ClassComponent extends React.Component {
        render() {
          return <Text>Class Component</Text>;
        }
      }

      const WrappedComponent = withErrorBoundary(ClassComponent);
      const { getByText } = render(<WrappedComponent />);

      expect(getByText('Class Component')).toBeTruthy();
    });

    it('handles empty options object', () => {
      const WrappedComponent = withErrorBoundary(TestComponent, {});
      const { getByTestId } = render(<WrappedComponent />);

      expect(getByTestId('test-component')).toBeTruthy();
    });

    it('preserves component functionality', () => {
      const StatefulComponent: React.FC = () => {
        const [count] = React.useState(0);
        return <Text>Count: {count}</Text>;
      };

      const WrappedComponent = withErrorBoundary(StatefulComponent);
      const { getByText } = render(<WrappedComponent />);

      expect(getByText('Count: 0')).toBeTruthy();
    });
  });

  // ============================================
  // Type Safety Tests
  // ============================================

  describe('Type Safety', () => {
    it('wraps component and maintains prop types', () => {
      interface CustomProps {
        title: string;
        count?: number;
      }

      const TypedComponent: React.FC<CustomProps> = ({ title, count = 0 }) => (
        <Text>
          {title}: {count}
        </Text>
      );

      const WrappedComponent = withErrorBoundary(TypedComponent);
      const { getByText } = render(<WrappedComponent title="Test" count={5} />);

      expect(getByText('Test: 5')).toBeTruthy();
    });

    it('works with components that have optional props', () => {
      interface OptionalProps {
        required: string;
        optional?: string;
      }

      const OptionalPropsComponent: React.FC<OptionalProps> = ({
        required,
        optional,
      }) => (
        <Text>
          {required} {optional || 'default'}
        </Text>
      );

      const WrappedComponent = withErrorBoundary(OptionalPropsComponent);
      const { getByText } = render(<WrappedComponent required="Test" />);

      expect(getByText('Test default')).toBeTruthy();
    });
  });

  // ============================================
  // Options Combination Tests
  // ============================================

  describe('Options Combinations', () => {
    it('combines fallbackType and displayName options', () => {
      const WrappedComponent = withErrorBoundary(TestComponent, {
        fallbackType: 'network',
        displayName: 'CustomErrorComponent',
      });

      expect(WrappedComponent.displayName).toBe(
        'withErrorBoundary(CustomErrorComponent)',
      );

      const { getByTestId } = render(<WrappedComponent />);
      expect(getByTestId('error-boundary-network')).toBeTruthy();
    });

    it('handles all possible fallbackType values', () => {
      const types: Array<'network' | 'generic' | 'critical'> = [
        'network',
        'generic',
        'critical',
      ];

      types.forEach((type) => {
        const WrappedComponent = withErrorBoundary(TestComponent, {
          fallbackType: type,
        });
        const { getByTestId } = render(<WrappedComponent />);
        expect(getByTestId(`error-boundary-${type}`)).toBeTruthy();
      });
    });
  });
});
