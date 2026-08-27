import { Star, Clock, MapPin, Sparkles, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDuration } from '../utils/format';

export default function PlaceCard({ place, onAdd, onMapClick }) {
  const { t } = useTranslation();
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="relative h-40 w-full overflow-hidden">
        <img src={place.imageUrl} alt={place.name} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute left-2 top-2">
          {place.isHiddenGem ? (
            <span className="badge-hidden-gem"><Sparkles size={12} /> {t('common.hiddenGem')}</span>
          ) : (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-600">{t('common.popular')}</span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-slate-800">{place.name}</h4>
          {place.rating && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-500">
              <Star size={12} fill="currentColor" /> {Number(place.rating).toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{place.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin size={12} /> {place.destination?.name || place.address}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(place.avgDurationMinutes)}</span>
          <span className="font-semibold text-slate-700">{formatCurrency(place.estimatedCost)}</span>
        </div>
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
          {onAdd && (
            <button onClick={() => onAdd(place)} className="btn-secondary !py-1.5 !px-3 flex-1 !text-xs">
              <Plus size={13} /> {t('common.addToItinerary')}
            </button>
          )}
          {onMapClick && (
            <button onClick={() => onMapClick(place)} className="btn-ghost !py-1.5 !px-3 !text-xs">
              <MapPin size={13} /> Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
