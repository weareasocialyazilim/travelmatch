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
    it('renders the main heading', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('travelmatch');
    });

    it('renders the tagline', () => {
      expect(
        screen.getByText(
          /connect with solo travelers and explore the world together/i,
        ),
      ).toBeInTheDocument();
    });

    it('renders App Store download link', () => {
      expect(screen.getByText('App Store')).toBeInTheDocument();
    });

    it('renders Google Play download link', () => {
      expect(screen.getByText('Google Play')).toBeInTheDocument();
    });

    it('renders partner CTA button', () => {
      expect(screen.getByText('partner with us')).toBeInTheDocument();
    });
  });

  describe('Phone Mockups Section', () => {
    it('renders Explore feature card', () => {
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Find travelers near you')).toBeInTheDocument();
    });

    it('renders Match feature card', () => {
      expect(screen.getByText('Match')).toBeInTheDocument();
      expect(
        screen.getByText('Find your travel companions'),
      ).toBeInTheDocument();
    });

    it('renders Share feature card', () => {
      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByText('Build lasting friendships')).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    it('renders section heading', () => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('how it works');
    });

    it('renders step 1', () => {
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('renders step 2', () => {
      expect(screen.getByText('Browse travelers')).toBeInTheDocument();
    });

    it('renders step 3', () => {
      expect(screen.getByText('Match & chat')).toBeInTheDocument();
    });

    it('renders step 4', () => {
      expect(screen.getByText('Explore together')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders Terms and Conditions link', () => {
      expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    });

    it('renders Privacy Policy link', () => {
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });

    it('renders Safety Tips link', () => {
      expect(
        screen.getByText('Safety Tips & Event Etiquette'),
      ).toBeInTheDocument();
    });

    it('renders Community Guidelines link', () => {
      expect(screen.getByText('Community Guidelines')).toBeInTheDocument();
    });

    it('renders Contact Us link', () => {
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
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
      const termsLink = screen.getByText('Terms and Conditions').closest('a');
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('has correct href for privacy link', () => {
      const privacyLink = screen.getByText('Privacy Policy').closest('a');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('has correct href for partner link in footer', () => {
      const partnerLink = screen
        .getByText('Partner with TravelMatch')
        .closest('a');
      expect(partnerLink).toHaveAttribute('href', '/partner');
    });
  });
});
