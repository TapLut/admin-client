'use client';

import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, GripVertical, ToggleLeft, ToggleRight, ListChecks, Award, Users } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectIsReadOnly, selectCanManageQuests } from '@/store/slices/authSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Select, Badge, getStatusVariant, Modal, Pagination, Input } from '@/components/ui';
import { format } from 'date-fns';

// Mock data
const mockQuests = [
  { id: '1', title: 'Follow on Twitter', description: 'Follow our official Twitter account', type: 'SOCIAL_FOLLOW', platform: 'TWITTER', reward: 100, isActive: true, displayOrder: 1, completions: 1250, verificationUrl: 'https://twitter.com/taplut', createdAt: '2024-01-01T10:00:00Z' },
  { id: '2', title: 'Like our Facebook Page', description: 'Like and follow our Facebook page', type: 'SOCIAL_FOLLOW', platform: 'FACEBOOK', reward: 100, isActive: true, displayOrder: 2, completions: 980, verificationUrl: 'https://facebook.com/taplut', createdAt: '2024-01-02T10:00:00Z' },
  { id: '3', title: 'Join Discord Server', description: 'Join our community Discord server', type: 'SOCIAL_JOIN', platform: 'DISCORD', reward: 150, isActive: true, displayOrder: 3, completions: 850, verificationUrl: 'https://discord.gg/taplut', createdAt: '2024-01-03T10:00:00Z' },
  { id: '4', title: 'Subscribe on YouTube', description: 'Subscribe to our YouTube channel', type: 'SOCIAL_FOLLOW', platform: 'YOUTUBE', reward: 200, isActive: true, displayOrder: 4, completions: 620, verificationUrl: 'https://youtube.com/@taplut', createdAt: '2024-01-04T10:00:00Z' },
  { id: '5', title: 'Retweet Announcement', description: 'Retweet our latest announcement', type: 'SOCIAL_ENGAGE', platform: 'TWITTER', reward: 50, isActive: false, displayOrder: 5, completions: 450, verificationUrl: 'https://twitter.com/taplut/status/123', createdAt: '2024-01-05T10:00:00Z' },
  { id: '6', title: 'Daily Check-in', description: 'Check in daily to earn points', type: 'DAILY', platform: 'IN_APP', reward: 10, isActive: true, displayOrder: 6, completions: 5420, verificationUrl: '', createdAt: '2024-01-06T10:00:00Z' },
  { id: '7', title: 'Refer a Friend', description: 'Invite a friend and earn bonus', type: 'REFERRAL', platform: 'IN_APP', reward: 500, isActive: true, displayOrder: 7, completions: 320, verificationUrl: '', createdAt: '2024-01-07T10:00:00Z' },
];

const questTypes = [
  { value: '', label: 'All Types' },
  { value: 'SOCIAL_FOLLOW', label: 'Social Follow' },
  { value: 'SOCIAL_JOIN', label: 'Social Join' },
  { value: 'SOCIAL_ENGAGE', label: 'Social Engage' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'CUSTOM', label: 'Custom' },
];

const questPlatforms = [
  { value: '', label: 'All Platforms' },
  { value: 'TWITTER', label: 'Twitter' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'DISCORD', label: 'Discord' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'IN_APP', label: 'In-App' },
];

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    TWITTER: '𝕏',
    FACEBOOK: 'f',
    INSTAGRAM: '📷',
    DISCORD: '🎮',
    YOUTUBE: '▶️',
    TELEGRAM: '✈️',
    IN_APP: '📱',
  };
  return icons[platform] || '🔗';
};

