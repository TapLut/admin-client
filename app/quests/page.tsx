'use client';

import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, GripVertical, ToggleLeft, ToggleRight, ListChecks } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCanManageQuests } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { 
  fetchQuests, 
  createQuestThunk, 
  updateQuestThunk, 
  deleteQuestThunk,
  selectQuests,
  selectQuestsLoading,
  selectQuestsTotal,
  selectQuestsPage
} from '@/store/slices/questsSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge, Modal, Pagination, Input, Table, TableCellText, TableCellActions, TableColumn, SearchFilter, Select } from '@/components/ui';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import { Quest, QuestAction, QuestPlatform } from '@/types';

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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canManageQuests = useAppSelector(selectCanManageQuests);

  const quests = useAppSelector(selectQuests);
  const loading = useAppSelector(selectQuestsLoading);
  const total = useAppSelector(selectQuestsTotal);
  const page = useAppSelector(selectQuestsPage);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [viewQuest, setViewQuest] = useState<Quest | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    action: QuestAction.FOLLOW,
    platform: QuestPlatform.TWITTER,
    rewardPoints: '100',
    targetUrl: '',
    targetAccount: '',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    dispatch(fetchQuests({ 
      page, 
      limit: 10, 
      search: searchQuery, 
      action: typeFilter, 
      platform: platformFilter 
    }));
  }, [dispatch, page, searchQuery, typeFilter, platformFilter]);

  const handlePageChange = (newPage: number) => {
    dispatch(fetchQuests({ 
      page: newPage, 
      limit: 10, 
      search: searchQuery, 
      action: typeFilter, 
      platform: platformFilter 
    }));
  };

  const openCreateModal = () => {
    setSelectedQuest(null);
    setFormData({
      title: '',
      description: '',
      action: QuestAction.FOLLOW,
      platform: QuestPlatform.TWITTER,
      rewardPoints: '100',
      targetUrl: '',
      targetAccount: '',
      isActive: true,
      sortOrder: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (quest: Quest) => {
    setSelectedQuest(quest);
    setFormData({
      title: quest.title,
      description: quest.description || '',
      action: quest.action,
      platform: quest.platform,
      rewardPoints: String(quest.rewardPoints),
      targetUrl: quest.targetUrl,
      targetAccount: (quest as any).targetAccount || '', // Assuming Quest type has targetAccount or we need to add it
      isActive: quest.isActive,
      sortOrder: quest.sortOrder
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedQuest) {
        await dispatch(updateQuestThunk({ id: selectedQuest.id, data: formData })).unwrap();
        dispatch(addToast({ type: 'success', title: 'Success', message: 'Quest updated successfully' }));
      } else {
        await dispatch(createQuestThunk(formData)).unwrap();
        dispatch(addToast({ type: 'success', title: 'Success', message: 'Quest created successfully' }));
        dispatch(fetchQuests({ page, limit: 10 }));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save quest:', error);
      dispatch(addToast({ type: 'error', title: 'Error', message: 'Failed to save quest' }));
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteQuestThunk(deleteId)).unwrap();
      dispatch(addToast({ type: 'success', title: 'Success', message: 'Quest deleted successfully' }));
      dispatch(fetchQuests({ page, limit: 10 }));
    } catch (error) {
      console.error('Failed to delete quest:', error);
      dispatch(addToast({ type: 'error', title: 'Error', message: 'Failed to delete quest' }));
    } finally {
      setDeleteId(null);
    }
  };

  const toggleQuestActive = async (quest: Quest) => {
    try {
      await dispatch(updateQuestThunk({ id: quest.id, data: { isActive: !quest.isActive } })).unwrap();
      dispatch(addToast({ type: 'success', title: 'Success', message: `Quest ${quest.isActive ? 'deactivated' : 'activated'} successfully` }));
    } catch (error) {
      console.error('Failed to toggle quest status:', error);
      dispatch(addToast({ type: 'error', title: 'Error', message: 'Failed to update quest status' }));
    }
  };

  const questTypes = [
    { value: '', label: t('type_all') },
    { value: 'follow', label: t('quest_type_social_follow') },
    { value: 'join', label: t('quest_type_social_join') },
    { value: 'like', label: t('quest_type_social_engage') }, // Mapped generally
    { value: 'retweet', label: 'Retweet' },
    { value: 'comment', label: 'Comment' },
    { value: 'subscribe', label: 'Subscribe' },
    { value: 'share', label: 'Share' },
  ];

  const questPlatforms = [
    { value: '', label: 'All Platforms' },
    { value: 'twitter', label: t('quest_platform_twitter') },
    { value: 'facebook', label: t('quest_platform_facebook') },
    { value: 'instagram', label: t('quest_platform_instagram') },
    { value: 'discord', label: t('quest_platform_discord') },
    { value: 'youtube', label: t('quest_platform_youtube') },
    { value: 'telegram', label: t('quest_platform_telegram') },
    { value: 'tiktok', label: 'TikTok' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('quests')}</h1>
            <p className="text-gray-500 mt-1">{t('manage_social_quests')}</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            {t('add_quest')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ListChecks className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total_quests')}</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
          </Card>
        </div>

        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          searchPlaceholder={t('search_quests')}
          showFiltersButton
          filters={[
            {
              key: 'type',
              label: t('type') || 'Type',
              options: questTypes,
              value: typeFilter,
              onChange: (e) => setTypeFilter(e.target.value),
            },
            {
              key: 'platform',
              label: t('platform') || 'Platform',
              options: questPlatforms,
              value: platformFilter,
              onChange: (e) => setPlatformFilter(e.target.value),
            },
          ]}
          onClearAll={() => {
            setSearchQuery('');
            setTypeFilter('');
            setPlatformFilter('');
          }}
        />

        <Card className="overflow-hidden">
          <Table<Quest>
            columns={[
              {
                key: 'drag',
                header: '',
                render: () => (
                  <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                ),
              },
              {
                key: 'title',
                header: t('th_quest'),
                render: (quest) => (
                  <div>
                    <p className="font-medium text-text-primary">{quest.title}</p>
                    <p className="text-xs text-text-muted truncate max-w-xs">{quest.description}</p>
                  </div>
                ),
              },
              {
                key: 'platform',
                header: t('th_platform'),
                render: (quest) => (
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-icon-purple-bg flex items-center justify-center text-sm">
                      {getPlatformIcon(quest.platform)}
                    </span>
                    <span className="text-sm text-text-primary">{t(`quest_platform_${quest.platform.toLowerCase()}`) || quest.platform}</span>
                  </div>
                ),
              },
              {
                key: 'type',
                header: t('th_type'),
                render: (quest) => (
                  <span className="text-xs bg-icon-purple-bg text-text-secondary px-2 py-1 rounded">
                    {t(`quest_type_${quest.action.toLowerCase()}`) || quest.action}
                  </span>
                ),
              },
              {
                key: 'reward',
                header: t('th_reward'),
                render: (quest) => (
                  <span className="text-sm font-medium text-primary">{quest.rewardPoints} pts</span>
                ),
              },
              {
                key: 'status',
                header: t('th_status'),
                render: (quest) => (
                  <button
                    onClick={() => toggleQuestActive(quest)}
                    className="flex items-center gap-2"
                  >
                    {quest.isActive ? (
                      <ToggleRight className="w-8 h-8 text-success" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-text-muted" />
                    )}
                  </button>
                ),
              },
              {
                key: 'actions',
                header: t('th_actions'),
                render: (quest) => (
                  <TableCellActions
                    actions={[
                      { icon: <Eye className="w-4 h-4" />, onClick: () => setViewQuest(quest), title: t('view') || 'View' },
                      { icon: <Edit className="w-4 h-4" />, onClick: () => openEditModal(quest), title: t('edit') || 'Edit' },
                      { icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(quest.id), title: t('delete') || 'Delete', danger: true },
                    ]}
                  />
                ),
              },
            ]}
            data={quests}
            keyExtractor={(quest) => quest.id}
            isLoading={loading}
            emptyIcon={<ListChecks className="w-12 h-12" />}
            emptyTitle={t('no_quests_found') || 'No quests found'}
            emptyDescription={t('create_first_quest') || 'Get started by creating your first quest'}
            emptyAction={
              canManageQuests && (
                <Button onClick={openCreateModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('create_quest') || 'Create Quest'}
                </Button>
              )
            }
          />
        </Card>

        {total > 0 && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / 10)}
            onPageChange={handlePageChange}
            totalItems={total}
            itemsPerPage={10}
          />
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedQuest ? t('edit_quest') : t('create_new_quest')}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSave}>
                {selectedQuest ? t('save_changes') : t('create_quest')}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input 
                label={t('quest_title')} 
                placeholder={t('enter_quest_title')} 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder={t('enter_quest_description')}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select 
                  label={t('th_type')} 
                  options={questTypes.filter((t) => t.value)} 
                  value={formData.action}
                  onChange={(e) => setFormData({...formData, action: e.target.value as QuestAction})}
              />
              <Select 
                  label={t('platform')} 
                  options={questPlatforms.filter((p) => p.value)} 
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value as QuestPlatform})}
              />
            </div>
            <Input 
                label={t('reward_points')} 
                type="number" 
                placeholder="0" 
                value={formData.rewardPoints}
                onChange={(e) => setFormData({...formData, rewardPoints: e.target.value})}
            />
            <Input 
                label={t('verification_url')} 
                placeholder="https://" 
                value={formData.targetUrl}
                onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
            />
            <Input 
                label="Target Account"
                placeholder="@username or ID" 
                value={formData.targetAccount}
                onChange={(e) => setFormData({...formData, targetAccount: e.target.value})}
            />
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={!!viewQuest}
          onClose={() => setViewQuest(null)}
          title={viewQuest?.title || t('quest_details')}
          size="md"
        >
          {viewQuest && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={viewQuest.isActive ? 'success' : 'default'}>
                  {viewQuest.isActive ? t('status_active') : t('status_inactive')}
                </Badge>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {t(`quest_type_${viewQuest.action.toLowerCase()}`) || viewQuest.action}
                </span>
              </div>

              <p className="text-gray-600">{viewQuest.description}</p>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">{t('platform')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs">
                      {getPlatformIcon(viewQuest.platform)}
                    </span>
                    <span className="font-medium text-gray-900">{t(`quest_platform_${viewQuest.platform.toLowerCase()}`) || viewQuest.platform}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('th_reward')}</p>
                  <p className="font-medium text-blue-600">{viewQuest.rewardPoints} pts</p>
                </div>
              </div>

              {viewQuest.targetUrl && (
                <div className="py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">{t('verification_url')}</p>
                  <a
                    href={viewQuest.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {viewQuest.targetUrl}
                  </a>
                </div>
              )}

              <div className="py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">{t('created')}</p>
                <p className="text-gray-900">
                  {format(new Date(viewQuest.createdAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title={t('confirm_delete_title') || 'Confirm Delete'}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                {t('cancel')}
              </Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                {t('confirm_delete') || 'Delete'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
             <p className="text-gray-600">{t('confirm_delete_message') || 'Are you sure you want to delete this quest? This action cannot be undone.'}</p>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
