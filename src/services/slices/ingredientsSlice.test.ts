import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';

import type { TIngredient } from '@utils-types';

const bun: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
};

const sauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png',
};

const initialState = {
  ingredients: [],
  isLoading: true,
  error: null,
};

describe('ingredientsSlice reducer', () => {
  test('returns the initial state for an unknown action', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN_ACTION' });

    expect(state).toEqual(initialState);
  });

  test('does not change an existing state for an unknown action', () => {
    const prevState = { ingredients: [bun], isLoading: false, error: null };

    const state = ingredientsReducer(prevState, { type: 'UNKNOWN_ACTION' });

    expect(state).toBe(prevState);
  });

  test('fetchIngredients.pending sets isLoading and clears the previous error', () => {
    const prevState = {
      ingredients: [],
      isLoading: false,
      error: { message: 'Ошибка сети' },
    };

    const state = ingredientsReducer(prevState, fetchIngredients.pending('requestId'));

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.ingredients).toEqual([]);
  });

  test('fetchIngredients.fulfilled stores ingredients and stops loading', () => {
    const state = ingredientsReducer(
      initialState,
      fetchIngredients.fulfilled([bun, sauce], 'requestId')
    );

    expect(state).toEqual({
      ingredients: [bun, sauce],
      isLoading: false,
      error: null,
    });
  });

  test('fetchIngredients.rejected stores the error and stops loading', () => {
    const state = ingredientsReducer(
      initialState,
      fetchIngredients.rejected(new Error('Ошибка сети'), 'requestId')
    );

    expect(state.isLoading).toBe(false);
    expect(state.ingredients).toEqual([]);
    expect(state.error).toEqual(expect.objectContaining({ message: 'Ошибка сети' }));
  });
});
