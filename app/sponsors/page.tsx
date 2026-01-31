'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Mail, UserX, UserCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/lib/permissions';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Badge, Modal, Pagination, Table, TableCellActions, TableColumn, SearchFilter } from '@/components/ui';
import { sponsorsService, Sponsor } from '@/services/sponsors.service';
import { format } from 'date-fns';

export default function SponsorsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { can } = usePermissions();

  // Check permission - redirect if not allowed
  const canViewSponsors = can(Permission.VIEW_SPONSORS);
  const canInviteSponsors = can(Permission.INVITE_SPONSORS);
  const canManageSponsors = can(Permission.MANAGE_SPONSORS);

  const [isLoading, setIsLoading] = useState(true);
  const [allSponsors, setAllSponsors] = useState<Sponsor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;
  
  // Get paginated sponsors
  const sponsors = allSponsors.slice((page - 1) * limit, page * limit);

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'reactivate'; sponsor: Sponsor } | null>(null);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', companyName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if no permission
  useEffect(() => {
    if (!canViewSponsors) {
      router.push('/dashboard');
    }
  }, [canViewSponsors, router]);

  // Fetch sponsors
  useEffect(() => {
    if (!canViewSponsors) return;

    const fetchSponsors = async () => {
      setIsLoading(true);
      try {
        const response = await sponsorsService.getSponsors({
          search: search || undefined,
        });
        setAllSponsors(response);
        setTotal(response.length);
        setTotalPages(Math.ceil(response.length / limit));
      } catch (err) {
        console.error('Failed to fetch sponsors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsors();
  }, [search, canViewSponsors]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.name) {
      setError('Email and name are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await sponsorsService.inviteSponsor(inviteForm);
      setSuccessMessage(`Invitation sent to ${inviteForm.email}`);
      setInviteForm({ email: '', name: '', companyName: '' });
      setIsInviteModalOpen(false);
      // Refresh list
      setPage(1);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setIsSubmitting(true);
    try {
      if (confirmAction.type === 'deactivate') {
        await sponsorsService.deactivateSponsor(confirmAction.sponsor.id);
        setSuccessMessage(`${confirmAction.sponsor.name} has been deactivated`);
      } else {
        await sponsorsService.reactivateSponsor(confirmAction.sponsor.id);
        setSuccessMessage(`${confirmAction.sponsor.name} has been reactivated`);
      }
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
      // Refresh list
      const response = await sponsorsService.getSponsors({ search: search || undefined });
      setAllSponsors(response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmModal = (type: 'deactivate' | 'reactivate', sponsor: Sponsor) => {
    setConfirmAction({ type, sponsor });
    setIsConfirmModalOpen(true);
  };

  if (!canViewSponsors) {
    return null; // Will redirect
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fadeIn">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('sponsors') || 'Sponsors'}</h1>
            <p className="text-gray-500 mt-1">
              {t('sponsors_description') || 'Manage sponsor accounts and send invitations'}
            </p>
          </div>
          {canInviteSponsors && (
            <Button onClick={() => setIsInviteModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('invite_sponsor') || 'Invite Sponsor'}
            </Button>
          )}
        </div>

        {/* Search */}
        <SearchFilter
          searchValue={search}
          onSearchChange={handleSearch}
          searchPlaceholder={t('search_sponsors') || 'Search sponsors...'}
          showFiltersButton
          onClearAll={() => setSearch('')}
        />

        {/* Sponsors Table */}
        <Card className="overflow-hidden">
          <Table<Sponsor>
            columns={[
              {
                key: 'name',
                header: t('name') || 'Name',
                render: (sponsor) => (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-icon-blue-bg flex items-center justify-center text-primary font-medium">
                      {sponsor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-text-primary">{sponsor.name}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'email',
                header: t('email') || 'Email',
                render: (sponsor) => (
                  <p className="text-sm text-text-secondary">{sponsor.email}</p>
                ),
              },
              {
                key: 'status',
                header: t('status') || 'Status',
                render: (sponsor) => (
                  <Badge variant={sponsor.isActive ? 'success' : 'danger'}>
                    {sponsor.isActive ? (t('active') || 'Active') : (t('inactive') || 'Inactive')}
                  </Badge>
                ),
              },
              {
                key: 'lastLogin',
                header: t('last_login') || 'Last Login',
                render: (sponsor) => (
                  <span className="text-sm text-text-muted">
                    {sponsor.lastLoginAt
                      ? format(new Date(sponsor.lastLoginAt), 'MMM d, yyyy HH:mm')
                      : t('never') || 'Never'}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                header: t('created_at') || 'Created',
                render: (sponsor) => (
                  <span className="text-sm text-text-muted">
                    {format(new Date(sponsor.createdAt), 'MMM d, yyyy')}
                  </span>
                ),
              },
              ...(canManageSponsors ? [{
                key: 'actions' as const,
                header: t('actions') || 'Actions',
                render: (sponsor: Sponsor) => (
                  <div className="flex items-center justify-end gap-2">
                    {sponsor.isActive ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfirmModal('deactivate', sponsor)}
                        title={t('deactivate') || 'Deactivate'}
                      >
                        <UserX className="w-4 h-4 text-danger" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfirmModal('reactivate', sponsor)}
                        title={t('reactivate') || 'Reactivate'}
                      >
                        <UserCheck className="w-4 h-4 text-success" />
                      </Button>
                    )}
                  </div>
                ),
              }] : []),
            ]}
            data={sponsors}
            keyExtractor={(sponsor) => sponsor.id}
            isLoading={isLoading}
            emptyIcon={<span className="text-4xl">👥</span>}
            emptyTitle={t('no_sponsors_found') || 'No sponsors found'}
            emptyDescription={search
              ? t('adjust_search') || 'Try adjusting your search'
              : t('invite_first_sponsor') || 'Invite your first sponsor to get started'}
            emptyAction={
              canInviteSponsors && !search && (
                <Button onClick={() => setIsInviteModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('invite_sponsor') || 'Invite Sponsor'}
                </Button>
              )
            }
          />
        </Card>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={total}
            itemsPerPage={limit}
          />
        )}

        {/* Invite Modal */}
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setError(null);
            setInviteForm({ email: '', name: '', companyName: '' });
          }}
          title={t('invite_sponsor') || 'Invite Sponsor'}
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setError(null);
                }}
              >
                {t('cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleInvite} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('sending') || 'Sending...'}
                  </span>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {t('send_invitation') || 'Send Invitation'}
                  </>
                )}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <p className="text-sm text-gray-600">
              {t('invite_sponsor_description') ||
                'An email will be sent to the sponsor with instructions to set up their account.'}
            </p>
            <Input
              label={t('name') || 'Name'}
              placeholder={t('enter_sponsor_name') || 'Enter sponsor name'}
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
            />
            <Input
              label={t('email') || 'Email'}
              type="email"
              placeholder={t('enter_sponsor_email') || 'Enter sponsor email'}
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            />
            <Input
              label={`${t('company_name') || 'Company Name'} (${t('optional') || 'Optional'})`}
              placeholder={t('enter_company_name') || 'Enter company name'}
              value={inviteForm.companyName}
              onChange={(e) => setInviteForm({ ...inviteForm, companyName: e.target.value })}
            />
          </div>
        </Modal>

        {/* Confirm Action Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setConfirmAction(null);
          }}
          title={
            confirmAction?.type === 'deactivate'
              ? t('deactivate_sponsor') || 'Deactivate Sponsor'
              : t('reactivate_sponsor') || 'Reactivate Sponsor'
          }
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setConfirmAction(null);
                }}
              >
                {t('cancel') || 'Cancel'}
              </Button>
              <Button
                onClick={handleConfirmAction}
                disabled={isSubmitting}
                className={confirmAction?.type === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : confirmAction?.type === 'deactivate' ? (
                  t('deactivate') || 'Deactivate'
                ) : (
                  t('reactivate') || 'Reactivate'
                )}
              </Button>
            </div>
          }
        >
          <p className="text-gray-600">
            {confirmAction?.type === 'deactivate'
              ? t('deactivate_sponsor_confirm') ||
                `Are you sure you want to deactivate ${confirmAction?.sponsor.name}? They will no longer be able to access the platform.`
              : t('reactivate_sponsor_confirm') ||
                `Are you sure you want to reactivate ${confirmAction?.sponsor.name}? They will be able to access the platform again.`}
          </p>
        </Modal>
      </div>
    </MainLayout>
  );
}
