import React from 'react';
import { render } from '@testing-library/react-native';
import {
  TrustBadgeDisplay,
  getTrustBadgeLevel,
  getTrustBadgeLabel,
} from '../TrustBadgeDisplay';

describe('TrustBadgeDisplay', () => {
  it('renders correctly with bronze level', () => {
    const { getByText } = render(
      <TrustBadgeDisplay level="bronze" score={25} />
    );

    expect(getByText('25')).toBeTruthy();
    expect(getByText('Trust Score')).toBeTruthy();
  });

  it('renders correctly with silver level', () => {
    const { getByText } = render(
      <TrustBadgeDisplay level="silver" score={55} />
    );

    expect(getByText('55')).toBeTruthy();
  });

  it('renders correctly with gold level', () => {
    const { getByText } = render(
      <TrustBadgeDisplay level="gold" score={75} />
    );

    expect(getByText('75')).toBeTruthy();
  });

  it('renders correctly with platinum level', () => {
    const { getByText } = render(
      <TrustBadgeDisplay level="platinum" score={95} />
    );

    expect(getByText('95')).toBeTruthy();
  });
});

describe('getTrustBadgeLevel', () => {
  it('returns bronze for scores 0-49', () => {
    expect(getTrustBadgeLevel(0)).toBe('bronze');
    expect(getTrustBadgeLevel(25)).toBe('bronze');
    expect(getTrustBadgeLevel(49)).toBe('bronze');
  });

  it('returns silver for scores 50-69', () => {
    expect(getTrustBadgeLevel(50)).toBe('silver');
    expect(getTrustBadgeLevel(60)).toBe('silver');
    expect(getTrustBadgeLevel(69)).toBe('silver');
  });

  it('returns gold for scores 70-89', () => {
    expect(getTrustBadgeLevel(70)).toBe('gold');
    expect(getTrustBadgeLevel(80)).toBe('gold');
    expect(getTrustBadgeLevel(89)).toBe('gold');
  });

  it('returns platinum for scores 90-100', () => {
    expect(getTrustBadgeLevel(90)).toBe('platinum');
    expect(getTrustBadgeLevel(95)).toBe('platinum');
    expect(getTrustBadgeLevel(100)).toBe('platinum');
  });
});

describe('getTrustBadgeLabel', () => {
  it('returns correct Turkish labels for each level', () => {
    expect(getTrustBadgeLabel('bronze')).toBe('Bronz');
    expect(getTrustBadgeLabel('silver')).toBe('Gümüş');
    expect(getTrustBadgeLabel('gold')).toBe('Altın');
    expect(getTrustBadgeLabel('platinum')).toBe('Platin');
  });
});
