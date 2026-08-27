import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UtensilsCrossed, IndianRupee, ExternalLink } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { bookingService } from '../services/bookingService';
import { formatCurrency } from '../utils/format';
import DestinationPicker from '../components/DestinationPicker';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

function restaurantSearchUrl(place) {
  return `https://www.google.com/search?q=${encodeURIComponent(`Best restaurants in ${place}`)}`;
}

function restaurantCheckUrl(r, destination) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${r.name} ${destination}`)}`;
}

export default function Restaurants() {
  const [searchParams] = useSearchParams();
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Goa');
  const { data: restaurants, loading } = useFetch(() => bookingService.restaurants(destination), [destination]);

  // Searching also opens real live results in a new tab.
  const handleSearch = (dest) => {
    setDestination(dest);
    window.open(restaurantSearchUrl(dest), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="page-hero-icon"><UtensilsCrossed size={24} /></span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Restaurants</h1>
            <p className="mt-1 text-white/85">Real nearby places to eat, sourced live from OpenStreetMap.</p>
          </div>
        </div>
        <a
          href={restaurantSearchUrl(destination)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-light !py-1.5 !px-4 !text-xs inline-flex shrink-0 items-center gap-1.5"
        >
          <ExternalLink size={14} /> Find more restaurants
        </a>
      </div>
      <DestinationPicker onSearch={handleSearch} />
      <p className="-mt-6 mb-6 text-xs text-slate-400">
        Hitting Search also opens more real results in a new tab, so you always have more to choose from.
      </p>

      {loading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard count={6} /></div>}
      {!loading && restaurants?.length === 0 && <EmptyState title="No restaurants found" description="Try a different destination." />}

      {!loading && restaurants?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r, i) => (
            <div key={r.id} className="card flex flex-col p-4 animate-fadeInUp" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800">{r.name}</h3>
                <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700">{r.kind}</span>
              </div>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{r.description}</p>
              <p className="mt-2 text-xs text-slate-500">Cuisine: {r.cuisine}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                {!r.isMock && (
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <IndianRupee size={14} /> {formatCurrency(r.estimatedCostForTwo)}
                    <span className="text-xs font-normal text-slate-400">for two</span>
                  </span>
                )}
                <a
                  href={restaurantCheckUrl(r, destination)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent !py-1.5 !px-4 !text-xs active:scale-95 ml-auto inline-flex items-center gap-1"
                >
                  Check &amp; book online <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
