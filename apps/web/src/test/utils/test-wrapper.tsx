import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, RenderOptions } from '@testing-library/react';

/**
 * Creates a new QueryClient for each test
 * Prevents test pollution from cached queries
 */
const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface WrapperProps {
  children: React.ReactNode;
}

/**
 * Test wrapper with React Query provider
 */
export const createWrapper = (queryClient?: QueryClient) => {
  const testQueryClient = queryClient || createTestQueryClient();

  return ({ children }: WrapperProps): JSX.Element => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
};

/**
 * Custom render function with React Query wrapper
 *
 * @example
 * ```tsx
 * import { renderWithProviders } from '@/test/utils';
 *
 * it('renders component', () => {
 *   const { getByText } = renderWithProviders(<MyComponent />);
 *   expect(getByText('Hello')).toBeInTheDocument();
 * });
 * ```
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient },
): ReturnType<typeof rtlRender> => {
  const { queryClient, ...renderOptions } = options || {};

  return rtlRender(ui, {
    wrapper: createWrapper(queryClient),
    ...renderOptions,
  });
};
