import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Quest, PaginatedResponse } from '@/types';
import { questsService } from '@/services/quests.service';
import { RootState } from '../store';

interface QuestsState {
  items: Quest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  selectedQuest: Quest | null;
  stats: {
    totalActiveQuests: number;
    completionsToday: number;
    pointsDistributedToday: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuestsState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  selectedQuest: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const fetchQuests = createAsyncThunk(
  'quests/fetchQuests',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await questsService.getQuests(params);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch quests');
    }
  }
);

export const createQuestThunk = createAsyncThunk(
  'quests/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await questsService.createQuest(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create quest');
    }
  }
);

export const updateQuestThunk = createAsyncThunk(
  'quests/update',
  async ({ id, data }: { id: number; data: Partial<Quest> }, { rejectWithValue }) => {
    try {
      // @ts-ignore
      const response = await questsService.updateQuest(id, data);
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update quest');
    }
  }
);

export const deleteQuestThunk = createAsyncThunk(
  'quests/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      // @ts-ignore
      await questsService.deleteQuest(id);
      return id;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete quest');
    }
  }
);

const questsSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    setSelectedQuest: (state, action: PayloadAction<Quest | null>) => {
      state.selectedQuest = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quests
      .addCase(fetchQuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchQuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Quest
      .addCase(createQuestThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      // Update Quest
      .addCase(updateQuestThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          const payload = action.payload;
          const current = state.items[index];
          
          state.items[index] = {
            ...current,
            ...payload,
            title: payload.title || current.title,
            description: payload.description || current.description,
            platform: payload.platform || current.platform,
            action: payload.action || current.action,
          };
        }
      })
      // Delete Quest
      .addCase(deleteQuestThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { setSelectedQuest, setPage } = questsSlice.actions;

export default questsSlice.reducer;

export const selectQuests = (state: RootState) => state.quests.items;
export const selectQuestsLoading = (state: RootState) => state.quests.isLoading;
export const selectQuestsTotal = (state: RootState) => state.quests.total;
export const selectQuestsPage = (state: RootState) => state.quests.page;
export const selectSelectedQuest = (state: RootState) => state.quests.selectedQuest;
export const selectQuestsError = (state: RootState) => state.quests.error;
export const selectQuestsStats = (state: RootState) => state.quests.stats;
