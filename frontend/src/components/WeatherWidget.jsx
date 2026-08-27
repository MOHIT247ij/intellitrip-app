import { Cloud, CloudRain, Sun, CloudSun, Droplets, Wind, AlertCircle } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { catalogService } from '../services/catalogService';
import MockBadge from './MockBadge';

const ICONS = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Haze: CloudSun,
};

export default function WeatherWidget({ city }) {
  const { data: weather, loading, error } = useFetch(() => catalogService.getWeather(city), [city]);

  if (loading) return <div className="skeleton h-32 w-full rounded-xl2" />;

  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 rounded-xl2 border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertCircle size={16} />
        Weather service is temporarily unavailable. You can continue planning without live weather.
      </div>
    );
  }

  const Icon = ICONS[weather.condition] || CloudSun;
  const isRain = weather.condition === 'Rain';

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{weather.city}</p>
          <p className="text-3xl font-bold text-slate-800">{weather.temperature}°C</p>
          <p className="text-sm capitalize text-slate-500">{weather.description}</p>
        </div>
        <Icon size={44} className="text-brand-500" />
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Droplets size={13} /> {weather.humidity}%</span>
        <span className="flex items-center gap-1"><Wind size={13} /> {weather.windSpeed} m/s</span>
        {weather.isMock && <MockBadge label="Demo weather" />}
      </div>

      {weather.forecast?.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {weather.forecast.slice(0, 5).map((f, i) => (
            <div key={i} className="flex min-w-[56px] flex-col items-center rounded-lg bg-slate-50 px-2 py-2 text-xs text-slate-500">
              <span>{new Date(f.time).toLocaleDateString ? new Date(f.time).toLocaleDateString('en-IN', { weekday: 'short' }) : f.time}</span>
              <span className="mt-1 font-semibold text-slate-700">{f.temperature}°</span>
            </div>
          ))}
        </div>
      )}

      {isRain && (
        <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
          Rain expected — consider asking the AI Planner to "adjust for rain" to swap in an indoor alternative.
        </p>
      )}
    </div>
  );
}
