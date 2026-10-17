import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import {
  selectIsAuthChecked,
  selectIsAuthenticated,
} from '../../services/slices/userSlice';
import { useSelector } from '../../services/store';

import type { Location } from 'react-router-dom';

type TProtectedRouteProps = {
  children: React.ReactElement;
  onlyUnAuth?: boolean; // Флаг для роутов, доступных ТОЛЬКО неавторизованным (логин, регистрация)
};

export type TProtectedRouteState = {
  from?: Partial<Location>;
};

export const ProtectedRoute = ({
  children,
  onlyUnAuth,
}: TProtectedRouteProps): React.JSX.Element => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // Пока идёт проверка токена при загрузке приложения — показываем прелоадер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  // Если роут только для неавторизованных (login), а юзер уже авторизован
  if (onlyUnAuth && isAuthenticated) {
    // Перенаправляем туда, откуда он пришёл, или на главную
    const state = location.state as TProtectedRouteState | null;
    const from = state?.from ?? { pathname: '/' };
    return <Navigate replace to={from} />;
  }

  // Если роут приватный (profile), а юзер НЕ авторизован
  if (!onlyUnAuth && !isAuthenticated) {
    // Сохраняем маршрут, куда юзер пытался зайти, чтобы вернуть его туда после логина
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  // Если проверки пройдены, рендерим компонент
  return children;
};
