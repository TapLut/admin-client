'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function TopBar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const breadcrumbs = useAppSelector((state) => state.ui.breadcrumbs);
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const { t } = useTranslation();

  return (
    <header className="w-full flex flex-col gap-6 px-4 lg:px-8 pt-6 lg:pt-8">
      {/* Upper Navigation Row */}
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-[#8E8EA0]">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-[#8E8EA0] hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-900 dark:text-white font-semibold">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 lg:gap-4 ml-auto">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-50 dark:border-slate-700">
            <Search className="w-4 h-4 text-[#8E8EA0]" />
            <input
              type="text"
              placeholder={t('search')}
              className="bg-transparent border-none outline-none text-sm w-40 lg:w-60 text-slate-900 dark:text-white placeholder:text-[#8E8EA0]"
            />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-50 dark:border-slate-700 hover:shadow-md transition-all">
            <Bell className="w-5 h-5 text-[#8E8EA0]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#B364FF] rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-2">
            {user?.avatarUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img
                  src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${user.avatarUrl}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#B364FF] flex items-center justify-center text-white font-semibold shadow-lg shadow-[#B364FF]/25">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-[#8E8EA0]">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
