import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
  type TLoginData,
  type TRegisterData,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie } from '@utils/cookie';

import type { TUser } from '@utils-types';

type TUserState = {
  isAuthChecked: boolean; // Проверена ли авторизация при загрузке приложения
  isAuthenticated: boolean; // Авторизован ли пользователь
  user: TUser | null;
  isUpdating: boolean;
  updateError: string | null;
};

const initialState: TUserState = {
  isAuthChecked: false,
  isAuthenticated: false,
  user: null,
  isUpdating: false,
  updateError: null,
};

export const checkAuth = createAsyncThunk('user/checkAuth', async () => {
  const data = await getUserApi();
  return data.user;
});

export const loginUser = createAsyncThunk('user/loginUser', async (data: TLoginData) => {
  const response = await loginUserApi(data);
  return response.user;
});

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    return response.user;
  }
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  try {
    await logoutApi();
  } finally {
    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  }
});

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (user: Partial<TRegisterData>) => {
    const response = await updateUserApi(user);
    return response.user;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthChecked = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthChecked = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.updateError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.updateError = null;
      })
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.user = action.payload;
        state.updateError = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError =
          action.error.message ?? 'Не удалось обновить данные пользователя';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

// Селекторы
export const selectIsAuthChecked = (state: { user: TUserState }): boolean =>
  state.user.isAuthChecked;
export const selectIsAuthenticated = (state: { user: TUserState }): boolean =>
  state.user.isAuthenticated;
export const selectUserData = (state: { user: TUserState }): TUser | null =>
  state.user.user;
export const selectIsUpdating = (state: { user: TUserState }): boolean =>
  state.user.isUpdating;
export const selectUpdateError = (state: { user: TUserState }): string | null =>
  state.user.updateError;

export default userSlice.reducer;
