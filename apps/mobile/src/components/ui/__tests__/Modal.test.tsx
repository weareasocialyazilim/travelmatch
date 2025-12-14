/**
 * Modal Test Suite
 * Comprehensive tests for modal component variants
 */

import React, { useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View, TouchableOpacity } from 'react-native';
import {
  Modal,
  AlertModal,
  SuccessModal,
  ErrorModal,
  LoadingModal,
  ImagePickerModal,
} from '@/components/ui/Modal';

describe('Modal', () => {
  describe('Basic Rendering', () => {
    it('should render when visible', () => {
      const { getByText } = render(
        <Modal visible={true} onClose={() => {}}>
          <Text>Modal Content</Text>
        </Modal>
      );
      
      expect(getByText('Modal Content')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <Modal visible={false} onClose={() => {}}>
          <Text>Modal Content</Text>
        </Modal>
      );
      
      expect(queryByText('Modal Content')).toBeNull();
    });

    it('should render with title', () => {
      const { getByText } = render(
        <Modal visible={true} onClose={() => {}} title="Test Modal">
          <Text>Content</Text>
        </Modal>
      );
      
      expect(getByText('Test Modal')).toBeTruthy();
    });

    it('should render without title', () => {
      const { queryByTestID, getByText } = render(
        <Modal visible={true} onClose={() => {}} testID="modal">
          <Text>Content</Text>
        </Modal>
      );
      
      expect(getByText('Content')).toBeTruthy();
      expect(queryByTestID('modal-title')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when backdrop pressed', () => {
      const onClose = jest.fn();
      const { getByTestID } = render(
        <Modal visible={true} onClose={onClose}>
          <Text>Content</Text>
        </Modal>
      );
      
      fireEvent.press(getByTestID('modal-backdrop'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should not close on backdrop press when closeOnBackdropPress is false', () => {
      const onClose = jest.fn();
      const { getByTestID } = render(
        <Modal visible={true} onClose={onClose} closeOnBackdropPress={false}>
          <Text>Content</Text>
        </Modal>
      );
      
      fireEvent.press(getByTestID('modal-backdrop'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when close button pressed', () => {
      const onClose = jest.fn();
      const { getByTestID } = render(
        <Modal
          visible={true}
          onClose={onClose}
          title="Test"
          showCloseButton={true}
        >
          <Text>Content</Text>
        </Modal>
      );
      
      fireEvent.press(getByTestID('modal-close-button'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Animation Types', () => {
    it('should use slide animation', () => {
      const { getByTestID } = render(
        <Modal
          visible={true}
          onClose={() => {}}
          animationType="slide"
          testID="modal"
        >
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal).toBeTruthy();
    });

    it('should use fade animation', () => {
      const { getByTestID } = render(
        <Modal
          visible={true}
          onClose={() => {}}
          animationType="fade"
          testID="modal"
        >
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal).toBeTruthy();
    });

    it('should use none animation', () => {
      const { getByTestID } = render(
        <Modal
          visible={true}
          onClose={() => {}}
          animationType="none"
          testID="modal"
        >
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal).toBeTruthy();
    });
  });

  describe('Size Variants', () => {
    it('should render small modal', () => {
      const { getByTestID } = render(
        <Modal visible={true} onClose={() => {}} size="small" testID="modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal).toBeTruthy();
    });

    it('should render medium modal', () => {
      const { getByTestID } = render(
        <Modal visible={true} onClose={() => {}} size="medium" testID="modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal).toBeTruthy();
    });

    it('should render large modal', () => {
      const { getByTestID } = render(
        <Modal visible={true} onClose={() => {}} size="large" testID="modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal).toBeTruthy();
    });

    it('should render fullscreen modal', () => {
      const { getByTestID } = render(
        <Modal visible={true} onClose={() => {}} size="fullscreen" testID="modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      const { getByTestID } = render(
        <Modal visible={true} onClose={() => {}} testID="modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal.props.accessible).toBe(true);
    });

    it('should have proper accessibility role', () => {
      const { getByTestID } = render(
        <Modal visible={true} onClose={() => {}} testID="modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal.props.accessibilityRole).toBe('alert');
    });

    it('should announce to screen readers', () => {
      const { getByTestID } = render(
        <Modal visible={true} onClose={() => {}} title="Important" testID="modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestID('modal');
      expect(modal.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close', async () => {
      const TestComponent = () => {
        const [visible, setVisible] = useState(false);
        
        return (
          <>
            <TouchableOpacity onPress={() => setVisible(!visible)} testID="toggle">
              <Text>Toggle</Text>
            </TouchableOpacity>
            <Modal visible={visible} onClose={() => setVisible(false)}>
              <Text>Content</Text>
            </Modal>
          </>
        );
      };
      
      const { getByTestID } = render(<TestComponent />);
      const toggle = getByTestID('toggle');
      
      for (let i = 0; i < 10; i++) {
        fireEvent.press(toggle);
      }
      
      await waitFor(() => {
        expect(getByTestID('toggle')).toBeTruthy();
      });
    });

    it('should handle empty children', () => {
      const { getByTestID } = render(
        <Modal visible={true} onClose={() => {}} testID="modal">
          {null}
        </Modal>
      );
      
      expect(getByTestID('modal')).toBeTruthy();
    });
  });
});

describe('AlertModal', () => {
  describe('Basic Rendering', () => {
    it('should render with title and message', () => {
      const { getByText } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Alert"
          message="This is an alert message"
        />
      );
      
      expect(getByText('Alert')).toBeTruthy();
      expect(getByText('This is an alert message')).toBeTruthy();
    });

    it('should render icon', () => {
      const { getByTestID } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Alert"
          message="Message"
          icon="alert-circle"
        />
      );
      
      expect(getByTestID('alert-icon')).toBeTruthy();
    });
  });

  describe('Button Actions', () => {
    it('should render primary button', () => {
      const { getByText } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Alert"
          message="Message"
          primaryButtonText="OK"
          onPrimaryPress={() => {}}
        />
      );
      
      expect(getByText('OK')).toBeTruthy();
    });

    it('should call onPrimaryPress', () => {
      const onPrimaryPress = jest.fn();
      const { getByText } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Alert"
          message="Message"
          primaryButtonText="OK"
          onPrimaryPress={onPrimaryPress}
        />
      );
      
      fireEvent.press(getByText('OK'));
      expect(onPrimaryPress).toHaveBeenCalled();
    });

    it('should render secondary button', () => {
      const { getByText } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Alert"
          message="Message"
          primaryButtonText="OK"
          onPrimaryPress={() => {}}
          secondaryButtonText="Cancel"
          onSecondaryPress={() => {}}
        />
      );
      
      expect(getByText('OK')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should call onSecondaryPress', () => {
      const onSecondaryPress = jest.fn();
      const { getByText } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Alert"
          message="Message"
          primaryButtonText="OK"
          onPrimaryPress={() => {}}
          secondaryButtonText="Cancel"
          onSecondaryPress={onSecondaryPress}
        />
      );
      
      fireEvent.press(getByText('Cancel'));
      expect(onSecondaryPress).toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('should render info variant', () => {
      const { getByTestID } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Info"
          message="Message"
          variant="info"
          testID="alert"
        />
      );
      
      expect(getByTestID('alert')).toBeTruthy();
    });

    it('should render warning variant', () => {
      const { getByTestID } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Warning"
          message="Message"
          variant="warning"
          testID="alert"
        />
      );
      
      expect(getByTestID('alert')).toBeTruthy();
    });

    it('should render error variant', () => {
      const { getByTestID } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Error"
          message="Message"
          variant="error"
          testID="alert"
        />
      );
      
      expect(getByTestID('alert')).toBeTruthy();
    });

    it('should render success variant', () => {
      const { getByTestID } = render(
        <AlertModal
          visible={true}
          onClose={() => {}}
          title="Success"
          message="Message"
          variant="success"
          testID="alert"
        />
      );
      
      expect(getByTestID('alert')).toBeTruthy();
    });
  });
});

describe('SuccessModal', () => {
  it('should render success icon', () => {
    const { getByTestID } = render(
      <SuccessModal
        visible={true}
        onClose={() => {}}
        title="Success"
        message="Operation completed"
      />
    );
    
    expect(getByTestID('success-icon')).toBeTruthy();
  });

  it('should render with title and message', () => {
    const { getByText } = render(
      <SuccessModal
        visible={true}
        onClose={() => {}}
        title="Success!"
        message="Your action was successful"
      />
    );
    
    expect(getByText('Success!')).toBeTruthy();
    expect(getByText('Your action was successful')).toBeTruthy();
  });

  it('should auto-close after timeout', async () => {
    const onClose = jest.fn();
    
    render(
      <SuccessModal
        visible={true}
        onClose={onClose}
        title="Success"
        message="Message"
        autoCloseTimeout={1000}
      />
    );
    
    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 1500 }
    );
  });
});

describe('ErrorModal', () => {
  it('should render error icon', () => {
    const { getByTestID } = render(
      <ErrorModal
        visible={true}
        onClose={() => {}}
        title="Error"
        message="Something went wrong"
      />
    );
    
    expect(getByTestID('error-icon')).toBeTruthy();
  });

  it('should render with title and message', () => {
    const { getByText } = render(
      <ErrorModal
        visible={true}
        onClose={() => {}}
        title="Error Occurred"
        message="Please try again later"
      />
    );
    
    expect(getByText('Error Occurred')).toBeTruthy();
    expect(getByText('Please try again later')).toBeTruthy();
  });

  it('should render retry button', () => {
    const { getByText } = render(
      <ErrorModal
        visible={true}
        onClose={() => {}}
        title="Error"
        message="Message"
        onRetry={() => {}}
      />
    );
    
    expect(getByText('Retry')).toBeTruthy();
  });

  it('should call onRetry when retry button pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ErrorModal
        visible={true}
        onClose={() => {}}
        title="Error"
        message="Message"
        onRetry={onRetry}
      />
    );
    
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('should render error details when provided', () => {
    const { getByText } = render(
      <ErrorModal
        visible={true}
        onClose={() => {}}
        title="Error"
        message="Message"
        errorDetails="Network timeout after 30 seconds"
      />
    );
    
    expect(getByText('Network timeout after 30 seconds')).toBeTruthy();
  });
});

describe('LoadingModal', () => {
  it('should render loading indicator', () => {
    const { getByTestID } = render(
      <LoadingModal visible={true} message="Loading..." />
    );
    
    expect(getByTestID('loading-indicator')).toBeTruthy();
  });

  it('should render loading message', () => {
    const { getByText } = render(
      <LoadingModal visible={true} message="Please wait..." />
    );
    
    expect(getByText('Please wait...')).toBeTruthy();
  });

  it('should not be dismissible by backdrop', () => {
    const onClose = jest.fn();
    const { getByTestID } = render(
      <LoadingModal visible={true} message="Loading..." onClose={onClose} />
    );
    
    fireEvent.press(getByTestID('modal-backdrop'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should render progress when provided', () => {
    const { getByText } = render(
      <LoadingModal visible={true} message="Uploading..." progress={75} />
    );
    
    expect(getByText('75%')).toBeTruthy();
  });

  it('should render cancel button when onCancel provided', () => {
    const { getByText } = render(
      <LoadingModal
        visible={true}
        message="Loading..."
        onCancel={() => {}}
        cancelText="Cancel"
      />
    );
    
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should call onCancel when cancel button pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <LoadingModal visible={true} message="Loading..." onCancel={onCancel} />
    );
    
    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('ImagePickerModal', () => {
  describe('Basic Rendering', () => {
    it('should render camera and gallery options', () => {
      const { getByText } = render(
        <ImagePickerModal visible={true} onClose={() => {}} onSelect={() => {}} />
      );
      
      expect(getByText('Camera')).toBeTruthy();
      expect(getByText('Photo Library')).toBeTruthy();
    });

    it('should render title', () => {
      const { getByText } = render(
        <ImagePickerModal
          visible={true}
          onClose={() => {}}
          onSelect={() => {}}
          title="Choose Photo"
        />
      );
      
      expect(getByText('Choose Photo')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onSelect with camera option', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <ImagePickerModal visible={true} onClose={() => {}} onSelect={onSelect} />
      );
      
      fireEvent.press(getByText('Camera'));
      expect(onSelect).toHaveBeenCalledWith('camera');
    });

    it('should call onSelect with gallery option', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <ImagePickerModal visible={true} onClose={() => {}} onSelect={onSelect} />
      );
      
      fireEvent.press(getByText('Photo Library'));
      expect(onSelect).toHaveBeenCalledWith('gallery');
    });

    it('should show remove option when current image exists', () => {
      const { getByText } = render(
        <ImagePickerModal
          visible={true}
          onClose={() => {}}
          onSelect={() => {}}
          onRemove={() => {}}
          hasCurrentImage={true}
        />
      );
      
      expect(getByText('Remove Photo')).toBeTruthy();
    });

    it('should call onRemove when remove pressed', () => {
      const onRemove = jest.fn();
      const { getByText } = render(
        <ImagePickerModal
          visible={true}
          onClose={() => {}}
          onSelect={() => {}}
          onRemove={onRemove}
          hasCurrentImage={true}
        />
      );
      
      fireEvent.press(getByText('Remove Photo'));
      expect(onRemove).toHaveBeenCalled();
    });

    it('should close after selection', async () => {
      const TestComponent = () => {
        const [visible, setVisible] = useState(true);
        
        return (
          <ImagePickerModal
            visible={visible}
            onClose={() => setVisible(false)}
            onSelect={() => setVisible(false)}
          />
        );
      };
      
      const { getByText, queryByText } = render(<TestComponent />);
      
      fireEvent.press(getByText('Camera'));
      
      await waitFor(() => {
        expect(queryByText('Camera')).toBeNull();
      });
    });
  });

  describe('Permissions', () => {
    it('should show permission warning when camera not available', () => {
      const { getByText } = render(
        <ImagePickerModal
          visible={true}
          onClose={() => {}}
          onSelect={() => {}}
          cameraPermission="denied"
        />
      );
      
      expect(getByText('Camera permission required')).toBeTruthy();
    });

    it('should disable camera option when permission denied', () => {
      const onSelect = jest.fn();
      const { getByText } = render(
        <ImagePickerModal
          visible={true}
          onClose={() => {}}
          onSelect={onSelect}
          cameraPermission="denied"
        />
      );
      
      const cameraButton = getByText('Camera').parent;
      expect(cameraButton.props.disabled).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels', () => {
      const { getByLabelText } = render(
        <ImagePickerModal visible={true} onClose={() => {}} onSelect={() => {}} />
      );
      
      expect(getByLabelText('Take photo with camera')).toBeTruthy();
      expect(getByLabelText('Choose from photo library')).toBeTruthy();
    });
  });
});
