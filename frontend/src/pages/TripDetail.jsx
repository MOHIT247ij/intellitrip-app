import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar, Users, Wallet, MapPin, Clock, FileDown, Sparkles, Trash2,
  Plus, IndianRupee, Hotel, Plane, Car, Ticket, UtensilsCrossed, ExternalLink, Pencil,
} from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { tripService } from '../services/tripService';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, formatDuration } from '../utils/format';
import MapView from '../components/MapView';
import WeatherWidget from '../components/WeatherWidget';
import LoadingScreen from '../components/LoadingScreen';
import ErrorState from '../components/ErrorState';
import AiLoadingOverlay from '../components/AiLoadingOverlay';
import EditTripModal from '../components/EditTripModal';

const REPLAN_SUGGESTIONS = [
  'Make it cheaper', 'Add more adventure', 'Remove shopping', 'Add hidden places',
  'Reduce walking', 'Add local food', 'Make it family friendly', 'Make it luxury', 'Adjust for rain',
];

export default function TripDetail() {
  const { id } = useParams();
  const { data: trip, loading, error, refetch } = useFetch(() => tripService.get(id), [id]);
  const [activeDay, setActiveDay] = useState(0);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [replanText, setReplanText] = useState('');
  const [replanning, setReplanning] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [editing, setEditing] = useState(false);
  const { showToast } = useToast();

  const currentDay = trip?.days?.[activeDay];

  const markers = useMemo(
    () => (currentDay?.items || []).map((item) => ({ id: item.id, name: item.name, location: item.location, latitude: item.latitude, longitude: item.longitude, category: item.category })),
    [currentDay]
  );

  // Plain links to the real Google Maps website/app — no API key needed
  // for this, it's just a normal URL that opens Google Maps directly.
  // When we have exact coordinates we link straight to that point; when we
  // don't (e.g. a "general travel knowledge" trip with no matching place in
  // our database) we fall back to a Google Maps text search by name instead
  // of hiding the link entirely.
  const googleMapsPlaceUrl = (item) => {
    if (item.latitude != null && item.longitude != null) {
      return `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
    }
    const query = [item.name, item.location, destinationName].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };
  const mapPoint = (p) => (p.latitude != null && p.longitude != null
    ? `${p.latitude},${p.longitude}`
    : [p.name, p.location, destinationName].filter(Boolean).join(', '));
  const googleMapsRouteUrl = (pts) => {
    const valid = pts.filter((p) => p.name || p.location || (p.latitude != null && p.longitude != null));
    if (valid.length < 2) return null;
    const origin = mapPoint(valid[0]);
    const destination = mapPoint(valid[valid.length - 1]);
    const waypoints = valid.slice(1, -1).map(mapPoint).join('|');
    const params = new URLSearchParams({ api: '1', origin, destination });
    if (waypoints) params.set('waypoints', waypoints);
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  };

  const handleReplan = async (instruction) => {
    if (!instruction || instruction.trim().length < 3) {
      showToast('Tell the AI what you would like to change.', 'error');
      return;
    }
    setReplanning(true);
    try {
      await tripService.replanTrip({ tripId: Number(id), instruction });
      showToast('Your itinerary has been updated!', 'success');
      setReplanText('');
      refetch();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReplanning(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const { blob, filename } = await tripService.exportPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message || 'Could not export PDF.', 'error');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this trip permanently?')) return;
    try {
      await tripService.remove(id);
      showToast('Trip deleted.', 'success');
      window.location.href = '/trips';
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <LoadingScreen />;
  if (error || !trip) return <div className="container-page py-16"><ErrorState message={error} onRetry={refetch} /></div>;

  // Prefer the real destination name (from our DB, or the AI itinerary's
  // plain-text destination field for "no DB match" trips). Falling back
  // straight to trip.title would send things like "Goa Adventure — 12
  // Days" to the weather API and booking pages instead of just "Goa".
  const destinationName = trip.destination?.name || trip.rawAiResponse?.destination || trip.title;

  return (
    <div className="container-page py-10">
      {replanning && <AiLoadingOverlay />}

      {/* Header */}
      <div className="card mb-8 overflow-hidden">
        <div className="relative h-48 w-full bg-brand-100">
          {trip.destination?.imageUrl && <img src={trip.destination.imageUrl} alt={destinationName} className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <h1 className="font-display text-2xl font-bold drop-shadow sm:text-3xl">{trip.title}</h1>
              <p className="text-sm opacity-90">{trip.aiSummary}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="btn-secondary !bg-white/90 !py-2 !px-4 !text-xs">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={handleExportPdf} disabled={exportingPdf} className="btn-secondary !bg-white/90 !py-2 !px-4 !text-xs disabled:opacity-60">
                <FileDown size={14} /> {exportingPdf ? 'Exporting…' : 'Export PDF'}
              </button>
              <button onClick={handleDelete} className="btn-secondary !bg-white/90 !py-2 !px-4 !text-xs text-red-600 !border-red-200">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          <div className="flex items-center gap-2 text-sm text-slate-600"><Calendar size={16} className="text-brand-600" /> {formatDate(trip.startDate)} – {formatDate(trip.endDate)}</div>
          <div className="flex items-center gap-2 text-sm text-slate-600"><Users size={16} className="text-brand-600" /> {trip.travellers} traveller(s)</div>
          <div className="flex items-center gap-2 text-sm text-slate-600"><Wallet size={16} className="text-brand-600" /> {formatCurrency(trip.estimatedBudget || trip.budget)}</div>
          <div className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} className="text-brand-600" /> {trip.tripType || 'Leisure'}</div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Timeline */}
        <div>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {trip.days.map((day, idx) => (
              <button
                key={day.id}
                onClick={() => { setActiveDay(idx); setActiveMarkerId(null); }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${idx === activeDay ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-card' : 'bg-white text-slate-600 border border-slate-200 hover:border-accent-300'}`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          <h2 className="mb-3 font-display text-lg font-semibold text-slate-800">{currentDay?.title || `Day ${currentDay?.dayNumber}`}</h2>

          <ol className="space-y-4 border-l-2 border-brand-100 pl-6">
            {currentDay?.items?.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
                <div
                  onClick={() => setActiveMarkerId(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveMarkerId(item.id)}
                  className={`card w-full cursor-pointer p-4 text-left transition ${activeMarkerId === item.id ? 'ring-2 ring-brand-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-600">{item.startTime}</span>
                    <span className="text-xs text-slate-400">{item.category}</span>
                  </div>
                  <h3 className="mt-1 font-semibold text-slate-800">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(item.durationMinutes)}</span>
                    <span className="flex items-center gap-1"><IndianRupee size={12} /> {formatCurrency(item.estimatedCost)}</span>
                    {(item.name || item.location) && (
                      <a
                        href={googleMapsPlaceUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        <ExternalLink size={12} /> Open in Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* Booking shortcuts */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
            <Link to={`/hotels?destination=${encodeURIComponent(destinationName)}`} className="card flex flex-col items-center gap-1.5 p-3 text-xs font-medium text-slate-600 hover:text-brand-600">
              <Hotel size={20} /> Hotels
            </Link>
            <Link to={`/restaurants?destination=${encodeURIComponent(destinationName)}`} className="card flex flex-col items-center gap-1.5 p-3 text-xs font-medium text-slate-600 hover:text-brand-600">
              <UtensilsCrossed size={20} /> Restaurants
            </Link>
            <Link to={`/flights?destination=${encodeURIComponent(destinationName)}`} className="card flex flex-col items-center gap-1.5 p-3 text-xs font-medium text-slate-600 hover:text-brand-600">
              <Plane size={20} /> Flights
            </Link>
            <Link to={`/cabs?destination=${encodeURIComponent(destinationName)}`} className="card flex flex-col items-center gap-1.5 p-3 text-xs font-medium text-slate-600 hover:text-brand-600">
              <Car size={20} /> Cabs
            </Link>
            <Link to={`/experiences?destination=${encodeURIComponent(destinationName)}`} className="card flex flex-col items-center gap-1.5 p-3 text-xs font-medium text-slate-600 hover:text-brand-600">
              <Ticket size={20} /> Experiences
            </Link>
          </div>
        </div>

        {/* Map + Weather + Replan */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Day {currentDay?.dayNumber} Route</h3>
              {googleMapsRouteUrl(markers) && (
                <a
                  href={googleMapsRouteUrl(markers)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  <ExternalLink size={12} /> Open route in Google Maps
                </a>
              )}
            </div>
            <MapView markers={markers} activeMarkerId={activeMarkerId} onMarkerClick={setActiveMarkerId} drawRoute />
          </div>

          <WeatherWidget city={destinationName} />

          <div className="card p-5">
            <h3 className="mb-1 flex items-center gap-2 font-semibold text-slate-800"><Sparkles size={16} className="text-accent-600" /> AI Re-plan</h3>
            <p className="mb-3 text-xs text-slate-500">Ask the AI to modify this itinerary — it edits the existing plan rather than starting over.</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {REPLAN_SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleReplan(s)} disabled={replanning} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-400 hover:text-brand-700">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={replanText}
                onChange={(e) => setReplanText(e.target.value)}
                placeholder="Or type your own request..."
                className="input-field flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleReplan(replanText)}
              />
              <button onClick={() => handleReplan(replanText)} disabled={replanning} className="btn-accent !px-4">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <EditTripModal trip={trip} onClose={() => setEditing(false)} onSaved={() => refetch()} />
      )}
    </div>
  );
}
