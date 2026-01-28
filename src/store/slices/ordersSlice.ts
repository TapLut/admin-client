import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus, ProductType } from '@/types';
import { ordersService } from '@/services';

interface OrdersState {
  items: Order[];
  selectedOrder: Order | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    search: string;
    status: OrderStatus | null;
    productType: ProductType | null;
    dateFrom: string | null;
    dateTo: string | null;
  };
  stats: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  selectedOrder: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  filters: {
    search: '',
    status: null,
    productType: null,
    dateFrom: null,
    dateTo: null,
  },
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { page?: number; limit?: number; search?: string; status?: string; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const response = await ordersService.getOrders(params);
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch orders');
    }
  }
);

export const fetchOrderStats = createAsyncThunk(
    'orders/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ordersService.getOrderStats();
            return response;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to fetch order stats');
        }
    }
);

export const updateOrderStatusThunk = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await ordersService.updateOrderStatus(id, status);
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update order status');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<OrdersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    clearFilters: (state) => {
        state.filters = initialState.filters;
        state.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
          state.stats = action.payload;
      })
      // Update Status
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
            state.selectedOrder = action.payload;
        }
      });
  },
});

export const { setFilters, setPage, setSelectedOrder, clearFilters } = ordersSlice.actions;
export default ordersSlice.reducer;
