'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // ✅ FIXED: Added 'admin' to match User type definition
  allowedUserTypes?: ('talent' | 'recruiter' | 'admin')[];
}

export function ProtectedRoute({ children, allowedUserTypes }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated, token } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute useEffect triggered:', {
      hasHydrated: _hasHydrated,
      isAuthenticated,
      hasToken: !!token,
      userExists: !!user,
      userType: user?.user_type,
      allowedTypes: allowedUserTypes,
      isReady,
    });

    if (!_hasHydrated) {
      console.log('⏳ Not hydrated yet, waiting...');
      return;
    }

    // ✅ If we have a token, wait for auth to be verified
    if (token && !isAuthenticated) {
      console.log('⏳ Token exists but not authenticated yet, waiting for verification...');
      // Give the auth store time to verify the token
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // ✅ Mark as ready once we have auth state
    setIsReady(true);

  }, [_hasHydrated, isAuthenticated, token, user, allowedUserTypes, isReady]);

  // Separate effect for redirects (only runs when ready)
  useEffect(() => {
    if (!isReady || !_hasHydrated) return;

    if (!isAuthenticated || !user) {
      console.log('❌ NOT AUTHENTICATED - Redirecting to /login');
      console.log('🔍 Current path:', window.location.pathname);
      console.log('💾 Token in localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
      router.push('/login');
      return;
    }

    if (allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
      console.log('❌ Wrong user type, redirecting...');
      
      // ✅ FIXED: Added admin redirect case
      if (user.user_type === 'talent') {
        router.push('/dashboard/talent');
      } else if (user.user_type === 'recruiter') {
        router.push('/dashboard/recruiter');
      } else if (user.user_type === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    console.log('✅ ProtectedRoute: Access granted');
  }, [isReady, _hasHydrated, isAuthenticated, user, allowedUserTypes, router]);

  // Show loading while not ready
  if (!_hasHydrated || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {!_hasHydrated ? 'Loading...' : 'Verifying...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('🚫 Rendering null - not authenticated');
    return null;
  }

  if (allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
    console.log('🚫 Rendering null - wrong user type');
    return null;
  }

  return <>{children}</>;
}