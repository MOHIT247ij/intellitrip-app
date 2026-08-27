import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Wifi, Wind, Waves, ParkingCircle, Coffee, Sparkle, Hotel as HotelIcon, ArrowUpDown, ExternalLink } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { bookingService } from '../services/bookingService';
import { formatCurrency } from '../utils/format';
import DestinationPicker from '../components/DestinationPicker';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

const AMENITY_ICON = { 'Free WiFi': Wifi, 'Air Conditioning': Wind, 'Swimming Pool': Waves, Parking: ParkingCircle, 'Breakfast Included': Coffee, Spa: Sparkle };

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Rating: High to Low' },
];

function googleHotelsUrl(place) {
  return `https://www.google.com/travel/hotels?q=${encodeURIComponent(`Hotels in ${place}`)}`;
}

function hotelCheckUrl(hotel, destination) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${hotel.name} ${hotel.location || destination}`)}`;
}

export default function Hotels() {
  const [searchParams] = useSearchParams();
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Goa');
  const [sortBy, setSortBy] = useState('recommended');
  const [minRating, setMinRating] = useState(0);
  const { data: hotels, loading } = useFetch(() => bookingService.hotels(destination), [destination]);

  const visibleHotels = useMemo(() => {
    if (!hotels) return hotels;
    const filtered = hotels.filter((h) => (h.rating || 0) >= minRating);
    const sorted = [...filtered];
    if (sortBy === 'price_asc') sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sortBy === 'price_desc') sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
    if (sortBy === 'rating_desc') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  }, [hotels, sortBy, minRating]);

  // Searching also opens real live results on Google Hotels in a new tab.
  const handleSearch = (dest) => {
    setDestination(dest);
    window.open(googleHotelsUrl(dest), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="page-hero-icon"><HotelIcon size={24} /></span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Hotels</h1>
            <p className="mt-1 text-white/85">Browse stays for your destination.</p>
          </div>
        </div>
        <a
          href={googleHotelsUrl(destination)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-light !py-1.5 !px-4 !text-xs inline-flex shrink-0 items-center gap-1.5"
        >
          <ExternalLink size={14} /> Check live prices on Google Hotels
        </a>
      </div>
      <DestinationPicker onSearch={handleSearch} />
      <p className="-mt-6 mb-6 text-xs text-slate-400">
        Hitting Search also opens live results on Google Hotels in a new tab, so you always have real prices to check.
      </p>

      {!loading && hotels?.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl2 bg-white p-3 shadow-soft ring-1 ring-slate-900/5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><ArrowUpDown size={14} /> Sort</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field !w-auto !py-1.5 !text-xs">
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="ml-2 text-xs font-semibold text-slate-500">Min rating</span>
          <div className="flex gap-1">
            {[0, 3, 3.5, 4, 4.5].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${minRating === r ? 'bg-brand-600 text-white shadow-card' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                {r === 0 ? 'Any' : `${r}+`}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard count={6} /></div>}

      {!loading && hotels?.length === 0 && <EmptyState title="No hotels found" description="Try a different destination." />}

      {!loading && visibleHotels?.length === 0 && hotels?.length > 0 && (
        <EmptyState title="No hotels match that rating" description="Try lowering the minimum rating filter." />
      )}

      {!loading && visibleHotels?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleHotels.map((hotel, i) => (
            <div
              key={hotel.id}
              className="card group flex flex-col overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{hotel.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-500"><Star size={12} fill="currentColor" /> {hotel.rating}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{hotel.location}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {hotel.amenities.map((a) => {
                    const Icon = AMENITY_ICON[a] || Sparkle;
                    return <span key={a} className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-500"><Icon size={10} /> {a}</span>;
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  {!hotel.isMock && (
                    <span className="font-semibold text-slate-800">{formatCurrency(hotel.pricePerNight)}<span className="text-xs font-normal text-slate-400">/night</span></span>
                  )}
                  <a
                    href={hotelCheckUrl(hotel, destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent !py-1.5 !px-4 !text-xs active:scale-95 ml-auto inline-flex items-center gap-1"
                  >
                    Check &amp; book online <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
