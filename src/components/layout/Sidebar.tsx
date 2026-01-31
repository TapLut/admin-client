'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ListChecks, 
  Users,
  UserPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Gamepad2,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  selectIsSponsor, 
  selectCanManageUsers, 
  selectCanManageQuests,
  logout 
} from '@/store/slices/authSlice';
import { toggleSidebarCollapsed } from '@/store/slices/uiSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { authService } from '@/services';
import { AdminRole } from '@/types';
import clsx from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: AdminRole[];
}

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isSponsor = useAppSelector(selectIsSponsor);
  const canManageUsers = useAppSelector(selectCanManageUsers);
  const canManageQuests = useAppSelector(selectCanManageQuests);
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    {
      label: t('dashboard'),
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: t('products'),
      href: '/products',
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: t('orders'),
      href: '/orders',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      label: t('games'),
      href: '/games',
      icon: <Gamepad2 className="w-5 h-5" />,
    },
    {
      label: t('quests'),
      href: '/quests',
      icon: <ListChecks className="w-5 h-5" />,
      roles: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR, AdminRole.SPONSOR],
    },
    {
      label: t('users'),
      href: '/users',
      icon: <Users className="w-5 h-5" />,
      roles: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR],
    },
    {
      label: t('sponsors'),
      href: '/sponsors',
      icon: <UserPlus className="w-5 h-5" />,
      roles: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN],
    },
    {
      label: t('settings'),
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <aside
      className={clsx(
        'fixed left-4 top-4 bottom-4 z-40 flex flex-col items-center gap-4 bg-white dark:bg-slate-900 rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/50 py-6 transition-all duration-300 overflow-hidden',
        sidebarCollapsed ? 'w-20' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center w-full px-4 gap-3">
        {!sidebarCollapsed && (
          <span className="font-bold text-lg text-slate-900 dark:text-white whitespace-nowrap">
            Taplut
          </span>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="ml-auto w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {sidebarCollapsed && (
          <button
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mx-auto"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col w-full gap-1 px-3 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 h-12 px-4 rounded-full transition-all duration-300 group',
                isActive
                  ? 'bg-[#B364FF] text-white shadow-lg shadow-[#B364FF]/20'
                  : 'text-[#8E8EA0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800',
                sidebarCollapsed && 'justify-center px-0'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="font-semibold whitespace-nowrap text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {!sidebarCollapsed && user && (
        <div className="w-full px-4 pb-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-[#8E8EA0] truncate">{user.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-[#B364FF]/10 text-[#B364FF] font-medium">
              {user.role}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex items-center gap-2 px-3 w-full">
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 h-10 px-4 rounded-full text-[#8E8EA0] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all',
            sidebarCollapsed && 'justify-center px-0 w-full'
          )}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
