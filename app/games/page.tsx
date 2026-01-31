'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Gamepad2, 
  Trophy, 
  Users, 
  Play,
  Clock,
  Target,
  Puzzle,
  Brain,
  Zap,
  Grid3X3,
  Wrench
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge, Modal, Pagination, Input, Table, TableCellText, TableCellWithIcon, TableCellActions, TableColumn, SearchFilter, Select } from '@/components/ui';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import { gamesService } from '@/services/games.service';
import { 
  Game, 
  GameTemplate, 
  GameStats, 
  GameTemplateType, 
  GameStatus, 
  GameDifficulty,
  AdminRole,
  CreateGameReq,
  UpdateGameReq
} from '@/types';

const getTemplateIcon = (type: GameTemplateType) => {
  const icons: Record<GameTemplateType, React.ReactNode> = {
    [GameTemplateType.MEMORY]: <Grid3X3 className="w-5 h-5" />,
    [GameTemplateType.QUIZ]: <Brain className="w-5 h-5" />,
    [GameTemplateType.REACTION]: <Zap className="w-5 h-5" />,
    [GameTemplateType.TETRIS]: <Puzzle className="w-5 h-5" />,
    [GameTemplateType.PUZZLE]: <Puzzle className="w-5 h-5" />,
    [GameTemplateType.CATCH]: <Target className="w-5 h-5" />,
    [GameTemplateType.WHACK]: <Gamepad2 className="w-5 h-5" />,
  };
  return icons[type] || <Gamepad2 className="w-5 h-5" />;
};

const getStatusVariant = (status: GameStatus): 'success' | 'warning' | 'default' | 'danger' => {
  const variants: Record<GameStatus, 'success' | 'warning' | 'default' | 'danger'> = {
    [GameStatus.ACTIVE]: 'success',
    [GameStatus.DRAFT]: 'warning',
    [GameStatus.INACTIVE]: 'default',
    [GameStatus.ARCHIVED]: 'danger',
  };
  return variants[status] || 'default';
};

const getDifficultyVariant = (difficulty: GameDifficulty): 'success' | 'warning' | 'danger' => {
  const variants: Record<GameDifficulty, 'success' | 'warning' | 'danger'> = {
    [GameDifficulty.EASY]: 'success',
    [GameDifficulty.MEDIUM]: 'warning',
    [GameDifficulty.HARD]: 'danger',
  };
  return variants[difficulty];
};

