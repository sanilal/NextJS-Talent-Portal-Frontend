'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('talent' | 'recruiter')[];
}

export function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect if not authenticated after loading
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check user type restrictions if specified
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      allowedUserTypes &&
      !allowedUserTypes.includes(user.user_type)
    ) {
      // Redirect to appropriate dashboard if wrong user type
      if (user.user_type === 'talent') {
        router.push('/dashboard/talent');
      } else if (user.user_type === 'recruiter') {
        router.push('/dashboard/recruiter');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedUserTypes, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check user type restriction
  if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type)) {
    return null;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
}