import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardStats, ChartDataPoint, DualChartDataPoint, Order, Product } from '@/types';
import { dashboardService } from '@/services';

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getDashboardData();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch dashboard data');
    }
  }
);

interface DashboardState {
  stats: DashboardStats | null;
  orderTrend: ChartDataPoint[];
  pointsEconomy: DualChartDataPoint[];
  recentOrders: Order[];
  topProducts: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  orderTrend: [],
  pointsEconomy: [],
  recentOrders: [],
  topProducts: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDashboardSuccess: (
      state,
      action: PayloadAction<{
        stats: DashboardStats;
        orderTrend: ChartDataPoint[];
        pointsEconomy: DualChartDataPoint[];
        recentOrders: Order[];
        topProducts: Product[];
      }>
    ) => {
      state.isLoading = false;
      state.stats = action.payload.stats;
      state.orderTrend = action.payload.orderTrend;
      state.pointsEconomy = action.payload.pointsEconomy;
      state.recentOrders = action.payload.recentOrders;
      state.topProducts = action.payload.topProducts;
    },
    fetchDashboardFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.orderTrend = action.payload.orderTrend;
        state.pointsEconomy = action.payload.pointsEconomy;
        state.recentOrders = action.payload.recentOrders;
        state.topProducts = action.payload.topProducts;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateStats,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
