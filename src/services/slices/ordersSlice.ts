import { getFeedsApi, getOrderByNumberApi, getOrdersApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice, type SerializedError } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type TFeedSliceState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: SerializedError | null;
};

type TUserOrdersSliceState = {
  orders: TOrder[];
  isLoading: boolean;
  error: SerializedError | null;
};

type TCurrentOrderSliceState = {
  order: TOrder | null;
  isLoading: boolean;
  error: SerializedError | null;
};

type TCreatedOrderSliceState = {
  order: TOrder | null;
  isCreating: boolean;
  error: SerializedError | null;
};

type TOrdersState = {
  feed: TFeedSliceState;
  userOrders: TUserOrdersSliceState;
  currentOrder: TCurrentOrderSliceState;
  createdOrder: TCreatedOrderSliceState;
};

const initialState: TOrdersState = {
  feed: { orders: [], total: 0, totalToday: 0, isLoading: true, error: null },
  userOrders: { orders: [], isLoading: true, error: null },
  currentOrder: { order: null, isLoading: true, error: null },
  createdOrder: { order: null, isCreating: false, error: null },
};

export const fetchFeed = createAsyncThunk('orders/fetchFeed', async () => {
  const data = await getFeedsApi();
  return { orders: data.orders, total: data.total, totalToday: data.totalToday };
});

export const fetchUserOrders = createAsyncThunk('orders/fetchUserOrders', async () => {
  const orders = await getOrdersApi();
  return orders;
});

export const fetchOrderByNumber = createAsyncThunk(
  'orders/fetchOrderByNumber',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders[0] ?? null;
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (ingredientIds: string[]) => {
    const data = await orderBurgerApi(ingredientIds);
    return data.order;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCreatedOrder: (state) => {
      state.createdOrder.order = null;
      state.createdOrder.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.feed.isLoading = true;
        state.feed.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.feed.isLoading = false;
        state.feed.orders = action.payload.orders;
        state.feed.total = action.payload.total;
        state.feed.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.feed.isLoading = false;
        state.feed.error = action.error;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.userOrders.isLoading = true;
        state.userOrders.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders.isLoading = false;
        state.userOrders.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.userOrders.isLoading = false;
        state.userOrders.error = action.error;
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.currentOrder.isLoading = true;
        state.currentOrder.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.currentOrder.isLoading = false;
        state.currentOrder.order = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.currentOrder.isLoading = false;
        state.currentOrder.error = action.error;
      })
      .addCase(createOrder.pending, (state) => {
        state.createdOrder.isCreating = true;
        state.createdOrder.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createdOrder.isCreating = false;
        state.createdOrder.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createdOrder.isCreating = false;
        state.createdOrder.error = action.error;
      });
  },
});

export const { resetCreatedOrder } = ordersSlice.actions;

export const selectFeed = (state: { orders: TOrdersState }): TFeedSliceState =>
  state.orders.feed;
export const selectFeedOrders = (state: { orders: TOrdersState }): TOrder[] =>
  state.orders.feed.orders;
export const selectFeedIsLoading = (state: { orders: TOrdersState }): boolean =>
  state.orders.feed.isLoading;
export const selectFeedError = (state: {
  orders: TOrdersState;
}): SerializedError | null => state.orders.feed.error;
export const selectUserOrders = (state: {
  orders: TOrdersState;
}): TUserOrdersSliceState => state.orders.userOrders;
export const selectCurrentOrder = (state: { orders: TOrdersState }): TOrder | null =>
  state.orders.currentOrder.order;
export const selectCurrentOrderIsLoading = (state: { orders: TOrdersState }): boolean =>
  state.orders.currentOrder.isLoading;
export const selectCurrentOrderError = (state: {
  orders: TOrdersState;
}): SerializedError | null => state.orders.currentOrder.error;
export const selectCreatedOrder = (state: { orders: TOrdersState }): TOrder | null =>
  state.orders.createdOrder.order;
export const selectIsOrderCreating = (state: { orders: TOrdersState }): boolean =>
  state.orders.createdOrder.isCreating;
export const selectCreateOrderError = (state: {
  orders: TOrdersState;
}): SerializedError | null => state.orders.createdOrder.error;

export default ordersSlice.reducer;
