import { AppHeaderUI } from '@ui';

import { selectUserData } from '../../services/slices/userSlice';
import { useSelector } from '../../services/store';

export const AppHeader = (): React.JSX.Element => {
  const userName = useSelector(selectUserData)?.name;

  return <AppHeaderUI userName={userName} />;
};
