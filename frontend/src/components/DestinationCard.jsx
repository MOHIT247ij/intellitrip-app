import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function DestinationCard({ destination }) {
  return (
    <Link to={`/explore?destinationId=${destination.id}`} className="card group flex flex-col overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0" />
        <span className="chip absolute right-3 top-3 !bg-white/90">
          <Wallet size={11} /> {formatCurrency(destination.avgCostPerDay)}/day
        </span>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="font-display text-xl font-semibold drop-shadow">{destination.name}</h3>
          <p className="flex items-center gap-1 text-xs opacity-90"><MapPin size={12} /> {destination.state}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 flex-1 text-sm text-slate-500">{destination.description}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">
            From <span className="font-semibold text-slate-700">{formatCurrency(destination.avgCostPerDay)}</span>/day
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-brand-600 transition-all group-hover:gap-2">
            Explore <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
