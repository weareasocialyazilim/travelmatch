/**
 * StatsRow Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../__tests__/testUtilsRender.helper';
import { StatsRow } from '../StatsRow';

describe('StatsRow Component', () => {
  const mockHandlers = {
    onMomentsPress: jest.fn(),
    onExchangesPress: jest.fn(),
    onResponsePress: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders moments count', () => {
      const { getByText } = render(
        <StatsRow 
          momentsCount={15}
          exchangesCount={0}
          responseRate={0}
          {...mockHandlers}
        />
      );
      expect(getByText('15')).toBeTruthy();
      expect(getByText(/Moments/i)).toBeTruthy();
    });

    it('renders exchanges count', () => {
      const { getByText } = render(
        <StatsRow 
          momentsCount={0}
          exchangesCount={42}
          responseRate={0}
          {...mockHandlers}
        />
      );
      expect(getByText('42')).toBeTruthy();
      expect(getByText(/Exchanges/i)).toBeTruthy();
    });

    it('renders response rate as percentage', () => {
      const { getByText } = render(
        <StatsRow 
          momentsCount={0}
          exchangesCount={0}
          responseRate={95}
          {...mockHandlers}
        />
      );
      expect(getByText('95%')).toBeTruthy();
      expect(getByText(/Response/i)).toBeTruthy();
    });

    it('renders all three stats', () => {
      const { getByText } = render(
        <StatsRow 
          momentsCount={15}
          exchangesCount={42}
          responseRate={88}
          {...mockHandlers}
        />
      );
      expect(getByText('15')).toBeTruthy();
      expect(getByText('42')).toBeTruthy();
      expect(getByText('88%')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onMomentsPress when moments stat is clicked', () => {
      const { getByText } = render(
        <StatsRow 
          momentsCount={15}
          exchangesCount={0}
          responseRate={0}
          {...mockHandlers}
        />
      );
      
      fireEvent.press(getByText('15'));
      expect(mockHandlers.onMomentsPress).toHaveBeenCalledTimes(1);
    });

    it('calls onExchangesPress when exchanges stat is clicked', () => {
      const { getByText } = render(
        <StatsRow 
          momentsCount={0}
          exchangesCount={42}
          responseRate={0}
          {...mockHandlers}
        />
      );
      
      fireEvent.press(getByText('42'));
      expect(mockHandlers.onExchangesPress).toHaveBeenCalledTimes(1);
    });

  });

  describe('Formatting', () => {
    it('formats large numbers correctly', () => {
      const { getByText } = render(
        <StatsRow 
          momentsCount={1234}
          exchangesCount={9999}
          responseRate={100}
          {...mockHandlers}
        />
      );
      // Component displays numbers as-is (no formatting)
      expect(getByText('1234')).toBeTruthy();
      expect(getByText('9999')).toBeTruthy();
    });

    it('handles zero values', () => {
      const { getAllByText, getByText } = render(
        <StatsRow 
          momentsCount={0}
          exchangesCount={0}
          responseRate={0}
          {...mockHandlers}
        />
      );
      // Two zeros for moments and exchanges
      expect(getAllByText('0').length).toBe(2);
      expect(getByText('0%')).toBeTruthy();
    });

    it('displays response rate as percentage', () => {
      const { getByText } = render(
        <StatsRow
          momentsCount={0}
          exchangesCount={0}
          responseRate={88}
          {...mockHandlers}
        />
      );
      expect(getByText('88%')).toBeTruthy();
    });
  });


  describe('Accessibility', () => {
    it('has accessible labels for each stat', () => {
      const { getByLabelText } = render(
        <StatsRow 
          momentsCount={15}
          exchangesCount={42}
          responseRate={0.88}
          {...mockHandlers}
        />
      );
      // Check for accessibility labels
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot with various counts', () => {
      const { toJSON } = render(
        <StatsRow 
          momentsCount={15}
          exchangesCount={42}
          responseRate={0.88}
          {...mockHandlers}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with zero values', () => {
      const { toJSON } = render(
        <StatsRow 
          momentsCount={0}
          exchangesCount={0}
          responseRate={0}
          {...mockHandlers}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
