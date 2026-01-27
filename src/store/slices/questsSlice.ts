import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Quest } from '@/types';

interface QuestsState {
  items: Quest[];
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
  selectedQuest: null,
  stats: null,
  isLoading: false,
  error: null,
};

const questsSlice = createSlice({
  name: 'quests',
  initialState,
  reducers: {
    fetchQuestsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchQuestsSuccess: (state, action: PayloadAction<Quest[]>) => {
      state.isLoading = false;
      state.items = action.payload;
    },
    fetchQuestsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setQuestStats: (state, action: PayloadAction<QuestsState['stats']>) => {
      state.stats = action.payload;
    },
    setSelectedQuest: (state, action: PayloadAction<Quest | null>) => {
      state.selectedQuest = action.payload;
    },
    addQuest: (state, action: PayloadAction<Quest>) => {
      state.items.push(action.payload);
    },
    updateQuest: (state, action: PayloadAction<Quest>) => {
      const index = state.items.findIndex((q) => q.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeQuest: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((q) => q.id !== action.payload);
    },
    reorderQuests: (state, action: PayloadAction<Quest[]>) => {
      state.items = action.payload;
    },
    toggleQuestActive: (state, action: PayloadAction<number>) => {
      const quest = state.items.find((q) => q.id === action.payload);
      if (quest) {
        quest.isActive = !quest.isActive;
      }
    },
  },
});

export const {
  fetchQuestsStart,
  fetchQuestsSuccess,
  fetchQuestsFailure,
  setQuestStats,
  setSelectedQuest,
  addQuest,
  updateQuest,
  removeQuest,
  reorderQuests,
  toggleQuestActive,
} = questsSlice.actions;

export default questsSlice.reducer;
