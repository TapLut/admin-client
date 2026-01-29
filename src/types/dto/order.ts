import { ProductType } from '../enum/product';
import { OrderStatus } from '../enum/order';

export interface Order {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  productId: number;
  productName: string;
  productImage?: string;
  productType: ProductType;
  pointsSpent: number;
  status: OrderStatus;
  shippingAddress?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}
