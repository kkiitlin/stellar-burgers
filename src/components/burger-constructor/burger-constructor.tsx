import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Импортируем хук навигации

import {
  clearConstructor,
  selectConstructor,
} from '../../services/slices/burgerConstructorSlice';
import {
  createOrder,
  resetCreatedOrder,
  selectCreateOrderError,
  selectCreatedOrder,
  selectIsOrderCreating,
} from '../../services/slices/ordersSlice';
import {
  selectIsAuthChecked,
  selectIsAuthenticated,
} from '../../services/slices/userSlice';
import { useDispatch, useSelector } from '../../services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Инициализируем функцию для переходов
  const isAuthenticated = useSelector(selectIsAuthenticated); // Узнаем, залогинен ли юзер
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const constructorItems = useSelector(selectConstructor);
  const orderRequest = useSelector(selectIsOrderCreating);
  const orderModalData = useSelector(selectCreatedOrder);
  const orderError = useSelector(selectCreateOrderError);

  const onOrderClick = (): void => {
    if (!isAuthChecked) return;

    // 3. Главная проверка: если пользователь НЕ авторизован, отправляем на /login
    if (!isAuthenticated) {
      void navigate('/login');
      return; // Прерываем выполнение функции, чтобы заказ не начал оформляться
    }

    // Если авторизован, логика идет дальше
    if (!constructorItems.bun || orderRequest) return;

    const ingredientIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item: TConstructorIngredient) => item._id),
      constructorItems.bun._id,
    ];
    void dispatch(createOrder(ingredientIds));
  };

  const closeOrderModal = (): void => {
    if (orderModalData) {
      void dispatch(clearConstructor());
    }
    void dispatch(resetCreatedOrder());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      orderErrorText={orderError?.message}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
