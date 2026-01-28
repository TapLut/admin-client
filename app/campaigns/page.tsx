'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Calendar, DollarSign, Megaphone } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { selectIsSponsor, selectIsReadOnly, selectSponsorId } from '@/store/slices/authSlice';
import { 
  fetchCampaigns, 
  fetchCampaignStats,
  createCampaignThunk, 
  updateCampaignThunk, 
  deleteCampaignThunk, 
  setFilters,
  setSelectedCampaign,
  setPage
} from '@/store/slices/campaignsSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Select, Badge, getStatusVariant, Modal, Pagination, Input } from '@/components/ui';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import { Campaign, CampaignStatus } from '@/types';

export default function CampaignsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isSponsor = useAppSelector(selectIsSponsor);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const currentSponsorId = useAppSelector(selectSponsorId);

  const { 
    items: campaigns, 
    total, 
    page, 
    limit, 
    totalPages,
    filters,
    stats,
    isLoading,
    selectedCampaign
  } = useAppSelector((state) => state.campaigns);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    campaignType: 'awareness',
    platform: 'twitter',
    costPerAction: '0.1',
    rewardPointsPerAction: '10'
  });

  const campaignStatuses = [
    { value: '', label: t('status_all') || 'All Status' },
    { value: CampaignStatus.DRAFT, label: t('status_draft') || 'Draft' },
    { value: CampaignStatus.SCHEDULED, label: t('status_scheduled') || 'Scheduled' },
    { value: CampaignStatus.ACTIVE, label: t('status_active') || 'Active' },
    { value: CampaignStatus.PAUSED, label: t('status_paused') || 'Paused' },
    { value: CampaignStatus.ENDED, label: t('status_ended') || 'Ended' },
  ];

  const campaignTypeOptions = [
    { value: 'awareness', label: 'Awareness' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'lead', label: 'Lead' }
  ];

  const platformOptions = [
    { value: 'twitter', label: 'Twitter' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'discord', label: 'Discord' }
  ];

  const fetchData = useCallback(() => {
    dispatch(fetchCampaigns({
      page,
      limit,
      search: filters.search,
      status: filters.status || undefined,
      sponsorId: isSponsor && currentSponsorId ? currentSponsorId.toString() : undefined,
    }));
    dispatch(fetchCampaignStats());
  }, [dispatch, page, limit, filters, isSponsor, currentSponsorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatusFilter(val);
    dispatch(setFilters({ status: (val || null) as CampaignStatus | null }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleDelete = async (id: number) => {
    if (confirm(t('confirm_delete_campaign') || 'Are you sure you want to delete this campaign?')) {
      await dispatch(deleteCampaignThunk(id));
      fetchData(); // Refresh list
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.companyName || !formData.startDate || !formData.endDate || !formData.budget) {
        dispatch(addToast({
          type: 'error',
          title: t('error') || 'Error',
          message: t('fill_required_fields') || 'Please fill strictly required fields',
        }));
        return;
      }

      const payload: any = {
        name: formData.name,
        companyName: formData.companyName,
        description: formData.description,
        sponsorId: currentSponsorId ? currentSponsorId.toString() : null,
        startsAt: formData.startDate,
        endsAt: formData.endDate,
        totalBudget: Number(formData.budget),
        campaignType: formData.campaignType,
        platform: formData.platform,
        costPerAction: Number(formData.costPerAction),
        rewardPointsPerAction: formData.rewardPointsPerAction,
        targetAccounts: [],
      };

      await dispatch(createCampaignThunk(payload)).unwrap();
      
      dispatch(addToast({
        type: 'success',
        title: t('success') || 'Success',
        message: t('campaign_created') || 'Campaign created successfully',
      }));

      setIsCreateModalOpen(false);
      setFormData({ 
        name: '', 
        companyName: '',
        description: '', 
        startDate: '', 
        endDate: '', 
        budget: '',
        campaignType: 'awareness',
        platform: 'twitter',
        costPerAction: '0.1',
        rewardPointsPerAction: '10'
      });
      fetchData();
    } catch (err: any) {
      console.error('Failed to create campaign:', err);
      dispatch(addToast({
          type: 'error',
          title: t('error') || 'Error',
          message: err.message || (t('create_campaign_failed') || 'Failed to create campaign'),
      }));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('campaigns') || 'Campaigns'}</h1>
            <p className="text-gray-500 mt-1">
              {isSponsor ? (t('manage_marketing_campaigns') || 'Manage your marketing campaigns') : (t('manage_sponsor_campaigns') || 'Manage sponsor campaigns')}
            </p>
          </div>
          {!isReadOnly && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('new_campaign') || 'New Campaign'}
            </Button>
          )}
        </div>

        {/* Stats */}
        {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total_campaigns') || 'Total Campaigns'}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('status_active') || 'Active'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeCampaigns}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total_budget') || 'Total Budget'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.totalBudget / 1000).toFixed(0)}k
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total_spent') || 'Total Spent'}</p>
              <p className="text-2xl font-bold text-gray-900">
                {(stats.totalSpent / 1000).toFixed(0)}k
              </p>
            </div>
          </Card>
        </div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('search_campaigns') || 'Search campaigns...'}
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Select
              options={campaignStatuses}
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-40"
            />
          </div>
        </Card>

        {/* Campaigns List */}
        {isLoading && campaigns.length === 0 ? (
           <div className="flex justify-center p-12">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
           </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <Badge variant={getStatusVariant(campaign.status)}>
                      {t(`status_${campaign.status.toLowerCase()}`) || campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{campaign.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Megaphone className="w-4 h-4" />
                  <span>{t('sponsor') || 'Sponsor'}: <strong className="text-gray-900">{campaign.companyName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {campaign.startsAt ? format(new Date(campaign.startsAt), 'MMM d, yyyy') : 'N/A'} - {campaign.endsAt ? format(new Date(campaign.endsAt), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  <span>{t('products_count', { count: campaign.productCount || 0 }) || `${campaign.productCount || 0} Products`}</span>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">{t('budget_spent') || 'Budget Spent'}</span>
                  <span className="font-medium text-gray-900">
                    {(Number(campaign.spentBudget) || 0).toLocaleString()} / {(Number(campaign.totalBudget) || 0).toLocaleString()} pts
                  </span>
                </div>
                {/* Note: campaign object in types has ROI, not explicitly budget/spent. Using dummy or ROI as budget for now based on previous mock */}
                 {/* Re-checking types: Campaign interface has roi, totalImpressions. The mock had budget/spent. The actual API might differ. */}
                 {/* Assuming API returns proper fields or updating interface later. For now, showing available data */}
              </div>

              {!isReadOnly && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => dispatch(setSelectedCampaign(campaign))}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('view') || 'View'}
                  </Button>
                  {/* Edit button could open another modal */}
                   <Button variant="ghost" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    {t('edit') || 'Edit'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(campaign.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
        )}

        {/* Empty State */}
        {!isLoading && campaigns.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_campaigns_found') || 'No campaigns found'}</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status
                ? (t('adjust_filters_hint') || 'Try adjusting your filters')
                : (t('campaign_created_hint') || 'Get started by creating a new campaign')}
            </p>
            {!isReadOnly && !filters.search && !filters.status && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('new_campaign') || 'New Campaign'}
              </Button>
            )}
          </Card>
        )}

        {/* Pagination */}
        {campaigns.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages || 1}
            onPageChange={handlePageChange}
            totalItems={total}
            itemsPerPage={limit}
          />
        )}

        {/* Create Campaign Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={t('create_new_campaign') || 'Create New Campaign'}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                {t('cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleCreate}>{t('create_campaign') || 'Create Campaign'}</Button>
            </div>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                  label={t('campaign_name') || 'Campaign Name'} 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('enter_campaign_name') || 'Enter campaign name'} 
              />
              <Input 
                  label={t('company_name') || 'Company Name'} 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g. My Company" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description') || 'Description'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder={t('enter_campaign_description') || 'Enter description'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <Select
                  options={campaignTypeOptions}
                  value={formData.campaignType}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaignType: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <Select
                  options={platformOptions}
                  value={formData.platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label={t('start_date') || 'Start Date'} 
                type="date" 
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
              />
              <Input 
                label={t('end_date') || 'End Date'} 
                type="date" 
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input 
                  label={t('budget_points') || 'Total Budget'} 
                  type="number" 
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="0" 
              />
               <Input 
                  label="Cost Per Action ($)" 
                  type="number" 
                  step="0.01"
                  name="costPerAction"
                  value={formData.costPerAction}
                  onChange={handleInputChange}
              />
               <Input 
                  label="Reward (Pts)" 
                  type="number" 
                  name="rewardPointsPerAction"
                  value={formData.rewardPointsPerAction}
                  onChange={handleInputChange}
              />
            </div>
          </div>
        </Modal>

        {/* Campaign Details Modal */}
        <Modal
          isOpen={!!selectedCampaign}
          onClose={() => dispatch(setSelectedCampaign(null))}
          title={selectedCampaign?.name || t('campaign_details') || 'Campaign Details'}
          size="lg"
        >
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(selectedCampaign.status)}>
                  {t(`status_${selectedCampaign.status.toLowerCase()}`) || selectedCampaign.status}
                </Badge>
              </div>
              
              <p className="text-gray-600">{selectedCampaign.description}</p>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">{t('sponsor') || 'Sponsor'}</p>
                  <p className="font-medium text-gray-900">{selectedCampaign.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Products</p>
                  <p className="font-medium text-gray-900">{selectedCampaign.productCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedCampaign.startsAt ? format(new Date(selectedCampaign.startsAt), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedCampaign.endsAt ? format(new Date(selectedCampaign.endsAt), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
