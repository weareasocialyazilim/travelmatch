import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '../page';

// Mock Next.js Image component
jest.mock('next/image', () => {
  const MockImage = ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock window.location
const originalLocation = window.location;
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { href: '', assign: jest.fn() },
  });
});
afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

describe('Home Page', () => {
  beforeEach(() => {
    render(<Home />);
  });

  describe('Hero Section', () => {
    it('renders the hero title words', () => {
      expect(screen.getByText('SEND')).toBeInTheDocument();
      expect(screen.getByText('REAL')).toBeInTheDocument();
      expect(screen.getByText('MOMENTS')).toBeInTheDocument();
    });

    it('renders the beta badge', () => {
      expect(screen.getByText(/LIVE BETA/i)).toBeInTheDocument();
    });

    it('renders the brand name', () => {
      expect(screen.getByText('travelmatch.')).toBeInTheDocument();
    });

    it('renders the START NOW button', () => {
      expect(screen.getByText('START NOW')).toBeInTheDocument();
    });

    it('renders the WATCH DEMO button', () => {
      expect(screen.getByText('WATCH DEMO')).toBeInTheDocument();
    });
  });

  describe('Stash Section', () => {
    it('renders THE STASH title', () => {
      expect(screen.getByText('THE')).toBeInTheDocument();
      expect(screen.getByText('STASH')).toBeInTheDocument();
    });

    it('renders curated drops subtitle', () => {
      expect(screen.getByText('/// CURATED DROPS')).toBeInTheDocument();
    });

    it('renders VIEW ALL DROPS button', () => {
      expect(screen.getByText('VIEW ALL DROPS')).toBeInTheDocument();
    });

    it('renders gift items', () => {
      expect(screen.getByText('Frappé')).toBeInTheDocument();
      expect(screen.getByText('Croissant')).toBeInTheDocument();
      expect(screen.getByText('Gold Latte')).toBeInTheDocument();
    });
  });

  describe('Manifesto Section', () => {
    it('renders manifesto subtitle', () => {
      expect(screen.getByText('/// THE MANIFESTO')).toBeInTheDocument();
    });

    it('renders the manifesto title', () => {
      expect(screen.getByText(/We reject the/i)).toBeInTheDocument();
      expect(screen.getByText('Metaverse.')).toBeInTheDocument();
    });

    it('renders JOIN THE RESISTANCE button', () => {
      expect(screen.getByText('JOIN THE RESISTANCE')).toBeInTheDocument();
    });

    it('renders WATCH FILM button', () => {
      expect(screen.getByText('WATCH FILM')).toBeInTheDocument();
    });
  });

  describe('Footer Section', () => {
    it('renders SPOTS LIMITED badge', () => {
      expect(screen.getByText('SPOTS LIMITED')).toBeInTheDocument();
    });

    it('renders SOON heading', () => {
      // Multiple SOON texts (hero + footer)
      expect(screen.getAllByText('SOON').length).toBeGreaterThan(0);
    });

    it('renders email input placeholder', () => {
      expect(
        screen.getByPlaceholderText('ENTER YOUR EMAIL...'),
      ).toBeInTheDocument();
    });

    it('renders JOIN button', () => {
      expect(screen.getByText('JOIN')).toBeInTheDocument();
    });

    it('renders app store buttons', () => {
      expect(screen.getByText('APP STORE')).toBeInTheDocument();
      expect(screen.getByText('PLAY STORE')).toBeInTheDocument();
    });

    it('renders social links', () => {
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('TikTok')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });

    it('renders company info', () => {
      expect(screen.getByText('TravelMatch Inc.')).toBeInTheDocument();
      expect(screen.getByText('Est. 2025 // Istanbul')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders GET THE APP button', () => {
      expect(screen.getByText('GET THE APP')).toBeInTheDocument();
    });

    it('renders language switcher', () => {
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('TR')).toBeInTheDocument();
    });
  });

  describe('City Marquee', () => {
    it('renders city names', () => {
      // Multiple instances due to marquee animation
      expect(screen.getAllByText(/ISTANBUL/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/PARIS/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TOKYO/i).length).toBeGreaterThan(0);
    });
  });
});
