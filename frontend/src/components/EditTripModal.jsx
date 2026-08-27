/**
 * EditTripModal.jsx — lets the user update a saved trip's basic details
 * (title, dates, traveller count, budget, trip type, status) directly,
 * instead of going through the AI re-plan chat. Hits the PUT /trips/:id
 * endpoint, which already existed on the backend but had no frontend UI.
 */
import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { tripService } from '../services/tripService';
import { useToast } from '../context/ToastContext';
import { TRIP_TYPES } from '../utils/constants';

const STATUS_OPTIONS = ['DRAFT', 'PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

function toDateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export default function EditTripModal({ trip, onClose, onSaved }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: trip.title || '',
    startDate: toDateInputValue(trip.startDate),
    endDate: toDateInputValue(trip.endDate),
    travellers: trip.travellers || 1,
    budget: trip.budget || trip.estimatedBudget || '',
    tripType: trip.tripType || '',
    status: trip.status || 'DRAFT',
  });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Trip title cannot be empty.', 'error');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      showToast('End date cannot be before the start date.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await tripService.update(trip.id, {
        title: form.title.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        travellers: Number(form.travellers) || 1,
        budget: form.budget ? Number(form.budget) : undefined,
        tripType: form.tripType || undefined,
        status: form.status,
      });
      showToast('Trip updated.', 'success');
      onSaved(updated);
      onClose();
    } catch (err) {
      showToast(err.message || 'Could not update trip.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleSave} className="w-full max-w-md rounded-xl2 bg-white p-6 shadow-cardHover">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="font-display text-lg font-bold text-slate-800">Edit trip</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-field">Trip title</label>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Start date</label>
              <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label-field">End date</label>
              <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className="input-field" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Travellers</label>
              <input type="number" min="1" max="30" value={form.travellers} onChange={(e) => update('travellers', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-field">Budget (₹)</label>
              <input type="number" min="0" value={form.budget} onChange={(e) => update('budget', e.target.value)} className="input-field" placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Trip type</label>
              <select value={form.tripType} onChange={(e) => update('tripType', e.target.value)} className="input-field">
                <option value="">Not set</option>
                {TRIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input-field">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
