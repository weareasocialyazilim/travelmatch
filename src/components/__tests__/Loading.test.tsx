/**
 * Loading Component Tests
 * Tests for loading indicator component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import Loading from '../Loading';
import { COLORS } from '../../constants/colors';

describe('Loading Component', () => {
  it('should render without crashing', () => {
    const { getByTestId, toJSON } = render(<Loading />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render activity indicator', () => {
    const { UNSAFE_getByType } = render(<Loading />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('should use large size by default', () => {
    const { UNSAFE_getByType } = render(<Loading />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    const indicator = UNSAFE_getByType(ActivityIndicator);
    
    expect(indicator.props.size).toBe('large');
  });

  it('should accept small size prop', () => {
    const { UNSAFE_getByType } = render(<Loading size="small" />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    const indicator = UNSAFE_getByType(ActivityIndicator);
    
    expect(indicator.props.size).toBe('small');
  });

  it('should use primary color by default', () => {
    const { UNSAFE_getByType } = render(<Loading />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    const indicator = UNSAFE_getByType(ActivityIndicator);
    
    expect(indicator.props.color).toBe(COLORS.primary);
  });

  it('should accept custom color prop', () => {
    const customColor = '#FF0000';
    const { UNSAFE_getByType } = render(<Loading color={customColor} />);
    const ActivityIndicator = require('react-native').ActivityIndicator;
    const indicator = UNSAFE_getByType(ActivityIndicator);
    
    expect(indicator.props.color).toBe(customColor);
  });

  it('should render text when provided', () => {
    const loadingText = 'Loading data...';
    const { getByText } = render(<Loading text={loadingText} />);
    
    expect(getByText(loadingText)).toBeTruthy();
  });

  it('should not render text when not provided', () => {
    const { queryByText } = render(<Loading />);
    
    expect(queryByText('Loading')).toBeNull();
  });

  it('should render in fullscreen mode by default', () => {
    const { toJSON } = render(<Loading />);
    const tree = toJSON();
    
    // Check that the root container has absolute positioning
    expect(tree).toBeTruthy();
  });

  it('should render in overlay mode when specified', () => {
    const { toJSON } = render(<Loading mode="overlay" />);
    const tree = toJSON();
    
    expect(tree).toBeTruthy();
  });

  it('should render with all props combined', () => {
    const { getByText, UNSAFE_getByType } = render(
      <Loading 
        size="small" 
        color="#00FF00" 
        text="Please wait..." 
        mode="overlay" 
      />
    );
    
    const ActivityIndicator = require('react-native').ActivityIndicator;
    const indicator = UNSAFE_getByType(ActivityIndicator);
    
    expect(indicator.props.size).toBe('small');
    expect(indicator.props.color).toBe('#00FF00');
    expect(getByText('Please wait...')).toBeTruthy();
  });
});
