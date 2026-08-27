import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Car, Users, ExternalLink } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { bookingService } from '../services/bookingService';
import DestinationPicker from '../components/DestinationPicker';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

function cabSearchUrl(place) {
  return `https://www.google.com/search?q=${encodeURIComponent(`Book a cab in ${place} Ola Uber`)}`;
}

export default function Cabs() {
  const [searchParams] = useSearchParams();
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Goa');
  const { data: cabs, loading } = useFetch(() => bookingService.cabs(destination), [destination]);

  // Searching also opens a real cab-booking search (Ola/Uber) in a new tab —
  // there's no free live cab-pricing API, so this is the genuine option.
  const handleSearch = (dest) => {
    setDestination(dest);
    window.open(cabSearchUrl(dest), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="page-hero-icon"><Car size={24} /></span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Cabs</h1>
            <p className="mt-1 text-white/85">Local transport options for your trip.</p>
          </div>
        </div>
        <a
          href={cabSearchUrl(destination)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-light !py-1.5 !px-4 !text-xs inline-flex shrink-0 items-center gap-1.5"
        >
          <ExternalLink size={14} /> Find a real cab (Ola / Uber)
        </a>
      </div>
      <DestinationPicker onSearch={handleSearch} />
      <p className="-mt-6 mb-6 text-xs text-slate-400">
        Hitting Search also opens real cab options in a new tab, so you always have a live price to check.
      </p>

      {loading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard count={4} /></div>}
      {!loading && cabs?.length === 0 && <EmptyState title="No cabs found" description="Try a different destination." />}

      {!loading && cabs?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cabs.map((cab, i) => (
            <div key={cab.id} className="card p-5 animate-fadeInUp" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition duration-300 group-hover:scale-110"><Car size={20} /></div>
              <h3 className="font-semibold text-slate-800">{cab.vehicle}</h3>
              <p className="text-xs text-slate-500">{cab.location}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><Users size={12} /> {cab.capacity} seater{cab.estimatedDistanceKm ? ` · ~${cab.estimatedDistanceKm} km` : ''}</p>
              <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3">
                <a
                  href={cabSearchUrl(cab.location || destination)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent !py-1.5 !px-4 !text-xs active:scale-95 inline-flex items-center gap-1"
                >
                  Book via Ola / Uber <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
