'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    if (accessToken) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

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
