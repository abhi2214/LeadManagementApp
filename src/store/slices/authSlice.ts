import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { storage } from '../../utils/storage';
import { AuthState } from '../../types';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isHydrated: false, // flips true once we've checked AsyncStorage on boot
};

// Runs once on app start — checks if a session was persisted from a previous launch
export const hydrateSession = createAsyncThunk('auth/hydrate', async () => {
  const session = await storage.loadSession();
  return session; // null if nothing stored
});

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { user, token } = await authService.login(email, password);
      await storage.saveSession(user, token);
      return { user, token };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await storage.clearSession();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(hydrateSession.fulfilled, (state, action: PayloadAction<{ user: any; token: string } | null>) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
        state.isHydrated = true;
      })
      .addCase(hydrateSession.rejected, state => {
        state.isHydrated = true; // don't block the app forever even if this fails
      })
      .addCase(login.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
