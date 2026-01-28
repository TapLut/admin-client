// Admin User Types
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SPONSOR = 'sponsor',
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  sponsorId: number | null;
  sponsorName?: string;
  sponsorLogo?: string;
  isActive: boolean;
  lastLoginAt: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeQuests: number;
  activeCampaigns: number;
  pointsInCirculation: number;
  // Optional legacy fields if needed
  activeUsers?: number;
  productsListed?: number;
  newUsersToday?: number;
  ordersToday?: number;
}

// Product Types
export enum ProductType {
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
  COUPON = 'coupon',
  RAFFLE = 'raffle',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  SCHEDULED = 'scheduled',
}

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

// Order Types
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  READY = 'ready',
  REDEEMED = 'redeemed',
  CANCELLED = 'cancelled',
}

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

// Campaign Types
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export interface Campaign {
  id: number;
  name: string;
  sponsorName: string;
  sponsorLogo?: string;
  description: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  totalImpressions: number;
  totalInteractions: number;
  roi: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// Quest Types
export enum QuestType {
  FOLLOW = 'follow',
  SUBSCRIBE = 'subscribe',
  LIKE = 'like',
  SHARE = 'share',
  VISIT = 'visit',
}

export enum QuestPlatform {
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  DISCORD = 'discord',
  TIKTOK = 'tiktok',
  WEBSITE = 'website',
}

export interface Quest {
  id: number;
  name: string;
  type: QuestType;
  platform: QuestPlatform;
  targetUrl: string;
  pointsReward: number;
  completionCount: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User {
  id: number;
  username: string | null;
  displayName: string | null;
  email: string | null;
  pictureUrl: string | null;
  level: number;
  points: string;
  totalSpent: string;
  referralCount: number;
  createdAt: string;
  lastActiveAt: string | null;
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface DualChartDataPoint {
  date: string;
  earned: number;
  spent: number;
}
