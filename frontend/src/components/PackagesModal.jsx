/**
 * PackagesModal.jsx
 * -----------------------------------------------------------------
 * Opens from an Explore card. Lists 3 demo packages for the place,
 * lets the user open one, pick date / travellers / Standard-Premium,
 * and book it through the regular BookingModal (type EXPERIENCE).
 * -----------------------------------------------------------------
 */
import { useEffect, useMemo, useState } from 'react';
import {
  X, ArrowLeft, Clock, MapPin, Hotel, UtensilsCrossed, Check, Minus, Plus, CalendarDays, Users, Sparkles, ChevronRight, Ban,
} from 'lucide-react';
import { getPackagesForPlace, PREMIUM_UPGRADE } from '../data/packages';
import { formatCurrency } from '../utils/format';
import PlaceImage from './PlaceImage';
import BookingModal from './BookingModal';
import MockBadge from './MockBadge';

const TAG_STYLE = {
  'Most popular': 'bg-brand-600 text-white',
  'Best value': 'bg-emerald-600 text-white',
  Premium: 'bg-amber-500 text-white',
};

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function PackageListCard({ pkg, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(pkg)}
      className="card group flex w-full flex-col overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-cardHover sm:flex-row"
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-48">
        <PlaceImage name={pkg.cover} context={pkg.destination} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${TAG_STYLE[pkg.tag] || 'bg-white text-slate-700'}`}>{pkg.tag}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">{pkg.kind} · {pkg.durationLabel}</p>
        <h4 className="mt-1 font-semibold text-slate-800">{pkg.title}</h4>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Hotel size={12} /> {pkg.stay}</span>
          <span className="flex items-center gap-1"><UtensilsCrossed size={12} /> {pkg.meals}</span>
        </div>
        <p className="mt-2 line-clamp-1 text-xs text-slate-500"><MapPin size={11} className="mr-1 inline" />{pkg.spots.join(' · ')}</p>
        <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="text-lg font-bold text-slate-800">{formatCurrency(pkg.price)}</span>
            <span className="text-xs text-slate-500"> / person</span>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-brand-600 transition-all group-hover:gap-2">
            View details <ChevronRight size={15} />
          </span>
        </div>
      </div>
    </button>
  );
}

function PackageDetail({ pkg, onBack, onBook }) {
  const [date, setDate] = useState(tomorrow());
  const [travellers, setTravellers] = useState(2);
  const [tier, setTier] = useState('standard');
  const [activeImg, setActiveImg] = useState(0);

  const unit = tier === 'premium' ? Math.round(pkg.price * (1 + PREMIUM_UPGRADE)) : pkg.price;
  const total = unit * travellers;
  const gallery = pkg.spots.slice(0, 6);

  const handleBook = () => {
    onBook({
      title: pkg.title,
      items: [
        {
          itemName: `${pkg.title} (${tier === 'premium' ? 'Premium' : 'Standard'})`,
          description: `${pkg.durationLabel} · ${pkg.destination} · from ${date}`,
          quantity: travellers,
          unitPrice: unit,
          metadata: { packageId: pkg.id, destination: pkg.destination, travelDate: date, travellers, tier, kind: pkg.kind },
        },
      ],
    });
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> All packages
      </button>

      {/* Gallery */}
      <div className="overflow-hidden rounded-xl2">
        <PlaceImage name={gallery[activeImg]} context={pkg.destination} className="h-56 w-full object-cover sm:h-64" />
      </div>
      {gallery.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((spot, i) => (
            <button
              key={spot}
              onClick={() => setActiveImg(i)}
              title={spot}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === activeImg ? 'ring-brand-500' : 'ring-transparent opacity-70 hover:opacity-100'}`}
            >
              <PlaceImage name={spot} context={pkg.destination} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <p className="mt-1 text-xs text-slate-400">{gallery[activeImg]}</p>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{pkg.kind} · {pkg.durationLabel}</p>
        <h3 className="mt-1 font-display text-xl font-bold text-slate-800">{pkg.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {pkg.destination}{pkg.state && pkg.state !== pkg.destination ? `, ${pkg.state}` : ''}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><Clock size={14} className="mb-1 text-brand-600" />{pkg.durationLabel}</div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><Hotel size={14} className="mb-1 text-brand-600" />{tier === 'premium' && pkg.nights > 0 ? 'Upgraded 5★ / heritage hotel' : pkg.stay}</div>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><UtensilsCrossed size={14} className="mb-1 text-brand-600" />{pkg.meals}</div>
      </div>

      <h4 className="mt-5 font-semibold text-slate-800">Highlights</h4>
      <ul className="mt-2 space-y-1.5">
        {pkg.highlights.map((h) => (
          <li key={h} className="flex gap-2 text-sm text-slate-600"><Sparkles size={14} className="mt-0.5 shrink-0 text-accent-500" /> {h}</li>
        ))}
      </ul>

      <h4 className="mt-5 font-semibold text-slate-800">Day-wise plan</h4>
      <ol className="mt-2 space-y-3 border-l-2 border-brand-100 pl-4">
        {pkg.itinerary.map((d) => (
          <li key={d.day} className="relative">
            <span className="absolute -left-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">{d.day}</span>
            <p className="text-sm font-semibold text-slate-800">Day {d.day}: {d.title}</p>
            <p className="text-xs leading-relaxed text-slate-500">{d.details}</p>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="font-semibold text-slate-800">Included</h4>
          <ul className="mt-2 space-y-1">
            {pkg.inclusions.map((i) => <li key={i} className="flex gap-2 text-xs text-slate-600"><Check size={13} className="mt-0.5 shrink-0 text-emerald-500" /> {i}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">Not included</h4>
          <ul className="mt-2 space-y-1">
            {pkg.exclusions.map((i) => <li key={i} className="flex gap-2 text-xs text-slate-600"><Ban size={13} className="mt-0.5 shrink-0 text-red-400" /> {i}</li>)}
          </ul>
        </div>
      </div>

      {/* Booking options */}
      <div className="mt-6 rounded-xl2 border border-slate-100 bg-slate-50 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-600">
            <span className="mb-1 flex items-center gap-1"><CalendarDays size={13} /> Travel date</span>
            <input type="date" min={tomorrow()} value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
          </label>
          <div className="text-xs font-medium text-slate-600">
            <span className="mb-1 flex items-center gap-1"><Users size={13} /> Travellers</span>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-2 py-1.5">
              <button type="button" aria-label="Fewer travellers" onClick={() => setTravellers((n) => Math.max(1, n - 1))} className="rounded-lg p-1.5 hover:bg-slate-100"><Minus size={14} /></button>
              <span className="text-sm font-semibold text-slate-800">{travellers}</span>
              <button type="button" aria-label="More travellers" onClick={() => setTravellers((n) => Math.min(12, n + 1))} className="rounded-lg p-1.5 hover:bg-slate-100"><Plus size={14} /></button>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {['standard', 'premium'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${tier === t ? 'border-brand-500 bg-white ring-2 ring-brand-100' : 'border-slate-200 bg-white/60 hover:border-slate-300'}`}
            >
              <span className="block font-semibold capitalize text-slate-800">{t}</span>
              <span className="text-slate-500">
                {formatCurrency(t === 'premium' ? Math.round(pkg.price * (1 + PREMIUM_UPGRADE)) : pkg.price)} / person
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">{formatCurrency(unit)} × {travellers} traveller{travellers > 1 ? 's' : ''}</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(total)}</p>
          </div>
          <button onClick={handleBook} disabled={!date} className="btn-primary !px-6">Book this package</button>
        </div>
        <div className="mt-3"><MockBadge label="Demo package — indicative prices" /></div>
      </div>
    </div>
  );
}

export default function PackagesModal({ place, onClose }) {
  const packages = useMemo(() => getPackagesForPlace(place), [place]);
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && !booking && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, booking]);

  const destName = packages[0]?.destination || place.destination?.name;

  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-xl2 bg-white shadow-cardHover sm:rounded-xl2"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Packages for ${place.name}`}
      >
        {/* Header */}
        <div className="relative h-40 w-full overflow-hidden sm:h-48">
          <PlaceImage name={place.name} context={destName} fallback={place.imageUrl} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-slate-600 hover:bg-white"><X size={18} /></button>
          <div className="absolute bottom-3 left-5 right-5 text-white">
            <p className="text-xs opacity-90">Packages for</p>
            <h2 className="font-display text-2xl font-bold drop-shadow">{place.name}</h2>
            <p className="flex items-center gap-1 text-xs opacity-90"><MapPin size={12} /> {destName}</p>
          </div>
        </div>

        <div className="p-5">
          {!selected ? (
            <>
              <p className="mb-4 text-sm text-slate-500">Pick a package that suits you — tap any package to see the full plan and book.</p>
              <div className="space-y-4">
                {packages.map((pkg) => <PackageListCard key={pkg.id} pkg={pkg} onOpen={setSelected} />)}
              </div>
            </>
          ) : (
            <PackageDetail pkg={selected} onBack={() => setSelected(null)} onBook={setBooking} />
          )}
        </div>
      </div>

      {booking && (
        <div onClick={(e) => e.stopPropagation()}>
          <BookingModal type="EXPERIENCE" title={booking.title} items={booking.items} onClose={() => setBooking(null)} />
        </div>
      )}
    </div>
  );
}
