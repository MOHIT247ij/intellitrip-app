import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const userId = location.state?.userId;
  const plan = location.state?.plan;
  const [otp, setOtp] = useState(location.state?.devOtp || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!userId) navigate('/register');
  }, [userId, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.verifyOtp({ userId, otp });
      login(result.user, result.token);
      showToast('Account verified! Welcome to IntelliTrip.', 'success');
      // Signed up choosing Premium -> straight to the subscribe/payment
      // flow instead of the homepage, so the plan choice actually leads
      // somewhere (Premium.jsx handles the mock/Razorpay checkout).
      navigate(plan === 'premium' ? '/premium' : '/');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const result = await authService.resendOtp(userId);
      if (result.devOtp) setOtp(result.devOtp);
      showToast('A new OTP has been sent.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container-page relative flex min-h-[80vh] items-center justify-center overflow-hidden py-12">
      <div className="blob -left-20 top-10 h-64 w-64 bg-brand-200/50" />
      <div className="blob -right-16 bottom-10 h-64 w-64 bg-accent-200/50" />
      <div className="relative w-full max-w-sm text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-card">
          <ShieldCheck size={26} />
        </span>
        <h1 className="text-2xl font-bold text-slate-800">Verify your account</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the 6-digit OTP sent to your email.</p>

        {location.state?.devOtp && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Development mode: your OTP is pre-filled below (<strong>{location.state.devOtp}</strong>). In production this would arrive by email.
          </p>
        )}

        <form onSubmit={handleVerify} className="card mt-6 space-y-4 p-6">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="input-field text-center text-2xl tracking-[0.5em]"
            maxLength={6}
            placeholder="------"
            aria-label="One-time password"
          />
          <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full">
            {loading && <Loader2 className="animate-spin" size={16} />} Verify
          </button>
          <button type="button" onClick={handleResend} disabled={resending} className="btn-ghost w-full">
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          <Link to="/login" className="font-medium text-brand-600 hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
