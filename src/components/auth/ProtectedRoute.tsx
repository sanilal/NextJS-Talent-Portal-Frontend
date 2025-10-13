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
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (
      isAuthenticated &&
      user &&
      allowedUserTypes &&
      !allowedUserTypes.includes(user.user_type)
    ) {
      if (user.user_type === 'talent') {
        router.push('/dashboard/talent');
      } else if (user.user_type === 'recruiter') {
        router.push('/dashboard/recruiter');
      } else {
        router.push('/dashboard');
      }
    }
  }, [_hasHydrated, isAuthenticated, user, allowedUserTypes, router]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type)) {
    return null;
  }

  return <>{children}</>;
}