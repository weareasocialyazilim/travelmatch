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

// Mock Navbar component
jest.mock('@/components/shared/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

// Mock TrustRing component
jest.mock('@/components/ui/TrustRing', () => ({
  TrustRing: ({ score }: { score: number }) => (
    <div data-testid="trust-ring">{score}</div>
  ),
}));

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
    it('renders Gift Experiences feature', () => {
      expect(screen.getByText('Gift Experiences')).toBeInTheDocument();
    });

    it('renders See the Proof feature', () => {
      expect(screen.getByText('See the Proof')).toBeInTheDocument();
    });

    it('renders Build Trust feature', () => {
      expect(screen.getByText('Build Trust')).toBeInTheDocument();
    });

    it('renders section heading', () => {
      expect(screen.getByText(/Why/i)).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    it('renders section heading', () => {
      expect(screen.getByText(/How It/i)).toBeInTheDocument();
      expect(screen.getByText('Works')).toBeInTheDocument();
    });

    it('renders Discover step', () => {
      // Multiple "Discover" texts may exist in the page
      expect(screen.getAllByText('Discover').length).toBeGreaterThan(0);
    });

    it('renders Gift step', () => {
      expect(screen.getByText('Gift')).toBeInTheDocument();
    });

    it('renders Experience step', () => {
      expect(screen.getByText('Experience')).toBeInTheDocument();
    });

    it('renders Prove step', () => {
      expect(screen.getByText('Prove')).toBeInTheDocument();
    });
  });

  describe('Trust Section', () => {
    it('renders Trust System badge', () => {
      expect(screen.getByText('Trust System')).toBeInTheDocument();
    });

    it('renders trust score verification features', () => {
      expect(screen.getByText('Verified identity')).toBeInTheDocument();
      expect(screen.getByText('AI proof verification')).toBeInTheDocument();
      expect(screen.getByText('Community ratings')).toBeInTheDocument();
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

  describe('No Testimonials', () => {
    it('does not render testimonials section', () => {
      // Verify testimonials section is not present
      expect(screen.queryByText(/Loved by travelers/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/testimonial/i)).not.toBeInTheDocument();
    });
  });
});
