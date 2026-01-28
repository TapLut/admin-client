import api from '@/lib/api';
import { Product, PaginatedResponse, ProductType, ProductStatus } from '@/types';

interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sponsorId?: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  type: string;
  imageUrl?: string;
  // properties that might come from generic form state
  [key: string]: any;
}

// Helper to map Server Entity -> Client Product
const mapServerProduct = (data: any): Product => {
  return {
    ...data,
    id: data.id,
    name: data.name,
    description: data.description,
    type: (data.productType as ProductType) || ProductType.DIGITAL,
    pointPrice: parseInt(data.pricePoints || '0', 10),
    originalValue: data.originalPriceWon || 0,
    stockType: data.stockQuantity ? 'limited' : 'unlimited',
    stockQuantity: data.stockQuantity,
    status: (data.status as ProductStatus) || ProductStatus.INACTIVE,
    imageUrl: data.thumbnailUrl || '',
    sponsorId: data.sponsorId,
    purchaseCount: 0, // Server might need to provide this
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Product;
};

// Helper to map Client Input -> Server DTO
const mapToCreateDto = (data: ProductInput): any => {
  return {
    name: data.name,
    description: data.description,
    pricePoints: data.price ? data.price.toString() : '0',
    productType: data.type.toLowerCase() as ProductType,
    thumbnailUrl: data.imageUrl,
    // Default values for required server fields if not provided by UI
    stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : 100,
  };
};

export const productsService = {
  getProducts: async (params: ProductsQuery): Promise<PaginatedResponse<Product>> => {
    // Client params: type, status. Server expects: productType, status.
    const serverParams: any = {
        page: params.page,
        limit: params.limit,
        search: params.search,
    };
    
    if (params.type) serverParams.productType = params.type.toLowerCase();
    if (params.status) serverParams.status = params.status.toLowerCase();

    const response = await api.get('/products', { params: serverParams });
    return {
        ...response.data,
        items: response.data.items.map(mapServerProduct)
    };
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return mapServerProduct(response.data);
  },

  createProduct: async (data: ProductInput): Promise<Product> => {
    const dto = mapToCreateDto(data);
    const response = await api.post('/products', dto);
    return mapServerProduct(response.data);
  },

  updateProduct: async (id: string, data: Partial<ProductInput>): Promise<Product> => {
    const dto: any = {};
    if (data.name) dto.name = data.name;
    if (data.description) dto.description = data.description;
    if (data.price !== undefined) dto.pricePoints = data.price.toString();
    if (data.type) dto.productType = data.type.toLowerCase();
    if (data.imageUrl) dto.thumbnailUrl = data.imageUrl;
    
    // Pass through any other fields directly if needed, or map them explicitly
    if (data.status) dto.status = data.status.toLowerCase();

    const response = await api.patch(`/products/${id}`, dto);
    return mapServerProduct(response.data);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  uploadProductImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProductStatus: async (id: string, status: string): Promise<Product> => {
    const response = await api.patch(`/products/${id}/status`, { status: status.toLowerCase() });
    return mapServerProduct(response.data);
  },
};
