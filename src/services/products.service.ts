import api from '@/lib/api';
import { Product, PaginatedResponse } from '@/types';

interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sponsorId?: string;
}

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  type: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export const productsService = {
  getProducts: async (params: ProductsQuery): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  updateProductStatus: async (id: string, status: string): Promise<Product> => {
    const response = await api.patch(`/products/${id}/status`, { status });
    return response.data;
  },
};
