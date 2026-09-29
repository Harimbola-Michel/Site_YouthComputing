'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (anciennement cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
            refetchOnMount: true,
          },
          mutations: {
            retry: 0, // Ne pas réessayer les mutations par défaut
          },
        },
      })
  );

  // Optionnel : afficher un toast si le socket se déconnecte (géré dans SocketProvider)
  // Mais le SocketProvider peut émettre ses propres toasts.

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        storageKey="youthcomputing-theme"
      >
        <AuthProvider>
          {/* SocketProvider dépend de l'authentification (via AuthProvider) */}
          <SocketProvider>
            {children}

            {/* ─── Toaster global ─────────────────────────────── */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                  fontSize: '0.875rem',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
                loading: {
                  iconTheme: { primary: '#3b82f6', secondary: '#fff' },
                },
              }}
            />

            {/* Devtools React Query (uniquement en développement) */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </SocketProvider>
        </AuthProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}