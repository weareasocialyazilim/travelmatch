import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock Link component for testing
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Home Page', () => {
  beforeEach(() => {
    render(<Home />);
  });

  describe('Hero Section', () => {
    it('renders the main heading with brand motto', () => {
      expect(screen.getByText('Give a moment.')).toBeInTheDocument();
      expect(screen.getByText('See it happen.')).toBeInTheDocument();
    });

    it('renders the TravelMatch brand name', () => {
      const elements = screen.getAllByText('TravelMatch');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders the description', () => {
      expect(
        screen.getByText(
          /The first platform where you can gift real travel experiences/i,
        ),
      ).toBeInTheDocument();
    });

    it('renders iOS download link', () => {
      expect(screen.getByText('Download for iOS')).toBeInTheDocument();
    });

    it('renders Android download link', () => {
      expect(screen.getByText('Get on Android')).toBeInTheDocument();
    });

    it('renders social proof', () => {
      expect(screen.getByText(/trusted travelers/i)).toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    it('renders Trust Score feature', () => {
      const elements = screen.getAllByText('Trust Score');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders Gift Moments feature', () => {
      expect(screen.getByText('Gift Moments')).toBeInTheDocument();
    });

    it('renders Proof System feature', () => {
      expect(screen.getByText('Proof System')).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    it('renders section heading', () => {
      expect(screen.getByText(/How It/i)).toBeInTheDocument();
      expect(screen.getByText('Works')).toBeInTheDocument();
    });

    it('renders Create a Moment step', () => {
      expect(screen.getByText('Create a Moment')).toBeInTheDocument();
    });

    it('renders Get Discovered step', () => {
      expect(screen.getByText('Get Discovered')).toBeInTheDocument();
    });

    it('renders Receive a Gift step', () => {
      expect(screen.getByText('Receive a Gift')).toBeInTheDocument();
    });

    it('renders Upload Proof step', () => {
      expect(screen.getByText('Upload Proof')).toBeInTheDocument();
    });
  });

  describe('Partner Section', () => {
    it('renders partner CTA', () => {
      expect(screen.getByText('Are you a business?')).toBeInTheDocument();
    });

    it('renders partner description', () => {
      expect(
        screen.getByText(
          /Partner with TravelMatch and reach engaged travelers/i,
        ),
      ).toBeInTheDocument();
    });

    it('renders Partner with Us button', () => {
      expect(screen.getByText('Partner with Us')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders Terms link', () => {
      expect(screen.getByText('Terms')).toBeInTheDocument();
    });

    it('renders Privacy link', () => {
      expect(screen.getByText('Privacy')).toBeInTheDocument();
    });

    it('renders Safety link', () => {
      expect(screen.getByText('Safety')).toBeInTheDocument();
    });

    it('renders Community link', () => {
      expect(screen.getByText('Community')).toBeInTheDocument();
    });

    it('renders Contact link', () => {
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('renders copyright notice with current year', () => {
      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(
          new RegExp(`© ${currentYear} TravelMatch Inc. All rights reserved.`),
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('has correct href for terms link', () => {
      const termsLink = screen.getByText('Terms').closest('a');
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('has correct href for privacy link', () => {
      const privacyLink = screen.getByText('Privacy').closest('a');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('has correct href for partner link', () => {
      const partnerLink = screen.getByText('Partner with Us').closest('a');
      expect(partnerLink).toHaveAttribute('href', '/partner');
    });
  });
});
