/**
 * BookingModal.jsx
 * -----------------------------------------------------------------
 * Implements the payment gateway architecture end-to-end on the
 * client:
 *   Review -> Confirm -> create booking -> create payment intent ->
 *   pay (mock UPI intent, OR the real Razorpay Checkout widget when
 *   the backend is running PAYMENT_PROVIDER=razorpay) -> verify ->
 *   booking confirmed
 *
 * No fake card entry form anywhere. In mock mode we render a UPI
 * intent + a simulated gateway verification callback (matching
 * backend/src/integrations/payment.provider.js's MockPaymentProvider).
 * In Razorpay mode we launch the REAL Razorpay Checkout popup
 * (TEST MODE keys — no real money moves, but it is the actual
 * gateway UI/redirect, not a simulated button), and verify the
 * signature the popup returns against the backend, exactly as
 * Razorpay's own docs recommend. Every mock step is labeled clearly.
 * -----------------------------------------------------------------
 */
import { useState } from 'react';
import { X, CreditCard, CheckCircle2, Loader2, QrCode, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingService } from '../services/bookingService';
import { formatCurrency } from '../utils/format';
import MockBadge from './MockBadge';

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

export default function BookingModal({ type, title, items, onClose }) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState('review');
  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);

  const total = items.reduce((sum, i) => sum + i.unitPrice * (i.quantity || 1), 0);

  const finishBooking = (status, resultBooking) => {
    setBooking(resultBooking || booking);
    setStep(status === 'SUCCESS' ? 'confirmed' : 'failed');
  };

  const launchRazorpay = (paymentResult) => {
    window.Razorpay && new window.Razorpay({
      key: paymentResult.razorpayKeyId,
      order_id: paymentResult.razorpayOrderId,
      amount: Math.round(paymentResult.amount * 100),
      currency: paymentResult.currency || 'INR',
      name: 'IntelliTrip',
      description: title,
      prefill: { name: user?.fullName, email: user?.email, contact: user?.mobile },
      theme: { color: '#0d9488' },
      handler: async (response) => {
        setStep('processing');
        try {
          const verifyResult = await bookingService.verifyPayment({
            paymentId: paymentResult.payment.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          finishBooking(verifyResult.payment.status, verifyResult.booking);
        } catch (err) {
          showToast(err.message, 'error');
          setStep('failed');
        }
      },
      modal: {
        ondismiss: () => setStep('upi'), // user closed the Razorpay popup without paying
      },
    }).open();
  };

  const handleConfirm = async () => {
    setStep('processing');
    try {
      const createdBooking = await bookingService.createBooking({ type, items });
      setBooking(createdBooking);
      const paymentResult = await bookingService.createPayment({ bookingId: createdBooking.id });
      setPayment(paymentResult);
      // Same step name for both — the JSX below picks the Razorpay
      // "Pay Now" panel vs. the mock UPI panel based on paymentResult.isMock.
      setStep('upi');
    } catch (err) {
      showToast(err.message, 'error');
      setStep('review');
    }
  };

  const handlePayNowReal = async () => {
    try {
      await loadRazorpayScript();
      launchRazorpay(payment);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePaySimulate = async (result) => {
    setStep('processing');
    try {
      const verifyResult = await bookingService.verifyPayment({
        paymentId: payment.payment.id,
        transactionRef: payment.payment.transactionRef,
        simulateResult: result,
      });
      finishBooking(verifyResult.payment.status, verifyResult.booking);
    } catch (err) {
      showToast(err.message, 'error');
      setStep('failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl2 bg-white p-6 shadow-cardHover">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-display text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {!isAuthenticated ? (
          <div className="py-6 text-center">
            <p className="text-sm text-slate-600">Please log in to book.</p>
            <Link to="/login" className="btn-primary mt-4 inline-flex">Log in</Link>
          </div>
        ) : (
          <>
            {step === 'review' && (
              <div>
                <ul className="divide-y divide-slate-100">
                  {items.map((item, i) => (
                    <li key={i} className="flex justify-between py-2 text-sm">
                      <span className="text-slate-600">{item.itemName} {item.quantity > 1 && `× ${item.quantity}`}</span>
                      <span className="font-medium text-slate-800">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 font-semibold text-slate-800">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="mt-3"><MockBadge label="Demo booking — no real inventory reserved" /></div>
                <button onClick={handleConfirm} className="btn-primary mt-5 w-full">Review & Confirm</button>
              </div>
            )}

            {step === 'processing' && (
              <div className="flex flex-col items-center py-10">
                <Loader2 className="animate-spin text-brand-600" size={32} />
                <p className="mt-3 text-sm text-slate-500">Processing...</p>
              </div>
            )}

            {step === 'upi' && payment && !payment.isMock && payment.razorpayOrderId && (
              <div className="flex flex-col items-center py-4 text-center">
                <ShieldCheck size={64} className="mb-3 text-brand-600" />
                <p className="text-sm text-slate-600">Pay {formatCurrency(payment.amount)} securely via Razorpay</p>
                <p className="mt-1 text-xs text-slate-400">Supports UPI, cards, netbanking &amp; wallets</p>
                <MockBadge label="Razorpay TEST MODE — no real money moves" />
                <button onClick={handlePayNowReal} className="btn-primary mt-5 w-full">
                  <CreditCard size={16} /> Pay Now via Razorpay
                </button>
              </div>
            )}

            {step === 'upi' && payment && (payment.isMock || !payment.razorpayOrderId) && (
              <div className="flex flex-col items-center py-4 text-center">
                <QrCode size={64} className="mb-3 text-brand-600" />
                <p className="text-sm text-slate-600">Pay {formatCurrency(total)} via UPI</p>
                <p className="mt-1 break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{payment.upiUri}</p>
                <MockBadge label="Simulated UPI payment (no real money moves)" />
                <div className="mt-5 flex w-full gap-2">
                  <button onClick={() => handlePaySimulate('SUCCESS')} className="btn-primary flex-1">
                    <CreditCard size={16} /> Simulate Success
                  </button>
                  <button onClick={() => handlePaySimulate('FAILED')} className="btn-secondary flex-1">Simulate Failure</button>
                </div>
              </div>
            )}

            {step === 'confirmed' && (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 size={48} className="mb-3 text-emerald-500" />
                <h3 className="font-semibold text-slate-800">Booking Confirmed</h3>
                <p className="mt-1 text-sm text-slate-500">Booking #{booking?.id} — {formatCurrency(total)}</p>
                {payment && !payment.isMock ? (
                  <MockBadge label="Paid via Razorpay (test mode)" />
                ) : (
                  <MockBadge label="Demo confirmation" />
                )}
                <button onClick={onClose} className="btn-primary mt-5">Done</button>
              </div>
            )}

            {step === 'failed' && (
              <div className="flex flex-col items-center py-8 text-center">
                <X size={48} className="mb-3 text-red-500" />
                <h3 className="font-semibold text-slate-800">Payment Failed</h3>
                <p className="mt-1 text-sm text-slate-500">Your booking was not confirmed. No charges were made.</p>
                <button onClick={() => setStep('review')} className="btn-primary mt-5">Try Again</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
