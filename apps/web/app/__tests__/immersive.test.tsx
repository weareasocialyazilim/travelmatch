import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion with inline factory
jest.mock('framer-motion', () => {
  const createMotionComponent = (tag: string) => {
    return function MotionComponent({
      children,
      ...props
    }: {
      children?: React.ReactNode;
    }) {
      // Filter out motion-specific props
      const validProps: Record<string, unknown> = {};
      const invalidProps = [
        'whileHover',
        'whileTap',
        'whileInView',
        'animate',
        'initial',
        'exit',
        'variants',
        'transition',
        'layout',
        'layoutId',
        'drag',
        'dragConstraints',
        'onDragEnd',
        'custom',
        'inherit',
      ];

      Object.keys(props).forEach((key) => {
        if (
          !invalidProps.includes(key) &&
          !key.startsWith('on') &&
          key !== 'style'
        ) {
          validProps[key] = (props as Record<string, unknown>)[key];
        }
      });

      return React.createElement(tag, validProps, children);
    };
  };

  return {
    motion: {
      div: createMotionComponent('div'),
      button: createMotionComponent('button'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      h4: createMotionComponent('h4'),
      p: createMotionComponent('p'),
      span: createMotionComponent('span'),
      a: createMotionComponent('a'),
      nav: createMotionComponent('nav'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      section: createMotionComponent('section'),
      footer: createMotionComponent('footer'),
      header: createMotionComponent('header'),
      article: createMotionComponent('article'),
      main: createMotionComponent('main'),
      aside: createMotionComponent('aside'),
      img: createMotionComponent('img'),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
    useScroll: () => ({ scrollYProgress: { current: 0 } }),
    useTransform: () => 1,
    useSpring: () => 1,
    useMotionValue: () => ({ set: jest.fn(), get: () => 0 }),
  };
});

// Mock next/dynamic
jest.mock('next/dynamic', () => () => {
  const MockComponent = () => (
    <div data-testid="mock-3d-component">3D Component</div>
  );
  MockComponent.displayName = 'MockDynamicComponent';
  return MockComponent;
});

// Mock the hooks
jest.mock('@/hooks/useSunsetAtmosphere', () => ({
  useSunsetAtmosphere: () => ({
    phase: 'morning',
    colors: {
      bg: '#050505',
      acid: '#CCFF00',
      neonPink: '#FF0099',
      electricBlue: '#00F0FF',
    },
    isSacredMode: false,
  }),
}));

jest.mock('@/hooks/useRealtimeStars', () => ({
  useRealtimeStars: () => ({
    stars: [],
    isConnected: true,
    stats: { total: 0, active: 0 },
  }),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));

// Import after mocks
import Home from '../page';

describe('Immersive Landing Page', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();

    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders the hero section with correct title', () => {
    render(<Home />);

    expect(screen.getByText('REALITY')).toBeInTheDocument();
    expect(screen.getByText('LEAKS.')).toBeInTheDocument();
  });

  it('renders the stash section', () => {
    render(<Home />);

    expect(screen.getByText('THE')).toBeInTheDocument();
    expect(screen.getByText('STASH')).toBeInTheDocument();
  });

  it('renders the manifesto section', () => {
    render(<Home />);

    expect(screen.getAllByText(/We reject the/)[0]).toBeInTheDocument();
    expect(screen.getAllByText('Metaverse.')[0]).toBeInTheDocument();
  });

  it('toggles language when language button is clicked', () => {
    render(<Home />);

    // Find the language toggle button
    const langButton = screen.getByRole('button', { name: /EN.*TR/i });

    // Check initial state (English)
    expect(screen.getByText('REALITY')).toBeInTheDocument();

    // Click to switch to Turkish
    fireEvent.click(langButton);

    // Should now show Turkish content
    expect(screen.getByText('GERÇEKLİK')).toBeInTheDocument();
  });

  it('renders the coming soon locked drops', () => {
    render(<Home />);

    expect(screen.getByText('STASH V2.0')).toBeInTheDocument();
    expect(screen.getByText('THE FILM')).toBeInTheDocument();
    expect(screen.getByText('NFT DROP')).toBeInTheDocument();
  });

  it('renders the navbar with logo', () => {
    render(<Home />);

    expect(screen.getByText('travelmatch.')).toBeInTheDocument();
  });

  it('renders city marquee', () => {
    render(<Home />);

    expect(screen.getAllByText(/ISTANBUL/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/PARIS/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/TOKYO/)[0]).toBeInTheDocument();
  });

  it('renders footer with email input and social links', () => {
    render(<Home />);

    const emailInput = screen.getByPlaceholderText(/ENTER YOUR EMAIL/i);
    expect(emailInput).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
  });

  it('has a menu button', () => {
    render(<Home />);

    // Find menu button (the one with Menu icon)
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find((btn) =>
      btn.querySelector('svg.lucide-menu'),
    );

    expect(menuButton).toBeInTheDocument();
  });
});

describe('Stash Cards', () => {
  it('renders gift cards with correct content', () => {
    render(<Home />);

    expect(screen.getByText('Frappé')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
    expect(screen.getByText('Gold Latte')).toBeInTheDocument();
    expect(screen.getByText('Baklava')).toBeInTheDocument();
  });

  it('renders prices on gift cards', () => {
    render(<Home />);

    expect(screen.getByText('$4.50')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
    expect(screen.getByText('$24.00')).toBeInTheDocument();
    expect(screen.getByText('$9.00')).toBeInTheDocument();
  });

  it('renders location badges on cards', () => {
    render(<Home />);

    expect(screen.getByText('ATHENS')).toBeInTheDocument();
    expect(screen.getAllByText('PARIS')[0]).toBeInTheDocument();
    expect(screen.getByText('DUBAI')).toBeInTheDocument();
    expect(screen.getAllByText('ISTANBUL')[0]).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('has proper heading hierarchy', () => {
    render(<Home />);

    // There should be h1, h2, h3 elements
    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    const h2Elements = screen.getAllByRole('heading', { level: 2 });

    expect(h1Elements.length).toBeGreaterThan(0);
    expect(h2Elements.length).toBeGreaterThan(0);
  });

  it('has accessible buttons', () => {
    render(<Home />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

describe('Turkish Language Support', () => {
  it('displays Turkish content when language is switched', () => {
    render(<Home />);

    // Click language toggle
    const langButton = screen.getByRole('button', { name: /EN.*TR/i });
    fireEvent.click(langButton);

    // Check Turkish content
    expect(screen.getByText('GERÇEKLİK')).toBeInTheDocument();
    expect(screen.getByText('SIZIYOR.')).toBeInTheDocument();
    expect(screen.getByText("ZULA'YA GİR")).toBeInTheDocument();
  });
});
