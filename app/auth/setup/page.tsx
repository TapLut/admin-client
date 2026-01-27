'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Lock, Eye, EyeOff } from 'lucide-react';

function SetupPasswordForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="text-center text-red-600">
        <p>Invalid invite link. Missing token.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.setupPassword({ token, password });
      
      // Clear any existing session to ensure the user sees the login page
      dispatch(logout());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      router.push('/login?message=setup_success');
    } catch (err: any) {
        console.error(err);
      setError(err.response?.data?.message || 'Failed to set password. Link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <div className="relative">
          <Input
            required
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            required
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Retype password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" isLoading={loading}>
        Create Account
      </Button>
    </form>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              T
            </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Setup Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create a secure password to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div>Loading...</div>}>
            <SetupPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
