import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { AuthUser, LoginCredentials } from "@/types/auth";

import { loginUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const storedUser = localStorage.getItem("careflow-user");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials) => {
    return await loginUser(credentials);
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;

      localStorage.removeItem("careflow-user");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;

        localStorage.setItem("careflow-user", JSON.stringify(action.payload));
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;

        state.error = action.error.message ?? "Unable to login";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;