export default function QuestsPage() {
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const canManageQuests = useAppSelector(selectCanManageQuests);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<typeof mockQuests[0] | null>(null);
  const [quests, setQuests] = useState(mockQuests);

  // Filter quests
  const filteredQuests = quests.filter((quest) => {
    const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || quest.type === typeFilter;
    const matchesPlatform = !platformFilter || quest.platform === platformFilter;
    return matchesSearch && matchesType && matchesPlatform;
  });

  const toggleQuestActive = (id: string) => {
    setQuests(quests.map(q => 
      q.id === id ? { ...q, isActive: !q.isActive } : q
    ));
  };

  const totalRewardsDistributed = quests.reduce((acc, q) => acc + (q.reward * q.completions), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quests</h1>
            <p className="text-gray-500 mt-1">Manage social quests and reward tasks</p>
          </div>
          {canManageQuests && !isReadOnly && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Quest
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ListChecks className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Quests</p>
              <p className="text-2xl font-bold text-gray-900">{quests.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ListChecks className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Quests</p>
              <p className="text-2xl font-bold text-gray-900">
                {quests.filter(q => q.isActive).length}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Completions</p>
              <p className="text-2xl font-bold text-gray-900">
                {quests.reduce((acc, q) => acc + q.completions, 0).toLocaleString()}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rewards Distributed</p>
              <p className="text-2xl font-bold text-gray-900">
                {(totalRewardsDistributed / 1000).toFixed(0)}k pts
              </p>
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
                  placeholder="Search quests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select
                options={questTypes}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-40"
              />
              <Select
                options={questPlatforms}
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </Card>

        {/* Quests List */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {!isReadOnly && <th className="w-10 py-3 px-4"></th>}
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Quest</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Platform</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Reward</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Completions</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQuests.map((quest) => (
                  <tr key={quest.id} className="hover:bg-gray-50">
                    {!isReadOnly && (
                      <td className="py-3 px-4">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{quest.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{quest.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">
                          {getPlatformIcon(quest.platform)}
                        </span>
                        <span className="text-sm text-gray-900">{quest.platform}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {quest.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-blue-600">{quest.reward} pts</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{quest.completions.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {!isReadOnly ? (
                        <button
                          onClick={() => toggleQuestActive(quest.id)}
                          className="flex items-center gap-2"
                        >
                          {quest.isActive ? (
                            <ToggleRight className="w-8 h-8 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                          )}
                        </button>
                      ) : (
                        <Badge variant={quest.isActive ? 'success' : 'default'}>
                          {quest.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedQuest(quest)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!isReadOnly && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Empty State */}
        {filteredQuests.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quests found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || typeFilter || platformFilter
                ? 'Try adjusting your filters'
                : 'Get started by adding your first quest'}
            </p>
            {canManageQuests && !isReadOnly && !searchQuery && !typeFilter && !platformFilter && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Quest
              </Button>
            )}
          </Card>
        )}

        {/* Pagination */}
        {filteredQuests.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredQuests.length / 10)}
            onPageChange={setCurrentPage}
            totalItems={filteredQuests.length}
            itemsPerPage={10}
          />
        )}

        {/* Create Quest Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Quest"
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button>Create Quest</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input label="Quest Title" placeholder="Enter quest title" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter quest description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Type" options={questTypes.filter((t) => t.value)} />
              <Select label="Platform" options={questPlatforms.filter((p) => p.value)} />
            </div>
            <Input label="Reward (points)" type="number" placeholder="0" />
            <Input label="Verification URL" placeholder="https://" />
          </div>
        </Modal>

        {/* Quest Details Modal */}
        <Modal
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          title={selectedQuest?.title || 'Quest Details'}
          size="md"
        >
          {selectedQuest && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={selectedQuest.isActive ? 'success' : 'default'}>
                  {selectedQuest.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {selectedQuest.type.replace('_', ' ')}
                </span>
              </div>

              <p className="text-gray-600">{selectedQuest.description}</p>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Platform</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs">
                      {getPlatformIcon(selectedQuest.platform)}
                    </span>
                    <span className="font-medium text-gray-900">{selectedQuest.platform}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reward</p>
                  <p className="font-medium text-blue-600">{selectedQuest.reward} pts</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completions</p>
                  <p className="font-medium text-gray-900">{selectedQuest.completions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Distributed</p>
                  <p className="font-medium text-gray-900">
                    {(selectedQuest.reward * selectedQuest.completions).toLocaleString()} pts
                  </p>
                </div>
              </div>

              {selectedQuest.verificationUrl && (
                <div className="py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Verification URL</p>
                  <a
                    href={selectedQuest.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {selectedQuest.verificationUrl}
                  </a>
                </div>
              )}

              <div className="py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Created</p>
                <p className="text-gray-900">
                  {format(new Date(selectedQuest.createdAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
