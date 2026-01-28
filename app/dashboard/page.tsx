'use client';

import { useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Coins, 
  ListChecks, 
  Megaphone,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsSponsor } from '@/store/slices/authSlice';
import { fetchDashboardData } from '@/store/slices/dashboardSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardHeader, StatCard, Badge, getStatusVariant } from '@/components/ui';
import { MainLayout } from '@/components/layout';
import { format } from 'date-fns';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const isSponsor = useAppSelector(selectIsSponsor);
  const { t } = useTranslation();
  const { 
    stats, 
    orderTrend, 
    pointsEconomy, 
    recentOrders, 
    topProducts, 
    isLoading 
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (isLoading || !stats) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-500 mt-1">
            {isSponsor ? 'Overview of your campaigns and performance' : 'Platform overview and analytics'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title={t('total_users')}
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            iconColor="blue"
          />
          <StatCard
            title={t('total_orders')}
            value={stats.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            iconColor="green"
          />
          <StatCard
            title={t('total_revenue')}
            value={`${stats.totalRevenue.toLocaleString()} pts`}
            icon={Coins}
            iconColor="yellow"
          />
          <StatCard
            title={t('active_quests')}
            value={stats.activeQuests}
            icon={ListChecks}
            iconColor="purple"
          />
          <StatCard
            title={t('active_campaigns')}
            value={stats.activeCampaigns}
            icon={Megaphone}
            iconColor="red"
          />
          <StatCard
            title={t('points_circulation')}
            value={`${(stats.pointsInCirculation / 1000000).toFixed(1)}M`}
            icon={TrendingUp}
            iconColor="blue"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Trend Chart */}
          <Card>
            <CardHeader title="Order Trend" description="Orders over the last 7 days" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#93C5FD"
                    fillOpacity={0.3}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Points Economy Chart */}
          <Card>
            <CardHeader title="Points Economy" description="Points earned vs spent" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pointsEconomy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                  />
                  <Line
                    type="monotone"
                    dataKey="earned"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    name="Earned"
                  />
                  <Line
                    type="monotone"
                    dataKey="spent"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={false}
                    name="Spent"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader 
              title="Recent Orders" 
              description="Latest orders across the platform"
              action={
                <a href="/orders" className="text-sm text-blue-600 hover:text-blue-700">
                  View all →
                </a>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-900">{order.userName}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">{order.productName}</td>
                      <td className="py-3 px-2 text-sm text-gray-900">{order.pointsSpent} pts</td>
                      <td className="py-3 px-2">
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader 
              title="Top Products" 
              description="Best selling products by revenue"
              action={
                <a href="/products" className="text-sm text-blue-600 hover:text-blue-700">
                  View all →
                </a>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Sales</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topProducts.map((product: any, index: number) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">{product.purchaseCount.toLocaleString()}</td>
                      <td className="py-3 px-2 text-sm text-gray-900">{(product.pointPrice * product.purchaseCount).toLocaleString()} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
