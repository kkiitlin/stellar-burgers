import burgerConstructorReducer, {
  addIngredient,
  clearConstructor,
  moveIngredient,
  removeIngredient,
} from './burgerConstructorSlice';
import { createOrder } from './createOrderSlice';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
  TOrder,
} from '@utils-types';

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

const otherBun: TIngredient = {
  ...bun,
  _id: '643d69a5c3f7b9001cfa093d',
  name: 'Флюоресцентная булка R2-D3',
  price: 988,
};

const main: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
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

const withId = (ingredient: TIngredient, id: string): TConstructorIngredient => ({
  ...ingredient,
  id,
});

const initialState: TConstructorState = { bun: null, ingredients: [] };

const filledState: TConstructorState = {
  bun: withId(bun, 'bun-1'),
  ingredients: [withId(main, 'item-1'), withId(sauce, 'item-2'), withId(main, 'item-3')],
};

const ingredientIds = (state: TConstructorState): string[] =>
  state.ingredients.map((item) => item.id);

/* Проверяет, что в конструктор попал нужный ингредиент и ему выдан непустой id */
const expectWithGeneratedId = (
  actual: TConstructorIngredient | null | undefined,
  expected: TIngredient
): void => {
  expect(actual).toMatchObject(expected);
  expect(typeof actual?.id).toBe('string');
  expect(actual?.id).not.toBe('');
};

describe('burgerConstructorSlice reducer', () => {
  test('returns the initial state for an unknown action', () => {
    const state = burgerConstructorReducer(undefined, { type: 'UNKNOWN_ACTION' });

    expect(state).toEqual(initialState);
  });

  test('does not change an existing state for an unknown action', () => {
    const state = burgerConstructorReducer(filledState, { type: 'UNKNOWN_ACTION' });

    expect(state).toBe(filledState);
  });

  describe('addIngredient', () => {
    test('puts a bun into the bun slot with a generated id', () => {
      const state = burgerConstructorReducer(initialState, addIngredient(bun));

      expectWithGeneratedId(state.bun, bun);
      expect(state.ingredients).toEqual([]);
    });

    test('replaces the previously selected bun', () => {
      const state = burgerConstructorReducer(filledState, addIngredient(otherBun));

      expectWithGeneratedId(state.bun, otherBun);
      expect(state.ingredients).toEqual(filledState.ingredients);
    });

    test('appends a filling or sauce to the end of the list', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(main));
      state = burgerConstructorReducer(state, addIngredient(sauce));

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(2);
      expectWithGeneratedId(state.ingredients[0], main);
      expectWithGeneratedId(state.ingredients[1], sauce);
    });

    test('gives a unique id to every copy of the same ingredient', () => {
      let state = burgerConstructorReducer(initialState, addIngredient(main));
      state = burgerConstructorReducer(state, addIngredient(main));

      const [first, second] = state.ingredients;
      expect(first.id).not.toBe(second.id);
    });
  });

  describe('removeIngredient', () => {
    test('removes only the ingredient with the given id', () => {
      const state = burgerConstructorReducer(filledState, removeIngredient('item-1'));

      expect(ingredientIds(state)).toEqual(['item-2', 'item-3']);
      expect(state.bun).toEqual(filledState.bun);
    });

    test('keeps the state unchanged for an unknown id', () => {
      const state = burgerConstructorReducer(filledState, removeIngredient('missing'));

      expect(state).toEqual(filledState);
    });
  });

  describe('moveIngredient', () => {
    test('moves an ingredient down', () => {
      const state = burgerConstructorReducer(
        filledState,
        moveIngredient({ from: 0, to: 1 })
      );

      expect(ingredientIds(state)).toEqual(['item-2', 'item-1', 'item-3']);
    });

    test('moves an ingredient up', () => {
      const state = burgerConstructorReducer(
        filledState,
        moveIngredient({ from: 2, to: 1 })
      );

      expect(ingredientIds(state)).toEqual(['item-1', 'item-3', 'item-2']);
    });

    test('does not touch the bun', () => {
      const state = burgerConstructorReducer(
        filledState,
        moveIngredient({ from: 0, to: 2 })
      );

      expect(state.bun).toEqual(filledState.bun);
      expect(ingredientIds(state)).toEqual(['item-2', 'item-3', 'item-1']);
    });
  });

  test('clearConstructor removes the bun and all ingredients', () => {
    const state = burgerConstructorReducer(filledState, clearConstructor());

    expect(state).toEqual(initialState);
  });

  test('createOrder.fulfilled clears the constructor', () => {
    const order: TOrder = {
      _id: 'order-id',
      status: 'done',
      name: 'Краторный био-марсианский бургер',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      number: 42,
      ingredients: [bun._id, main._id, bun._id],
    };

    const state = burgerConstructorReducer(
      filledState,
      createOrder.fulfilled(order, 'requestId', [bun._id, main._id, bun._id])
    );

    expect(state).toEqual(initialState);
  });
});
