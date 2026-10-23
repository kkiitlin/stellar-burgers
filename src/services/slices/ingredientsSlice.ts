import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice, type SerializedError } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';

// Асинхронный Thunk для получения ингредиентов
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async () => {
    const data = await getIngredientsApi();
    return data;
  }
);

type TIngredientsState = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

const initialState: TIngredientsState = {
  ingredients: [],
  isLoading: true,
  error: null,
};

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ingredients = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error;
      });
  },
});

// Селекторы для получения данных из store
export const selectIngredients = (state: {
  ingredients: TIngredientsState;
}): TIngredient[] => state.ingredients.ingredients;
export const selectIsIngredientsLoading = (state: {
  ingredients: TIngredientsState;
}): boolean => state.ingredients.isLoading;
export const selectIngredientsError = (state: {
  ingredients: TIngredientsState;
}): SerializedError | null => state.ingredients.error;

export default ingredientsSlice.reducer;
