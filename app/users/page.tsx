'use client';

import { useState, useEffect } from 'react';
import { Eye, Users as UsersIcon, Award, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCanManageUsers } from '@/store/slices/authSlice';
import { fetchUsers, setPage } from '@/store/slices/usersSlice';
import { MainLayout } from '@/components/layout';
import { Card, Modal, Pagination, Table, TableCellActions, TableColumn, Button, SearchFilter } from '@/components/ui';
import { format } from 'date-fns';
import { User } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import Image from 'next/image';

export default function UsersPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canManageUsers = useAppSelector(selectCanManageUsers);

  const { items: users, total, page, limit, totalPages, isLoading } = useAppSelector((state) => state.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const levelRanges = [
    { value: '', label: t('users_all_levels') },
    { value: '1-10', label: 'Level 1-10' },
    { value: '11-20', label: 'Level 11-20' },
    { value: '21-30', label: 'Level 21-30' },
    { value: '31+', label: 'Level 31+' },
  ];

   // Debouce for search
  useEffect(() => {
    fetchUsers({ page: 1, limit, search: searchQuery })
  }, [searchQuery, dispatch, limit]);

  // Fetch on page change
  useEffect(() => {
      dispatch(fetchUsers({ page, limit, search: searchQuery }));
  }, [page, dispatch, limit, searchQuery]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };


  const getLevelBadgeColor = (level: number) => {
    if (level >= 31) return 'bg-purple-100 text-purple-800';
    if (level >= 21) return 'bg-blue-100 text-blue-800';
    if (level >= 11) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('users')}</h1>
          <p className="text-gray-500 mt-1">{t('users_manage')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total_users')}</p>
              <p className="text-2xl font-bold">{total.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('new_users_today')}</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('active_users')}</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('average_level')}</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          searchPlaceholder={t('search_users')}
          showFiltersButton
          onClearAll={() => setSearchQuery('')}
        />

        {/* Users Table */}
        <Card className="overflow-hidden">
          <Table<User>
            columns={[
              {
                key: 'user',
                header: t('th_user'),
                render: (user) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium overflow-hidden">
                      {user.pictureUrl ? (
                        <Image src={user.pictureUrl} alt={user.displayName || user.username || 'User'} className="w-full h-full object-cover" width={40} height={40} />
                      ) : (
                        (user.displayName?.[0] || user.username?.[0] || 'U').toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{user.displayName || t('users_no_name')}</p>
                      <p className="text-xs text-text-muted">@{user.username || 'unknown'}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'level',
                header: t('th_level'),
                render: (user) => (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(user.level)}`}>
                    Lv. {user.level}
                  </span>
                ),
              },
              {
                key: 'points',
                header: t('th_points'),
                render: (user) => (
                  <span className="text-sm font-medium text-primary">
                    {parseInt(user.points).toLocaleString()} pts
                  </span>
                ),
              },
              {
                key: 'referrals',
                header: t('th_referrals'),
                render: (user) => (
                  <span className="text-sm text-text-primary">{user.referralCount}</span>
                ),
              },
              {
                key: 'lastActive',
                header: t('th_last_active'),
                render: (user) => (
                  <span className="text-sm text-text-muted">
                    {user.lastActiveAt ? format(new Date(user.lastActiveAt), 'MMM d, HH:mm') : '-'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: t('th_actions'),
                render: (user) => (
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 rounded-lg hover:bg-table-row-hover transition-colors"
                  >
                    <Eye className="w-4 h-4 text-text-muted" />
                  </button>
                ),
              },
            ]}
            data={users}
            keyExtractor={(user) => user.id}
            isLoading={isLoading}
            emptyIcon={<UsersIcon className="w-12 h-12" />}
            emptyTitle={t('no_users_found') || 'No users found'}
            emptyDescription={t('try_different_search') || 'Try adjusting your search criteria'}
          />
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Card>
        {/* User Details Modal */}
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={t('user_details')}
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                   {selectedUser.pictureUrl ? (
                              <Image src={selectedUser.pictureUrl} alt={selectedUser.displayName || selectedUser.username || 'User'} className="w-full h-full object-cover" width={64} height={64} />
                          ) : (
                            (selectedUser.displayName?.[0] || selectedUser.username?.[0] || 'U').toUpperCase()
                          )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.displayName || t('users_no_name')}</h3>
                  <p className="text-gray-500">@{selectedUser.username}</p>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.level}</p>
                  <p className="text-sm text-gray-500">{t('th_level')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{parseInt(selectedUser.points).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{t('th_points')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.referralCount}</p>
                  <p className="text-sm text-gray-500">{t('th_referrals')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900"> - </p>
                  <p className="text-sm text-gray-500">{t('orders')}</p>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-900 mb-4">{t('activity_summary')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">{t('total_spent')}</span>
                    <span className="font-medium text-red-600">-{parseInt(selectedUser.totalSpent).toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">{t('joined')}</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(selectedUser.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">{t('th_last_active')}</span>
                    <span className="font-medium text-gray-900">
                      {selectedUser.lastActiveAt ? format(new Date(selectedUser.lastActiveAt), 'MMM d, yyyy HH:mm') : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
