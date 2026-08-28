import { RotateCcw } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="container-page py-16">
      <div className="page-hero mx-auto max-w-2xl text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <RotateCcw size={28} />
        </span>
        <h1 className="font-display text-3xl font-bold">Refund &amp; Cancellation Policy</h1>
        <p className="mt-2 text-sm text-white/80">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="card mx-auto mt-10 max-w-3xl space-y-6 p-6 text-sm leading-relaxed text-slate-600 sm:p-8">
        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">1. IntelliTrip Premium Subscription</h2>
          <p>
            IntelliTrip Premium is a recurring monthly subscription (₹199/month) that unlocks unlimited AI itinerary
            planning. You may cancel your subscription at any time from your Profile page — cancellation stops future
            renewals but does not refund the current billing period already paid for.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">2. Refund Eligibility</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>If you were charged due to a verified technical error (e.g. duplicate charge, failed activation), you are eligible for a full refund.</li>
            <li>Refund requests must be raised within 7 days of the charge.</li>
            <li>Partial-period refunds for early cancellation of a subscription are not provided, in line with standard SaaS practice.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">3. Third-Party Bookings (Hotels, Flights, Cabs, Experiences)</h2>
          <p>
            Bookings made through IntelliTrip for hotels, flights, cabs, or experiences are subject to the
            cancellation and refund policy of the underlying provider (e.g. the hotel or airline). IntelliTrip will
            assist in relaying cancellation requests but the final refund decision and timeline rests with that
            provider.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">4. How to Request a Refund</h2>
          <p>
            Email <a href="mailto:mohithingase04@gmail.com" className="text-brand-600 hover:underline">mohithingase04@gmail.com</a>{' '}
            with your registered email address, the payment ID (shown in your Bookings/Profile page), and the reason
            for the request. We aim to respond within 3–5 business days.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">5. Refund Processing Time</h2>
          <p>
            Approved refunds are issued to the original payment method via Razorpay and typically reflect within
            5–7 business days, depending on your bank or card network.
          </p>
        </section>
      </div>
    </div>
  );
}
