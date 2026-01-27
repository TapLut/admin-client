import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Campaign, CampaignStatus } from '@/types';

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
    activeCampaigns: number;
    totalImpressions: number;
    totalInteractions: number;
    averageRoi: number;
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

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    fetchCampaignsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCampaignsSuccess: (
      state,
      action: PayloadAction<{
        items: Campaign[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    ) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
    },
    fetchCampaignsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCampaignStats: (state, action: PayloadAction<CampaignsState['stats']>) => {
      state.stats = action.payload;
    },
    setSelectedCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaign = action.payload;
    },
    updateFilters: (
      state,
      action: PayloadAction<Partial<CampaignsState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    addCampaign: (state, action: PayloadAction<Campaign>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    updateCampaign: (state, action: PayloadAction<Campaign>) => {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedCampaign?.id === action.payload.id) {
        state.selectedCampaign = action.payload;
      }
    },
    removeCampaign: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
      state.total -= 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },
  },
});

export const {
  fetchCampaignsStart,
  fetchCampaignsSuccess,
  fetchCampaignsFailure,
  setCampaignStats,
  setSelectedCampaign,
  updateFilters,
  setPage,
  addCampaign,
  updateCampaign,
  removeCampaign,
  clearFilters,
} = campaignsSlice.actions;

export default campaignsSlice.reducer;
