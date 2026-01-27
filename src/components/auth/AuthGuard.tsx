'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginSuccess, logout } from '@/store/slices/authSlice';
import { authService } from '@/services';

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ['/login', '/auth/forgot-password', '/auth/reset-password', '/auth/callback', '/auth/setup'];

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

      // If on public path and no token, allow access
      if (isPublicPath && !accessToken) {
        setIsChecking(false);
        return;
      }

      // If on public path with token, redirect to dashboard
      // Exception: If on setup page, do not redirect to dashboard even if logged in
      if (isPublicPath && accessToken && !pathname?.startsWith('/auth/setup')) {
        router.replace('/dashboard');
        return;
      }

      // If on protected path without token, redirect to login
      if (!isPublicPath && !accessToken) {
        router.replace('/login');
        return;
      }

      // If we have a token but no user in store, fetch user data
      if (accessToken && !user) {
        try {
          const currentUser = await authService.getCurrentUser();
          dispatch(loginSuccess({
            user: currentUser,
            accessToken,
            refreshToken: refreshToken || '',
          }));
        } catch (error) {
          // Token is invalid, clear and redirect
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('accessToken');
          sessionStorage.removeItem('refreshToken');
          dispatch(logout());
          router.replace('/login');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, user, dispatch, router]);

  // Show loading while checking auth
  if (isChecking) {
    const isPublicPath = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
    if (isPublicPath) {
      return <>{children}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl font-bold">T</span>
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
