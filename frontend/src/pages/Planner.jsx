import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Sparkles, MessageSquareText, ListChecks, Crown, ArrowRight } from 'lucide-react';
import { tripService } from '../services/tripService';
import { catalogService } from '../services/catalogService';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { INTEREST_OPTIONS, TRIP_TYPES, TRAVEL_STYLES, FOOD_PREFERENCES, ACCOMMODATION_PREFERENCES } from '../utils/constants';
import AiLoadingOverlay from '../components/AiLoadingOverlay';

// Kept in sync with backend/src/controllers/aiController.js's FREE_TRIP_LIMIT.
const FREE_TRIP_LIMIT = 3;

export default function Planner() {
  const [mode, setMode] = useState('structured');
  const [interests, setInterests] = useState([]);
  const [nlText, setNlText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { showToast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Powers the destination dropdown below — these are just suggestions
  // (our own verified destinations); typing any other Indian city still
  // works fine, it's picked up live via the AI planner's fallback lookup.
  const { data: destinations } = useFetch(() => catalogService.listDestinations(), []);
  // Free-plan usage banner — Premium/Admin users never hit the cap, so no
  // need to fetch trips just to render a banner they'd never see.
  const { data: trips } = useFetch(
    () => (user && !user.isPremium && user.role !== 'ADMIN' ? tripService.list() : Promise.resolve(null)),
    [user?.id, user?.isPremium]
  );
  const tripsUsed = trips?.length ?? 0;
  const showUsageBanner = user && !user.isPremium && user.role !== 'ADMIN' && trips !== null;

  const toggleInterest = (interest) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const submitPlan = async (payload) => {
    setGenerating(true);
    setLimitReached(false);
    try {
      const result = await tripService.planTrip({ ...payload, language });
      showToast(
        result.source?.startsWith('fallback')
          ? 'Itinerary generated using our data-driven fallback planner (no Gemini API key configured).'
          : 'Your AI itinerary is ready!',
        'success'
      );
      navigate(`/trips/${result.trip.id}`);
    } catch (err) {
      showToast(err.message, 'error');
      if (err.status === 403) setLimitReached(true);
    } finally {
      setGenerating(false);
    }
  };

  const onStructuredSubmit = (values) => {
    submitPlan({
      mode: 'structured',
      destination: values.destination,
      startLocation: values.startLocation,
      startDate: values.startDate,
      endDate: values.endDate,
      travellers: Number(values.travellers) || 1,
      tripType: values.tripType,
      budget: values.budget ? Number(values.budget) : undefined,
      interests,
      travelStyle: values.travelStyle,
      foodPreference: values.foodPreference,
      accommodationPreference: values.accommodationPreference,
      activityPreference: values.activityPreference,
    });
  };

  const onNaturalSubmit = (e) => {
    e.preventDefault();
    if (nlText.trim().length < 10) {
      showToast('Tell us a bit more about your trip (destination, days, budget, interests).', 'error');
      return;
    }
    submitPlan({ mode: 'natural', naturalLanguageInput: nlText });
  };

  return (
    <div className="container-page py-10">
      {generating && <AiLoadingOverlay />}

      <div className="page-hero mx-auto max-w-3xl text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Sparkles size={22} />
        </span>
        <h1 className="font-display text-3xl font-bold">Tell us about your trip</h1>
        <p className="mt-2 text-white/85">
          We retrieve real destination data from our database and hand it to Gemini to build a structured,
          grounded itinerary — use the structured form or just describe your trip in plain language.
        </p>
      </div>

      {showUsageBanner && (
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl2 border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-amber-800">
            <Crown size={16} className="text-amber-500" />
            Free plan: {tripsUsed}/{FREE_TRIP_LIMIT} AI itineraries used.
          </p>
          <Link to="/premium" className="flex items-center gap-1 text-sm font-semibold text-amber-700 hover:underline">
            Upgrade for unlimited <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {limitReached && (
        <div className="mx-auto mt-6 flex max-w-3xl flex-col items-center gap-3 rounded-xl2 border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <Crown size={32} className="text-amber-500" />
          <p className="text-sm font-medium text-amber-900">
            You've used all {FREE_TRIP_LIMIT} free AI itineraries. Upgrade to Premium for unlimited planning.
          </p>
          <Link to="/premium" className="btn-primary !bg-gradient-to-r !from-amber-500 !to-amber-600 hover:!brightness-105">
            <Crown size={16} /> Go Premium <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <div className="mx-auto mt-8 flex max-w-3xl justify-center gap-2">
        <button
          onClick={() => setMode('structured')}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${mode === 'structured' ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-card' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <ListChecks size={16} /> Structured Planner
        </button>
        <button
          onClick={() => setMode('natural')}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${mode === 'natural' ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-card' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          <MessageSquareText size={16} /> Natural Language
        </button>
      </div>

      {mode === 'structured' ? (
        <form onSubmit={handleSubmit(onStructuredSubmit)} className="card mx-auto mt-8 max-w-3xl space-y-5 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field">Destination</label>
              <input
                className="input-field"
                list="planner-destination-options"
                placeholder="Pick from the list or type any Indian city"
                {...register('destination', { required: 'Destination is required' })}
              />
              <datalist id="planner-destination-options">
                {destinations?.map((d) => <option key={d.id} value={d.name} />)}
              </datalist>
              {errors.destination && <p className="mt-1 text-xs text-red-600">{errors.destination.message}</p>}
            </div>
            <div>
              <label className="label-field">Starting Location</label>
              <input className="input-field" placeholder="e.g. Mumbai" {...register('startLocation')} />
            </div>
            <div>
              <label className="label-field">Start Date</label>
              <input type="date" className="input-field" {...register('startDate', { required: 'Start date is required' })} />
              {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="label-field">End Date</label>
              <input type="date" className="input-field" {...register('endDate', { required: 'End date is required' })} />
              {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate.message}</p>}
            </div>
            <div>
              <label className="label-field">Number of Travellers</label>
              <input type="number" min="1" defaultValue={2} className="input-field" {...register('travellers')} />
            </div>
            <div>
              <label className="label-field">Budget (₹ total)</label>
              <input type="number" min="0" className="input-field" placeholder="e.g. 25000" {...register('budget')} />
            </div>
            <div>
              <label className="label-field">Trip Type</label>
              <select className="input-field" {...register('tripType')}>
                {TRIP_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Travel Style</label>
              <select className="input-field" {...register('travelStyle')}>
                {TRAVEL_STYLES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Food Preference</label>
              <select className="input-field" {...register('foodPreference')}>
                {FOOD_PREFERENCES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Accommodation Preference</label>
              <select className="input-field" {...register('accommodationPreference')}>
                {ACCOMMODATION_PREFERENCES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label-field">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    interests.includes(interest) ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:border-brand-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={generating} className="btn-accent w-full !py-3.5 text-base">
            <Sparkles size={18} /> Generate My Itinerary
          </button>
        </form>
      ) : (
        <form onSubmit={onNaturalSubmit} className="card mx-auto mt-8 max-w-3xl space-y-4 p-6 sm:p-8">
          <label className="label-field">Describe your trip</label>
          <textarea
            value={nlText}
            onChange={(e) => setNlText(e.target.value)}
            rows={6}
            className="input-field resize-none"
            placeholder="I want a 5-day Goa trip with 4 friends, budget ₹25,000 per person. I like beaches, adventure, local food and less crowded places."
          />
          <button type="submit" disabled={generating} className="btn-accent w-full !py-3.5 text-base">
            <Sparkles size={18} /> Generate My Itinerary
          </button>
        </form>
      )}
    </div>
  );
}
