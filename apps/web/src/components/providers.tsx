'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { useState } from 'react';

// Enhanced React Query configuration for optimal caching
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global query defaults
        staleTime: 60 * 1000, // 1 minute default
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false, // Don't refetch on window focus by default
        refetchOnReconnect: 'always', // Always refetch on reconnect
        networkMode: 'offlineFirst', // Use cache first when offline
      },
      mutations: {
        retry: 1,
        networkMode: 'offlineFirst',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: use singleton pattern
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
      )}
    </QueryClientProvider>
  );
};
