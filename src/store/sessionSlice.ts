import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TokenPair } from '@/lib/types';

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
}

const initialState: SessionState = {
  accessToken: null,
  refreshToken: null,
  username: null,
};

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<TokenPair>) {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
    },
    setUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
    clearSession(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.username = null;
    },
  },
});

export const { setSession, setUsername, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
