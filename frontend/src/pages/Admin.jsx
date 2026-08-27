import { useState } from 'react';
import { Users, PackageCheck, MapPinned, PlaneTakeoff, LayoutDashboard } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/format';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'bookings', label: 'Bookings', icon: PackageCheck },
  { key: 'places', label: 'Places', icon: MapPinned },
  { key: 'trips', label: 'Trips', icon: PlaneTakeoff },
];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const { showToast } = useToast();

  const { data: stats } = useFetch(() => adminService.stats(), []);
  const { data: users } = useFetch(() => (tab === 'users' ? adminService.users() : Promise.resolve(null)), [tab]);
  const { data: bookings, refetch: refetchBookings } = useFetch(() => (tab === 'bookings' ? adminService.bookings() : Promise.resolve(null)), [tab]);
  const { data: places } = useFetch(() => (tab === 'places' ? adminService.places() : Promise.resolve(null)), [tab]);
  const { data: trips } = useFetch(() => (tab === 'trips' ? adminService.trips() : Promise.resolve(null)), [tab]);

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateBookingStatus(id, status);
      showToast('Booking status updated.', 'success');
      refetchBookings();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex items-center gap-4">
        <span className="page-hero-icon"><LayoutDashboard size={24} /></span>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Admin Panel</h1>
          <p className="mt-1 text-white/85">Role-based access — USER / ADMIN / PARTNER. Signed in as an ADMIN account.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${tab === t.key ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-card' : 'bg-white text-slate-600 border border-slate-200 hover:border-accent-300'}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Users', value: stats.userCount },
            { label: 'Trips', value: stats.tripCount },
            { label: 'Bookings', value: stats.bookingCount },
            { label: 'Places', value: stats.placeCount },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">{s.label}</p>
              <p className="text-gradient mt-1 text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="mt-6 overflow-x-auto rounded-xl2 border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Verified</th></tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-t border-slate-50">
                  <td className="p-3 font-medium text-slate-700">{u.fullName}</td>
                  <td className="p-3 text-slate-500">{u.email}</td>
                  <td className="p-3"><span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{u.role}</span></td>
                  <td className="p-3 text-slate-500">{u.isVerified ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="mt-6 overflow-x-auto rounded-xl2 border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-3">User</th><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Update</th></tr>
            </thead>
            <tbody>
              {bookings?.map((b) => (
                <tr key={b.id} className="border-t border-slate-50">
                  <td className="p-3 text-slate-700">{b.user?.fullName}</td>
                  <td className="p-3 text-slate-500">{b.type}</td>
                  <td className="p-3 font-medium text-slate-700">{formatCurrency(b.totalAmount)}</td>
                  <td className="p-3 text-slate-500">{b.status}</td>
                  <td className="p-3">
                    <select defaultValue={b.status} onChange={(e) => handleStatusChange(b.id, e.target.value)} className="input-field !py-1 !text-xs">
                      {['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'places' && (
        <div className="mt-6 overflow-x-auto rounded-xl2 border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-3">Name</th><th className="p-3">Destination</th><th className="p-3">Category</th><th className="p-3">Hidden Gem</th></tr>
            </thead>
            <tbody>
              {places?.map((p) => (
                <tr key={p.id} className="border-t border-slate-50">
                  <td className="p-3 font-medium text-slate-700">{p.name}</td>
                  <td className="p-3 text-slate-500">{p.destination?.name}</td>
                  <td className="p-3 text-slate-500">{p.category}</td>
                  <td className="p-3">{p.isHiddenGem ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'trips' && (
        <div className="mt-6 overflow-x-auto rounded-xl2 border border-slate-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-3">Title</th><th className="p-3">User</th><th className="p-3">Status</th><th className="p-3">Dates</th></tr>
            </thead>
            <tbody>
              {trips?.map((t) => (
                <tr key={t.id} className="border-t border-slate-50">
                  <td className="p-3 font-medium text-slate-700">{t.title}</td>
                  <td className="p-3 text-slate-500">{t.user?.fullName}</td>
                  <td className="p-3 text-slate-500">{t.status}</td>
                  <td className="p-3 text-slate-500">{formatDate(t.startDate)} – {formatDate(t.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
