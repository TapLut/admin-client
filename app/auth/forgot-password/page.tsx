'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { authService } from '@/services';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      // We show success regardless of whether email exists for security (backend behavior)
      // But currently backend actually just returns void.
      setIsSuccess(true);
    } catch (err: any) {
        // Backend doesn't throw visible errors for privacy usually, but if connection fail:
        console.error(err);
        setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                <p className="text-gray-500 mb-8">
                    We have sent a password reset link to <strong>{email}</strong>.
                </p>
                <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                    Back to Login
                </Button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
             <button 
                onClick={() => router.back()}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
             >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
             </button>
             <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
             <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              Send Reset Link
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
