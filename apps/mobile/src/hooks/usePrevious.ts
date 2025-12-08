/**
 * usePrevious Hook
 * Returns the previous value of a state or prop
 * @module hooks/usePrevious
 */

import { useRef, useEffect } from 'react';

/**
 * Get the previous value of any variable
 *
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 *
 * // After setCount(5)
 * // count = 5, prevCount = 0
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Get previous value with initial value
 *
 * @example
 * ```tsx
 * const [user, setUser] = useState(null);
 * const prevUser = usePreviousWithInitial(user, null);
 * // prevUser will never be undefined
 * ```
 */
export function usePreviousWithInitial<T>(value: T, initialValue: T): T {
  const ref = useRef<T>(initialValue);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Track if value has changed
 *
 * @example
 * ```tsx
 * const [status, setStatus] = useState('idle');
 * const { current, previous, hasChanged } = useValueChange(status);
 *
 * if (hasChanged && current === 'success') {
 *   showSuccessAnimation();
 * }
 * ```
 */
export function useValueChange<T>(value: T): {
  current: T;
  previous: T | undefined;
  hasChanged: boolean;
} {
  const previousRef = useRef<T | undefined>(undefined);
  const isFirstRender = useRef(true);

  const hasChanged = !isFirstRender.current && previousRef.current !== value;

  useEffect(() => {
    previousRef.current = value;
    isFirstRender.current = false;
  }, [value]);

  return {
    current: value,
    previous: previousRef.current,
    hasChanged,
  };
}

/**
 * Compare current and previous values with custom comparator
 *
 * @example
 * ```tsx
 * const user = { id: 1, name: 'John' };
 * const { hasChanged } = useDeepCompare(user, (prev, curr) => prev?.id === curr?.id);
 * ```
 */
export function useDeepCompare<T>(
  value: T,
  comparator: (prev: T | undefined, curr: T) => boolean,
): {
  current: T;
  previous: T | undefined;
  hasChanged: boolean;
} {
  const previousRef = useRef<T | undefined>(undefined);
  const isFirstRender = useRef(true);

  const hasChanged =
    !isFirstRender.current && !comparator(previousRef.current, value);

  useEffect(() => {
    previousRef.current = value;
    isFirstRender.current = false;
  }, [value]);

  return {
    current: value,
    previous: previousRef.current,
    hasChanged,
  };
}

export default usePrevious;
