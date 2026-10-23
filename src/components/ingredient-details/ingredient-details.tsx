import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { NotFound404 } from '@pages/not-fount-404/not-fount-404';

import {
  selectIngredients,
  selectIsIngredientsLoading,
} from '../../services/slices/ingredientsSlice';
import { useSelector } from '../../services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const ingredients = useSelector(selectIngredients);
  const isLoading = useSelector(selectIsIngredientsLoading);

  const ingredientData = ingredients.find((item) => item._id === id);

  if (!ingredientData) {
    return isLoading ? <Preloader /> : <NotFound404 />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
