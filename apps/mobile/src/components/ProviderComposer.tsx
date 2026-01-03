/**
 * ProviderComposer - Flattens nested provider hierarchy
 *
 * Eliminates "Provider Hell" by composing multiple context providers
 * into a single, readable component.
 *
 * @example
 * ```tsx
 * // Before (Provider Hell):
 * <AuthProvider>
 *   <NetworkProvider>
 *     <ThemeProvider>
 *       <App />
 *     </ThemeProvider>
 *   </NetworkProvider>
 * </AuthProvider>
 *
 * // After (Flat):
 * <ProviderComposer providers={[AuthProvider, NetworkProvider, ThemeProvider]}>
 *   <App />
 * </ProviderComposer>
 * ```
 */

import React from 'react';

type ProviderComponent = React.ComponentType<{ children: React.ReactNode }>;

interface ProviderComposerProps {
  /** Array of provider components to compose (order matters - first wraps outermost) */
  providers: ProviderComponent[];
  /** Child elements to wrap with providers */
  children: React.ReactNode;
}

/**
 * Composes multiple context providers into a single component
 * Providers are applied in order: first provider wraps outermost
 */
export function ProviderComposer({
  providers,
  children,
}: ProviderComposerProps): React.ReactElement {
  return providers.reduceRight<React.ReactElement>(
    (acc, Provider) => <Provider>{acc}</Provider>,
    <>{children}</>,
  );
}

export default ProviderComposer;
