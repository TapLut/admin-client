import api from '@/lib/api';
import { ChartDataPoint, DualChartDataPoint, Order, Product, DashboardStats } from '@/types';

export interface DashboardData {
  stats: DashboardStats;
  orderTrend: ChartDataPoint[];
  pointsEconomy: DualChartDataPoint[];
  recentOrders: Order[];
  topProducts: Product[];
}

interface BackendOverviewResponse {
    users: { total: number; newToday: number; newThisWeek: number };
    products: { total: number; active: number };
    orders: { total: number; pending: number; todayOrders: number };
    campaigns: { total: number; active: number };
    quests: { total: number; active: number };
}

interface BackendPointsEconomyResponse {
    totalPointsInCirculation: string;
    totalPointsSpent: string;
    averagePointsPerUser: string;
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    // Fetch all dashboard data in parallel
    const [overview, pointsStats, orderTrend, recentOrders, topProducts] = await Promise.all([
      api.get<BackendOverviewResponse>('/dashboard/overview').then(res => res.data),
      api.get<BackendPointsEconomyResponse>('/dashboard/points-economy').then(res => res.data),
      api.get<ChartDataPoint[]>('/dashboard/order-trend').then(res => res.data),
      api.get<Order[]>('/dashboard/recent-orders').then(res => res.data),
      api.get<Product[]>('/dashboard/top-products').then(res => res.data),
    ]);

    // Map backend response to frontend stats interface
    const stats: DashboardStats = {
        totalUsers: overview.users.total,
        totalOrders: overview.orders.total,
        totalRevenue: parseInt(pointsStats.totalPointsSpent || '0'),
        activeQuests: overview.quests.active,
        activeCampaigns: overview.campaigns.active,
        pointsInCirculation: parseInt(pointsStats.totalPointsInCirculation || '0'),
    };

    return {
      stats,
      orderTrend,
      pointsEconomy: [], // Backend currently returns summary, not time-series. Keeping empty to avoid crashes.
      recentOrders,
      topProducts,
    };
  },

  getStats: async (): Promise<DashboardStats> => {
     const [overview, pointsStats] = await Promise.all([
        api.get<BackendOverviewResponse>('/dashboard/overview').then(res => res.data),
         api.get<BackendPointsEconomyResponse>('/dashboard/points-economy').then(res => res.data)
     ]);
    
      return {
        totalUsers: overview.users.total,
        totalOrders: overview.orders.total,
        totalRevenue: parseInt(pointsStats.totalPointsSpent || '0'),
        activeQuests: overview.quests.active,
        activeCampaigns: overview.campaigns.active,
        pointsInCirculation: parseInt(pointsStats.totalPointsInCirculation || '0'),
    };
  },

  getOrderTrend: async (days: number = 30): Promise<ChartDataPoint[]> => {
    const response = await api.get<ChartDataPoint[]>('/dashboard/order-trend', { params: { days } });
    return response.data;
  },

  getPointsEconomy: async (): Promise<DualChartDataPoint[]> => {
    const response = await api.get<DualChartDataPoint[]>('/dashboard/points-economy');
    return response.data;
  },

  getRecentOrders: async (limit: number = 10): Promise<Order[]> => {
    const response = await api.get<Order[]>('/dashboard/recent-orders', { params: { limit } });
    return response.data;
  },

  getTopProducts: async (limit: number = 5): Promise<Product[]> => {
    const response = await api.get<Product[]>('/dashboard/top-products', { params: { limit } });
    return response.data;
  },
};
