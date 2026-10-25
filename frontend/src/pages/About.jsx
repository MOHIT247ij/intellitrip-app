import { Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="container-page py-16">
      <div className="page-hero mx-auto max-w-2xl text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Sparkles size={30} />
        </span>
        <h1 className="font-display text-3xl font-bold">About IntelliTrip</h1>
        <p className="mt-3 text-white/85">
          IntelliTrip is an AI travel companion that helps you plan smarter trips — discover destinations,
          build day-by-day itineraries, and book hotels and flights, all in one place.
        </p>
      </div>
    </div>
  );
}
