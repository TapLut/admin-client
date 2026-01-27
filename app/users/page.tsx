'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Users as UsersIcon, Award, TrendingUp, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCanManageUsers } from '@/store/slices/authSlice';
import { fetchUsers, setPage } from '@/store/slices/usersSlice';
import { MainLayout } from '@/components/layout';
import { Card, Select, Modal, Pagination, Badge } from '@/components/ui';
import { format } from 'date-fns';
import { User } from '@/types';

const levelRanges = [
  { value: '', label: 'All Levels' },
  { value: '1-10', label: 'Level 1-10' },
  { value: '11-20', label: 'Level 11-20' },
  { value: '21-30', label: 'Level 21-30' },
  { value: '31+', label: 'Level 31+' },
];

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const canManageUsers = useAppSelector(selectCanManageUsers);

  const { items: users, total, page, limit, totalPages, isLoading } = useAppSelector((state) => state.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

   // Debouce for search
  useEffect(() => {
    const timer = setTimeout(() => {
        dispatch(fetchUsers({ page: 1, limit, search: searchQuery }));
    }, 500);
    return () => clearTimeout(timer);
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">View and manage platform users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Today</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Level</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* Level filter commented out until API support 
            <Select
              options={levelRanges}
              value={''}
              onChange={() => {}}
              className="w-40 opacity-50 cursor-not-allowed"
              disabled
            />
            */}
          </div>
        </Card>

        {/* Users Table */}
        <Card padding="none">
           {isLoading ? (
             <div className="p-8 text-center text-gray-500">Loading users...</div>
           ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Points</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Referrals</th>
                  {/* <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Orders</th> */}
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="p-4 text-center text-gray-500">No users found.</td>
                    </tr>
                ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium overflow-hidden">
                           {user.pictureUrl ? (
                              <img src={user.pictureUrl} alt={user.displayName || user.username || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            (user.displayName?.[0] || user.username?.[0] || 'U').toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.displayName || 'No Name'}</p>
                          <p className="text-xs text-gray-500">@{user.username || 'unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(user.level)}`}>
                        Lv. {user.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-blue-600">
                      {parseInt(user.points).toLocaleString()} pts
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{user.referralCount}</td>
                    {/* <td className="py-3 px-4 text-sm text-gray-900">{user.ordersPlaced}</td> */}
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {user.lastActiveAt ? format(new Date(user.lastActiveAt), 'MMM d, HH:mm') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
           )}
           {/* Pagination */}
           {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200">
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
          title="User Details"
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                   {selectedUser.pictureUrl ? (
                              <img src={selectedUser.pictureUrl} alt={selectedUser.displayName || selectedUser.username || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            (selectedUser.displayName?.[0] || selectedUser.username?.[0] || 'U').toUpperCase()
                          )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.displayName || 'No Name'}</h3>
                  <p className="text-gray-500">@{selectedUser.username}</p>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.level}</p>
                  <p className="text-sm text-gray-500">Level</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{parseInt(selectedUser.points).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Points</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedUser.referralCount}</p>
                  <p className="text-sm text-gray-500">Referrals</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900"> - </p>
                  <p className="text-sm text-gray-500">Orders</p>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-900 mb-4">Activity Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Total Spent</span>
                    <span className="font-medium text-red-600">-{parseInt(selectedUser.totalSpent).toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Joined</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(selectedUser.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Last Active</span>
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
