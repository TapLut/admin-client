'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsSponsor, selectSponsorId } from '@/store/slices/authSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  fetchProducts, 
  setFilters, 
  setPage, 
  setSelectedProduct,
  deleteProduct,
  createProduct,
  updateProductThunk
} from '@/store/slices/productsSlice';
import { addToast } from '@/store/slices/uiSlice';
import { MainLayout } from '@/components/layout';
import { Card, Button, Input, Badge, getStatusVariant, Modal, Pagination, SearchFilter, Select } from '@/components/ui';
import { format } from 'date-fns';
import { Product, ProductType } from '@/types';
import { productsService } from '@/services/products.service';
import Image from 'next/image';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const isSponsor = useAppSelector(selectIsSponsor);
  const currentSponsorId = useAppSelector(selectSponsorId);
  const { t } = useTranslation();
  const { canSetProductPoints } = usePermissions();

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    price: 0,
    type: 'DIGITAL',
  });
  const [priceDisplay, setPriceDisplay] = useState('');

  // Format number with commas
  const formatNumberWithCommas = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  // Parse number from formatted string
  const parseFormattedNumber = (str: string): number => {
    return parseInt(str.replace(/,/g, ''), 10) || 0;
  };

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue, 10) || 0;
    setNewProductData({ ...newProductData, price: numValue });
    setPriceDisplay(numValue > 0 ? formatNumberWithCommas(numValue) : '');
  };

  useEffect(() => {
    dispatch(fetchProducts({
      page,
      limit,
      search: filters.search,
      type: filters.type || undefined,
      status: filters.status || undefined,
      sponsorId: isSponsor && currentSponsorId ? currentSponsorId.toString() : undefined,
    }));
  }, [dispatch, page, limit, filters, isSponsor, currentSponsorId]);

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

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteProduct(deleteId)).unwrap();
      dispatch(addToast({
        type: 'success',
        title: t('success'),
        message: t('product_deleted_success'),
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: t('error'),
        message: typeof error === 'string' ? error : 'Failed to delete product',
      }));
    } finally {
      setDeleteId(null);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id.toString());
    setNewProductData({
      name: product.name,
      description: product.description,
      price: product.pointPrice,
      type: product.type
    });
    setPriceDisplay(product.pointPrice > 0 ? formatNumberWithCommas(product.pointPrice) : '');
    if (product.imageUrl) {
      setThumbnailPreview(product.imageUrl);
    }
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingId(null);
    setNewProductData({ name: '', description: '', price: 0, type: 'DIGITAL' });
    setPriceDisplay('');
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setProductImagePreview(null);
    setProductImageFile(null);
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      dispatch(addToast({ type: 'error', title: t('error'), message: 'File is too large. Max 5MB.' }));
      return;
    }

    if (!file.type.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
      dispatch(addToast({ type: 'error', title: t('error'), message: 'Only image files are allowed.' }));
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailFile(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleProductImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      dispatch(addToast({ type: 'error', title: t('error'), message: 'File is too large. Max 5MB.' }));
      return;
    }

    if (!file.type.match(/image\/(jpg|jpeg|png|gif|webp)/)) {
      dispatch(addToast({ type: 'error', title: t('error'), message: 'Only image files are allowed.' }));
      return;
    }

    setProductImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProductImage = () => {
    setProductImagePreview(null);
    setProductImageFile(null);
    if (productImageInputRef.current) {
      productImageInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    try {
      let thumbnailUrl = thumbnailPreview;
      
      // Upload thumbnail first if a new file was selected
      if (thumbnailFile) {
        setIsUploading(true);
        try {
          const uploadResult = await productsService.uploadProductImage(thumbnailFile);
          thumbnailUrl = uploadResult.imageUrl;
        } catch (uploadError) {
          dispatch(addToast({
            type: 'error',
            title: t('error'),
            message: 'Failed to upload thumbnail',
          }));
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const productData = { ...newProductData, imageUrl: thumbnailUrl || undefined };

      if (editingId) {
        await dispatch(updateProductThunk({ id: editingId, data: productData })).unwrap();
        dispatch(addToast({
          type: 'success',
          title: t('success'),
          message: t('product_updated_success'),
        }));
      } else {
        await dispatch(createProduct(productData)).unwrap();
        dispatch(addToast({
          type: 'success',
          title: t('success'),
          message: t('product_created_success'),
        }));
      }
      handleModalClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      dispatch(addToast({
        type: 'error',
        title: t('error'),
        message: typeof error === 'string' ? error : 'Failed to save product',
      }));
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('products')}</h1>
            <p className="text-gray-500 mt-1">
              {isSponsor ? t('products_manage_sponsored') : t('products_manage_all')}
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('add_product')}
          </Button>
        </div>

        {/* Filters */}
        <SearchFilter
          searchValue={filters.search}
          onSearchChange={handleSearch}
          searchPlaceholder={t('search_products')}
          showFiltersButton
          filters={[
            {
              key: 'type',
              label: t('type') || 'Type',
              options: productTypes,
              value: filters.type || '',
              onChange: handleTypeFilter,
            },
            {
              key: 'status',
              label: t('status') || 'Status',
              options: productStatuses,
              value: filters.status || '',
              onChange: handleStatusFilter,
            },
          ]}
          onClearAll={() => {
            dispatch(setFilters({ search: '', type: null, status: null }));
          }}
        />

        {/* Products Grid */}
        {isLoading ? (
           <div className="flex justify-center p-12">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product: Product, index: number) => (
              <Card 
                key={product.id} 
                padding="none" 
                className="overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image Placeholder */}
                <div className="h-40 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl.startsWith('http') ? product.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${product.imageUrl}`}
                      alt={product.name}
                      width={200}
                      height={160}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
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
                    <span className="text-lg font-bold text-blue-600">{formatNumberWithCommas(product.pointPrice)} 포인트</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {t(`type_${product.type}`)}
                    </span>
                  </div>
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
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEditClick(product)}>
                      <Edit className="w-4 h-4 mr-1" />
                      {t('edit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id.toString())}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
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
            {!filters.search && !filters.type && !filters.status && (
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

        {/* Create/Edit Product Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleModalClose}
          title={editingId ? t('edit_product') : t('add_new_product')}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleModalClose}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? t('save_changes') : t('create_product')}
              </Button>
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
              {canSetProductPoints ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('price_points')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={priceDisplay}
                      onChange={handlePriceChange}
                      className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                      포인트
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('price_points')}
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500">
                    {t('auto_calculated') || '자동 계산됨'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('points_auto_calculate_hint') || '포인트는 시스템에서 자동으로 계산됩니다.'}
                  </p>
                </div>
              )}
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
            
            {/* Thumbnail Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('thumbnail_image') || '썸네일 이미지'}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t('thumbnail_description') || '상품 목록에 표시되는 대표 이미지입니다.'}
              </p>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
              {thumbnailPreview ? (
                <div className="relative inline-block animate-fadeIn">
                  <Image
                    width={128}
                    height={128}
                    src={thumbnailPreview.startsWith('data:') ? thumbnailPreview : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${thumbnailPreview}`}
                    alt="Thumbnail preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300 transition-transform duration-200 hover:scale-105"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-200">{t('click_to_upload')}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('image_upload_limit')}</p>
                </div>
              )}
            </div>

            {/* Product Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('product_image') || '상품 이미지'}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {t('product_image_description') || '상품 상세 페이지에 표시되는 이미지입니다.'}
              </p>
              <input
                ref={productImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleProductImageSelect}
                className="hidden"
              />
              {productImagePreview ? (
                <div className="relative inline-block animate-fadeIn">
                  <Image
                    width={200}
                    height={200}
                    src={productImagePreview.startsWith('data:') ? productImagePreview : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${productImagePreview}`}
                    alt="Product preview"
                    className="w-48 h-48 object-cover rounded-lg border border-gray-300 transition-transform duration-200 hover:scale-105"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveProductImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => productImageInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                >
                  <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-200">{t('click_to_upload')}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('image_upload_limit')}</p>
                </div>
              )}
              {isUploading && (
                <p className="text-sm text-blue-600 mt-2 animate-pulse">Uploading image...</p>
              )}
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
            <div className="space-y-4 animate-fadeIn">
              <div className="h-48 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {selectedProduct.imageUrl ? (
                  <Image
                    src={selectedProduct.imageUrl.startsWith('http') ? selectedProduct.imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}${selectedProduct.imageUrl}`}
                    alt={selectedProduct.name}
                    width={300}
                    height={192}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
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
                <span className="text-2xl font-bold text-blue-600">{formatNumberWithCommas(selectedProduct.pointPrice)} 포인트</span>
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
                {t('delete')}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
             <p className="text-gray-600">{t('delete_confirm') || 'Are you sure you want to delete this product? This action cannot be undone.'}</p>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}