'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui';
import { authService } from '@/services';
import { useTheme } from '@/components/providers';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
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
    } catch (err) {
        // Backend doesn't throw visible errors for privacy usually, but if connection fail:
        console.error(err);
        setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 px-4 transition-colors duration-300">
            <div className="absolute top-4 right-4">
                <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
                >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 text-center transition-colors border dark:border-slate-800">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Check your email</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors">
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 transition-colors border dark:border-slate-800">
          <div className="mb-8">
             <button 
                onClick={() => router.back()}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
             >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
             </button>
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Reset Password</h1>
             <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600"
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
