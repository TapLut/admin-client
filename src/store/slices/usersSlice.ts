import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { usersService } from '@/services';

interface UsersState {
  items: User[];
  selectedUser: User | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    search: string;
    minLevel: number | null;
    maxLevel: number | null;
    createdAfter: string | null;
    createdBefore: string | null;
  };
  stats: {
    totalUsers: number;
    newUsersToday: number;
    dau: number;
    mau: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  selectedUser: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  filters: {
    search: '',
    minLevel: null,
    maxLevel: null,
    createdAfter: null,
    createdBefore: null,
  },
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await usersService.getUsers(params);
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const getUser = createAsyncThunk(
  'users/getUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await usersService.getUser(id);
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch user');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<UsersState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearFilters: (state) => {
        state.filters = initialState.filters;
        state.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
       // Get User
       .addCase(getUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
       });
  },
});

export const { setFilters, setPage, setSelectedUser, clearFilters } = usersSlice.actions;

export default usersSlice.reducer;
