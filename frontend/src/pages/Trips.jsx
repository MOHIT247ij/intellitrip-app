import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Calendar, Users, Trash2, RefreshCw, PlaneTakeoff } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { tripService } from '../services/tripService';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import SkeletonCard from '../components/SkeletonCard';

const TABS = [
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'PAST', label: 'Past' },
  { key: 'ALL', label: 'All' },
];

export default function Trips() {
  const [tab, setTab] = useState('UPCOMING');
  const { data: trips, loading, error, refetch } = useFetch(() => tripService.list(), []);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const filtered = trips?.filter((t) => (tab === 'ALL' ? true : t.computedStatus === tab));

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    try {
      await tripService.remove(id);
      showToast('Trip deleted.', 'success');
      refetch();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="page-hero-icon"><Compass size={24} /></span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">My Trips</h1>
            <p className="mt-1 text-white/85">Upcoming plans, past adventures, and saved itineraries.</p>
          </div>
        </div>
        <button onClick={() => navigate('/planner')} className="btn-light">
          <PlaneTakeoff size={16} /> Plan a New Trip
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === t.key ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-card' : 'bg-white text-slate-600 border border-slate-200 hover:border-accent-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard count={3} />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && filtered?.length === 0 && (
        <EmptyState
          icon={Compass}
          title="No trips here yet"
          description="Generate an AI itinerary to see it appear here."
          action={<button onClick={() => navigate('/planner')} className="btn-primary">Plan My Trip</button>}
        />
      )}

      {!loading && !error && filtered?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trip) => (
            <div key={trip.id} className="card flex flex-col overflow-hidden">
              <div className="relative h-36 w-full overflow-hidden bg-brand-100">
                {trip.destination?.imageUrl && <img src={trip.destination.imageUrl} alt={trip.destination.name} className="h-full w-full object-cover" />}
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {trip.computedStatus === 'UPCOMING' ? 'Upcoming' : trip.computedStatus === 'PAST' ? 'Past' : trip.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 font-semibold text-slate-800">{trip.title}</h3>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {trip.travellers}</span>
                </div>
                {trip.estimatedBudget && <p className="mt-2 text-sm font-semibold text-brand-700">{formatCurrency(trip.estimatedBudget)}</p>}
                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                  <Link to={`/trips/${trip.id}`} className="btn-secondary !py-1.5 !px-3 flex-1 !text-xs">
                    <RefreshCw size={13} /> Open / Re-plan
                  </Link>
                  <button onClick={() => handleDelete(trip.id)} className="btn-ghost !py-1.5 !px-3 !text-xs text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
