import { Star, Clock, MapPin, Sparkles, Plus, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDuration } from '../utils/format';
import { startingPrice } from '../data/packages';
import PlaceImage from './PlaceImage';

export default function PlaceCard({ place, onAdd, onMapClick, onViewPackages }) {
  const { t } = useTranslation();
  const fromPrice = onViewPackages ? startingPrice(place) : null;
  const city = place.destination?.name || place.address;

  return (
    <div className="card group flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={onViewPackages ? () => onViewPackages(place) : undefined}
        className={`relative h-40 w-full overflow-hidden ${onViewPackages ? 'cursor-pointer' : 'cursor-default'}`}
        aria-label={onViewPackages ? `View packages for ${place.name}` : place.name}
      >
        <PlaceImage
          name={place.name}
          context={city}
          fallback={place.imageUrl}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2">
          {place.isHiddenGem ? (
            <span className="badge-hidden-gem"><Sparkles size={12} /> {t('common.hiddenGem')}</span>
          ) : (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-600">{t('common.popular')}</span>
          )}
        </div>
        {fromPrice && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            3 packages · from {formatCurrency(fromPrice)}
          </span>
        )}
      </button>
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
          <span className="flex items-center gap-1"><MapPin size={12} /> {city}</span>
          <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(place.avgDurationMinutes)}</span>
          <span className="font-semibold text-slate-700">{formatCurrency(place.estimatedCost)}</span>
        </div>
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
          {onViewPackages && (
            <button onClick={() => onViewPackages(place)} className="btn-primary !py-1.5 !px-3 flex-1 !text-xs">
              <Package size={13} /> View packages
            </button>
          )}
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
