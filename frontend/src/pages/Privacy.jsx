import { ShieldCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="container-page py-16">
      <div className="page-hero mx-auto max-w-2xl text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <ShieldCheck size={28} />
        </span>
        <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/80">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="card mx-auto mt-10 max-w-3xl space-y-6 p-6 text-sm leading-relaxed text-slate-600 sm:p-8">
        <p>
          This Privacy Policy explains what information IntelliTrip ("we", "us") collects, how we use it, and the
          choices you have. By using IntelliTrip you agree to the practices described here.
        </p>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">1. Information We Collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details you provide: name, email address, mobile number, and a hashed password.</li>
            <li>Trip data you create: destinations, dates, preferences, budgets, and generated itineraries.</li>
            <li>Booking/payment metadata (amount, status) — actual card/UPI details are handled and stored only by Razorpay, never by IntelliTrip.</li>
            <li>Basic technical data (IP address, browser) used for security and rate-limiting.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>To create and secure your account, and send OTP verification codes by email.</li>
            <li>To generate AI-powered itineraries and personalize recommendations.</li>
            <li>To process bookings/subscriptions via our payment partner, Razorpay.</li>
            <li>To improve the Platform and respond to support requests.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">3. Third-Party Services</h2>
          <p>We share only the minimum data necessary with the following processors:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Google Gemini</strong> — trip preferences sent to generate itineraries.</li>
            <li><strong>Razorpay</strong> — payment processing (Terms &amp; Conditions and Refund Policy pages).</li>
            <li><strong>Google Maps / OpenWeather</strong> — destination coordinates and weather lookups.</li>
            <li><strong>Gmail SMTP</strong> — delivering OTP and account emails.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">4. Data Security</h2>
          <p>
            Passwords are hashed with bcrypt and never stored in plain text. OTP codes are hashed before storage.
            Sessions use signed JWTs. All secrets (API keys, database credentials) are kept in backend environment
            variables and are never exposed to the browser.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">5. Data Retention &amp; Deletion</h2>
          <p>
            We retain account and trip data for as long as your account is active. You may request deletion of your
            account and associated data at any time by contacting us — see below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">6. Your Rights</h2>
          <p>
            You can access, update, or delete your profile information from your Profile page, and can request a
            full export or deletion of your data by emailing us.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-800">7. Contact</h2>
          <p>
            For privacy questions or data requests, email{' '}
            <a href="mailto:mohithingase04@gmail.com" className="text-brand-600 hover:underline">mohithingase04@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
