import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, PartyPopper, ExternalLink } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDuration } from '../utils/format';
import DestinationPicker from '../components/DestinationPicker';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

function thingsToDoUrl(place) {
  return `https://www.google.com/search?q=${encodeURIComponent(`Things to do in ${place}`)}`;
}

function experienceCheckUrl(exp, destination) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${exp.name} ${destination}`)}`;
}

export default function Experiences() {
  const [searchParams] = useSearchParams();
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Goa');
  const { data: experiences, loading } = useFetch(() => bookingService.experiences(destination), [destination]);

  // Searching also opens real live results in a new tab.
  const handleSearch = (dest) => {
    setDestination(dest);
    window.open(thingsToDoUrl(dest), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="page-hero-icon"><PartyPopper size={24} /></span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Experiences</h1>
            <p className="mt-1 text-white/85">Real nearby places to visit, sourced live from OpenStreetMap.</p>
          </div>
        </div>
        <a
          href={thingsToDoUrl(destination)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-light !py-1.5 !px-4 !text-xs inline-flex shrink-0 items-center gap-1.5"
        >
          <ExternalLink size={14} /> Explore more on Google
        </a>
      </div>
      <DestinationPicker onSearch={handleSearch} />
      <p className="-mt-6 mb-6 text-xs text-slate-400">
        Hitting Search also opens more real results in a new tab, so you always have more to explore.
      </p>

      {loading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard count={4} /></div>}
      {!loading && experiences?.length === 0 && <EmptyState title="No experiences found" description="Try a different destination." />}

      {!loading && experiences?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp, i) => (
            <div
              key={exp.id}
              className="card group flex flex-col overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <div className="h-40 w-full overflow-hidden">
                <img src={exp.imageUrl} alt={exp.name} className="h-40 w-full object-cover transition duration-500 group-hover:scale-110" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-semibold text-slate-800">{exp.name}</h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{exp.description}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><Clock size={12} /> {formatDuration(exp.durationMinutes)}</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  {!exp.isMock && <span className="font-semibold text-slate-800">{formatCurrency(exp.price)}</span>}
                  <a
                    href={experienceCheckUrl(exp, destination)}
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
