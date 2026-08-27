import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, X } from 'lucide-react';
import { useState } from 'react';
import { catalogService } from '../services/catalogService';
import { useFetch } from '../hooks/useFetch';

/** Shared destination text input (with a suggestions dropdown) used across Hotels/Flights/Cabs/Experiences/Restaurants pages. */
export default function DestinationPicker({ onSearch, placeholder = 'Pick from the list or type any Indian city' }) {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('destination') || 'Goa');
  // Just suggestions — typing any other Indian city still works fine.
  const { data: destinations } = useFetch(() => catalogService.listDestinations(), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="group mb-8 flex items-center gap-2 rounded-full border border-slate-100 bg-white p-2 shadow-card transition duration-300 focus-within:border-brand-300 focus-within:shadow-cardHover hover:shadow-cardHover"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-focus-within:bg-brand-100">
        <MapPin size={18} />
      </span>
      <div className="relative flex-1">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          list="destination-picker-options"
          className="w-full border-none bg-transparent py-2 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            aria-label="Clear"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
          >
            <X size={14} />
          </button>
        )}
        <datalist id="destination-picker-options">
          {destinations?.map((d) => <option key={d.id} value={d.name} />)}
        </datalist>
      </div>
      <button
        type="submit"
        className="btn-primary !rounded-full !px-5 !py-2.5 inline-flex shrink-0 items-center gap-1.5 active:scale-95"
      >
        <Search size={15} /> <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}
