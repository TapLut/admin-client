'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Eye, Package } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsSponsor } from '@/store/slices/authSlice';
import { 
  fetchOrders, 
  fetchOrderStats,
  setFilters, 
  setPage, 
  setSelectedOrder,
  updateOrderStatusThunk 
} from '@/store/slices/ordersSlice';
import { MainLayout } from '@/components/layout';
import { Card, CardHeader, Select, Badge, getStatusVariant, Modal, Pagination, StatCard, Button } from '@/components/ui';
import { format } from 'date-fns';
import { OrderStatus } from '@/types';
import { useTranslation } from 'react-i18next';

export default function OrdersPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isSponsor = useAppSelector(selectIsSponsor);
  
  const { 
    items: orders, 
    total, 
    page, 
    limit, 
    totalPages, 
    filters, 
    stats,
    isLoading,
    selectedOrder 
  } = useAppSelector((state) => state.orders);

  const orderStatuses = useMemo(() => [
    { value: '', label: t('all_statuses') },
    { value: OrderStatus.PENDING, label: t('status_pending') },
    { value: OrderStatus.PROCESSING, label: t('status_processing') },
    { value: OrderStatus.CONFIRMED, label: t('status_confirmed') },
    { value: OrderStatus.SHIPPED, label: t('status_shipped') },
    { value: OrderStatus.DELIVERED, label: t('status_delivered') },
    { value: OrderStatus.CANCELLED, label: t('status_cancelled') },
  ], [t]);

  useEffect(() => {
    dispatch(fetchOrders({
      page,
      limit,
      search: filters.search,
      status: filters.status || undefined,
      startDate: filters.dateFrom || undefined,
      endDate: filters.dateTo || undefined,
    }));
    dispatch(fetchOrderStats());
  }, [dispatch, page, limit, filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ status: (e.target.value || null) as OrderStatus | null }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    await dispatch(updateOrderStatusThunk({ id, status: newStatus }));
    // Ideally await result and show success
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('orders_title')}</h1>
          <p className="text-gray-500 mt-1">
            {isSponsor ? t('manage_sponsored_orders') : t('manage_orders')}
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('total_orders')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders?.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('pending_orders')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders?.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('completed_orders')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders?.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('total_revenue')}</p>
                <p className="text-2xl font-bold text-gray-900">{((stats.totalRevenue || 0) / 1000).toFixed(0)}k pts</p>
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
                  placeholder={t('search_orders_placeholder') || 'Search...'}
                  value={filters.search}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Select
              options={orderStatuses}
              value={filters.status || ''}
              onChange={handleStatusFilter}
              className="w-40"
            />
          </div>
        </Card>

        {/* Orders Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            {isLoading && orders.length === 0 ? (
               <div className="flex justify-center p-12">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
               </div>
            ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{t('th_order_id')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{t('th_customer')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{t('th_product')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{t('th_amount')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{t('table_status')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{t('th_date')}</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">{t('table_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-blue-600">{order.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.userName}</p>
                        {/* Email field removed as it's not in Order interface */}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{order.productName}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.pointsSpent} pts</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(order.status)}>
                        {t(`status_${order.status.toLowerCase()}`) || order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch(setSelectedOrder(order))}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </Card>

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_orders_found')}</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={total}
            itemsPerPage={limit}
          />
        )}

        {/* Order Details Modal */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => dispatch(setSelectedOrder(null))}
          title={`${t('order_details')} #${selectedOrder?.id}`}
          size="md"
          footer={
            selectedOrder?.status === OrderStatus.PENDING && (
              <div className="flex justify-end gap-3">
                <Button variant="danger" onClick={() => handleStatusUpdate(selectedOrder.id.toString(), OrderStatus.CANCELLED)}>
                  {t('cancel_order')}
                </Button>
                <Button onClick={() => handleStatusUpdate(selectedOrder.id.toString(), OrderStatus.PROCESSING)}>
                  {t('process_order')}
                </Button>
              </div>
            )
          }
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <Badge variant={getStatusVariant(selectedOrder.status)}>
                  {t(`status_${selectedOrder.status.toLowerCase()}`, selectedOrder.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {format(new Date(selectedOrder.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{t('th_customer')}</h4>
                <p className="text-gray-900">{selectedOrder.userName}</p>
                 {/* Email field removed */}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{t('th_product')}</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    📦
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedOrder.productName}</p>
                    <p className="text-sm text-gray-500">ID: {selectedOrder.productId}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-gray-100">
                <span className="text-gray-500">{t('total_amount')}</span>
                <span className="text-2xl font-bold text-blue-600">{selectedOrder.pointsSpent} pts</span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
