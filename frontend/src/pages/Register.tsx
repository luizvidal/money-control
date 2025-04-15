import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../components/auth/AlertMessage';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import LoadingButton from '../components/auth/LoadingButton';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({ name, email, password });
      navigate('/login', { state: { message: 'Registration successful! Please sign in to continue.' } });
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register to start controlling your finances"
    >
      {error && (
        <AlertMessage type="error">{error}</AlertMessage>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <FormInput
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            isFirst={true}
          />
          <FormInput
            id="email-address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />
          <FormInput
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
          />
          <FormInput
            id="confirm-password"
            name="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            isLast={true}
          />
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500">
            By registering, you agree to our <Link to="#" className="text-blue-600 hover:text-blue-500">Terms of Service</Link> and <Link to="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>.
          </p>
        </div>

        <div>
          <LoadingButton loading={loading}>
            Create Account
          </LoadingButton>
        </div>

        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Already have an account? <span className="underline">Sign in</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