export default function GamesPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === AdminRole.SUPER_ADMIN || userRole === AdminRole.ADMIN;

  // State
  const [games, setGames] = useState<Game[]>([]);
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [viewGame, setViewGame] = useState<Game | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CreateGameReq>({
    name: '',
    description: '',
    templateType: GameTemplateType.MEMORY,
    difficulty: GameDifficulty.MEDIUM,
    status: GameStatus.DRAFT,
    rewardPointsBase: 100,
    rewardPointsBonus: 50,
    dailyPlayLimit: 3,
    isActive: true,
    config: {
      timeLimit: 120,
      showLeaderboard: true,
    },
  });

  // Fetch games
  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const response = await gamesService.getGames({
        page,
        limit,
        search: searchQuery || undefined,
        templateType: templateFilter as GameTemplateType || undefined,
        status: statusFilter as GameStatus || undefined,
        difficulty: difficultyFilter as GameDifficulty || undefined,
      });
      setGames(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('error_loading_games') || 'Failed to load games' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch, page, searchQuery, templateFilter, statusFilter, difficultyFilter, t]);

  // Fetch templates and stats
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [templatesData, statsData] = await Promise.all([
          gamesService.getTemplates(),
          gamesService.getStats(),
        ]);
        setTemplates(templatesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const openTemplateSelector = () => {
    setIsTemplateModalOpen(true);
  };

  const selectTemplate = (template: GameTemplate) => {
    setFormData({
      name: '',
      description: '',
      templateType: template.type,
      difficulty: GameDifficulty.MEDIUM,
      status: GameStatus.DRAFT,
      rewardPointsBase: 100,
      rewardPointsBonus: 50,
      dailyPlayLimit: 3,
      isActive: true,
      config: template.defaultConfig as any,
    });
    setSelectedGame(null);
    setIsTemplateModalOpen(false);
    setIsModalOpen(true);
  };

  const openEditModal = (game: Game) => {
    setSelectedGame(game);
    setFormData({
      name: game.name,
      description: game.description || '',
      templateType: game.templateType,
      difficulty: game.difficulty,
      status: game.status,
      rewardPointsBase: parseInt(game.rewardPointsBase) || 0,
      rewardPointsBonus: parseInt(game.rewardPointsBonus) || 0,
      rewardTickets: game.rewardTickets,
      dailyPlayLimit: game.dailyPlayLimit || undefined,
      totalPlayLimit: game.totalPlayLimit || undefined,
      isActive: game.isActive,
      isPvpEnabled: game.isPvpEnabled,
      pvpMaxPlayers: game.pvpMaxPlayers,
      config: game.config,
      startsAt: game.startsAt || undefined,
      expiresAt: game.expiresAt || undefined,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('game_name_required') || 'Game name is required' }));
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedGame) {
        await gamesService.updateGame(selectedGame.id, formData as UpdateGameReq);
        dispatch(addToast({ type: 'success', title: t('success') || 'Success', message: t('game_updated') || 'Game updated successfully' }));
      } else {
        await gamesService.createGame(formData);
        dispatch(addToast({ type: 'success', title: t('success') || 'Success', message: t('game_created') || 'Game created successfully' }));
      }
      setIsModalOpen(false);
      fetchGames();
    } catch (error) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('error_saving_game') || 'Failed to save game' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (game: Game) => {
    try {
      await gamesService.duplicateGame(game.id);
      dispatch(addToast({ type: 'success', title: t('success') || 'Success', message: t('game_duplicated') || 'Game duplicated successfully' }));
      fetchGames();
    } catch (error) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('error_duplicating_game') || 'Failed to duplicate game' }));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await gamesService.deleteGame(deleteId);
      dispatch(addToast({ type: 'success', title: t('success') || 'Success', message: t('game_deleted') || 'Game deleted successfully' }));
      setDeleteId(null);
      fetchGames();
    } catch (error) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('error_deleting_game') || 'Failed to delete game' }));
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('games') || 'Games'}</h1>
            <p className="text-gray-500 mt-1">
              {t('games_description') || 'Create and manage games for users to play and earn points'}
            </p>
          </div>
          <Button onClick={openTemplateSelector} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('create_game') || 'Create Game'}
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Gamepad2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('total_games') || 'Total Games'}</p>
                  <p className="text-xl font-bold">{stats.totalGames}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('active_games') || 'Active Games'}</p>
                  <p className="text-xl font-bold">{stats.activeGames}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('total_plays') || 'Total Plays'}</p>
                  <p className="text-xl font-bold">{stats.totalPlays.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('unique_players') || 'Unique Players'}</p>
                  <p className="text-xl font-bold">{stats.uniquePlayers.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          searchPlaceholder={t('search_games') || 'Search games...'}
          showFiltersButton
          filters={[
            {
              key: 'templateType',
              label: t('type') || 'Type',
              options: [
                { value: '', label: t('all_types') || 'All Types' },
                ...Object.values(GameTemplateType).map((type) => ({
                  value: type,
                  label: t(`game_type_${type}`) || type,
                })),
              ],
              value: templateFilter,
              onChange: (e) => setTemplateFilter(e.target.value),
            },
            {
              key: 'status',
              label: t('status') || 'Status',
              options: [
                { value: '', label: t('all_statuses') || 'All Statuses' },
                ...Object.values(GameStatus).map((status) => ({
                  value: status,
                  label: t(`status_${status}`) || status,
                })),
              ],
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
            },
            {
              key: 'difficulty',
              label: t('difficulty') || 'Difficulty',
              options: [
                { value: '', label: t('all_difficulties') || 'All Difficulties' },
                ...Object.values(GameDifficulty).map((diff) => ({
                  value: diff,
                  label: t(`difficulty_${diff}`) || diff,
                })),
              ],
              value: difficultyFilter,
              onChange: (e) => setDifficultyFilter(e.target.value),
            },
          ]}
          onClearAll={() => {
            setSearchQuery('');
            setTemplateFilter('');
            setStatusFilter('');
            setDifficultyFilter('');
          }}
        />

        {/* Games Table */}
        <Card className="overflow-hidden">
          <Table<Game>
            columns={[
              {
                key: 'name',
                header: t('th_game') || 'Game',
                render: (game) => (
                  <TableCellWithIcon
                    icon={getTemplateIcon(game.templateType)}
                    iconBgClass="bg-icon-blue-bg"
                    title={game.name}
                    subtitle={game.description || t('no_description') || 'No description'}
                  />
                ),
              },
              {
                key: 'type',
                header: t('th_type') || 'Type',
                render: (game) => (
                  <Badge variant="default">
                    {t(`game_type_${game.templateType}`) || game.templateType}
                  </Badge>
                ),
              },
              {
                key: 'difficulty',
                header: t('th_difficulty') || 'Difficulty',
                render: (game) => (
                  <Badge variant={getDifficultyVariant(game.difficulty)}>
                    {t(`difficulty_${game.difficulty}`) || game.difficulty}
                  </Badge>
                ),
              },
              {
                key: 'reward',
                header: t('th_reward') || 'Reward',
                render: (game) => (
                  <span className="font-medium text-primary">
                    {parseInt(game.rewardPointsBase).toLocaleString()} pts
                  </span>
                ),
              },
              {
                key: 'plays',
                header: t('th_plays') || 'Plays',
                render: (game) => (
                  <TableCellText text={game.totalPlays.toLocaleString()} muted />
                ),
              },
              {
                key: 'status',
                header: t('th_status') || 'Status',
                render: (game) => (
                  <Badge variant={getStatusVariant(game.status)}>
                    {t(`status_${game.status}`) || game.status}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: t('th_actions') || 'Actions',
                render: (game) => (
                  <TableCellActions
                    actions={[
                      { icon: <Wrench className="w-4 h-4" />, onClick: () => router.push(`/games/builder?gameId=${game.id}`), title: t('build') || 'Build' },
                      { icon: <Eye className="w-4 h-4" />, onClick: () => setViewGame(game), title: t('view') || 'View' },
                      { icon: <Edit className="w-4 h-4" />, onClick: () => openEditModal(game), title: t('edit') || 'Edit' },
                      { icon: <Copy className="w-4 h-4" />, onClick: () => handleDuplicate(game), title: t('duplicate') || 'Duplicate' },
                      { icon: <Trash2 className="w-4 h-4" />, onClick: () => setDeleteId(game.id), title: t('delete') || 'Delete', danger: true },
                    ]}
                  />
                ),
              },
            ]}
            data={games}
            keyExtractor={(game) => game.id}
            isLoading={loading}
            emptyIcon={<Gamepad2 className="w-12 h-12" />}
            emptyTitle={t('no_games_found') || 'No games found'}
            emptyDescription={t('create_first_game') || 'Get started by creating your first game'}
            emptyAction={
              <Button onClick={openTemplateSelector}>
                <Plus className="w-4 h-4 mr-2" />
                {t('create_game') || 'Create Game'}
              </Button>
            }
          />
        </Card>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={total}
            itemsPerPage={limit}
          />
        )}

        {/* Template Selection Modal */}
        <Modal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          title={t('select_game_template') || 'Select Game Template'}
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.type}
                onClick={() => selectTemplate(template)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getTemplateIcon(template.type)}
                  </div>
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-500">{template.description}</p>
              </button>
            ))}
          </div>
        </Modal>

        {/* Create/Edit Game Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedGame ? (t('edit_game') || 'Edit Game') : (t('create_game') || 'Create Game')}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                {t('cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting 
                  ? (t('saving') || 'Saving...') 
                  : selectedGame 
                    ? (t('save_changes') || 'Save Changes')
                    : (t('create_game') || 'Create Game')
                }
              </Button>
            </div>
          }
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Game Template Badge */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              {getTemplateIcon(formData.templateType)}
              <span className="font-medium text-blue-700">
                {t(`game_type_${formData.templateType}`) || formData.templateType}
              </span>
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('game_name') || 'Game Name'} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('enter_game_name') || 'Enter game name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description') || 'Description'}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('enter_game_description') || 'Enter game description'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('difficulty') || 'Difficulty'}
                </label>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as GameDifficulty })}
                  options={Object.values(GameDifficulty).map((diff) => ({
                    value: diff,
                    label: t(`difficulty_${diff}`) || diff,
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('status') || 'Status'}
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as GameStatus })}
                  options={Object.values(GameStatus).map((status) => ({
                    value: status,
                    label: t(`status_${status}`) || status,
                  }))}
                />
              </div>
            </div>

            {/* Rewards */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">{t('rewards') || 'Rewards'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('base_points') || 'Base Points'}
                  </label>
                  <Input
                    type="number"
                    value={formData.rewardPointsBase || 0}
                    onChange={(e) => setFormData({ ...formData, rewardPointsBase: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bonus_points') || 'Bonus Points'}
                  </label>
                  <Input
                    type="number"
                    value={formData.rewardPointsBonus || 0}
                    onChange={(e) => setFormData({ ...formData, rewardPointsBonus: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Play Limits */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">{t('play_limits') || 'Play Limits'}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('daily_limit') || 'Daily Limit'}
                  </label>
                  <Input
                    type="number"
                    value={formData.dailyPlayLimit || ''}
                    onChange={(e) => setFormData({ ...formData, dailyPlayLimit: parseInt(e.target.value) || undefined })}
                    placeholder={t('unlimited') || 'Unlimited'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('total_limit') || 'Total Limit'}
                  </label>
                  <Input
                    type="number"
                    value={formData.totalPlayLimit || ''}
                    onChange={(e) => setFormData({ ...formData, totalPlayLimit: parseInt(e.target.value) || undefined })}
                    placeholder={t('unlimited') || 'Unlimited'}
                  />
                </div>
              </div>
            </div>

            {/* Game Config */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">{t('game_settings') || 'Game Settings'}</h4>
              
              {/* Time Limit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('time_limit') || 'Time Limit (seconds)'}
                </label>
                <Input
                  type="number"
                  value={formData.config?.timeLimit || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, timeLimit: parseInt(e.target.value) || undefined }
                  })}
                  placeholder="120"
                />
              </div>

              {/* Template-specific settings */}
              {formData.templateType === GameTemplateType.MEMORY && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('grid_size') || 'Grid Size'}
                  </label>
                  <Select
                    value={String(formData.config?.gridSize || 4)}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, gridSize: parseInt(e.target.value) }
                    })}
                    options={[
                      { value: '2', label: '2x2 (4 cards)' },
                      { value: '4', label: '4x4 (16 cards)' },
                      { value: '6', label: '6x6 (36 cards)' },
                    ]}
                  />
                </div>
              )}

              {formData.templateType === GameTemplateType.REACTION && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('target_time') || 'Target Time (seconds)'}
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.config?.targetTime || 10}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, targetTime: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tolerance') || 'Tolerance (seconds)'}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.config?.tolerance || 0.1}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, tolerance: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              )}

              {formData.templateType === GameTemplateType.TETRIS && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('speed') || 'Speed (1-10)'}
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.config?.speed || 5}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, speed: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('lines_to_clear') || 'Lines to Clear'}
                    </label>
                    <Input
                      type="number"
                      value={formData.config?.linesToClear || 40}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, linesToClear: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              )}

              {formData.templateType === GameTemplateType.CATCH && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('items_to_collect') || 'Items to Collect'}
                    </label>
                    <Input
                      type="number"
                      value={formData.config?.itemsToCollect || 50}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, itemsToCollect: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('fall_speed') || 'Fall Speed (1-10)'}
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.config?.fallSpeed || 5}
                      onChange={(e) => setFormData({
                        ...formData,
                        config: { ...formData.config, fallSpeed: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              )}

              {/* Show Leaderboard toggle */}
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="showLeaderboard"
                  checked={formData.config?.showLeaderboard ?? true}
                  onChange={(e) => setFormData({
                    ...formData,
                    config: { ...formData.config, showLeaderboard: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showLeaderboard" className="ml-2 text-sm text-gray-700">
                  {t('show_leaderboard') || 'Show Leaderboard'}
                </label>
              </div>
            </div>

            {/* Advertisement Settings */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">{t('advertisement') || 'Advertisement'}</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('ad_banner_url') || 'Banner Image URL'}
                  </label>
                  <Input
                    value={formData.config?.adBannerUrl || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, adBannerUrl: e.target.value }
                    })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('ad_banner_link') || 'Banner Link URL'}
                  </label>
                  <Input
                    value={formData.config?.adBannerLink || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, adBannerLink: e.target.value }
                    })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showAdAfterGame"
                    checked={formData.config?.showAdAfterGame ?? false}
                    onChange={(e) => setFormData({
                      ...formData,
                      config: { ...formData.config, showAdAfterGame: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showAdAfterGame" className="ml-2 text-sm text-gray-700">
                    {t('show_ad_after_game') || 'Show ad after game ends'}
                  </label>
                </div>
              </div>
            </div>

            {/* PvP Settings */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">{t('pvp_settings') || 'PvP Settings'}</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPvpEnabled"
                    checked={formData.isPvpEnabled ?? false}
                    onChange={(e) => setFormData({ ...formData, isPvpEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPvpEnabled" className="ml-2 text-sm text-gray-700">
                    {t('enable_pvp') || 'Enable PvP Mode'}
                  </label>
                </div>
                {formData.isPvpEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('max_players') || 'Max Players'}
                      </label>
                      <Input
                        type="number"
                        min={2}
                        max={10}
                        value={formData.pvpMaxPlayers || 2}
                        onChange={(e) => setFormData({ ...formData, pvpMaxPlayers: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('match_duration') || 'Match Duration (sec)'}
                      </label>
                      <Input
                        type="number"
                        min={30}
                        value={formData.pvpMatchDuration || 120}
                        onChange={(e) => setFormData({ ...formData, pvpMatchDuration: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>

        {/* View Game Modal */}
        <Modal
          isOpen={!!viewGame}
          onClose={() => setViewGame(null)}
          title={viewGame?.name || ''}
          size="md"
        >
          {viewGame && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getTemplateIcon(viewGame.templateType)}
                <div>
                  <p className="font-medium">{t(`game_type_${viewGame.templateType}`) || viewGame.templateType}</p>
                  <Badge variant={getStatusVariant(viewGame.status)}>
                    {t(`status_${viewGame.status}`) || viewGame.status}
                  </Badge>
                </div>
              </div>

              {viewGame.description && (
                <p className="text-gray-600">{viewGame.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('base_reward') || 'Base Reward'}</p>
                  <p className="text-xl font-bold text-blue-600">
                    {parseInt(viewGame.rewardPointsBase).toLocaleString()} pts
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">{t('total_plays') || 'Total Plays'}</p>
                  <p className="text-xl font-bold text-green-600">
                    {viewGame.totalPlays.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">{t('game_config') || 'Configuration'}</h4>
                <pre className="p-3 bg-gray-100 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(viewGame.config, null, 2)}
                </pre>
              </div>

              <div className="text-sm text-gray-500">
                {t('created') || 'Created'}: {format(new Date(viewGame.createdAt), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title={t('delete_game') || 'Delete Game'}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteId(null)}>
                {t('cancel') || 'Cancel'}
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                {t('delete') || 'Delete'}
              </Button>
            </div>
          }
        >
          <p className="text-gray-600">
            {t('delete_game_confirm') || 'Are you sure you want to delete this game? This action cannot be undone.'}
          </p>
        </Modal>
      </div>
    </MainLayout>
  );
}
