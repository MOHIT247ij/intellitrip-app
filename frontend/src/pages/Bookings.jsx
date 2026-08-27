import { Link } from 'react-router-dom';
import { Hotel, Plane, Car, Ticket, PackageOpen } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { bookingService } from '../services/bookingService';
import { formatCurrency, formatDate } from '../utils/format';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import SkeletonCard from '../components/SkeletonCard';
import MockBadge from '../components/MockBadge';

const TYPE_ICON = { HOTEL: Hotel, FLIGHT: Plane, CAB: Car, EXPERIENCE: Ticket };
const STATUS_STYLE = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
  FAILED: 'bg-red-100 text-red-700',
};

export default function Bookings() {
  const { data: bookings, loading, error, refetch } = useFetch(() => bookingService.listBookings(), []);

  return (
    <div className="container-page py-10">
      <div className="page-hero flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="page-hero-icon"><PackageOpen size={24} /></span>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">My Bookings</h1>
            <p className="mt-1 text-white/85">Hotels, flights, cabs and experiences you've booked.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/hotels" className="btn-light !py-2 !px-4 !text-xs">+ Hotel</Link>
          <Link to="/flights" className="btn-light !py-2 !px-4 !text-xs">+ Flight</Link>
          <Link to="/cabs" className="btn-light !py-2 !px-4 !text-xs">+ Cab</Link>
          <Link to="/experiences" className="btn-light !py-2 !px-4 !text-xs">+ Experience</Link>
        </div>
      </div>

      {loading && <div className="space-y-3"><SkeletonCard count={3} /></div>}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && bookings?.length === 0 && (
        <EmptyState icon={PackageOpen} title="No bookings yet" description="Browse hotels, flights, cabs or experiences to make your first booking." />
      )}

      {!loading && !error && bookings?.length > 0 && (
        <div className="space-y-4">
          {bookings.map((b) => {
            const Icon = TYPE_ICON[b.type] || PackageOpen;
            return (
              <div key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={20} /></div>
                  <div>
                    <p className="font-semibold text-slate-800">{b.items?.[0]?.itemName}{b.items.length > 1 ? ` +${b.items.length - 1} more` : ''}</p>
                    <p className="text-xs text-slate-500">{b.trip?.title ? `Trip: ${b.trip.title} · ` : ''}{formatDate(b.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(b.totalAmount)}</span>
                  {b.isMock && <MockBadge />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
