/**
 * ProfileScreen Test Suite
 * Tests for user profile screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ProfileScreen from '@/screens/ProfileScreen';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useProfile');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('ProfileScreen', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Travel enthusiast',
    location: 'Los Angeles, CA',
    joinedDate: '2024-01-01',
    stats: {
      momentsCreated: 15,
      momentsJoined: 42,
      followers: 123,
      following: 89,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: jest.fn(),
    });
    
    useProfile.mockReturnValue({
      profile: mockUser,
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
    });
  });

  describe('Basic Rendering', () => {
    it('should render profile screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByTestID('profile-screen')).toBeTruthy();
    });

    it('should render user info', () => {
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
      expect(getByText('Travel enthusiast')).toBeTruthy();
      expect(getByText('Los Angeles, CA')).toBeTruthy();
    });

    it('should render user avatar', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      const avatar = getByTestID('user-avatar');
      expect(avatar.props.source.uri).toBe('https://example.com/avatar.jpg');
    });

    it('should render user stats', () => {
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('15')).toBeTruthy(); // moments created
      expect(getByText('42')).toBeTruthy(); // moments joined
      expect(getByText('123')).toBeTruthy(); // followers
      expect(getByText('89')).toBeTruthy(); // following
    });
  });

  describe('Edit Profile', () => {
    it('should show edit button for own profile', () => {
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('Edit Profile')).toBeTruthy();
    });

    it('should navigate to edit screen on edit press', () => {
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Edit Profile'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('EditProfile');
    });

    it('should not show edit button for other users profile', () => {
      const { queryByText } = render(
        <NavigationContainer>
          <ProfileScreen
            navigation={mockNavigation}
            route={{ params: { userId: 'other-user' } }}
          />
        </NavigationContainer>
      );
      
      expect(queryByText('Edit Profile')).toBeNull();
    });
  });

  describe('Settings', () => {
    it('should show settings button', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByTestID('settings-button')).toBeTruthy();
    });

    it('should navigate to settings on button press', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('settings-button'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Settings');
    });
  });

  describe('Moments Tabs', () => {
    it('should show created and joined tabs', () => {
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('Created')).toBeTruthy();
      expect(getByText('Joined')).toBeTruthy();
    });

    it('should switch between tabs', () => {
      const { getByText, getByTestID } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Joined'));
      
      expect(getByTestID('joined-moments-list')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator', () => {
      useProfile.mockReturnValue({
        profile: null,
        isLoading: true,
        error: null,
        updateProfile: jest.fn(),
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByTestID('loading-indicator')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message', () => {
      useProfile.mockReturnValue({
        profile: null,
        isLoading: false,
        error: new Error('Failed to load profile'),
        updateProfile: jest.fn(),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('Failed to load profile')).toBeTruthy();
    });
  });

  describe('Logout', () => {
    it('should show logout button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByText('Logout')).toBeTruthy();
    });

    it('should call logout on button press', async () => {
      const logout = jest.fn().mockResolvedValue({});
      useAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        logout,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Logout'));
      
      await waitFor(() => {
        expect(logout).toHaveBeenCalled();
      });
    });

    it('should show confirmation before logout', () => {
      const { getByText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Logout'));
      
      expect(getByText('Are you sure you want to logout?')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels', () => {
      const { getByLabelText } = render(
        <NavigationContainer>
          <ProfileScreen navigation={mockNavigation} route={{ params: {} }} />
        </NavigationContainer>
      );
      
      expect(getByLabelText('Profile screen')).toBeTruthy();
      expect(getByLabelText('User avatar')).toBeTruthy();
    });
  });
});
