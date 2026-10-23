import { orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice, type SerializedError } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TCreatedOrderSliceState = {
  order: TOrder | null;
  isCreating: boolean;
  error: SerializedError | null;
};

const initialState: TCreatedOrderSliceState = {
  order: null,
  isCreating: false,
  error: null,
};

export const createOrder = createAsyncThunk(
  'createOrder/createOrder',
  async (ingredientIds: string[]) => {
    const data = await orderBurgerApi(ingredientIds);
    return data.order;
  }
);

const createOrderSlice = createSlice({
  name: 'createOrder',
  initialState,
  reducers: {
    resetCreatedOrder: (state) => {
      state.order = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.error;
      });
  },
});

export const { resetCreatedOrder } = createOrderSlice.actions;

export const selectCreatedOrder = (state: {
  createOrder: TCreatedOrderSliceState;
}): TOrder | null => state.createOrder.order;
export const selectIsOrderCreating = (state: {
  createOrder: TCreatedOrderSliceState;
}): boolean => state.createOrder.isCreating;
export const selectCreateOrderError = (state: {
  createOrder: TCreatedOrderSliceState;
}): SerializedError | null => state.createOrder.error;

export default createOrderSlice.reducer;
