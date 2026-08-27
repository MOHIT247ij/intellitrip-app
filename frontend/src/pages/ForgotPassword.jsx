import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { KeyRound, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      showToast('An OTP has been sent to your email.', 'success');
      navigate('/reset-password', { state: { userId: result.userId, devOtp: result.devOtp, email } });
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
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-card">
            <KeyRound size={26} />
          </span>
          <h1 className="text-2xl font-bold text-slate-800">Forgot your password?</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your account email and we'll send you a one-time code to reset it.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <div>
            <label className="label-field" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 className="animate-spin" size={16} />} Send reset code
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
