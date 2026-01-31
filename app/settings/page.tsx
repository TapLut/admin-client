'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { User, Lock, Bell, Shield, Save, Eye, EyeOff, Pencil, Trash2, Mail, CheckCircle, Clock, XCircle, AlertCircle, Globe } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCanManageAdmins, setUser } from '@/store/slices/authSlice';
import { addToast, setLanguage } from '@/store/slices/uiSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Modal, Table, TableColumn } from '@/components/ui';
import { InviteUserModal } from '@/components/settings/InviteUserModal';
import { authService } from '@/services/auth.service';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminUser, AdminRole } from '@/types';
import clsx from 'clsx';
import Image from 'next/image';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'admins' | 'preferences';

export default function SettingsPage() {
  const canManageAdmins = useAppSelector(selectCanManageAdmins);
  const user = useAppSelector((state) => state.auth.user);
  const currentLanguage = useAppSelector((state) => state.ui.language);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'security', 'notifications', 'admins', 'preferences'].includes(tab)) {
      setActiveTab(tab as SettingsTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    avatarUrl: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setProfileLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
          name: profileForm.name,
          email: profileForm.email,
      });
      dispatch(setUser(updatedUser)); // Update Redux store
      dispatch(addToast({
        type: 'success',
        title: t('success'),
        message: t('profile_updated')
      }));
    } catch (error: any) {
      console.error(error);
      dispatch(addToast({
        type: 'error',
        title: t('error'),
        message: error.response?.data?.message || t('profile_update_failed')
      }));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 2 * 1024 * 1024) { // 2MB
      dispatch(addToast({ type: 'error', title: t('error'), message: t('avatar_hint') }));
      return;
    }

    try {
      const { avatarUrl } = await authService.uploadAvatar(file);
      // Update local state and global redux
      setProfileForm(prev => ({ ...prev, avatarUrl }));
      
      // We also update the user immediately in Redux, but we might need to fetch the full updated user or construct it
      if (user) {
          dispatch(setUser({ ...user, avatarUrl }));
      }

      dispatch(addToast({ type: 'success', title: t('success'), message: t('avatar_updated') }));
    } catch (error: any) {
      console.error(error);
      dispatch(addToast({
          type: 'error',
          title: t('error'),
          message: t('avatar_upload_failed')
      }));
    }
  };

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [members, setMembers] = useState<AdminUser[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminUser | null>(null);

  const [resendMember, setResendMember] = useState<AdminUser | null>(null);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState<number | null>(null);
  
  const fetchMembers = useCallback(() => {
    if (activeTab === 'admins' && canManageAdmins) {
      setLoadingMembers(true);
      authService.getMembers()
        .then(setMembers)
        .catch(console.error)
        .finally(() => setLoadingMembers(false));
    }
  }, [activeTab, canManageAdmins]);

  const getCanEdit = (targetUser: AdminUser) => {
    if (!user) return false;
    if (targetUser.role === AdminRole.SUPER_ADMIN) return false; // Modifying Super Admin is restricted
    
    if (user.role === AdminRole.SUPER_ADMIN) return true;
    if (user.role === AdminRole.ADMIN) {
        return targetUser.role === AdminRole.MODERATOR || targetUser.role === AdminRole.SPONSOR;
    }
    return false;
  };

  const getCanDelete = (targetUser: AdminUser) => {
    if (!user) return false;
    if (targetUser.role === AdminRole.SUPER_ADMIN) return false; // Never delete Super Admin
    
    if (user.role === AdminRole.SUPER_ADMIN) return true;
    if (user.role === AdminRole.ADMIN) {
        return targetUser.role === AdminRole.MODERATOR || targetUser.role === AdminRole.SPONSOR;
    }
    return false;
  };

  const getMemberStatus = (member: AdminUser) => {
    if (!member.isActive) return { label: 'Inactive', color: 'bg-red-100 text-red-800', icon: XCircle };
    
    if (member.lastLoginAt) return { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    
    const createdAt = new Date(member.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 7) return { label: 'Expired', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
    
    return { label: 'Invited', color: 'bg-blue-100 text-blue-800', icon: Clock };
  };

  useEffect(() => {
     fetchMembers();
  }, [activeTab, canManageAdmins, fetchMembers]);

  const handleEditMember = (member: AdminUser) => {
    setEditingMember(member);
    setIsInviteModalOpen(true);
  };

  const handleResendInvite = (member: AdminUser) => {
    setResendMember(member);
    setIsResendModalOpen(true);
  };

  const confirmResendInvite = async () => {
    if (!resendMember) return;
    
    try {
      await authService.resendInvite(resendMember.id);
      setIsResendModalOpen(false);
      setResendMember(null);
      dispatch(addToast({ type: 'success', title: t('success'), message: t('invitation_resent') }));
    } catch (error: any) {
      console.error(error);
      dispatch(addToast({
        type: 'error',
        title: t('error'),
        message: error.response?.data?.message || t('resend_failed')
      }));
    }
  };

  const handleDeleteMember = (memberId: number) => {
    setDeleteMemberId(memberId);
  };

  const confirmDeleteMember = async () => {
    if (!deleteMemberId) return;
    try {
      await authService.deleteMember(deleteMemberId);
      fetchMembers(); // Refresh list
      dispatch(addToast({ type: 'success', title: t('success'), message: t('user_deleted') }));
    } catch (error) {
      console.error(error);
      dispatch(addToast({ type: 'error', title: t('error'), message: t('delete_user_failed') }));
    } finally {
        setDeleteMemberId(null);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      dispatch(addToast({
        type: 'error',
        title: t('error'),
        message: t('passwords_dont_match')
      }));
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      dispatch(addToast({
        type: 'error',
        title: t('error'),
        message: t('password_min_length')
      }));
      return;
    }
    
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      dispatch(addToast({
        type: 'success',
        title: t('success'),
        message: t('password_updated')
      }));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
        console.error(error);
        dispatch(addToast({
          type: 'error',
          title: t('error'),
          message: error.response?.data?.message || t('password_update_failed')
        }));
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: t('profile'), icon: User },
    { id: 'security' as const, label: t('security'), icon: Lock },
    { id: 'preferences' as const, label: t('preferences'), icon: Globe },
    { id: 'notifications' as const, label: t('notifications'), icon: Bell },
    ...(canManageAdmins ? [{ id: 'admins' as const, label: t('users'), icon: Shield }] : []),
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('settings_title')}</h1>
          <p className="text-gray-500 mt-1">{t('settings_subtitle')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('profile_settings')}</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  {profileForm.avatarUrl ? (
                    <Image 
                        src={profileForm.avatarUrl.startsWith('http') ? profileForm.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${profileForm.avatarUrl}`}
                        alt={user?.name || 'User avatar'} 
                        className="w-20 h-20 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                  <div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleAvatarUpload}
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      {t('change_avatar')}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      {t('avatar_hint')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 max-w-lg">
                  <Input
                    label={t('full_name')}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder={t('enter_full_name')}
                  />
                  <Input
                    label={t('email_address')}
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder={t('enter_email')}
                  />
                  <Input
                    label={t('role')}
                    value={user?.role || t('role_administrator')}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button onClick={handleProfileUpdate} isLoading={profileLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {t('save_changes')}
                  </Button>
                </div>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('security_settings')}</h2>
                
                <div className="space-y-6 max-w-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">{t('change_password')}</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          label={t('current_password')}
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder={t('enter_current_password')}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          label={t('new_password')}
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder={t('enter_new_password')}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <Input
                        label={t('confirm_new_password')}
                        type="password"
                        placeholder={t('confirm_new_password_placeholder')}
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-4">{t('last_login_activity')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {user?.lastLoginAt 
                                ? new Date(user.lastLoginAt).toLocaleString() 
                                : t('never_logged_in')}
                            </p>
                            {user?.lastLoginIp && (
                              <p className="text-xs text-gray-500">IP: {user.lastLoginIp}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button onClick={handlePasswordChange} isLoading={passwordLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {t('update_password')}
                  </Button>
                </div>
              </Card>
            )}

            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('preferences_title')}</h2>
                
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('language')}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => dispatch(setLanguage('ko'))}
                        className={clsx(
                          'flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-colors',
                          currentLanguage === 'ko'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <span className="mr-2">🇰🇷</span>
                        {t('language_korean')}
                      </button>
                      <button
                        onClick={() => dispatch(setLanguage('en'))}
                        className={clsx(
                          'flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-colors',
                          currentLanguage === 'en'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <span className="mr-2">🇺🇸</span>
                        {t('language_english')}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('language_hint')}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('notification_preferences')}</h2>
                
                <div className="space-y-6 max-w-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{t('email_notifications')}</p>
                      <p className="text-sm text-gray-500">{t('email_notifications_desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <label htmlFor="email-notifications" className="sr-only">Email Notifications</label>
                      <input id="email-notifications" type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{t('order_alerts')}</p>
                      <p className="text-sm text-gray-500">{t('order_alerts_desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <label htmlFor="order-alerts" className="sr-only">Order Alerts</label>
                      <input id="order-alerts" type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{t('campaign_updates')}</p>
                      <p className="text-sm text-gray-500">{t('campaign_updates_desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <label htmlFor="campaign-updates" className="sr-only">Campaign Updates</label>
                      <input id="campaign-updates" type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{t('security_alerts')}</p>
                      <p className="text-sm text-gray-500">{t('security_alerts_desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <label htmlFor="security-alerts" className="sr-only">Security Alerts</label>
                      <input id="security-alerts" type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{t('weekly_reports')}</p>
                      <p className="text-sm text-gray-500">{t('weekly_reports_desc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <label htmlFor="weekly-reports" className="sr-only">Weekly Reports</label>
                      <input id="weekly-reports" type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    {t('save_preferences')}
                  </Button>
                </div>
              </Card>
            )}

            {/* Admin Users */}
            {activeTab === 'admins' && canManageAdmins && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">{t('admin_users')}</h2>
                  <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
                    {t('add_member')}
                  </Button>
                </div>
                
                <Table<AdminUser>
                  columns={[
                    {
                      key: 'user',
                      header: t('th_user'),
                      render: (member) => (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{member.name}</p>
                            <p className="text-xs text-text-muted">{member.email}</p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'role',
                      header: t('th_role'),
                      render: (member) => (
                        <span className={clsx(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          member.role === AdminRole.SUPER_ADMIN ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                          member.role === AdminRole.ADMIN ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                          member.role === AdminRole.MODERATOR ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}>
                          {member.role.replace('_', ' ').toUpperCase()}
                        </span>
                      ),
                    },
                    {
                      key: 'status',
                      header: t('th_status'),
                      render: (member) => {
                        const status = getMemberStatus(member);
                        const StatusIcon = status.icon;
                        return (
                          <span className={clsx(
                            "text-xs px-2 py-1 rounded-full font-medium inline-flex items-center gap-1",
                            status.color
                          )}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        );
                      },
                    },
                    {
                      key: 'actions',
                      header: t('th_actions'),
                      render: (member) => (
                        <div className="flex gap-2">
                          {getCanEdit(member) && (
                            <>
                              {member.lastLoginAt ? (
                                <div className="p-2 text-success" title="Verified User">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => handleResendInvite(member)} className="text-text-muted hover:text-primary" title="Resend Invitation">
                                  <Mail className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleEditMember(member)} className="text-text-muted hover:text-primary">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {getCanDelete(member) && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(member.id)} className="text-text-muted hover:text-danger">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  data={members}
                  keyExtractor={(member) => member.id}
                  isLoading={loadingMembers}
                  emptyIcon={<Shield className="w-12 h-12" />}
                  emptyTitle={t('no_admins_found') || 'No admin users found'}
                  emptyDescription={t('add_admin_to_get_started') || 'Add an admin user to get started'}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
      <InviteUserModal 
        isOpen={isInviteModalOpen} 
        onClose={() => {
            setIsInviteModalOpen(false);
            setEditingMember(null);
        }} 
        user={editingMember}
        onSuccess={fetchMembers}
      />

      {/* Resend Confirmation Modal */}
      <Modal
        isOpen={isResendModalOpen}
        onClose={() => setIsResendModalOpen(false)}
        title={t('resend_invitation')}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
             {t('resend_invite_confirm')} <span className="font-semibold text-gray-900">{resendMember?.email}</span>?
          </div>
          

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteMemberId}
        onClose={() => setDeleteMemberId(null)}
        title={t('delete_user')}
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
             {t('delete_user_confirm')}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
             <Button variant="ghost" onClick={() => setDeleteMemberId(null)}>
               {t('cancel')}
             </Button>
             <Button onClick={confirmDeleteMember} className="bg-red-600 hover:bg-red-700 text-white">
               {t('delete_user')}
             </Button>
          </div>
        </div>
      </Modal>
          <div className="flex justify-end gap-3 pt-4">
             <Button variant="ghost" onClick={() => setIsResendModalOpen(false)}>
               {t('cancel')}
             </Button>
             <Button onClick={confirmResendInvite}>
               <Mail className="w-4 h-4 mr-2" />
               {t('send_email')}
             </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
