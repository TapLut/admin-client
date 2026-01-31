'use client';

import { useAppSelector } from '@/store/hooks';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#F0EFF2] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased overflow-x-hidden">
      <Sidebar />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'pl-28' : 'pl-68'
        }`}
      >
        <TopBar />
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
