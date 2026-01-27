'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { User, Lock, Bell, Shield, Save, Eye, EyeOff, Pencil, Trash2, Mail, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCanManageAdmins } from '@/store/slices/authSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Modal } from '@/components/ui';
import { InviteUserModal } from '@/components/settings/InviteUserModal';
import { authService } from '@/services/auth.service';
import { AdminUser, AdminRole } from '@/types';
import clsx from 'clsx';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'admins';

export default function SettingsPage() {
  const canManageAdmins = useAppSelector(selectCanManageAdmins);
  const user = useAppSelector((state) => state.auth.user);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'security', 'notifications', 'admins'].includes(tab)) {
      setActiveTab(tab as SettingsTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
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

  // Resend Modal State
  const [resendMember, setResendMember] = useState<AdminUser | null>(null);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  
  // Fetch members when admin tab is active
  const fetchMembers = () => {
    if (activeTab === 'admins' && canManageAdmins) {
      setLoadingMembers(true);
      authService.getMembers()
        .then(setMembers)
        .catch(console.error)
        .finally(() => setLoadingMembers(false));
    }
  };

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
  }, [activeTab, canManageAdmins]);

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
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to resend invitation');
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
            await authService.deleteMember(memberId);
            fetchMembers(); // Refresh list
        } catch (error) {
            console.error(error);
            alert('Failed to delete user');
        }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      alert("New passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      alert('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
        console.error(error);
        alert(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    ...(canManageAdmins ? [{ id: 'admins' as const, label: 'Admin Users', icon: Shield }] : []),
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 max-w-lg">
                  <Input
                    label="Full Name"
                    defaultValue={user?.name || ''}
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    defaultValue={user?.email || ''}
                    placeholder="Enter your email"
                  />
                  <Input
                    label="Role"
                    value={user?.role || 'Administrator'}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6 max-w-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          label="Current Password"
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
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
                          label="New Password"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
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
                        label="Confirm New Password"
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Current Session</p>
                          <p className="text-xs text-gray-500">Chrome on Windows • IP: 192.168.1.1</p>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button onClick={handlePasswordChange} isLoading={passwordLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6 max-w-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email updates about your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Order Alerts</p>
                      <p className="text-sm text-gray-500">Get notified about new orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Campaign Updates</p>
                      <p className="text-sm text-gray-500">Notifications about campaign performance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Security Alerts</p>
                      <p className="text-sm text-gray-500">Important security notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Weekly Reports</p>
                      <p className="text-sm text-gray-500">Receive weekly summary reports</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </Card>
            )}

            {/* Admin Users */}
            {activeTab === 'admins' && canManageAdmins && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Admin Users</h2>
                  <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
                    Add Member
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loadingMembers ? (
                        <tr><td colSpan={4} className="p-4 text-center">Loading members...</td></tr>
                      ) : members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={clsx(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            member.role === AdminRole.SUPER_ADMIN ? "bg-purple-100 text-purple-800" :
                            member.role === AdminRole.ADMIN ? "bg-blue-100 text-blue-800" :
                            member.role === AdminRole.MODERATOR ? "bg-green-100 text-green-800" :
                            "bg-yellow-100 text-yellow-800"
                          )}>
                            {member.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={clsx(
                            "text-xs px-2 py-1 rounded-full font-medium inline-flex items-center gap-1",
                            getMemberStatus(member).color
                          )}>
                            {(() => {
                                const StatusIcon = getMemberStatus(member).icon;
                                return <StatusIcon className="w-3 h-3" />;
                            })()}
                            {getMemberStatus(member).label}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          {getCanEdit(member) && (
                            <>
                              {member.lastLoginAt ? (
                                <div className="p-2 text-green-600" title="Verified User">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => handleResendInvite(member)} className="text-gray-500 hover:text-blue-600" title="Resend Invitation">
                                    <Mail className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button variant="ghost" size="sm" onClick={() => handleEditMember(member)} className="text-gray-500 hover:text-blue-600">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {getCanDelete(member) && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(member.id)} className="text-gray-500 hover:text-red-600">
                             <Trash2 className="w-4 h-4" />
                          </Button>
                          )}
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
        title="Resend Invitation"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
             Are you sure you want to resend the invitation email to <span className="font-semibold text-gray-900">{resendMember?.email}</span>?
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
             <Button variant="ghost" onClick={() => setIsResendModalOpen(false)}>
               Cancel
             </Button>
             <Button onClick={confirmResendInvite}>
               <Mail className="w-4 h-4 mr-2" />
               Send Email
             </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
