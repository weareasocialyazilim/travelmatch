/**
 * SacredMoments & GiftVault Component Test Suite
 *
 * Tests the screenshot protection and gift vault components
 * that provide secure content viewing experiences.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { SacredMoments } from '../SacredMoments';
import { GiftVault } from '../GiftVault';

// Mock expo-screen-capture
const mockAddScreenshotListener = jest.fn();
const mockRemove = jest.fn();
mockAddScreenshotListener.mockReturnValue({ remove: mockRemove });

jest.mock('expo-screen-capture', () => ({
  usePreventScreenCapture: jest.fn(),
  addScreenshotListener: (callback: () => void) => {
    mockAddScreenshotListener(callback);
    return { remove: mockRemove };
  },
}));

// Mock HapticManager
jest.mock('@/services/HapticManager', () => ({
  HapticManager: {
    buttonPress: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    primaryAction: jest.fn(),
    giftReceived: jest.fn(),
  },
}));

// Mock expo-blur
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children, ...props }: any) =>
      React.createElement(View, { ...props, testID: 'blur-view' }, children),
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      React.createElement(
        View,
        { ...props, testID: 'linear-gradient' },
        children,
      ),
  };
});

// Mock expo-local-authentication
const mockAuthenticateAsync = jest.fn();
const mockHasHardwareAsync = jest.fn();
const mockIsEnrolledAsync = jest.fn();

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: (options: any) => mockAuthenticateAsync(options),
  hasHardwareAsync: () => mockHasHardwareAsync(),
  isEnrolledAsync: () => mockIsEnrolledAsync(),
}));

// react-native-reanimated is mocked globally via moduleNameMapper

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: (props: any) =>
      React.createElement(View, { ...props, testID: `icon-${props.name}` }),
  };
});

// Sample experiences for testing
const sampleExperiences = [
  {
    id: '1',
    proofUrls: ['https://example.com/image1.jpg'],
    momentTitle: 'Sunset Beach Walk',
    giverName: 'Ahmet',
    completedAt: new Date('2024-01-15'),
    isShared: true,
  },
  {
    id: '2',
    proofUrls: ['https://example.com/image2.jpg'],
    momentTitle: 'Mountain Hike',
    giverName: 'Ayşe',
    completedAt: new Date('2024-01-20'),
    isShared: false,
  },
  {
    id: '3',
    proofUrls: [],
    momentTitle: 'City Tour',
    giverName: 'Mehmet',
    completedAt: new Date('2024-01-25'),
    isShared: false,
  },
];

describe('SacredMoments Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const { getByTestId } = render(
        <SacredMoments testID="sacred-moments">
          <Text>Protected Content</Text>
        </SacredMoments>,
      );
      expect(getByTestId('sacred-moments')).toBeTruthy();
    });

    it('renders children correctly', () => {
      const { getByText } = render(
        <SacredMoments>
          <Text>Test Child Content</Text>
        </SacredMoments>,
      );
      expect(getByText('Test Child Content')).toBeTruthy();
    });

    it('renders with custom protection message', () => {
      const customMessage = 'This is a custom protection message';
      const { getByTestId } = render(
        <SacredMoments
          protectionMessage={customMessage}
          testID="sacred-moments"
        >
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(getByTestId('sacred-moments')).toBeTruthy();
    });
  });

  // ============================================
  // Screenshot Listener Tests
  // ============================================

  describe('Screenshot Listener', () => {
    it('sets up screenshot listener when enabled', () => {
      render(
        <SacredMoments enabled>
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(mockAddScreenshotListener).toHaveBeenCalled();
    });

    it('does not set up listener when disabled', () => {
      mockAddScreenshotListener.mockClear();
      render(
        <SacredMoments enabled={false}>
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(mockAddScreenshotListener).not.toHaveBeenCalled();
    });

    it('removes listener on unmount', () => {
      const { unmount } = render(
        <SacredMoments enabled>
          <Text>Content</Text>
        </SacredMoments>,
      );
      unmount();
      expect(mockRemove).toHaveBeenCalled();
    });

    it('calls onScreenshotAttempt callback when screenshot detected', () => {
      const onScreenshotAttempt = jest.fn();
      render(
        <SacredMoments onScreenshotAttempt={onScreenshotAttempt}>
          <Text>Content</Text>
        </SacredMoments>,
      );

      // Simulate screenshot
      const callback = mockAddScreenshotListener.mock.calls[0][0];
      callback();

      expect(onScreenshotAttempt).toHaveBeenCalledTimes(1);
    });

    it('triggers haptic feedback on screenshot', () => {
      const { HapticManager } = require('@/services/HapticManager');
      render(
        <SacredMoments>
          <Text>Content</Text>
        </SacredMoments>,
      );

      // Simulate screenshot
      const callback = mockAddScreenshotListener.mock.calls[0][0];
      callback();

      expect(HapticManager.warning).toHaveBeenCalled();
    });
  });

  // ============================================
  // Vault Mode Tests
  // ============================================

  describe('Vault Mode', () => {
    it('renders vault indicator when vaultMode is true', () => {
      const { getByText } = render(
        <SacredMoments vaultMode>
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(getByText('Korumalı')).toBeTruthy();
    });

    it('does not render vault indicator when vaultMode is false', () => {
      const { queryByText } = render(
        <SacredMoments vaultMode={false}>
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(queryByText('Korumalı')).toBeNull();
    });

    it('uses usePreventScreenCapture hook in vault mode', () => {
      const { usePreventScreenCapture } = require('expo-screen-capture');
      render(
        <SacredMoments vaultMode enabled>
          <Text>Content</Text>
        </SacredMoments>,
      );
      // When vaultMode && enabled, it's called with 'sacred-moments'
      expect(usePreventScreenCapture).toHaveBeenCalledWith('sacred-moments');
    });
  });

  // ============================================
  // Share Option Tests
  // ============================================

  describe('Share Option', () => {
    it('renders share button when showShareOption is true', () => {
      const { getByText } = render(
        <SacredMoments showShareOption>
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(getByText('Dünyayla Paylaş')).toBeTruthy();
    });

    it('does not render share button when showShareOption is false', () => {
      const { queryByText } = render(
        <SacredMoments showShareOption={false}>
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(queryByText('Dünyayla Paylaş')).toBeNull();
    });

    it('calls onShare when share button is pressed', () => {
      const onShare = jest.fn();
      const { getByText } = render(
        <SacredMoments showShareOption onShare={onShare}>
          <Text>Content</Text>
        </SacredMoments>,
      );

      fireEvent.press(getByText('Dünyayla Paylaş'));
      expect(onShare).toHaveBeenCalledTimes(1);
    });

    it('renders watermark when showShareOption is true', () => {
      const { getByText } = render(
        <SacredMoments showShareOption>
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(getByText('Lovendo')).toBeTruthy();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================

  describe('Accessibility', () => {
    it('has accessible label for container', () => {
      const { getByLabelText } = render(
        <SacredMoments>
          <Text>Content</Text>
        </SacredMoments>,
      );
      expect(getByLabelText('Korunan içerik')).toBeTruthy();
    });
  });
});

describe('GiftVault Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasHardwareAsync.mockResolvedValue(true);
    mockIsEnrolledAsync.mockResolvedValue(true);
    mockAuthenticateAsync.mockResolvedValue({ success: true });
  });

  // ============================================
  // Basic Rendering Tests
  // ============================================

  describe('Basic Rendering', () => {
    it('renders locked state by default', () => {
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          onExperienceSelect={jest.fn()}
          testID="gift-vault"
        />,
      );
      expect(getByText('Anı Kasası')).toBeTruthy();
    });

    it('renders with testID', () => {
      const { getByTestId } = render(
        <GiftVault
          experiences={sampleExperiences}
          onExperienceSelect={jest.fn()}
          testID="gift-vault"
        />,
      );
      expect(getByTestId('gift-vault')).toBeTruthy();
    });

    it('shows experience count for premium users', () => {
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );
      expect(getByText('3 özel anı güvenli kasanızda')).toBeTruthy();
    });

    it('shows premium upsell message for non-premium users', () => {
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={false}
          onExperienceSelect={jest.fn()}
        />,
      );
      expect(getByText('Premium ile anılarınızı şifreleyin')).toBeTruthy();
    });
  });

  // ============================================
  // Premium vs Non-Premium States
  // ============================================

  describe('Premium States', () => {
    it('shows fingerprint icon for premium users', () => {
      const { getAllByTestId } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );
      // Multiple fingerprint icons may be rendered for each experience
      expect(getAllByTestId('icon-fingerprint').length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it('shows crown icon for non-premium users', () => {
      const { getAllByTestId } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={false}
          onExperienceSelect={jest.fn()}
        />,
      );
      // Multiple crown icons may be rendered for each experience
      expect(getAllByTestId('icon-crown').length).toBeGreaterThanOrEqual(1);
    });

    it('shows "Kasayı Aç" text for premium users', () => {
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );
      expect(getByText('Kasayı Aç')).toBeTruthy();
    });

    it('shows "Premium\'a Geç" text for non-premium users', () => {
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={false}
          onExperienceSelect={jest.fn()}
        />,
      );
      expect(getByText("Premium'a Geç")).toBeTruthy();
    });

    it('calls onPremiumUpsell for non-premium users when unlock pressed', () => {
      const onPremiumUpsell = jest.fn();
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={false}
          onExperienceSelect={jest.fn()}
          onPremiumUpsell={onPremiumUpsell}
        />,
      );

      fireEvent.press(getByText("Premium'a Geç"));
      expect(onPremiumUpsell).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Biometric Authentication Tests
  // ============================================

  describe('Biometric Authentication', () => {
    it('authenticates when unlock button pressed for premium users', async () => {
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        expect(mockAuthenticateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            promptMessage: 'Anı Kasanızı Açın',
          }),
        );
      });
    });

    it('unlocks vault on successful authentication', async () => {
      mockAuthenticateAsync.mockResolvedValue({ success: true });

      const { getByText, queryByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(
        () => {
          expect(queryByText('Kasayı Aç')).toBeNull();
        },
        { timeout: 1000 },
      );
    });

    it('does not unlock vault on failed authentication', async () => {
      mockAuthenticateAsync.mockResolvedValue({ success: false });

      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        expect(getByText('Kasayı Aç')).toBeTruthy();
      });
    });

    it('falls back to simple unlock when no biometric hardware', async () => {
      mockHasHardwareAsync.mockResolvedValue(false);

      const { getByText, queryByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        expect(mockAuthenticateAsync).not.toHaveBeenCalled();
        expect(queryByText('Kasayı Aç')).toBeNull();
      });
    });

    it('falls back when biometrics not enrolled', async () => {
      mockHasHardwareAsync.mockResolvedValue(true);
      mockIsEnrolledAsync.mockResolvedValue(false);

      const { getByText, queryByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        expect(mockAuthenticateAsync).not.toHaveBeenCalled();
        expect(queryByText('Kasayı Aç')).toBeNull();
      });
    });

    it('triggers success haptic on unlock', async () => {
      const { HapticManager } = require('@/services/HapticManager');
      mockAuthenticateAsync.mockResolvedValue({ success: true });

      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        expect(HapticManager.giftReceived).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // Unlocked State Tests
  // ============================================

  describe('Unlocked State', () => {
    const unlockVault = async (getByText: any) => {
      mockAuthenticateAsync.mockResolvedValue({ success: true });
      fireEvent.press(getByText('Kasayı Aç'));
      await waitFor(() => {}, { timeout: 500 });
    };

    it('shows experiences grid after unlock', async () => {
      const { getByText, getAllByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      await unlockVault(getByText);

      await waitFor(() => {
        expect(getByText('Sunset Beach Walk')).toBeTruthy();
        expect(getByText('Mountain Hike')).toBeTruthy();
      });
    });

    it('calls onExperienceSelect when experience card pressed', async () => {
      const onExperienceSelect = jest.fn();
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={onExperienceSelect}
        />,
      );

      await unlockVault(getByText);

      await waitFor(() => {
        fireEvent.press(getByText('Sunset Beach Walk'));
        expect(onExperienceSelect).toHaveBeenCalledWith('1');
      });
    });

    it('shows lock button in header when unlocked', async () => {
      const { getByText, getByTestId } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      await unlockVault(getByText);

      await waitFor(() => {
        expect(getByTestId('icon-lock')).toBeTruthy();
      });
    });

    it('shows shared badge on shared experiences', async () => {
      const { getByText, getByTestId } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      await unlockVault(getByText);

      await waitFor(() => {
        expect(getByTestId('icon-earth')).toBeTruthy();
      });
    });
  });

  // ============================================
  // Empty State Tests
  // ============================================

  describe('Empty State', () => {
    it('shows empty state when no experiences', async () => {
      mockHasHardwareAsync.mockResolvedValue(false);

      const { getByText } = render(
        <GiftVault
          experiences={[]}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        expect(getByText('Henüz anı yok')).toBeTruthy();
      });
    });

    it('shows hint text in empty state', async () => {
      mockHasHardwareAsync.mockResolvedValue(false);

      const { getByText } = render(
        <GiftVault
          experiences={[]}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        expect(
          getByText('Deneyimlerinizi tamamladığınızda burada görünecek'),
        ).toBeTruthy();
      });
    });
  });

  // ============================================
  // Feature List Tests
  // ============================================

  describe('Feature List', () => {
    it('shows all vault features in locked state', () => {
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={false}
          onExperienceSelect={jest.fn()}
        />,
      );

      expect(getByText('Şifreli Depolama')).toBeTruthy();
      expect(getByText('Biyometrik Kilit')).toBeTruthy();
      expect(getByText('Screenshot Koruması')).toBeTruthy();
    });

    it('shows security badge', () => {
      const { getByText } = render(
        <GiftVault
          experiences={sampleExperiences}
          onExperienceSelect={jest.fn()}
        />,
      );

      expect(getByText('Uçtan uca şifreli')).toBeTruthy();
    });
  });

  // ============================================
  // Lock/Unlock Toggle Tests
  // ============================================

  describe('Lock/Unlock Toggle', () => {
    it('can lock vault after unlocking', async () => {
      mockHasHardwareAsync.mockResolvedValue(false);

      const { getByText, getByTestId } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      // Unlock
      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        expect(getByTestId('icon-lock')).toBeTruthy();
      });

      // Lock again
      fireEvent.press(getByTestId('icon-lock'));

      await waitFor(() => {
        expect(getByText('Kasayı Aç')).toBeTruthy();
      });
    });

    it('triggers light haptic when locking', async () => {
      const { HapticManager } = require('@/services/HapticManager');
      mockHasHardwareAsync.mockResolvedValue(false);

      const { getByText, getAllByTestId } = render(
        <GiftVault
          experiences={sampleExperiences}
          isPremium={true}
          onExperienceSelect={jest.fn()}
        />,
      );

      fireEvent.press(getByText('Kasayı Aç'));

      await waitFor(() => {
        const lockIcons = getAllByTestId('icon-lock');
        fireEvent.press(lockIcons[0]);
        expect(HapticManager.buttonPress).toHaveBeenCalled();
      });
    });
  });
});
