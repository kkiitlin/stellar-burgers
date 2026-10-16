import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import { Button } from '@krgaa/react-developer-burger-ui-components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { Preloader } from '@ui';
import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import {
  fetchIngredients,
  selectIngredientsError,
  selectIsIngredientsLoading,
} from '../../services/slices/ingredientsSlice';
import { checkAuth } from '../../services/slices/userSlice';
import { useDispatch, useSelector } from '../../services/store';
import { ProtectedRoute } from '../protected-route/protected-route';

import type { AppContentProps } from './type';
import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();

  const isIngredientsLoading = useSelector(selectIsIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkAuth());
  }, [dispatch]);

  const handleIngredientsRetry = (): void => {
    void dispatch(fetchIngredients());
  };

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        isLoading={isIngredientsLoading}
        error={ingredientsError}
        onRetry={handleIngredientsRetry}
      />
    </div>
  );
};

export default App;

const AppContent = ({
  isLoading,
  error,
  onRetry,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  return (
    <>
      {error && (
        <div className={styles.message}>
          <p className="text text_type_main-medium">
            Не удалось загрузить ингредиенты
            {error.message ? `: ${error.message}` : '.'}
          </p>
          <Button htmlType="button" type="primary" size="medium" onClick={onRetry}>
            Повторить
          </Button>
        </div>
      )}
      <RouteComponent />
    </>
  );
};

type TBackgroundLocationState = {
  background?: Location;
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as TBackgroundLocationState | null;
  const backgroundLocation = state?.background;

  const handleModalClose = (): void => {
    void navigate(-1);
  };

  return (
    <>
      {/* Главные маршруты */}
      <Routes location={backgroundLocation ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />

        {/* Эти роуты доступны ТОЛЬКО неавторизованным. Если юзер залогинен, выкинет на главную */}
        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        {/* Эти роуты доступны ТОЛЬКО авторизованным (onlyUnAuth не передаём) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />

        {/* Маршруты для отдельных страниц */}
        <Route
          path="/feed/:number"
          element={
            <div className={styles.detailPageWrap}>
              <h1 className={`${styles.detailHeader} text text_type_main-large mb-5`}>
                Детали заказа
              </h1>
              <OrderInfo />
            </div>
          }
        />
        <Route
          path="/ingredients/:id"
          element={
            <div className={styles.detailPageWrap}>
              <h1 className={`${styles.detailHeader} text text_type_main-large mb-5`}>
                Детали ингредиента
              </h1>
              <IngredientDetails />
            </div>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <div className={styles.detailPageWrap}>
                <h1 className={`${styles.detailHeader} text text_type_main-large mb-5`}>
                  Детали заказа
                </h1>
                <OrderInfo />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Страница 404 */}
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {/* Роуты для модалок. Отрисовываются ПОВЕРХ основного контента */}
      {backgroundLocation && (
        <Routes>
          <Route
            path="/feed/:number"
            element={
              <Modal title="Детали заказа" onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <Modal title="Детали заказа" onClose={handleModalClose}>
                  <OrderInfo />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};
