import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { catalogService } from '../services/catalogService';
import { CATEGORY_OPTIONS } from '../utils/constants';
import PlaceCard from '../components/PlaceCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { useToast } from '../context/ToastContext';

export default function Explore() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState(false);
  const [maxCost, setMaxCost] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const destinationId = searchParams.get('destinationId') || '';

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      destinationId: destinationId || undefined,
      category: category || undefined,
      hiddenGemsOnly: hiddenGemsOnly || undefined,
      maxCost: maxCost || undefined,
    }),
    [debouncedSearch, destinationId, category, hiddenGemsOnly, maxCost]
  );

  const { data: places, loading, error, refetch } = useFetch(() => catalogService.listPlaces(filters), [JSON.stringify(filters)]);

  const handleAdd = (place) => {
    showToast(`${place.name} — open the AI Planner and mention it in your natural language request, or add it after generating an itinerary.`, 'info');
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex items-center gap-4">
        <span className="page-hero-icon"><Search size={24} /></span>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Explore Destinations & Places</h1>
          <p className="mt-1 text-white/85">Search real seeded places across India, including hidden gems.</p>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-3 rounded-xl2 border border-slate-100 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search places, e.g. 'beach', 'fort', 'waterfall'..."
            className="input-field pl-9"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-48">
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c.toUpperCase()}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          value={maxCost}
          onChange={(e) => setMaxCost(e.target.value)}
          placeholder="Max cost ₹"
          className="input-field sm:w-32"
        />
        <label className="flex shrink-0 items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-4 py-2.5 text-sm font-medium text-accent-700">
          <input type="checkbox" checked={hiddenGemsOnly} onChange={(e) => setHiddenGemsOnly(e.target.checked)} className="accent-accent-600" />
          <Sparkles size={14} /> Hidden gems only
        </label>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard count={6} />
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && places?.length === 0 && (
        <EmptyState icon={SlidersHorizontal} title="No places match your filters" description="Try adjusting your search or category filters." />
      )}

      {!loading && !error && places?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
}
