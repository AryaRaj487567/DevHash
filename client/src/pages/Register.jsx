import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';

function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (name, email, password) => {
    await register(name, email, password);
    navigate('/dashboard', { replace: true });
  };

  return <AuthForm mode="register" onSubmit={handleRegister} />;
}

export default Register;
