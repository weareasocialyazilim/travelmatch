/**
 * Skeleton Component Test Suite
 * Tests for TMSkeleton and exported skeleton components
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import {
  TMSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonMessage,
  SkeletonList,
  ScreenSkeleton,
} from '../TMSkeleton';

describe('TMSkeleton Component', () => {
  describe('Base Skeleton', () => {
    it('renders without props', () => {
      const { toJSON } = render(<Skeleton />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom width and height', () => {
      const { toJSON } = render(<Skeleton width={200} height={40} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with percentage width', () => {
      const { toJSON } = render(<Skeleton width="50%" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with custom border radius', () => {
      const { toJSON } = render(<Skeleton borderRadius={16} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('TMSkeleton Types', () => {
    it('renders base type', () => {
      const { toJSON } = render(
        <TMSkeleton type="base" width={100} height={20} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders avatar type', () => {
      const { toJSON } = render(<TMSkeleton type="avatar" size={48} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders text type', () => {
      const { toJSON } = render(<TMSkeleton type="text" lines={3} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders card type', () => {
      const { toJSON } = render(<TMSkeleton type="card" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders message type', () => {
      const { toJSON } = render(<TMSkeleton type="message" />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders list type', () => {
      const { toJSON } = render(
        <TMSkeleton type="list" listType="chat" count={3} />,
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders screen type', () => {
      const { toJSON } = render(
        <TMSkeleton type="screen" screenType="profile" />,
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Skeleton Presets', () => {
    it('renders SkeletonAvatar', () => {
      const { toJSON } = render(<SkeletonAvatar size={48} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders SkeletonText', () => {
      const { toJSON } = render(<SkeletonText lines={3} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders SkeletonCard', () => {
      const { toJSON } = render(<SkeletonCard />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders SkeletonMessage', () => {
      const { toJSON } = render(<SkeletonMessage />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders SkeletonMessage as own message', () => {
      const { toJSON } = render(<SkeletonMessage isOwn />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('SkeletonList', () => {
    const listTypes = [
      'chat',
      'moment',
      'gift',
      'transaction',
      'notification',
      'request',
      'trip',
    ] as const;

    listTypes.forEach((type) => {
      it(`renders ${type} list type`, () => {
        const { toJSON } = render(<SkeletonList type={type} count={2} />);
        expect(toJSON()).toBeTruthy();
      });
    });

    it('renders with show prop true', () => {
      const { toJSON } = render(<SkeletonList type="chat" show={true} />);
      expect(toJSON()).toBeTruthy();
    });

    it('does not render when show prop is false', () => {
      const { toJSON } = render(<SkeletonList type="chat" show={false} />);
      // When show is false, component should return null or empty
      const json = toJSON();
      const hasChildren =
        json && typeof json === 'object' && 'children' in json && json.children;
      expect(hasChildren).toBeFalsy();
    });
  });

  describe('ScreenSkeleton', () => {
    it('renders with default props', () => {
      const { toJSON } = render(<ScreenSkeleton />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with header', () => {
      const { toJSON } = render(<ScreenSkeleton showHeader />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with tab bar', () => {
      const { toJSON } = render(<ScreenSkeleton showTabBar />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with content type', () => {
      const { toJSON } = render(<ScreenSkeleton contentType="grid" />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
