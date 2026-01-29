import { ProductType, ProductStatus } from '../enum/product';

export interface Product {
  id: number;
  name: string;
  description: string;
  type: ProductType;
  pointPrice: number;
  originalValue: number;
  stockType: 'limited' | 'unlimited';
  stockQuantity: number | null;
  status: ProductStatus;
  imageUrl: string;
  sponsorId: number | null;
  sponsorName?: string;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}
