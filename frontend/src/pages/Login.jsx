import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleCredential = async (credential) => {
    setLoading(true);
    try {
      const result = await authService.googleAuth(credential);
      login(result.user, result.token);
      showToast(`Welcome, ${result.user.fullName.split(' ')[0]}!`, 'success');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page relative flex min-h-[80vh] items-center justify-center overflow-hidden py-12">
      <div className="blob -left-20 top-10 h-64 w-64 bg-brand-200/50" />
      <div className="blob -right-16 bottom-10 h-64 w-64 bg-accent-200/50" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-brand-700">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-card">
              <Compass size={22} />
            </span>
            IntelliTrip
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to continue planning your next adventure.</p>
        </div>

        <div className="card space-y-5 p-6">
          <p className="text-center text-sm text-slate-500">Sign in with your Google account to continue.</p>
          <GoogleSignInButton onCredential={handleGoogleCredential} showDivider={false} />
          {loading && (
            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <Loader2 className="animate-spin" size={14} /> Signing you in…
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
