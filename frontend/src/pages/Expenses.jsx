import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Wallet, Plus, Trash2, X } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { tripService } from '../services/tripService';
import { expenseService } from '../services/expenseService';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/format';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';

export default function Expenses() {
  const { data: trips, loading: tripsLoading } = useFetch(() => tripService.list(), []);
  const [tripId, setTripId] = useState(null);
  const [participants, setParticipants] = useState(['You']);
  const [newParticipant, setNewParticipant] = useState('');
  const { register, handleSubmit, reset } = useForm();
  const { showToast } = useToast();

  const effectiveTripId = tripId || trips?.[0]?.id;
  const { data: summary, loading, refetch } = useFetch(
    () => (effectiveTripId ? expenseService.list(effectiveTripId) : Promise.resolve(null)),
    [effectiveTripId]
  );

  const addParticipant = () => {
    if (newParticipant.trim()) {
      setParticipants((p) => [...p, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const onSubmit = async (values) => {
    try {
      await expenseService.create({
        tripId: Number(effectiveTripId),
        category: values.category,
        amount: Number(values.amount),
        description: values.description,
        splitEvenly: true,
        participants,
      });
      showToast('Expense added.', 'success');
      reset();
      refetch();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseService.remove(id);
      refetch();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (tripsLoading) return <LoadingScreen />;

  if (!trips || trips.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={Wallet} title="No trips yet" description="Create a trip first, then track its shared expenses here." />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="page-hero flex items-center gap-4">
        <span className="page-hero-icon"><Wallet size={24} /></span>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Expense Management</h1>
          <p className="mt-1 text-white/85">Track group spending and split costs fairly across travellers.</p>
        </div>
      </div>

      <select value={effectiveTripId || ''} onChange={(e) => setTripId(Number(e.target.value))} className="input-field max-w-sm">
        {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select>

      {loading && <div className="skeleton mt-6 h-40 w-full" />}

      {summary && !loading && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="mb-3 font-semibold text-slate-800">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Total spent</span><span className="font-semibold text-slate-800">{formatCurrency(summary.totalSpent)}</span></div>
                {summary.budget != null && <div className="flex justify-between"><span className="text-slate-500">Budget</span><span className="font-semibold text-slate-800">{formatCurrency(summary.budget)}</span></div>}
                {summary.remainingBudget != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining</span>
                    <span className={`font-semibold ${summary.remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(summary.remainingBudget)}</span>
                  </div>
                )}
              </div>
              {Object.keys(summary.byCategory).length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                  {Object.entries(summary.byCategory).map(([cat, amount]) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{cat}</span>
                      <span className="font-medium text-slate-700">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-3 p-5">
              <h3 className="font-semibold text-slate-800">Add Expense</h3>
              <select className="input-field" {...register('category', { required: true })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" min="0" step="0.01" placeholder="Amount (₹)" className="input-field" {...register('amount', { required: true })} />
              <input placeholder="Description (optional)" className="input-field" {...register('description')} />

              <div>
                <label className="label-field">Split between</label>
                <div className="flex flex-wrap gap-1.5">
                  {participants.map((p, i) => (
                    <span key={i} className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
                      {p}
                      {p !== 'You' && (
                        <button type="button" onClick={() => setParticipants((arr) => arr.filter((_, idx) => idx !== i))}><X size={11} /></button>
                      )}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder="Add traveller name" className="input-field flex-1" />
                  <button type="button" onClick={addParticipant} className="btn-secondary !px-3"><Plus size={14} /></button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">Add Expense</button>
            </form>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-slate-800">Expenses</h3>
            {summary.expenses.length === 0 && <p className="text-sm text-slate-500">No expenses recorded yet.</p>}
            <div className="space-y-3">
              {summary.expenses.map((exp) => (
                <div key={exp.id} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{exp.description || exp.category}</p>
                      <p className="text-xs text-slate-500">{exp.category} · Paid by {exp.paidBy?.fullName || 'You'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{formatCurrency(exp.amount)}</span>
                      <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {exp.splits.map((s) => (
                      <span key={s.id} className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                        {s.participantName || 'You'}: {formatCurrency(s.shareAmount)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
