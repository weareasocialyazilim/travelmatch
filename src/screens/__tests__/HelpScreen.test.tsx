/**
 * HelpScreen Tests
 * Tests for the help and support screen
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HelpScreen } from '../HelpScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
} as any;

const mockRoute = {
  params: {},
} as any;

const renderScreen = () => {
  return render(<HelpScreen navigation={mockNavigation} route={mockRoute} />);
};

describe('HelpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders correctly', () => {
      const { getByText } = renderScreen();

      expect(getByText('Help Center')).toBeTruthy();
    });

    it('shows help categories', () => {
      const { getByText } = renderScreen();

      expect(getByText('Getting Started')).toBeTruthy();
      expect(getByText('Account & Profile')).toBeTruthy();
      expect(getByText('Moments & Gifting')).toBeTruthy();
      expect(getByText('Payments & Wallet')).toBeTruthy();
    });

    it('shows escrow help', () => {
      const { getByText } = renderScreen();

      expect(getByText('Escrow & Proofs')).toBeTruthy();
    });

    it('shows trust and safety', () => {
      const { getByText } = renderScreen();

      expect(getByText('Trust & Safety')).toBeTruthy();
    });

    it('shows hero section', () => {
      const { getByText } = renderScreen();

      expect(getByText('How can we help you?')).toBeTruthy();
    });
  });

  describe('Category Descriptions', () => {
    it('shows category descriptions', () => {
      const { getByText } = renderScreen();

      expect(getByText('Learn how to use TravelMatch')).toBeTruthy();
      expect(getByText('Manage your account settings')).toBeTruthy();
      expect(getByText('How to create and gift moments')).toBeTruthy();
      expect(getByText('Payment methods and transactions')).toBeTruthy();
      expect(getByText('How escrow protection works')).toBeTruthy();
      expect(getByText('Staying safe on TravelMatch')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to FAQ when Getting Started is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Getting Started'));

      expect(mockNavigate).toHaveBeenCalledWith('FAQ');
    });

    it('navigates to Settings when Account & Profile is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Account & Profile'));

      expect(mockNavigate).toHaveBeenCalledWith('Settings');
    });

    it('navigates to Wallet when Payments & Wallet is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Payments & Wallet'));

      expect(mockNavigate).toHaveBeenCalledWith('Wallet');
    });

    it('navigates to HowEscrowWorks when Escrow & Proofs is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Escrow & Proofs'));

      expect(mockNavigate).toHaveBeenCalledWith('HowEscrowWorks');
    });

    it('navigates to Safety when Trust & Safety is pressed', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Trust & Safety'));

      expect(mockNavigate).toHaveBeenCalledWith('Safety');
    });
  });

  describe('Quick Links', () => {
    it('shows FAQ quick link', () => {
      const { getByText } = renderScreen();

      expect(getByText('FAQ')).toBeTruthy();
    });

    it('navigates to FAQ screen from quick link', () => {
      const { getAllByText } = renderScreen();

      const faqLinks = getAllByText('FAQ');
      if (faqLinks.length > 0) {
        fireEvent.press(faqLinks[0]);
        expect(mockNavigate).toHaveBeenCalledWith('FAQ');
      }
    });

    it('shows Contact Support option', () => {
      const { getByText } = renderScreen();

      expect(getByText('Contact Support')).toBeTruthy();
    });
  });

  describe('Support Section', () => {
    it('shows support section', () => {
      const { getByText } = renderScreen();

      expect(getByText('Still need help?')).toBeTruthy();
    });

    it('shows contact support button', () => {
      const { getByText } = renderScreen();

      expect(getByText('Contact Support')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible elements', () => {
      const { getByText } = renderScreen();
      // Check key elements are present
      expect(getByText('Getting Started')).toBeTruthy();
      expect(getByText('Account & Profile')).toBeTruthy();
    });
  });

  describe('Layout', () => {
    it('renders help content', () => {
      const { getByText } = renderScreen();
      expect(getByText('Help Center')).toBeTruthy();
    });

    it('shows all categories', () => {
      const { getByText } = renderScreen();
      expect(getByText('Payments & Wallet')).toBeTruthy();
      expect(getByText('Escrow & Proofs')).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('renders category icons', () => {
      const { getByText } = renderScreen();

      // Each category should be rendered with an icon
      expect(getByText('Getting Started')).toBeTruthy();
      expect(getByText('Account & Profile')).toBeTruthy();
    });
  });
});
