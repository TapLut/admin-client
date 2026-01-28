'use client';

import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Calendar, DollarSign, Megaphone } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectIsSponsor, selectIsReadOnly } from '@/store/slices/authSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Select, Badge, getStatusVariant, Modal, Pagination, Input } from '@/components/ui';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';

// Mock data
const mockCampaigns = [
  { id: '1', name: 'Summer Sale 2024', description: 'Exclusive summer discounts and rewards', sponsorId: 'sp1', sponsorName: 'Nike', status: 'ACTIVE', startDate: '2024-06-01', endDate: '2024-08-31', budget: 50000, spent: 32000, products: 12, createdAt: '2024-05-15T10:00:00Z' },
  { id: '2', name: 'New Year Special', description: 'New year celebration with special offers', sponsorId: 'sp2', sponsorName: 'Adidas', status: 'SCHEDULED', startDate: '2024-12-20', endDate: '2025-01-15', budget: 75000, spent: 0, products: 8, createdAt: '2024-05-20T10:00:00Z' },
  { id: '3', name: 'Back to School', description: 'Student discounts and promotions', sponsorId: 'sp1', sponsorName: 'Nike', status: 'COMPLETED', startDate: '2024-08-01', endDate: '2024-09-15', budget: 30000, spent: 28500, products: 6, createdAt: '2024-07-01T10:00:00Z' },
  { id: '4', name: 'Holiday Bundle', description: 'Special holiday gift bundles', sponsorId: 'sp3', sponsorName: 'Amazon', status: 'DRAFT', startDate: '2024-11-15', endDate: '2024-12-31', budget: 100000, spent: 0, products: 20, createdAt: '2024-10-01T10:00:00Z' },
  { id: '5', name: 'Flash Friday', description: 'Weekly flash sale event', sponsorId: 'sp2', sponsorName: 'Adidas', status: 'ACTIVE', startDate: '2024-01-01', endDate: '2024-12-31', budget: 25000, spent: 15000, products: 5, createdAt: '2024-01-01T10:00:00Z' },
];

export default function CampaignsPage() {
  const { t } = useTranslation();
  const isSponsor = useAppSelector(selectIsSponsor);
  const isReadOnly = useAppSelector(selectIsReadOnly);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<typeof mockCampaigns[0] | null>(null);

  const campaignStatuses = [
    { value: '', label: t('status_all') },
    { value: 'DRAFT', label: t('status_draft') },
    { value: 'SCHEDULED', label: t('status_scheduled') },
    { value: 'ACTIVE', label: t('status_active') },
    { value: 'PAUSED', label: t('status_paused') },
    { value: 'COMPLETED', label: t('status_completed') },
  ];

  // Filter campaigns
  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.sponsorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('campaigns')}</h1>
            <p className="text-gray-500 mt-1">
              {isSponsor ? t('manage_marketing_campaigns') : t('manage_sponsor_campaigns')}
            </p>
          </div>
          {!isReadOnly && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('new_campaign')}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total_campaigns')}</p>
              <p className="text-2xl font-bold text-gray-900">{mockCampaigns.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Megaphone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('status_active')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockCampaigns.filter(c => c.status === 'ACTIVE').length}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total_budget')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {(mockCampaigns.reduce((acc, c) => acc + c.budget, 0) / 1000).toFixed(0)}k
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('total_spent')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {(mockCampaigns.reduce((acc, c) => acc + c.spent, 0) / 1000).toFixed(0)}k
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
                  placeholder={t('search_campaigns')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Select
              options={campaignStatuses}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            />
          </div>
        </Card>

        {/* Campaigns List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCampaigns.map((campaign) => (
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
                  <span>{t('sponsor')}: <strong className="text-gray-900">{campaign.sponsorName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(campaign.startDate), 'MMM d, yyyy')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  <span>{t('products_count', { count: campaign.products })}</span>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">{t('budget_spent')}</span>
                  <span className="font-medium text-gray-900">
                    {campaign.spent.toLocaleString()} / {campaign.budget.toLocaleString()} pts
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${getProgressPercentage(campaign.spent, campaign.budget)}%` }}
                  />
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('view')}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    {t('edit')}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_campaigns_found')}</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter
                ? t('adjust_filters_hint')
                : t('campaign_created_hint')}
            </p>
            {!isReadOnly && !searchQuery && !statusFilter && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('new_campaign')}
              </Button>
            )}
          </Card>
        )}

        {/* Pagination */}
        {filteredCampaigns.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredCampaigns.length / 6)}
            onPageChange={setCurrentPage}
            totalItems={filteredCampaigns.length}
            itemsPerPage={6}
          />
        )}

        {/* Create Campaign Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={t('create_new_campaign')}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button>{t('create_campaign')}</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input label={t('campaign_name')} placeholder={t('enter_campaign_name')} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder={t('enter_campaign_description')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('start_date')} type="date" />
              <Input label={t('end_date')} type="date" />
            </div>
            <Input label={t('budget_points')} type="number" placeholder="0" />
          </div>
        </Modal>

        {/* Campaign Details Modal */}
        <Modal
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          title={selectedCampaign?.name || t('campaign_details')}
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
                  <p className="text-sm text-gray-500">{t('sponsor')}</p>
                  <p className="font-medium text-gray-900">{selectedCampaign.sponsorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Products</p>
                  <p className="font-medium text-gray-900">{selectedCampaign.products}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedCampaign.startDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedCampaign.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="py-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">Budget Progress</span>
                  <span className="font-medium text-gray-900">
                    {getProgressPercentage(selectedCampaign.spent, selectedCampaign.budget).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${getProgressPercentage(selectedCampaign.spent, selectedCampaign.budget)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Spent: <strong>{selectedCampaign.spent.toLocaleString()}</strong> pts
                  </span>
                  <span className="text-gray-500">
                    Budget: <strong>{selectedCampaign.budget.toLocaleString()}</strong> pts
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
