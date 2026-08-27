import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { useFetch } from '../hooks/useFetch';
import { INTEREST_OPTIONS, TRAVEL_STYLES, FOOD_PREFERENCES, ACCOMMODATION_PREFERENCES } from '../utils/constants';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { setLanguage } = useLanguage();
  const { showToast } = useToast();
  const { data, loading, refetch } = useFetch(() => authService.me(), []);
  const { register, handleSubmit } = useForm();
  const [activities, setActivities] = useState([]);
  const [favDestinations, setFavDestinations] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (data && !initialized) {
    setActivities(data.preference?.activities || []);
    setFavDestinations((data.preference?.favouriteDestinations || []).join(', '));
    setInitialized(true);
  }

  const toggleActivity = (a) => setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const onSubmit = async (values) => {
    try {
      const result = await authService.updateProfile({
        fullName: values.fullName,
        language: values.language,
        budgetPreference: values.budgetPreference,
        travelStyle: values.travelStyle,
        foodPreference: values.foodPreference,
        accommodationPreference: values.accommodationPreference,
        activities,
        favouriteDestinations: favDestinations.split(',').map((s) => s.trim()).filter(Boolean),
      });
      updateUser(result.user);
      setLanguage(values.language);
      showToast('Profile updated.', 'success');
      refetch();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading || !data) return <div className="container-page py-16"><div className="skeleton h-96 w-full max-w-2xl mx-auto" /></div>;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <div className="page-hero flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white shadow-inner2 backdrop-blur">
            {user?.fullName?.[0]?.toUpperCase() || <User />}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">{user?.fullName}</h1>
            <p className="text-sm text-white/85">{user?.email} · {user?.mobile}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Full Name</label>
              <input defaultValue={data.user.fullName} className="input-field" {...register('fullName')} />
            </div>
            <div>
              <label className="label-field">Preferred Language</label>
              <select defaultValue={data.user.language} className="input-field" {...register('language')}>
                {SUPPORTED_LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Budget Preference</label>
              <select defaultValue={data.user.budgetPreference || 'MID_RANGE'} className="input-field" {...register('budgetPreference')}>
                <option value="BUDGET">Budget</option>
                <option value="MID_RANGE">Mid-range</option>
                <option value="LUXURY">Luxury</option>
              </select>
            </div>
            <div>
              <label className="label-field">Travel Style</label>
              <select defaultValue={data.preference?.travelStyle || 'Balanced'} className="input-field" {...register('travelStyle')}>
                {TRAVEL_STYLES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Food Preference</label>
              <select defaultValue={data.preference?.foodPreference} className="input-field" {...register('foodPreference')}>
                {FOOD_PREFERENCES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Accommodation Preference</label>
              <select defaultValue={data.preference?.accommodationPreference} className="input-field" {...register('accommodationPreference')}>
                {ACCOMMODATION_PREFERENCES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">Favourite Destinations (comma separated)</label>
            <input value={favDestinations} onChange={(e) => setFavDestinations(e.target.value)} className="input-field" placeholder="Goa, Kerala" />
          </div>

          <div>
            <label className="label-field">Activities you enjoy (used to personalize AI planning)</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleActivity(a)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    activities.includes(a) ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:border-brand-300'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">Save Profile</button>
        </form>
      </div>
    </div>
  );
}
