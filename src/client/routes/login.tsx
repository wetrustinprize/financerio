import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';

import { useEffect, useState } from 'react';
import { addToast } from '@heroui/toast';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router';

const Login: React.FC = () => {
  const [fetching, setFetching] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const jwt = Cookies.get('jwt');

    if (jwt) navigate('/dashboard');
  }, []);

  const handleSubmit = async () => {
    setFetching(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });

      if (response.status !== 200 && response.status !== 401) throw response;

      const body = await response.text();

      if (!response.ok) {
        addToast({
          title: `Error ${response.status}`,
          description: body,
          color: 'danger',
        });
        return;
      }

      addToast({ title: `Success login!`, color: 'success' });
      Cookies.set('jwt', body);
      navigate('/dashboard');
    } catch (e) {
      addToast({ title: 'Unknown error!', color: 'danger' });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      {!fetching ? (
        <div className="bg-neutral-200 p-4 rounded-xl">
          <section className="flex gap-2">
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isDisabled={fetching}
              onSubmit={handleSubmit}
            />
            <Button
              color="primary"
              isDisabled={fetching || password.length === 0}
              onPress={handleSubmit}
            >
              Login
            </Button>
          </section>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Login;
