import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const userId = location.state?.userId;
  const devOtp = location.state?.devOtp;

  useEffect(() => {
    if (!userId) navigate('/forgot-password');
  }, [userId, navigate]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await authService.resetPassword({
        userId,
        otp: values.otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      login(result.user, result.token);
      showToast('Password updated! You are now logged in.', 'success');
      navigate('/');
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
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-card">
            <ShieldCheck size={26} />
          </span>
          <h1 className="text-2xl font-bold text-slate-800">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-500">Enter the 6-digit OTP sent to {location.state?.email || 'your email'} and choose a new password.</p>
        </div>

        {devOtp && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
            Development mode: your OTP is <strong>{devOtp}</strong>. In production this would arrive by email.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <div>
            <label className="label-field" htmlFor="otp">OTP</label>
            <input
              id="otp"
              defaultValue={devOtp || ''}
              className="input-field text-center text-xl tracking-[0.4em]"
              maxLength={6}
              placeholder="------"
              {...register('otp', { required: 'OTP is required', minLength: { value: 6, message: 'OTP must be 6 digits' } })}
            />
            {errors.otp && <p className="mt-1 text-xs text-red-600">{errors.otp.message}</p>}
          </div>
          <div>
            <label className="label-field" htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              className="input-field"
              {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
            />
            {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="label-field" htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input-field"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('newPassword') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 className="animate-spin" size={16} />} Reset password
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Didn't get the code?{' '}
          <Link to="/forgot-password" className="font-medium text-brand-600 hover:underline">Start over</Link>
        </p>
      </div>
    </div>
  );
}
