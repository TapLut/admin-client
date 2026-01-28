import api from '@/lib/api';
import { Order, PaginatedResponse } from '@/types';

interface OrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const ordersService = {
  getOrders: async (params: OrdersQuery): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  getOrderStats: async (): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }> => {
    const response = await api.get('/orders/stats');
    const data = response.data;
    const byStatus = data.byStatus || {};
    
    // Map server stats to client expected format
    return {
        totalOrders: data.total || 0,
        pendingOrders: (byStatus['pending'] || 0) + (byStatus['confirmed'] || 0),
        completedOrders: (byStatus['delivered'] || 0) + (byStatus['redeemed'] || 0) + (byStatus['won'] || 0),
        totalRevenue: parseInt(data.totalPointsSpent || '0', 10)
    };
  },
};
