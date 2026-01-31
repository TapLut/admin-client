'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Trash2,
  GripVertical,
  Check,
  AlertCircle,
  Eye,
  Grid3X3,
  Brain,
  Zap,
  Puzzle,
  Target,
  Gamepad2,
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Badge, Input, Select, Modal } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { gamesService } from '@/services/games.service';
import {
  Game,
  GameAsset,
  GameAssetType,
  GameTemplateType,
  TemplateRequirement,
  QuestionData,
  CreateGameAssetReq,
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

export default function GameBuilderPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');

  // State
  const [game, setGame] = useState<Game | null>(null);
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [requirements, setRequirements] = useState<Record<GameTemplateType, TemplateRequirement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  // Asset Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<GameAsset | null>(null);
  const [assetForm, setAssetForm] = useState<Partial<CreateGameAssetReq>>({});

  // Fetch game and assets
  const loadData = useCallback(async () => {
    if (!gameId) {
      router.push('/games');
      return;
    }

    try {
      setLoading(true);
      const [gameData, assetsData, requirementsData] = await Promise.all([
        gamesService.getGame(parseInt(gameId)),
        gamesService.getAssetsByGame(parseInt(gameId)),
        gamesService.getTemplateRequirements(),
      ]);
      setGame(gameData);
      setAssets(assetsData);
      setRequirements(requirementsData);

      // Validate assets
      const validationResult = await gamesService.validateGameAssets(parseInt(gameId));
      setValidation(validationResult);
    } catch (error) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('error_loading_game') || 'Failed to load game' }));
      router.push('/games');
    } finally {
      setLoading(false);
    }
  }, [gameId, router, dispatch, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requirement = game && requirements ? requirements[game.templateType] : null;

  // Open asset modal for create/edit
  const openAssetModal = (asset?: GameAsset) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetForm({
        type: asset.type,
        name: asset.name,
        description: asset.description || '',
        imageUrl: asset.imageUrl || '',
        questionData: asset.questionData || undefined,
      });
    } else {
      setEditingAsset(null);
      setAssetForm({
        type: requirement?.requiredAssetType || GameAssetType.IMAGE,
        name: '',
        description: '',
        imageUrl: '',
        questionData: requirement?.requiredAssetType === GameAssetType.QUESTION ? {
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
        } : undefined,
      });
    }
    setIsAssetModalOpen(true);
  };

  // Save asset
  const handleSaveAsset = async () => {
    if (!game) return;

    // Validate
    if (!assetForm.name?.trim()) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('asset_name_required') || 'Asset name is required' }));
      return;
    }

    if (assetForm.type === GameAssetType.IMAGE && !assetForm.imageUrl?.trim()) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('image_url_required') || 'Image URL is required' }));
      return;
    }

    if (assetForm.type === GameAssetType.QUESTION) {
      if (!assetForm.questionData?.question?.trim()) {
        dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('question_required') || 'Question is required' }));
        return;
      }
      const validOptions = assetForm.questionData.options.filter(o => o.trim());
      if (validOptions.length < 2) {
        dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('min_options_required') || 'At least 2 options are required' }));
        return;
      }
    }

    setSaving(true);
    try {
      if (editingAsset) {
        await gamesService.updateAsset(editingAsset.id, assetForm);
        dispatch(addToast({ type: 'success', title: t('success') || 'Success', message: t('asset_updated') || 'Asset updated successfully' }));
      } else {
        await gamesService.createAsset({
          ...assetForm as CreateGameAssetReq,
          gameId: game.id,
        });
        dispatch(addToast({ type: 'success', title: t('success') || 'Success', message: t('asset_created') || 'Asset created successfully' }));
      }
      setIsAssetModalOpen(false);
      loadData();
    } catch (error) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('error_saving_asset') || 'Failed to save asset' }));
    } finally {
      setSaving(false);
    }
  };

  // Delete asset
  const handleDeleteAsset = async (assetId: number) => {
    if (!confirm(t('confirm_delete_asset') || 'Are you sure you want to delete this asset?')) return;

    try {
      await gamesService.deleteAsset(assetId);
      dispatch(addToast({ type: 'success', title: t('success') || 'Success', message: t('asset_deleted') || 'Asset deleted successfully' }));
      loadData();
    } catch (error) {
      dispatch(addToast({ type: 'error', title: t('error') || 'Error', message: t('error_deleting_asset') || 'Failed to delete asset' }));
    }
  };

  // Update question option
  const updateQuestionOption = (index: number, value: string) => {
    if (!assetForm.questionData) return;
    const newOptions = [...assetForm.questionData.options];
    newOptions[index] = value;
    setAssetForm({
      ...assetForm,
      questionData: { ...assetForm.questionData, options: newOptions },
    });
  };

  // Add question option
  const addQuestionOption = () => {
    if (!assetForm.questionData) return;
    setAssetForm({
      ...assetForm,
      questionData: { ...assetForm.questionData, options: [...assetForm.questionData.options, ''] },
    });
  };

  // Remove question option
  const removeQuestionOption = (index: number) => {
    if (!assetForm.questionData || assetForm.questionData.options.length <= 2) return;
    const newOptions = assetForm.questionData.options.filter((_, i) => i !== index);
    let newCorrectIndex = assetForm.questionData.correctIndex;
    if (index < newCorrectIndex) {
      newCorrectIndex--;
    } else if (index === newCorrectIndex) {
      newCorrectIndex = 0;
    }
    setAssetForm({
      ...assetForm,
      questionData: { ...assetForm.questionData, options: newOptions, correctIndex: newCorrectIndex },
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!game) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">{t('game_not_found') || 'Game not found'}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => router.push('/games')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{t('game_builder') || 'Game Builder'}</h1>
                <Badge variant="default" className="flex items-center gap-1">
                  {getTemplateIcon(game.templateType)}
                  {t(`game_type_${game.templateType}`) || game.templateType}
                </Badge>
              </div>
              <p className="text-gray-500 mt-1">{game.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {validation && (
              <Badge variant={validation.isValid ? 'success' : 'warning'} className="flex items-center gap-1">
                {validation.isValid ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {validation.isValid ? (t('ready_to_publish') || 'Ready to Publish') : (t('needs_assets') || 'Needs Assets')}
              </Badge>
            )}
          </div>
        </div>

        {/* Requirements Info */}
        {requirement && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {requirement.requiredAssetType === GameAssetType.IMAGE ? (
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-blue-900">{t('template_requirements') || 'Template Requirements'}</h3>
                <p className="text-sm text-blue-700 mt-1">{requirement.description}</p>
                <p className="text-xs text-blue-600 mt-2">
                  {t('assets_required') || 'Required'}: {requirement.minAssets} - {requirement.maxAssets} {requirement.requiredAssetType} assets
                  <span className="ml-3">
                    {t('current_count') || 'Current'}: {assets.filter(a => a.type === requirement.requiredAssetType).length}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Validation Errors */}
        {validation && !validation.isValid && validation.errors.length > 0 && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">{t('validation_issues') || 'Validation Issues'}</h3>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                  {validation.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Assets List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('game_assets') || 'Game Assets'}</h2>
            <Button onClick={() => openAssetModal()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('add_asset') || 'Add Asset'}
            </Button>
          </div>

          {assets.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                {requirement?.requiredAssetType === GameAssetType.IMAGE ? (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                ) : (
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {t('no_assets_yet') || 'No assets yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {requirement?.description || t('add_assets_to_game') || 'Add assets to customize your game'}
              </p>
              <Button onClick={() => openAssetModal()}>
                <Plus className="w-4 h-4 mr-2" />
                {t('add_first_asset') || 'Add First Asset'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset, index) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="text-gray-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-gray-500 w-8">#{index + 1}</div>
                  
                  {/* Asset Preview */}
                  {asset.type === GameAssetType.IMAGE && asset.imageUrl && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={asset.imageUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                  )}
                  
                  {asset.type === GameAssetType.QUESTION && (
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                  )}

                  {/* Asset Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{asset.name}</h4>
                    {asset.type === GameAssetType.QUESTION && asset.questionData && (
                      <p className="text-sm text-gray-500 truncate">{asset.questionData.question}</p>
                    )}
                    {asset.description && (
                      <p className="text-sm text-gray-500 truncate">{asset.description}</p>
                    )}
                  </div>

                  {/* Asset Type Badge */}
                  <Badge variant="default" className="capitalize">
                    {asset.type}
                  </Badge>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openAssetModal(asset)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Asset Create/Edit Modal */}
        <Modal
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          title={editingAsset ? (t('edit_asset') || 'Edit Asset') : (t('add_asset') || 'Add Asset')}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsAssetModalOpen(false)}>
                {t('cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleSaveAsset} disabled={saving}>
                {saving ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
              </Button>
            </div>
          }
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('asset_type') || 'Asset Type'}
              </label>
              <Select
                value={assetForm.type || GameAssetType.IMAGE}
                onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value as GameAssetType })}
                options={[
                  { value: GameAssetType.IMAGE, label: t('image') || 'Image' },
                  { value: GameAssetType.QUESTION, label: t('question') || 'Question' },
                  { value: GameAssetType.AUDIO, label: t('audio') || 'Audio' },
                  { value: GameAssetType.CONFIG, label: t('config') || 'Config' },
                ]}
              />
            </div>

            {/* Asset Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('asset_name') || 'Asset Name'} *
              </label>
              <Input
                value={assetForm.name || ''}
                onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                placeholder={t('enter_asset_name') || 'Enter asset name'}
              />
            </div>

            {/* Asset Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description') || 'Description'}
              </label>
              <Input
                value={assetForm.description || ''}
                onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
                placeholder={t('enter_description') || 'Enter description (optional)'}
              />
            </div>

            {/* Image URL (for IMAGE type) */}
            {assetForm.type === GameAssetType.IMAGE && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('image_url') || 'Image URL'} *
                </label>
                <Input
                  value={assetForm.imageUrl || ''}
                  onChange={(e) => setAssetForm({ ...assetForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {assetForm.imageUrl && (
                  <div className="mt-2 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={assetForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Question Fields (for QUESTION type) */}
            {assetForm.type === GameAssetType.QUESTION && assetForm.questionData && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('question') || 'Question'} *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={assetForm.questionData.question || ''}
                    onChange={(e) => setAssetForm({
                      ...assetForm,
                      questionData: { ...assetForm.questionData!, question: e.target.value },
                    })}
                    placeholder={t('enter_question') || 'Enter your question'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('answer_options') || 'Answer Options'} *
                  </label>
                  <div className="space-y-2">
                    {assetForm.questionData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAssetForm({
                            ...assetForm,
                            questionData: { ...assetForm.questionData!, correctIndex: index },
                          })}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            assetForm.questionData?.correctIndex === index
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                        >
                          {assetForm.questionData?.correctIndex === index ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span className="text-sm">{String.fromCharCode(65 + index)}</span>
                          )}
                        </button>
                        <Input
                          value={option}
                          onChange={(e) => updateQuestionOption(index, e.target.value)}
                          placeholder={`${t('option') || 'Option'} ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                        {assetForm.questionData && assetForm.questionData.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestionOption(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {assetForm.questionData && assetForm.questionData.options.length < 6 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={addQuestionOption}
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {t('add_option') || 'Add Option'}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('click_to_mark_correct') || 'Click the circle to mark the correct answer'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('explanation') || 'Explanation (optional)'}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    value={assetForm.questionData.explanation || ''}
                    onChange={(e) => setAssetForm({
                      ...assetForm,
                      questionData: { ...assetForm.questionData!, explanation: e.target.value },
                    })}
                    placeholder={t('enter_explanation') || 'Explain why this answer is correct'}
                  />
                </div>
              </>
            )}
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
