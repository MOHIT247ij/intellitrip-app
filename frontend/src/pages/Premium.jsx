/**
 * Premium.jsx
 * -----------------------------------------------------------------
 * IntelliTrip Premium — a recurring membership on top of the existing
 * one-time booking payments. Follows the exact same "gateway
 * architecture" pattern already used in BookingModal.jsx:
 *   Plan -> Subscribe -> pay (mock instant success/fail buttons, OR the
 *   real Razorpay Checkout widget when the backend is running
 *   PAYMENT_PROVIDER=razorpay) -> verify -> Premium unlocked
 * -----------------------------------------------------------------
 */
import { useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, CreditCard, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import { subscriptionService } from '../services/subscriptionService';
import { formatCurrency } from '../utils/format';
import MockBadge from '../components/MockBadge';

const PERKS = [
  'Unlimited AI itinerary planning (no daily cap)',
  'Priority AI re-planning — instant itinerary tweaks',
  'Early access to new IntelliTrip features',
  'Premium badge on your profile',
];

let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load the Razorpay Checkout script.'));
    document.head.appendChild(script);
  });
  return razorpayScriptPromise;
}

export default function Premium() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const { data } = useFetch(() => subscriptionService.getPlan(), []);
  const plan = data?.plan;

  const [step, setStep] = useState('idle'); // idle | processing | pay | done
  const [subResult, setSubResult] = useState(null);

  const handleSubscribe = async () => {
    setStep('processing');
    try {
      const result = await subscriptionService.create();
      setSubResult(result);
      setStep('pay');
    } catch (err) {
      showToast(err.message, 'error');
      setStep('idle');
    }
  };

  const finishVerify = async (payload) => {
    setStep('processing');
    try {
      const result = await subscriptionService.verify(payload);
      updateUser(result.user);
      setStep('done');
      showToast('Welcome to IntelliTrip Premium!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
      setStep('pay');
    }
  };

  const handlePayNowReal = async () => {
    try {
      await loadRazorpayScript();
      new window.Razorpay({
        key: subResult.keyId,
        subscription_id: subResult.subscriptionId,
        name: 'IntelliTrip Premium',
        description: plan?.name,
        prefill: { name: user?.fullName, email: user?.email, contact: user?.mobile },
        theme: { color: '#0d9488' },
        handler: (response) =>
          finishVerify({
            isMock: false,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        modal: { ondismiss: () => setStep('pay') },
      }).open();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePaySimulate = (result) =>
    finishVerify({ isMock: true, subscriptionId: subResult.subscriptionId, simulateResult: result });

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-lg">
        <div className="page-hero flex items-center gap-4">
          <span className="page-hero-icon"><Crown size={24} /></span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">IntelliTrip Premium</h1>
            <p className="mt-1 text-white/85">Plan smarter, faster — for frequent travellers.</p>
          </div>
        </div>

        {user?.isPremium ? (
          <div className="card flex flex-col items-center p-8 text-center">
            <Crown size={48} className="mb-3 text-amber-500" />
            <h3 className="font-semibold text-slate-800">You're already a Premium member!</h3>
            <p className="mt-1 text-sm text-slate-500">Enjoy unlimited AI planning and priority perks.</p>
          </div>
        ) : (
          <div className="card p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold text-slate-800">{plan?.name || 'IntelliTrip Premium'}</h2>
              {plan && <span className="text-2xl font-bold text-brand-700">{formatCurrency(plan.amountRupees)}<span className="text-sm font-normal text-slate-400">/mo</span></span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">{plan?.description}</p>

            <ul className="mt-5 space-y-2.5">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-600" /> {perk}
                </li>
              ))}
            </ul>

            {step === 'idle' && (
              <button onClick={handleSubscribe} className="btn-primary mt-6 w-full">
                <Sparkles size={16} /> Subscribe Now
              </button>
            )}

            {step === 'processing' && (
              <div className="mt-6 flex flex-col items-center py-6">
                <Loader2 className="animate-spin text-brand-600" size={28} />
                <p className="mt-3 text-sm text-slate-500">Processing...</p>
              </div>
            )}

            {step === 'pay' && subResult && !subResult.isMock && (
              <div className="mt-6 flex flex-col items-center py-2 text-center">
                <ShieldCheck size={56} className="mb-3 text-brand-600" />
                <p className="text-sm text-slate-600">Pay {formatCurrency(plan?.amountRupees)}/month securely via Razorpay</p>
                <p className="mt-1 text-xs text-slate-400">Supports UPI, cards, netbanking &amp; wallets</p>
                <MockBadge label="Razorpay TEST MODE — no real money moves" />
                <button onClick={handlePayNowReal} className="btn-primary mt-5 w-full">
                  <CreditCard size={16} /> Pay Now via Razorpay
                </button>
              </div>
            )}

            {step === 'pay' && subResult && subResult.isMock && (
              <div className="mt-6 flex flex-col items-center py-2 text-center">
                <ShieldCheck size={56} className="mb-3 text-brand-600" />
                <p className="text-sm text-slate-600">Simulated subscription checkout</p>
                <MockBadge label="Simulated payment (no real money moves)" />
                <div className="mt-5 flex w-full gap-2">
                  <button onClick={() => handlePaySimulate('SUCCESS')} className="btn-primary flex-1">
                    <CreditCard size={16} /> Simulate Success
                  </button>
                  <button onClick={() => handlePaySimulate('FAILED')} className="btn-secondary flex-1">Simulate Failure</button>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="mt-6 flex flex-col items-center py-6 text-center">
                <CheckCircle2 size={48} className="mb-3 text-emerald-500" />
                <h3 className="font-semibold text-slate-800">You're Premium now!</h3>
                <p className="mt-1 text-sm text-slate-500">Enjoy unlimited AI planning and priority perks.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
