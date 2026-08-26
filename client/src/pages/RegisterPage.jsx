import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (values.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(values.name, values.email, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Join DevHash"
      subtitle="Create an account to draft and publish technical articles."
      submitLabel="Create account"
      onSubmit={submit}
      error={error}
      loading={loading}
      values={values}
      onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
      fields={[
        { name: 'name', label: 'Name', type: 'text', autoComplete: 'name', required: true },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          autoComplete: 'new-password',
          required: true,
        },
      ]}
      footer={{ text: 'Already writing here?', to: '/login', linkLabel: 'Log in' }}
    />
  );
};

export default RegisterPage;
