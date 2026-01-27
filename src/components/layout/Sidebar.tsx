'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Megaphone, 
  ListChecks, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  selectIsSponsor, 
  selectCanManageUsers, 
  selectCanManageQuests,
  logout 
} from '@/store/slices/authSlice';
import { toggleSidebarCollapsed } from '@/store/slices/uiSlice';
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

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Products',
      href: '/products',
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: 'Orders',
      href: '/orders',
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      label: 'Campaigns',
      href: '/campaigns',
      icon: <Megaphone className="w-5 h-5" />,
    },
    {
      label: 'Quests',
      href: '/quests',
      icon: <ListChecks className="w-5 h-5" />,
      roles: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR],
    },
    {
      label: 'Users',
      href: '/users',
      icon: <Users className="w-5 h-5" />,
      roles: [AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.MODERATOR],
    },
    {
      label: 'Settings',
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
        'fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="text-xl font-bold text-white">
            Taplut Admin
          </Link>
        )}
        <button
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-800 p-4">
        {!sidebarCollapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-300">
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
          title={sidebarCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
