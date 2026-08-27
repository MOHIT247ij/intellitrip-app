import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlaneTakeoff, PlaneLanding, Clock, ArrowUpDown, ExternalLink } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDuration } from '../utils/format';
import DestinationPicker from '../components/DestinationPicker';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import BookingModal from '../components/BookingModal';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'duration_asc', label: 'Duration: Shortest' },
  { value: 'stops_asc', label: 'Stops: Fewest' },
];

export default function Flights() {
  const [searchParams] = useSearchParams();
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Goa');
  const [startLocation, setStartLocation] = useState('Mumbai');
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');
  const { data: flights, loading } = useFetch(() => bookingService.flights(destination, startLocation), [destination, startLocation]);

  const visibleFlights = useMemo(() => {
    if (!flights) return flights;
    const sorted = [...flights];
    if (sortBy === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'duration_asc') sorted.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
    if (sortBy === 'stops_asc') sorted.sort((a, b) => (a.stops || 0) - (b.stops || 0));
    return sorted;
  }, [flights, sortBy]);

  const googleFlightsUrl = `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${startLocation} to ${destination}`)}`;

  // Searching also opens real live results on Google Flights in a new
  // tab — since the free flight API's quota can run out, this way the
  // user always has a genuine, always-available source to check/book on.
  const handleSearch = (dest) => {
    setDestination(dest);
    const url = `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${startLocation} to ${dest}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="page-hero-icon"><PlaneTakeoff size={24} /></span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Flights</h1>
            <p className="mt-1 text-white/85">
              Domestic flight options across major Indian airlines.
            </p>
          </div>
        </div>
        <a
          href={googleFlightsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-light !py-1.5 !px-4 !text-xs inline-flex shrink-0 items-center gap-1.5"
        >
          <ExternalLink size={14} /> Check live prices on Google Flights
        </a>
      </div>
      <div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-slate-100 bg-white py-1.5 pl-1.5 pr-4 shadow-card transition focus-within:border-brand-300 focus-within:shadow-cardHover">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><PlaneTakeoff size={14} /></span>
        <label htmlFor="from-input" className="text-xs font-medium text-slate-400">From</label>
        <input
          id="from-input"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          placeholder="e.g. Mumbai"
          className="w-32 border-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
      </div>
      <DestinationPicker onSearch={handleSearch} placeholder="To — pick from the list or type any Indian city" />
      <p className="-mt-6 mb-6 text-xs text-slate-400">
        Hitting Search also opens live results on Google Flights in a new tab, so you always have real prices to check.
      </p>

      {!loading && flights?.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl2 bg-white p-3 shadow-soft ring-1 ring-slate-900/5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><ArrowUpDown size={14} /> Sort</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field !w-auto !py-1.5 !text-xs">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {loading && <div className="grid gap-4"><SkeletonCard count={4} /></div>}
      {!loading && flights?.length === 0 && <EmptyState title="No flights found" description="Try a different destination." />}

      {!loading && visibleFlights?.length > 0 && (
        <div className="space-y-4">
          {visibleFlights.map((f, i) => (
            <div
              key={f.id}
              className="card flex flex-wrap items-center justify-between gap-4 p-5 animate-fadeInUp"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <div>
                <p className="font-semibold text-slate-800">{f.airline}</p>
                <p className="text-xs text-slate-500">{f.isDomestic ? 'Domestic' : 'International'} · {f.stops === 0 ? 'Non-stop' : `${f.stops} stop`}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1"><PlaneTakeoff size={14} /> {f.from} {f.departure}</span>
                <span className="flex items-center gap-1 text-slate-400"><Clock size={12} /> {formatDuration(f.durationMinutes)}</span>
                <span className="flex items-center gap-1"><PlaneLanding size={14} /> {f.to} {f.arrival}</span>
              </div>
              <div className="flex items-center gap-3">
                {!f.isMock && <span className="font-semibold text-slate-800">{formatCurrency(f.price)}</span>}
                {f.isMock ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${f.from} to ${f.to}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-accent !py-1.5 !px-4 !text-xs active:scale-95 inline-flex items-center gap-1"
                    >
                      Book on Google Flights <ExternalLink size={12} />
                    </a>
                    {/* Demo path so the real Razorpay TEST MODE payment popup can
                        always be tried, even while the live flight API quota is
                        exhausted and results are mock. Clearly labeled as a demo. */}
                    <button
                      onClick={() => setSelected(f)}
                      className="btn-secondary !py-1.5 !px-3 !text-xs active:scale-95"
                      title="Try the real Razorpay payment popup with demo flight data"
                    >
                      Test payment (demo)
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setSelected(f)} className="btn-accent !py-1.5 !px-4 !text-xs active:scale-95">Book</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <BookingModal
          type="FLIGHT"
          title={`${selected.airline} — ${selected.from} to ${selected.to}`}
          items={[{ itemName: `${selected.airline} flight`, description: `${selected.from} → ${selected.to}, ${selected.departure}`, quantity: 1, unitPrice: selected.price, metadata: selected }]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
