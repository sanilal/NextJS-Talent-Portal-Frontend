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
    console.log('🛡️ ProtectedRoute useEffect triggered:', {
      hasHydrated: _hasHydrated,
      isAuthenticated,
      userExists: !!user,
      userType: user?.user_type,
      allowedTypes: allowedUserTypes,
    });

    if (!_hasHydrated) {
      console.log('⏳ Not hydrated yet, waiting...');
      return;
    }

    if (!isAuthenticated) {
      console.log('❌ NOT AUTHENTICATED - Redirecting to /login');
      console.log('📍 Current path:', window.location.pathname);
      console.log('💾 Token in localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
      router.push('/login');
      return;
    }

    if (
      isAuthenticated &&
      user &&
      allowedUserTypes &&
      !allowedUserTypes.includes(user.user_type)
    ) {
      console.log('❌ Wrong user type, redirecting...');
      if (user.user_type === 'talent') {
        router.push('/dashboard/talent');
      } else if (user.user_type === 'recruiter') {
        router.push('/dashboard/recruiter');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    console.log('✅ ProtectedRoute: Access granted');
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
    console.log('🚫 Rendering null - not authenticated');
    return null;
  }

  if (allowedUserTypes && user && !allowedUserTypes.includes(user.user_type)) {
    console.log('🚫 Rendering null - wrong user type');
    return null;
  }

  return <>{children}</>;
}