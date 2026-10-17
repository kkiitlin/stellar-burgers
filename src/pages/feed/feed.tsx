import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { fetchFeed, selectFeed } from '../../services/slices/ordersSlice';
import { useDispatch, useSelector } from '../../services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const feed = useSelector(selectFeed);

  useEffect(() => {
    void dispatch(fetchFeed());
  }, [dispatch]);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeed());
  };

  if (feed.isLoading) {
    return <Preloader />;
  }

  if (feed.error) {
    return (
      <p className="text text_type_main-medium">
        Не удалось загрузить ленту заказов
        {feed.error.message ? `: ${feed.error.message}` : '.'}
      </p>
    );
  }

  return <FeedUI orders={feed.orders} handleGetFeeds={handleGetFeeds} />;
};
