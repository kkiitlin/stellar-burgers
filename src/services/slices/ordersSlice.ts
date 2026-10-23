import { getFeedsApi, getOrderByNumberApi, getOrdersApi } from '@api';
import { createAsyncThunk, createSlice, type SerializedError } from '@reduxjs/toolkit';

import type { TFeedState, TOrder } from '@utils-types';

type TFeedSliceState = TFeedState & {
  error: SerializedError | null;
};

type TUserOrdersSliceState = Pick<TFeedSliceState, 'orders' | 'isLoading' | 'error'>;

type TCurrentOrderSliceState = Pick<TFeedSliceState, 'isLoading' | 'error'> & {
  order: TOrder | null;
};

type TOrdersState = {
  feed: TFeedSliceState;
  userOrders: TUserOrdersSliceState;
  currentOrder: TCurrentOrderSliceState;
};

const initialState: TOrdersState = {
  feed: { orders: [], total: 0, totalToday: 0, isLoading: true, error: null },
  userOrders: { orders: [], isLoading: true, error: null },
  currentOrder: { order: null, isLoading: true, error: null },
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

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
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
      });
  },
});

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

export default ordersSlice.reducer;
