import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Compass, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await authService.login(values);
      if (result.requiresVerification) {
        showToast('Please verify your account with the OTP we just sent.', 'info');
        navigate('/verify-otp', { state: { userId: result.userId, devOtp: result.devOtp } });
        return;
      }
      login(result.user, result.token);
      showToast(`Welcome back, ${result.user.fullName.split(' ')[0]}!`, 'success');
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

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <div>
            <label className="label-field" htmlFor="identifier">Email or Mobile Number</label>
            <input
              id="identifier"
              className="input-field"
              placeholder="you@example.com or 9876543210"
              {...register('identifier', { required: 'Email or mobile number is required' })}
            />
            {errors.identifier && <p className="mt-1 text-xs text-red-600">{errors.identifier.message}</p>}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="!mb-0 label-field" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">Forgot password?</Link>
            </div>
            <input id="password" type="password" className="input-field" {...register('password', { required: 'Password is required' })} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 className="animate-spin" size={16} />} Log in
          </button>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
            Demo account: <strong>demo@intellitrip.app</strong> / <strong>Demo@1234</strong>
          </p>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
