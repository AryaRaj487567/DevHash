import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (email, password) => {
    await login(email, password);
    navigate(from, { replace: true });
  };

  return <AuthForm mode="login" onSubmit={handleLogin} />;
}

export default Login;
