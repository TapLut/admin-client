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
import { Card, CardHeader, StatCard, Badge, getStatusVariant, Table, TableColumn, TableCellText } from '@/components/ui';
import { MainLayout } from '@/components/layout';
import { format } from 'date-fns';
import { Order, Product } from '@/types';

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
            <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
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
          <h1 className="text-2xl font-bold text-card-foreground">{t('dashboard')}</h1>
          <p className="text-text-muted mt-1">
            {isSponsor ? 'Overview of your campaigns and performance' : 'Platform overview and analytics'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    className="text-text-muted"
                    stroke="var(--text-muted)"
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      color: 'var(--card-foreground)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.2}
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
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-muted)"
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      color: 'var(--card-foreground)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earned"
                    stroke="var(--success)"
                    strokeWidth={2}
                    dot={false}
                    name="Earned"
                  />
                  <Line
                    type="monotone"
                    dataKey="spent"
                    stroke="var(--destructive)"
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
                <a href="/orders" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  View all →
                </a>
              }
            />
            <Table<Order>
              columns={[
                {
                  key: 'user',
                  header: 'User',
                  render: (order) => <TableCellText text={order.userName} />,
                },
                {
                  key: 'product',
                  header: 'Product',
                  render: (order) => <TableCellText text={order.productName} muted />,
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  render: (order) => <TableCellText text={`${order.pointsSpent} pts`} />,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (order) => (
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  ),
                },
              ]}
              data={recentOrders}
              keyExtractor={(order) => order.id}
              compact
            />
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader 
              title="Top Products" 
              description="Best selling products by revenue"
              action={
                <a href="/products" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  View all →
                </a>
              }
            />
            <Table<Product & { rank: number }>
              columns={[
                {
                  key: 'product',
                  header: 'Product',
                  render: (product) => (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-xs font-medium text-card-foreground">
                        {product.rank}
                      </span>
                      <span className="text-sm text-card-foreground">{product.name}</span>
                    </div>
                  ),
                },
                {
                  key: 'sales',
                  header: 'Sales',
                  render: (product) => <TableCellText text={(product.purchaseCount ?? 0).toLocaleString()} muted />,
                },
                {
                  key: 'revenue',
                  header: 'Revenue',
                  render: (product) => <TableCellText text={`${((product.pointPrice ?? 0) * (product.purchaseCount ?? 0)).toLocaleString()} pts`} />,
                },
              ]}
              data={topProducts.map((product, index) => ({ ...product, rank: index + 1 }))}
              keyExtractor={(product) => product.id}
              compact
            />
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
