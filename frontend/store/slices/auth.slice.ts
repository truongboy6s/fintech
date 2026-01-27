import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/* ================== TYPE ================== */
export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

/* ================== INITIAL STATE ================== */
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

/* ================== SLICE ================== */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

/* ================== EXPORT ================== */
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
