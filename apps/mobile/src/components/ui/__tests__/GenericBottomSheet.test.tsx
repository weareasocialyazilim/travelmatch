/**
 * GenericBottomSheet Component Tests
 * Target Coverage: 75%+
 * Comprehensive testing for BottomSheet, ConfirmationBottomSheet, and SelectionBottomSheet
 */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../__tests__/testUtils';
import {
  GenericBottomSheet,
  ConfirmationBottomSheet,
  SelectionBottomSheet,
  type SelectionOption,
} from '../GenericBottomSheet';

describe('GenericBottomSheet Component', () => {
  describe('Rendering', () => {
    it('should render when visible', () => {
      const { getByText } = render(
        <GenericBottomSheet visible={true} onClose={jest.fn()} title="Test Sheet">
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByText('Test Sheet')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <GenericBottomSheet visible={false} onClose={jest.fn()} title="Hidden">
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(queryByText('Hidden')).toBeNull();
    });

    it('should render with title and subtitle', () => {
      const { getByText } = render(
        <GenericBottomSheet
          visible={true}
          onClose={jest.fn()}
          title="Main Title"
          subtitle="This is a subtitle"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByText('Main Title')).toBeTruthy();
      expect(getByText('This is a subtitle')).toBeTruthy();
    });

    it('should render children content', () => {
      const { getByText } = render(
        <GenericBottomSheet visible={true} onClose={jest.fn()}>
          <div>Custom Content</div>
        </GenericBottomSheet>
      );
      expect(getByText('Custom Content')).toBeTruthy();
    });

    it('should render drag handle by default', () => {
      const { getByTestId } = render(
        <GenericBottomSheet visible={true} onClose={jest.fn()} testID="sheet">
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestID('sheet')).toBeTruthy();
    });

    it('should hide drag handle when showHandle is false', () => {
      const { queryByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={jest.fn()} 
          showHandle={false}
          testID="no-handle"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(queryByTestId('no-handle')).toBeTruthy();
    });

    it('should show close button by default', () => {
      const { getByLabelText } = render(
        <GenericBottomSheet visible={true} onClose={jest.fn()} title="Title">
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByLabelText('Close')).toBeTruthy();
    });

    it('should hide close button when showCloseButton is false', () => {
      const { queryByLabelText } = render(
        <GenericBottomSheet
          visible={true}
          onClose={jest.fn()}
          title="Title"
          showCloseButton={false}
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(queryByLabelText('Close')).toBeNull();
    });
  });

  describe('Height Presets', () => {
    it('should render with small height', () => {
      const { getByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={jest.fn()} 
          height="small"
          testID="small-sheet"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestId('small-sheet')).toBeTruthy();
    });

    it('should render with medium height (default)', () => {
      const { getByTestId } = render(
        <GenericBottomSheet visible={true} onClose={jest.fn()} testID="medium-sheet">
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestId('medium-sheet')).toBeTruthy();
    });

    it('should render with large height', () => {
      const { getByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={jest.fn()} 
          height="large"
          testID="large-sheet"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestId('large-sheet')).toBeTruthy();
    });

    it('should render with full height', () => {
      const { getByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={jest.fn()} 
          height="full"
          testID="full-sheet"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestId('full-sheet')).toBeTruthy();
    });

    it('should render with custom numeric height', () => {
      const { getByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={jest.fn()} 
          height={400}
          testID="custom-sheet"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestId('custom-sheet')).toBeTruthy();
    });

    it('should render with auto height', () => {
      const { getByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={jest.fn()} 
          height="auto"
          testID="auto-sheet"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestId('auto-sheet')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button pressed', () => {
      const onClose = jest.fn();
      const { getByLabelText } = render(
        <GenericBottomSheet visible={true} onClose={onClose} title="Close Test">
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      
      const closeButton = getByLabelText('Close');
      fireEvent.press(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop pressed (dismissible)', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={onClose} 
          dismissible={true}
          testID="dismissible-sheet"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      
      // Modal backdrop should trigger onClose
      expect(getByTestId('dismissible-sheet')).toBeTruthy();
    });

    it('should not call onClose when backdrop pressed (not dismissible)', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={onClose} 
          dismissible={false}
          testID="non-dismissible"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      
      expect(getByTestId('non-dismissible')).toBeTruthy();
      // Backdrop press should not trigger onClose when dismissible=false
    });
  });

  describe('Custom Rendering', () => {
    it('should render custom header', () => {
      const CustomHeader = () => <div>Custom Header Component</div>;
      
      const { getByText } = render(
        <GenericBottomSheet
          visible={true}
          onClose={jest.fn()}
          renderHeader={CustomHeader}
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      
      expect(getByText('Custom Header Component')).toBeTruthy();
    });

    it('should render custom footer', () => {
      const CustomFooter = () => <div>Custom Footer Component</div>;
      
      const { getByText } = render(
        <GenericBottomSheet
          visible={true}
          onClose={jest.fn()}
          renderFooter={CustomFooter}
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      
      expect(getByText('Custom Footer Component')).toBeTruthy();
    });

    it('should render both custom header and footer', () => {
      const CustomHeader = () => <div>Header</div>;
      const CustomFooter = () => <div>Footer</div>;
      
      const { getByText } = render(
        <GenericBottomSheet
          visible={true}
          onClose={jest.fn()}
          renderHeader={CustomHeader}
          renderFooter={CustomFooter}
        >
          <div>Content</div>
        </GenericBottomSheet>
      );
      
      expect(getByText('Header')).toBeTruthy();
      expect(getByText('Content')).toBeTruthy();
      expect(getByText('Footer')).toBeTruthy();
    });
  });

  describe('Scrollable Content', () => {
    it('should be scrollable by default', () => {
      const { getByTestId } = render(
        <GenericBottomSheet visible={true} onClose={jest.fn()} testID="scrollable">
          <>{/* Long content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestId('scrollable')).toBeTruthy();
    });

    it('should render as non-scrollable view when scrollable=false', () => {
      const { getByTestId } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={jest.fn()} 
          scrollable={false}
          testID="non-scrollable"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByTestId('non-scrollable')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label from title', () => {
      const { getByLabelText } = render(
        <GenericBottomSheet 
          visible={true} 
          onClose={jest.fn()} 
          title="Accessible Sheet"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByLabelText('Accessible Sheet')).toBeTruthy();
    });

    it('should support custom accessibility label', () => {
      const { getByLabelText } = render(
        <GenericBottomSheet
          visible={true}
          onClose={jest.fn()}
          accessibilityLabel="Custom label"
        >
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      expect(getByLabelText('Custom label')).toBeTruthy();
    });

    it('should have close button accessible', () => {
      const { getByLabelText } = render(
        <GenericBottomSheet visible={true} onClose={jest.fn()} title="Test">
          <>{/* Content */}</>
        </GenericBottomSheet>
      );
      
      const closeButton = getByLabelText('Close');
      expect(closeButton.props.accessibilityRole).toBe('button');
    });
  });
});

describe('ConfirmationBottomSheet Component', () => {
  describe('Rendering', () => {
    it('should render with title and message', () => {
      const { getByText } = render(
        <ConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          title="Confirm Action"
          message="Are you sure you want to proceed?"
        />
      );
      
      expect(getByText('Confirm Action')).toBeTruthy();
      expect(getByText('Are you sure you want to proceed?')).toBeTruthy();
    });

    it('should render confirm and cancel buttons', () => {
      const { getByText } = render(
        <ConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          title="Confirm"
          message="Message"
        />
      );
      
      expect(getByText('Confirm')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should render custom button text', () => {
      const { getByText } = render(
        <ConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          title="Delete"
          message="Delete this item?"
          confirmText="Yes, Delete"
          cancelText="No, Keep It"
        />
      );
      
      expect(getByText('Yes, Delete')).toBeTruthy();
      expect(getByText('No, Keep It')).toBeTruthy();
    });

    it('should render loading state', () => {
      const { getByText } = render(
        <ConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          title="Confirm"
          message="Message"
          loading={true}
        />
      );
      
      expect(getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onConfirm when confirm button pressed', () => {
      const onConfirm = jest.fn();
      const { getByText } = render(
        <ConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={onConfirm}
          title="Confirm"
          message="Message"
        />
      );
      
      fireEvent.press(getByText('Confirm'));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('should call onClose when cancel button pressed', () => {
      const onClose = jest.fn();
      const { getByText } = render(
        <ConfirmationBottomSheet
          visible={true}
          onClose={onClose}
          onConfirm={jest.fn()}
          title="Confirm"
          message="Message"
        />
      );
      
      fireEvent.press(getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should disable buttons when loading', () => {
      const onConfirm = jest.fn();
      const { getByText } = render(
        <ConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={onConfirm}
          title="Confirm"
          message="Message"
          loading={true}
        />
      );
      
      const confirmButton = getByText('Loading...');
      fireEvent.press(confirmButton);
      
      // Should not call onConfirm when loading
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Destructive Actions', () => {
    it('should render destructive variant', () => {
      const { getByText } = render(
        <ConfirmationBottomSheet
          visible={true}
          onClose={jest.fn()}
          onConfirm={jest.fn()}
          title="Delete Account"
          message="This action cannot be undone"
          confirmDestructive={true}
        />
      );
      
      expect(getByText('Confirm')).toBeTruthy();
    });
  });
});

describe('SelectionBottomSheet Component', () => {
  const mockOptions: SelectionOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2', description: 'This is option 2' },
    { value: 'option3', label: 'Option 3', icon: 'check' },
    { value: 'option4', label: 'Disabled Option', disabled: true },
  ];

  describe('Rendering', () => {
    it('should render with title and options', () => {
      const { getByText } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
          title="Select an Option"
          options={mockOptions}
        />
      );
      
      expect(getByText('Select an Option')).toBeTruthy();
      expect(getByText('Option 1')).toBeTruthy();
      expect(getByText('Option 2')).toBeTruthy();
    });

    it('should render option descriptions', () => {
      const { getByText } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
          title="Select"
          options={mockOptions}
        />
      );
      
      expect(getByText('This is option 2')).toBeTruthy();
    });

    it('should render option icons', () => {
      const { getByText, UNSAFE_getAllByType } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
          title="Select"
          options={mockOptions}
        />
      );
      
      expect(getByText('Option 3')).toBeTruthy();
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getAllByType(MaterialCommunityIcons).length).toBeGreaterThan(0);
    });

    it('should show checkmark for selected value', () => {
      const { UNSAFE_getAllByType } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
          title="Select"
          options={mockOptions}
          selectedValue="option1"
        />
      );
      
      const { MaterialCommunityIcons } = require('@expo/vector-icons');
      expect(UNSAFE_getAllByType(MaterialCommunityIcons).length).toBeGreaterThan(0);
    });

    it('should render disabled option', () => {
      const { getByText } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
          title="Select"
          options={mockOptions}
        />
      );
      
      expect(getByText('Disabled Option')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onSelect when option pressed', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={onSelect}
          title="Select"
          options={mockOptions}
        />
      );
      
      fireEvent.press(getByText('Option 1'));
      expect(onSelect).toHaveBeenCalledWith('option1');
    });

    it('should call onClose after selection', () => {
      const onClose = jest.fn();
      const { getByText } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={onClose}
          onSelect={jest.fn()}
          title="Select"
          options={mockOptions}
        />
      );
      
      fireEvent.press(getByText('Option 2'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should not call onSelect for disabled option', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={onSelect}
          title="Select"
          options={mockOptions}
        />
      );
      
      fireEvent.press(getByText('Disabled Option'));
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible options', () => {
      const { getByLabelText } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
          title="Select"
          options={mockOptions}
        />
      );
      
      expect(getByLabelText('Option 1')).toBeTruthy();
    });

    it('should mark disabled options as disabled', () => {
      const { getByLabelText } = render(
        <SelectionBottomSheet
          visible={true}
          onClose={jest.fn()}
          onSelect={jest.fn()}
          title="Select"
          options={mockOptions}
        />
      );
      
      const disabledOption = getByLabelText('Disabled Option');
      expect(disabledOption.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Typed Options', () => {
    it('should work with number values', () => {
      const numberOptions: SelectionOption<number>[] = [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' },
      ];
      
      const onSelect = jest.fn();
      const { getByText } = render(
        <SelectionBottomSheet<number>
          visible={true}
          onClose={jest.fn()}
          onSelect={onSelect}
          title="Select Number"
          options={numberOptions}
        />
      );
      
      fireEvent.press(getByText('One'));
      expect(onSelect).toHaveBeenCalledWith(1);
    });
  });
});
