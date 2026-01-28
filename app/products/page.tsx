'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsSponsor, selectIsReadOnly } from '@/store/slices/authSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  fetchProducts, 
  setFilters, 
  setPage, 
  setSelectedProduct,
  deleteProduct,
  createProduct 
} from '@/store/slices/productsSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Select, Badge, getStatusVariant, Modal, Pagination } from '@/components/ui';
import { format } from 'date-fns';
import { Product, ProductType } from '@/types';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const isSponsor = useAppSelector(selectIsSponsor);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const { t } = useTranslation();

  const productTypes = [
    { value: '', label: t('type_all') },
    { value: 'DIGITAL', label: t('type_digital') },
    { value: 'PHYSICAL', label: t('type_physical') },
    { value: 'GIFT_CARD', label: t('type_gift_card') },
    { value: 'MEMBERSHIP', label: t('type_membership') },
  ];
  
  const productStatuses = [
    { value: '', label: t('status_all') },
    { value: 'ACTIVE', label: t('status_active') },
    { value: 'INACTIVE', label: t('status_inactive') },
    { value: 'DRAFT', label: t('status_draft') },
  ];
  
  const { 
    items: products, 
    total, 
    page, 
    limit, 
    totalPages, 
    filters, 
    isLoading,
    selectedProduct 
  } = useAppSelector((state) => state.products);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    price: 0,
    type: 'DIGITAL',
  });

  useEffect(() => {
    dispatch(fetchProducts({
      page,
      limit,
      search: filters.search,
      type: filters.type || undefined,
      status: filters.status || undefined,
      sponsorId: isSponsor ? 'me' : undefined
    }));
  }, [dispatch, page, limit, filters, isSponsor]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilters({ type: e.target.value as ProductType || null }));
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Cast to any because the generic constraint on setFilters might be strict
    dispatch(setFilters({ status: (e.target.value || null) as any }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('delete_confirm'))) {
      await dispatch(deleteProduct(id));
    }
  };

  const handleCreateProduct = async () => {
    try {
      await dispatch(createProduct(newProductData)).unwrap();
      setIsCreateModalOpen(false);
      setNewProductData({ name: '', description: '', price: 0, type: 'DIGITAL' });
    } catch (error) {
      console.error('Failed to create product:', error);
      // Ideally show toast here
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('products')}</h1>
            <p className="text-gray-500 mt-1">
              {isSponsor ? t('products_manage_sponsored') : t('products_manage_all')}
            </p>
          </div>
          {!isReadOnly && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('add_product')}
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('search_products')}
                  value={filters.search}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select
                options={productTypes}
                value={filters.type || ''}
                onChange={handleTypeFilter}
                className="w-40"
              />
              <Select
                options={productStatuses}
                value={filters.status || ''}
                onChange={handleStatusFilter}
                className="w-40"
              />
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
           <div className="flex justify-center p-12">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <Card key={product.id} padding="none" className="overflow-hidden">
                {/* Product Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-4xl">📦</span>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <Badge variant={getStatusVariant(product.status)}>
                      {t(`status_${product.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">{product.pointPrice} pts</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {t(`type_${product.type}`)}
                    </span>
                  </div>
                  
                  {!isReadOnly && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => dispatch(setSelectedProduct(product))}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {t('view')}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        {t('edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id.toString())}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_products_found')}</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.type || filters.status
                ? t('adjust_filters_hint')
                : t('first_product_hint')}
            </p>
            {!isReadOnly && !filters.search && !filters.type && !filters.status && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('add_product')}
              </Button>
            )}
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

        {/* Create Product Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={t('add_new_product')}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleCreateProduct}>{t('create_product')}</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input 
              label={t('product_name')}
              placeholder={t('enter_product_name')} 
              value={newProductData.name}
              onChange={(e) => setNewProductData({...newProductData, name: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label={t('type')}
                options={productTypes.filter((t) => t.value)}
                value={newProductData.type}
                onChange={(e) => setNewProductData({...newProductData, type: e.target.value})}
              />
              <Input 
                label={t('price_points')} 
                type="number" 
                placeholder="0"
                value={newProductData.price.toString()}
                onChange={(e) => setNewProductData({...newProductData, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder={t('enter_product_description')}
                value={newProductData.description}
                onChange={(e) => setNewProductData({...newProductData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('product_image')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm text-gray-500">{t('click_to_upload')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('image_upload_limit')}</p>
              </div>
            </div>
          </div>
        </Modal>

        {/* View Product Modal */}
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => dispatch(setSelectedProduct(null))}
          title={selectedProduct?.name || t('product_details')}
          size="md"
        >
          {selectedProduct && (
            <div className="space-y-4">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusVariant(selectedProduct.status)}>
                    {t(`status_${selectedProduct.status}`)}
                  </Badge>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {t(`type_${selectedProduct.type}`)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
                <p className="text-gray-500 mt-2">{selectedProduct.description}</p>
              </div>
              <div className="flex items-center justify-between py-4 border-t border-gray-100">
                <span className="text-gray-500">{t('price')}</span>
                <span className="text-2xl font-bold text-blue-600">{selectedProduct.pointPrice} pts</span>
              </div>
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-500">{t('created')}</span>
                <span className="text-gray-900">
                  {format(new Date(selectedProduct.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}