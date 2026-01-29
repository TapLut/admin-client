import { ProductType, ProductStatus } from '../enum/product';

/**
 * Raw product data as received from the server
 */
export interface ServerProductResponse {
  id: number;
  name: string;
  description: string;
  productType: ProductType | string;
  pricePoints: string;
  originalPriceWon?: number;
  stockQuantity: number | null;
  status: ProductStatus | string;
  thumbnailUrl: string | null;
  sponsorId: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a product on the server
 */
export interface CreateProductDto {
  name: string;
  description: string;
  pricePoints: string;
  productType: ProductType | string;
  thumbnailUrl?: string;
  stockQuantity?: number;
}

/**
 * DTO for updating a product on the server
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  pricePoints?: string;
  productType?: string;
  thumbnailUrl?: string;
  status?: string;
  stockQuantity?: number;
}

/**
 * Query parameters sent to the server for products listing
 */
export interface ProductsServerParams {
  page?: number;
  limit?: number;
  search?: string;
  productType?: string;
  status?: string;
}
