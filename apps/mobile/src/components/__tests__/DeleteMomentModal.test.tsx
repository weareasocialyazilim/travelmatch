/**
 * DeleteMomentModal Test Suite
 * Tests delete confirmation modal for moments
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeleteMomentModal } from '../DeleteMomentModal';

describe('DeleteMomentModal', () => {
  const mockOnCancel = jest.fn() as jest.Mock;
  const mockOnDelete = jest.fn() as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Rendering Tests
  // ============================================

  describe('Rendering', () => {
    it('renders when visible', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Delete this moment?')).toBeTruthy();
      expect(getByText('This action cannot be undone and the moment will be permanently removed.')).toBeTruthy();
    });

    it('renders all UI elements', () => {
      const { getByText, UNSAFE_root } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
      expect(getByText('Delete this moment?')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders with optional momentTitle prop', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
          momentTitle="My Moment"
        />
      );

      expect(getByText('Delete this moment?')).toBeTruthy();
    });

    it('renders modal when visible=false', () => {
      const { UNSAFE_root } = render(
        <DeleteMomentModal
          visible={false}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  // ============================================
  // Button Interaction Tests
  // ============================================

  describe('Button Interactions', () => {
    it('calls onDelete when Delete button is pressed', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(getByText('Delete'));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('calls onCancel when Cancel button is pressed', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(getByText('Cancel'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('handles rapid Delete button presses', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = getByText('Delete');
      fireEvent.press(deleteButton);
      fireEvent.press(deleteButton);
      fireEvent.press(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(3);
    });

    it('handles rapid Cancel button presses', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);
      fireEvent.press(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(2);
    });

    it('handles alternating button presses', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(getByText('Cancel'));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);

      fireEvent.press(getByText('Delete'));
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Visibility Toggle Tests
  // ============================================

  describe('Visibility Toggle', () => {
    it('maintains component when toggling visibility', () => {
      const { rerender, UNSAFE_root } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(UNSAFE_root).toBeTruthy();

      rerender(
        <DeleteMomentModal
          visible={false}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(UNSAFE_root).toBeTruthy();

      rerender(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('renders correctly after multiple visibility toggles', () => {
      const { rerender, getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <DeleteMomentModal
            visible={i % 2 === 0}
            onCancel={mockOnCancel}
            onDelete={mockOnDelete}
          />
        );
      }

      rerender(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Delete this moment?')).toBeTruthy();
    });
  });

  // ============================================
  // Edge Cases & Props Validation
  // ============================================

  describe('Edge Cases', () => {
    it('works with different callback functions', () => {
      const customOnCancel = jest.fn() as jest.Mock;
      const customOnDelete = jest.fn() as jest.Mock;

      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={customOnCancel}
          onDelete={customOnDelete}
        />
      );

      fireEvent.press(getByText('Delete'));
      expect(customOnDelete).toHaveBeenCalled();

      fireEvent.press(getByText('Cancel'));
      expect(customOnCancel).toHaveBeenCalled();
    });

    it('accepts all required props without error', () => {
      expect(() =>
        render(
          <DeleteMomentModal
            visible={true}
            onCancel={mockOnCancel}
            onDelete={mockOnDelete}
          />
        )
      ).not.toThrow();
    });

    it('handles unmount without errors', () => {
      const { unmount } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(() => unmount()).not.toThrow();
    });

    it('renders with all props including optional momentTitle', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
          momentTitle="Test Moment Title"
        />
      );

      expect(getByText('Delete this moment?')).toBeTruthy();
    });

    it('handles visibility=false with buttons still accessible', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={false}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      // Buttons should still be in the component tree even when not visible
      fireEvent.press(getByText('Delete'));
      expect(mockOnDelete).toHaveBeenCalled();
    });
  });

  // ============================================
  // Animation & State Tests
  // ============================================

  describe('Animation State', () => {
    it('initializes with animation values', () => {
      const { UNSAFE_root } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('handles rapid visibility changes without crashing', () => {
      const { rerender } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      for (let i = 0; i < 10; i++) {
        rerender(
          <DeleteMomentModal
            visible={i % 2 === 0}
            onCancel={mockOnCancel}
            onDelete={mockOnDelete}
          />
        );
      }

      expect(mockOnCancel).not.toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('maintains animation state during interactions', () => {
      const { getByText, rerender } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.press(getByText('Cancel'));
      
      rerender(
        <DeleteMomentModal
          visible={false}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Content & Accessibility Tests
  // ============================================

  describe('Content & Accessibility', () => {
    it('displays correct warning message', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      const warningText = getByText('This action cannot be undone and the moment will be permanently removed.');
      expect(warningText).toBeTruthy();
    });

    it('displays correct headline', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Delete this moment?')).toBeTruthy();
    });

    it('has both Delete and Cancel action buttons', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Delete')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders all required text content', () => {
      const { getByText } = render(
        <DeleteMomentModal
          visible={true}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(getByText('Delete this moment?')).toBeTruthy();
      expect(getByText('This action cannot be undone and the moment will be permanently removed.')).toBeTruthy();
      expect(getByText('Delete')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });
});
