import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { leadService } from '../../services/leadService';
import { PAGE_SIZE } from '../../constants';
import { Lead, LeadFormValues, LeadsState, LeadStatus } from '../../types';
import type { RootState } from '../store';

const initialState: LeadsState = {
  items: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  searchQuery: '',
  statusFilter: 'All',
  page: 1,
  hasMore: true,
};

// `reset: true` = fresh search/filter/pull-to-refresh (replace list, page 1)
// `reset: false` = "load more" (append, next page)
export const fetchLeads = createAsyncThunk(
  'leads/fetch',
  async (
    { reset }: { reset: boolean },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const page = reset ? 1 : state.leads.page + 1;
    try {
      const result = await leadService.list({
        page,
        pageSize: PAGE_SIZE,
        search: state.leads.searchQuery,
        status: state.leads.statusFilter,
      });
      return { ...result, page, reset };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load leads');
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/create',
  async (values: LeadFormValues, { rejectWithValue }) => {
    try {
      return await leadService.create(values);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create lead');
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/update',
  async ({ id, values }: { id: string; values: LeadFormValues }, { rejectWithValue }) => {
    try {
      return await leadService.update(id, values);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update lead');
    }
  }
);

export const updateLeadStatus = createAsyncThunk(
  'leads/updateStatus',
  async ({ id, status }: { id: string; status: LeadStatus }, { rejectWithValue }) => {
    try {
      return await leadService.updateStatus(id, status);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update status');
    }
  }
);

export const addLeadNote = createAsyncThunk(
  'leads/addNote',
  async ({ id, text }: { id: string; text: string }, { rejectWithValue }) => {
    try {
      return await leadService.addNote(id, text);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to add note');
    }
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<LeadsState['statusFilter']>) {
      state.statusFilter = action.payload;
    },
    clearLeadsError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLeads.pending, (state, action) => {
        if (action.meta.arg.reset) state.isLoading = true;
        else state.isLoadingMore = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.page = action.payload.page;
        state.hasMore = action.payload.hasMore;
        state.items = action.payload.reset ? action.payload.data : [...state.items, ...action.payload.data];
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = (action.payload as string) || 'Something went wrong';
      })
      // Create / update / status change / note — all just need to splice the
      // returned lead back into `items` (or prepend, for create).
      .addCase(createLead.fulfilled, (state, action: PayloadAction<Lead>) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateLead.fulfilled, (state, action: PayloadAction<Lead>) => {
        replaceLead(state, action.payload);
      })
      .addCase(updateLeadStatus.fulfilled, (state, action: PayloadAction<Lead>) => {
        replaceLead(state, action.payload);
      })
      .addCase(addLeadNote.fulfilled, (state, action: PayloadAction<Lead>) => {
        replaceLead(state, action.payload);
      });
  },
});

function replaceLead(state: LeadsState, updated: Lead) {
  const idx = state.items.findIndex(l => l.id === updated.id);
  if (idx !== -1) state.items[idx] = updated;
}

export const { setSearchQuery, setStatusFilter, clearLeadsError } = leadsSlice.actions;
export default leadsSlice.reducer;
