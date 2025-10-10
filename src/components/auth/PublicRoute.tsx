'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute - For pages that should only be accessible when NOT logged in
 * (login, register, etc.)
 * Redirects authenticated users to their dashboard
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for store to rehydrate before making decisions
    if (!_hasHydrated) {
      return;
    }

    // Redirect authenticated users to their dashboard
    if (!isLoading && isAuthenticated && user) {
      if (user.user_type === 'talent') {
        router.push('/dashboard/talent');
      } else if (user.user_type === 'recruiter') {
        router.push('/dashboard/recruiter');
      } else {
        router.push('/dashboard');
      }
    }
  }, [_hasHydrated, isLoading, isAuthenticated, user, router]);

  // Show loading while checking auth state
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Render children for non-authenticated users
  return <>{children}</>;
}