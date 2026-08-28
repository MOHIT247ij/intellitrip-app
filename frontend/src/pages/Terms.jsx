import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="container-page py-16">
      <div className="page-hero mx-auto max-w-2xl text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <FileText size={28} />
        </span>
        <h1 className="font-display text-3xl font-bold">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-white/80">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="card mx-auto mt-10 max-w-3xl space-y-6 p-6 text-sm leading-relaxed text-slate-600 sm:p-8">
        <p>
          These Terms &amp; Conditions ("Terms") govern your use of IntelliTrip (the "Platform", "we", "us"), accessible at{' '}
          <a href="https://intellitrip-app.vercel.app" className="text-brand-600 hover:underline">intellitrip-app.vercel.app</a>.
          By creating an account or using the Platform, you agree to these Terms.
        </p>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">1. About IntelliTrip</h2>
          <p>
            IntelliTrip is an AI-assisted travel planning platform that helps users generate itineraries, discover
            destinations, and browse hotel, flight, cab and experience listings. Some listings are sourced from
            third-party providers (e.g. Booking.com and Sky Scrapper APIs) and some are demonstration/sample data used
            for planning purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">2. Account Registration</h2>
          <p>
            You must provide accurate information when registering and verify your account via the OTP sent to your
            email. You are responsible for maintaining the confidentiality of your password and for all activity
            under your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">3. Bookings &amp; Payments</h2>
          <p>
            Where a booking or subscription (e.g. IntelliTrip Premium) involves a payment, the payment is processed
            securely through Razorpay. IntelliTrip does not store your card, UPI or bank details on its own servers —
            these are handled entirely by Razorpay's PCI-DSS compliant infrastructure. By making a payment you also
            agree to Razorpay's terms of service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">4. AI-Generated Content</h2>
          <p>
            Itineraries and suggestions are generated using AI (Google Gemini) grounded on our destination database.
            While we aim for accuracy, AI-generated content may occasionally be incomplete or contain errors (prices,
            timings, availability). Please verify critical details (opening hours, prices, availability) directly
            with the relevant hotel, airline, or service provider before finalizing plans.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">5. Acceptable Use</h2>
          <p>
            You agree not to misuse the Platform — including attempting unauthorized access, scraping data at scale,
            or using the service for unlawful purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">6. Limitation of Liability</h2>
          <p>
            IntelliTrip is provided "as is". We are not liable for losses arising from third-party booking providers,
            travel disruptions, or reliance on AI-generated suggestions. Our total liability, where legally
            applicable, is limited to the amount you paid us in the preceding 3 months.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">7. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">8. Contact</h2>
          <p>
            Questions about these Terms? Reach us at{' '}
            <a href="mailto:mohithingase04@gmail.com" className="text-brand-600 hover:underline">mohithingase04@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
