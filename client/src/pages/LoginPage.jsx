import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await login(values.email, values.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Log in to write, edit drafts, and manage your articles."
      submitLabel="Log in"
      onSubmit={submit}
      error={error}
      loading={loading}
      values={values}
      onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
      fields={[
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          autoComplete: 'current-password',
          required: true,
        },
      ]}
      footer={{ text: 'Need an account?', to: '/register', linkLabel: 'Register' }}
    />
  );
};

export default LoginPage;
