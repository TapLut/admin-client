import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Campaign, CampaignStatus } from '@/types';
import { campaignsService } from '@/services/campaigns.service';

interface CampaignsState {
  items: Campaign[];
  selectedCampaign: Campaign | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    search: string;
    status: CampaignStatus | null;
    sponsorId: number | null;
  };
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    totalSpent: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CampaignsState = {
  items: [],
  selectedCampaign: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  filters: {
    search: '',
    status: null,
    sponsorId: null,
  },
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (params: { page?: number; limit?: number; search?: string; status?: string; sponsorId?: string }, { rejectWithValue }) => {
    try {
      const response = await campaignsService.getCampaigns(params);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaigns');
    }
  }
);

export const fetchCampaignStats = createAsyncThunk(
  'campaigns/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await campaignsService.getCampaignStats();
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch campaign stats');
    }
  }
);

export const createCampaignThunk = createAsyncThunk(
  'campaigns/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await campaignsService.createCampaign(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create campaign');
    }
  }
);

export const updateCampaignThunk = createAsyncThunk(
  'campaigns/update',
  async ({ id, data }: { id: number; data: Partial<Campaign> }, { rejectWithValue }) => {
    try {
        // @ts-ignore
      const response = await campaignsService.updateCampaign(id, data);
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update campaign');
    }
  }
);

export const deleteCampaignThunk = createAsyncThunk(
    'campaigns/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await campaignsService.deleteCampaign(id);
            return id;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue('Failed to delete campaign');
        }
    }
);

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setSelectedCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaign = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<CampaignsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch Campaigns
    builder.addCase(fetchCampaigns.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCampaigns.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(fetchCampaigns.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Stats
    builder.addCase(fetchCampaignStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Create Campaign
    builder.addCase(createCampaignThunk.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      state.total += 1;
    });

    // Update Campaign
    builder.addCase(updateCampaignThunk.fulfilled, (state, action) => {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedCampaign?.id === action.payload.id) {
        state.selectedCampaign = action.payload;
      }
    });

    // Delete Campaign
    builder.addCase(deleteCampaignThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
        state.total -= 1;
        if (state.selectedCampaign?.id === action.payload) {
            state.selectedCampaign = null;
        }
    });
  },
});

export const {
  setSelectedCampaign,
  setFilters,
  setPage,
  clearFilters,
} = campaignsSlice.actions;

export default campaignsSlice.reducer;
