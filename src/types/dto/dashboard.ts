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
