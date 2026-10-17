import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { NotFound404 } from '@pages/not-fount-404/not-fount-404';

import { selectIngredients } from '../../services/slices/ingredientsSlice';
import {
  fetchOrderByNumber,
  selectCurrentOrder,
  selectCurrentOrderError,
  selectCurrentOrderIsLoading,
} from '../../services/slices/ordersSlice';
import { useDispatch, useSelector } from '../../services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();

  const order = useSelector(selectCurrentOrder);
  const isLoading = useSelector(selectCurrentOrderIsLoading);
  const error = useSelector(selectCurrentOrderError);
  const ingredients = useSelector(selectIngredients);

  useEffect(() => {
    void dispatch(fetchOrderByNumber(Number(number)));
  }, [dispatch, number]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!order || !ingredients.length) return null;

    const date = new Date(order.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = order.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...order,
      ingredientsInfo,
      date,
      total,
    };
  }, [order, ingredients]);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className="text text_type_main-medium">
        Не удалось загрузить заказ{error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!orderInfo) {
    return <NotFound404 />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
