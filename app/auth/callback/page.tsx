'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { authService } from '@/services';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(errorParam);
        dispatch(loginFailure(errorParam));
        setTimeout(() => router.replace('/login'), 3000);
        return;
      }

      if (!accessToken || !refreshToken) {
        setError('Invalid callback - missing tokens');
        dispatch(loginFailure('Invalid callback'));
        setTimeout(() => router.replace('/login'), 3000);
        return;
      }

      try {
        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Fetch user profile
        const user = await authService.getCurrentUser();

        dispatch(loginSuccess({
          user,
          accessToken,
          refreshToken,
        }));

        router.replace('/dashboard');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        setError(message);
        dispatch(loginFailure(message));
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setTimeout(() => router.replace('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
          <span className="text-white text-2xl font-bold">T</span>
        </div>
        {error ? (
          <>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Redirecting to login...</p>
          </>
        ) : (
          <p className="text-gray-500">Completing sign in...</p>
        )}
      </div>
    </div>
  );
}
