import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { loginUser } from '../../services/slices/userSlice';
import { useDispatch } from '../../services/store';

import type { Location } from 'react-router-dom';

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    setError(null);
    const state = location.state as { from?: Partial<Location> } | null;
    const from = state?.from;

    void dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        void navigate(from ?? '/', { replace: true });
      })
      .catch((err: Error) => setError(err));
  };

  return (
    <LoginUI
      errorText={error?.message}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
