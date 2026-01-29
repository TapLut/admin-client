import { ProductType, ProductStatus } from '../enum/product';

export interface CreateProductReq {
  name: string;
  description: string;
  price: number;
  type: ProductType | string;
  imageUrl?: string;
  stockQuantity?: number;
  status?: ProductStatus | string;
}

export interface UpdateProductReq {
  name?: string;
  description?: string;
  price?: number;
  type?: ProductType | string;
  imageUrl?: string;
  stockQuantity?: number;
  status?: ProductStatus | string;
}

export interface ProductsQueryReq {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sponsorId?: string;
}
