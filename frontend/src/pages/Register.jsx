import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Loader2, CheckCircle2, Crown } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('free'); // 'free' | 'premium'
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Google sign-up skips the OTP step entirely — Google already verified
  // the email for us — so the account is created and logged in immediately.
  const handleGoogleCredential = async (credential) => {
    setLoading(true);
    try {
      const result = await authService.googleAuth(credential);
      login(result.user, result.token);
      showToast(`Welcome, ${result.user.fullName.split(' ')[0]}!`, 'success');
      navigate(plan === 'premium' ? '/premium' : '/');
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
          <h1 className="mt-4 text-2xl font-bold text-slate-800">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Start planning smarter trips in minutes.</p>
        </div>

        <div className="card space-y-5 p-6">
          <div>
            <label className="label-field">Choose your plan</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlan('free')}
                className={`relative rounded-xl2 border p-3 text-left transition ${
                  plan === 'free' ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-slate-200 hover:border-brand-300'
                }`}
              >
                {plan === 'free' && <CheckCircle2 size={16} className="absolute right-2 top-2 text-brand-600" />}
                <p className="text-sm font-semibold text-slate-800">Free</p>
                <p className="mt-0.5 text-xs text-slate-500">Standard AI planning &amp; booking</p>
              </button>
              <button
                type="button"
                onClick={() => setPlan('premium')}
                className={`relative rounded-xl2 border p-3 text-left transition ${
                  plan === 'premium' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                {plan === 'premium' && <CheckCircle2 size={16} className="absolute right-2 top-2 text-amber-600" />}
                <p className="flex items-center gap-1 text-sm font-semibold text-slate-800"><Crown size={14} className="text-amber-500" /> Premium</p>
                <p className="mt-0.5 text-xs text-slate-500">₹199/mo · unlimited AI planning</p>
              </button>
            </div>
            {plan === 'premium' && (
              <p className="mt-2 text-xs text-slate-400">You'll set up payment right after signing in.</p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm text-slate-500">Sign up with your Google account to continue.</p>
            <GoogleSignInButton onCredential={handleGoogleCredential} showDivider={false} />
            {loading && (
              <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
                <Loader2 className="animate-spin" size={14} /> Creating your account…
              </p>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
