import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <div className="container-page py-16">
      <div className="page-hero mx-auto max-w-2xl text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Mail size={28} />
        </span>
        <h1 className="font-display text-3xl font-bold">Contact Us</h1>
        <p className="mt-2 text-white/85">Questions, feedback, or support requests — we're happy to help.</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <div className="icon-badge">
            <Mail size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Email</h3>
          <a href="mailto:mohithingase04@gmail.com" className="text-sm text-brand-600 hover:underline">
            mohithingase04@gmail.com
          </a>
        </div>

        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <div className="icon-badge">
            <Phone size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Phone</h3>
          <p className="text-sm text-slate-500">Available on request via email</p>
        </div>

        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <div className="icon-badge">
            <MapPin size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Location</h3>
          <p className="text-sm text-slate-500">India</p>
        </div>
      </div>

      <div className="card mx-auto mt-8 max-w-3xl p-6 text-center text-sm leading-relaxed text-slate-600 sm:p-8">
        <p>
          For account issues, booking/payment questions, refund requests, or general feedback about IntelliTrip,
          please write to us at{' '}
          <a href="mailto:mohithingase04@gmail.com" className="font-medium text-brand-600 hover:underline">
            mohithingase04@gmail.com
          </a>{' '}
          and we'll get back to you within 2–3 business days.
        </p>
      </div>
    </div>
  );
}
