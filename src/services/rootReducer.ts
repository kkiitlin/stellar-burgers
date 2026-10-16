import { combineReducers } from '@reduxjs/toolkit';

import burgerConstructorReducer from './slices/burgerConstructorSlice';
import ingredientsReducer from './slices/ingredientsSlice';
import ordersReducer from './slices/ordersSlice';
import userReducer from './slices/userSlice';

export const rootReducer = combineReducers({
  burgerConstructor: burgerConstructorReducer,
  ingredients: ingredientsReducer,
  orders: ordersReducer,
  user: userReducer,
});
