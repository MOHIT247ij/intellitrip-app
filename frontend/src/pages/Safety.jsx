import { useState } from 'react';
import { ShieldAlert, Phone, MapPin, LocateFixed } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { catalogService } from '../services/catalogService';
import MapView from '../components/MapView';
import ErrorState from '../components/ErrorState';

export default function Safety() {
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState(null);
  const [locationError, setLocationError] = useState('');
  const { data, loading, error, refetch } = useFetch(() => catalogService.getSafety(city), [city]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ id: 'me', name: 'Your location', latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationError('');
      },
      () => setLocationError('Location permission denied. You can still view emergency numbers below.')
    );
  };

  return (
    <div className="container-page py-10">
      <div className="page-hero flex items-center gap-4">
        <span className="page-hero-icon"><ShieldAlert size={24} /></span>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Travel Safety</h1>
          <p className="mt-1 text-white/85">Verified emergency numbers, sourced from our database — never fabricated.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex gap-2">
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter your city for local contacts (optional)" className="input-field flex-1" />
            <button onClick={refetch} className="btn-secondary">Search</button>
          </div>

          {loading && <div className="skeleton h-64 w-full" />}
          {error && <ErrorState message={error} onRetry={refetch} />}

          {data && !loading && (
            <div className="space-y-3">
              {data.contacts.map((c) => (
                <div key={c.id} className="card flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.type.replace('_', ' ')}{c.city ? ` · ${c.city}` : ' · National'}</p>
                  </div>
                  <a href={`tel:${c.phoneNumber}`} className="btn-accent !py-1.5 !px-4 !text-sm">
                    <Phone size={14} /> {c.phoneNumber}
                  </a>
                </div>
              ))}
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{data.note}</p>
            </div>
          )}
        </div>

        <div>
          <button onClick={requestLocation} className="btn-secondary mb-4 w-full">
            <LocateFixed size={16} /> Show my current location on map
          </button>
          {locationError && <p className="mb-3 text-xs text-amber-700">{locationError}</p>}
          <MapView markers={coords ? [coords] : []} height={340} />
          {!coords && (
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><MapPin size={12} /> Your location is only requested after you click above, and never stored.</p>
          )}
        </div>
      </div>
    </div>
  );
}
