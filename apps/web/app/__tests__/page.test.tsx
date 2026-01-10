import * as React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

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

import Home from '../page';

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Home Page - Immersive Redesign', () => {
  beforeEach(() => {
    render(<Home />);
  });

  describe('Hero Section', () => {
    it('renders the hero title', () => {
      expect(screen.getByText('REALITY')).toBeInTheDocument();
      expect(screen.getByText('LEAKS.')).toBeInTheDocument();
    });

    it('renders the brand name', () => {
      expect(screen.getByText('travelmatch.')).toBeInTheDocument();
    });
  });

  describe('Stash Section', () => {
    it('renders THE STASH title', () => {
      expect(screen.getByText('THE')).toBeInTheDocument();
      expect(screen.getByText('STASH')).toBeInTheDocument();
    });

    it('renders gift items', () => {
      expect(screen.getByText('Frappé')).toBeInTheDocument();
      expect(screen.getByText('Croissant')).toBeInTheDocument();
      expect(screen.getByText('Gold Latte')).toBeInTheDocument();
    });
  });

  describe('Manifesto Section', () => {
    it('renders the manifesto content', () => {
      expect(screen.getAllByText(/We reject the/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText('Metaverse.')[0]).toBeInTheDocument();
    });
  });

  describe('Footer Section', () => {
    it('renders email input', () => {
      expect(
        screen.getByPlaceholderText(/ENTER YOUR EMAIL/i),
      ).toBeInTheDocument();
    });

    it('renders social links', () => {
      expect(screen.getByText('Instagram')).toBeInTheDocument();
      expect(screen.getByText('TikTok')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders language switcher', () => {
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('TR')).toBeInTheDocument();
    });
  });

  describe('City Marquee', () => {
    it('renders city names', () => {
      expect(screen.getAllByText(/ISTANBUL/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/PARIS/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TOKYO/i).length).toBeGreaterThan(0);
    });
  });
});
