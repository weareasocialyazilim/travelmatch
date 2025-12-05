/**
 * useBottomSheet Hook Tests
 * Testing bottom sheet state management
 */

import { renderHook, act } from '@testing-library/react-native';
import { useBottomSheet, useMultipleBottomSheets } from '../useBottomSheet';

describe('useBottomSheet', () => {
  it('should initialize with visible false by default', () => {
    const { result } = renderHook(() => useBottomSheet());

    expect(result.current.visible).toBe(false);
  });

  it('should initialize with custom initial visibility', () => {
    const { result } = renderHook(() =>
      useBottomSheet({ initialVisible: true }),
    );

    expect(result.current.visible).toBe(true);
  });

  it('should open bottom sheet', () => {
    const { result } = renderHook(() => useBottomSheet());

    act(() => {
      result.current.open();
    });

    expect(result.current.visible).toBe(true);
  });

  it('should close bottom sheet', () => {
    const { result } = renderHook(() =>
      useBottomSheet({ initialVisible: true }),
    );

    act(() => {
      result.current.close();
    });

    expect(result.current.visible).toBe(false);
  });

  it('should toggle bottom sheet', () => {
    const { result } = renderHook(() => useBottomSheet());

    expect(result.current.visible).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.visible).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.visible).toBe(false);
  });

  it('should call onOpen callback when opening', () => {
    const onOpen = jest.fn();
    const { result } = renderHook(() => useBottomSheet({ onOpen }));

    act(() => {
      result.current.open();
    });

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('should call onClose callback when closing', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() =>
      useBottomSheet({ initialVisible: true, onClose }),
    );

    act(() => {
      result.current.close();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should provide sheetProps with correct values', () => {
    const { result } = renderHook(() => useBottomSheet());

    expect(result.current.sheetProps).toEqual({
      visible: false,
      onClose: expect.any(Function),
    });

    act(() => {
      result.current.open();
    });

    expect(result.current.sheetProps.visible).toBe(true);
  });

  it('should have a ref property', () => {
    const { result } = renderHook(() => useBottomSheet());

    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBe(null);
  });

  it('should return stable functions', () => {
    const { result, rerender } = renderHook(() => useBottomSheet());

    const firstOpen = result.current.open;
    const firstClose = result.current.close;
    const firstToggle = result.current.toggle;

    rerender({});

    expect(result.current.open).toBe(firstOpen);
    expect(result.current.close).toBe(firstClose);
    expect(result.current.toggle).toBe(firstToggle);
  });
});

describe('useMultipleBottomSheets', () => {
  const sheetNames = ['filter', 'sort', 'confirm'] as const;

  it('should initialize with no active sheet', () => {
    const { result } = renderHook(() =>
      useMultipleBottomSheets([...sheetNames]),
    );

    expect(result.current.activeSheet).toBeNull();
  });

  it('should open a specific sheet', () => {
    const { result } = renderHook(() =>
      useMultipleBottomSheets([...sheetNames]),
    );

    act(() => {
      result.current.open('filter');
    });

    expect(result.current.activeSheet).toBe('filter');
    expect(result.current.isOpen('filter')).toBe(true);
    expect(result.current.isOpen('sort')).toBe(false);
  });

  it('should close active sheet', () => {
    const { result } = renderHook(() =>
      useMultipleBottomSheets([...sheetNames]),
    );

    act(() => {
      result.current.open('filter');
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.activeSheet).toBeNull();
    expect(result.current.isOpen('filter')).toBe(false);
  });

  it('should switch between sheets', () => {
    const { result } = renderHook(() =>
      useMultipleBottomSheets([...sheetNames]),
    );

    act(() => {
      result.current.open('filter');
    });
    expect(result.current.activeSheet).toBe('filter');

    act(() => {
      result.current.open('sort');
    });
    expect(result.current.activeSheet).toBe('sort');
    expect(result.current.isOpen('filter')).toBe(false);
    expect(result.current.isOpen('sort')).toBe(true);
  });

  it('should return correct props for each sheet', () => {
    const { result } = renderHook(() =>
      useMultipleBottomSheets([...sheetNames]),
    );

    act(() => {
      result.current.open('confirm');
    });

    const filterProps = result.current.getProps('filter');
    const confirmProps = result.current.getProps('confirm');

    expect(filterProps.visible).toBe(false);
    expect(confirmProps.visible).toBe(true);
    expect(typeof filterProps.onClose).toBe('function');
  });

  it('should close sheet via getProps onClose', () => {
    const { result } = renderHook(() =>
      useMultipleBottomSheets([...sheetNames]),
    );

    act(() => {
      result.current.open('filter');
    });

    const props = result.current.getProps('filter');
    act(() => {
      props.onClose();
    });

    expect(result.current.activeSheet).toBeNull();
  });
});
