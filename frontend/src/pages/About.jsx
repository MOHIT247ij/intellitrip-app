import { Sparkles, ServerCog, ShieldCheck, Hotel, PlaneTakeoff, CloudSun, MapPinned, CreditCard, BrainCircuit } from 'lucide-react';

const STACK = [
  { title: 'React + Vite', desc: 'A fast, component-based frontend that talks to the backend purely through REST APIs.' },
  { title: 'Node.js + Express', desc: 'A modular REST API layer handling auth, trips, bookings, payments and AI orchestration.' },
  { title: 'MySQL + Prisma', desc: 'A relational database for structured travel data, accessed through a type-safe ORM.' },
  { title: 'Google Gemini + RAG', desc: 'Real destination data grounds every AI-generated itinerary — no hallucinated places.' },
];

const ADVANCES = [
  { icon: Hotel, title: 'Real hotel search', desc: 'Live listings, ratings and pricing pulled from the Booking.com API — not placeholder inventory.' },
  { icon: PlaneTakeoff, title: 'Real flight search', desc: 'Live domestic flight results and pricing via the Sky Scrapper API, resolved for any origin/destination city.' },
  { icon: MapPinned, title: 'Real places, any destination', desc: 'Nearby attractions and experiences are pulled live from OpenStreetMap for whichever city you search — not a fixed list.' },
  { icon: CloudSun, title: 'Real weather', desc: 'Live forecasts from OpenWeatherMap for every destination and trip date.' },
  { icon: BrainCircuit, title: 'AI-grounded itineraries', desc: 'Day-by-day plans built from real destination data through a Retrieval-Augmented Generation pipeline.' },
  { icon: CreditCard, title: 'Real payment checkout', desc: 'Bookings go through an actual Razorpay Checkout flow (test mode) — the same UI real payments use.' },
];

export default function About() {
  return (
    <div className="container-page py-16">
      <div className="page-hero mx-auto max-w-2xl text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Sparkles size={30} />
        </span>
        <h1 className="font-display text-3xl font-bold">About IntelliTrip</h1>
        <p className="mt-3 text-white/85">
          IntelliTrip is an AI-driven travel planning and booking platform that combines a real relational database,
          a genuine Retrieval-Augmented Generation (RAG) pipeline, and Google Gemini to produce structured, grounded
          travel itineraries — not a chatbot returning static text.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-4">
        {STACK.map((s) => (
          <div key={s.title} className="card flex items-start gap-4 p-5">
            <div className="icon-badge !h-10 !w-10">
              <ServerCog size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <h2 className="section-heading text-center !text-2xl">What powers IntelliTrip</h2>
        <p className="section-subheading text-center">Real integrations, not static demo data.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ADVANCES.map((a) => (
            <div key={a.title} className="card flex items-start gap-3 p-4">
              <div className="icon-badge-soft !h-10 !w-10">
                <a.icon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{a.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-3xl rounded-xl2 bg-slate-50 p-6 text-sm text-slate-600">
        <div className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
          <ShieldCheck size={16} /> Your data
        </div>
        Passwords are hashed with bcrypt, sessions use JWTs, and all secrets (Gemini, payment, database credentials)
        live only in backend environment variables — never in the frontend bundle.
      </div>
    </div>
  );
}
